(function(document, window) {

    var formEl1 = document.querySelector('#request-reset');
    var formEl2 = document.querySelector('#reset');
    var formEl = document.querySelector('form');
    var infoCont = document.getElementById('info-cont');
    var apiGateway = 'https://api-web.ringotel.net/branch/api';
    // var apiGateway = 'https://b9b9c400.ngrok.io/branch/api';
    var host = window.location.host;
    var search = window.location.search;
    var bid = host.substr(0, host.indexOf('.'));
    var ott = search ? search.substr(search.indexOf('=')+1) : null;

    formEl1.addEventListener('submit', submitForm, false);
    formEl2.addEventListener('submit', resetPassword, false);

    if(ott) {
        document.getElementById('reset').classList.add('active');
    } else {
        document.getElementById('request-reset').classList.add('active');
    }

    function submitForm(e) {
        e.preventDefault();
        var submitted = false;

        console.log('submitForm: ');

        toggleDisableState(formEl1.submit, true);

        requestReset(function(err, result) {
            toggleDisableState(formEl1.submit, false);
            console.log('request callback: ', err, result);
            if(err) return showInfo('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.', 'error');
            showInfo('Your request has been submitted. Further instructions has been sent to administrator\'s email', 'success');
            
        });
            
    }

    function requestReset(cb) {
        request(
            'POST', 
            apiGateway+'/requestResetPassword', 
            { branchId: bid }, 
            { headers: [{ name: 'Content-type', value: 'application/json' }] }, 
            cb
        );
    }

    function resetPassword(e) {
        e.preventDefault();
        var submitted = false;
        var pass = e.target.password.value;
        var confirmPass = e.target.confirmPassword.value;

        console.log('resetPassword: ');

        if(!pass) return;

        if(pass !== confirmPass) {
            console.log('Passwords do not match');
            showInfo('Passwords do not match', 'error');
            return;
        }

        toggleDisableState(formEl2.submit, true);

        request(
            'POST', 
            apiGateway+'/changePassword', 
            { access_token: ott, password: pass }, 
            { headers: [{ name: 'Content-type', value: 'application/json' }] }, 
            function(err, result) {
                if(err) {
                    if(err === 'INVALID_LOGIN_PASSWORD') {
                        showInfo('The link has been expired.', 'error');    
                    } else {
                        showInfo('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.', 'error');
                    }
                    toggleDisableState(formEl2.submit, false);
                } else {
                    showInfo('Password has been changed. You can now <a href="/public/login.html">login</a> to your account.', 'success');
                }
            }
        );
    }

    function showInfo(msg, className) {
        console.log('showInfo: ,', msg, className, infoCont);
        infoCont.className = className;
        infoCont.style.display = 'block';
        infoCont.innerHTML = msg;
    }

    function hideInfo() {
        infoCont.style.display = 'none';
        infoCont.innerHTML = '';
    }

    function toggleDisableState(el, state) {
        el.disabled = state !== undefined ? state : (el.disabled ? false : true);
    }

    /**
     * Send request to the server via XMLHttpRequest
     */
    function request(method, url, data, options, callback){
        var xhr, response, requestTimer, dataStr;

        xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if(options && options.headers) {
            options.headers.forEach(function(header) {
                xhr.setRequestHeader(header.name, header.value);
                // xhr.setRequestHeader('Authorization', 'Basic '+btoa(auth));
            });
        }

        requestTimer = setTimeout(function(){
            xhr.abort();
        }, 60000);
        
        xhr.onload = function(e) {
            
            console.log('e: ', e);

            clearTimeout(requestTimer);
                
            if(e.target.status) {
                if(e.target.status === 403) {
                    callback('INVALID_LOGIN_PASSWORD');
                } else if(e.target.status === 200) {
                    if(method === 'POST') response = JSON.parse(e.target.response);
                    callback(null, response);
                } else {
                    callback('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.');
                }

            }

        };

        xhr.onerror = function(e) {
            console.error('onerror:', e);
            callback(e);
        }

        if(data) {
            dataStr = JSON.stringify(data);
            xhr.send(dataStr);
        } else {
            xhr.send();
        }
        
    }

})(document, window);
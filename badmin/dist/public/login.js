(function(document, window) {

    window.localStorage.removeItem('ringo_tid');

    var formEl = document.querySelector('form');
    var infoCont = document.getElementById('info-cont');
    var loginInput = document.querySelector('input[name="login"]');
    var loginBtn = document.querySelector('input[type="submit"]');
    // var apiGateway = 'https://api-web.ringotel.net/branch/api';
    var apiGateway = 'https://b9b9c400.ngrok.io/branch/api';
    var host = window.location.host;
    var bid = host.substr(0, host.indexOf('.'));

    loginInput.value = bid;

    formEl.addEventListener('submit', submitForm, false);

    function submitForm(e) {
        e.preventDefault();
        var submitted = false;
        // var login = e.target.login.value;
        var pass = e.target.password.value;
        var login = bid;

        console.log('submitForm: ', login, pass);

        hideInfo();

        if(!pass) return;

        if(!login) {
            showInfo('Login is required', 'error');
            return false;
        }

        toggleDisableState(formEl.submit, true);

        authorize({ login: login, password: pass }, function(err, result) {
            console.log('request callback: ', err, result);
            if(err) {
                if(err === 'INVALID_LOGIN_PASSWORD') showInfo('Login or password is incorrect', 'error');
                else showInfo('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.', 'error');
                toggleDisableState(formEl.submit, false);
                // return;
            }
            if(result && result.token) window.localStorage.setItem('ringo_tid', result.token);

            logIn({ login: login, password: pass }, function(err, result) {
                console.log('request2 callback: ', err, result);
                if(err) {
                    if(err === 'INVALID_LOGIN_PASSWORD') showInfo('Login or password is incorrect', 'error');
                    else showInfo('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.', 'error');
                    return toggleDisableState(formEl.submit, false);
                } else {
                    window.location = '/badmin.html';
                }
            });
        });
            
    }

    function authorize(params, cb) {
        request(
            'POST', 
            apiGateway+'/authorize', 
            { login: params.login, password: params.password }, 
            { headers: [{ name: 'Content-type', value: 'application/json' }] }, 
            cb
        );
    }

    function logIn(params, cb) {
        request(
            'GET',
            '/',
            null,
            { headers: [{ name: 'Authorization', value: 'Basic '+btoa((params.login+':'+params.password)) }] },
            cb
        );
    }

    function showInfo(msg, className) {
        infoCont.className = className;
        infoCont.style.display = 'block';
        infoCont.innerText = msg
    }

    function hideInfo() {
        infoCont.style.display = 'none';
        infoCont.innerText = '';
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
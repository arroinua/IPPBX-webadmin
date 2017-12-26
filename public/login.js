(function(document, window) {

    window.localStorage.removeItem('ringo_tid');

    var formEl = document.querySelector('form');
    var errsCont = document.getElementById('errs-cont');
    var apiGateway = 'https://my.ringotel.co/branch/api';
    var host = window.location.host;

    formEl.addEventListener('submit', submitForm, false);

    function submitForm(e) {
        e.preventDefault();
        var submitted = false;
        // var login = e.target.login.value;
        var pass = e.target.password.value;
        var login = host.substr(0, host.indexOf('.'));

        console.log('submitForm: ', login, pass);

        hideErrors();

        // if(!login) {
        //     showError('Login is required');
        //     return false;
        // }

        toggleDisableState(formEl.submit);

        authorize({ login: login, password: pass }, function(err, result) {
            console.log('request callback: ', err, result);
            if(err) {
                if(err === 'INVALID_LOGIN_PASSWORD') showError('Login or password is incorrect');
                else showError('The service is under maintenance. Please, try again later.');
                return toggleDisableState(formEl.submit);
            }
            if(result.token) window.localStorage.setItem('ringo_tid', result.token);

            logIn({ login: login, password: pass }, function(err, result) {
                console.log('request2 callback: ', err, result);
                if(err) {
                    if(err === 'INVALID_LOGIN_PASSWORD') showError('Login or password is incorrect');
                    else showError('The service is under maintenance. Please, try again later.');
                    return toggleDisableState(formEl.submit);
                }
                window.location = '/badmin.html';
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

    function showError(msg) {
        errsCont.innerText = msg
    }

    function hideErrors() {
        errsCont.innerText = '';
    }

    function toggleDisableState(el) {
        el.disabled = el.disabled ? false : true;
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
                    callback('The service is under maintenance. Please, try again later.');
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
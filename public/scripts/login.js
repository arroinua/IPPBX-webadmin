(function(document, window) {

    window.localStorage.removeItem('ringo_tid');

    var formEl = document.querySelector('form');
    var infoCont = document.getElementById('info-cont');
    var loginInput = document.querySelector('input[name="login"]');
    var loginBtn = document.querySelector('input[type="submit"]');
    var apiGateway = 'https://api-web.ringotel.net/branch/api';
    // var apiGateway = 'https://a618def4.ngrok.io/branch/api/';
    var host = window.location.host;
    var prefix = host.substr(0, host.indexOf('.'));

    // loginInput.value = prefix;

    formEl.addEventListener('submit', submitForm, false);

    function submitForm(e) {
        e.preventDefault();
        var pass = e.target.password.value;
        var login = e.target.login.value;

        hideInfo();

        // if(!pass) return;

        if(!login) {
            showInfo('Login is required', 'error');
            return false;
        }

        toggleDisableState(formEl.submit, true);

        logIn({ login: login, password: pass }, function(err, result) {
            console.log('logIn callback: ', err, result);
            if(err) {
                if(err === 'INVALID_LOGIN_PASSWORD') showInfo('Login or password is incorrect', 'error');
                else showInfo('The service is under maintenance. Please, contact our support team support@ringotel.co for more details.', 'error');
                toggleDisableState(formEl.submit, false);

            } else {
                getOptions(function(err, result) {
                    if(result && result.mode !== 1) {
                        authorize({ login: login, password: pass }, function(err, result) {
                            console.log('authorize callback: ', err, result);
                            toggleDisableState(formEl.submit, false);
                            if(result && result.token) window.localStorage.setItem('ringo_tid', result.token);
                            
                            window.location = '/badmin/branch.html' + ((result && result.lastLogin) ? '' : '#guide');
                            // window.location = '/badmin/branch.html' + '#guide';
                        })
                    } else {
                        window.location = '/badmin/branch.html';
                    }
                })
            }
        });
            
    }

    function authorize(params, cb) {
        request(
            'POST', 
            apiGateway+'/authorize', 
            { prefix: prefix, login: params.login, password: params.password }, 
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

    function getOptions(cb) {
        request(
            'POST',
            '/',
            { method: 'getPbxOptions', id: 1 },
            { headers: [{ name: 'Content-type', value: 'application/json' }] },
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
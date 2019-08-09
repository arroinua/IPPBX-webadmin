window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };

 function initGlobals(global) {
    // WTF??
    global.PbxObject = {
        options: {},
        optionsOpened: false,
        systime: '',
        initInterval: {},
        websocket: {},
        websocketTry: 0,
        currentObj: {},
        protocolOpts: {},
        frases: {},
        smallScreen: false,
        Dashboard: {},
        channels: [],
        members: [],
        available: [],
        extensions: [],
        objects: undefined,
        groups: {},
        templates: {},
        partials: {},
        name: '',
        language: '',
        query: '',
        kind: '',
        oid: ''
    };
 }

init();

function init(){
    var fn = setupPage;
    initGlobals(window);

    window.clearInterval(PbxObject.initInterval);
    if (document.readyState === "complete" || document.readyState === "interactive") {
        fn();
    } else {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function factorial() {
                document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                fn();
            }, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', arguments.callee);
                    fn();
                }
            });
        }
    }
}

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/logout', true);
    xhr.onload = function (e) {
        console.log('logout: ', e);
        window.location = '/';
    };
    xhr.send();

    window.localStorage.removeItem('ringo_tid');
    setLastQuery('');
}

function createWebsocket(){

    var protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
    var websocket = new WebSocket(protocol + '//'+window.location.host+'/','json.api.smile-soft.com'); //Init Websocket handshake

    websocket.onopen = function(e){
        console.log('WebSocket opened: ', e);
        PbxObject.websocketTry = 1;
    };
    
    websocket.onmessage = function(e){
        // console.log(e);
        handleMessage(e.data);
    };
    
    websocket.onclose = onWebsocketClose;

    window.onbeforeunload = function() {
        websocket.onclose = function () {}; // disable onclose handler first
        websocket.close()
    };

    PbxObject.websocket = websocket;

}

function onWebsocketClose(e) {
    console.log('WebSocket closed', e);
    // if(e.code === 1006) return window.location = '/';
    var time = generateInterval(PbxObject.websocketTry);
    setTimeout(function(){
        PbxObject.websocketTry++;
        createWebsocket();
    }, time);
}

//Reconnection Exponential Backoff Algorithm taken from http://blog.johnryding.com/post/78544969349/how-to-reconnect-web-sockets-in-a-realtime-web-app
function generateInterval (k) {
    var maxInterval = (Math.pow(2, k) - 1) * 1000;
  
    if (maxInterval > 30*1000) {
        maxInterval = 30*1000; // If the generated interval is more than 30 seconds, truncate it down to 30 seconds.
    }
  
    // generate the interval to a random number between 0 and the maxInterval determined from above
    return Math.random() * maxInterval;
}

function loadStripeJs() {
    if(window.Stripe) return configureStripe();

    $.ajaxSetup({ cache: true });
    $.getScript('https://checkout.stripe.com/checkout.js', configureStripe);
}

function configureStripe() {
    // var stripe = StripeCheckout('pk_live_6EK33o0HpjJ1JuLUWVWgH1vT');
    
    var stripeHandler = StripeCheckout.configure({
        key: 'pk_live_6EK33o0HpjJ1JuLUWVWgH1vT',
        // key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
        image: '/badmin/images/Ringotel_emblem_new.png',
        billingAddress: true,
        email: PbxObject.profile.email,
        currency: PbxObject.profile.currency,
        name: 'Ringotel',
        zipCode: true,
        locale: 'auto',
        token: function(token) {
            console.log('stripe token: ', token);
            PbxObject.stripeToken = token;
        }
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function() {
      stripeHandler.close();
    });

    PbxObject.stripeHandler = stripeHandler;
}

function json_rpc(method, params){
    var jsonrpc;
    if(params == null){
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';
    }
    else{
        jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/", false);
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xmlhttp.send(jsonrpc);
    
    if(xmlhttp.status === 403) return window.location = '/';

    var parsedJSON = JSON.parse(xmlhttp.responseText);
    if(parsedJSON.error != undefined){
        notify_about('error' , parsedJSON.error.message);
        return;
    }

    return parsedJSON.result;
}

function json_rpc_async(method, params, handler, id){


    var xhr = {};
    var jsonrpc = {};
    var parsedJSON = {};
    var requestTimer = null;

    if(params !== null){
        if(typeof params === 'object'){
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":'+JSON.stringify(params)+', \"id\":'+1+'}';
        } else{
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';    
        }
    } else{
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';
    }
    
    xhr = new XMLHttpRequest();
    xhr.open("POST", "/", true);

    requestTimer = setTimeout(function(){
        xhr.abort();
        notify_about('info' , PbxObject.frases.TIMEOUT);
        show_content();
    }, 60*5*1000);

    xhr.onreadystatechange = function() {

        if (xhr.readyState==4){
            clearTimeout(requestTimer);
            if(xhr.status != 200) {
                console.error(method, xhr.responseText);

                if(xhr.status === 302) {
                    return window.location = xhr.getResponseHeader('Location');
                }

                if(xhr.status === 403) {
                    return logout();
                    // setLastQuery('');
                    // return window.location = '/';
                }
                if(xhr.responseText) parsedJSON = JSON.parse(xhr.responseText);

                if(handler) {
                    handler(null, parsedJSON.error);
                } else {
                    notify_about('error', (parsedJSON.error ? parsedJSON.error.message : PbxObject.frases.ERROR));
                }
                show_content();

            } else {
                if(xhr.responseText != null) {
                    if(!xhr.responseText) return handler();

                    try {
                        parsedJSON = JSON.parse(xhr.responseText);
                    } catch(err) {
                        console.log('response in not JSON');
                        if(isLoginPage(xhr.responseText)) return logout();
                    }

                    if(parsedJSON.error){
                        if(handler) handler(null, parsedJSON.error);

                        notify_about('error' , (parsedJSON.error ? parsedJSON.error.message : PbxObject.frases.ERROR));
                        show_content();

                    } else if(parsedJSON.result){
                        if(handler !== null) handler(parsedJSON.result);

                    }
                }
            }
        }
    };

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(jsonrpc);

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
        });
    }

    requestTimer = setTimeout(function(){
        xhr.abort();
    }, 60000);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4){
            clearTimeout(requestTimer);

            response = xhr.response;

            if(response) {
                try {
                    response = JSON.parse(response);
                } catch(err) {
                    console.log('response in not JSON');
                    if(isLoginPage(response)) return logout();
                }
            }

            if(xhr.status === 200) {
                if(callback) callback(null, response);

            } else if(xhr.status >= 300 && xhr.status < 400) {
                return window.location = xhr.getResponseHeader('Location');

            } else if(xhr.status === 403) {
                return logout();
            
            } else if(xhr.status >= 500) {
                if(callback) return callback('The service is under maintenance. Please, try again later.');

            } else {
                if(callback) callback(response ? response.error : null);

            }
        }
    }

    // xhr.onload = function(e) {
        
    //     clearTimeout(requestTimer);

    //     // var redirect = e.target.getAllResponseHeaders();
    //     var status = e.target.status;
    //     var response = e.target.responseText;

    //     console.log('request response: ', method, url, response, status);

    //     if(response) {
            
    //     }

    //     if(status === 200) {
    //         if(callback) callback(null, response);

    //     } else if(status === 302) {
    //         return window.location = xhr.getResponseHeader('Location');

    //     } else if(status === 403) {
    //         return logout();
        
    //     } else if(status >= 500) {
    //         if(callback) return callback('The service is under maintenance. Please, try again later.');

    //     } else {
    //         if(callback) callback(response.error);

    //     }

    // };

    if(data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        dataStr = JSON.stringify(data);
        xhr.send(dataStr);
    } else {
        xhr.send();
    }
    
}

function isLoginPage(str) {
     return str.indexOf('auth-form') !== -1;
}

function getTranslations(language, callback){
    var xhr = new XMLHttpRequest();
    var file = 'translations_'+language+'.json';
    xhr.open('GET', '/badmin/translations/'+file, true);
    xhr.onload = function (e) {
        if(e.target.status === 403) {
            logout();
        } else if(e.target.status === 200) {
            var data = JSON.parse(xhr.responseText);
            PbxObject.frases = data;
            callback(null, data);
        } else {
            callback('ERROR_OCCURED');
        }
    };
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send();
}

// function loadTranslations(result){
//     PbxObject.frases = result;
//     init();
// }

function sendData(method, params, id){

    var data = {};
    data.method = method;
    if(params) data.params = params;
    if(id) data.id = id;

    data = JSON.stringify(data);

    PbxObject.websocket.send(data);

}

function setPageHeight(){
    $('#pagecontent').css('min-height', function(){
        return $(window).height();
    });
}

function changeOnResize(isSmall){
    if(PbxObject.smallScreen !== isSmall){
        if(isSmall){
            if($('#pagecontent').hasClass('squeezed-right')){
                $('#pagecontent').removeClass('squeezed-right');
            }
            if($('#pbxmenu').hasClass('squeezed-menu')){
                $('#pbxmenu').removeClass('squeezed-menu');
            }
        }
        else{
            if(!($('#pagecontent').hasClass('squeezed-right'))){
                $('#pagecontent').addClass('squeezed-right');
            }
        }
        // $('#sidebar-toggle').toggleClass('flipped');
        PbxObject.smallScreen = isSmall;
    }
}

function handleMessage(data){
    var data = JSON.parse(data),
        method = data.method;
    
    if(data.method){ //if the message content has no "id" parameter, i.e. sent from the server without request
        var params = data.params;
        console.log('handleMessage', data.method, params);

        if(method == 'stateChanged' || method == 'objectUpdated'){
            // updateExtensionRow(params);
            // emit event
            $(document).trigger('onmessage.object.update', params);

        } else if(method == 'conferenceUpdate'){
            updateConference(data);

        }  else if(method == 'objectCreated'){
            // newObjectAdded(params);
            // emit event
            $(document).trigger('onmessage.object.add', params);
            
        } else if(method == 'objectDeleted') {
            $(document).trigger('onmessage.object.delete', params);
            
        }
    } else{
        callbackOnId(data.id, data.result);
    }
}

function callbackOnId(id, result){

    if(id == 5){
        PbxObject.Dashboard.setCurrentCalls(result);
    } else if(id == 6){
        PbxObject.Dashboard.setCurrentState(result);
    } else if(id == 7){
        setCallStatistics(result);
    }
}

function subscribeToEvents() {
    $(document).on('onmessage.object.update', updateExtensionRow);
    $(document).on('onmessage.object.update', updateMenu);
    $(document).on('onmessage.object.update', function(event, params) {
        console.log('onmessage.object.update: ', PbxObject.oid, params);
        // if object's state change and object oid === params.oid
        if(PbxObject.oid === params.oid) objectStateUpdated(params);
        updateObjectCache(params);
    });
    $(document).on('onmessage.object.add', newObjectAdded);
    $(document).on('onmessage.object.delete', onObjectDelete);
}

function getPbxOptions(callback) {
    var cache = window.sessionStorage.getItem('pbxOptions');
    if(cache) {
        callback(JSON.parse(cache));
    } else {
        json_rpc_async('getPbxOptions', null, function(result) {
            PbxObject.options = result;
            callback(result);
        });
    }
}

function getInstanceMode() {
    return PbxObject.options.mode;
}

function setupPage() {
    var language, 
        lastURL = window.sessionStorage.getItem('lastURL'),
        query = location.hash.substring(1),
        profile = {},
        search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null;

    createWebsocket();

    getSystemTime();

    getPbxOptions(function(options) {

        // PbxObject.options = options;

        language = options.lang || 'en';
        moment.locale(language);
        
        getTranslations(language, function(err, translations) {

            if(err) return notify_about('error', err);

            // PbxObject.frases = translations;

            if(getInstanceMode() !== 1) { // if cloud branch

                if(dataLayer) dataLayer.push({'event': 'is_cloud_branch'}); // fire custom tag manager event

                BillingApi.getProfile(function(err, response) {
                    if(err) {
                        console.error(err);
                    } else {
                        profile = response.result;
                        loadFSTracking(profile);
                        loadStripeJs();

                        // if(isBranchPackage("business")) {
                        //     loadSupportWidget(profile);
                        // }
                    }

                    console.log('getProfile: ', err, response);

                    // if(lastURL) {
                    //     window.sessionStorage.removeItem('lastURL');
                    //     window.location = lastURL;
                    // } else 

                    if(window.sessionStorage.query && !window.opener) {

                        window.location.hash = window.sessionStorage.query + (search ? search : "");
                    }

                    PbxObject.profile = profile;

                    // if(profile._id) {
                    //     analytics.identify(profile._id, {
                    //       name: profile.name,
                    //       email: profile.email,
                    //       company: profile.company
                    //     });
                    // }

                    init_page();

                });
            } else {
                init_page();
            }

        });

    });
}

function loadFSTracking(profile) {
    if(!window.FS) return;
    // This is an example script - don't forget to change it!
    FS.identify(profile._id, {
      displayName: profile._id,
      // email: profile.email,
      // TODO: Add your own custom user variables here, details at
      // http://help.fullstory.com/develop-js/setuservars
      reviewsWritten_int: 14,
    });
}

function init_page(){

    // set globals

    // initiate EventEmitter
    window.Events = EventEmitter();

    var maintemp = $('#main-template').html();
    var mainrend = Mustache.render(maintemp, PbxObject.frases);
    $('#pagecontainer').html(mainrend);

    switchMode(PbxObject.options);
    document.getElementsByTagName('title')[0].innerHTML = 'Ringotel | ' + PbxObject.frases.PBXADMIN;

    setPageHeight();
    subscribeToEvents();
    
    // new GetStarted().init();

    // PbxObject.groups = {};
    // PbxObject.templates = {};
    // PbxObject.language = window.localStorage.getItem('pbxLanguage');
    PbxObject.language = PbxObject.options.lang;
    PbxObject.smallScreen = isSmallScreen();

    $(window).resize(function(){
        setPageHeight();
        changeOnResize(isSmallScreen());
    });

    if(!isSmallScreen()) {
        $('#pagecontent').addClass('squeezed-right');
    }
    // else{
    //     $('#sidebar-toggle').toggleClass('flipped');
    // }
    // if($(window).width() > 767 && $(window).width() < 959) {
    //     $('#pbxmenu').addClass('squeezed-menu');
    //     $('#pagecontent').removeClass('squeezed-right');
    // }
    
    //set default loading page
    if(!location.hash.substring(1))
        location.hash = 'realtime';

    // load_pbx_options(PbxObject.options);
    
    get_object();
    set_listeners();

    $('[data-toggle="tooltip"]').tooltip({
        delay: {"show": 1000, "hide": 100}
    });

    renderHelpSidebar('#help-sidebar');

    // $('.tab-switcher', '#pbxoptions').click(function(e) {
    //     switch_options_tab($(this).attr('data-tab'));
    // });

    // var wizzard = Wizzard({frases: PbxObject.frases});
}

function renderHelpSidebar(contSelector) {
    ReactDOM.render(HelpSidebarComponent({ frases: PbxObject.frases, options: PbxObject.options }), document.querySelector(contSelector));
}

// init tour
function initTour(params) {
    console.log('initTour: ', params, PbxObject.tours[params.kind]);
    var kind = params.kind || '';
    var tourOptions = params.tourOptions || {};
    tourOptions.frases = PbxObject.frases;

    if(PbxObject.tours[kind]) 
        MyTour(kind, PbxObject.tours[kind](tourOptions)).start();
}

function set_listeners(){

    addEvent(window, 'hashchange', get_object);
    $('.sidebar-toggle', '#pagecontent').click(toggle_sidebar);
    $('#help-toggle').click(toggle_options);
    // $('.options-open', '#pagecontent').click(open_options);
    // $('.options-close', '#pbxoptions').click(close_options);
    // $('#pbxmenu li a').click(onMenuClick);
    $('#logout-btn').click(logout);
    
    // var attachFastClick = Origami.fastclick;
    // attachFastClick(document.body);
}

// function onMenuClick(e) {
//     var target = this;
//     var href = target.href;
//     if(href && href.substring(href.length-1) === "#") e.preventDefault();
//     showGroups(target);
// }

// function showGroups(targetEl, show){
//     var self = targetEl;
//     var checkElement;
//     var parent = $(self).parent();
//     var kind = $(self).attr('data-kind');
//     if(!parent.hasClass('active')){
//         if(kind) {
//             var ul = document.createElement('ul');
//             ul.id = 'ul-'+kind;

//             // if(kind != 'unit' && kind != 'icd' && kind != 'hunting' && kind != 'pickup' && kind != 'cli') {
//             //     likind = document.createElement('li');
//             //     likind.className = 'menu-name';
//             //     likind.innerHTML = PbxObject.frases.KINDS[kind];
//             //     ul.appendChild(likind);
//             // }

//             show_loading_panel(parent[0]);

//             // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
//             getObjects(kind, function(result){
//                 console.log('showGroups: ', kind, result);

//                 var li = document.createElement('li');
//                 li.className = 'add-group-object';
//                 li.setAttribute('data-oid', kind);
//                 var a = document.createElement('a');
//                 if(kind == 'application') {
//                     var inp = document.createElement('input');
//                     inp.type = "file";
//                     inp.id = "uploadapp";
//                     inp.className = "upload-custom";
//                     inp.accept = ".application";
//                     addEvent(inp, 'change', function(){
//                         upload('uploadapp');
//                     });
//                     li.appendChild(inp);
//                     a.href = '#';
//                     addEvent(a, 'click', function(e){
//                         document.getElementById('uploadapp').click();
//                         if(e) e.preventDefault;
//                     });
//                 } 
//                 // else if(kind === 'trunk') {
//                 //     a.href = '#new_trunk';
//                 // } 
//                 else{
//                     a.href = '#'+kind+'/'+kind;
//                     // a.href = '#'+kind+'?'+kind;
//                 }
//                 a.innerHTML ='<i class="fa fa-plus"></i><span>'+(isGroup(kind) ? PbxObject.frases.ADD_GROUP : PbxObject.frases.ADD)+'</span>';
//                 li.appendChild(a);
//                 ul.appendChild(li);

//                 var i, gid, name, li, a, rem, objects = result;
//                 sortByKey(objects, 'name');
//                 for(i=0; i<objects.length; i++){
//                     if(kind === 'trunk' && objects[i].type === 'system') {
//                         continue;
//                     } else {
//                         gid = objects[i].oid;
//                         name = objects[i].name;
//                         li = document.createElement('li');
//                         li.setAttribute('data-oid', gid);
//                         a = document.createElement('a');
//                         a.href = '#'+kind+'/'+gid;
//                         // a.href = '#'+kind+'?'+gid;
//                         a.innerHTML = name;
//                         li.appendChild(a);
//                         ul.appendChild(li);
//                     }
//                 }
//                 $(self).siblings().remove('ul');
//                 parent.append(ul);

//                 show_content(false);

//                 checkElement = $(self).next('ul');
//                 if(checkElement) checkElement.slideDown('normal');
//                 parent.addClass('active');
//             });
            
//         } else {
//             checkElement = $(self).next('ul');
//             if(checkElement) {
//                 checkElement.slideDown('normal');
//             }
//             parent.addClass('active');
//         }
//     } else {
//         checkElement = $(self).next('ul');
//         if(!show && checkElement) {
//             parent.removeClass('active');
//             checkElement.slideUp('normal');
//         }
//     }
//     parent.siblings('li.active').removeClass('active').children('ul:visible').slideUp('normal');
// }

// function hideGroups() {
//     $('#pbxmenu li.active').removeClass('active').children('ul:visible').slideUp('normal');
// }

function get_object(e){

    var confirmed = true;

    if(PbxObject.setupInProgress) confirmed = confirm('You have unsaved changes. Do you want cancel them?');
    if(!confirmed) return e.preventDefault();

    var query = location.hash.substring(1),
        search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null,
        kind = query.indexOf('/') != -1 ? query.substring(0, query.indexOf('/')) : query.substring(0),
        oid = query.indexOf('/') != -1 ? query.substring(query.indexOf('/')+1, (search ? query.indexOf('?') : query.length)) : null,
        lang = PbxObject.language,
        callback = null,
        fn = null;
    
    if(query === PbxObject.query) return;
    if(query){

        PbxObject.query = query;
        PbxObject.search = search;
        PbxObject.kind = kind;
        PbxObject.oid = oid;

        $('#dcontainer').addClass('faded');

        show_loading_panel();
        setLastQuery(query);
        // setActiveMenuElement(kind, oid);


        var modal = document.getElementById('el-extension');
        if(modal) modal.parentNode.removeChild(modal);

        // var groupKinds = ['equipment', 'unit', 'users', 'hunting', 'icd', 'conference', 'selector', 'channel', 'pickup'];
        var groupKinds = ['equipment', 'unit', 'conference', 'channel', 'pickup'];
        if(groupKinds.indexOf(kind) != -1){
            kind = 'bgroup';
        }

        // callback = 'load_' + kind;
        // fn = window[callback];

        if(PbxObject.templates[kind]){
            load_template(PbxObject.templates[kind], kind);
        } else {
            // $("#dcontainer").load('/badmin/views/'+kind+'.html', function(template){
            request('GET', '/badmin/views/'+kind+'.html', null, null, function(err, template) {
                PbxObject.templates[kind] = template;
                load_template(template, kind);
            });
            // $.get('/badmin/views/'+kind+'.html', function(template){
            //     PbxObject.templates[kind] = template;
            //     load_template(template, kind);
            // });
        }

        renderSidebar({
            branchOptions: PbxObject.options,
            activeKind: PbxObject.kind,
            activeItem: PbxObject.oid
        });

        // Analytics
        if(window.ga) {
            ga('set', 'page', ('/'+kind));
            ga('send', 'pageview');
        }

    }

    if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
        $('#pagecontent').toggleClass('squeezed-right');
        $('#pbxmenu').toggleClass('squeezed-right');
        $('#pbxmenu').scrollTop(0);
    }
}

function load_template(template, kind){
    var callback = 'load_' + kind;
    var fn = window[callback];
    var rendered = Mustache.render(template, PbxObject.frases);
    $("#dcontainer").html(rendered);

    if(kind === 'extensions' || kind === 'channels') {
        getExtensions(fn);
    } else if(PbxObject.oid) {
        json_rpc_async('getObject', '\"oid\":\"'+PbxObject.oid+'\"', fn);
    } else {
        fn();
    }
    // else if(kind == 'calls' || kind == 'records' || kind == 'rec_settings' || kind == 'certificates' || kind == 'statistics' || kind == 'reports'){
    //     json_rpc_async('getObject', '\"oid\":\"'+PbxObject.oid+'\"', fn);
    // }
    $('#dcontainer').scrollTop(0);
    $('.squeezed-menu > ul').children('li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function getPartial(partialName, cb){
    PbxObject.partials = PbxObject.partials || {};
    var template = PbxObject.partials[partialName];
    if(template){
        cb(template);
    } else{
        request('GET', '/badmin/partials/'+partialName+'.html', null, null, function(err, template) {
            PbxObject.partials[partialName] = template;
            cb(template);
        });
        // $.get('/badmin/partials/'+partialName+'.html', function(template){
        //     PbxObject.partials[partialName] = template;
        //     cb(template);
        // });
    }
}

function getTemplate(tempName, cb){
    PbxObject.templates = PbxObject.templates || {};
    var template = PbxObject.templates[tempName];
    if(!template){
        request('GET', '/badmin/views/'+tempName+'.html', null, null, function(err, template) {
            PbxObject.templates[tempName] = temp;
            cb(temp);
        });
        // $.get('/badmin/views/'+tempName+'.html', function(temp){
        //     PbxObject.templates[tempName] = temp;
        //     cb(temp);
        // });
    } else {
        cb(template);
    }
}

function getTempParams() {
    return PbxObject.currentObj;
}

function updateTempParams(obj) {
    console.log('updateTempParams: ', obj);
    PbxObject.currentObj = extend(PbxObject.currentObj || {}, obj);
}

function setTempParams(obj) {
    console.log('setTempParams: ', obj);
    PbxObject.currentObj = extend(PbxObject.currentObj, obj);
}

function clearTempParams() {
    PbxObject.currentObj = {};
}

function setLastQuery(query) {
    window.sessionStorage.query = query;
}

function setActiveMenuElement(kind, oid) {
    var menu = document.getElementById('pbxmenu');
    var menuItem = menu.querySelector('.nav-list li a[data-kind="'+kind+'"]');
    var item;

    console.log('setActiveMenuElement', kind, oid, menuItem);

    if(!oid) hideGroups();
    if(!menuItem) return;

    if(!menuItem.classList.contains('active') && !menu.classList.contains('squeezed-menu')) {
        showGroups(menuItem, true);
        setTimeout(function() {
           setActiveMenuItemElement(menuItem, oid);
        }, 500);
    }
    
    setActiveMenuItemElement(menuItem, oid);

}

function setActiveMenuItemElement(menu, oid) {
    var items = [].slice.call(menu.parentNode.querySelectorAll('ul li'));
    items.map(function(item) {
        if(item.hasAttribute('data-oid') && item.getAttribute('data-oid') === oid) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
        return item;
    });
    
    console.log('setActiveMenuItemElement', menu.parentNode, items, oid);
    
}

function set_page(){
    var kind = PbxObject.kind;
    // var groupKinds = ['equipment', 'unit', 'users', 'icd', 'hunting', 'conference', 'selector', 'channel', 'pickup'];
    var groupKinds = ['equipment', 'unit', 'users', 'conference', 'selector', 'channel', 'pickup'];
    if(groupKinds.indexOf(kind) != -1){
        kind = 'bgroup';
    }
    // var chk = document.getElementsByClassName('delall'),
    var container = document.getElementById('dcontainer'),
        trow = container.querySelectorAll('.transrow'),
        clirow = container.querySelectorAll('.clirow'),
        // addConnRow = container.querySelectorAll('.connRow'),
        addRoute = document.getElementById('add-route'),
        // approw = document.querySelectorAll('.approw'),
        so = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object'),
        handler = 'set_'+kind,
        fn = window[handler];

    if(trow.length){
        for(i=0;i<trow.length;i++){
            addEvent(trow[i], 'click', append_transform);
        }
    }
    if(clirow.length){
        for(i=0;i<clirow.length;i++){
            addEvent(clirow[i], 'click', add_cli_row);
        }
    }
    if(addRoute){
        // for(i=0;i<rtrow.length;i++){
            addEvent(addRoute, 'click', add_new_route);
        // }
    }
    // if(addConnRow.length){
    //     for(i=0;i<addConnRow.length;i++){
    //         addEvent(addConnRow[i], 'click', addConnectorRow);
    //     }
    // }

    if(so){
        var text = PbxObject.name ? PbxObject.frases.SAVE : PbxObject.frases.CREATE;
        so.innerHTML = '<i class="fa fa-check"></i> '+text;
        so.onclick = function(){
            fn();
        };
    }
    if(delobj){
        if(PbxObject.name){
            delobj.onclick = function(){
                delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
            };
        }
        else delobj.setAttribute('disabled', 'disabled');
    }

    // if(kind == 'hunting' || kind == 'icd' || kind == 'unit' || kind == 'routes'){
        var sortable = document.getElementsByClassName('el-sortable');
        for(var i=0;i<sortable.length;i++){
            new Sortable(sortable[i]);
        }
    // }

    add_search_handler();

    $('.selectable-cont').click(function(e){
        var targ = e.target;
        if(targ.getAttribute('data-value')) {
            move_list_item(e);
        } else{
            var cont = getClosest(targ, '.selectable-cont'),
                to, from;

            if(targ.classList.contains('assign-all')) {
                to = cont.querySelector('.members');
                from = cont.querySelector('.available');
            } else if(targ.classList.contains('unassign-all')) {
                to = cont.querySelector('.available');
                from = cont.querySelector('.members');
            } else {
                return;
            }
            // console.log(to, from);
            move_list(to, from);
        }
    });

    $('#dcontainer div.panel-header:not(.panel-static)').click(toggle_panel);
    $('#dcontainer [data-toggle="popover"]').popover({
        placement: 'top',
        trigger: 'focus'
    });
    $('#dcontainer [data-toggle="tooltip"]').tooltip({
        delay: {"show": 1000, "hide": 100}
    });

}

function setBreadcrumbs(){
    var breadcrumb = document.getElementById('main-breadcrumb');
    while (breadcrumb.firstChild) {
        breadcrumb.removeChild(breadcrumb.firstChild);
    }
    if(!PbxObject.kind) return;
    var objname = document.getElementById('objname');
    var crumbs = document.createDocumentFragment();
    var bc1, bc2;
    
    bc1 = document.createElement('li');
    bc1.innerHTML = '<a href="#'+PbxObject.kind+'/'+PbxObject.kind+'">'+PbxObject.frases.KINDS[PbxObject.kind]+'</a>';

    bc2 = document.createElement('li');
    bc2.className = 'active';

    if(objname) {
        bc2.innerHTML = objname.value;
        addEvent(objname, 'input', function(){
            bc2.innerHTML = objname.value;
        });
    }

    crumbs.appendChild(bc1);
    crumbs.appendChild(bc2);
    breadcrumb.appendChild(crumbs);
}

function getAvailablePool(cb) {
    json_rpc_async('getObject', { oid: 'user' }, function(result) {
        console.log('getAvailablePool: ', result);
        cb(result.available.sort());
    });
}

function toggle_sidebar(e){
    if(e) {
        e.preventDefault();
        $(this).toggleClass('flipped');
    }

    $('#pagecontent').toggleClass('squeezed-right');
    $('#pbxmenu').toggleClass('squeezed-right');
    if(!isSmallScreen())
        toggle_menu();
    else
        $(document.documentElement).toggleClass('noscroll');

}

function toggle_menu(){
    $('#pbxmenu').toggleClass('squeezed-menu');
}

function toggle_options(e){
    if(e) e.preventDefault();
    var menu = $('#pbxmenu');
    // $('#el-slidemenu').addClass('hide-menu');
    $('#pagecontent').toggleClass('pushed-left');
    if(!isSmallScreen()) {
        if(menu.hasClass('squeezed-right')) menu.removeClass('squeezed-right');
        else menu.addClass('squeezed-right');
    }
    $(document.documentElement).toggleClass('noscroll');
    $('#help-sidebar').toggleClass('squeezed');
    // $('#pbxoptions').addClass('pushed-left');
    // isOptionsOpened(true);
}

function close_options(e){
    if(e) e.preventDefault();
    $('#pagecontent').removeClass('pushed-left');
    $('#pbxoptions').removeClass('pushed-left');
    $('#el-slidemenu').removeClass('hide-menu');
    setTimeout(function(){
       $('#pbxoptions').removeClass('top-layer');
       $('#el-options-content').remove();
    }, 500);
    // isOptionsOpened(false);
}

// function isOptionsOpened(bool) {
//     if(bool !== undefined) PbxObject.optionsOpened = bool;
//     return PbxObject.optionsOpened ? true : false;
// }

function showModal(modalId, data, onsubmit, onopen, onclose){
    var modal = document.getElementById(modalId),
        cont = document.getElementById('pagecontainer');
        // cont = document.querySelector('#el-loaded-content');
    
    if(modal) modal.parentNode.removeChild(modal);

    getPartial(modalId, function(template) {
        data.frases = PbxObject.frases;
        modal = Mustache.render(template, data);
        cont.insertAdjacentHTML('afterbegin', modal);
        $('#'+modalId).modal(); 
        $('#'+modalId).on('shown.bs.modal', function(e) {
            if(onsubmit) setModal(this, onsubmit);
            if(onopen) onopen(this);
        });
        if(onclose) {
            $('#'+modalId).on('hide.bs.modal', function(e) {
                onclose(this);
            });
        }
    });
}

function setModal(modalObject, onsubmit){
    var submitBtn = modalObject.querySelector('[data-type="submit"]'),
        form = modalObject.querySelector('form');

    if(submitBtn) {
        addEvent(submitBtn, 'click', function(e) {
            e.target.disabled = true;
            onsubmit(form ? retrieveFormData(form) : null, modalObject);
            // $(modalObject).modal('hide');
        });
    }
        
}

function openModal(params, callback){
    var data = {},
        modal = document.getElementById(params.modalId);
    getPartial(params.tempName, function(template){
        data.frases = PbxObject.frases;
        if(params.data) data.data = params.data;

        var rendered = Mustache.render(template, data),
            cont = document.querySelector('#pagecontainer');

        if(modal) modal.parentNode.removeChild(modal);
        cont.insertAdjacentHTML('afterbegin', rendered);
        $('#'+params.modalId).modal();
        if(callback) callback();
    });
}

function toggle_panel(e){
    e.preventDefault();
    var $panel = $(this).closest('.panel'),
        // $el = $panel.find('.panel-body');
        $el = $panel.children('.panel-body');

    $el.slideToggle();
    $panel.toggleClass('minimized');
}

function toggle_presentation() {
    $('#el-slidemenu').addClass('hide-menu');
    // $('.options-open', '#pagecontent').removeClass('spinner');
    $('#pagecontent').addClass('pushed-left');
    $('#pbxoptions').addClass('pushed-left');
    // $('.tab-switcher', '#pbxoptions').click(function(e) {
    //     switch_options_tab($(this).attr('data-tab'));
    // });
}

function show_loading_panel(container){
    if(document.getElementById('el-loading')) return;
    if(typeof container === 'string') container = document.getElementById(container);
    var back = document.createElement('div');
    back.id = 'el-loading';
    back.className = 'el-loading-panel ';
    // var load = document.createElement('img');
    var load = document.createElement('div');
    // load.src = '/badmin/images/sprites_white.png';
    load.className = 'loader';
    load.innerHTML = '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>'
    back.appendChild(load);

    var cont = container || document.getElementById('pagecontainer');
    cont.appendChild(back);
}

function remove_loading_panel(){
    var loading = document.getElementById('el-loading');
    if(loading) loading.parentNode.removeChild(loading);
}

function show_content(togglecont){
    // setBreadcrumbs();
    remove_loading_panel();

    $('#dcontainer').removeClass('faded');

    if(togglecont === false) return;
}

//TODO stick to DRY principles
function switchMode(options){
    // var menu = document.getElementById('pbxmenu');
    // var lists = [].slice.call(menu.querySelectorAll('ul li'));
    var config = options.config;
    var mode = options.mode;
    var lists = [].slice.call(document.querySelectorAll('.branch-mode'));
    if(config.indexOf('channels') == -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-channels') != -1)
                item.parentNode.removeChild(item);
        });
    } 
    // else {
    //     lists.forEach(function(item){
    //         if(item.className.indexOf('mode-equipment') != -1)
    //             item.parentNode.removeChild(item);
    //     });
    // }
    if(config.indexOf('no selectors') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-selector') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no users') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-users') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no trunks') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-trunks') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no groups') !== -1) {
        lists.forEach(function(item){
            // if(item.className.indexOf('mode-groups') != -1 || item.className.indexOf('mode-equipment') != -1)
            if(item.className.indexOf('mode-groups') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(mode === 1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-single') != -1)
                item.parentNode.removeChild(item);
        });
    }
}

function switch_presentation(kind, cont, selector){
    var container = cont || document.getElementById('dcontainer');
    var selector = selector ? '.'+selector : '.pl-kind';
    var panels = [].slice.call(container.querySelectorAll(selector));
    var action;
    panels.forEach(function(item){
        if(item.classList.contains('pl-'+kind) || item.classList.contains('pl-all')) {
            item.style.display = '';
            if(item.classList.contains('pl-no-'+kind)) {
                item.style.display = 'none';    
            }
            // if(!(item.classList.contains('pl-no-'+kind))) {
                // action = 'add';
            // } else {
                // action = 'remove';
            // }
        } else {
            item.style.display = 'none';
        }
        
        // item.classList[action]('revealed');
    });
}

function switch_tab(tabid){
    var div = document.getElementById(tabid);
    var parent = div.parentNode.parentNode;
    var childs = parent.children;
    for(var i=0;i<childs.length;i++){
        if(childs[i].children[0].id != tabid) {
            childs[i].style.display = 'none';  
        }
        else childs[i].style.display = '';
    }
}

function switch_options_tab(tabid){
    var div = document.getElementById(tabid),
        parent = div.parentNode,
        childs = parent.children;
    for(var i=1;i<childs.length;i++){
        if(childs[i].id != tabid) 
            childs[i].style.display = 'none';
        else
            childs[i].style.display = '';
    }
}

function add_search_handler(){
    var inputs = [].slice.call(document.querySelectorAll('.el-search'));
    if(inputs.length){
        inputs.forEach(function(item){
            if(item.getAttribute('data-element')) {
                item.oninput = function(e){
                    filter_element(e);
                };
            }
        });
    }
}

function makeElement(data, element, itemMaker, clear){
    var fragment = document.createDocumentFragment();
    data.forEach(function(item) {
        fragment.appendChild(itemMaker(item));
    });
    if(clear) clearTable(element);
    element.appendChild(fragment);
}

function filter_element(e){
    var e = e || window.event;
    var text, val, row, prevstyle,
        input = e.target || this,
        tid = input.getAttribute('data-element'),
        el = document.getElementById(tid);
        val = input.value.toLowerCase();

    if(el.nodeName == 'TABLE') {
        defClass = 'table-row';
        el = el.querySelector('tbody');
    } else {
        defClass = 'block';
    }

    for(var i=0; i<el.children.length; i++){
        child = el.children[i];
        text = child.textContent.toLowerCase();
        child.style.display = text.indexOf(val) === -1 ? 'none' : defClass;
    }
}

function arrayToPattern(prev, next) {
    return prev+'|'+next;
}

function filterObject(array, kind, reverse) {
    var newArray = [],
        match = false,
        kinds = !kind ? [] : (Array.isArray(kind) ? kind : [kind]);
        // pattern = kind ? 
        //     (Array.isArray(kind) ? kind.reduce(arrayToPattern) : kind) :
        //     '';

    // pattern = new RegExp(pattern);
    
    if(!kinds.length) return array;

    newArray = array.filter(function(item) {
        match = kinds.indexOf(item.kind) !== -1;
        return reverse ? !match : match;

        // console.log('filterObject match: ', kind, match);

        // match = reverse ? !(item.kind.match(pattern)) : item.kind.match(pattern); 

        // if(!kind) {
        //     return true;
        // } else {
        //     return Array.isArray(kind) ? (kind.indexOf(match[0]) !== -1) : (kind === match[0]);
        // }
        // return reverse ? !(pattern.test(item.kind)) : pattern.test(item.kind);
    });

    return newArray;
}

function getObjects(kind, callback, reverse) {
    if(Array.isArray(PbxObject.objects)) {
        if(kind) callback(filterObject(PbxObject.objects, kind, reverse));
        else callback(PbxObject.objects);
    } else {
        json_rpc_async('getObjects', { kind: 'all' }, function(result) {
            sortByKey(result, 'name');
            PbxObject.objects = result;
            if(kind) callback(filterObject(PbxObject.objects, kind, reverse));
            else callback(result);
        });
    }
}

// function getAllowedObjects(type, callback) {
//     if(Array.isArray(PbxObject.objects)) {
//         callback(filterObject(PbxObject.objects, type));
//     } else {
//         json_rpc_async('getObjects', '\"kind\":\"all\"', function(result) {
//             sortByKey(result, 'name');
//             PbxObject.objects = result || [];
//             callback(filterObject(PbxObject.objects, type));
//         });
//     }
// }

function addObjects(array, params, key) {
    console.log('addObjects: ', array, params, key);
    array.push(params);
    return sortByKey(array, key);
}


function updateObjects(array, params, key) {
    console.log('updateObjects: ', array, params, key);
    array = array.map(function(item, index, array) {
        if(item[key] === params[key]) {
            return extend(array[index], params);
        } else {
            return item;
        }
    });
    return array;
}

function deleteObjects(array, params, key) {
    console.log('deleteObjects: ', array, params, key);

    array = array.filter(function(item, index, array) {
        return item[key] !== params[key];
    });
    console.log('deleteObjects arrays: ', array);
    return array;
}

function notify_about(status, message){
    var notifyUp,
        ico,
        cls,
        div = document.createElement('div'),
        close = document.createElement('i'),
        body = document.getElementsByTagName('body')[0];
    switch(status){
        case 'success':
            ico = '<span class="fa fa-check"></span>';
            cls = 'el-notifier-ok';
            break;
        case 'error':
            ico = '<span class="fa fa-close"></span>';
            cls = 'el-notifier-error';
            break;
        default:
            ico = '<span class="fa fa-warning"></span>';
            cls = 'el-notifier-info';
    }
    close.className = 'fa fa-close el-close-notify';
    div.className = 'el-notifier '+cls;
    div.innerHTML += ico+' '+message;
    div.appendChild(close);
    body.appendChild(div);
    notifyUp = setTimeout(function(){
        removeEvent(close, 'click', function(){
            body.removeChild(div);
            clearTimeout(notifyUp);
        });
        body.removeChild(div);
    }, 7000);
    addEvent(close, 'click', function(){
        body.removeChild(div);
        clearTimeout(notifyUp);
    });
}

function append_transforms(tableid, transforms) {
    transforms.forEach(function(item) {
        append_transform(null, tableid, item);
    });
}

function append_transform(e, tableid, transform){
    var table, tbody, cell, lrow, div, inp;

    if(tableid){
        table = document.getElementById(tableid);
    } else if(e && e.type == 'click') {
        var e = e || window.event,
            targ = e.target || e.srcElement;
        e.preventDefault();
        table = getClosest(targ, 'table');
    } else {
        return;
    }

    // console.log(tableid+' '+e);

    tbody = table.querySelector('tbody');
    lrow = tbody.rows.length,
    row = tbody.insertRow(lrow);

    // var tr = document.createElement('tr');
    // var td = document.createElement('td');
    cell = row.insertCell(0);
    // tr.appendChild(td);
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('input');
    inp.className = 'form-control';
    inp.setAttribute('type', 'text');
    inp.setAttribute('name', 'number');
    if(transform != null) {
        inp.setAttribute('value', transform.number);
    }
    div.appendChild(inp);
    cell.appendChild(div);

    cell = row.insertCell(1);
    cell.setAttribute('align', 'center');
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('input');
    inp.setAttribute('type', 'checkbox');
    inp.setAttribute('name', 'strip');
    if(transform != null) {
        inp.checked = transform.strip;
    }
    div.appendChild(inp);
    cell.appendChild(div);

    cell = row.insertCell(2);
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('input');
    inp.className = 'form-control';
    inp.setAttribute('type', 'text');
    inp.setAttribute('name', 'prefix');
    if(transform != null) {
        inp.setAttribute('value', transform.prefix);
    }
    div.appendChild(inp);
    cell.appendChild(div);

    cell = row.insertCell(3);
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('a');
    inp.href = '#';
    inp.className = 'remove-clr';
    inp.innerHTML = '<i class="fa fa-minus"></i>';
    // cell = document.createElement('input');
    // cell.setAttribute('type', 'checkbox');
    // cell.className = 'delall';
    addEvent(inp, 'click', remove_row);
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);

    // tbody.appendChild(tr);    
}

function clear_transforms(tables){
    var i, j, table;
    for(i=0; i<tables.length;i++){
        table = document.getElementById(tables[i]);
        for(j=table.rows.length-1;j>1;j--){
            table.deleteRow(j);
        }
    }
}

function transformsToArray(tableid) {
    var table = document.getElementById(tableid).getElementsByTagName('tbody')[0];
    var children = [].slice.call(table.children);
    var inputs, row;

    children = children

    // get input values
    .map(function(item) {
        row = {};
        [].slice.call(item.querySelectorAll('input[name]'))
        .map(function(input) {
            row[input.name] = (input.type === 'checkbox') ? input.checked : input.value;
        });

        return row;
    })
    .filter(function(item) {
        return item.number !== "";
    });

    return children;

}

function encode_transforms(tableid){
    var table = document.getElementById(tableid).getElementsByTagName('tbody')[0];
    var jprms = '';
    var i = table.children.length;
    while(i--){
        var tr = table.children[i];
        var inp = tr.getElementsByTagName('input');
        var l = inp.length;
        var number = tr.querySelector('input[name="number"]');
        if(!number.value) continue;
        jprms += '{';
        while(l--){
            if(inp[l].name == 'number'){
                jprms += '\"number\":\"'+inp[l].value+'\",';
            }
            else if(inp[l].name == 'strip'){
                jprms += '\"strip\":'+inp[l].checked+',';
            }
            else if(inp[l].name == 'prefix'){
                jprms += '\"prefix\":\"'+inp[l].value+'\",';
            }
        }
        jprms += '},';
    }
    return jprms;
}

function remove_row(e){
    e.preventDefault();
    var targ = e.currentTarget;
    var el = targ.parentNode, row;
    while(el.nodeName != 'TBODY'){
        if(el.nodeName == 'TR'){
            row = el;
        }
        el = el.parentNode;
    }
    el.removeChild(row);
}

// Updates object params in cached object
function updateObjectCache(params) {
    var objectsCache = PbxObject.objects || [];
    var obj = objectsCache.filter(function(item) {
        return item.oid === params.oid;
    })[0];

    if(obj) {
        obj.enabled = params.enabled;
        obj.name = params.name;
    }

}

function objectStateUpdated(params) {
    var enabled = document.getElementById('enabled');
    if(enabled) {
        enabled.checked = params.enabled;
    }

    console.log('objectStateUpdated: ', params);
    // if object is trunk and "up" property changed
    if(params.up !== undefined) {
        changeTrunkRegState(params.up);
    }
}

function newObjectAdded(event, data){

    var oid = data.oid,
        kind = data.kind,
        name = data.name,
        enabled = data.enabled,
        nameEl = document.getElementById('objname'),
        setobj = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object');
        // ul = document.getElementById('ul-'+data.kind);

    remove_loading_panel();
    notify_about('success', name+' '+PbxObject.frases.CREATED);

    if(data.ext) 
        addObjects(PbxObject.extensions, data, 'ext');

    if(kind === 'phone' || kind === 'user') return;

    console.log('newObjectAdded: ', nameEl, name);
    if(nameEl && name) nameEl.value = name;
    
    // if(ul){
    //     var li = document.createElement('li'),
    //         a = document.createElement('a');
    //     a.href = '#'+kind+'/'+oid;
    //     a.innerHTML = name;
    //     li.setAttribute('data-oid', oid);
    //     li.appendChild(a);
    //     ul.appendChild(li);
    // }

    if(delobj && delobj.hasAttribute('disabled')) {
        delobj.removeAttribute('disabled');
        delobj.onclick = function(){
            delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, data.ext);
        };
    }

    if(kind !== 'application'){
        PbxObject.query = kind+'/'+oid;
        window.location.href = '#'+PbxObject.query;
    }

    if(setobj) 
        setobj.innerHTML = "<i class=\"fa fa-check fa-fw\"></i> " + PbxObject.frases.SAVE;
    
    if(Array.isArray(PbxObject.objects)) {
        PbxObject.objects.push(data);
        sortByKey(PbxObject.objects, 'name');
    }

    renderSidebar({
        branchOptions: PbxObject.options,
        activeKind: PbxObject.kind,
        activeItem: PbxObject.oid
    });

}

function updateMenu(event, data) {
    getObjects(null, function(result) {
        
        PbxObject.objects = result.map(function(item) {
            if(!item.ext && item.oid === data.oid) {
                item.name = data.name;
                item.enabled = data.enabled;
                if(data.up !== undefined) item.up = data.up;
            }
            return item;
        })

        renderSidebar({
            branchOptions: PbxObject.options,
            activeKind: PbxObject.kind,
            activeItem: PbxObject.oid
        });
        
    });
    
    // var ul = document.getElementById('ul-'+data.kind);
    // var anchors = [];
    // if(ul) {
    //     anchors = anchors.slice.call(ul.querySelectorAll('li a'));
    //     anchors.forEach(function(a) {
    //         if(a.href.indexOf(data.oid) !== -1) {
    //             a.textContent = data.name;
    //         }
    //     });
    // }
}

function objectDeleted(data){
    // var ul = document.getElementById('ul-'+data.kind);
    // if(ul){
    //     var li, a, href;
    //     for(var i=0;i<ul.children.length;i++){
    //         li = ul.children[i];
    //         a = li.querySelector('a');
    //         if(a && a.href) {
    //             href = a.href;
    //             if(href && href.substring(href.indexOf('/')+1) == data.oid){
    //                 ul.removeChild(li);
    //             }
    //         } else {
    //             continue;
    //         }
    //     }
    // }

    var ulEl = data.kind ? document.getElementById('ul-'+data.kind) : document.querySelector('#pbxmenu .nav-list');
    var items = ulEl ? [].slice.call(ulEl.querySelectorAll('li ul li')) : [];
    var itemOid;

    console.log('objectDeleted: ', data.kind, ulEl, items);

    items.forEach(function(item) {
        itemOid = item.getAttribute('data-oid');
        if(itemOid && itemOid === data.oid) item.parentNode.removeChild(item);
    });

    if(Array.isArray(PbxObject.objects)) {
        PbxObject.objects = PbxObject.objects.filter(function(obj){
            return obj.oid !== data.oid;
        });
    }
}

function set_object_success(message){
    remove_loading_panel();

    notify_about('success', PbxObject.frases.SAVED);
}

function set_options_success_with_reload() {
    // var i, newpath = '', parts = window.location.pathname.split('/');
    // for (i = 0; i < parts.length; i++) {
    //     if (parts[i] === 'en' || parts[i] === 'uk' || parts[i] === 'ru') {
    //         parts[i] = PbxObject.language;
    //     }
    //     newpath += '/';
    //     newpath += parts[i];
    // }
    // var newURL = window.location.protocol + "//" + window.location.host + newpath.substring(1);
    // window.location.href = newURL;
    window.location.reload(false);
}

function delete_object(name, kind, oid, noConfirm){
    var c = noConfirm ? true : confirm(PbxObject.frases.DODELETE+' '+name+'?');
    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            objectDeleted({name: name, kind: kind, oid: oid});
            setupInProgress(false);
            window.location.hash = kind+'/'+kind;
        });

    } else{
        return false;
    }
}

function deleteExtension(params){
    var oid = params.oid,
        ext = params.ext,
        group = params.group,
        msg = PbxObject.frases.DODELETE + ' ' + params.name + ' ' +PbxObject.frases.FROM.toLowerCase() + ' ' + (group ? group : "") + '?',
        conf = confirm(msg);

    PbxObject.members = PbxObject.members || [];
    PbxObject.available = PbxObject.available || [];

    if (conf){
        json_rpc_async('deleteObject', { oid: oid }, function(){
            // remove member from array
            PbxObject.members.forEach(function(item, index, array) {
                if(item.oid === oid) {
                    array.splice(index, 1);
                }
            });

            // add extension to available
            PbxObject.available.push(ext);
            PbxObject.available.sort();
        });        
    } else {
        return;
    }
}

function delete_extension(e){
    var row = getClosest(e.target, 'tr'),
        // oid = row.getAttribute('data-oid'),
        oid = row.id,
        table = row.parentNode,
        ext = row.getAttribute('data-ext'),
        anchor = row.querySelector('a'),
        group = PbxObject.kind === 'extensions' ? row.cells[2].textContent : PbxObject.name,
        msg = PbxObject.frases.DODELETE + ' ' + ext + ' ' +PbxObject.frases.FROM.toLowerCase() + ' ' + (group ? group : "") + '?',
        c = confirm(msg);

    PbxObject.members = PbxObject.members || [];
    PbxObject.available = PbxObject.available || [];

    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            if(anchor) {
                anchor.removeAttribute('href');
                removeEvent(anchor, 'click', get_extension);
            }

            // remove member from array
            PbxObject.members.forEach(function(item, index, array) {
                if(item.oid === oid) {
                    array.splice(index, 1);
                }
            });

            // add extension to available
            PbxObject.available.push(ext);
            PbxObject.available.sort();
            // table.removeChild(row);
        });
        
        // newRow = createExtRow(ext);
        // newRow.className = 'active';
        // table.insertBefore(newRow, row);
    }
    else{
        return false;
    }
}

function onObjectDelete(event, params) {
    if(params.ext && (/extensions|equipment/.test(PbxObject.kind)) ) {
        delete_extension_row(params);
        PbxObject.extensions = deleteObjects(PbxObject.extensions, params, 'ext');
    } else {
        objectDeleted(params);
    }
}

function delete_extension_row(params){
    var table = document.getElementById('extensions') || document.getElementById('group-extensions');
    // console.log(table);
    table = table.querySelector('tbody');

    var row = document.getElementById(params.oid);
    table.removeChild(row);

    var available = document.getElementById('available-users');
    if(available) {
        available.innerHTML += '<option value="'+params.ext+'">'+params.ext+'</option>';
    }
}

function validateInput(e){
    var e = e || window.event;
    // Allow: backspace, tab, delete, escape, enter
    if ([46, 9, 8, 27, 13].indexOf(e.keyCode) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) || 
         // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40) || 
         // Allow: comma and dash 
        (e.keyCode == 188 && e.shiftKey === false) || 
        (e.keyCode == 189 && e.shiftKey === false)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function escapeValue(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getFileName(ArrayOrString){
    if(ArrayOrString !== null) {
        var name = '';
        if(Array.isArray(ArrayOrString)){
            ArrayOrString.forEach(function(file, index, array){
                name += ' '+file;
                if(index !== array.length-1) name += ',';
            });
        } else {
            name = ' '+ArrayOrString;
        }
        return name.trim();
    }
    return '';
}

function customize_upload(id, resultFilename){
    var upl = document.getElementById(id);
    if(!upl) return;
    var uplparent = upl.parentNode,
        uplbtn = document.createElement('button'),
        uplname = document.createElement('span');
        
    uplparent.className += ' nowrap';

    var filename = getFileName(resultFilename);

    upl.setAttribute('data-value', filename);

    uplname.innerHTML = filename;
    uplname.title = filename;
    uplname.className = 'upload-filename'

    uplbtn.type = 'button';
    uplbtn.className = 'btn btn-default btn-sm needsclick';
    uplbtn.innerHTML = PbxObject.frases.UPLOAD;
    uplbtn.onclick = function(){
        upl.click();
    };
    uplparent.insertBefore(uplbtn, upl);
    uplparent.insertBefore(uplname, upl);
    upl.onchange = function(){
        console.log('upl onchange: ', this.files);
        if(this.files.length){
            filename = getFileName(this.files[0].name);
            uplname.innerHTML = filename;
            uplname.title = filename;
            upl.setAttribute('data-value', filename);
        } else{
            uplname.innerHTML = ' ';
            uplname.title = '';
            upl.removeAttribute('data-value');
        }
    };
}

function parseAsCsv(str, delimiter) {
    var rows = str.split(/\r\n|\n/);
    var result = new Array(rows.length);
    var columns = rows[0].split(delimiter);
    var i = 0, j = 0;

    function splitStr(str, delimiter, numParts) {
        var result = [];
        var quote = false;
        var lastCursor = 0;
        // var parts = numParts || [];

        // if(parts.length === numParts) return parts;

        for(var i=0; i<str.length; i++) {
            if(str[i] === '"') quote = !quote;
            
            if(i === str.length-1 || (str[i] === delimiter && (!quote || (str[i-1] === '"' || str[i+1] === '"')))) {
                result.push(str.substring(lastCursor, i));
                lastCursor = i+1;
            }
        }

        if(result.length < numParts) {
            result.length = numParts;
        }

        return result;
    }

    while(j<rows.length) {
        result[j] = splitStr(rows[j], delimiter, columns);
        j++;
    }
    
    return result;
}

function readFile(file, params, callback) {
    var cb = typeof params === 'function' ? params : callback;
    var reader = new FileReader();
    // reader.readAsText(file, 'UTF-8');
    reader.readAsText(file, params.encoding || 'UTF-8');
    reader.onload = function(e) {
        cb(null, e.target.result);
    }

    reader.onerror = function(e) {
        cb(e);
    }

}

function upload(inputid, urlString){
    var upload;
    if(isElement(inputid))
        upload = inputid;
    else if(typeof inputid === 'string')
        upload = document.getElementById(inputid);
    else
        return false;

    var filelist = upload.files;
    if(filelist.length == 0){
        return false;
    }
    var file = filelist[0];
    var url = urlString ? urlString : '/'+file.name;
    var xmlhttp = new XMLHttpRequest();
    var requestTimer = setTimeout(function(){
        xmlhttp.abort();
        notify_about('info', PbxObject.frases.TIMEOUT);
    }, 30000);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4){
            clearTimeout(requestTimer);
            if(xmlhttp.status != 200) {
                notify_about('error', PbxObject.frases.ERROR);
            }
            else{
                if(inputid == 'uploadapp') {
                    notify_about('success' , file.name+' '+PbxObject.frases.UPLOADED);
                }
            }
        }
    };
    xmlhttp.open("PUT", url, true);
    // xmlhttp.setRequestHeader("X-File-Name", file.name);
    // xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send(file);
    console.log('upload', file, url);
}

function uploadFile(file, urlString){
    var upload;

    if(!file){
        return false;
    }

    // var file = files[0];
    var url = urlString ? urlString : '/'+file.name;
    var xmlhttp = new XMLHttpRequest();
    var requestTimer = setTimeout(function(){
        xmlhttp.abort();
        notify_about('info', PbxObject.frases.TIMEOUT);
    }, 30000);

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4){
            clearTimeout(requestTimer);
            if(xmlhttp.status != 200) {
                notify_about('error', PbxObject.frases.ERROR);
            }
        }
    };
    xmlhttp.open("PUT", url, true);
    xmlhttp.send(file);

}

function deleteFile(url){

    if(!url) return;
    var xmlhttp = new XMLHttpRequest();
    var requestTimer = setTimeout(function(){
        xmlhttp.abort();
        notify_about('info', PbxObject.frases.TIMEOUT);
    }, 30000);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4){
            clearTimeout(requestTimer);
            if(xmlhttp.status != 200) {
                notify_about('error', PbxObject.frases.ERROR);
            }
        }
    };
    xmlhttp.open("DELETE", url, true);
    // xmlhttp.setRequestHeader("X-File-Name", file.name);
    // xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send();
    console.log('file deleted', url);
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function get_object_link(oid){
    var result = json_rpc('getObject', '\"oid\":\"'+oid+'\"');
    location.hash = result.kind+'/'+oid;
}

function setObjectState(oid, state, callback) {
    if(!oid || state === undefined) return;
    json_rpc_async('setObjectState', {
        oid: oid,
        enabled: state
    }, function(result, err){
        if(err) notify_about('error', err.message);
        if(callback) callback(result, err);
    });
}

function setFormData(formEl, data){
    var field, name;
    for (var i = 0; i < formEl.elements.length; i++) {
        field = formEl.elements[i];
        if (!field.hasAttribute("name")) { continue; };
        name = field.name;
        
        data.forEach(function(obj){
            if(obj.hasOwnProperty('key')){
                if(obj.key === name && field.type !== 'file')
                    if(field.type === 'checkbox')
                        field.checked = obj.value;
                    else
                        field.value = obj.value;
            }
        });
    };
}

function retrieveFormData(formEl){
    var data = {}, type, field, name, value;
    for (var i = 0; i < formEl.elements.length; i++) {

        field = formEl.elements[i];
        type = field.getAttribute('data-type') || field.type;

        if (!field.hasAttribute("name")) { continue; };

        name = field.name;

        if(type === 'number') {
            value = parseFloat(field.value);
        } else if(type === 'checkbox'){
            value = field.checked;
        } else if(type === 'file' && field.files.length){
            value = field.files[0].name;
        } else if(type === 'file' && field.getAttribute('data-value')){
            value = field.getAttribute('data-value');
        } else {
            value = field.value;
        }

        if(value !== undefined && value !== null) 
            data[name] = value;
    };

    return data;
}

function isSmallScreen(){
    return $(window).width() < 768;
}

function convertBytes(value, fromUnits, toUnits){
    var coefficients = {
        'Byte': 1,
        'KB': 1000,
        'MB': 1000000,
        'GB': 1000000000
    }
    return value * coefficients[fromUnits] / coefficients[toUnits];
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function toTheTop(elementId){
    var scrollTop = $(document).scrollTop();
    var scrollTo = elementId ? $("#"+elementId).offset().top : 0;
    if(scrollTop < scrollTo) return;
    $('html body').animate({
        scrollTop: scrollTo
    }, 500);
}

function copyFromField(targ, fieldId) {
    // var e = e || window.event;
    // var button = e.currentTarget;
    var elgroup = getClosest(targ, '.input-group'),
        input = elgroup.querySelector('input'),
        field = document.getElementById(fieldId);

    input.value = field.value;
}

function revealPassword(targ) {
    // var e = e || window.event;
    // var button = e.currentTarget;
    var elgroup = getClosest(targ, '.input-group');
    var input = elgroup.querySelector('input');
    if(input.type == 'password') {
        input.type = 'text';
        targ.innerHTML = '<i class="fa fa-eye-slash" data-toggle="tooltip" title="'+PbxObject.frases.HIDE_PWD+'"></i>';
    } else {
        input.type = 'password';
        targ.innerHTML = '<i class="fa fa-eye" data-toggle="tooltip" title="'+PbxObject.frases.REVEAL_PWD+'"></i>';
    }
}

function generatePassword(targ){
    // var e = e || window.event;
    // var button = e.currentTarget;
    // console.log(e, button);

    var elgroup, input;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var pass = "";
    var length = 14;
    var i;

    for(var x=0; x<length; x++){
        i = Math.floor(Math.random() * 62);
        pass += chars.charAt(i);
    }

    if(targ) {
        elgroup = getClosest(targ, '.input-group');
        input = elgroup.querySelector('input');
        input.value = pass;
    } else {
        return pass;
    }

}

function getClosest(elem, selector) {

    var firstChar = selector.charAt(0);

    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
        if ( firstChar === '.' ) {
            if ( elem.classList.contains( selector.substr(1) ) ) {
                return elem;
            }
        } else if ( firstChar === '#' ) {
            if ( elem.id === selector.substr(1) ) {
                return elem;
            }
        } else if ( firstChar === '[' ) {
            if (elem.hasAttribute( selector.substr(1, selector.length - 2))) {
                return elem;
            }
        } else {
            if(elem.nodeName === selector.toUpperCase()){
                return elem;
            }
        }
    }

    return false;

}

function checkAll(selector, checked){
    [].forEach.call(document.querySelectorAll(selector), function(item) {
        item.checked = checked;
    });
}

function isVisible(elementId, bolean){
    var el = document.getElementById(elementId);
    var action = bolean ? 'remove' : 'add';
    el.classList[action]('hidden');
}

function switchDisabledState(e){
    var chk, checked, evt, elname, els;
    if(isElement(e))
        chk = e;
    else {
        evt = e || window.event;
        chk = evt.target;
    }
    checked = chk.checked;
    // console.log(checked);
    elname = chk.getAttribute('data-name');
    els = [].slice.call(document.querySelectorAll('input[name="'+elname+'"]'));
    els.forEach(function(item){
        item.disabled = !checked;
    });
}

function isElement(o){
  return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
}

function isGroup(kind){
    var groupKinds = ['equipment', 'unit', 'users', 'icd', 'hunting', 'cli', 'pickup'];
    if(groupKinds.indexOf(kind) != -1){
        return true;
    }
}

function isMaxNumber(num){
    return num === 2147483647;
}

function sortSelectOptions(selectElement) {
    var options = selectElement.querySelectorAll('options');
     
    options.sort(function(a,b) {
    if (a.text.toUpperCase() > b.text.toUpperCase()) return 1;
    else if (a.text.toUpperCase() < b.text.toUpperCase()) return -1;
    else return 0;
    });
     
    $(selectElement).empty().append( options );
}

function sortByKey(object, key){
    object.sort(function(a, b){
        if (a[key] < b[key])
            return -1;
        if (a[key] > b[key])
            return 1;
        return 0;
    });
    return object
}

function objFromString(obj, i){
    return obj[i];
}

function formatTimeString(time, format){
    var h, m, s, desc = {}, newtime = [];
    h = Math.floor(time / 3600);
    time = time - h * 3600;
    m = Math.floor(time / 60);
    s = Math.floor(time - m * 60);

    switch (format) {
        case 'hh:mm':
            newtime = newtime.concat([h, m]);
        case 'mm:ss':
            m = h * 60 + m;
            newtime = newtime.concat([m, s]);
            break;
        default:
            newtime = newtime.concat([h, m, s]);
    }

    return newtime.map(function(i) { if(i < 10) i = '0'+i; return i }).join(':');

}

// function formatTimeString(time, format){
//     var h, m, s, newtime;
//     h = Math.floor(time / 3600);
//     time = time - h * 3600;
//     m = Math.floor(time / 60);
//     newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
//     if(format == 'hh:mm:ss'){
//         s = time - m * 60;
//         newtime += ':' + (s < 10 ? '0'+s : s);
//     }
//     return newtime;
// }

function formatDateString(date){
    var p = (parseInt(date)) !== 'NaN' ? parseInt(date) : date;
    // if(p === 'NaN') p = date;
    var strDate = new Date(p);
    // console.log(p, strDate);
    var day = strDate.getDate() < 10 ? '0' + strDate.getDate() : strDate.getDate(),
        month = (strDate.getMonth()+1) < 10 ? '0' + (strDate.getMonth()+1) : strDate.getMonth()+1,
        hours = strDate.getHours() < 10 ? '0' + strDate.getHours() : strDate.getHours(),
        minutes = strDate.getMinutes() < 10 ? '0' + strDate.getMinutes() : strDate.getMinutes();

    return (day + '/' + month + '/' + strDate.getFullYear() + ' ' + hours + ':' + minutes);
}

function fillTable(table, dataArray, createRowFn, callback){
    if(!table || !dataArray || !createRowFn) return;
    
    if(typeof dataArray === 'object') {
        dataArray.forEach(function(item){
            table.appendChild(createRowFn(item));
        });
    } else {
        table.appendChild(createRowFn(dataArray));
    }
    
    if(callback) callback();
}

function clearTable(table){
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
}

function clearColumns(table){
    var thead = table.querySelector('thead');
    var allRows = table.rows;
    while(thead.rows[0].cells.length > 1){
        for (var i=0; i<allRows.length; i++) {
            if (allRows[i].cells.length > 1) {
                allRows[i].deleteCell(-1);
            }
        }
    }
}

function elPosition(el){
    // checking where's more space left in the viewport: above or below the element
    var vH = getViewportH(),
        ot = getOffset(el),
        spaceUp = ot.top,
        spaceDown = vH - spaceUp - el.offsetHeight;
    
    return ( spaceDown <= el.offsetHeight ? 'top' : 'bottom' );
}

// from https://github.com/ryanve/response.js/blob/master/response.js
function getViewportH() {
    var docElem = document.documentElement,
        client = docElem['clientHeight'],
        inner = window['innerHeight'];
    if( client < inner )
        return inner;
    else
        return client;
}

// http://stackoverflow.com/a/11396681/989439
function getOffset( el ) {
    return el.getBoundingClientRect();
}

function extend( a, bs ) {
    if(arguments.length <= 1) return a;
    var i, b, key;
    for(i=1; i < arguments.length; i++) {
        b = arguments[i];
        for( key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
    }
    
    return a;

}

// function extend( a, b ) {
//     for( var key in b ) {
//         if( b.hasOwnProperty( key ) ) {
//             a[key] = b[key];
//         }
//     }
//     return a;
// }

function deepExtend(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}

function addEvent(obj, evType, fn) {
  if (obj.addEventListener) obj.addEventListener(evType, fn, false);
  else if (obj.attachEvent) obj.attachEvent("on"+evType, fn);
}
function removeEvent(obj, evType, fn) {
  if (obj.removeEventListener) obj.removeEventListener(evType, fn, false);
  else if (obj.detachEvent) obj.detachEvent("on"+evType, fn);
}

function createNewButton(props){
    var button = document.createElement('button');
    if(props.type === 'popover' || props.type === 'tooltip'){
        button.setAttribute('data-toggle', props.type);
        if(props.html !== undefined) button.setAttribute('data-html', props.html);
        if(props.placement) button.setAttribute('data-placement', props.placement);
        if(props.dataContent) button.setAttribute('data-content', props.dataContent);
        if(props.dataTrigger) button.setAttribute('data-trigger', props.dataTrigger);
    }
    button.className = props.classname || '';
    button.innerHTML = props.content || '';
    
    if(props.title) button.title = props.title;
    if(props.handler) addEvent(button, (props.evtType || 'click'), props.handler);

    return button;
}

function setAccordion(container){
    var cont = container ? container : '';
    $(cont+' .acc-cont > .acc-pane').slideToggle();
    $(cont+" .acc-cont > .acc-header").click(function () {
        // $(this).next(".acc-pane").slideToggle().siblings(".acc-pane:visible").slideUp();
        $(this).next(".acc-pane").slideToggle();
        $(this).toggleClass("current");
        $(this).siblings(".acc-header").removeClass("current");
    });
}

function createCodecRow(data){
    var row, cell;
    row = document.createElement('tr');
    cell = row.insertCell(0);
    cell.className = 'draggable';
    cell.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
    cell = row.insertCell(1);
    cell.className = 'codec-name';
    cell.innerHTML = data.codec;
    cell = row.insertCell(2);
    cell.innerHTML = '<input type="text" class="form-control codec-frames" value="'+(data.frame ? data.frame : 30)+'">';
    cell = row.insertCell(3);
    cell.innerHTML = '<input type="checkbox" '+(data.enabled ? 'checked' : '')+' class="codec-enabled">';

    return row;
}

function buildCodecsTable(elementOrId, data, available){
    var unavailable = [],
        fragment = document.createDocumentFragment(),
        el = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
    
    unavailable = unavailable.concat(available);

    data.forEach(function(item){
        item.enabled = true;
        fragment.appendChild(createCodecRow(item));
        if(unavailable.indexOf(item.codec) != -1)
            unavailable.splice(unavailable.indexOf(item.codec), 1);
    });

    unavailable.forEach(function(codec){
        fragment.appendChild(createCodecRow({codec: codec}));
    });
    el.appendChild(fragment);
}

function getCodecsString(elementOrId){
    var codec,
        codecs = [],
        el = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);

    for(var i=0, row; row = el.rows[i]; i++){
        if(row.getElementsByClassName('codec-enabled')[0].checked){
            codec = {
                codec: row.getElementsByClassName('codec-name')[0].textContent,
                frame: parseInt(row.getElementsByClassName('codec-frames')[0].value)
            };
            codecs.push(codec);
        }
    }

    return codecs;
}

function getFriendlyCodeName(code){
    return PbxObject.frases.CODES[code.toString()] || code;
}

function fill_select_items(selectId, items){
    var el = document.getElementById(selectId), opt;
    items.forEach(function(item){
        opt = document.createElement('option');
        opt.value = item.oid;
        opt.textContent = item.name;
        el.appendChild(opt);
    });
}

function fill_list_items(listid, items, prop){
    if(listid == 'available' || (PbxObject.kind != 'hunting' && PbxObject.kind != 'icd' && PbxObject.kind != 'unit')) {
        items.sort();
    }
    var list = document.getElementById(listid),
        fragment = document.createDocumentFragment();
    for(var i=0; i<items.length; i++){
        var item = (prop && items[i][prop]) ? items[i][prop] : items[i];
        var li = document.createElement('li');
        // addEvent(item, 'click', move_list_item);
        li.setAttribute('data-value', item);
        li.innerHTML = item;
        fragment.appendChild(li);
    }
    list.appendChild(fragment);
}

// function move_list_item(e){
//     var li = e.target;
//     var parent = li.parentNode;
//     if(parent.id == 'available'){
//         parent.removeChild(li);
//         document.getElementById('members').appendChild(li);
//     }
//     else{
//         parent.removeChild(li);
//         document.getElementById('available').appendChild(li);
//     }
// }

function move_list_item(e){
    var li = e.target;
    var cont = getClosest(li, '.selectable-cont');
    var parent = li.parentNode;
    if(parent.classList.contains('available')){
        parent.removeChild(li);
        cont.querySelector('.members').appendChild(li);
    }
    else{
        parent.removeChild(li);
        cont.querySelector('.available').appendChild(li);
    }
}

function move_list(to, from){
    var to = isElement(to) ? to : document.getElementById(to),
        from = isElement(from) ? from : document.getElementById(from),
        fromList = [].slice.call(from.querySelectorAll('li'));

    fromList.forEach(function(item){
        to.appendChild(item);
    });
}

function changeGroupType(grouptype){
    // console.log(grouptype);
    var elements = [].slice.call(document.querySelectorAll('.object-type'));
    elements.forEach(function(el){
        if(el.classList.contains(grouptype)) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function newInput(data){
    var div = document.createElement('div');
        div.className = 'form-group';
    if(data.label) {
        var label = '<label for="'+data.id+'">'+data.label+'</label>';
        div.innerHTML += label;
    }
    var input = '<input type="'+(data.type || 'text')+'" class="form-control" id="'+(data.id || '')+'" value="'+(data.value || '')+'">';
    div.innerHTML += input;
    return div;
}

function switchVisibility(selector, isVisible){
    if(isVisible) $(selector).show();
    else $(selector).hide();
}

function get_protocol_opts(protocol, params, type){
    
    var proto = protocol == 'h323' ? 'h323' : 'sip';
    // var options = params.parameters;
    var options = params;
    var opts = Object.keys(PbxObject.protocolOpts).length !== 0 ? PbxObject.protocolOpts : options;
    var sipModes = [
        {mode: 'sip info', sel: 'sip info' === opts.dtmfmode},
        {mode: 'rfc2833', sel: 'rfc2833' === opts.dtmfmode},
        {mode: 'inband', sel: 'inband' === opts.dtmfmode}
    ];
    var h323Modes = [
        {mode: 'h245alpha', sel: 'h245alpha' === opts.dtmfmode},
        {mode: 'h245signal', sel: 'h245signal' === opts.dtmfmode},
        {mode: 'rfc2833', sel: 'rfc2833' === opts.dtmfmode},
        {mode: 'inband', sel: 'inband' === opts.dtmfmode}
    ];
    var data = {
        opts: opts,
        internal: (type === 'internal'),
        frases: PbxObject.frases
    };
    data.opts.dtmfmodes = proto == 'h323' ? h323Modes : sipModes;

    var rendered = Mustache.render(PbxObject.templates.protocol, data);
    var cont = document.getElementById('proto-cont');
    if(!cont) {
        cont = document.createElement('div');
        cont.id = 'proto-cont';
        $('#pagecontainer').prepend(cont);
        // document.getElementById('dcontainer').appendChild(cont);
    }
    $(cont).html(rendered);

    var codecs = ["Opus", "G.711 Alaw", "G.711 Ulaw", "G.729", "G.723"];
    var codecsTable = document.getElementById('protocol-codecs').querySelector('tbody');
    buildCodecsTable(codecsTable, data.opts.codecs, codecs);
    new Sortable(codecsTable);

    switch_presentation(proto, cont);
    $('#el-protocol').modal();
    $('#el-set-protocol').click(function(){
        save_proto_opts(proto);
    });
}

function save_proto_opts(proto){
    var opts = PbxObject.protocolOpts;
    var codecsTable = document.getElementById('protocol-codecs').querySelector('tbody');
    opts.codecs = getCodecsString(codecsTable);

    if(document.getElementById('t1'))
        opts.t1 = parseInt(document.getElementById('t1').value);
    if(document.getElementById('t2'))
        opts.t2 = parseInt(document.getElementById('t2').value);
    if(document.getElementById('t3'))
        opts.t3 = parseInt(document.getElementById('t3').value);
    if(document.getElementById('t38fax'))
        opts.t38fax = document.getElementById('t38fax').checked;
    if(document.getElementById('pvideo'))
        opts.video = document.getElementById('pvideo').checked;
    if(document.getElementById('earlymedia'))
        opts.earlymedia = document.getElementById('earlymedia').checked;
    if(document.getElementById('dtmfrelay'))
        opts.dtmfrelay = document.getElementById('dtmfrelay').checked;
        opts.dtmfmode = document.getElementById('dtmfmode').value;
    if(proto == 'h323'){
        opts.faststart = document.getElementById('faststart').checked;
        opts.h245tunneling = document.getElementById('h245tunneling').checked;
        opts.playringback = document.getElementById('playringback').checked;
    }
    else{
        opts.nosymnat = document.getElementById('nosymnat').checked;
        opts.buffering = document.getElementById('buffering').checked;
        opts.noprogress = document.getElementById('noprogress').checked;
        opts.noredirectinfo = document.getElementById('noredirectinfo').checked;
        opts.passanumber = document.getElementById('passanumber').checked;
    }
    
    $('#el-protocol').modal('hide');
}

function updateConference(data){
    // console.log(data);
    var pr = data.params;
    var row = document.getElementById(pr.oid);
    if(row){
        var parties = row.querySelector('[data-cell="parties"]');
        if(parties){
            var btn = row.querySelector('.showPartiesBtn');
            if(pr.total){
                parties.textContent = pr.total;
                btn.removeAttribute('disabled');
            } else{
                parties.textContent = '';
                btn.setAttribute('disabled', 'disabled');
            }
        }
    }

    var channels = PbxObject.channels;
    if(!channels) return;
    channels.forEach(function(channel){
        if(channel.oid === pr.oid){
            var arr = channel.parties;
            if(pr.state == 1) {
                if(!arr) channel.parties = arr = [];
                if(arr.indexOf(pr.number) == -1)
                    arr.push(pr.number);
            } else if(pr.state == 0){
                arr.splice(arr.indexOf(pr.number), 1);
            }
        }
    });
}

function getInfoFromState(state, group){
    var status, className;

    if(state == 1) { // Idle
        // className = 'success';
        className = 'info';
    } else if(state == 8) { // Connected
        // className = 'connected';
        className = 'danger';
    } else if(state == 2 || state == 5) { // Away
        className = 'warning';
    } else if(state == 0 || (state == -1 && group)) { // Offline
        // state = '';
        className = 'default';
    } else if(state == 3) { // DND
        className = 'danger';
    } else if(state == 6 || state == 7) { // Calling
        className = 'danger';        
    } else { // 
        className = 'active';
    }

    // if(state == 1) {
    //     className = 'success';
    // } else if(state == 8) {
    //     className = 'connected';
    // } else if(state == 2 || state == 5) {
    //     className = 'warning';
    // } else if(state == 0 || (state == -1 && group)) {
    //     // state = '';
    //     className = 'default';
    // } else if(state == 3) {
    //     className = 'danger';
    // } else if(state == 6 || state == 7) {
    //     className = 'info';        
    // } else {
    //     className = 'active';
    // }
    status = PbxObject.frases.STATES[state] || '';

    return {
        rstatus: status,
        rclass: 'bg-'+className,
        className: className
    }

}

function getQueryParams(str){
    return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}

function getSystemTime(){
    json_rpc_async('getSystemTime', null, function (result){
        PbxObject.systime = result;
    });
}

function fill_group_choice(kind, groupid, select){
    // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
    var select = select || document.getElementById("extgroup");
    // for(var i=0;i<=select.options.length;i++){
    //     select.remove(select.selectedIndex[i]);
    // }
    if(!select) return;
    while(select.firstChild) {
        select.removeChild(select.firstChild);
    }
    getObjects(kind, function(result){
        var gid, name, option, i;
        
        if(!result.length) {
            option = document.createElement('option');
            option.value = '';
            option.innerHTML = groupid;
            option.disabled = 'disabled';
            select.appendChild(option);
            return;
        }

        for(i=0; i<result.length; i++){
            gid = result[i].oid;
            name = result[i].name;
            option = document.createElement('option');
            option.setAttribute('value', gid);
            if(gid == groupid || name == groupid) {
                option.selected = "true";
            }
            option.innerHTML = result[i].name;
            select.appendChild(option);
        }
    });
}

function change_protocol(){
    var value = this.value || document.getElementById('protocols').value;
    // console.log(value);
    if(value == 'h323') {
        document.getElementById('sip').parentNode.style.display = 'none';
        document.getElementById('h323').parentNode.style.display = '';
    } else{
        document.getElementById('sip').parentNode.style.display = '';
        document.getElementById('h323').parentNode.style.display = 'none';
    }
};

function loadSupportWidget(profile) {
    return true;
}

function setupInProgress(bool) {
    return false;
    // PbxObject.setupInProgress = bool !== undefined ? bool : true;
}

function isBranchPackage(str) {
    return PbxObject.options.package === str;
}
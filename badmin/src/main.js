window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };

var PbxObject = PbxObject || {};

function init(){
    window.clearInterval(PbxObject.initInterval);
    if (document.readyState === "complete" || document.readyState === "interactive") {
        init_page();
    } else {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function factorial() {
                document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                init_page();
            }, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', arguments.callee);
                    init_page();
                }
            });
        }
    }
}

function createWebsocket(){

    var protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
    PbxObject.websocket = new WebSocket(protocol + '//'+window.location.host+'/','json.api.smile-soft.com'); //Init Websocket handshake
    PbxObject.websocket.onopen = function(e){
        console.log('WebSocket opened');
        PbxObject.websocketTry = 1;
    };
    PbxObject.websocket.onmessage = function(e){
        // console.log(e);
        handleMessage(e.data);
    };
    PbxObject.websocket.onclose = function(){
        console.log('WebSocket closed');
        var time = generateInterval(PbxObject.websocketTry);
        setTimeout(function(){
            PbxObject.websocketTry++;
            createWebsocket();
        }, time);
    };

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
    var parsedJSON = JSON.parse(xmlhttp.responseText);
    if(parsedJSON.error != undefined){
        notify_about('error' , parsedJSON.error.message);
        return;
    }
    return parsedJSON.result;
}

function json_rpc_async(method, params, handler, id){
    var jsonrpc;

    if(params !== null){
        if(typeof params === 'object'){
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":'+JSON.stringify(params)+', \"id\":'+1+'}';
        } else{
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';    
        }
    } else{
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/", true);

    var requestTimer = setTimeout(function(){
        xhr.abort();
        notify_about('info' , PbxObject.frases.TIMEOUT);
        show_content();
    }, 60*1000);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4){
            clearTimeout(requestTimer);
            if(xhr.status != 200) {
                console.error(method, xhr.statusText);
                // alert(xhr.status);
                notify_about('error', PbxObject.frases.ERROR);
                show_content();
            } else {
                if(xhr.responseText != null) {
                    if(!xhr.responseText) return;
                    var parsedJSON = JSON.parse(xhr.responseText);
                    if(parsedJSON.error != undefined){
                        notify_about('error' , parsedJSON.error.message);
                        // if(handler) handler(parsedJSON.message);
                        show_content();
                    } else if(parsedJSON.result){
                        if(handler !== null) {
                            handler(parsedJSON.result);
                        }
                    }
                }
            }
        }
    };

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(jsonrpc);
}

function getTranslations(language){
    var xhr = new XMLHttpRequest();
    var file = 'translations_'+language+'.json';
    xhr.open('GET', '/badmin/translations/'+file, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == "200") {
            // console.log(xhr.responseText);
            var data = JSON.parse(xhr.responseText);
            loadTranslations(data);

          }
    };
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send();
}

function loadTranslations(result){
    PbxObject.frases = result;
    init();
}

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
        $('#sidebar-toggle').toggleClass('flipped');
        PbxObject.smallScreen = isSmall;
    }
}

function handleMessage(data){
    var data = JSON.parse(data),
        method = data.method;
    // console.log(data);
    if(data.method){ //if the message content has no "id" parameter, i.e. sent from the server without request
        var params = data.params;
        if(method == 'stateChanged' || method == 'objectUpdated'){
            // if(PbxObject.kind === 'extensions') {
                updateExtension(params);
            // }
        } else if(method == 'conferenceUpdate'){
            updateConference(data);
        }  else if(method == 'objectCreated'){
            newObjectAdded(params);
        } else if(method == 'objectDeleted') {
            if(params.ext) {
                delete_extension_row(params);
            } else {
                objectDeleted(params);
            }
        }
    } else{
        callbackOnId(data.id, data.result);
    }
}

function callbackOnId(id, result){

    if(id == 5){
        PbxObject.CallsBoard.setCurrentCalls(result);
    } else if(id == 6){
        PbxObject.CallsBoard.setCurrentState(result);
    } else if(id == 7){
        setCallStatistics(result);
    }
}

function init_page(){

    var maintemp = $('#main-template').html();
    var mainrend = Mustache.render(maintemp, PbxObject.frases);
    $('#pagecontainer').html(mainrend);

    switchMode(PbxObject.options.config);
    document.getElementsByTagName('title')[0].innerHTML = 'SmileSoft - ' + PbxObject.frases.PBXADMIN;

    setPageHeight();

    PbxObject.groups = {};
    PbxObject.templates = {};
    // PbxObject.language = window.localStorage.getItem('pbxLanguage');
    PbxObject.language = PbxObject.options.lang;
    PbxObject.smallScreen = isSmallScreen();

    $(window).resize(function(){
        setPageHeight();
        changeOnResize(isSmallScreen());
    });

    if(!isSmallScreen()) {
        $('#pagecontent').addClass('squeezed-right');
    } else{
        $('#sidebar-toggle').toggleClass('flipped');
    }
    if($(window).width() > 767 && $(window).width() < 959) {
        $('#pbxmenu').addClass('squeezed-menu');
        $('#pagecontent').removeClass('squeezed-right');
    }
    
    //set default loading page
    if(!location.hash.substring(1))
        location.hash = 'calls';
    
    load_pbx_options(PbxObject.options);
    get_object();
    set_listeners();
    $('[data-toggle="tooltip"]').tooltip({
        delay: {"show": 1000, "hide": 100}
    });

    // var wizzard = Wizzard({frases: PbxObject.frases});
}

function set_listeners(){

    addEvent(window, 'hashchange', get_object);
    $('.sidebar-toggle', '#pagecontent').click(toggle_sidebar);
    $('.options-open', '#pagecontent').click(open_options);
    $('.options-close', '#pbxoptions').click(close_options);
    $('#pbxmenu li a').click(showGroups);
    
    // var attachFastClick = Origami.fastclick;
    // attachFastClick(document.body);
}

function showGroups(e){
    var self = this;
    var href = this.href;
    var checkElement;
    if(href && href.substring(href.length-1) === "#") e.preventDefault();
    var parent = $(self).parent();
    var kind = $(self).attr('data-kind');
    if(!parent.hasClass('active')){
        if(kind) {
            var ul = document.createElement('ul');
            ul.id = 'ul-'+kind;

            if(kind != 'unit' && kind != 'icd' && kind != 'hunting' && kind != 'pickup' && kind != 'cli') {
                likind = document.createElement('li');
                likind.className = 'menu-name';
                likind.innerHTML = PbxObject.frases.KINDS[kind];
                ul.appendChild(likind);
            }

            // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
            json_rpc_async('getObjects', '\"kind\":\"'+kind+'\"', function(result){
                var li = document.createElement('li');
                li.className = 'add-group-object';
                var a = document.createElement('a');
                if(kind == 'application') {
                    var inp = document.createElement('input');
                    inp.type = "file";
                    inp.id = "uploadapp";
                    inp.className = "upload-custom";
                    inp.accept = ".application";
                    addEvent(inp, 'change', function(){
                        upload('uploadapp');
                    });
                    li.appendChild(inp);
                    a.href = '#';
                    addEvent(a, 'click', function(e){
                        document.getElementById('uploadapp').click();
                        if(e) e.preventDefault;
                    });
                }
                else{
                    a.href = '#'+kind;
                }
                a.innerHTML ='<i class="fa fa-plus"></i><span>'+(isGroup(kind) ? PbxObject.frases.ADD_GROUP : PbxObject.frases.ADD)+'</span>';
                li.appendChild(a);
                ul.appendChild(li);

                var i, gid, name, li, a, rem, objects = result;
                sortByKey(objects, 'name');
                for(i=0; i<objects.length; i++){
                    if(kind === 'trunk' && objects[i].type === 'system') {
                        continue;
                    } else {
                        gid = objects[i].oid;
                        name = objects[i].name;
                        li = document.createElement('li');
                        a = document.createElement('a');
                        a.href = '#'+kind+'?'+gid;
                        a.innerHTML = name;
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                }
                $(self).siblings().remove('ul');
                parent.append(ul);

                show_content(false);

                checkElement = $(self).next('ul');
                if(checkElement) checkElement.slideDown('normal');
                parent.addClass('active');
            });
            show_loading_panel(parent[0]);
        } else {
            checkElement = $(self).next('ul');
            if(checkElement) {
                checkElement.slideDown('normal');
            }
            parent.addClass('active');
        }
    } else {
        checkElement = $(self).next('ul');
        if(checkElement) {
            parent.removeClass('active');
            checkElement.slideUp('normal');
        }
    }
    parent.siblings('li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function get_object(e){

    var query = location.hash.substring(1),
        kind = query.indexOf('?') != -1 ? query.substring(0, query.indexOf('?')) : query.substring(0),
        oid = query.indexOf('?') != -1 ? query.substring(query.indexOf('?')+1) : kind, //if no oid in query then set kind as oid
        lang = PbxObject.language,
        callback = null,
        fn = null;
        
    if(query === PbxObject.query) return;
    if(query != ''){

        PbxObject.query = query;
        PbxObject.kind = kind;
        PbxObject.oid = oid;

        $('#dcontainer').addClass('faded');

        // show_loading_panel();

        var modal = document.getElementById('el-extension');
        if(modal) modal.parentNode.removeChild(modal);

        var groupKinds = ['equipment', 'unit', 'users', 'icd', 'hunting', 'conference', 'selector', 'channel', 'pickup'];
        if(groupKinds.indexOf(kind) != -1){
            kind = 'bgroup';
        }

        // callback = 'load_' + kind;
        // fn = window[callback];

        if(PbxObject.templates[kind]){
            load_template(PbxObject.templates[kind], kind);
        } else {
            // $("#dcontainer").load('/badmin/views/'+kind+'.html', function(template){
            $.get('/badmin/views/'+kind+'.html', function(template){
                PbxObject.templates[kind] = template;
                load_template(template, kind);
            });
        }
    }

    if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
        $('#pagecontent').toggleClass('squeezed-right');
        $('#pbxmenu').toggleClass('squeezed-right');
        $('#pbxmenu').scrollTop(0);
    }
}

function load_template(template, kind){
    // var template = document.getElementById('el-loaded-content').innerHTML;
    var callback = 'load_' + kind;
    var fn = window[callback];
    var rendered = Mustache.render(template, PbxObject.frases);
    $("#dcontainer").html(rendered);

    if(kind == 'extensions' || kind == 'channels'){
        // if(PbxObject.extensions)
        //     load_extensions(PbxObject.extensions);
        // else
        json_rpc_async('getExtensions', null, fn);
    } else if(kind == 'calls' || kind == 'records' || kind == 'rec_settings' || kind == 'certificates' || kind == 'statistics' || kind == 'reports'){
        fn();
    } else {
        json_rpc_async('getObject', '\"oid\":\"'+PbxObject.oid+'\"', fn);
    }
    $('#dcontainer').scrollTop(0);
    // $('.squeezed-menu > ul').children('li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function getPartial(partialName, cb){
    PbxObject.partials = PbxObject.partials || {};
    var template = PbxObject.partials[partialName];
    if(template){
        cb(template);
    } else{
        $.get('/badmin/partials/'+partialName+'.html', function(template){
            PbxObject.partials[partialName] = template;
            cb(template);
        });
    }
}

function set_page(){
    var kind = PbxObject.kind;
    if(kind != 'attendant' && kind != 'extensions' && kind != 'trunk' && kind != 'application' && kind != 'cli' && kind != 'routes' && kind != 'timer'){
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
            } else 
                return;
            // console.log(to, from);
            move_list(to, from);
        }
    });

    $('#dcontainer div.panel-header:not(.panel-static)').click(toggle_panel);
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
    bc1.innerHTML = '<a href="#'+PbxObject.kind+'">'+PbxObject.frases.KINDS[PbxObject.kind]+'</a>';

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

function toggle_sidebar(e){
    if(e) e.preventDefault();

    $(this).toggleClass('flipped');
    $('#pagecontent').toggleClass('squeezed-right');
    $('#pbxmenu').toggleClass('squeezed-right');
    if(!isSmallScreen())
        toggle_menu();
}

function toggle_menu(){
    $('#pbxmenu').toggleClass('squeezed-menu');
}

function open_options(e){
    // get_pbx_options();
    // $(this).off('click');
    // $(this).addClass('spinner');
    // $('#pbxoptions').addClass('top-layer');
    if(e) e.preventDefault();
    toggle_presentation();
}
function close_options(e){
    // $('.options-open', '#pagecontent').click(open_options);
    $('#pagecontent').removeClass('pushed-left');
    $('#pbxoptions').removeClass('pushed-left');
    $('#el-slidemenu').removeClass('hide-menu');
    setTimeout(function(){
       $('#pbxoptions').removeClass('top-layer');
       $('#el-options-content').remove();
    }, 500);
    if(e) e.preventDefault();
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
    $('.tab-switcher', '#pbxoptions').click(function(e) {
        var e = e || window.event;
        switch_options_tab($(this).attr('data-tab'));
        e.preventDefault();
    });
}

function show_loading_panel(container){
    if(document.getElementById('el-loading')) return;
    var back = document.createElement('div');
    back.id = 'el-loading';
    back.className = 'el-loading-panel ';
    var load = document.createElement('img');
    load.src = '/badmin/images/sprites_white.png';
    load.className = 'loader';
    back.appendChild(load);

    var cont = container || document.getElementById('pagecontainer');
    cont.appendChild(back);
}

function remove_loading_panel(){
    var loading = document.getElementById('el-loading');
    if(loading) loading.parentNode.removeChild(loading);
}

function show_content(togglecont){
    setBreadcrumbs();
    remove_loading_panel();

    if($('#dcontainer').hasClass('faded'))
        $('#dcontainer').removeClass('faded');

    if(togglecont === false) return;
}

//TODO stick to DRY principles
function switchMode(config){
    // var menu = document.getElementById('pbxmenu');
    // var lists = [].slice.call(menu.querySelectorAll('ul li'));
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
    if(config.indexOf('no groups') !== -1) {
        lists.forEach(function(item){
            // if(item.className.indexOf('mode-groups') != -1 || item.className.indexOf('mode-equipment') != -1)
            if(item.className.indexOf('mode-groups') != -1)
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
            if(!(item.classList.contains('pl-no-'+kind)))
                action = 'add';
            else
                action = 'remove';
        } else {
            action = 'remove';
        }
        
        item.classList[action]('revealed');
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

function newObjectAdded(data){

    var oid = data.oid,
        kind = data.kind,
        name = data.name,
        enabled = data.enabled,
        setobj = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object'),
        ul = document.getElementById('ul-'+data.kind);

    remove_loading_panel();
    notify_about('success', name+' '+PbxObject.frases.CREATED);

    if(kind === 'phone' || kind === 'user') return;
    if(kind !== 'application'){
        PbxObject.query = kind+'?'+oid;
        window.location.href = '#'+PbxObject.query;
    }
    
    if(ul){
        var li = document.createElement('li'),
            a = document.createElement('a');
        a.href = '#'+kind+'?'+oid;
        a.innerHTML = name;
        li.appendChild(a);
        ul.appendChild(li);
    }

    if(delobj && delobj.hasAttribute('disabled')) {
        delobj.removeAttribute('disabled');
        delobj.onclick = function(){
            delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
        };
    }

    if(setobj) setobj.innerHTML = PbxObject.frases.SAVE;
    
    if(typeof PbxObject.objects === 'object') {
        PbxObject.objects.push(data);
        sortByKey(PbxObject.objects, 'name');
    }
}

function objectDeleted(data){
    var ul = document.getElementById('ul-'+data.kind);
    if(ul){
        var li, a, href;
        for(var i=0;i<ul.children.length;i++){
            li = ul.children[i];
            a = li.querySelector('a');
            if(a && a.href) {
                href = a.href;
                if(href && href.substring(href.indexOf('?')+1) == data.oid){
                    ul.removeChild(li);
                }
            } else {
                continue;
            }
        }
    }
    if(typeof PbxObject.objects === 'object') {
        PbxObject.objects = PbxObject.objects.filter(function(obj){
            return obj.oid !== data.oid;
        });
    }
}

function set_object_success(){
    remove_loading_panel();

    notify_about('success', PbxObject.frases.SAVED);
}

function set_options_success() {
    var i, newpath = '', parts = window.location.pathname.split('/');
    for (i = 0; i < parts.length; i++) {
        if (parts[i] === 'en' || parts[i] === 'uk' || parts[i] === 'ru') {
            parts[i] = PbxObject.language;
        }
        newpath += '/';
        newpath += parts[i];
    }
    var newURL = window.location.protocol + "//" + window.location.host + newpath.substring(1);
    window.location.href = newURL;
}

function delete_object(name, kind, oid){
    var c = confirm(PbxObject.frases.DODELETE+' '+name+'?');
    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            objectDeleted({name: name, kind: kind, oid: oid});
            window.location.hash = kind;
        });
    } else{
        return false;
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

    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            if(anchor) {
                anchor.removeAttribute('href');
                removeEvent(anchor, 'click', get_extension);
            }
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
        return name;
    }
    return '';
}

function customize_upload(id, resultFilename){
    var upl = document.getElementById(id);
    if(!upl) {
        console.error('custommize_upload: File element not found');
        return;
    }
    var uplparent = upl.parentNode,
        uplbtn = document.createElement('button'),
        uplname = document.createElement('span');
        
    uplparent.className += ' nowrap';

    var filename = getFileName(resultFilename);
    uplname.innerHTML = filename;
    uplname.title = filename;
    uplname.className = 'upload-filename'

    uplbtn.type = 'button';
    uplbtn.className = 'btn btn-default btn-sm needsclick';
    uplbtn.innerHTML = 'Upload';
    uplbtn.onclick = function(){
        upl.click();
    };
    uplparent.insertBefore(uplbtn, upl);
    uplparent.insertBefore(uplname, upl);
    upl.onchange = function(){
        if(this.files.length){
            filename = getFileName(this.files[0].name);
            uplname.innerHTML = filename;
            uplname.title = filename;
        } else{
            uplname.innerHTML = ' ';
            uplname.title = '';
        }
    };
}

function upload(inputid, urlString){
    var upload;
    if(isElement(inputid))
        upload = inputid;
    else if(typeof inputid === 'string')
        upload = document.getElementById(inputid);
    else
        return false;

    var url = urlString ? urlString : "/";
    var filelist = upload.files;
    if(filelist.length == 0){
        return false;
    }
    var file = filelist[0];
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
    xmlhttp.setRequestHeader("X-File-Name", file.name);
    xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send(file);
    // console.log('upload', upload, url);
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
    location.hash = result.kind+'?'+oid;
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
    var data = {}, field, name, value;
    for (var i = 0; i < formEl.elements.length; i++) {
        field = formEl.elements[i];
        if (!field.hasAttribute("name")) { continue; };
        name = field.name;
        if(field.type === 'checkbox'){
            value = field.checked;
        } else if(field.type === 'file'){
            value = field.files.length ? field.files[0].name : null;
        } else {
            value = field.value;
        }

        if(value !== undefined && value !== null) data[name] = value;
    };

    return data;
}

function isSmallScreen(){
    return $(window).width() < 768;
}

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

    var elgroup = getClosest(targ, '.input-group'),
    input = elgroup.querySelector('input'),
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    pass = "",
    length = 8,
    i;
    for(var x=0; x<length; x++){
        i = Math.floor(Math.random() * 62);
        pass += chars.charAt(i);
    }
    input.value = pass;
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
}

function objFromString(obj, i){
    return obj[i];
}

function formatTimeString(time, format){
    var h, m, s, newtime;
    h = Math.floor(time / 3600);
    time = time - h * 3600;
    m = Math.floor(time / 60);
    newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
    if(format == 'hh:mm:ss'){
        s = time - m * 60;
        newtime += ':' + (s < 10 ? '0'+s : s);
    }
    return newtime;
}

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

function extend( a, b ) {
    for( var key in b ) {
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
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
    cell.innerHTML = '<input type="text" class="form-control codec-frames" value="'+(data.frame ? data.frame : 0)+'">';
    cell = row.insertCell(3);
    cell.innerHTML = '<input type="checkbox" '+(data.frame ? 'checked' : '')+' class="codec-enabled">';

    return row;
}

function buildCodecsTable(elementOrId, data, available){
    var unavailable = [],
        fragment = document.createDocumentFragment(),
        el = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
    
    unavailable = unavailable.concat(available);

    data.forEach(function(item){
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
    return PbxObject.frases.CODES[code.toString()];
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
        var item = prop ? items[i][prop] : items[i];
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

function get_protocol_opts(protocol, options){
    
    var proto = protocol == 'h323' ? 'h323' : 'sip';
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

    var codecs = ["G.711 Alaw", "G.711 Ulaw", "G.729", "G.723"];
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

    if(state == 1) {
        className = 'success';
    } else if(state == 8) {
        className = 'connected';
    } else if(state == 2 || state == 5) {
        className = 'warning';
    } else if(state == 0 || (state == -1 && group)) {
        state = '';
        className = '';
    } else if(state == 3) {
        className = 'danger';
    } else if(state == 6 || state == 7) {
        className = 'info';        
    } else {
        className = 'active';
    }
    status = PbxObject.frases.STATES[state] || '';

    return {
        rstatus: status,
        rclass: className
    }

}

function fill_group_choice(kind, groupid, select){
    // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
    var select = select || document.getElementById("extgroup");
    // for(var i=0;i<=select.options.length;i++){
    //     select.remove(select.selectedIndex[i]);
    // }
    while(select.firstChild) {
        select.removeChild(select.firstChild);
    }
    json_rpc_async('getObjects', '\"kind\":\"'+kind+'\"', function(result){
        var gid, name, option, i;
        if(select) {
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

(function(){
    var language;
    createWebsocket();

    if(window.localStorage.getItem('pbxOptions')) {
        var data = window.localStorage.getItem('pbxOptions');
        data = JSON.parse(data);
        language = data.lang || 'en';

        getTranslations(language);
        PbxObject.options = data;
        window.localStorage.removeItem('pbxOptions');
        moment.locale(language);
    } else {
        json_rpc_async('getPbxOptions', null, function(result){
            language = result.lang || 'en';
            getTranslations(language);
            PbxObject.options = result;
            moment.locale(language);
        });
    }
})();
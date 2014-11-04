
window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };

var PbxObject = PbxObject || {};

// $(document).ready(function(){    

//     createWebsocket();
//     init_page();
//     setPageHeight();
//     getTranslations();

// });

// function checkReadyState(){
//     if(PbxObject.options != undefined && PbxObject.frases != undefined) {
//         PbxObject.readyState = true;
//         window.clearInterval(PbxObject.initInterval);
//         init();

//         console.log(PbxObject.readyState);
//     } else {
//         return;
//     }
// }

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

    var protocol = (location.protocol === 'http:') ? 'ws:' : 'wss:';
    PbxObject.websocket = new WebSocket(protocol + '//'+window.location.host+'/','json.api.smile-soft.com'); //Init Websocket handshake
    PbxObject.websocket.onopen = function(e){
        console.log('WebSocket opened');
        PbxObject.websocketTry = 1;

    };
    PbxObject.websocket.onmessage = function(e){
        console.log(e);
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
    var jsonrpc, url = window.location.protocol + '//' + window.location.host;
    if(params == null){
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';
    }
    else{
        jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url, false);
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xmlhttp.send(jsonrpc);
    var parsedJSON = JSON.parse(xmlhttp.responseText);
    if(parsedJSON.error != undefined){
        notify_about('error' , parsedJSON.error.message);
        return;
    }
    return parsedJSON.result;
    // if(xmlhttp.responseText) {
    //     var parsedJSON = JSON.parse(xmlhttp.responseText);
    //     if(parsedJSON.error != undefined){
    //         if(parsedJSON.error.code == 404 || parsedJSON.error.code == 406) {
    //             return;
    //         }
    //     } else {
    //         return parsedJSON.result;
    //     }
    // } else {
    //     return null;
    // }
}

function json_rpc_async(method, params, handler, id){
    var jsonrpc, url = window.location.protocol + '//' + window.location.host;

    if(params)
        jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';
    else
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    var requestTimer = setTimeout(function(){
        xhr.abort();
        notify_about('info' , PbxObject.frases.TIMEOUT);
        show_content();
    }, 30000);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4){
            clearTimeout(requestTimer);
            if(xhr.status != 200) {
                console.error(xhr.statusText);
                alert(xhr.status);
                notify_about('error', PbxObject.frases.ERROR);
                show_content();
            } else {
                if(xhr.responseText != null) {
                    var parsedJSON = JSON.parse(xhr.responseText);
                    if(parsedJSON.error != undefined){
                        notify_about('error' , parsedJSON.error.message);
                        show_content();
                    } else if(parsedJSON.result){
                        if(handler != null) {
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
        PbxObject.smallScreen = isSmall;
    }
}

// function loadOptions(result){
//     console.log(result);
//     var options = JSON.stringify(result), 
//         language = result.lang || 'en';

//     window.localStorage.setItem('pbxLanguage', language);
//     window.localStorage.setItem('pbxOptions', options);

//     init_page();

// }

function handleMessage(data){
    var data = JSON.parse(data),
        method = data.method;
    if(data.method){ //if the message content has no "id" parameter, i.e. sent from the server without request
        var params = data.params;
        if(method == 'stateChanged'){
            if(PbxObject.kind === 'extensions') {
                updateExtension(params);
            }
        } else if(method == 'objectCreated'){
            newObjectAdded(params);
        } else if(method == 'objectDeleted') {
            if(params.ext) {
                delete_extension_row(params);
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
    }

}

function init_page(){

    // if(window.localStorage.getItem('pbxOptions')) {
    //     var data = window.localStorage.getItem('pbxOptions');
    //     data = JSON.parse(data);

    //     load_pbx_options(data);
    //     window.localStorage.removeItem('pbxOptions');
    // } else {
    //     json_rpc_async('getPbxOptions', null, load_pbx_options);
    // }
    var menutemp = $('#menu-template').html();
    var opttemp = $('#options-template').html();
    var menrend = Mustache.render(menutemp, PbxObject.frases);
    var optrend = Mustache.render(opttemp, PbxObject.frases);
    $('#pbxmenu').html(menrend);
    $('#pbxoptions').html(optrend);

    switchMode(PbxObject.options.config);
    document.getElementsByTagName('title')[0].innerHTML = 'SmileSoft - ' + PbxObject.frases.PBXADMIN;

    setPageHeight();

    PbxObject.groups = {};
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
}

function set_listeners(){

    addEvent(window, 'hashchange', get_object);
    $('.sidebar-toggle', '#pagecontent').click(toggle_sidebar);
    $('.options-open', '#pagecontent').click(open_options);
    // $('#pbxmenu li a').click(showGroups);
    $('.options-close', '#pbxoptions').click(close_options);

    $('#pbxmenu li a').click(function() {
        var parent = $(this).parent();
        var kind = $(this).attr('data-kind');
        if(kind && !parent.hasClass('active')){
            var ul = document.createElement('ul');
            ul.id = 'ul-'+kind;

            if(kind != 'equipment' && kind != 'unit' && kind != 'users' && kind != 'icd' && kind != 'hunting' && kind != 'pickup' && kind != 'cli') {
                likind = document.createElement('li');
                likind.className = 'menu-name';
                likind.innerHTML = PbxObject.frases.KINDS[kind];
                ul.appendChild(likind);
            }

            var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
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
            a.innerHTML ='<i class="glyphicon glyphicon-plus"></i><span>Add</span>';
            li.appendChild(a);
            ul.appendChild(li);
            var i, gid, name, li, a, rem;
            for(i=0; i<result.length; i++){
                gid = result[i].oid;
                name = result[i].name;
                li = document.createElement('li');
                a = document.createElement('a');
                a.href = '#'+kind+'?'+gid;
                a.innerHTML = name;
                li.appendChild(a);
                ul.appendChild(li);
            }
            $(this).siblings().remove('ul');
            parent.append(ul);
        }

        parent.siblings('li.active').removeClass('active').children('ul:visible').slideUp('normal');
        parent.addClass('active'); 

        var checkElement = $(this).next();
        if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            parent.removeClass('active');
            checkElement.slideUp('normal');

        }
        if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            checkElement.slideDown('normal');
        }

        if(parent.find('ul').children().length == 0) {
            return true;
        } else {
            return false; 
        }
    }); 
}

function get_object(result){

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

        if(kind == 'equipment' || kind == 'unit' || kind == 'users' || kind == 'icd' || kind == 'hunting' || kind == 'conference' || kind == 'selector' || kind == 'channel' || kind == 'pickup'){
            kind = 'bgroup';
        }

        callback = 'load_' + kind;
        fn = window[callback];
//        var url = '/badmin/js/'+query+'.js';
//        $.getScript(url, function(){

            // $("#dcontainer").load('/badmin/'+lang+'/'+kind+'.html', function(){
            $("#dcontainer").load('/badmin/views/'+kind+'.html', function(){
                var template = document.getElementById('el-loaded-content').innerHTML;
                var output = Mustache.render(template, PbxObject.frases);
                $("#dcontainer").html(output);

                if(kind == 'extensions'){
                    // if(PbxObject.extensions)
                    //     load_extensions(PbxObject.extensions);
                    // else
                        json_rpc_async('getExtensions', null, fn);
                }
                else if(kind == 'calls' || kind == 'records'){
                    fn();
                }
                else {
                    json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', fn);
                }
                $('#dcontainer').scrollTop(0);
                // $('.squeezed-menu > ul').children('li.active').removeClass('active').children('ul:visible').slideUp('normal');
            });
//        });
    }
}

function set_page(){
    var kind = PbxObject.kind;
    if(kind != 'extensions' && kind != 'trunk' && kind != 'application' && kind != 'cli' && kind != 'routes' && kind != 'timer'){
            kind = 'bgroup';
        }
    // var chk = document.getElementsByClassName('delall'),
    var trow = document.querySelectorAll('.transrow'),
        clirow = document.querySelectorAll('.clirow'),
        rtrow = document.querySelectorAll('.routerow'),
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
    if(rtrow.length){
        for(i=0;i<rtrow.length;i++){
            addEvent(rtrow[i], 'click', add_route);
        }
    }

    if(so){
        var text = PbxObject.name ? PbxObject.frases.SAVE : PbxObject.frases.CREATE;
        so.innerHTML = text;
        so.onclick = function(){
            fn();
        };
    }
    if(delobj){
        if(PbxObject.name){
            delobj.onclick = function(e){
                delete_object(e, PbxObject.name, PbxObject.kind, PbxObject.oid);
            };
        }
        else delobj.setAttribute('disabled', 'disabled');
    }

    if(kind == 'hunting' || kind == 'icd' || kind == 'unit' || kind == 'routes'){
        var sortable = document.getElementsByClassName('el-sortable');
        for(var i=0;i<sortable.length;i++){
            new Sortable(sortable[i]);
        }
    }

    $('div.panel-header').click(toggle_panel);

}

function setBreadcrumbs(){
    var breadcrumb = document.querySelector('.breadcrumb');
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
        $el = $panel.find('.panel-body');

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

function show_content(togglecont){
    setBreadcrumbs();
    var loading = document.getElementById('el-loading');
    if(loading) loading.parentNode.removeChild(loading);

    if($('#dcontainer').hasClass('faded')) 
        $('#dcontainer').removeClass('faded');

    if(togglecont === false) return;

    if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
        $('#pagecontent').toggleClass('squeezed-right');
        $('#pbxmenu').toggleClass('squeezed-right');
    }

    // if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
    //     $('#pagecontent').toggleClass('squeezed-right');
    //     $('#pbxmenu').toggleClass('squeezed-right');
    // }
    // if($('#dcontainer').hasClass('faded')) 
    //     $('#dcontainer').removeClass('faded');

}

function switchMode(config){
    var menu = document.getElementById('pbxmenu');
    var lists = [].slice.call(menu.querySelectorAll('ul li'));
    if(config.indexOf('channels') == -1) {
        lists.forEach(function(item){
            if(item.className === 'mode-channels')
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no selector') !== -1) {
        lists.forEach(function(item){
            if(item.className === 'mode-selector')
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no users') !== -1) {
        lists.forEach(function(item){
            if(item.className === 'mode-users')
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no groups') !== -1) {
        lists.forEach(function(item){
            if(item.className === 'mode-groups')
                item.parentNode.removeChild(item);
        });
    }
}

function switch_presentation(kind){
    var container = document.getElementById('dcontainer');
    var panels = [].slice.call(container.querySelectorAll('.pl-kind'));
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
        if(childs[i].id != tabid) {
            childs[i].style.display = 'none';   
        }
        else childs[i].style.display = '';
    }
}

function filter_table(e){
    var e = e || window.event;
    var text, val, row,
        input = e.target || this,
        tid = input.getAttribute('data-table'),
        table = document.getElementById(tid);
        val = input.value.toLowerCase();

    for(var i=1; i<table.rows.length; i++){
        row = table.rows[i];
        text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }
}

function notify_about(status, message){
    var notifyUp, 
        ico, 
        cls, 
        body = document.getElementsByTagName('body')[0];
    switch(status){
        case 'success':
            ico = '<span class="glyphicon glyphicon-ok"></span>';
            cls = 'el-notifier-ok';
            break;
        case 'error':
            ico = '<span class="glyphicon glyphicon-remove"></span>';
            cls = 'el-notifier-error';
            break;
        default:
            ico = '<span class="glyphicon glyphicon-exclamation-sign"></span>';
            cls = 'el-notifier-info';
    }

    var div = document.createElement('div');
    div.className = 'el-notifier '+cls;
    div.innerHTML = message+' '+ico;
    body.appendChild(div);
    notifyUp = setTimeout(function(){
        body.removeChild(div);
    }, 5000);
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
    inp.innerHTML = '<i class="glyphicon glyphicon-remove"></i>';
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
    var el = this.parentNode, row;
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
        load = document.getElementById('el-loading'),
        adduser = document.getElementById('add-user'),
        setobj = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object'),
        ul = document.getElementById('ul-'+data.kind);

    if(load) load.parentNode.removeChild(load);
    
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
        delobj.onclick = function(e){
            delete_object(e, PbxObject.name, PbxObject.kind, PbxObject.oid);
        };
    }
    if(kind === 'users') {
        removePreventInteraction();
        if(adduser && adduser.hasAttribute('disabled')) {
            adduser.removeAttribute('disabled');
            // addEvent(adduser, 'click', function(){
            //     addUser(kind);
            //     cleanForm(form);
            // });
        }
    }

    setobj.innerHTML = PbxObject.frases.SAVE;
    
    /***TODO in IPPBX***/

    update = {
        enabled: enabled,
        name: name,
        oid: oid
    };

    PbxObject.query = kind+'?'+oid;
    PbxObject.groups[kind] = PbxObject.groups[kind] || [];
    PbxObject.groups[kind].push(update);

    notify_about('success', name+' '+PbxObject.frases.CREATED);
    window.location.href = '#'+PbxObject.query;

}

// function newObjectAdded(data){

//     var ul = document.getElementById('ul-'+data.kind),
//         load = document.getElementById('el-loading');
//     if(load) load.parentNode.removeChild(load);

//     PbxObject.query = data.kind+'?'+data.oid;
//     // window.location.hash = data.kind+'?'+data.oid;

//     if(ul){
//         var li = document.createElement('li'),
//             a = document.createElement('a');
//         a.href = '#'+data.kind+'?'+data.oid;
//         a.innerHTML = data.name;
//         li.appendChild(a);
//         ul.appendChild(li);
//     }

//     notify_about('success', data.name+' '+PbxObject.frases.CREATED);

// }

function set_object_success(){
    var load = document.getElementById('el-loading');
    if(load) load.parentNode.removeChild(load);

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

function delete_object(e, name, kind, oid){
    var e = e || window.event;
    if(e.type == 'click')
        e.preventDefault(); 
    var c = confirm(PbxObject.frases.DODELETE+' '+name+'?');
    if (c){
        var ul = document.getElementById('ul-'+kind);
        if(ul){
            var li, a, href;
            for(var i=0;i<ul.children.length;i++){
                li = ul.children[i];
                a = li.querySelector('a');
                if(a && a.href) {
                    href = a.href;
                    if(href && href.substring(href.indexOf('?')+1) == oid){
                        ul.removeChild(li);
                    }
                } else {
                    continue;
                }
            }
        }
        json_rpc('deleteObject', '\"oid\":\"'+oid+'\"');
        if(oid === PbxObject.oid) window.location.hash = kind;

        if(PbxObject.groups[kind]) {
            PbxObject.groups[kind] = PbxObject.groups[kind].filter(function(obj){
                return obj.oid !== oid;
            });
        }
    }
    else{
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
        msg = PbxObject.frases.DODELETE + ' ' + ext + ' ' +PbxObject.frases.FROM + ' ' + (group ? group : "") + '?',
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
    console.log(table);
    table = table.querySelector('tbody');

    var row = document.getElementById(params.oid);
    table.removeChild(row);

    var available = document.getElementById('available-users');
    if(available) {
        available.innerHTML += '<option value="'+params.ext+'">'+params.ext+'</option>';
    }
}

function customize_upload(id, resultFilename){
    var upl = document.getElementById(id),
        uplparent = upl.parentNode,
        uplbtn = document.createElement('button'),
        uplname = document.createElement('span');
    if(resultFilename !== null) uplname.innerHTML = ' '+resultFilename;
    uplbtn.type = 'button';
    uplbtn.className = 'btn btn-default btn-sm';
    uplbtn.innerHTML = 'Upload';
    uplbtn.onclick = function(){
        upl.click();
    };
    uplparent.insertBefore(uplbtn, upl);
    uplparent.insertBefore(uplname, upl);
    upl.onchange = function(){
        if(this.files.length)
            uplname.innerHTML = ' '+this.files[0].name;
        else
            uplname.innerHTML = ' ';
    };
}

function upload(inputid){
    var upload = document.getElementById(inputid);
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
                if(upload == 'uploadapp') {
                    notify_about('success' , file.name+' '+PbxObject.frases.UPLOADED);
                }
            }
        }
    };
    xmlhttp.open("PUT", "/", true);
    xmlhttp.setRequestHeader("X-File-Name", file.name);
    xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send(file);
}

function get_object_link(oid){
    var result = json_rpc('getObject', '\"oid\":\"'+oid+'\"');   
    location.hash = result.kind+'?'+oid;
}

function isSmallScreen(){
    return $(window).width() < 768;
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

};

function preventInteraction(element){
    var parent = element.parentNode;
    var preventer = document.createElement('div');
    var message = document.createElement('p');

    message.textContent = PbxObject.frases.EMPTYOBJECTWARNING;
    preventer.className = 'preventer';
    preventer.appendChild(message);
    parent.appendChild(preventer);
}

function removePreventInteraction(){
    var parent, preventers = [].slice.call(document.querySelectorAll('.preventer'));
    preventers.forEach(function(item){
        parent = item.parentNode;
        parent.removeChild(item);
    });
}

function sortSelect(selectElement) {
    var options = [].slice.call(selectElement.options);
 
    options.sort(function(a,b) {
        if (a.text.toUpperCase() > b.text.toUpperCase()) return 1;
        else if (a.text.toUpperCase() < b.text.toUpperCase()) return -1;
        else return 0;
    });
 
    $(selectElement).empty().append( options );
}

function addEvent(obj, evType, fn) {
  if (obj.addEventListener) obj.addEventListener(evType, fn, false); 
  else if (obj.attachEvent) obj.attachEvent("on"+evType, fn); 
}
function removeEvent(obj, evType, fn) {
  if (obj.removeEventListener) obj.removeEventListener(evType, fn, false); 
  else if (obj.detachEvent) obj.detachEvent("on"+evType, fn); 
}

function load_pbx_options(result) {
    console.log(result);
    var options, chk, trow, tables, transforms, so;

    switch_options_tab('mainopt-tab');

    // PbxObject.oidOptions = result.oid;
    PbxObject.config = result.config || [];

    if (result.lang) {
        var select = document.getElementById('interfacelang'),
                i = select.options.length - 1;
        while (i >= 0) {
            if (select.options[i].value === result.lang) {
                select.options[i].selected = true;
            }
            i--;
        }
    }

    //customizing upload element
    customize_upload('musonhold', result.options.holdmusicfile);

    document.getElementById('adminname').value = result.adminname || '';

    if (result.options) {
        document.getElementById('holdreminterv').value = result.options.holdremindtime || '';
        document.getElementById('holdrectime').value = result.options.holdrecalltime || '';
        document.getElementById('transrectime').value = result.options.transferrecalltime || '';
        document.getElementById('transrecdest').value = result.options.transferrecallnumber || '';
        document.getElementById('autoretrieve').checked = result.options.autoretrive;
        document.getElementById('parkrectime').value = result.options.parkrecalltime || '';
        document.getElementById('parkrecdest').value = result.options.parkrecallnumber || '';
        document.getElementById('discontime').value = result.options.parkdroptimeout || '';
    }

    options = document.getElementById('pbxoptions');

    so = document.getElementById('el-set-options');
    so.onclick = set_pbx_options;

    // toggle_presentation();
}

function set_pbx_options(e) {

    var e = e || window.event;
    if(e) e.preventDefault();

    var jprms, 
        handler,
        pass = document.getElementById('adminpass').value,
        confpass = document.getElementById('confirmpass').value,
        select = document.getElementById('interfacelang'),
        lang = select.options[select.selectedIndex].value;

    if (pass && pass != confpass) {
        alert('Please confirm your password.');
        return false;
    }
    else{
        show_loading_panel();
    }

    jprms = '"lang":"' + lang + '", ';
    // jprms += '"oid":"' + PbxObject.oidOptions + '",';
    if (pass) jprms += '"adminpass":"' + pass + '", ';

    jprms += '\"options\":{';
    var file = document.getElementById("musonhold");
    if (file.value) {
        jprms += '"holdmusicfile":"' + file.files[0].name + '", ';
        upload('musonhold');
    }
    if (document.getElementById('holdreminterv').value)
        jprms += '"holdremindtime":' + document.getElementById('holdreminterv').value + ', ';
    if (document.getElementById('holdrectime').value)
        jprms += '"holdrecalltime":' + document.getElementById('holdrectime').value + ', ';
    if (document.getElementById('transrectime').value)
        jprms += '"transferrecalltime":' + document.getElementById('transrectime').value + ', ';
    if (document.getElementById('transrecdest').value)
        jprms += '"transferrecallnumber":"' + document.getElementById('transrecdest').value + '", ';
    jprms += '"autoretrive":' + document.getElementById('autoretrieve').checked + ', ';
    if (document.getElementById('parkrectime').value)
        jprms += '"parkrecalltime":' + document.getElementById('parkrectime').value + ', ';
    if (document.getElementById('parkrecdest').value)
        jprms += '"parkrecallnumber":"' + document.getElementById('parkrecdest').value + '", ';
    if (document.getElementById('discontime').value)
        jprms += '"parkdroptimeout":' + document.getElementById('discontime').value;
    jprms += '}';

    if (lang !== PbxObject.language) {
        PbxObject.language = lang;
        window.localStorage.setItem('pbxLanguage', lang);
        handler = set_options_success;
    }
    else {
        handler = set_object_success;
    }

    console.log(jprms);
    // window.localStorage.setItem('pbxOptions', '{'+jprms+'}');
    json_rpc_async('setPbxOptions', jprms, handler);
}

(function(){

    createWebsocket();

    if(window.localStorage.getItem('pbxOptions')) {
        var data = window.localStorage.getItem('pbxOptions');
        data = JSON.parse(data);

        getTranslations(data.lang);
        PbxObject.options = data;
        window.localStorage.removeItem('pbxOptions');
    } else {
        json_rpc_async('getPbxOptions', null, function(result){
            getTranslations(result.lang);
            PbxObject.options = result;
        });
    }

    // PbxObject.readyState = false;
    // PbxObject.initInterval = window.setInterval(function(){
    //     console.log(PbxObject.readyState);
    //     if(!PbxObject.readyState) {
    //         checkReadyState();
    //     }
    // }, 200);

})();

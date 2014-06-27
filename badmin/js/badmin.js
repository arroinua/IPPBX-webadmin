
window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };

var PbxObject = PbxObject || {};

PbxObject.frases = {
    saved: {
        en: 'All changes saved!',
        uk: 'Всі зміни збережені!',
        ru: 'Все изменения сохранены!'
    },
    timeout: {
        en: 'Operation timeout',
        uk: 'Таймаут операції',
        ru: 'Таймаут операции'
    },
    error: {
        en: 'An error has occured',
        uk: 'Сталося помилка',
        ru: 'Возникла ошибка'
    },
    uploaded: {
        en: 'uploaded',
        uk: 'завантажен',
        ru: 'загружен'
    },
    created: {
        en: 'created',
        uk: 'створений',
        ru: 'создан'
    },
    doDelete: {
        en: 'Delete',
        uk: 'Видалити',
        ru: 'Удалить'
    }
};

$(document).ready(function(){    
    init_page();
    setPageHeight();
});

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
        if(parsedJSON.error.code == 404 || parsedJSON.error.code == 406) {
            return;
        }
    }
    return parsedJSON.result;
}

function json_rpc_async(method, params, handler){
    var jsonrpc;
    if(params)
        jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';
    else
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/", true);

    var requestTimer = setTimeout(function(){
        xhr.abort();
        notify_about('info' , PbxObject.frases.timeout[PbxObject.lang]);
        show_content();
    }, 30000);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4){
            clearTimeout(requestTimer);
            if(xhr.status != 200) {
                notify_about('error', PbxObject.frases.error[PbxObject.lang]);
                show_content();
            };
            if(xhr.response) {
                var parsedJSON = JSON.parse(xhr.response);
                if(parsedJSON.error != undefined){
                    notify_about('error' , parsedJSON.error.message);
                    show_content();
                }
                else if(parsedJSON.result){
                    if(handler != null) {
                        handler(parsedJSON.result);
                    }
                }
            }
        }
    };

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(jsonrpc);
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

function init_page(){
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
        location.hash = 'extensions';
    
    PbxObject.lang = window.localStorage.getItem('pbxLanguage');
    get_object();
    setTimeout(function(){set_listeners();}, 1000);
}

function set_listeners(){

    addEvent(window, 'hashchange', get_object);
    $('.sidebar-toggle', '#pagecontent').click(toggle_sidebar);
    $('.options-open', '#pagecontent').click(open_options);
    $('.options-close', '#pbxoptions').click(close_options);

    $('#pbxmenu li a').click(function() {
        var parent = $(this).parent();
        var kind = $(this).attr('data-kind');
        if(kind && !parent.hasClass('active')){
            var ul = document.createElement('ul');
            ul.id = 'ul-'+kind;
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
        lang = PbxObject.lang,
        callback,
        fn;
    
    if(query.substring(query.indexOf('?')+1) === PbxObject.oid) return;
    if(query != ''){

        show_loading_panel();

        if(PbxObject.updext) clearInterval(PbxObject.updext);

        var dcont = document.getElementById('el-loaded-content');
        if(dcont) dcont.parentNode.removeChild(dcont);    

        var modal = document.getElementById('el-extension');
        if(modal) modal.parentNode.removeChild(modal);

        var oid = query;
        var props = query.indexOf('?');
        if (props != -1 ) {
            oid = query.substring(props+1);
            query = query.substring(0, props);
        }

        if(query != 'extensions' && query != 'trunk' && query != 'application' && query != 'cli' && query != 'routes' && query != 'timer'){
            query = 'bgroup';
        }
        callback = 'load_' + query;
        fn = window[callback];
//        var url = '/badmin/js/'+query+'.js';

//        $.getScript(url, function(){
            $("#dcontainer").load('/badmin/'+lang+'/'+query+'.html', function(){
                if(query == 'extensions'){
                    json_rpc_async('getExtensions', null, fn);
                }
                else {
                    json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', fn);
                }
                $('#dcontainer').scrollTop(0);
                $('.squeezed-menu > ul').children('li.active').removeClass('active').children('ul:visible').slideUp('normal');
            });
//        });
    }
}

function filter_table(event){
    var event = event || window.event;
    var text, val, row,
        input = event.target,
        tid = input.getAttribute('data-table'),
        table = document.getElementById(tid);
        val = input.value.toLowerCase();
    for(var i=1; i<table.rows.length; i++){
        row = table.rows[i];
        text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }
}

function set_page(){
    var kind = PbxObject.kind;
    if(kind != 'extensions' && kind != 'trunk' && kind != 'application' && kind != 'cli' && kind != 'routes' && kind != 'timer'){
            kind = 'bgroup';
        }
    var chk = document.getElementsByClassName('delall'),
        trow = document.getElementsByClassName('transrow'),
        clirow = document.getElementsByClassName('clirow'),
        trow = document.getElementsByClassName('routerow'),
        approw = document.getElementsByClassName('approw'),
        so = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object'),
        handler = 'set_'+kind,
        fn = window[handler];

    if(chk.length){
        for(var i=0;i<chk.length;i++){
            addEvent(chk[i], 'change', check_all_rows);
        }
    }
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
    if(trow.length){
        for(i=0;i<trow.length;i++){
            addEvent(trow[i], 'click', add_route);
        }
    }
    if(approw.length){
        for(i=0;i<approw.length;i++){
            addEvent(approw[i], 'click', add_app_row);
        }
    }
    
    if(so){
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

function toggle_sidebar(e){    

    $('#pagecontent').toggleClass('squeezed-right');
    if(!isSmallScreen())
        toggle_menu();
    
    if(e) e.preventDefault();
    
//    if(isSmallScreen()){
//        if($('#pagecontent').hasClass('squeezed-right')){
//            $('html, body').css({
//                'overflow': 'hidden',
//                'height': '100%'
//            });
//        }
//        else{
//            $('html, body').css({
//                'overflow': 'auto',
//                'height': 'auto'
//            });
//        }
//    }
}

function toggle_menu(){
    $('#pbxmenu').toggleClass('squeezed-menu');
}

function open_options(e){
    get_pbx_options();
    $(this).off('click');
    $(this).addClass('spinner');
    $('#pbxoptions').addClass('top-layer');
    if(e) e.preventDefault();
}
function close_options(e){
    $('.options-open', '#pagecontent').click(open_options);
    $('#pagecontent').removeClass('pushed-left');
    $('#el-slidemenu').removeClass('hide-menu');
    setTimeout(function(){
       $('#pbxoptions').removeClass('top-layer');
       $('#el-options-content').remove();
    }, 500);
    if(e) e.preventDefault();
}

function toggle_panel(){
    $(this).parent().toggleClass('minimized');
    var $el = this.parentNode.children[1];
    $($el).slideToggle();
}

function show_loading_panel(){
    if(document.getElementById('el-loading')) return;
    var back = document.createElement('div');
    back.id = 'el-loading';
    back.className = 'el-loading-panel ';
    var load = document.createElement('img');
    load.src = '/badmin/images/sprites_white.png';
    load.className = 'loader';
    var cont = document.getElementById('pagecontainer');
    back.appendChild(load);
    cont.appendChild(back);    
}

function show_content(){
    var loading = document.getElementById('el-loading');
    if(loading) loading.parentNode.removeChild(loading);

    if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
        $('#pagecontent').removeClass('squeezed-right');
    }

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
    var event = e || window.event;
    if(event) var targ = event.target || event.srcElement;
    if(targ && targ.nodeType == 3) {
        targ = targ.parentNode;
    }
    var table, tbody;
    if(tableid) {
        table = document.getElementById(tableid);
    } else {
        var node = targ.parentNode;
        while(node != null){
            if(node.nodeName.toLowerCase() == 'table') {
                table = document.getElementById(node.id);
                break;
            }
            node = node.parentNode;
        }
    }

    tbody = table.getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    tr.appendChild(td);
    var div = document.createElement('div');
    div.className = 'form-group';
    var cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'number');
    if(transform != null) {
        cell.setAttribute('value', transform.number);
    }
    div.appendChild(cell);
    td.appendChild(div);
    td = document.createElement('td');
    tr.appendChild(td);
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.setAttribute('type', 'checkbox');
    cell.setAttribute('name', 'strip');
    if(transform != null) {
        cell.checked = transform.strip;
    }
    td.setAttribute('align', 'center');
    div.appendChild(cell);
    td.appendChild(div);
    td = document.createElement('td');
    tr.appendChild(td);
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'prefix');
    if(transform != null) {
        cell.setAttribute('value', transform.prefix);
    }
    div.appendChild(cell);
    td.appendChild(div);
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.setAttribute('type', 'checkbox');
    cell.className = 'delall';
    addEvent(cell, 'change', function(){change_handler(table.id);});
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);

    tbody.appendChild(tr);    
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

function delete_rows(e){
    var e = e || window.event,
        targ = e.target || e.srcElement;
    if(targ && targ.nodeType == 3) {
        targ = targ.parentNode;
    }
    var table, tbody;

    var node = targ.parentNode;
    while(node != null){
        if(node.nodeName.toLowerCase() == 'table') {
            table = document.getElementById(node.id);
            break;
        }
        node = node.parentNode;
    }

    var tbody = table.getElementsByTagName('tbody')[0],
    delall = table.getElementsByClassName('delall')[0];

    var i = tbody.children.length;
    while(i--){
        var child = tbody.children[i];
        var del = child.getElementsByClassName('delall')[0];
        if(del.checked) tbody.removeChild(child);
    }

    if(delall.checked) delall.checked = false;
    change_handler(node.id);
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

function check_all_rows(e){
    var e = e || window.event;
    var targ = e.target || e.srcElement;
    if(targ.nodeType == 3) {
        targ = targ.parentNode;
    }

    var node = targ.parentNode;
    while(node != null){
        if(node.nodeName.toLowerCase() == 'table') {
            var tableid = node.id;
            break;
        }
        node = node.parentNode;
    }

    var table = document.getElementById(tableid),
        chk = table.getElementsByClassName(this.className),
        ischk = this.checked;

    for(var i=0;i<chk.length;i++){
        chk[i].checked = ischk;
    }

    change_handler(tableid);
}

function change_handler(tableid){
    var c, i, handler, cl, o = 0;

    if(tableid == 'rtable'){
        handler = add_route;
        cl = 'routerow';
    }
    else if(tableid == 'clinumbers'){
        handler = add_cli_row;
        cl = 'clirow';
    }
    else if(tableid == 'appvariables'){
        handler = add_app_row;
        cl = 'approw';
    }
    else{
        handler = append_transform;
        cl = 'transrow';
    }

    var table = document.getElementById(tableid),
        th = table.getElementsByClassName(cl)[0],
        ico = th.firstChild,
        chk = table.getElementsByClassName('delall');

    for(i=0;i<chk.length;i++){
        if(chk[i].checked) o += 1;
    }
    if(ico.className.match( /(?:^|\s)glyphicon-plus(?!\S)/g)){
        c = 'glyphicon-minus';
        removeEvent(th, 'click', handler);
        addEvent(th, 'click', delete_rows);
        th.style.color = '#d43f3a';
    }
    else{
        if(o>0) {
            return;
        }
        else {
            c = 'glyphicon-plus';
            removeEvent(th, 'click', delete_rows);
            addEvent(th, 'click', handler);
            th.style.color = '';
        }
    }
    ico.className = 'glyphicon ' + c;
}

function set_new_object(){
    var load = document.getElementById('el-loading');
    if(load) load.parentNode.removeChild(load);
    var okind = PbxObject.kind, oname = PbxObject.name, ooid = PbxObject.oid,
        ul = document.getElementById('ul-'+okind);

    location.hash = okind+'?'+ooid;
    if(ul){
        var li = document.createElement('li'),
            a = document.createElement('a'),
            rem = document.createElement('a');
        a.href = '#'+okind+'?'+ooid;
        a.innerHTML = oname;
        li.appendChild(a);
        ul.appendChild(li);
    }
    notify_about('success', oname+' '+PbxObject.frases.created[PbxObject.lang]);

}

function set_object_success(){
    var load = document.getElementById('el-loading');
    if(load) load.parentNode.removeChild(load);

    notify_about('success', PbxObject.frases.saved[PbxObject.lang]);
}

function set_options_success() {
    var i, newpath = '', parts = window.location.pathname.split('/');
    for (i = 0; i < parts.length; i++) {
        if (parts[i] === 'en' || parts[i] === 'uk' || parts[i] === 'ru') {
            parts[i] = PbxObject.lang;
        }
        newpath += '/';
        newpath += parts[i];
    }
    var newURL = window.location.protocol + "//" + window.location.host + newpath.substring(1);
    window.location.href = newURL;
}

function delete_object(e, name, kind, oid){
    e.preventDefault(); 
    var c = confirm(PbxObject.frases.doDelete[PbxObject.lang]+' '+name+'?');
    if (c){
        var ul = document.getElementById('ul-'+kind);
        if(ul){
            var li, href;
            for(var i=0;i<ul.children.length;i++){
                li = ul.children[i];
                href = li.children[0].href;
                if(href && href.substring(href.indexOf('?')+1) == oid){
                    ul.removeChild(li);
                }
            }
        }
        json_rpc('deleteObject', '\"oid\":\"'+oid+'\"');
        if(oid === PbxObject.oid) window.location.hash = 'extensions';
    }
    else{
        return false;
    }
}

function delete_extension(){
    var parent = this.parentNode.parentNode,
        ext = parent.firstChild.firstChild,
        group = parent.children[2].firstChild,
        msg,
        c;
        switch(PbxObject.lang){
            case 'en':
                msg = 'Delete '+ext.textContent+' from '+group.textContent+'?';
                break;
            case 'uk':
                msg = 'Видалити '+ext.textContent+' з '+group.textContent+'?';
                break;
            case 'ru':
                msg = 'Удалить '+ext.textContent+' из '+group.textContent+'?';
                break;
        };
    c = confirm(msg);
    if (c){
        removeEvent(ext, 'click', get_extension);
        var oid = ext.getAttribute('data-oid');
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', null);
        update_extansions();
    }
    else{
        return false;
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
        notify_about('info', PbxObject.frases.timeout[PbxObject.lang]);
    }, 30000);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4){
            clearTimeout(requestTimer);
            if(xmlhttp.status != 200) {
                notify_about('error', PbxObject.frases.error[PbxObject.lang]);
            }
            else{
                if(upload == 'uploadapp') {
                    notify_about('success' , file.name+' '+PbxObject.frases.uploaded[PbxObject.lang]);
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

function get_pbx_options(){
    var url = '/badmin/js/options.js';
    $.getScript(url, function(){
        json_rpc_async('getPbxOptions', null, load_pbx_options);
    });
}

function isSmallScreen(){
    return $(window).width() < 768;
}

function addEvent(obj, evType, fn) {
  if (obj.addEventListener) obj.addEventListener(evType, fn, false); 
  else if (obj.attachEvent) obj.attachEvent("on"+evType, fn); 
}
function removeEvent(obj, evType, fn) {
  if (obj.removeEventListener) obj.removeEventListener(evType, fn, false); 
  else if (obj.detachEvent) obj.detachEvent("on"+evType, fn); 
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_bgroup(result){
    
    switch_tab(result.kind);
    var i, cl, enabled, d = document, kind = result.kind, options = d.getElementById('options');
    PbxObject.oid = result.oid;
    PbxObject.kind = kind;
    PbxObject.name = result.name;
    if(kind == 'conference'){
        var formats = [ "OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080" ];
        PbxObject.videomax = result.maxvideomode;
    }
    enabled = document.getElementById('enabled');
    if(enabled)
        enabled.checked = result.enabled;
    fill_list_items('available', result.available);
    fill_list_items('members', result.members);

    d.getElementById('extensions').parentNode.style.display = '';
    if(kind == 'icd' || kind == 'conference'){
        if(kind == 'icd') {
            cl = 'conf-options';
        }
        else cl = 'icd-options';
        var p = options.getElementsByClassName(cl);
        i = p.length;
        while(i--){
            var col = p[i].parentNode;
            col.parentNode.removeChild(col);
        }
        var profile = d.getElementById('profile');
        profile.parentNode.removeChild(profile);
    }
    else {
        options.parentNode.removeChild(options);
    }

    if(result.name) {
        d.getElementById('objname').value = result.name;
    }
    if(result.options){
        if(kind == 'equipment'){
            var eqtype = result.options.kind || 'ipphones';
            d.getElementById(eqtype).checked = true;
            if(result.options.kind == 'gateway'){
                d.getElementById('regname').value = result.options.regname || '';
                d.getElementById('regpass').value = result.options.regpass || '';
            }
            else if(result.options.kind == 'trunk'){
                d.getElementById('username').value = result.options.regname || '';
                d.getElementById('password').value = result.options.regpass || '';
                d.getElementById('address').value = result.options.address || '';
            }
            d.getElementById('phonelines').value = result.options.phonelines || '1';
            if(result.options.starflash != undefined){
                d.getElementById('starflash').checked = result.options.starflash;
            }
        }
        else if(kind == 'unit'){
            d.getElementById("groupno1").value = result.options.groupno || '';
            d.getElementById("timeout1").value = result.options.timeout || '';
            if(result.options.huntmode)
                d.getElementById("huntmode1").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd1").checked = result.options.huntfwd;
        }
        else if(kind == 'hunting'){
            if(result.options.timeout)
                d.getElementById("timeout2").value = result.options.timeout;
            if(result.options.huntmode)
                d.getElementById("huntmode2").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd2").checked = result.options.huntfwd;
        }
        else if(kind == 'pickup'){
            d.getElementById("groupno2").value = result.options.groupno || '';
        }
        else if(kind == 'icd'){
            d.getElementById("groupno").value = result.options.groupno || '';
            d.getElementById("maxlines").value = result.options.maxlines || '';
            d.getElementById("priority").value = result.options.priority || '';
            d.getElementById("canpickup").checked = result.options.canpickup;
            d.getElementById("autologin").checked = result.options.autologin;
            d.getElementById("method").selectedIndex = result.options.method;
            d.getElementById("natimeout").value = result.options.natimeout || '';
            d.getElementById("resumetime").value = result.options.resumetime || '';
            d.getElementById("queuelen").value = result.options.queuelen || '';
            d.getElementById("maxqwait").value = result.options.maxqwait || '';
            d.getElementById("overflowredirect").value = result.options.overflowredirect || '';
            d.getElementById("overtimeredirect").value = result.options.overtimeredirect || '';
            d.getElementById("indicationmode").value = result.options.indicationmode || '';
            d.getElementById("indicationtime").value = result.options.indicationtime || '';
            
            //customizing upload element
            customize_upload('greeting', result.options.greeting);
        }
        else if(kind == 'conference'){
            //customizing upload element
            customize_upload('onhold2', null);
            customize_upload('greeting2', null);
            
            d.getElementById("dialuptt").value = result.options.dialtimeout || '';
            d.getElementById("autoredial").checked = result.options.autoredial;
            d.getElementById("confrecord").checked = result.options.recording;
            var greet = d.getElementById("playgreet");
            greet.checked = result.options.greeting;
            if(greet.checked) 
                greet.checked = result.options.greetingfile ? true : false;
                
            var modes = d.getElementById("conf-init-mode").getElementsByClassName('init-mode');
            for(i=0;i<modes.length;i++){
                if(result.options.initmode == modes[i].value){
                    modes[i].checked = true;
                }
            }
            var select = d.getElementById("videoform");
            for(i=0;i<formats.length;i++){
                var op = d.createElement('option');
                op.value = formats[i];
                op.innerHTML = formats[i];
                select.appendChild(op);
                if(formats[i] == result.options.videomode) {
                    select.selectedIndex = i;
                }
                if(formats[i] == result.options.maxvideomode) {
                    break;
                }
            }
        }
    }

    if(result.profile != undefined){
        d.getElementById('hold').checked = result.profile.hold;
        d.getElementById('forwarding').checked = result.profile.forwarding;
        d.getElementById('callpickup').checked = result.profile.callpickup;
        d.getElementById('dndover').checked = result.profile.dndover;
        d.getElementById('busyover').checked = result.profile.busyover;
        d.getElementById('monitor').checked = result.profile.monitor;
        d.getElementById('dnd').checked = result.profile.dnd;
        d.getElementById('clir').checked = result.profile.clir;
        d.getElementById('pickupdeny').checked = result.profile.pickupdeny;
        d.getElementById('busyoverdeny').checked = result.profile.busyoverdeny;
        d.getElementById('monitordeny').checked = result.profile.monitordeny;
        d.getElementById('callwaiting').checked = result.profile.callwaiting;
        d.getElementById('outcallbarring').checked = result.profile.outcallbarring;
        d.getElementById('costroutebarring').checked = result.profile.costroutebarring;
        d.getElementById('hold').checked = result.profile.hold;

        var transforms = result.profile.bnumbertransforms;
        if(transforms.length != 0){
            for(i=0; i<transforms.length; i++){
                append_transform(null, 'transforms', transforms[i]);
            }
        }
        else {
            append_transform(null, 'transforms');
        }

    }

    show_content(); 
    set_page();
}

//function set_object(){
function set_bgroup(){

    var d = document, jprms, name = d.getElementById('objname').value;
    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert('Object name must be filled');
        return false;
    }
    
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        handler = set_new_object;
    }
    var oid = PbxObject.oid;
    if(oid) jprms += '"oid":"'+oid+'",';
    var kind = PbxObject.kind;
    if(kind) jprms += '"kind":"'+kind+'",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
    var members = d.getElementById('members');
    if(members){
        jprms += '"members":[';
        for(var i=0; i<members.children.length; i++){
            jprms += '"'+members.children[i].innerHTML+'",';
        }
        jprms += '],';
    }
    var profile = d.getElementById('profile');
    if(profile){
        jprms += '"profile":{';
        if(d.getElementById("hold") != null){
            jprms += '"hold":'+d.getElementById("hold").checked+",";
        }
        if(d.getElementById("forwarding") != null){
            jprms += '"forwarding":'+d.getElementById("forwarding").checked+",";
        }
        if(d.getElementById("callpickup") != null){
            jprms += '"callpickup":'+d.getElementById("callpickup").checked+",";
        }
        if(d.getElementById("dndover") != null){
            jprms += '"dndover":'+d.getElementById("dndover").checked+",";
        }
        if(d.getElementById("busyover") != null){
            jprms += '"busyover":'+d.getElementById("busyover").checked+",";
        }
        if(d.getElementById("monitor") != null){
            jprms += '"monitor":'+d.getElementById("monitor").checked+",";
        }
        if(d.getElementById("dnd") != null){
            jprms += '"dnd":'+d.getElementById("dnd").checked+",";
        }
        if(d.getElementById("clir") != null){
            jprms += '"clir":'+d.getElementById("clir").checked+",";
        }
        if(d.getElementById("callwaiting") != null){
            jprms += '"callwaiting":'+d.getElementById("callwaiting").checked+",";
        }
        if(d.getElementById("pickupdeny") != null){
            jprms += '"pickupdeny":'+d.getElementById("pickupdeny").checked+",";
        }
        if(d.getElementById("monitordeny") != null){
            jprms += '"monitordeny":'+d.getElementById("monitordeny").checked+",";
        }
        if(d.getElementById("busyoverdeny") != null){
            jprms += '"busyoverdeny":'+d.getElementById("busyoverdeny").checked+",";
        }
        if(d.getElementById("recording") != null){
            jprms += '"recording":'+d.getElementById("recording").checked+",";
        }
        if(d.getElementById("voicemail") != null){
            jprms += '"voicemail":'+d.getElementById("voicemail").checked+",";
        }
        if(d.getElementById("outcallbarring") != null){
            jprms += '"outcallbarring":'+d.getElementById("outcallbarring").checked+",";
        }
        if(d.getElementById("costroutebarring") != null){
            jprms += '"costroutebarring":'+d.getElementById("costroutebarring").checked+",";
        }

        var table = d.getElementById('transforms').getElementsByTagName('tbody')[0];
        if(table){          
            jprms += '"bnumbertransforms":[';
            jprms += encode_transforms('transforms');
            jprms += ']';
        }
        jprms += '},';
    }
    jprms += '"options":{';
    if(kind == 'equipment'){
        if(d.getElementById("ipphones").checked){
            jprms += '"kind":"ipphones",';
        }
        else if(d.getElementById("gateway").checked){
            jprms += '"kind":"gateway",';
            jprms += '"regname":"'+d.getElementById("regname").value+'",';
            jprms += '"regpass":"'+d.getElementById("regpass").value+'",';
        }
        else if(d.getElementById("trunk").checked){
            jprms += '"kind":"trunk",';
            jprms += '"address":"'+d.getElementById("address").value+'",';
            jprms += '"regname":"'+d.getElementById("username").value+'",';
            jprms += '"regpass":"'+d.getElementById("password").value+'",';
        }
        if(d.getElementById("phonelines") != null){
            jprms += '"phonelines":'+d.getElementById("phonelines").value+',';
        }
        if(d.getElementById("starflash") != null){
            jprms += '"starflash":'+d.getElementById("starflash").checked+',';
        }
    }
    else if(kind == 'unit'){
        jprms += '"groupno":"'+d.getElementById("groupno1").value+'",';
        jprms += '"timeout":'+d.getElementById("timeout1").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode1").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd1").checked+',';
    }
    else if(kind == 'hunting'){
        jprms += '"timeout":'+d.getElementById("timeout2").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode2").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd2").checked+',';
    }
    else if(kind == 'pickup'){
        jprms += '"groupno":"'+d.getElementById("groupno2").value+'",';
    }
    else if(kind == 'icd'){
        jprms += '"groupno":"'+d.getElementById("groupno").value+'",';
        jprms += '"maxlines":'+d.getElementById("maxlines").value+',';
        jprms += '"priority":'+d.getElementById("priority").value+',';
        jprms += '"canpickup":'+d.getElementById("canpickup").checked+',';
        jprms += '"autologin":'+d.getElementById("autologin").checked+',';
        jprms += '"method":'+d.getElementById("method").value+',';
        jprms += '"natimeout":'+d.getElementById("natimeout").value+',';
        jprms += '"resumetime":'+d.getElementById("resumetime").value+',';
        jprms += '"queuelen":'+d.getElementById("queuelen").value+',';
        jprms += '"overflowredirect":"'+d.getElementById("overflowredirect").value+'",';
        jprms += '"maxqwait":'+d.getElementById("maxqwait").value+',';
        jprms += '"overtimeredirect":"'+d.getElementById("overtimeredirect").value+'",';
        jprms += '"indicationmode":'+d.getElementById("indicationmode").value+',';
        jprms += '"indicationtime":'+d.getElementById("indicationtime").value+',';
        var file = document.getElementById("greeting");
        if(file.value){
            jprms += '"greeting":"'+file.files[0].name+'",';
            upload('greeting');
        }
    }
    else if(kind == 'conference'){
        jprms += '"dialtimeout":'+d.getElementById("dialuptt").value+',';
        jprms += '"autoredial":'+d.getElementById("autoredial").checked+',';
        jprms += '"recording":'+d.getElementById("confrecord").checked+',';
        jprms += '"videomode":"'+d.getElementById("videoform").value+'",';
        var greet = d.getElementById("playgreet");
        jprms += '"greeting\":'+greet.checked+',';
        file = document.getElementById("greeting2");
        if(greet.checked && file.value){
            jprms += '"greetingfile":"'+file.files[0].name+'",';
            upload('greeting2');
        }
        var modes = d.getElementById("conf-init-mode").getElementsByClassName('init-mode');
        for(i=0;i<modes.length;i++){
            if(modes[i].checked) {
                jprms += '"initmode":'+modes[i].value+',';
                if(modes[i].value == 2) {
                    file = document.getElementById("onhold2");
                    if(file.value){
                        jprms += '"onholdfile":"'+file.files[0].name+'",';
                        upload('onhold2');
                    }
                }
            }
        }
    }
    jprms += '}';
    json_rpc_async('setObject', jprms, handler); 
}

function fill_list_items(listid, items){
    if(listid == 'available' || (PbxObject.kind != 'hunting' && PbxObject.kind != 'icd' && PbxObject.kind != 'unit')) {
        items.sort();
    }
    var list = document.getElementById(listid);
    for(var i=0; i<items.length; i++){
        var item = document.createElement('li');
        addEvent(item, 'click', move_list_item);
        item.setAttribute('data-value', items[i]);
        item.innerHTML = items[i];
        list.appendChild(item);
    }
}

function move_list_item(){
    var li = this;
    var parent = li.parentNode;
    if(parent.id == 'available'){
        parent.removeChild(li);
        document.getElementById('members').appendChild(li);
    }
    else{
        parent.removeChild(li);
        document.getElementById('available').appendChild(li);
    }
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_application(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;    
    if(result.name){
        document.getElementById('objname').value = result.name;
    }
    if(result.enabled)
        document.getElementById('enabled').checked = result.enabled;
    if(result.debug)
        document.getElementById('debug').checked = result.debug;
    if(result.status)
        document.getElementById('status').innerHTML = result.status;
    if(result.dbconnection){
        var db = result.dbconnection;
        if(db.driver == 'sun.jdbc.odbc.JdbcOdbcDriver'){
            document.getElementById('odbc').checked = true;
            if(db.url)
                document.getElementById('odbcurl').value = db.url;
        }
        else if(db.driver){
            document.getElementById('jdbc').checked = true;
            document.getElementById('jdbcdriver').value = db.driver;
            if(db.url)
                document.getElementById('jdbcurl').value = db.url;
        }
        if(db.schema)
            document.getElementById('dbowner').value = db.schema;
        if(db.username)
            document.getElementById('dbuser').value = db.username;
        if(db.password)
            document.getElementById('dbpass').value = db.password;
    }
    
    var vars = result.parameters;
    if(vars.length){
        for(var i=0; i<vars.length; i++){
            add_app_row(vars[i]);
        }
    }
    else{
        add_app_row();
    }
    
    show_content();
    set_page();
}

//function set_object(){
function set_application(){
    show_loading_panel();
    
    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    var jprms = '\"name\":\"'+document.getElementById('objname').value+'\",';
    jprms += '"enabled":'+document.getElementById('enabled').checked+',';
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    
    var tbody = document.getElementById('appvariables').getElementsByTagName('tbody')[0];
    jprms += '\"parameters\":[';
    var i, j;
    for(i=0; i<tbody.children.length; i++){
        var tr = tbody.children[i];
        var inputs = tr.getElementsByTagName('input');
        var str = '';
        for(j=0;j<inputs.length;j++){
            if(inputs[j].name == 'variable'){
                str += '"key":"'+inputs[j].value+'",';
            }
            else if(inputs[j].name == 'value') {
                str += '"value":"'+inputs[j].value+'",';
            }
            else 
                continue;
        }
        if(str != '') {
            jprms += '{'+str+'},';
        }
    }
    jprms += '],';
    jprms += '"debug":'+document.getElementById('debug').checked+',';
    jprms += '"dbconnection":{';
    var driver, url;
    if(document.getElementById('odbc').checked){
        driver = 'sun.jdbc.odbc.JdbcOdbcDriver';
        url = document.getElementById('odbcurl').value;
    }
    else{
        driver = document.getElementById('jdbcdriver').value;
        url = document.getElementById('jdbcurl').value;
    }
    jprms += '"driver":"'+driver+'",';
    jprms += '"url":"'+url+'",';
    
    if(document.getElementById('dbowner'))
        jprms += '"schema":"'+document.getElementById('dbowner').value+'",';
    if(document.getElementById('dbuser'))
        jprms += '"username":"'+document.getElementById('dbuser').value+'",';
    if(document.getElementById('dbpass'))
        jprms += '"password":"'+document.getElementById('dbpass').value+'",';
    jprms += '},';
    
    json_rpc_async('setObject', jprms, set_object_success);
}

function add_app_row(object){
    
    var table = document.getElementById('appvariables').getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');
    
    var td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    var cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'variable');
    cell.setAttribute('disabled', 'disabled');
    if(object && object.key) cell.value = object.key;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    td = document.createElement('td');
    div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('name', 'value');
    if(object && object.value) cell.value = object.value;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    table.appendChild(tr);
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_cli(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    PbxObject.kind = 'cli';
    if(result.name) {
        document.getElementById('objname').value = result.name;
    }
    
    document.getElementById('enabled').checked = result.enabled;
    
    var transforms = result.bnumbertransforms;
    if(transforms.length) {
        for(var i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    }
    else { 
        append_transform(null, 'transforms1');
    }
    
    var numbers = result.numbers;
    if(numbers.length){
        for(i=0; i<numbers.length; i++){
            add_cli_row(numbers[i]);
        }
    }
    else{
        add_cli_row();
    }

    show_content();
    set_page();
}

//function set_object(){
function set_cli(){
        
    var name = document.getElementById('objname').value;
    if(name)
        var jprms = '\"name\":\"'+name+'\",';
    else{
        alert('Object name must be filled');
        return false;
    }
        
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        handler = set_new_object;
    }
    
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    jprms += '\"kind\":\"cligroup\",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
    
    jprms += '\"bnumbertransforms\":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    
    jprms += '\"numbers\":[';
    var i, tbody = document.getElementById('clinumbers').getElementsByTagName('tbody')[0];
    for(i=0; i<tbody.children.length; i++){
        var tr = tbody.children[i];
        var str = '';
        
        var inp = tr.getElementsByTagName('input')[0];
        if(inp && inp.name == 'number') {
            str += '"number":"'+inp.value+'",';
        }
        var ta = tr.getElementsByTagName('textarea')[0];
        if(ta && ta.name == 'description') {
            str += '"description":"'+ta.value+'",';
        }
        
        if(str != '') {
            jprms += '{'+str+'},';
        }
    }
    jprms += ']';
        
    json_rpc_async('setObject', jprms, handler);     
}

function add_cli_row(object){
    
    var table = document.getElementById('clinumbers').getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');
    
    var td = document.createElement('td');
    var div = document.createElement('div');
//    div.className = 'col-xs-4';
    div.className = 'form-group';
    var cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'number');
    if(object && object.number) cell.value = object.number;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    td = document.createElement('td');
    div = document.createElement('div');
//    div.className = 'col-xs-6';
    div.className = 'form-group';
    cell = document.createElement('textarea');
    cell.className = 'form-control y-resizable';
    cell.setAttribute('rows', '3');
//    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'description');
    if(object && object.description) cell.value = object.description;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    td = document.createElement('td');
    div = document.createElement('div');
    div.className = 'form-group';
//    div.className = 'col-xs-2';
    cell = document.createElement('input');
    cell.setAttribute('type', 'checkbox');
    cell.className = 'delall';
    addEvent(cell, 'change', function(){change_handler('clinumbers');});
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result) {
function load_extensions(result) {
    var row, cell, a, button, state, lrow, status,
        table = document.getElementById('extensions').getElementsByTagName('tbody')[0];
    for(var i=0; i<result.length; i++){
        
        lrow = table.rows.length;
        row = table.insertRow(lrow);
        row.setAttribute('data-ext', result[i].ext);
        
        state = result[i].state;
        if(state == 0){
            status = 'Registered';
            row.className = 'success';
        }
        else if(state == 3){
            status = 'Connected';
            row.className = 'connected';
        }
        else if(state == 6){
            status = 'Forwarding';
            row.className = 'warning';
        }
        else if(state == 5){
            status = '';
            row.className = '';
        }
        else if(state == 4){
            status = 'Do not disturb';
            row.className = 'danger';
        }
        else if(state == 1 || state == 2){
            status = state == 1 ? 'Dialing' : 'Ringing';
            row.className = 'info';
        }
        else{
            status = '';
            row.className = 'active';
        }
        
        cell = row.insertCell(0);
        a = document.createElement('a');
        if(result[i].oid){
            a.href = '#';
            a.setAttribute('data-oid', result[i].oid);
            addEvent(a, 'click', get_extension);
        }
        
        a.innerHTML = result[i].ext;
        cell.appendChild(a);
        
        cell = row.insertCell(1);
        cell.innerHTML = result[i].name || "";
        
        cell = row.insertCell(2);
        cell.innerHTML = result[i].group;
        
        cell = row.insertCell(3);
        cell.innerHTML = result[i].reg;
        cell = row.insertCell(4);
        cell.innerHTML = result[i].kind;
        cell = row.insertCell(5);
        if(status) cell.innerHTML = status;
        
        cell = row.insertCell(6);
        button = document.createElement('button');
        button.className = 'btn btn-danger btn-sm';
        button.innerHTML = '<i class="glyphicon glyphicon-trash"></i>';
        if(state == -1){
            button.setAttribute('disabled', 'true');
        }
        else{
            addEvent(button, 'click', delete_extension);
        }
        
        cell.appendChild(button);
    }
        
    var ref = document.getElementById('extrefresh');
    ref.onclick = function(){
        update_extansions();
    };
    var rep = document.getElementById('extrepeat');
    rep.onclick = function(){
        set_update_interval();
    };
    var inputs = document.getElementsByClassName('el-search');
    if(inputs.length){
        for(i=0;i<inputs.length;i++){
            inputs[i].oninput = function(){
                filter_table();
            };
        }
    }
    
    var $modal = $('#el-extension');
    $($modal).insertBefore('#pagecontainer');
    
    show_content();

}

function get_extension(event){
    var event = event || window.event;
    var oid = this.getAttribute('data-oid');
    
    if(oid){
        show_loading_panel();
        json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', load_extension);
    }
    event.preventDefault();
}

function load_extension(result){
    var d = document,
        groupid = result.groupid,
        kind = result.kind == 'user' ? 'users':'unit';
    PbxObject.kind = kind;
    PbxObject.oid = result.oid;
    
    
    document.getElementById('el-extension-num').innerHTML = 'Extension '+result.number;
    
    var select = document.getElementById("extgroup");
    for(var i=0;i<=select.options.length;i++){
        select.remove(select.selectedIndex[i]);
    }
    
    if(groupid){
        select.disabled = false;
        fill_group_choice(kind, groupid);
    }
    else {
        select.disabled = true;
    }
    if(kind == 'users'){
        d.getElementById('followme').disabled = false;
        d.getElementById('followme').value = result.followme;
        
    }
    else{
        d.getElementById('followme').disabled = true;
        d.getElementById('followme').value = '';
    }
    d.getElementById('extname').value = result.name;
    d.getElementById('extpin').value = result.pin;
    d.getElementById('extlogin').value = result.login;
    d.getElementById('extpassword').value = result.password;
    d.getElementById('extdisplay').value = result.display;
    if(result.features){
        d.getElementById('extfeatures').style.display = '';
        if(result.features.fwdall != undefined){
            d.getElementById('forwarding').style.display = '';
            d.getElementById('fwdall').checked = result.features.fwdall;
            d.getElementById('fwdallnumber').value = result.features.fwdallnumber;
            d.getElementById('fwdnreg').checked = result.features.fwdnreg;
            d.getElementById('fwdnregnumber').value = result.features.fwdnregnumber;
            d.getElementById('fwdbusy').checked = result.features.fwdbusy;
            d.getElementById('fwdbusynumber').value = result.features.fwdbusynumber;
            d.getElementById('fwdnans').checked = result.features.fwdnans;
            d.getElementById('fwdnansnumber').value = result.features.fwdnansnumber;
            d.getElementById('fwdtimeout').value = result.features.fwdtimeout;
        }
        else{
            d.getElementById('forwarding').style.display = 'none';
        }
        
        if(result.features.dnd != undefined){
            d.getElementById('dnd').checked = result.features.dnd;
        }
        else{
            d.getElementById('dnd').setAttribute('disabled','');
            d.getElementById('dnd').checked = false;
        }
        if(result.features.clir != undefined){
            d.getElementById('clir').checked = result.features.clir; 
        }
        else{
            d.getElementById('clir').setAttribute('disabled','');
            d.getElementById('clir').checked = false; 
        }
        if(result.features.callwaiting != undefined){
            d.getElementById('callwaiting').checked = result.features.callwaiting;
        }
        else{
            d.getElementById('callwaiting').setAttribute('disabled','');
            d.getElementById('callwaiting').checked = false;
        }
        if(result.features.pickupdeny != undefined){
            d.getElementById('pickupdeny').checked = result.features.pickupdeny;
        }
        else{
            d.getElementById('pickupdeny').setAttribute('disabled','');
            d.getElementById('pickupdeny').checked = false;
        }
        if(result.features.monitordeny != undefined){
            d.getElementById('monitordeny').checked = result.features.monitordeny;
        }
        else{
            d.getElementById('monitordeny').setAttribute('disabled','');
            d.getElementById('monitordeny').checked = false;
        }
        if(result.features.busyoverdeny != undefined){
            d.getElementById('busyoverdeny').checked = result.features.busyoverdeny;
        }
        else{
            d.getElementById('busyoverdeny').setAttribute('disabled','');
            d.getElementById('busyoverdeny').checked = false;
        }
        if(result.features.voicemail != undefined){
            d.getElementById('voicemail').checked = result.features.voicemail;
        }
        else{
            d.getElementById('voicemail').setAttribute('disabled','');
            d.getElementById('voicemail').checked = false;
        }
        if(result.features.recording != undefined){
            d.getElementById('recording').checked = result.features.recording;
        }
        else{
            d.getElementById('recording').setAttribute('disabled','');
            d.getElementById('recording').checked = false;
        }
        if(result.features.lock != undefined){
            d.getElementById('plock').checked = result.features.lock;
        }
        else{
            d.getElementById('plock').setAttribute('disabled','');
            d.getElementById('plock').checked = false;
        }
    }
    else {
        d.getElementById('extfeatures').style.display = 'none';
    }
    
    $('#el-extension').modal();
    show_content();
    
    d.getElementById('el-set-object').onclick = function(){
        set_extension();
    };
//    addEvent(so, 'click', function(oid){
//        return function(event){set_extension(event, oid)};
//    }(result.oid));
}

function set_extension(event){
    var event = event || window.event;
    event.preventDefault();
    var d = document,
        oid = PbxObject.oid,
        kind = PbxObject.kind;
    
    var jprms = '\"oid\":\"'+oid+'\",';
    var group = d.getElementById("extgroup");
    if(group.options.length) var groupv = group.options[group.selectedIndex].value;
    
    if(groupv)
        jprms += '\"groupid\":\"'+groupv+'\",';
    if(kind == 'users'){
        jprms += '\"followme\":\"'+d.getElementById("followme").value+'\",';
    }
    jprms += '\"name\":\"'+d.getElementById("extname").value+'\",';
    jprms += '\"display\":\"'+d.getElementById("extdisplay").value+'\",';
    jprms += '\"login\":\"'+d.getElementById("extlogin").value+'\",';
    jprms += '\"password\":\"'+d.getElementById("extpassword").value+'\",';
    jprms += '\"pin\":\"'+d.getElementById("extpin").value+'\",';
    jprms += '\"features\":{';
    if(d.getElementById("fwdall") != null){
        jprms += '\"fwdall\":'+d.getElementById("fwdall").checked+',';
        jprms += '\"fwdallnumber\":\"'+d.getElementById("fwdallnumber").value+'\",';
    }
    if(d.getElementById("fwdnregnumber") != null){   
        jprms += '\"fwdnreg\":'+d.getElementById("fwdnreg").checked+',';
        jprms += '\"fwdnregnumber\":\"'+d.getElementById("fwdnregnumber").value+'\",';
    }
    if(d.getElementById("fwdbusynumber") != null){
        jprms += '\"fwdbusy\":'+d.getElementById("fwdbusy").checked+',';
        jprms += '\"fwdbusynumber\":\"'+d.getElementById("fwdbusynumber").value+'\",';
    }
    if(d.getElementById("fwdnansnumber") != null){
        jprms += '\"fwdnans\":'+d.getElementById("fwdnans").checked+',';
        jprms += '\"fwdnansnumber\":\"'+d.getElementById("fwdnansnumber").value+'\",';
    }  
    if(d.getElementById("fwdtimeout") != null)    
        jprms += '\"fwdtimeout\":'+d.getElementById("fwdtimeout").value+',';
    if(d.getElementById("plock").disabled == false)    
        jprms += '\"lock\":'+d.getElementById("plock").checked+',';
    if(d.getElementById("dnd").disabled == false)    
        jprms += '\"dnd\":'+d.getElementById("dnd").checked+',';
    if(d.getElementById("clir").disabled == false)    
        jprms += '\"clir\":'+d.getElementById("clir").checked+',';
    if(d.getElementById("callwaiting").disabled == false)
        jprms += '\"callwaiting\":'+d.getElementById("callwaiting").checked+',';
    if(d.getElementById("pickupdeny").disabled == false)    
        jprms += '\"pickupdeny\":'+d.getElementById("pickupdeny").checked+',';
    if(d.getElementById("monitordeny").disabled == false)    
        jprms += '\"monitordeny\":'+d.getElementById("monitordeny").checked+',';
    if(d.getElementById("busyoverdeny").disabled == false)    
        jprms += '\"busyoverdeny\":'+d.getElementById("busyoverdeny").checked+',';
    if(d.getElementById("recording").disabled == false)    
        jprms += '\"recording\":'+d.getElementById("recording").checked+',';
    if(d.getElementById("voicemail").disabled == false)    
        jprms += '\"voicemail\":'+d.getElementById("voicemail").checked+',';
    jprms += '}';  

    json_rpc('setObject', jprms); 
    
    $('#el-extension').modal('hide');
    
    update_extansions();
}

function fill_group_choice(kind, groupid){ 
    var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
    var gid, option, i;
    var select = document.getElementById("extgroup");

    for(i=0; i<result.length; i++){
        gid = result[i].oid;
        option = document.createElement('option');
        option.setAttribute('value', gid);
        if(gid == groupid) {
            option.selected = "true";
        }
        option.innerHTML = result[i].name;
        select.appendChild(option);
    }
}

function update_extansions(event){
    var event = event || window.event;
    $('#extrefresh').addClass('spinner');
    json_rpc_async('getExtensions', null, update_extansions_);
    if(event) event.preventDefault();
}
function set_update_interval(event){
    var event = event || window.event;
    var button = document.getElementById('extrepeat');
    if(PbxObject.updext){
        clearInterval(PbxObject.updext);
        PbxObject.updext = false;
        if(button) button.className = '';
    }
    else{
        PbxObject.updext = setInterval(function(){update_extansions();}, 5000);
        if(button) button.className = 'nav-active';
    }
    event.preventDefault();
}

function update_extansions_(result){
    var obj, state, row, cells, status,
        table = document.getElementById('extensions');
        if(table) {
            var tbody = table.getElementsByTagName('tbody')[0],
                trows = tbody.rows;
        }
        else 
            return;
    for(var i=0;i<result.length;i++){
        obj = result[i];
        state = obj.state;
        for(var j=0;j<trows.length;j++){
            row = trows[j];
            cells = row.cells;
            if(obj.ext == row.getAttribute('data-ext')){
                if(state == 0){
                    status = 'Registered';
                    row.className = 'success';
                }
                else if(state == 3){
                    status = 'Connected';
                    row.className = 'connected';
                }
                else if(state == 6){
                    status = 'Forwarding';
                    row.className = 'warning';
                }
                else if(state == 5){
                    status = '';
                    row.className = '';
                }
                else if(state == 4){
                    status = 'Do not disturb';
                    row.className = 'danger';
                }
                else if(state == 1 || state == 2){
                    status = state == 1 ? 'Dialing' : 'Ringing';
                    row.className = 'info';
                }
                else{
                    status = '';
                    row.className = 'active';
                }
                if(cells[1].innerHTML != obj.name) {
                    cells[1].innerHTML = obj.name || "";
                }
                if(cells[2].innerHTML != obj.group) {
                    cells[2].innerHTML = obj.group;
                }
                if(cells[3].innerHTML != obj.reg) {
                    cells[3].innerHTML = obj.reg;
                }
                if(cells[4].innerHTML != obj.kind) {
                    cells[4].innerHTML = obj.kind;
                }
                if(cells[5].innerHTML != status) {
                    cells[5].innerHTML = status;
                }
                if(state == -1 && !cells[6].children[0].getAttribute('disabled')){
                    cells[6].children[0].setAttribute('disabled', 'disabled');
                }
                else if(state != -1 && cells[6].children[0].getAttribute('disabled')){
                    cells[6].children[0].removeAttribute('disabled');
                }
            }
        }
    }
    $('#extrefresh').removeClass('spinner');
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_routes(result){
    PbxObject.oid = result.oid;
    PbxObject.kind = 'routes';
    PbxObject.routepriorities = [
        "Max. prefix length",
        "Least cost routing",
        "Load balancing",
        "Answer seizure ratio",
        "Average call duration",
        "Most idle gateway",
        "Least utilised gateway",
        "Max. priority (status)"    
    ];
    PbxObject.name = result.name;
    if(result.name) {
        document.getElementById('objname').value = result.name;
    }
    
    document.getElementById('enabled').checked = result.enabled;
    
    var i, 
        ul = document.getElementById('priorities'),
        priorities = result.priorities;
    for(i=0; i<priorities.length; i++){
        var li = document.createElement('li');
        li.setAttribute('data-value', priorities[i]);
        li.innerHTML = PbxObject.routepriorities[priorities[i]];
        ul.appendChild(li);
    }

    var transforms = result.anumbertransforms;
    if(transforms.length) {
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    }
    else { 
        append_transform(null, 'transforms1');
    }

    transforms = result.bnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms2', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms2');
    }
    
    if(result.routes != undefined){
        build_routes_table(result.routes);
    }
    else{
        show_content();
    }
    set_page();
}

//function set_object(){
function set_routes(){
        
    var name = document.getElementById('objname').value;
    if(name)
        var jprms = '\"name\":\"'+name+'\",';
    else{
        alert('Object name must be filled');
        return false;
    }
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        handler = set_new_object;
    }
    
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    jprms += '\"kind\":\"routes\",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
 
    jprms += '\"priorities\":[';
    var ul = document.getElementById('priorities');
    var i, j;
    for(i=0; i<ul.children.length; i++){
        jprms += ul.children[i].getAttribute('data-value')+',';
    }
    
    jprms += '],';
    jprms += '\"anumbertransforms\":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '\"bnumbertransforms\":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    
    jprms += '\"routes\":[';
    var str, name, row, els, inp, table = document.getElementById('rtable'); 
    for(i=1; i<table.rows.length; i++){
        row = table.rows[i];
        els = row.getElementsByClassName('form-group');
        str = '';
        for(j=0; j<els.length; j++){
            inp = els[j].firstChild;
            name = inp.getAttribute('name');
            if(name == 'number'){
                if(inp.value)
                    str += '"number":"'+inp.value+'",';
                else
                    break;
            }
            else if(name == 'description'){
                str += '"description":"'+inp.value+'",';
            }
            else if(name == 'target'){
                str += '"target":{"oid":"'+inp.value+'"},';
            }
            else if(name == 'priority'){
                str += '"priority":'+inp.value+',';
            }
            else if(name == 'cost'){
                str += '"cost":'+inp.value+',';
            }
        }
        if(str != '') jprms += '{'+str+'},';
    }
    jprms += ']';
    
    json_rpc_async('setObject', jprms, handler);     
}

function build_routes_table(routes){
    var result = json_rpc('getObjects', '\"kind\":\"all\"');
    var tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];
    for(var i=0; i<routes.length; i++){
        tbody.appendChild(build_route_row(routes[i], result));
    }
    tbody.appendChild(build_route_row(null, result));
    
    show_content();
}

function add_route(){
    var result = json_rpc('getObjects', '\"kind\":\"all\"');
    var tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];
    tbody.appendChild(build_route_row(null, result));
}

function build_route_row(route, objects){
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    var cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'number');
    cell.setAttribute('size', '12');
    if(route != null) {
        cell.setAttribute('value', route.number);
    }
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'description');
    if(route != null) {
        cell.setAttribute('value', route.description);
    }
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('select');
    cell.setAttribute('name', 'target');
    var i;
    for(i=0; i<objects.length; i++){
        var kind = objects[i].kind;
        if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'routes' || kind == 'users' || kind == 'pickup') {
            continue;
        }
        var oid = objects[i].oid;
        var option = document.createElement('option');
        option.setAttribute('value', oid);
        if(route != null && oid == route.target.oid){
            option.setAttribute('selected', '');
        }
        option.innerHTML = objects[i].name;
        cell.appendChild(option);
    }
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('select');
    cell.setAttribute('name', 'priority');
    for(i=0; i<10; i++){
        var option = document.createElement('option');
        option.setAttribute('value', i);
        if(route != null && i == route.priority){
            option.setAttribute('selected', '');
        }
        if(i == 0) {
            option.innerHTML = 'OFF';
        }
        else if(i == 9) {
            option.innerHTML = 'EXV';
        }
        else option.innerHTML = i;
        cell.appendChild(option);        
    }
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'cost');
    cell.setAttribute('size', '4');
    cell.setAttribute('value', route != null ? route.cost : '0');
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);

    if(route != null && route.huntstop != undefined){
        td = document.createElement('td');
        cell = document.createElement('input');
        cell.setAttribute('type', 'checkbox');
        cell.setAttribute('name', 'huntstop');
        if(route.huntstop) cell.setAttribute('checked', route.huntstop);
        td.appendChild(cell);
        tr.appendChild(td);
    }
    
    td = document.createElement('td');
    cell = document.createElement('input');
    cell.setAttribute('type', 'checkbox');
    cell.className = 'delall';
    addEvent(cell, 'change', function(){change_handler('rtable');});
    td.setAttribute('align', 'center');
    td.appendChild(cell);
    tr.appendChild(td);
        
    return tr;
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_timer(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    PbxObject.kind = 'timer';
    
    if(result.name){
        document.getElementById('objname').value = result.name;
    }
    document.getElementById('enabled').checked = result.enabled;
    var i;
    var hours = document.getElementById('hh');
    for(i=0;i<24;i++){
        var opt = document.createElement('option');
        if(i<10)
            var value = '0'+i;
        else
            value = i;
        opt.value = value;
        opt.innerHTML = value;
        hours.appendChild(opt);
        if(value == result.hour) {
            hours.selectedIndex = i;
        }
    }
    var minutes = document.getElementById('mm');
    for(i=0;i<=55;i+=5){
        var opt = document.createElement('option');
        if(i<10)
            var value = '0'+i;
        else
            value = i;
        opt.value = value;
        opt.innerHTML = value;
        minutes.appendChild(opt);
        if(value == result.minute) {
            minutes.selectedIndex = i/5;
        }
    }
    for(i=0; i<result.weekdays.length; i++){
        document.getElementById('d'+result.weekdays[i]).checked = true;
    }
    
    fill_timer_targets('objects');
    
    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    for(i=0; i < result.targets.length; i++){
        targets.appendChild(timer_target_row(result.targets[i].oid, result.targets[i].name, result.targets[i].action));
    }
    
    show_content();
    set_page();

    var add = document.getElementById('add-timer-target');
    add.onclick = function(){
        add_timer_target();
    };
    
    var everyd = document.getElementById('timer-everyday');
    addEvent(everyd, 'click', check_days);
    var workd = document.getElementById('timer-workdays');
    addEvent(workd, 'click', check_days);
    var holid = document.getElementById('timer-holidays');
    addEvent(holid, 'click', check_days);
    
}

//function set_object(){
function set_timer(){
        
    var jprms, name = document.getElementById('objname').value;
    if(name)
        jprms = '\"name\":\"'+name+'\",';
    else{
        alert('Object name must be filled');
        return false;
    }
    
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        handler = set_new_object;
    }
    
    if(PbxObject.oid != null) {
        jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    }
    jprms += '\"kind\":\"timer\",';
    var enabled = document.getElementById('enabled');
    if(enabled != null) {
        jprms += '\"enabled\":'+enabled.checked+',';
    }
    var h = document.getElementById('hh');
    var m = document.getElementById('mm');
    jprms += '\"hour\":\"'+h.options[h.selectedIndex].value+'\",';
    jprms += '\"minute\":\"'+m.options[m.selectedIndex].value+'\",';

    jprms += '\"weekdays\":[';
    var i;
    for(i=0; i<7; i++){
        if(document.getElementById('d'+i).checked){
            jprms += i+',';
        }
    }
    jprms += '],';

    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    
    jprms += '\"targets\":[';
    for(i=0; i < targets.children.length; i++){
        var tr = targets.children[i];
        if(tr.id != undefined && tr.id != ''){
            jprms += '{\"oid\":\"'+targets.children[i].id+'\",\"action\":\"'+tr.children[1].innerHTML+'\"},';
        }
    }
    jprms += ']';
    
    json_rpc_async('setObject', jprms, handler); 
}

function timer_target_row(oid, name, action){
    var tr = document.createElement('tr');
    tr.id = oid;
    var td = document.createElement('td');
    var a = document.createElement('a');
    a.href = '#';
    a.onclick = function(e){
        get_object_link(oid);
        e.preventDefault();
    };
    a.innerHTML = name;
    td.appendChild(a);
    tr.appendChild(td);
    td = document.createElement('td');
    td.innerHTML = action;
    tr.appendChild(td);
    td = document.createElement('td');
    var button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = 'Del';
    button.onclick = function(){
        remove_listener(oid);
    };
    td.appendChild(button);
    tr.appendChild(td);
    return tr;
}

function add_timer_target() {
    var table = document.getElementsByTagName('tbody')[0];
    var select = document.getElementById('objects');
    var action = document.getElementById('actions');
    var opt = select.options[select.selectedIndex];
    table.appendChild(timer_target_row(opt.value, opt.innerHTML, action.value));
}

function remove_listener(oid){
    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    var i;
    for(i=0; i < targets.children.length; i++){
        if(targets.children[i].id == oid){
            targets.removeChild(targets.children[i]);
        }
    }    
}

function fill_timer_targets(id){
    var objects = document.getElementById(id);
    var result = json_rpc('getObjects', '\"kind\":\"all\"');
    for(var i=0; i<result.length; i++){
        var kind = result[i].kind;
        if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'users') {
            continue;
        }
        var oid = result[i].oid;
        var option = document.createElement('option');
        option.value = oid;
        option.innerHTML = result[i].name;
        objects.appendChild(option);
    }
}

function check_days(){
    var i, day, id = this.id;

    for(i=0;i<7;i++){
        day = document.getElementById('d'+i);
        if((id === 'timer-workdays' && (i===5 || i===6)) || (id === 'timer-holidays' && i<5)){
            if(day.checked) day.checked = false;
            continue;
        }
        day.checked = true;
    }
}

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//function load_object(result){
function load_trunk(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    PbxObject.kind = 'trunk';
    
    if(result.name)
        document.getElementById('objname').value = result.name;
    document.getElementById('enabled').checked = result.enabled;
    if(result.status)
        document.getElementById('status').innerHTML = result.status;
    if(result.protocol)
        document.getElementById('protocol').value = result.protocol;
    if(result.domain)
        document.getElementById('domain').value = result.domain;
    document.getElementById('register').checked = result.register;
    if(result.user)
        document.getElementById('user').value = result.user;
    if(result.auth)
        document.getElementById('auth').value = result.auth;
    if(result.pass)
        document.getElementById('pass').value = result.pass;
    document.getElementById('regexpires').value = result.regexpires || 60;
    
    var radio = document.getElementById('proxy');
    addEvent(radio, 'change', function(){
        var inputs = document.getElementsByName(this.id);
        if(this.checked) var disabled = false;
        else disabled = true;
        for(var i=0;i<inputs.length;i++){
            inputs[i].disabled = disabled;
        }
    });
    radio.checked = result.proxy;
    if(result.paddr)
        document.getElementById('paddr').value = result.paddr;
    if(result.pauth)
        document.getElementById('pauth').value = result.pauth;
    if(result.ppass)
        document.getElementById('ppass').value = result.ppass;
    if(result.maxinbounds != undefined){
        document.getElementById('maxinbounds').value = result.maxinbounds;
        document.getElementById('inmode').checked = result.maxinbounds > 0;
    }
    if(result.maxoutbounds != undefined){
        document.getElementById('maxoutbounds').value = result.maxoutbounds;
        document.getElementById('outmode').checked = result.maxoutbounds > 0;
    }
    if(result.parameters != undefined){
        var codecs = result.parameters.codecs;       
        if(codecs != undefined){
            var c;
            for(var i=0; i<codecs.length; i++){
                c = document.getElementById('c'+i);    
                if(!c) break;
                c.value = codecs[i].codec;
                document.getElementById('f'+i).value = codecs[i].frame;
            }
        }
        else{
            for(i=0; i<4; i++){
                document.getElementById('c'+i).selectedIndex = 0;
                document.getElementById('f'+i).value = 0;
            }
        }
        if(result.parameters.t1) document.getElementById('t1').value = result.parameters.t1 || 5;
        if(result.parameters.t2) document.getElementById('t2').value = result.parameters.t2 || 15;
        if(result.parameters.t3) document.getElementById('t3').value = result.parameters.t3 || 5;
        if(result.parameters.t38fax) document.getElementById('t38fax').checked = result.parameters.t38fax;
        if(result.parameters.video) document.getElementById('video').checked = result.parameters.video;
        if(result.parameters.dtmfrelay) document.getElementById('dtmfrelay').checked = result.parameters.dtmfrelay;
        if(result.parameters.earlymedia) document.getElementById('earlymedia').checked = result.parameters.earlymedia;
        if(result.protocol == 'h323'){
            document.getElementById('sip').parentNode.style.display = 'none';
            if(result.parameters.dtmfmode) document.getElementById('dtmfh323').value = result.parameters.dtmfmode;
            if(result.parameters.faststart) document.getElementById('faststart').checked = result.parameters.faststart;
            if(result.parameters.h245tunneling) document.getElementById('h245tunneling').checked = result.parameters.h245tunneling;
            if(result.parameters.playringback) document.getElementById('playringback').checked = result.parameters.playringback;
        }
        else{
            document.getElementById('h323').parentNode.style.display = 'none';  
            if(result.parameters.dtmfmode) document.getElementById('dtmfsip').value = result.parameters.dtmfmode;
        }
    }

    var transforms = result.inboundanumbertransforms;
    if(transforms.length) {
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    }
    else { 
        append_transform(null, 'transforms1');
    }

    transforms = result.inboundbnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms2', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms2');
    }

    transforms = result.outboundanumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms3', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms3');
    }
    transforms = result.outboundbnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms4', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms4');
    }
    
    var proto = document.getElementById('protocol');
    proto.onchange = change_protocol;

    show_content();
    set_page();
    
}

function set_trunk(){
    var name = document.getElementById('objname').value;
    var jprms;
    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert('Object name must be filled');
        return false;
    }
    
    show_loading_panel();

    var handler;
    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        handler = set_new_object;
    }
    
    jprms += '"kind":"trunk",';
    jprms += '"enabled":'+document.getElementById('enabled').checked+',';

    var protocol = document.getElementById('protocol').value;
    jprms += '"protocol":"'+protocol+'",';
    jprms += '"domain":"'+document.getElementById('domain').value+'",';
    jprms += '"register":'+document.getElementById('register').checked+',';
    jprms += '"user":"'+document.getElementById('user').value+'",';
    jprms += '"auth":"'+document.getElementById('auth').value+'",';
    jprms += '"pass":"'+document.getElementById('pass').value+'",';
    jprms += '"proxy":'+document.getElementById('proxy').checked+',';
    jprms += '"paddr":"'+document.getElementById('paddr').value+'",';
    jprms += '"pauth":"'+document.getElementById('pauth').value+'",';
    jprms += '"ppass":"'+document.getElementById('ppass').value+'",';

    if(document.getElementById('inmode').checked)
        jprms += '"maxinbounds":'+document.getElementById('maxinbounds').value+',';
    else
        jprms += '"maxinbounds":0,';
    if(document.getElementById('outmode').checked)
        jprms += '"maxoutbounds":'+document.getElementById('maxoutbounds').value+',';
    else
        jprms += '"maxoutbounds":0,';

    jprms += '"parameters":{';
    if(document.getElementById('codecs')){
        jprms += '"codecs":[';
        for(var i=0; i<4; i++){
            if(document.getElementById('c'+i).selectedIndex == 0) break;
            jprms += '{"codec":"'+document.getElementById('c'+i).value+'",';
            jprms += '"frame":'+document.getElementById('f'+i).value+'},';
        }
        jprms += '],';
    }
    if(document.getElementById('t1'))
        jprms += '"t1":'+document.getElementById('t1').value+',';
    if(document.getElementById('t2'))
        jprms += '"t2":'+document.getElementById('t2').value+',';
    if(document.getElementById('t3'))
        jprms += '"t3":'+document.getElementById('t3').value+',';
    if(document.getElementById('regexpires'))
        jprms += '"regexpires":'+document.getElementById('regexpires').value+',';
    if(document.getElementById('t38fax'))
        jprms += '"t38fax":'+document.getElementById('t38fax').checked+',';
    if(document.getElementById('video'))
        jprms += '"video":'+document.getElementById('video').checked+',';
    if(document.getElementById('earlymedia'))
        jprms += '"earlymedia":'+document.getElementById('earlymedia').checked+',';
    if(document.getElementById('dtmfrelay'))
        jprms += '"dtmfrelay":'+document.getElementById('dtmfrelay').checked+',';
    if(protocol == 'h323'){
        jprms += '"dtmfmode":"'+document.getElementById('dtmfh323').value+'",';
        jprms += '"faststart":'+document.getElementById('faststart').checked+',';
        jprms += '"h245tunneling":'+document.getElementById('h245tunneling').checked+',';
        jprms += '"playringback":'+document.getElementById('playringback').checked+',';
    }
    else{
        jprms += '"dtmfmode":"'+document.getElementById('dtmfsip').value+'",';
    }
    jprms += '},';
    jprms += '"inboundbnumbertransforms":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '"inboundanumbertransforms":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    jprms += '"outboundbnumbertransforms":[';
    jprms += encode_transforms('transforms3');
    jprms += '],';
    jprms += '"outboundanumbertransforms":[';
    jprms += encode_transforms('transforms4');
    jprms += ']';

    json_rpc_async('setObject', jprms, handler); 
};

function change_protocol(){
    var value = this.value;
    if(value == 'h323') {
        document.getElementById('sip').parentNode.style.display = 'none';
        document.getElementById('h323').parentNode.style.display = '';
    }
    else {
        document.getElementById('sip').parentNode.style.display = '';
        document.getElementById('h323').parentNode.style.display = 'none';
    }
};
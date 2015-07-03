function getDeviceSettings(event){
    var e = event || window.event;
    if(e) e.preventDefault();
    if(PbxObject.deviceSettings) {
        switch_options_tab('deviceopt-tab');
    } else {
        json_rpc_async('getDeviceSettings', null, loadDeviceSettings);
        // if(e) show_loading_panel(e.target);
    }
}
function loadDeviceSettings(result){
    // console.log(result);
    PbxObject.deviceSettings = result;
    var data = {
        data: result,
        lang: PbxObject.frases
    };
    var template = document.getElementById('device-options');
    var rendered = Mustache.render(template.innerHTML, data);
    document.getElementById('deviceopt-tab').insertAdjacentHTML('beforeend', rendered);
    template.parentNode.removeChild(template);

    var codecsTables = [], codecsTable;
    if(result.sip){
        document.getElementById('sip-log').value = result.sip.log || 0;
        codecsTable = document.getElementById('sip-codecs').querySelector('tbody');
        buildCodecsTable(codecsTable, result.sip.codecs, result.avcodecs);
        codecsTables.push(codecsTable);
    }
    if(result.sips){
        document.getElementById('sips-log').value = result.sips.log || 0;
        codecsTable = document.getElementById('sips-codecs').querySelector('tbody');
        buildCodecsTable(codecsTable, result.sips.codecs, result.avcodecs);
        codecsTables.push(codecsTable);
    }
    if(result.wss){
        document.getElementById('wss-log').value = result.wss.log || 0;
        codecsTable = document.getElementById('wss-codecs').querySelector('tbody');
        buildCodecsTable(codecsTable, result.wss.codecs, result.avcodecs);
        codecsTables.push(codecsTable);
    }
    if(result.http)
        document.getElementById('http-log').value = result.http.log || 0;
    if(result.system)
        document.getElementById('rec-format').value = result.system.recformat || 'PCM 8 Khz 16 bit';

    setAccordion();

    codecsTables.forEach(function(table){
        new Sortable(table);
    });
    // show_content();
    // switch_options_tab('deviceopt-tab');
}

function load_pbx_options(result) {
    // console.log(result);
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

    // options = document.getElementById('pbxoptions');

    so = document.getElementById('el-set-options');
    so.onclick = set_pbx_options;

    // toggle_presentation();
    if(result.branchid){
        var deviceTab = document.getElementById('deviceopt-tab');
        var deviceBtn = document.getElementById('deviceopt-btn');
        
        if(deviceTab) deviceTab.parentNode.removeChild(deviceTab);
        if(deviceBtn) deviceBtn.parentNode.removeChild(deviceBtn);
        setAccordion();
    } else {
        getDeviceSettings();
    }
}

function set_pbx_options(e) {

    var e = e || window.event;
    if(e) e.preventDefault();

    if(!PbxObject.options.branchid)
        setDeviceSettings();

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
    if (pass) jprms += '"adminpass":"' + pass + '", ';

    jprms += '\"options\":{';
    var file = document.getElementById("musonhold");
    if (file.value) {
        jprms += '"holdmusicfile":"' + file.files[0].name + '", ';
        upload('musonhold');
    }
    if (document.getElementById('holdreminterv').value) jprms += '"holdremindtime":' + document.getElementById('holdreminterv').value + ', ';
    if (document.getElementById('holdrectime').value) jprms += '"holdrecalltime":' + document.getElementById('holdrectime').value + ', ';
    if (document.getElementById('transrectime').value) jprms += '"transferrecalltime":' + document.getElementById('transrectime').value + ', ';
    if (document.getElementById('transrecdest').value) jprms += '"transferrecallnumber":"' + document.getElementById('transrecdest').value + '", ';
    jprms += '"autoretrive":' + document.getElementById('autoretrieve').checked + ', ';
    if (document.getElementById('parkrectime').value) jprms += '"parkrecalltime":' + document.getElementById('parkrectime').value + ', ';
    if (document.getElementById('parkrecdest').value) jprms += '"parkrecallnumber":"' + document.getElementById('parkrecdest').value + '", ';
    if (document.getElementById('discontime').value) jprms += '"parkdroptimeout":' + document.getElementById('discontime').value;
    jprms += '}';

    if (lang !== PbxObject.language) {
        PbxObject.language = lang;
        window.localStorage.setItem('pbxLanguage', lang);
        handler = set_options_success;
    }
    else {
        handler = set_object_success;
    }

    // console.log(jprms);
    json_rpc_async('setPbxOptions', jprms, handler);
}

function setDeviceSettings(){
    var jprms = '';
    var codecsTable;
    
    jprms += '\"sip\":{';
    if(document.getElementById('sip-port').value) jprms += '"port":' + document.getElementById('sip-port').value + ', ';
    if(document.getElementById('sip-log').value) jprms += '"log":' + document.getElementById('sip-log').value + ', ';
    if(document.getElementById('sip-enabled').value) jprms += '"enabled":' + document.getElementById('sip-enabled').checked + ', ';
    codecsTable = document.getElementById('sip-codecs').querySelector('tbody');
    jprms += '\"codecs\":'+ JSON.stringify(getCodecsString(codecsTable));
    jprms += '},';
    jprms += '\"sips\":{';
    if(document.getElementById('sips-port').value) jprms += '"port":' + document.getElementById('sips-port').value + ', ';
    if(document.getElementById('sips-log').value) jprms += '"log":' + document.getElementById('sips-log').value + ', ';
    if(document.getElementById('sips-enabled').value) jprms += '"enabled":' + document.getElementById('sips-enabled').checked + ', ';
    codecsTable = document.getElementById('sips-codecs').querySelector('tbody');
    jprms += '\"codecs\":'+ JSON.stringify(getCodecsString(codecsTable));
    jprms += '},';
    jprms += '\"wss\":{';
    if(document.getElementById('wss-port').value) jprms += '"port":' + document.getElementById('wss-port').value + ', ';
    if(document.getElementById('wss-log').value) jprms += '"log":' + document.getElementById('wss-log').value + ', ';
    if(document.getElementById('wss-enabled').value) jprms += '"enabled":' + document.getElementById('wss-enabled').checked + ', ';
    codecsTable = document.getElementById('wss-codecs').querySelector('tbody');
    jprms += '\"codecs\":'+ JSON.stringify(getCodecsString(codecsTable));
    jprms += '},';
    jprms += '\"http\":{';
    if(document.getElementById('http-port').value) jprms += '"port":' + document.getElementById('http-port').value + ', ';
    if(document.getElementById('http-log').value) jprms += '"log":' + document.getElementById('http-log').value + ', ';
    if(document.getElementById('http-ssl').value) jprms += '"ssl":' + document.getElementById('http-ssl').checked + ', ';
    jprms += '},';
    jprms += '\"nat\":{';
    if(document.getElementById('stun').value) jprms += '"stun":"' + document.getElementById('stun').value + '", ';
    if(document.getElementById('router').value) jprms += '"router":"' + document.getElementById('router').value + '", ';
    if(document.getElementById('rtpfirst').value) jprms += '"rtpfirst":' + document.getElementById('rtpfirst').value + ', ';
    if(document.getElementById('rtplast').value) jprms += '"rtplast":' + document.getElementById('rtplast').value + ', ';
    jprms += '},';
    jprms += '\"registrar\":{';
    if(document.getElementById('minexpires').value) jprms += '"minexpires":' + document.getElementById('minexpires').value + ', ';
    if(document.getElementById('maxexpires').value) jprms += '"maxexpires":' + document.getElementById('maxexpires').value + ', ';
    jprms += '},';
    jprms += '\"net\":{';
    if(document.getElementById('tcptimeout').value) jprms += '"tcptimeout":' + document.getElementById('tcptimeout').value + ', ';
    if(document.getElementById('rtptimeout').value) jprms += '"rtptimeout":' + document.getElementById('rtptimeout').value + ', ';
    if(document.getElementById('iptos').value) jprms += '"iptos":' + document.getElementById('iptos').value + ', ';
    jprms += '},';
    jprms += '\"system\":{';
    if(document.getElementById('config-name').value) jprms += '"config":"' + document.getElementById('config-name').value + '", ';
    if(document.getElementById('backup-path').value) jprms += '"backup":"' + document.getElementById('backup-path').value + '", ';
    if(document.getElementById('rec-path').value) jprms += '"store":"' + document.getElementById('rec-path').value + '", ';
    if(document.getElementById('rec-format').value) jprms += '"recformat":"' + document.getElementById('rec-format').value + '", ';
    jprms += '},';

    // console.log(jprms);
    json_rpc_async('setDeviceSettings', jprms, null);
}
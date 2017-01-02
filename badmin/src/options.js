function poolArrayToString(array){
    var str = '';
    array.forEach(function(obj, indx, array){
        if(indx > 0) str += ',';
        str += obj.firstnumber;
        if(obj.poolsize > 1) str += ('-' + (obj.firstnumber+obj.poolsize-1));
    });
    return str;
}

function poolStringToObject(string){

    var extensions = [];

    string
    .split(',')
    .map(function(str){
        return str.split('-');
    })
    .forEach(function(array){
        extensions.push({
            firstnumber: parseInt(array[0]),
            poolsize: parseInt(array[1] ? (array[1] - array[0]+1) : 1)
        });
    });
    return extensions;
}

function getDeviceSettings(){
    // var e = event || window.event;
    // if(e) e.preventDefault();
    // if(PbxObject.deviceSettings) {
    //     switch_options_tab('deviceopt-tab');
    // } else {
        json_rpc_async('getDeviceSettings', null, loadDeviceSettings);
        // if(e) show_loading_panel(e.target);
    // }
}

function loadDeviceSettings(result){
    console.log('loadDeviceSettings: ', result);
    PbxObject.deviceSettings = result;
    var data = {
        data: result,
        frases: PbxObject.frases
    };
    var template = document.getElementById('device-options');
    var rendered = Mustache.render(template.innerHTML, data);
    document.getElementById('device-options-cont').insertAdjacentHTML('afterbegin', rendered);
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
    if(result.system){
        document.getElementById('rec-format').value = result.system.recformat || 'PCM 8 Khz 16 bit';
        if(result.system.smdr){
            document.getElementById('smdr-host').value = result.system.smdr.host;
        }
    }

    setAccordion('#device-options-cont');

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
    // document.getElementById('firstnumber').value = result.firstnumber || '';

    var firstnumber = document.getElementById('firstnumber');
    if(result.extensions){
        firstnumber.value = poolArrayToString(result.extensions);
    } else {
        firstnumber.value = '';
    }

    // if(result.firstnumber && result.firstnumber){
    //     //counting last number in pbx numbering pool
    //     var lastnumber = result.firstnumber+(result.poolsize-1);
    //     document.getElementById('lastnumber').value = lastnumber;
    // }

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
    if(result.mode === 1 || !result.prefix){
        getDeviceSettings();
    }
    else {
        var deviceTab = document.getElementById('deviceopt-tab');
        var deviceBtn = document.getElementById('deviceopt-btn');
        
        if(deviceTab) deviceTab.parentNode.removeChild(deviceTab);
        if(deviceBtn) deviceBtn.parentNode.removeChild(deviceBtn);
        // setAccordion();
    }

    // set LDAP options
    loadAdvancedOptions({
        ldap: result.ldap || {}
    } || {});

    setAccordion('#featureopt-tab');
    if(result.services) setServices(result.services);
    else PbxObject.options.services = [];
}

// function loadLdapOptions(opts){
function loadAdvancedOptions(opts){
    console.log('Advanced options: ', opts);

    function isCustomPhoneAttr(val){
        var regex = new RegExp('telephoneNumber|mobile|ipPhone');
        return !regex.test(val);
    }

    var data = {
        data: opts,
        frases: PbxObject.frases
    },
    template = document.getElementById('ldap-settings'),
    rendered = Mustache.render(template.innerHTML, data);

    document.getElementById('services-options-cont').insertAdjacentHTML('afterbegin', rendered);
    template.parentNode.removeChild(template);

    $('#directoryAttributePhone').on('change', function(e) {
        switchVisibility('#customDirectoryAttributePhone', isCustomPhoneAttr(this.value));
    })
    $('#directoryAuth').on('change', function(e) {
        switchVisibility('#gssapi-settings', this.value === 'GSSAPI');    
    });
    switchVisibility('#gssapi-settings', opts.ldap.directoryAuth === 'GSSAPI');

    // setAccordion('#advanced-options-cont');

    // If settings wasn't set - return 
    if(!opts.ldap.directoryServer) return;

    $('#directoryAttributeUID').val(opts.ldap.directoryAttributeUID);
    if(isCustomPhoneAttr(opts.ldap.directoryAttributePhone)) {
        $('#directoryAttributePhone').val('0');
        $('#customDirectoryAttributePhone').show();
    } else {
        $('#directoryAttributePhone').val(opts.ldap.directoryAttributePhone);
    }

    $('#directoryAuth').val(opts.ldap.directoryAuth);

}

function set_pbx_options(e) {

    var e = e || window.event;
    if(e) e.preventDefault();

    if(PbxObject.options.mode === 1 || !PbxObject.options.prefix)
        setDeviceSettings();

    var jprms = '',
        handler,
        pass = document.getElementById('adminpass').value,
        confpass = document.getElementById('confirmpass').value,
        select = document.getElementById('interfacelang'),
        firstnumber = document.getElementById('firstnumber'),
        lastnumber = document.getElementById('lastnumber'),
        lang = select.options[select.selectedIndex].value,
        ldapOptions = getLdapOptions();

    // if (firstnumber && firstnumber.value) {
    //     var fvalue = firstnumber.value;
    //     if(lastnumber){
    //         var lvalue = lastnumber.value;
    //         if(!lvalue){
    //             alert(PbxObject.frases.OPTS__POOL_UNSPECIFIED);
    //             return;
    //         }
    //         if(parseInt(lvalue) < parseInt(fvalue)){
    //             lvalue = firstnumber.value;
    //             fvalue = lastnumber.value;

    //         }

    //         //calculation numbering pool size
    //         var poolsize = lvalue - fvalue;
    //         if(poolsize === 0){
    //             alert(PbxObject.frases.OPTS__POOL_ZERO);
    //             return;
    //         } else {
    //             poolsize += 1;
    //         }

    //         if(PbxObject.options.firstnumber !== parseInt(fvalue) || PbxObject.options.poolsize !== parseInt(poolsize)){
    //             var conf = confirm(PbxObject.frases.OPTS__POOL_CHANGE);
    //             if(conf == true){
    //                 jprms += '"firstnumber":' + fvalue + ', ';
    //                 jprms += '"poolsize":' + poolsize + ', ';
    //             } else{
    //                 return;
    //             }
    //         }
    //     }
    // }

    if(firstnumber && firstnumber.value){
        var extensions = poolStringToObject(firstnumber.value);
        jprms += '"extensions":' + (JSON.stringify(extensions)) + ', ';
    } else {
        alert(PbxObject.frases.OPTS__POOL_UNSPECIFIED);
        return;
    }

    if (pass && pass !== confpass) {
        if(!confpass){
            alert(PbxObject.frases.OPTS__PWD_CONF_EMPTY);
            return false;
        } else if(confpass && confpass !== pass){
            alert(PbxObject.frases.OPTS__PWD_UNMATCH);
            return false;
        }
    }
    else{
        show_loading_panel();
    }

    jprms += '"lang":"' + lang + '", ';
    if (pass) jprms += '"adminpass":"' + pass + '", ';

    if(ldapOptions) jprms += '\"ldap\":' + JSON.stringify(ldapOptions) + ', ';
    if(PbxObject.options.services) {
        var forms = [].slice.call(document.querySelectorAll('#externalServices form')),
        serviceObj = {},
        services = forms.map(retrieveFormData).map(function(item){
            serviceObj = {};
            Object.keys(item).forEach(function(key){
                serviceObj.props = serviceObj.props || {};
                if(key.indexOf('prop_') !== -1) {
                    serviceObj.props[key.replace('prop_', '')] = item[key] || "";
                } else {
                    serviceObj[key] = item[key] !== undefined ? item[key] : "";
                }
            });
            return serviceObj;
        });

        console.log('Saved services: ', services);
        jprms += '\"services\":' + JSON.stringify(services) + ', ';
    }

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
        PbxObject.options.ldap = ldapOptions;
    }

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
    if(document.getElementById('stun')) jprms += '"stun":"' + ( document.getElementById('stun').value || "" ) + '", ';
    if(document.getElementById('router')) jprms += '"router":"' + ( document.getElementById('router').value || "" ) + '", ';
    if(document.getElementById('rtpfirst') && document.getElementById('rtpfirst').value) jprms += '"rtpfirst":' + document.getElementById('rtpfirst').value + ', ';
    if(document.getElementById('rtplast') && document.getElementById('rtplast').value) jprms += '"rtplast":' + document.getElementById('rtplast').value + ', ';
    jprms += '},';
    jprms += '\"registrar\":{';
    if(document.getElementById('minexpires') && document.getElementById('minexpires').value) jprms += '"minexpires":' + document.getElementById('minexpires').value + ', ';
    if(document.getElementById('maxexpires') && document.getElementById('maxexpires').value) jprms += '"maxexpires":' + document.getElementById('maxexpires').value + ', ';
    jprms += '},';
    jprms += '\"net\":{';
    if(document.getElementById('tcptimeout') && document.getElementById('tcptimeout').value) jprms += '"tcptimeout":' + document.getElementById('tcptimeout').value + ', ';
    if(document.getElementById('rtptimeout') && document.getElementById('rtptimeout').value) jprms += '"rtptimeout":' + document.getElementById('rtptimeout').value + ', ';
    if(document.getElementById('iptos') && document.getElementById('iptos').value) jprms += '"iptos":' + document.getElementById('iptos').value + ', ';
    jprms += '},';
    jprms += '\"system\":{';
    if(document.getElementById('config-name')) jprms += '"config":"' + ( document.getElementById('config-name').value || "" ) + '", ';
    if(document.getElementById('backup-path')) jprms += '"backup":"' + ( document.getElementById('backup-path').value || "" ) + '", ';
    if(document.getElementById('rec-path')) jprms += '"store":"' + ( document.getElementById('rec-path').value || "" ) + '", ';
    if(document.getElementById('rec-format')) jprms += '"recformat":"' + ( document.getElementById('rec-format').value || "" ) + '", ';
    jprms += '\"smtp\":{';
    if(document.getElementById('smtp-host').value) jprms += '"host":"' + ( document.getElementById('smtp-host').value || "" ) + '", ';
    if(document.getElementById('smtp-port').value) jprms += '"port":"' + ( document.getElementById('smtp-port').value || "" ) + '", ';
    if(document.getElementById('smtp-username').value) jprms += '"username":"' + ( document.getElementById('smtp-username').value || "" ) + '", ';
    if(document.getElementById('smtp-password').value) jprms += '"password":"' + ( document.getElementById('smtp-password').value || "" ) + '", ';
    if(document.getElementById('smtp-from')) jprms += '"from":"' + ( document.getElementById('smtp-from').value || "" ) + '", ';
    jprms += '},';
    jprms += '\"smdr\":{';
    if(document.getElementById('smdr-port') && document.getElementById('smdr-port').value) jprms += '"port":' + document.getElementById('smdr-port').value + ', ';
    if(document.getElementById('smdr-host') && document.getElementById('smdr-host').value) jprms += '"host":"' + document.getElementById('smdr-host').value + '", ';
    if(document.getElementById('smdr-enabled') && document.getElementById('smdr-enabled').value) jprms += '"state":' + document.getElementById('smdr-enabled').checked + ', ';
    jprms += '},';
    jprms += '},';

    // console.log(jprms);
    json_rpc_async('setDeviceSettings', jprms, null);
}

function getLdapOptions(){
    var ldapForm = document.querySelector('#ldap-tab form'),
        data = null;
    if(ldapForm) {
        data = retrieveFormData(ldapForm);
        if(!data.directoryAttributePhone === '0') data.directoryAttributePhone = $('#customDirectoryAttributePhone').val();
        if(data.directoryAuth !== 'GSSAPI') {
            delete data.directoryKDC;
            delete data.directoryAdminServer;
        }
    }
    console.log('setLdapOptions: ', data);
    return data;
}

function setServices(services){
    
    // convert services props into array of keys and values
    services.forEach(function(service){
        if(service.props && Object.keys.length) {
            service.props = Object.keys(service.props).map(function(key) {
                return { name: key.replace('_', ' '), key: key, value: service.props[key] };
            });
        } else {
            service.props = [];
        }
    });
        
    var tmpParams = {
        services: services,
        frases: PbxObject.frases
    },
    cont = document.querySelector('#services-options-cont'),
    render;

    console.log('Services: ', services);

    getPartial('services', function(template){
        rendered = Mustache.render(template, tmpParams);
        cont.insertAdjacentHTML('beforeend', rendered);

        setAccordion('#services-options-cont');
    });
}


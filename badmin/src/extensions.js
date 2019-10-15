function load_extensions(result) {
    var data = filterObject(result, ['user', 'phone']);

    function init(data){
        var componentParams = {
            frases: PbxObject.frases,
            data: data,
            getExtension: getExtension,
            deleteExtension: (PbxObject.isUserAccount ? (checkPermissions('users', 15) ? deleteExtension : null) : deleteExtension),
        };

        ReactDOM.render(ExtensionsComponent(componentParams), document.getElementById('el-loaded-content'));
    }

    init(data);
    set_page();
    show_content();

}

function getExtensions(filter, callback) {
    var cb = null;
    json_rpc_async('getExtensions', null, function(result) {
        if(typeof filter !== 'function') {
            cb = callback;
            cb(filterObject(result, filter));
        } else {
            cb = filter;
            cb(result);
        }
    });
    
    
}

function updateExtensionRow(event, data){

    // console.log('updateExtensionRow: ', data);

    var row = document.getElementById(data.oid);
    var state = data.state;
    var info = getInfoFromState(state, data.group);

    if(row) {
        var cells = row.cells,
            status = info.rstatus,
            className = info.rclass,
            cell;

        // row.className = className;

        if(data.name){
            cell = row.querySelector('[data-cell="name"]');
            if(cell) cell.innerHTML = data.name;
            // cells[1].innerHTML = data.name;
        }
        // if(data.display){
        //     cell = row.querySelector('[data-cell="display"]');
        //     if(cell) cell.innerHTML = data.display;
        //     // cells[1].innerHTML = data.name;
        // }
        if(data.hasOwnProperty('group')){
            cell = row.querySelector('[data-cell="group"]');
            if(cell) cell.innerHTML = data.group;
            // cells[2].innerHTML = data.group;
        }
        // else{
        //     cells[2].innerHTML = "";   
        // }
        if(data.hasOwnProperty('reg')){
            cell = row.querySelector('[data-cell="reg"]');
            if(cell) cell.innerHTML = data.reg;
            // cells[3].innerHTML = data.reg;
        }
        // else{
        //     cells[3].innerHTML = "";
        // }
        cell = row.querySelector('[data-cell="status"]');
        if(cell) cell.innerHTML = '<span class="label label-'+info.className+'">'+status+'</span>';
        // cells[5].innerHTML = status;
    }

    updateObjects(PbxObject.extensions, data, 'ext');

}

function getExtension(oid) {
    show_loading_panel();

    var params = {};
    var defaultPerms = [
        { name: 'statistics', grant: 0 },
        { name: 'records', grant: 0 },
        { name: 'customers', grant: 0 },
        { name: 'users', grant: 0 },
        { name: 'equipment', grant: 0 },
        { name: 'channels', grant: 0 }
    ];
    var modalCont = document.getElementById('modal-cont');

    function setPermissions(list) {
        if(!list || !list.length) return defaultPerms;
        return list.filter(function(item) {
            return item.name.match('^(statistics|records|customers|users|equipment|channels)$');
        });
    }

    if(modalCont) {
        modalCont.parentNode.removeChild(modalCont);
    }

    modalCont = document.createElement('div');
    modalCont.id = "modal-cont";
    document.body.appendChild(modalCont);

    getObject(oid, function(result) {
        
        show_content();

        params = extend(params, result);
        params.permissions = PbxObject.isUserAccount ? null : setPermissions(result.permissions);

        ReactDOM.render(ExtensionModalComponent({
            frases: PbxObject.frases,
            params: params,
            onSubmit: (PbxObject.isUserAccount ? (checkPermissions('users', 3) ? setExtension : null) : setExtension),
            generatePassword: generatePassword,
            convertBytes: convertBytes,
            getObjects: getObjects
        }), modalCont);
    });
}

function setExtension(params, callback) {
    show_loading_panel();

    var permissions = params.params.permissions;

    function extendPermissions(list) {
        return list.reduce(function(result, item) {
            result = result.concat([item]);
            if(item.name === 'users') result = result.concat([{ name: 'user', grant: item.grant }]);
            else if(item.name === 'equipment') result = result.concat([{ name: 'unit', grant: item.grant }, { name: 'phone', grant: item.grant }]);
            else if(item.name === 'channels') result = result.concat([{ name: 'chattrunk', grant: item.grant }, { name: 'chatchannel', grant: item.grant }, { name: 'hunting', grant: item.grant }, { name: 'icd', grant: item.grant }]);
            return result;
        }, []);
    }

    if(permissions) params.params.permissions = extendPermissions(permissions);

    setObject(params.params, function(result, err) {
        if(!err) {
            set_object_success();
            if(callback) callback();
        }
    });

    if(params.file) uploadFile(params.file, '/$AVATAR$?userid='+params.params.userid);
}

function get_extension(e){
    var e = e || window.event;
    if(e.type == 'click')
        e.preventDefault();

    var oid = getClosest(e.target, 'tr').id;

    if(oid){
        getExtension(oid);
        
        // show_loading_panel();

        // if(!PbxObject.templates.extension){
        //     $.get('/badmin/views/extension.html', function(template){
        //         PbxObject.templates = PbxObject.templates || {};
        //         PbxObject.templates.extension = template;
        //         json_rpc_async('getObject', {oid: oid}, load_extension);
        //     });
        // } else {
        //     json_rpc_async('getObject', {oid: oid}, load_extension);
        // }
    }
}

function load_extension(result){
    // console.log(result);

    PbxObject.extOid = result.oid;
    PbxObject.userid = result.userid;
    PbxObject.vars = PbxObject.vars || {};
    PbxObject.vars.infoShown = false;

    var d = document;
    var cont = document.getElementById('ext-cont');
    var groupid = result.groupid;
    var kind = result.kind == 'user' ? 'users':'unit';
    var rendered;

    if(kind === 'users') {

        result.isUser = true;

        result.storelimit = result.storelimit ? convertBytes(result.storelimit, 'Byte', 'GB').toFixed(2) : 0;
        result.storesize = result.storesize ? convertBytes(result.storesize, 'Byte', 'GB').toFixed(2) : 0;
        result.storefree = (result.storelimit - result.storesize).toFixed(2);
        // if(result.storesize) result.storesize = convertBytes(result.storesize, 'Byte', 'GB').toFixed(2);
        // if(result.storelimit) {
        //     result.storelimit = convertBytes(result.storelimit, 'Byte', 'GB').toFixed(2);
        // } else {
        //     storelimitCont.style.display = 'none';
        // }
    }

    if(getInstanceMode() !== 1) {
        result.domain = window.location.hostname;
    }

    rendered = Mustache.render(PbxObject.templates.extension, {
        data: result,
        frases: PbxObject.frases
    });

    if(!cont){
        cont = document.createElement('div');
        cont.id = 'ext-cont';
        $('#pagecontainer').prepend(cont);
    }
    
    // $('#dcontainer').prepend(cont);
    // document.getElementById('dcontainer').appendChild(cont);
    // $("#ext-cont").html(rendered);
    $(cont).html(rendered);

    var connServicesEl = document.querySelector('.user-connected-services');
    var storelimitCont = document.getElementById('ext-storelimit-cont');
    // var storeLimitTrigger = document.getElementById('ext-trigger-storelimit');
    var state = document.querySelector('#el-extension .user-state-ind');
    var img = document.getElementById('user-avatar');
    var src = "/$AVATAR$?userid="+result.userid;

    img.onerror = function(){
        this.src = 'images/avatar.png';
    }
    img.src = src;

    state.classList.add(getInfoFromState(result.state).rclass);

    // if(storeLimitTrigger) {
    //     addEvent(storeLimitTrigger, 'change', function(){
    //         storelimitCont.style.display = this.checked ? 'block' : 'none';
    //     });
    // }

    if(kind !== 'users') {
        var storageUsage = document.querySelector('#el-extension .user-storage-usage');
        if(storageUsage) storageUsage.classList.add('hidden');

        if(storelimitCont) storelimitCont.classList.add('hidden');
    } else {
        var pinCont = document.getElementById('pin-cont');
        if(pinCont) pinCont.classList.add('hidden');

        // storeLimitTrigger.checked = !!result.storelimit;
        storelimitCont.style.display = 'block';
    }

    // getAvatar(result.userid, function(binary){
    //     var img = document.getElementById('user-avatar');
    //     img.src = "data:image/jpeg;base64," + b64EncodeUnicode(binary);
    //     console.log(img);
    // });

    switch_presentation(kind, document.getElementById('ext-features'));
    if(kind === 'users'){
        fill_group_choice(kind, groupid);
    } else {
        document.getElementById("extgroup-cont").classList.add('hidden');
    }

    var fwdnreg = d.getElementById('ext-fwdnreg');
    var fwdnregnumber = d.getElementById('ext-fwdnregnumber');
    // if(kind === 'users'){
    //     // d.getElementById('fwdall-cont').classList.add('hidden');
    //     fwdnreg.checked = result.features.fwdall;
    //     fwdnregnumber.value = result.features.fwdallnumber;
    // } else {
        fwdnreg.checked = result.features.fwdnreg;
        fwdnregnumber.value = result.features.fwdnregnumber;
    // }
    
    var tabs = document.getElementById('ext-tabs');
    if(result.features){
        if(result.features.fwdall == undefined){
            tabs.querySelector('li a[href="#ext-forwarding"]').parentNode.className = 'hidden';
        }
        // if(result.features.dnd == undefined){
        //     d.getElementById('ext-dnd').setAttribute('disabled','');
        // }
        if(result.features.recording == undefined){
            d.getElementById('ext-recording').setAttribute('disabled','');
        }
        if(result.features.callwaiting == undefined){
            d.getElementById('ext-callwaiting').setAttribute('disabled','');
        }
        if(result.features.pickupdeny == undefined){
            d.getElementById('ext-pickupdeny').setAttribute('disabled','');
        }
        if(result.features.monitordeny == undefined){
            d.getElementById('ext-monitordeny').setAttribute('disabled','');
        }
        if(result.features.busyoverdeny == undefined){
            d.getElementById('ext-busyoverdeny').setAttribute('disabled','');
        }
        if(result.features.voicemail == undefined){
            d.getElementById('ext-voicemail').setAttribute('disabled','');
        }
        if(result.features.lock == undefined){
            d.getElementById('ext-plock').setAttribute('disabled','');
        }
    }
    // d.getElementById('extpassword').value = result.password || '';
    d.getElementById('el-set-extension').onclick = function(){
        set_extension(kind);
    };
    d.getElementById('showUserInfo').onclick = function(e){
        if(e) e.preventDefault();
        getUserInfo(result.userid);
    };

    if(result.services) {
        result.services.forEach(function(item) {
            connServicesEl.insertAdjacentHTML('beforeend', '<img src="/badmin/images/services/'+item+'.png" alt="'+item+'" title="'+PbxObject.frases.CONNECTED_TO+' '+item+'" />')
        })
    }

    show_content();
    $('#el-extension [data-toggle="popover"]').popover({
        placement: 'top',
        trigger: 'focus'
    });
    $('#el-extension [data-toggle="tooltip"]').tooltip();
    $('#el-extension').modal();

    $('#el-extension').on('hidden.bs.modal', function (e) {
        $('#el-extension [data-toggle="popover"]').popover('destroy');
        PbxObject.vars.infoShown = false;
    });


}

function set_extension(kind){
    // var e = e || window.event;
    // if(e.type == 'click') e.preventDefault();
    var d = document,
    oid = PbxObject.extOid;
        // kind = PbxObject.kind;

    var jprms = '\"oid\":\"'+oid+'\",';
    var group = d.getElementById("extgroup");
    var login = d.getElementById("extlogin").textContent;
    var password = d.getElementById("extpassword").value;
    // var storeLimitTrigger = document.getElementById('ext-trigger-storelimit');
    var storelimit = d.getElementById('extstorelimit');

    // if(!storeLimitTrigger.checked) storelimit.value = 0;

    if(group.options.length) var groupv = group.options[group.selectedIndex].value;
    
    if(groupv){
        jprms += '\"groupid\":\"'+groupv+'\",';
    } else {
        jprms += '\"groupid\":\"'+PbxObject.oid+'\",';
    }
    // if(kind == 'users'){
    //     jprms += '\"followme\":\"'+d.getElementById("followme").value+'\",';
    // }
    jprms += '\"name\":\"'+d.getElementById("extname").value+'\",';
    // jprms += '\"display\":\"'+d.getElementById("extdisplay").value+'\",';
    if(login) jprms += '\"login\":\"'+login+'\",';
    if(password) jprms += '\"password\":\"'+password+'\",';
    if(d.getElementById("extpin").value) jprms += '\"pin\":'+d.getElementById("extpin").value+',';
    if(storelimit) {
        storelimit = convertBytes(storelimit.value, 'GB', 'Byte').toFixed();
        if(storelimit >= 0) jprms += '\"storelimit\":'+storelimit+',';
    }
    jprms += '\"features\":{';

    if(d.getElementById("ext-fwdall") != null){
        jprms += '\"fwdall\":'+d.getElementById("ext-fwdall").checked+',';
        jprms += '\"fwdallnumber\":\"'+d.getElementById("ext-fwdallnumber").value+'\",';
    }
    if(d.getElementById("ext-fwdnregnumber") != null){
        // var prop1 = kind === 'users' ? 'fwdall' : 'fwdnreg';
        // var prop2 = kind === 'users' ? 'fwdallnumber' : 'fwdnregnumber';
        jprms += '\"fwdnreg\":'+d.getElementById("ext-fwdnreg").checked+',';
        jprms += '\"fwdnregnumber\":\"'+d.getElementById("ext-fwdnregnumber").value+'\",';
        // jprms += '\"fwdnreg\":'+d.getElementById("ext-fwdnreg").checked+',';
        // jprms += '\"fwdnregnumber\":\"'+d.getElementById("ext-fwdnregnumber").value+'\",';
    }
    if(d.getElementById("ext-fwdbusynumber") != null){
        jprms += '\"fwdbusy\":'+d.getElementById("ext-fwdbusy").checked+',';
        jprms += '\"fwdbusynumber\":\"'+d.getElementById("ext-fwdbusynumber").value+'\",';
    }
    if(d.getElementById("ext-fwdnansnumber") != null){
        jprms += '\"fwdnans\":'+d.getElementById("ext-fwdnans").checked+',';
        jprms += '\"fwdnansnumber\":\"'+d.getElementById("ext-fwdnansnumber").value+'\",';
    }  
    if((d.getElementById("ext-fwdtimeout") != null) && d.getElementById("ext-fwdtimeout").value)
        jprms += '\"fwdtimeout\":'+d.getElementById("ext-fwdtimeout").value+',';
    if(d.getElementById("ext-plock").disabled == false)    
        jprms += '\"lock\":'+d.getElementById("ext-plock").checked+',';
    // if(d.getElementById("ext-dnd").disabled == false)    
    //     jprms += '\"dnd\":'+d.getElementById("ext-dnd").checked+',';
    if(d.getElementById("ext-recording").disabled == false)    
        jprms += '\"recording\":'+d.getElementById("ext-recording").checked+',';
    if(d.getElementById("ext-callwaiting").disabled == false)
        jprms += '\"callwaiting\":'+d.getElementById("ext-callwaiting").checked+',';
    if(d.getElementById("ext-pickupdeny").disabled == false)    
        jprms += '\"pickupdeny\":'+d.getElementById("ext-pickupdeny").checked+',';
    if(d.getElementById("ext-monitordeny").disabled == false)    
        jprms += '\"monitordeny\":'+d.getElementById("ext-monitordeny").checked+',';
    if(d.getElementById("ext-busyoverdeny").disabled == false)    
        jprms += '\"busyoverdeny\":'+d.getElementById("ext-busyoverdeny").checked+',';
    // if(d.getElementById("recording").disabled == false)    
    //     jprms += '\"recording\":'+d.getElementById("recording").checked+',';
    if(d.getElementById("ext-voicemail").disabled == false)    
        jprms += '\"voicemail\":'+d.getElementById("ext-voicemail").checked+',';
    jprms += '}';  

    var userInfoForm = document.getElementById('userInfo');
    var userInfo = retrieveFormData(userInfoForm);
    if(userInfo && Object.keys(userInfo).length !== 0){
        userInfo.userid = PbxObject.userid;
        json_rpc_async('setUserInfo', userInfo, null);
    }
    
    setObject(jprms, function(){
        $('#el-extension').modal('hide');
    });

    upload('upload-avatar', '/$AVATAR$?userid='+PbxObject.userid);
}

// function loadAvatar(e){
//     var e = e || window.event;
//     if(e) e.preventDefault();

//     var upl = document.getElementById('upload-avatar');
//     upl.click();

//     upl.onchange = function(){
//         previewAvatar(this);
//     }
// }

// function previewAvatar(input){
//     if (input.files && input.files[0]) {
//         var reader = new FileReader();

//         reader.onload = function (e) {
//             $('#user-avatar').attr('src', e.target.result);
//         }

//         reader.readAsDataURL(input.files[0]);
//     }
// }

// function getAvatar(userid, callback){
    
//     var req = new XMLHttpRequest();
//     req.overrideMimeType('text/plain; charset=x-user-defined');
//     req.open('GET', "/$AVATAR$?userid="+userid, true);
//     req.responseType = 'arraybuffer';

//     req.onload = function(e) {
//         if (this.status == 200) {
//             var binary = ''
//             var buffer = req.mozResponseArrayBuffer || req.response
//             var bytes = new Uint8Array(buffer)

//             for (var i = 0; i < bytes.byteLength; i++) {
//              binary += String.fromCharCode(bytes[i])
//             }
//             if(callback != null) {
//                 callback(binary);
//             }
//         }
//     }
    
//     req.send(null);
// }

// function initNewUsersWizzard(e){
//     var e = e || window.event;
//     if(e) e.preventDefault();
//     var targ = e.currentTarget,
//         type = targ.getAttribute('data-object'),
//         data = {};

//     json_rpc_async('getObjects', 'kind:"'+type+'"', function(result){
//         data.groups = result;
//         json_rpc_async('getObject', 'oid:"'+type+'"', function(result){
//             data.id = 'wizz-add-users';
//             data.users = result.available.sort();
//             data.template = 'add_user';
//             data.frases = PbxObject.frases;
//             Wizzard(data);
//         });
//     });
// }

function getUserInfo(userid){
    if(PbxObject.vars.infoShown === true){
        $('#userInfo').collapse('toggle');
        return;
    }

    var btn = document.getElementById('showUserInfo'),
        btnContent = btn.innerHTML,
        rendered,
        data;

    btn.innerHTML = '<i class="fa fa-lg fa-spinner fa-spin"></i>';
    getPartial('userinfo', function(template){
        json_rpc_async('getUserInfo', {userid: userid}, function(result){
            PbxObject.vars.infoShown = true;
            data = {
                data: result,
                frases: PbxObject.frases
            };

            data.data.email = data.data.email || data.data.mail;

            rendered = Mustache.render(template, data);
            $('#userInfo').html(rendered);
            btn.innerHTML = btnContent;
            $('#userInfo').collapse('toggle');
        });

    });
}

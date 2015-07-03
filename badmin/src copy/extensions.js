function load_extensions(result) {
    // console.log(result);
    var row,
        table = document.getElementById('extensions').getElementsByTagName('tbody')[0],
        // passReveal = [].slice.call(document.querySelectorAll('.password-reveal')),
        fragment = document.createDocumentFragment();

    // PbxObject.extensions = result;

    for(var i=0; i<result.length; i++){

        // if(!result[i].oid) continue;

        row = createExtRow(result[i]);
        fragment.appendChild(row);

    }
        
    table.appendChild(fragment);
    
    // if(passReveal.length) {
    //     passReveal.forEach(function(item){
    //         addEvent(item, 'click', revealPassword);
    //     });
    // }

    // var $modal = $('#el-extension');
    // $('#pagecontainer').prepend($modal);
    // $($modal).insertBefore('#pagecontainer');

    TableSortable.sortables_init();
    add_search_handler();
    set_page();
    show_content();

}

function createExtRow(data){

    var row = document.createElement('tr'),
        info = getInfoFromState(data.state, data.group),
        status = info.rstatus,
        classname = info.rclass,
        cell, a, newkind;

    cell = row.insertCell(0);
    if(data.oid && data.kind){
        a = document.createElement('a');
        if(data.kind == 'user' || data.kind == 'phone') {
            a.href = '#';
            addEvent(a, 'click', get_extension);
        } else {
            a.href = '#' + data.kind + '?' + data.oid;
        }
        a.textContent = data.ext;
        cell.appendChild(a);
    } else {
        cell.textContent = data.ext;
    }
    
    cell = row.insertCell(1);
    cell.setAttribute('data-cell', 'name');
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.setAttribute('data-cell', 'group');
    cell.textContent = data.group || "";
    
    cell = row.insertCell(3);
    cell.textContent = data.reg || "";
    cell.setAttribute('data-cell', 'reg');
    cell.className = 'nowrap';
    cell.title = data.reg || "";

    cell = row.insertCell(4);
    cell.setAttribute('data-cell', 'kind');
    cell.textContent = PbxObject.frases.KINDS[data.kind] || "";

    cell = row.insertCell(5);
    cell.setAttribute('data-cell', 'status');
    cell.textContent = status || "";

    cell = row.insertCell(6);
    if(data.kind) {
        if(data.kind == 'user' || data.kind == 'phone') {
            button = createNewButton({
                type: 'tooltip',
                title: PbxObject.frases.EDIT,
                classname: 'btn btn-primary btn-sm',
                content: '<i class="fa fa-edit"></i>',
                handler: editExtension
            });
            cell.appendChild(button);
        }    
    }
    cell = row.insertCell(7);
    if(data.oid) {
        button = createNewButton({
            type: 'tooltip',
            title: PbxObject.frases.DELETE,
            classname: 'btn btn-danger btn-sm',
            content: '<i class="fa fa-trash"></i>',
            handler: delete_extension
        });
        cell.appendChild(button);
    }

    // row.id = data.ext;
    row.id = data.oid;
    row.setAttribute('data-ext', data.ext);
    row.setAttribute('data-kind', data.kind);
    row.className = classname;

    return row;

}

function updateExtension(data){

    // console.log(data);

    var row = document.getElementById(data.oid);
    var state = data.state;
    var info = getInfoFromState(state, data.group);
    // var table = document.getElementById('extensions') || document.getElementById('group-extensions');

    // if(!row) return;
    
    // var state = data.state,
    //     cells = row.cells,
    //     info = getInfoFromState(state, data.group),
    //     status = info.rstatus,
    //     className = info.rclass;
    
    // if(table) {
        // table = table.querySelector('tbody');
        if(row) {
            var cells = row.cells,
                status = info.rstatus,
                className = info.rclass,
                cell;

            row.className = className;

            if(data.name){
                cell = row.querySelector('[data-cell="name"]');
                if(cell) cell.innerHTML = data.name;
                // cells[1].innerHTML = data.name;
            }
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
            if(cell) cell.innerHTML = status;
            // cells[5].innerHTML = status;
        }
            
    // }
    // for(var ext in PbxObject.extensions){

    //     if(PbxObject.extensions[ext].oid === data.oid || PbxObject.extensions[ext].ext === data.ext){
    //         var ext = PbxObject.extensions[ext];
    //         if(ext.state) ext.state = data.state;
    //         if(ext.name) ext.name = data.name;
    //         if(ext.group) ext.group = data.group;
    //         if(ext.reg) ext.reg = data.reg;
    //     }

    // }

}

function get_extension(e){
    var e = e || window.event;
    if(e.type == 'click')
        e.preventDefault();

    var oid = getClosest(e.target, 'tr').id;

    if(oid){
        show_loading_panel();

        if(!PbxObject.templates.extension){
            $.get('/badmin/views/extension.html', function(template){
                PbxObject.templates = PbxObject.templates || {};
                PbxObject.templates.extension = template;
                json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', load_extension);
            });
        } else {
            json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', load_extension);
        }
    }
}

function editExtension(e){

    var row = getClosest(e.target, 'tr'),
        table = row.parentNode,
        tr = document.createElement('tr'),
        // tr = row.cloneNode(false),
        cells = row.cells,
        name = cells[1].textContent,
        group = cells[2].textContent,
        reg = cells[3].textContent,
        kind = row.getAttribute('data-kind'),
        status = cells[5].textContent,
        cell, div, inp, sel, button;

    tr.setAttribute('data-oid', row.id);
    cell = tr.insertCell(0);
    cell.innerHTML = cells[0].innerHTML;

    cell = tr.insertCell(1);
    cell.innerHTML = '<input class="form-control extname" value="'+name+'">';

    cell = tr.insertCell(2);
    if(kind == 'user' || kind == 'phone'){
        var newkind = kind == 'user' ? 'users':'unit';
        // div = document.createElement('div');
        // div.className = 'form-group';
        sel = document.createElement('select');
        sel.className = 'form-control extgroup';
        fill_group_choice(newkind, group, sel);
        // div.appendChild(sel);
        cell.appendChild(sel);
    } else {
        cell.textContent = group;
    }

    cell = tr.insertCell(3);
    // div = document.createElement('div');
    // div.className = 'form-group';
    if(kind == 'phone' || reg.indexOf('.') != -1) {
        cell.textContent = reg;
    } else {
        cell.innerHTML = '<input class="form-control extreg" value="'+reg+'">';
    }

    cell = tr.insertCell(4);
    cell.textContent = kind;
    cell = tr.insertCell(5);
    cell.textContent = status;

    cell = tr.insertCell(6);
    button = createNewButton({
        type: 'tooltip',
        title: PbxObject.frases.CANCEL,
        classname: 'btn btn-default btn-sm',
        content: '<i class="fa fa-chevron-left"></i>',
        handler: function(){
                    row.style.display = 'table-row';
                    table.removeChild(tr);
                }
    });

    // button = document.createElement('button');
    // button.className = 'btn btn-default btn-sm';
    // button.innerHTML = '<i class="fa fa-chevron-left"></i>';
    // addEvent(button, 'click', function(){
    //     row.style.display = 'table-row';
    //     table.removeChild(tr);
    // });
    cell.appendChild(button);

    cell = tr.insertCell(7);
    button = createNewButton({
        type: 'tooltip',
        title: PbxObject.frases.SAVE,
        classname: 'btn btn-success btn-sm',
        content: '<i class="fa fa-check"></i>',
        handler: set_extension_update
    });

    // button = document.createElement('button');
    // button.className = 'btn btn-success btn-sm';
    // button.innerHTML = '<i class="fa fa-check"></i>';
    // addEvent(button, 'click', set_extension_update);
    cell.appendChild(button);

    table.insertBefore(tr, row);
    row.style.display = 'none';
    // table.removeChild(row);

}

function set_extension_update(e){

    var row = getClosest(e.target, 'tr'),
        oid = row.getAttribute('data-oid'),
        trow = document.getElementById(oid),
        name = row.querySelector('.extname').value,
        groups = row.querySelector('.extgroup'),
        groupid = groups.options[groups.selectedIndex].value,
        reg = row.querySelector('.extreg');

    // jprms = '{';
    var jprms = '\"oid\":\"'+oid+'\",';
    if(name) jprms += '\"name\":\"'+name+'\",';
    if(groupid) jprms += '\"groupid\":\"'+groupid+'\",';
    if(reg && reg.value) jprms += '\"followme\":\"'+reg.value+'\",';
    // jprms += '}';
    json_rpc_async('setObject', jprms, function(){
        row.parentNode.removeChild(row);
        trow.style.display = 'table-row';
    }); 
}

function load_extension(result){
    console.log(result);

    var d = document,
    groupid = result.groupid,
    kind = result.kind == 'user' ? 'users':'unit';
    data = {
        data: result,
        frases: PbxObject.frases
    };

    PbxObject.extOid = result.oid;
    
    var rendered = Mustache.render(PbxObject.templates.extension, data);
    var cont = document.getElementById('ext-cont');
    if(!cont){
        cont = document.createElement('div');
        cont.id = 'ext-cont';
        $('#pagecontainer').prepend(cont);
    }
    
    // $('#dcontainer').prepend(cont);
    // document.getElementById('dcontainer').appendChild(cont);
    // $("#ext-cont").html(rendered);
    $(cont).html(rendered);

    var img = document.getElementById('user-avatar');
    var src = "/$AVATAR$?userid="+result.userid;
    img.onerror = function(){
        this.src = 'images/avatar.png';
    }
    img.src = src;

    // getAvatar(result.userid, function(binary){
    //     var img = document.getElementById('user-avatar');
    //     img.src = "data:image/jpeg;base64," + b64EncodeUnicode(binary);
    //     console.log(img);
    // });

    switch_presentation(kind, document.getElementById('ext-features'));
    if(groupid){
        fill_group_choice(kind, groupid);
    } else {
        document.getElementById("extgroup-cont").classList.add('hidden');
    }

    var fwdnreg = d.getElementById('ext-fwdnreg');
    var fwdnregnumber = d.getElementById('ext-fwdnregnumber');
    if(kind === 'users'){
        d.getElementById('fwdall-cont').classList.add('hidden');
        fwdnreg.checked = result.features.fwdall;
        fwdnregnumber.value = result.features.fwdallnumber;
    } else {
        fwdnreg.checked = result.features.fwdnreg;
        fwdnregnumber.value = result.features.fwdnregnumber;
    }
    
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
    d.getElementById('extpassword').value = result.password;
    d.getElementById('el-set-extension').onclick = function(){
        set_extension(kind);
    };

    show_content();
    $('#el-extension [data-toggle="tooltip"]').tooltip();
    $('#el-extension').modal();
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
    if(group.options.length) var groupv = group.options[group.selectedIndex].value;
    
    if(groupv)
        jprms += '\"groupid\":\"'+groupv+'\",';
    // if(kind == 'users'){
    //     jprms += '\"followme\":\"'+d.getElementById("followme").value+'\",';
    // }
    jprms += '\"name\":\"'+d.getElementById("extname").value+'\",';
    jprms += '\"display\":\"'+d.getElementById("extdisplay").value+'\",';
    if(login) jprms += '\"login\":\"'+login+'\",';
    jprms += '\"password\":\"'+d.getElementById("extpassword").value+'\",';
    if(d.getElementById("extpin").value) jprms += '\"pin\":'+d.getElementById("extpin").value+',';
    jprms += '\"features\":{';

    if(d.getElementById("ext-fwdall") != null && kind !== 'users'){
        jprms += '\"fwdall\":'+d.getElementById("ext-fwdall").checked+',';
        jprms += '\"fwdallnumber\":\"'+d.getElementById("ext-fwdallnumber").value+'\",';
    }
    if(d.getElementById("ext-fwdnregnumber") != null){
        var prop1 = kind === 'users' ? 'fwdall' : 'fwdnreg';
        var prop2 = kind === 'users' ? 'fwdallnumber' : 'fwdnregnumber';
        jprms += prop1+':'+d.getElementById("ext-fwdnreg").checked+',';
        jprms += prop2+':\"'+d.getElementById("ext-fwdnregnumber").value+'\",';
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
    // console.log(jprms);
    
    json_rpc_async('setObject', jprms, function(){
        $('#el-extension').modal('hide');
    });

    upload('upload-avatar', '/$AVATAR$?userid='+login);
}

function loadAvatar(e){
    var e = e || window.event;
    if(e) e.preventDefault();

    var upl = document.getElementById('upload-avatar');
    upl.click();

    upl.onchange = function(){
        previewAvatar(this);
    }
}

function previewAvatar(input){
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#user-avatar').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function getAvatar(userid, callback){
    
    var req = new XMLHttpRequest();
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.open('GET', "/$AVATAR$?userid="+userid, true);
    req.responseType = 'arraybuffer';

    req.onload = function(e) {
        if (this.status == 200) {
            var binary = ''
            var buffer = req.mozResponseArrayBuffer || req.response
            var bytes = new Uint8Array(buffer)

            for (var i = 0; i < bytes.byteLength; i++) {
             binary += String.fromCharCode(bytes[i])
            }
            if(callback != null) {
                callback(binary);
            }
        }
    }
    
    req.send(null);
}

function initNewUsersWizzard(e){
    var e = e || window.event;
    if(e) e.preventDefault();
    var targ = e.currentTarget,
        type = targ.getAttribute('data-object'),
        data = {};

    json_rpc_async('getObjects', 'kind:"'+type+'"', function(result){
        data.groups = result;
        json_rpc_async('getObject', 'oid:"'+type+'"', function(result){
            data.id = 'wizz-add-users';
            data.users = result.available.sort();
            data.template = 'add_user';
            data.frases = PbxObject.frases;
            Wizzard(data);
        });
    });
}

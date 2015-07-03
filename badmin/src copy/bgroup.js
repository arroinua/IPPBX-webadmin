function load_bgroup(result){
    // console.log(result);
    switch_presentation(result.kind);
    // switch_tab(result.kind);
    var i, cl;
    var d = document;
    var kind = result.kind;
    var members = result.members;
    var cont = d.getElementById('dcontainer');
    var options = d.getElementById('options');
    var enabled = document.getElementById('enabled');
    var users = result.available.concat(result.members).sort();

    PbxObject.oid = result.oid;
    PbxObject.name = result.name;

    if(result.name) {
        d.getElementById('objname').value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        if(result.name) {
            addEvent(enabled, 'change', function(){
                // console.log(result.oid+' '+this.checked);
                json_rpc_async('setObjectState', '\"oid\":\"'+result.oid+'\", \"enabled\":'+this.checked+'', null);
            });
        }
    }
    if(kind == 'users' || kind == 'equipment') {
        var table = document.getElementById('group-extensions').querySelector('tbody');
        var available = document.getElementById('available-users');
        var protocol = document.getElementById('group-protocol');
        var protoOpts = document.getElementById('get-proto-opts');
        var form = document.getElementById('new-user-form');
        var clear = document.getElementById('clear-input');
        var add = document.getElementById('add-user');
        var utype = kind == 'users' ? 'user' : 'phone';
        
        if(kind == 'equipment'){
            var prots = result.options.protocols || result.options.protocol;
            if(typeof prots === 'object'){
                prots.forEach(function(item){
                    protocol.innerHTML += '<option value="'+item+'">'+item+'</option>';
                });
            } else {
                var parent = protocol.parentNode;
                var span = document.createElement('span');
                span.className = 'form-control-static';
                span.textContent = prots;
                parent.insertBefore(span, protocol);
                parent.removeChild(protocol);
            }
            addEvent(protoOpts, 'click', function(){
                get_protocol_opts((result.options.protocol || protocol.value), result.options);
            });
            if(!PbxObject.templates.protocol){
                $.get('/badmin/views/protocol.html', function(template){
                    PbxObject.templates = PbxObject.templates || {};
                    PbxObject.templates.protocol = template;
                });
            }
            PbxObject.protocolOpts = {};
        }
        if(result.available && result.available.length) { //if users available for this group to add
            result.available.sort().forEach(function(item){
                var option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                available.appendChild(option);
            });
        } else {
            add.setAttribute('disabled', 'disabled'); // disable "add user" button
        }
        
        addEvent(add, 'click', function(){
            addUser(utype);
            // cleanForm();
        });
        // addEvent(clear, 'click', function(e){
        //     cleanForm(e);
        // });

        var num;
        sortByKey(members, 'number');
        members.forEach(function(item){
            table.appendChild(addMembersRow(item));
        });
        
        PbxObject.members = members || [];

        // changeGroupType(type);

    } else {
        // add_search_handler();
        // $('.selectable-cont').click(function(e){
        //     if(e.target.getAttribute('data-value')) {
        //         move_list_item(e);
        //     } else if(e.target.classList.contains('assign-all')) {
        //         move_list('members', 'available');
        //     } else if(e.target.classList.contains('unassign-all')) {
        //         move_list('available', 'members');
        //     }
        // });
        if(result.available) fill_list_items('available', result.available);
        // if(members) fill_list_items('members', members.sort());
        if(members) fill_list_items('members', members);
    }

    if(result.options){
        if(kind == 'equipment'){
            var devselect = document.getElementById('devtype');
            var eqtype = result.options.kind || 'ipphones';
            devselect.value = eqtype;
            switch_options_tab('tab-'+eqtype);
            devselect.onchange = function(){
                switch_options_tab('tab-'+this.options[this.selectedIndex].value);
            }
            if(result.options.kind == 'gateway'){
                d.getElementById('regname').value = result.options.gateway.regname || '';
                d.getElementById('regpass').value = result.options.gateway.regpass || '';
            }
            else if(result.options.kind == 'trunk'){
                document.getElementById('address').value = result.options.trunk.domain || '';
                // document.getElementById('tusername').value = result.options.trunk.user || '';
                // document.getElementById('tauth').value = result.options.trunk.auth || '';
                // document.getElementById('tpassword').value = result.options.trunk.pass || '';
                // document.getElementById('regexpires').value = result.options.trunk.regexpires || 60;
                
                // var register = document.getElementById('register');
                // register.checked = result.options.trunk.register;
                // switchDisabledState(register);

                // var radio = document.getElementById('proxy');
                // radio.checked = result.options.trunk.proxy;
                // switchDisabledState(radio);
                // // var inputs = document.getElementsByName('proxy');
                // // for(var i=0;i<inputs.length;i++){
                // //     inputs[i].disabled = !result.options.trunk.proxy;
                // // }
                // document.getElementById('paddr').value = result.options.trunk.paddr || '';
                // document.getElementById('pauth').value = result.options.trunk.pauth || '';
                // document.getElementById('ppass').value = result.options.trunk.ppass || '';
            }
            d.getElementById('phonelines').value = result.options.phonelines || '1';
            if(result.options.starflash != undefined){
                d.getElementById('starflash').checked = result.options.starflash;
            }
        } else if(kind == 'unit'){
            d.getElementById("groupno1").value = result.options.groupno || '';
            d.getElementById("timeout1").value = result.options.timeout || '';
            if(result.options.huntmode)
                d.getElementById("huntmode1").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd1").checked = result.options.huntfwd;
        } else if(kind == 'hunting'){
            if(result.options.timeout)
                d.getElementById("timeout2").value = result.options.timeout;
            if(result.options.huntmode)
                d.getElementById("huntmode2").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd2").checked = result.options.huntfwd;
        } else if(kind == 'pickup'){
            d.getElementById("groupno2").value = result.options.groupno || '';
        } else if(kind == 'icd'){
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
            var greetFile = result.options.greeting || '';
            customize_upload('greeting', greetFile);
        } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){

            var formats = [ "OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080" ];
            var initmode = document.getElementById('initmode');
            if(initmode) {
                initmode.onchange = function(){
                    if(initmode.options[initmode.selectedIndex].value == 2) {
                        document.getElementById('conf-greetfile').style.display = 'block';
                    } else {
                        document.getElementById('conf-greetfile').style.display = 'none'    ;
                    }
                };
            }
            PbxObject.videomax = result.options.maxvideomode;
            //customizing upload element
            var onholdfile = result.options.onholdfile || '';
            customize_upload('onhold2', onholdfile);
            var greetfile2 = result.options.greetingfile || '';
            customize_upload('greeting2', greetfile2);
            
            if(kind == 'channel') {
                var type, types = [].slice.call(cont.querySelectorAll('input[name="objectType"]')),
                    external = document.getElementById('out-number'),
                    channelTypes = document.getElementById('channel-type-sel'),
                    video = document.getElementById('video');
                types.forEach(function(item){
                    if(result.external) {
                        if(item.value == 'global') {
                            var label = item.parentNode;
                            item.checked = true;
                            $(label).button('toggle');
                            // item.parentNode.click();
                            type = item.value;
                        }
                        external.value = result.external;
                    } else {
                        if(item.value == 'local') {
                            var label = item.parentNode;
                            item.checked = true;
                            $(label).button('toggle');
                            // item.parentNode.click();
                            // item.checked = true;
                            type = item.value;
                        }
                    }
                    channelTypes.onclick = function(e){
                        var e = e || window.event;
                        var target = e.target;
                        if(target.nodeName === 'LABEL'){
                            type = target.children[0].value;
                            changeGroupType(type);
                        }
                    };
                });

                if(video) {
                    if(result.options.videomode !== "OFF")
                        video.checked = true;
                    else
                        video.checked = false;
                }

                if(initmode) initmode.value = result.options.initmode;

                var backmusic = result.options.musiconback || "";
                document.getElementById('playmusiconback').checked = backmusic ? true : false;
                customize_upload('musiconback', backmusic);

                changeGroupType(type);
            } else if(kind == 'selector') {
                var owner = result.owner;
                var elowner = document.getElementById('owner');
                if(initmode) initmode.value = result.options.initmode;
                if(result.options.initmode == 2) {
                    document.getElementById('conf-greetfile').style.display = 'block';
                } else {
                    document.getElementById('conf-greetfile').style.display = 'none';
                }

                initcalls.checked = result.options.initcalls;

                users.forEach(function(item){
                    if(owner && item == owner) {
                        elowner.innerHTML += '<option value="'+item+'" selected>'+item+'</option>';
                    } else {
                        elowner.innerHTML += '<option value="'+item+'">'+item+'</option>';
                    }
                    
                });
            }

            d.getElementById("dialuptt").value = result.options.dialtimeout || '';
            d.getElementById("autoredial").checked = result.options.autoredial;
            if(kind !== 'channel') d.getElementById("confrecord").checked = result.options.recording;
            var greet = d.getElementById("playgreet");
            greet.checked = result.options.greeting;
            if(greet.checked) 
                greet.checked = result.options.greetingfile ? true : false;
                
            // var modes = cont.querySelectorAll('.init-mode');
            // if(modes.length) {
            //     for(i=0;i<modes.length;i++){
            //         if(result.options.initmode == modes[i].value){
            //             modes[i].checked = true;
            //         }
            //     }
            // }
            var select = d.getElementById("videoform");
            if(select) {
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
            var recording = document.getElementById('confrecord');
            if(recording && result.options.recording !== undefined) recording.checked = result.options.recording;
        }
    }

    if(result.profile != undefined){
        // if(d.getElementById('hold'))
        //     d.getElementById('hold').checked = result.profile.hold;
        if(d.getElementById('forwarding'))
            d.getElementById('forwarding').checked = result.profile.forwarding;
        if(d.getElementById('callpickup'))
            d.getElementById('callpickup').checked = result.profile.callpickup;
        if(d.getElementById('dndover'))
            d.getElementById('dndover').checked = result.profile.dndover;
        if(d.getElementById('busyover'))
            d.getElementById('busyover').checked = result.profile.busyover;
        if(d.getElementById('monitor'))
            d.getElementById('monitor').checked = result.profile.monitor;
        if(d.getElementById('dnd'))
            d.getElementById('dnd').checked = result.profile.dnd;
        if(d.getElementById('clir'))
            d.getElementById('clir').checked = result.profile.clir;
        if(d.getElementById('pickupdeny'))
            d.getElementById('pickupdeny').checked = result.profile.pickupdeny;
        if(d.getElementById('busyoverdeny'))
            d.getElementById('busyoverdeny').checked = result.profile.busyoverdeny;
        if(d.getElementById('monitordeny'))
            d.getElementById('monitordeny').checked = result.profile.monitordeny;
        if(d.getElementById('callwaiting'))
            d.getElementById('callwaiting').checked = result.profile.callwaiting;
        if(d.getElementById('outcallbarring'))
            d.getElementById('outcallbarring').checked = result.profile.outcallbarring;
        if(d.getElementById('costroutebarring'))
            d.getElementById('costroutebarring').checked = result.profile.costroutebarring;
        if(d.getElementById('recording'))
            d.getElementById('recording').checked = result.profile.recording;
        if(d.getElementById('hiderecind'))
            d.getElementById('hiderecind').checked = result.profile.hiderecindication;

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
    TableSortable.sortables_init();
    show_content();
    set_page();
    $(".select2").select2();
}

function set_bgroup(param, callback){
    var jprms;
    var handler;
    var d = document;
    var oid = PbxObject.oid;
    var kind = PbxObject.kind;
    var members = d.getElementById('members');
    var profile = d.getElementById('profile');
    var greet = d.getElementById("playgreet");
    var name = d.getElementById('objname').value;
    var type, types = [].slice.call(document.querySelectorAll('input[name="objectType"]'));

    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return;
    }
    
    show_loading_panel();
    
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }

    if(oid) jprms += '"oid":"'+oid+'",';
    if(kind) jprms += '"kind":"'+kind+'",';

    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';

    if(kind != 'users' && kind != 'equipment'){
        jprms += '"members":[';
        for(var i=0; i<members.children.length; i++){
            jprms += '"'+members.children[i].innerHTML+'",';
        }
        jprms += '],';
    }
    if(kind == 'users' || kind == 'equipment') {
        jprms += '"members":[';
        for(var i=0; i<PbxObject.members.length; i++) {
            jprms += '"' + PbxObject.members[i].number + '",';
        }
        jprms += '],';
    }
    if(kind == 'channel') {
        types.forEach(function(item){
            if(item.checked) {
                type = item.value;
            }
        });
        if(type == 'global') {
            greet.checked = false;
            var outnum = document.getElementById('out-number');
            jprms += '"external":"'+outnum.value+'",';
        }
        // else if(type == 'local') {

        // }
    } else if(kind == 'selector') {
        var owner = document.getElementById('owner').options[document.getElementById('owner').selectedIndex].value;
        jprms += '"owner":"'+owner+'",';
    } else if(kind == 'users' || kind == 'unit' || kind == 'equipment') {
        if(profile){
            jprms += '"profile":{';
            // if(d.getElementById("hold") != null){
            //     jprms += '"hold":'+d.getElementById("hold").checked+",";
            // }
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
            if(d.getElementById("dnd") != null && kind !== 'users'){
                jprms += '"dnd":'+d.getElementById("dnd").checked+",";
            }
            if(d.getElementById("recording") != null){
                jprms += '"recording":'+d.getElementById("recording").checked+",";
            }
            if(d.getElementById("hiderecind") != null){
                jprms += '"hiderecindication":'+d.getElementById("hiderecind").checked+",";
            }
            if(d.getElementById("callwaiting") != null && kind !== 'users'){
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
    }

    jprms += '"options":{';
    if(kind == 'equipment'){
        var protoOpts = JSON.stringify(PbxObject.protocolOpts);
        protoOpts = protoOpts.substr(1, protoOpts.length-2);
        var devselect = document.getElementById('devtype');
        var devtype = devselect.options[devselect.selectedIndex].value;
        var protocol = document.getElementById('group-protocol');
        if(protocol) jprms += '"protocol":"'+protocol.options[protocol.selectedIndex].value+'",';
        if(devtype == "ipphones"){
            jprms += '"kind":"ipphones",';
        } else if(devtype == "gateway"){
            jprms += '"kind":"gateway",';
            jprms += '"gateway":{';
            jprms += '"regname":"'+d.getElementById("regname").value+'",';
            jprms += '"regpass":"'+d.getElementById("regpass").value+'",';
            jprms += '},';
        } else if(devtype == "trunk"){
            // var register = document.getElementById('register').checked;
            // var proxy = document.getElementById('proxy').checked;
            jprms += '"kind":"trunk",';
            jprms += '"trunk":{';
            jprms += '"domain":"'+document.getElementById('address').value+'",';
            // jprms += '"register":'+register+',';
            // if(register){
            //     jprms += '"user":"'+document.getElementById('tusername').value+'",';
            //     jprms += '"auth":"'+document.getElementById('tauth').value+'",';
            //     jprms += '"pass":"'+document.getElementById('tpassword').value+'",';
            //     jprms += '"regexpires":'+document.getElementById('regexpires').value+',';
            // }
            // jprms += '"proxy":'+proxy+',';
            // if(proxy){
            //     jprms += '"paddr":"'+document.getElementById('paddr').value+'",';
            //     jprms += '"pauth":"'+document.getElementById('pauth').value+'",';
            //     jprms += '"ppass":"'+document.getElementById('ppass').value+'",';
            // }
            jprms += '},';
        }
        if(d.getElementById("phonelines")){
            jprms += '"phonelines":'+d.getElementById("phonelines").value+',';
        }
        if(d.getElementById("starflash")){
            jprms += '"starflash":'+d.getElementById("starflash").checked+',';
        }
        jprms += protoOpts;
    } else if(kind == 'unit'){
        jprms += '"groupno":"'+d.getElementById("groupno1").value+'",';
        jprms += '"timeout":'+d.getElementById("timeout1").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode1").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd1").checked+',';
    } else if(kind == 'hunting'){
        jprms += '"timeout":'+d.getElementById("timeout2").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode2").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd2").checked+',';
    } else if(kind == 'pickup'){
        jprms += '"groupno":"'+d.getElementById("groupno2").value+'",';
    } else if(kind == 'icd'){
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
        var file1 = document.getElementById("greeting");
        if(file1.value){
            if(file1.files[0]) jprms += '"greeting":"'+file1.files[0].name+'",';
            upload('greeting');
        }
    } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){
        var initmodes = document.getElementById('initmode');
        var initmode = initmodes.options[initmodes.selectedIndex].value;
        var greet = d.getElementById("playgreet");
        file2 = document.getElementById("greeting2");

        jprms += '"autoredial":'+d.getElementById("autoredial").checked+',';
        jprms += '"recording":'+d.getElementById("confrecord").checked+',';
        jprms += '"greeting\":'+greet.checked+',';

        if(greet.checked && file2.value){
            if(file2.files[0]) jprms += '"greetingfile":"'+file2.files[0].name+'",';
            upload('greeting2');
        }
        if(kind != 'channel') {
            jprms += '"dialtimeout":'+d.getElementById("dialuptt").value+',';
            jprms += '"videomode":"'+d.getElementById("videoform").value+'",';
        }
        if(kind == 'selector') {
            var initcalls = document.getElementById('initcalls');
            jprms += '"initcalls":'+initcalls.checked+',';
            if(initmode == 2) {
                file3 = document.getElementById("onhold2");
                if(file3.value){
                    if(file3.files[0]) jprms += '"onholdfile":"'+file3.files[0].name+'",';
                    upload('onhold2');
                }
            }
            // var modes = d.querySelectorAll('.init-mode');
            // for(i=0;i<modes.length;i++){
            //     if(modes[i].checked) {
            //         jprms += '"initmode":'+modes[i].value+',';
            //         if(modes[i].value == 2) {
            //             file = document.getElementById("onhold2");
            //             if(file.value){
            //                 jprms += '"onholdfile":"'+file.files[0].name+'",';
            //                 upload('onhold2');
            //             }
            //         }
            //     }
            // }
        }
        if(kind == 'channel') {
            var playbackmusic = document.getElementById('playmusiconback').checked;
            jprms += '"playmusiconback":'+playbackmusic+',';
            if(playbackmusic){
                var backmusic = document.getElementById('musiconback');
                if(backmusic.files[0]) jprms += '"musiconback":["'+backmusic.files[0].name+'"],';
                upload('musiconback');
            }
            var video = document.getElementById('video');
            if(video.checked) jprms += '"videomode":"640x480",';
            else jprms += '"videomode":"OFF",';

            // jprms += '"initmode":'+initmode+',';
        }
        jprms += '"initmode":'+initmode+',';
    }
    jprms += '}';
    json_rpc_async('setObject', jprms, function(result){
        if(typeof handler === 'function') handler();
        if(typeof callback === 'function') callback(param);
    });

}

function addMembersRow(data){

    var row, cell, a, info, status, classname;
    row = document.createElement('tr');
    info = getInfoFromState(data.state, true);
    status = info.rstatus;
    classname = info.rclass;
    row.id = data.oid;
    row.className = classname;

    cell = row.insertCell(0);
    if(data.oid) {
        row.setAttribute('data-ext', data.number);
        a = document.createElement('a');
        a.textContent = data.number;
        a.href = '#';
        addEvent(a, 'click', get_extension);
        cell.appendChild(a);
    } else {
        cell.textContent = data.number;
    }

    cell = row.insertCell(1);
    cell.setAttribute('data-cell', 'name');
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.setAttribute('data-cell', 'display');
    cell.textContent = data.display || "";

    cell = row.insertCell(3);
    cell.setAttribute('data-cell', 'reg');
    // if(data.followme !== undefined){
    cell.textContent = data.followme || data.reg || "";
    // }
    cell = row.insertCell(4);
    cell.setAttribute('data-cell', 'status');
    cell.innerHTML = status;

    cell = row.insertCell(5);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', delete_extension);
    cell.appendChild(button);

    return row;
}

function addUser(type){
    var e = e || window.event;
    var table = document.getElementById('group-extensions').querySelector('tbody'),
        available = document.getElementById('available-users'),
        ext = available.options[available.selectedIndex].value,
        name = document.getElementById('user-name'),
        alias = document.getElementById('user-alias'),
        // followme = document.getElementById('user-followme'),
        // login = document.getElementById('user-login'),
        pass = document.getElementById('user-pass');

    // if(!available.options.length) return;
    if(!PbxObject.name) {
        set_bgroup(type, addUser);
        return;
    }
    var jprms = '"kind":"'+type+'",';
    jprms += '"groupid":"'+PbxObject.oid+'",';
    jprms += '"number":"'+ext+'",';
    jprms += '"name":"'+name.value+'",';
    jprms += '"display":"'+alias.value+'",';
    jprms += '"password":"'+pass.value+'",';

    var data = {
        kind: type,
        groupid: PbxObject.oid,
        number: ext,
        name: name.value,
        display: alias.value,
        password: pass.value
    };
    // if(type == 'user') {
    //     jprms += '"followme":"'+followme.value+'",';
    //     data.followme = followme.value;
    // }
    // console.log(jprms);
    var result = json_rpc('setObject', jprms);
    if(result) {
        data.oid = result;
        var newrow = addMembersRow(data);
        var rows = table.rows;
        // if(!rows.length || ext > rows[rows.length-1].getAttribute('data-ext')) {
        if(!rows.length) {
            table.appendChild(newrow);
        } else {
            // for(var i=0, nextrow = 0; i<rows.length-1; i++){
            //     if(rows[i].id > ext) {
            //         nextrow = rows[i].id;

            //         // nextrow > rows[i].id ? nextrow : rows[i].id;
            //     } 
            // }
            // console.log(nextrow);
            // table.insertBefore(newrow, document.getElementById(nextrow));
            table.insertBefore(newrow, table.firstChild);
        }
        // table.appendChild(newrow);
        PbxObject.members.push(data);
            
        var options = [].slice.call(available.options);
        for(var i=0; i<available.options.length; i++) {
            if(available.options[i].value === ext) {
                available.removeChild(available.options[i]);
            }
        }
        if(!available.options.length) {
            var add = document.getElementById('add-user');
            add.setAttribute('disabled', 'disabled');
        }

        cleanForm('new-user-form');
    }
}

function cleanForm(formId){
    var form = document.getElementById(formId);
    // var name = document.getElementById('user-name'),
    //     alias = document.getElementById('user-alias'),
    //     // followme = document.getElementById('user-num'),
    //     pass = document.getElementById('user-pass');
    var inputs = [].slice.call(form.querySelectorAll('input'));
    inputs.forEach(function(inp){
        if(inp.value)
            inp.value = '';
    });

    // if(name) name.value = "";
    // if(alias) alias.value = "";
    // // if(followme) followme.value = "";
    // if(pass) pass.value = "";
}
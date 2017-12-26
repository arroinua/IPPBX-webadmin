function load_bgroup(result){
    console.log('load_bgroup: ', result);
    switch_presentation(result.kind);
    // switch_tab(result.kind);
    var i, cl,
        d = document, 
        kind = result.kind,
        members = result.members,
        cont = d.getElementById('dcontainer'),
        // options = d.getElementById('options'),
        enabled = document.getElementById('enabled'),
        // storeLimitTrigger = document.getElementById('trigger-storelimit'),
        // storelimitCont = document.getElementById('storelimit-cont'),
        addUserForm = document.getElementById('new-user-form'),
        $enabledCont = $('.object-name .switch'),
        availableUsers = result.available;

    if(availableUsers) {
        availableUsers = availableUsers.sort();
        PbxObject.available = availableUsers;
    }
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;

    getObjects(null, function(objs) {
        // if(!filterObject(objs, kind).length) {
            updateTempParams({ tour: true });
            // initTour({ kind: kind });
        // }
    });

    if(result.name) {
        d.getElementById('objname').value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

    // if(storeLimitTrigger) {
    //     addEvent(storeLimitTrigger, 'change', function(){
    //         storelimitCont.style.display = this.checked ? 'block' : 'none';
    //     });
    // }
    
    if(kind === 'users' || kind === 'equipment') {
        var table = document.getElementById('group-extensions').querySelector('tbody'),
            available = document.getElementById('available-users'),
            protocol = document.getElementById('group-protocol'),
            protoOpts = document.getElementById('get-proto-opts'),
            form = document.getElementById('new-user-form'),
            clear = document.getElementById('clear-input'),
            add = document.getElementById('add-user'),
            utype = (kind === 'users') ? 'user' : 'phone';
        
        if(kind == 'equipment'){
            var prots = result.options.protocols || result.options.protocol;
            // var storelimitCont = document.getElementById('storelimit-cont');
            // var userEmailCont = document.getElementById('user-email-cont');
            
            // if(storelimitCont) storelimitCont.parentNode.removeChild(storelimitCont);
            // if(userEmailCont) userEmailCont.parentNode.removeChild(userEmailCont);

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
        if(availableUsers && availableUsers.length) { //if users available for this group to add
            makeElement(availableUsers.sort(), available, function(item){
                var option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                return option;
            });

            // var fragment = document.createDocumentFragment();
            // availableUsers.sort().forEach(function(item){
            //     var option = document.createElement('option');
            //     option.value = item;
            //     option.textContent = item;
            //     fragment.appendChild(option);
            // });
            // available.appendChild(fragment);
        } else {
            add.setAttribute('disabled', 'disabled'); // disable "add user" button
        }
        
        addEvent(addUserForm, 'submit', function(e){
            e.preventDefault();
            // var storeLimitChecked = storeLimitTrigger.checked;
            addUser(utype, function() {
                cleanForm('new-user-form');
                // storeLimitTrigger.checked = storeLimitChecked;
            });
            // cleanForm();
        });
        // addEvent(add, 'click', function(){
        //     addUser(utype);
        //     // cleanForm();
        // });
        // addEvent(clear, 'click', function(e){
        //     cleanForm(e);
        // });

        var num;
        makeElement(sortByKey(members, 'number'), table, addMembersRow);

        // membersRows = document.createDocumentFragment();
        // sortByKey(members, 'number');
        // members.forEach(function(item){
        //     membersRows.appendChild(addMembersRow(item));
        // });
        // table.appendChild(fragment);

        PbxObject.members = members || [];

        if(PbxObject.options.ldap && PbxObject.options.ldap.directoryServer) {
            $('#from-directory-btn').show();
            // $('#add-newuser-btn').parent().addClass('col-xs-8');
        } else {
            $('#from-directory-btn').hide();
            // $('#add-newuser-btn').parent().addClass('col-xs-12');
        }

        // changeGroupType(type);

    } else {
        
        if(availableUsers) fill_list_items('available', availableUsers);
        // if(members) fill_list_items('members', members.sort());
        if(members) fill_list_items('members', members);

        // Render route parameters
        renderObjRoute({
            routes: result.routes || [],
            frases: PbxObject.frases,
            onChange: setCurrObjRoute
        });
    }

    if(result.options){
        if(kind == 'equipment'){
            var devselect = document.getElementById('devtype');
            var protoselect = document.getElementById('group-protocol');
            var eqtype = result.options.kind || 'ipphones';
            var register = document.getElementById('tr-register');
            var proxy = document.getElementById('tr-proxy');
            devselect.value = eqtype;
            if(!result.options.protocol) 
                protoselect.value = 'sip';
            
            switch_options_tab('tab-'+eqtype);
            devselect.onchange = function(){
                eqtype = this.options[this.selectedIndex].value;
                switch_options_tab('tab-'+eqtype);
                switchVisibility($enabledCont, eqtype === 'trunk');
            }
            if(PbxObject.options.mode !== 1 || PbxObject.options.prefix) {
                devselect.removeChild(devselect.children[devselect.children.length-1]);
                $enabledCont.hide();
                console.log($enabledCont);
            } else {
                switchVisibility($enabledCont, eqtype === 'trunk');
            }

            if(result.options.gateway !== undefined){
                d.getElementById('regname').value = result.options.gateway.regname || '';
                d.getElementById('regpass').value = result.options.gateway.regpass || '';
            }
            
            if(eqtype == 'trunk'){
                document.getElementById('tr-domain').value = result.options.trunk.domain || '';
                document.getElementById('tr-user').value = result.options.trunk.user || '';
                document.getElementById('tr-auth').value = result.options.trunk.auth || '';
                document.getElementById('tr-pass').value = result.options.trunk.pass || '';
                document.getElementById('tr-regexpires').value = result.options.trunk.regexpires || 60;
                
                register.checked = result.options.trunk.register;
                isVisible('reg-setts', register.checked);

                proxy.checked = result.options.trunk.proxy;
                isVisible('proxy-setts', proxy.checked);
                
                document.getElementById('tr-paddr').value = result.options.trunk.paddr || '';
                document.getElementById('tr-pauth').value = result.options.trunk.pauth || '';
                document.getElementById('tr-ppass').value = result.options.trunk.ppass || '';
            }
            d.getElementById('phonelines').value = result.options.phonelines || '1';
            if(result.options.starflash != undefined){
                d.getElementById('starflash').checked = result.options.starflash;
            }

            addEvent(register, 'change', function (e){
                isVisible('reg-setts', this.checked);
            });
            addEvent(proxy, 'change', function (e){
                isVisible('proxy-setts', this.checked);
            });
        } else if(kind == 'unit'){
            d.getElementById("groupno1").value = result.options.groupno || '';
            d.getElementById("timeout1").value = result.options.timeout || '';
            if(result.options.huntmode !== undefined){
                var huntmode = d.getElementById("huntmode1");
                huntmode.selectedIndex = result.options.huntmode;

                //check whether hunting mode is off, then hide settings.
                addEvent(huntmode, 'change', function(){
                    checkHuntMode();
                });
                checkHuntMode();
            }
            if(result.options.huntfwd  !== undefined)
                d.getElementById("huntfwd1").checked = result.options.huntfwd;

            var unitGreeting = result.options.greeting || '';
            var unitWaitMusic = result.options.waitmusic || '';
            customize_upload('unit-greeting', unitGreeting);
            customize_upload('unit-waitmusic', unitWaitMusic);

        } else if(kind == 'pickup'){
            d.getElementById("groupno2").value = result.options.groupno || '';

        } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){

            var formats = [ "OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080" ];
            var initmode = document.getElementById('initmode');
            if(initmode) {
                initmode.onchange = function(){
                    if(initmode.options[initmode.selectedIndex].value == 2) {
                        document.getElementById('conf-greetfile').style.display = 'block';
                    } else {
                        document.getElementById('conf-greetfile').style.display = 'none';
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
                var users = availableUsers.concat(result.members).sort();
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
            var recording = document.getElementById('confrecord'),
                rectimeCont = document.getElementById('rectime-cont'),
                rectime = document.getElementById('rectime');
            
            addEvent(recording, 'change', function(e) {
                if(this.checked) rectimeCont.classList.remove('hidden');
                else rectimeCont.classList.add('hidden');
            });

            if(recording && result.options.recording !== undefined) {
                recording.checked = result.options.recording;
                if(recording.checked) rectimeCont.classList.remove('hidden');
            }

            if(rectime && result.options.rectime !== undefined) {
                rectime.value = (result.options.rectime / 60);
            }
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
        if(d.getElementById('voicemail'))
            d.getElementById('voicemail').checked = result.profile.voicemail;

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

    // if ldap server is set in pbx settings, init ldap class
    if(PbxObject.options.ldap && PbxObject.options.ldap.directoryServer.trim().length) {
        PbxObject.LdapConnection = Ldap({
            domains: PbxObject.options.ldap.directoryDomains.split(' '),
            available: PbxObject.available,
            onaddusers: onAddLdapUsers
        });
        $('#from-directory-btn').click(function(){
            PbxObject.LdapConnection.auth();
        });
    }

    if(kind === 'users') {
        var activeServices = PbxObject.options.services.filter(function(service){
            return service.state;
        });
        
        if(activeServices.length) {
            $('#services-cont').append(activeServices.map(createServiceBtn));
        } else {
            if(!PbxObject.options.ldap || (PbxObject.options.ldap && !PbxObject.options.ldap.directoryServer))
                $('#add-external-user').hide();
        }

        qparams = getQueryParams();
        if(window.sessionStorage.getItem('lastURL') && qparams.service_id && qparams.service_type) {
            getExternalUsers(qparams.service_id, parseInt(qparams.service_type, 10));
            window.sessionStorage.removeItem('lastURL');
        }

    }
}

function onAddLdapUsers(users){

    if(!PbxObject.name) {
        set_bgroup(users, onAddLdapUsers);
        return;
    }

    console.log('onAddUsers: ', users);

    var ldapConn = PbxObject.LdapConnection,
        availableSelect = document.getElementById('available-users');
    
    ldapConn.setUsers({
        groupid: PbxObject.oid,
        username: ldapConn.options.username,
        password: ldapConn.options.password,
        domain: ldapConn.options.domain,
        users: users
    }, function(result) {
        console.log('addLdapUsers result: ', result);
        ldapConn.close();
        
        refreshUsersTable(function(availableUsers){
            ldapConn.options.available = availableUsers;
        });
    });
}

function createServiceBtn(params){
    var button;
    button = document.createElement('button');
    addEvent(button, 'click', function(e){
        getExternalUsers(params.id, params.type, params.props);
    });
    button.className = "btn btn-link btn-default padding-lg ellipsis";
    button.innerHTML = '<span>'+params.name+'</span>';
    
    return button;
}

function getExternalUsers(id, type, props){
    if(type === 1) {
        PbxObject.LdapConnection = Ldap({
            service_id: id,
            service_type: type,
            available: PbxObject.available,
            onaddusers: setExternalUsers
        });
        PbxObject.LdapConnection.getExternalUsers();

        // $.ajax({
        //     url: '/services/'+id+'/Users'
        // }).then(function(data){
        //     console.log('getExternalUsers: ', data);
        //     PbxObject.LdapConnection = Ldap({
        //         service_id: id,
        //         available: PbxObject.available,
        //         onaddusers: setExternalUsers
        //     });
        //     PbxObject.LdapConnection.showUsers(data.result);
        // }, function(err){
        //     console.log('getExternalUsers error: ', err);
        //     if(err.responseJSON.error.code === 401) {
        //         PbxObject.LdapConnection = Ldap({
        //             service_id: id,
        //             available: PbxObject.available,
        //             onaddusers: setExternalUsers
        //         });
        //         PbxObject.LdapConnection.auth();
        //     } else {
        //         var loc = window.location,
        //         newhref = loc.origin + loc.pathname + (loc.search ? loc.search : '?') + '&service_id='+id+'&service_type='+type + loc.hash;
        //         window.sessionStorage.setItem('lastURL', newhref);
        //         window.location = loc.origin + '/services/'+id+'/Users';
        //     }
        // });
    } else {
        json_rpc_async('getExternalUsers', { service_id: id }, function(result) {
            console.log('getExternalUsers result: ', result);
        });
    }
}

function setExternalUsers(users){
    if(!PbxObject.name) {
        set_bgroup(users, setExternalUsers);
        return;
    }

    console.log('setExternalUsers: ', users);

    var ldapConn = PbxObject.LdapConnection;
    //     params = {
    //         groupid: PbxObject.oid,
    //         service_id: ldapConn.options.service_id,
    //         users: users
    //     };
    // if(ldapConn.options.username) params.username = ldapConn.options.username;
    // if(ldapConn.options.password) params.password = ldapConn.options.password;
    // if(ldapConn.options.domain) params.domain = ldapConn.options.domain;
    
    // console.log('setExternalUsers params: ', params);
    ldapConn.setExternalUsers({
        groupid: PbxObject.oid,
        service_id: ldapConn.options.service_id,
        users: users
    }, function(result) {
        console.log('addLdapUsers result: ', result);
        ldapConn.close();
        
        refreshUsersTable(function(availableUsers){
            ldapConn.options.available = availableUsers;
        });
    });
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
    var enabled = document.getElementById('enabled');
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

    jprms += '\"enabled\":'+enabled.checked+',';

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
            var register = document.getElementById('tr-register').checked;
            var proxy = document.getElementById('tr-proxy').checked;
            jprms += '"kind":"trunk",';
            jprms += '"trunk":{';
            jprms += '"domain":"'+document.getElementById('tr-domain').value+'",';
            jprms += '"register":'+register+',';
            if(register){
                jprms += '"user":"'+document.getElementById('tr-user').value+'",';
                jprms += '"auth":"'+document.getElementById('tr-auth').value+'",';
                jprms += '"pass":"'+document.getElementById('tr-pass').value+'",';
                jprms += '"regexpires":'+document.getElementById('tr-regexpires').value+',';
            }
            jprms += '"proxy":'+proxy+',';
            if(proxy){
                jprms += '"paddr":"'+document.getElementById('tr-paddr').value+'",';
                jprms += '"pauth":"'+document.getElementById('tr-pauth').value+'",';
                jprms += '"ppass":"'+document.getElementById('tr-ppass').value+'",';
            }
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

        var unitGreeting = document.getElementById("unit-greeting");
        var unitWaitMusic = document.getElementById("unit-waitmusic");
        
        if(unitGreeting.value){
            if(unitGreeting.files[0]) jprms += '"greeting":"'+unitGreeting.files[0].name+'",';
            upload('unit-greeting');
        }

        if(unitWaitMusic.value){
            if(unitWaitMusic.files[0]) jprms += '"waitmusic":"'+unitWaitMusic.files[0].name+'",';
            upload('unit-waitmusic');
        }

    // } else if(kind == 'hunting'){
    //     jprms += '"timeout":'+d.getElementById("timeout2").value+',';
    //     jprms += '"huntmode":'+d.getElementById("huntmode2").value+',';
    //     jprms += '"huntfwd":'+d.getElementById("huntfwd2").checked+',';

    //     var huntGreeting = document.getElementById("hunt-greeting");
    //     var huntWaitMusic = document.getElementById("hunt-waitmusic");

    //     if(huntGreeting.value){
    //         if(huntGreeting.files[0]) jprms += '"greeting":"'+huntGreeting.files[0].name+'",';
    //         upload('hunt-greeting');
    //     }

    //     if(huntWaitMusic.value){
    //         if(huntWaitMusic.files[0]) jprms += '"waitmusic":"'+huntWaitMusic.files[0].name+'",';
    //         upload('hunt-waitmusic');
    //     }

    } else if(kind == 'pickup'){
        jprms += '"groupno":"'+d.getElementById("groupno2").value+'",';
    // } else if(kind == 'icd'){
    //     if(d.getElementById("icd-app"))
    //         jprms += '"application":"'+escapeValue(d.getElementById("icd-app").value)+'",';
    //     jprms += '"groupno":"'+d.getElementById("groupno").value+'",';
    //     jprms += '"maxlines":'+d.getElementById("maxlines").value+',';
    //     jprms += '"priority":'+d.getElementById("priority").value+',';
    //     jprms += '"canpickup":'+d.getElementById("canpickup").checked+',';
    //     jprms += '"autologin":'+d.getElementById("autologin").checked+',';
    //     jprms += '"method":'+d.getElementById("method").value+',';
    //     jprms += '"natimeout":'+d.getElementById("natimeout").value+',';
    //     jprms += '"resumetime":'+d.getElementById("resumetime").value+',';
    //     jprms += '"queuelen":'+d.getElementById("queuelen").value+',';
    //     jprms += '"overflowredirect":"'+d.getElementById("overflowredirect").value+'",';
    //     jprms += '"maxqwait":'+d.getElementById("maxqwait").value+',';
    //     jprms += '"overtimeredirect":"'+d.getElementById("overtimeredirect").value+'",';
    //     jprms += '"indicationmode":'+d.getElementById("indicationmode").value+',';
    //     jprms += '"indicationtime":'+d.getElementById("indicationtime").value+',';
        
    //     var file1 = document.getElementById("greeting");
    //     var queuemusic = document.getElementById("queuemusic");
    //     var queueprompt = document.getElementById("queueprompt");
        
    //     if(file1.value){
    //         if(file1.files[0]) jprms += '"greeting":"'+file1.files[0].name+'",';
    //         upload('greeting');
    //     }

    //     if(queuemusic.value){
    //         if(queuemusic.files[0]) jprms += '"queuemusic":"'+queuemusic.files[0].name+'",';
    //         upload('queuemusic');
    //     }

    //     if(queueprompt.value){
    //         if(queueprompt.files[0]) jprms += '"queueprompt":"'+queueprompt.files[0].name+'",';
    //         upload('queueprompt');
    //     }

    //     if(PbxObject.autologinOptions) {
    //         jprms += '"network":"'+PbxObject.autologinOptions.network+'",';
    //         jprms += '"netmask":"'+PbxObject.autologinOptions.netmask+'",';
    //     }
    } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){
        var initmodes = document.getElementById('initmode');
        var initmode = initmodes.options[initmodes.selectedIndex].value;
        var greet = d.getElementById("playgreet");
        file2 = document.getElementById("greeting2");

        jprms += '"autoredial":'+d.getElementById("autoredial").checked+',';
        jprms += '"recording":'+d.getElementById("confrecord").checked+',';
        jprms += '"greeting\":'+greet.checked+',';

        if(d.getElementById("rectime") && d.getElementById("confrecord").checked)
            jprms += '"rectime":'+(d.getElementById("rectime").value * 60)+',';

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
        if(!result) enabled.checked = false;

        // Add new route to the object
        if(result && getTempParams().ext) {
            var routeParams = {
                number: getTempParams().ext,
                target: { oid: result, name: name }
            };
            if(getTempParams().oid) routeParams.oid = getTempParams().oid;

            console.log('set route params: ', routeParams);
            setObjRoute(routeParams);
        }
    });
    // console.log(jprms);
}

function setObjRoute(params) {
    setRoute(params);
}

function renderObjRoute(params) {
    ReactDOM.render(
        ObjectRoute({
            // getOptions: getAvailablePool,
            routes: params.routes,
            frases: params.frases,
            // clearCurrObjRoute: clearCurrObjRoute,
            onChange: params.onChange
        }),
        document.getElementById('object-route-cont')
    );
}

function setCurrObjRoute(route) {
    console.log('setCurrObjRoute: ', route);
    updateTempParams(route);
}

// function clearCurrObjRoute() {
//     clearTempParams();
// }

function addMembersRow(data){

    var row, cell, a, info, status, classname;
    row = document.createElement('tr');
    info = getInfoFromState(data.state, true);
    status = info.rstatus;
    classname = info.rclass;
    row.id = data.oid;
    // row.className = classname;

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
    cell.innerHTML = '<span class="label label-'+info.className+'">'+status+'</span>';

    cell = row.insertCell(5);
    button = document.createElement('button');
    button.className = 'btn btn-link btn-danger btn-md';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', delete_extension);
    cell.appendChild(button);

    return row;
}

function addUser(type, cb){
    var e = e || window.event,
        table = document.getElementById('group-extensions').querySelector('tbody'),
        available = document.getElementById('available-users'),
        exts = available.options,
        nameEl = document.getElementById('user-name'),
        loginEl = document.getElementById('user-login'),
        emailEl = document.getElementById('user-email'),
        aliasEl = document.getElementById('user-alias'),
        passEl = document.getElementById('user-pass'),
        // storeLimitTrigger = document.getElementById('trigger-storelimit'),
        storelimit = document.getElementById('storelimit'),
        ext, name, alias;

    if(!exts.length) return;
    if(!PbxObject.name) {
        set_bgroup(type, addUser);
        return;
    }
    
    ext = available.options[available.selectedIndex].value;
    name = nameEl.value || (PbxObject.frases.KINDS[type] + " " + ext);
    login = loginEl.value;
    email = emailEl.value;
    alias = aliasEl ? aliasEl.value : name;
    // alias = aliasEl ? aliasEl.value : (PbxObject.frases.KINDS[type] + " " + ext);

    var jprms = '"kind":"'+type+'",';
    jprms += '"groupid":"'+PbxObject.oid+'",';
    if(login) jprms += '"login":"'+login+'",';
    if(email) jprms += '"info": { "email": "'+email+'" },';
    jprms += '"number":"'+ext+'",';
    jprms += '"name":"'+name+'",';
    jprms += '"display":"'+alias+'",';
    jprms += '"password":"'+passEl.value+'",';
    // if(storeLimitTrigger.checked) {
    storelimit = convertBytes(parseFloat(storelimit.value), 'GB', 'Byte');
    if(storelimit >= 0) jprms += '"storelimit":'+storelimit+',';
    // } else {
        // jprms += '"storelimit": 0,';
    // }

    var data = {
        kind: type,
        groupid: PbxObject.oid,
        number: ext,
        name: name,
        display: alias,
        password: passEl.value
    };
    // if(type == 'user') {
    //     jprms += '"followme":"'+followme.value+'",';
    //     data.followme = followme.value;
    // }
    // console.log(jprms);
    json_rpc_async('setObject', jprms, function(result, error){

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

            // remove extension from available
            if(PbxObject.available.indexOf(ext) !== -1) 
                PbxObject.available.splice(PbxObject.available.indexOf(ext), 1);
                
            var select2Cont = document.getElementById('select2-available-users-container');
            var options = [].slice.call(available.options);
            for(var i=0; i<available.options.length; i++) {
                if(available.options[i].value === ext) {
                    available.removeChild(available.options[i]);
                    if(select2Cont){
                        if(available.options.length)
                            select2Cont.textContent = available.options[0].value;
                        else
                            select2Cont.textContent = '';
                    }
                }
            }
            if(!available.options.length) {
                var add = document.getElementById('add-user');
                add.setAttribute('disabled', 'disabled');
            }

            // emmit event to trigger tour next step
            $('#new-user-form').trigger("users.create");

            if(cb) cb();
        } else {
            notify_about('error' , error && error.message);
        }
    });
}

function refreshUsersTable(cb){
    var availableSelect = document.getElementById('available-users');
    json_rpc_async('getObject', {oid: PbxObject.oid}, function(result){
        PbxObject.available = result.available.sort();

        makeElement(
            sortByKey(result.members, 'number'),
            document.getElementById('group-extensions').querySelector('tbody'),
            addMembersRow,
            true
        );

        makeElement(PbxObject.available.sort(), availableSelect, function(item){
            var option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            return option;
        }, true);

        $(availableSelect).trigger('change');

        remove_loading_panel();
        if(cb) cb(PbxObject.available);
    });
}

function cleanForm(formId){
    var form = document.getElementById(formId);
    form.reset();
    
    // var name = document.getElementById('user-name'),
    //     alias = document.getElementById('user-alias'),
    //     // followme = document.getElementById('user-num'),
    //     pass = document.getElementById('user-pass');
    
    // var inputs = [].slice.call(form.querySelectorAll('input'));
    // inputs.forEach(function(inp){
    //     inp.value = '';
    // });

    // if(name) name.value = "";
    // if(alias) alias.value = "";
    // // if(followme) followme.value = "";
    // if(pass) pass.value = "";
}

function checkHuntMode(e){
    var huntmode;
    if(e)
        huntmode = e.target;
    else
        huntmode = document.getElementById("huntmode1");
    if(huntmode.selectedIndex == 0)
        document.getElementById('huntmodesetts').classList.add('hidden');
    else
        document.getElementById('huntmodesetts').classList.remove('hidden');
}

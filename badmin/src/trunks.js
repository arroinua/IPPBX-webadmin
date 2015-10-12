function load_trunk(result){
    console.log(result);
    var type = result.type, types = [].slice.call(document.querySelectorAll('[name="trunkType"]'));
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'trunk';
    
    if(result.name)
        document.getElementById('objname').value = result.name;

    var enabled = document.getElementById('enabled');
    if(enabled) {
        enabled.checked = result.enabled;
        if(result.name) {
            addEvent(enabled, 'change', function(){
                // console.log(result.oid+' '+this.checked);
                json_rpc_async('setObjectState', '\"oid\":\"'+result.oid+'\", \"enabled\":'+this.checked+'', function(result){
                    // console.log(result);
                    if(result !== 'OK') enabled.checked = !(enabled.checked);
                });
            });
        }
    }
    if(result.status) {
        var el = document.getElementById('status');
        if(el) el.innerHTML = result.status;
    }
    if(result.protocol) {
        // document.getElementById('protocol').value = result.protocol;
        var option,
        kind = result.protocol == 'h323' ? 'h323' : 'sip',
        protocols = document.getElementById('protocols'),
        protoOpts = document.getElementById('get-proto-opts');

        if(result.name) {
            option = document.createElement('option');
            option.value = result.protocol;
            option.textContent = result.protocol;
            protocols.appendChild(option);
        } else if(result.protocols) {
            result.protocols.forEach(function(proto){
                option = document.createElement('option');
                option.value = proto;
                option.textContent = proto;
                if(proto == result.protocol) option.setAttribute('selected', 'selected');
                protocols.appendChild(option);
            });
            addEvent(protocols, 'change', function(){
                kind = this.value == 'h323' ? 'h323' : 'sip';
                switch_presentation(kind);
            });
        }
        addEvent(protoOpts, 'click', function(){
            get_protocol_opts(protocols.value, result.parameters);
        });
        if(!PbxObject.templates.protocol){
            $.get('/badmin/views/protocol.html', function(template){
                PbxObject.templates = PbxObject.templates || {};
                PbxObject.templates.protocol = template;
            });
        }
        PbxObject.protocolOpts = {};
        switch_presentation(kind);
    }

    types.forEach(function (item){
        if(item.value === result.type) {
            var label = item.parentNode;
            item.checked;
            $(label).button('toggle');
        };
    });

    if(result.domain)
        document.getElementById('domain').value = result.domain;

    document.getElementById('register').checked = result.register;
    if(result.user)
        type === 'external' ? document.getElementById('user').value = result.user : document.getElementById('int-trunk-user').value = result.user;
    if(result.pass)
        type === 'external' ? document.getElementById('pass').value = result.pass : document.getElementById('int-trunk-pass').value = result.pass;
    if(result.auth)
        document.getElementById('auth').value = result.auth;
    
    document.getElementById('regexpires').value = result.regexpires || 60;
    
    var radio = document.getElementById('proxy');
    addEvent(radio, 'change', function(){
        var inputs = document.getElementsByName('proxy');
        // if(this.checked) var disabled = false;
        // else disabled = true;
        for(var i=0;i<inputs.length;i++){
            inputs[i].disabled = !this.checked;
        }
    });
    radio.checked = result.proxy;
    var inputs = document.getElementsByName('proxy');
    for(var i=0;i<inputs.length;i++){
        inputs[i].disabled = !result.proxy;
    }
    if(result.paddr)
        document.getElementById('paddr').value = result.paddr;
    if(result.pauth)
        document.getElementById('pauth').value = result.pauth;
    if(result.ppass)
        document.getElementById('ppass').value = result.ppass;
    if(result.maxinbounds != undefined){
        document.getElementById('maxinbounds').value = isMaxNumber(result.maxinbounds) ? 16 : result.maxinbounds;
        document.getElementById('inmode').checked = result.maxinbounds > 0;
    }
    if(result.maxoutbounds != undefined){
        document.getElementById('maxoutbounds').value = isMaxNumber(result.maxoutbounds) ? 16 : result.maxoutbounds;
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

    switch_presentation((result.type ? result.type : 'external'), null, 'pl-trunk-kind');
    show_content();
    set_page();
    
}

function set_trunk(){
    var name = document.getElementById('objname').value,
        enabled = document.getElementById('enabled'),
        jprms,
        handler,
        types,
        type;

    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    
    show_loading_panel();

    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }

    types = [].slice.call(document.querySelectorAll('[name="trunkType"]'));
    types.forEach(function (item){
        if(item.checked) type = item.value;
    });
    
    jprms += '"kind":"trunk",';
    jprms += '"enabled":'+enabled.checked+',';

    var protocol = document.getElementById('protocols').value;
    var register = document.getElementById('register').checked;
    var proxy = document.getElementById('proxy').checked;
    jprms += '"protocol":"'+protocol+'",';
    jprms += '"type":"'+type+'",';
    if(type === 'external') {
        jprms += '"domain":"'+document.getElementById('domain').value+'",';
        jprms += '"register":'+register+',';
        if(register){
            jprms += '"user":"'+document.getElementById('user').value+'",';
            jprms += '"auth":"'+document.getElementById('auth').value+'",';
            jprms += '"pass":"'+document.getElementById('pass').value+'",';
            jprms += '"regexpires":'+document.getElementById('regexpires').value+',';
        }
        jprms += '"proxy":'+proxy+',';
        if(proxy){
            jprms += '"paddr":"'+document.getElementById('paddr').value+'",';
            jprms += '"pauth":"'+document.getElementById('pauth').value+'",';
            jprms += '"ppass":"'+document.getElementById('ppass').value+'",';
        }
    } else {
        jprms += '"user":"'+document.getElementById('int-trunk-user').value+'",';
        jprms += '"pass":"'+document.getElementById('int-trunk-pass').value+'",';
    }

    if(document.getElementById('inmode').checked)
        jprms += '"maxinbounds":'+document.getElementById('maxinbounds').value+',';
    else
        jprms += '"maxinbounds":0,';
    if(document.getElementById('outmode').checked)
        jprms += '"maxoutbounds":'+document.getElementById('maxoutbounds').value+',';
    else
        jprms += '"maxoutbounds":0,';

    jprms += '"parameters":{';
    var protoOpts = JSON.stringify(PbxObject.protocolOpts);
        protoOpts = protoOpts.substr(1, protoOpts.length-2);
        jprms += protoOpts;

    jprms += '},';
    jprms += '"inboundanumbertransforms":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '"inboundbnumbertransforms":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    jprms += '"outboundanumbertransforms":[';
    jprms += encode_transforms('transforms3');
    jprms += '],';
    jprms += '"outboundbnumbertransforms":[';
    jprms += encode_transforms('transforms4');
    jprms += ']';

    console.log(jprms);
    json_rpc_async('setObject', jprms, function(result){
        if(result !== 'OK') 
            if(handler) handler();
        else{
            if(enabled.checked) enabled.checked = false;
        }
    }); 
};
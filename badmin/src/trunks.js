function load_trunk(result){
    // console.log(result);
    var type = result.type, types = [].slice.call(document.querySelectorAll('[name="trunkType"]'));

    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'trunk';

    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');

    if(result.name)
        name.value = result.name;


    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

    if(result.status) {
        var el = document.getElementById('status');
        if(el) el.innerHTML = result.status;
    }

    if(result.up !== undefined) {
        changeTrunkRegState(result.up);
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
        } else {
            result.protocols.forEach(function(proto){
                option = document.createElement('option');
                option.value = proto;
                option.textContent = proto;
                
                if(proto === 'sip') option.setAttribute('selected', 'selected');
                
                protocols.appendChild(option);
            });

            if(protocols.value !== 'sip') protocols.value = result.protocol;


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
        } else {
            // if trunk already created - remove checkbox
            if(result.name) item.parentNode.parentNode.removeChild(item.parentNode);
        }
    });

    if(result.domain) document.getElementById('domain').value = result.domain;
    document.getElementById('register').checked = result.register;
    
    document.getElementById('user').value = result.user || '';
    document.getElementById('pass').value = result.pass || '';

    document.getElementById('int-trunk-user').value = result.gateway ? result.gateway.regname : (result.user || '');
    document.getElementById('int-trunk-pass').value = result.gateway ? result.gateway.regpass : (result.pass || '');

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

    renderTrunkIncRoute({
        route: result.inboundbnumbertransforms.filter(getCurrIncRoutes)[0],
        frases: PbxObject.frases
    });

    // renderTrunkOutRoute();
    
}

function changeTrunkRegState(up) {
    var enabled = document.getElementById('enabled');
    up ? enabled.classList.remove('unregistered') : enabled.classList.add('unregistered');
}

function getCurrIncRoutes(transform) {
    return (transform.number === '.' && transform.strip && transform.prefix);
}

function getRouteOptions(cb) {
    if(PbxObject.extensions.length) {
        cb(PbxObject.extensions);
    } else {
        getExtensions(function(result) {
            cb(result);
        });
    }
}

function renderTrunkIncRoute(params) {

    var route = null;

    getRouteOptions(function(options) {
        if(params.route) {
            route = options.filter(function(item) {
                return (item.ext === params.route.prefix);
            })[0];
        }

        console.log('renderTrunkIncRoute: ', route);

        // Render incoming route parameter
        ReactDOM.render(
            TrunkIncRoute({
                options: options,
                route: route,
                frases: params.frases,
                onChange: setTrunkIncRoute
            }),
            document.getElementById('trunk-inc-route')
        );
    });
    
    clearTempParams();
    
}

function renderTrunkOutRoute() {
    // Render incoming route parameter
    ReactDOM.render(
        TrunkOutRoutes({
            frases: PbxObject.frases,
            onChange: setTrunkOutRoute
        }),
        document.getElementById('trunk-out-routes')
    );
}

function setTrunkIncRoute(route) {
    console.log('setTrunkIncRoute: ', route);
    updateTempParams(route);
}

function setTrunkOutRoute(route) {
    console.log('setTrunkOutRoute: ', route);
    
}

// function setTrunkState(oid, state, callback) {
//     json_rpc_async('setObjectState', {
//         oid: oid,
//         enabled: state
//     }, function(result){
//         callback(result);
//     });
// }

function set_trunk(){
    var name = document.getElementById('objname').value,
        enabled = document.getElementById('enabled'),
        protoOpts,
        jprms,
        handler,
        types,
        type;

    var incATrasf;
    var incBTrasf;
    var outATrasf;
    var outBTrasf;
    var incRoutes;

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
        if(item.checked) {
            type = item.value;
        } else {
            // if trunk already created - remove checkbox
            item.parentNode.parentNode.removeChild(item.parentNode);
        }
        
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
        protoOpts = JSON.stringify(PbxObject.protocolOpts);
        protoOpts = protoOpts.substr(1, protoOpts.length-2);
        jprms += protoOpts;

    incATrasf = transformsToArray('transforms1');
    incBTrasf = transformsToArray('transforms2');
    outATrasf = transformsToArray('transforms3');
    outBTrasf = transformsToArray('transforms4');

    if(getTempParams().ext) {
        incRoute = incBTrasf.filter(getCurrIncRoutes)[0];

        if(!incRoute) {
            incBTrasf.push({ number: '.', strip: true, prefix: getTempParams().ext});
            // append_transform(null, 'transforms1', { number: '.', strip: true, prefix: getTempParams().ext });
        } else {
            incBTrasf.map(function(item) {
                if(item == incRoute) 
                    return item.prefix = getTempParams().ext;
                else 
                    return item;
            });
        }

        clearTable(document.querySelector('#transforms2 tbody'));
        append_transforms('transforms2', incBTrasf);

    }

    jprms += '},';
    jprms += '"inboundanumbertransforms":';
    jprms += JSON.stringify(incATrasf);
    jprms += ', "inboundbnumbertransforms":';
    jprms += JSON.stringify(incBTrasf);
    jprms += ', "outboundanumbertransforms":';
    jprms += JSON.stringify(outATrasf);
    jprms += ', "outboundbnumbertransforms":';
    jprms += JSON.stringify(outBTrasf);

    // console.log(jprms);
    json_rpc_async('setObject', jprms, function(result){
        if(result) {
            if(handler) handler();
        } else {
            if(enabled.checked) enabled.checked = false;
        }

        // else{
        //     if(enabled.checked) enabled.checked = false;
        // }
    });
};
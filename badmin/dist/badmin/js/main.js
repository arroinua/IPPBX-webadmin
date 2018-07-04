function load_application(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;

    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');

    if(result.name){
        name.value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }
    
    // if(result.enabled)
    //     document.getElementById('enabled').checked = result.enabled;
    if(result.debug)
        document.getElementById('debug').checked = result.debug;
    // if(result.status)
    //     document.getElementById('status').innerHTML = result.status;
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

    // Render route parameters
    renderObjRoute({
        routes: result.routes || [],
        frases: PbxObject.frases,
        onChange: setCurrObjRoute
    });
    
    show_content();
    set_page();
}

function set_application(){
    show_loading_panel();
    var tbody = document.getElementById('appvariables').getElementsByTagName('tbody')[0];
    var name = document.getElementById('objname').value;
    var jprms = '\"name\":\"'+name+'\",';
    jprms += '"enabled":'+document.getElementById('enabled').checked+',';
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    
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
    
    json_rpc_async('setObject', jprms, function(result) {

        set_object_success(result)

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
function load_attendant(result){
    // console.log('attendant', result);
    PbxObject.oid = result ? result.oid : '';
    PbxObject.name = result ? result.name : '';

    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');
    var attTour = {};

    if(result.name){
        name.value = result.name;
    } else {
        getObjects(null, function(objs) {
            if(!filterObject(objs, 'attendant').length) {
                // attTour = MyTour('attendant', PbxObject.tours.attendant()).start();
                // updateTempParams({ tour: true });
            }
        });
    }

    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

    if(result.debug)
        document.getElementById('debug').checked = result.debug;

    //init page
    show_content();
    set_page();
    setInitAttParams();
    // setAttBreadcrumb();
    makeActiveCanvas();

    getAttTemplate('attendant_object', function(temp){
        // if(result.parameters && result.parameters.length)
            setAttSettings(result.parameters, temp);
        // else
            // setInitAttSettings();
    });

    var add = document.getElementById('addConnector');
    add.onclick = function(){
        addConnector();
    };
    json_rpc_async('getExtensions', null, function(result){
        var routes = result.filter(function(obj){
            return (obj.kind !== 'trunk' && obj.kind !== 'cli' && obj.kind !== 'timer' && obj.kind !== 'routes' && obj.kind !== 'pickup');
        });
        PbxObject.attendant.routes = routes;
    });

    // Render route parameters
    renderObjRoute({
        routes: result.routes || [],
        frases: PbxObject.frases,
        onChange: setCurrObjRoute
    });

    // sortByKey(PbxObject.attendant.connectors, 'ext');
    // addAttBreadcrumb('<i class="fa fa-home"></i>', '');
}

function setInitAttParams(){
    PbxObject.attendant = {
        currentPid: '',
        routes: [],
        connectors: [],
        objects: {},
        buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '#', '*'],
        availableButtons: [],
        types: {
            menu: 'menu',
            commutator: 'commutator',
            mail: 'mail'
        }
    };
}

// function initAttObjTour(type) {
//     console.log('initAttObjTour: ', type);
//     var tour = {};
//     if(type === PbxObject.attendant.types.menu && getTempParams().menuTour) {
//         tour = MyTour('attendantMenu', PbxObject.tours.attendantMenu());
//         console.log('initAttObjTour menu tour: ', tour);

//         tour.start();

//         updateTempParams({ menuTour: false });
//     } else if(type === PbxObject.attendant.types.mail && getTempParams().emailTour) {
//         tour = MyTour('attendantEmail', PbxObject.tours.attendantEmail());
//         console.log('initAttObjTour email tour: ', tour);

//         tour.start();

//         updateTempParams({ emailTour: false });
//     }
// }

function changeAvailableButtons(buttons, canvas){
    var canv = canvas || document.querySelector('.att-canvas.active'),
        availableButtons = [],
        obj;

    if(typeof buttons === 'object'){
        availableButtons = [].concat(buttons);
    } else {
        availableButtons = JSON.parse(canv.getAttribute('data-available-buttons'));
        btnIndex = availableButtons.indexOf(buttons);
        if(btnIndex !== -1)
            availableButtons.splice( btnIndex, 1);
        else
            availableButtons.splice( btnIndex, 0, buttons);
    }

    PbxObject.attendant.availableButtons = PbxObject.attendant.buttons.map(function(button){
        obj = {};
        obj.button = button;
        if(availableButtons.indexOf(button) === -1){
            obj.disabled = true;
        } else{
            obj.disabled = false;
        }
        return obj;
    });
    
    canv.setAttribute('data-available-buttons', JSON.stringify(availableButtons));
}

function createCanvas(parent){
    var cont = document.getElementById('att-container');

    var canv = document.createElement('div');
    canv.className = 'att-canvas active';
    if(parent !== undefined)
        canv.setAttribute('data-parent', parent);

    cont.appendChild(canv);

    createInitButton(canv);
    changeAvailableButtons(PbxObject.attendant.buttons);
    // changeAvailableButtons(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '#', '*']);
    addAttObjects(PbxObject.attendant.objects, parent);
}

function makeActiveCanvas(canvasId){
    if(canvasId !== undefined) { PbxObject.attendant.currentPid = canvasId; }

    var canvases = [].slice.call(document.querySelectorAll('.att-canvas')),
        toPrevMenuBtn = document.getElementById('toPrevCanvas'),
        availableButtons = [],
        canvas = false,
        pid;

    canvases.forEach(function(canv){
        pid = canv.getAttribute('data-parent');

        if(pid === canvasId || (!canvasId && !pid)){
            canv.classList.add('active');
            canvas = canv;
        } else{
            canv.classList.remove('active');
        }
    });

    if(!canvas){
        createCanvas(canvasId);
    } else {
        changeAvailableButtons(JSON.parse(canvas.getAttribute('data-available-buttons')));
        // PbxObject.attendant.availableButtons = JSON.parse(canvas.getAttribute('data-available-buttons'));
    }
    setSchemaActiveEl(canvasId || '');
    if(toPrevMenuBtn)
        if(canvasId && toPrevMenuBtn.className === 'hidden')
            toPrevMenuBtn.className = '';
        else if(!canvasId)
            toPrevMenuBtn.className = 'hidden';

    toTheTop('att-container');
}

function removeCanvases(oid){
    var canvs = [].slice.call(document.querySelectorAll('.att-canvas')),
        exp = new RegExp(oid+"\d*"),
        parent;

    canvs.forEach(function(canv){
        parent = canv.getAttribute('data-parent');
        if(exp.test(parent))
            canv.parentNode.removeChild(canv);
    });
}

function toPrevCanvas(e){
    if(e) e.preventDefault();
    var activeCanvas = document.querySelector('.att-canvas.active'),
        pid = activeCanvas.getAttribute('data-parent'),
        newCanvId = pid.substr(0, pid.length-1);

    makeActiveCanvas(newCanvId);
}

// function getCanvasById(id){
//     var canvs = [].slice.call(document.querySelector('.att-canvas')),
//         canvId;
    
//     canvs.forEach(function(canv){
//         canvId = canv.getAttribute('data-parent');
//         if(canvasId == id) return canv;
//     });
// }

function createInitButton(canvas){
    var bwrapper = document.createElement('div'),
        activeCanvas = canvas || document.querySelector('.att-canvas.active');

    bwrapper.className = 'dropdown att-init-button';

    bwrapper.innerHTML = '<button class="btn btn-default dropdown-toggle dropdown-round" type="button" id="att-obj-types" data-toggle="dropdown" aria-expanded="true">'+
                            '<i class="fa fa-plus"></i>'+
                        '</button>'+
                        '<ul class="dropdown-menu" role="menu" aria-labelledby="att-obj-types">'+
                            '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-type="'+PbxObject.attendant.types.menu+'"><i class="fa fa-music"></i> '+PbxObject.frases.ATTENDANT.MENU+'</a></li>'+
                            '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-type="'+PbxObject.attendant.types.mail+'"><i class="fa fa-envelope"></i>  '+PbxObject.frases.ATTENDANT.MAIL+'</a></li>'+
                            (PbxObject.attendant.currentPid ? '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-type="'+PbxObject.attendant.types.commutator+'"><i class="fa fa-phone"></i>  '+PbxObject.frases.ATTENDANT.COMMUTATOR+'</a></li>' : '')+
                        '</ul>';
    
    addEvent(bwrapper, 'click', function(e){
        if(e) e.preventDefault();

        var curTarget = e.currentTarget;
        var targ = e.target;

        if(elPosition(curTarget) === 'top'){
            curTarget.className = 'dropup att-init-button';
        } else{
            curTarget.className = 'dropdown att-init-button';
        }

        if(targ.nodeName !== 'A')
            targ = targ.parentNode;
        var otype = targ.getAttribute('data-type');
        if(otype) showAttObjectSetts({type: otype});
    })

    activeCanvas.appendChild(bwrapper);
}

function setInitAttMoveBtns(params){
    var buttons = PbxObject.attendant.buttons,
        moveBack = document.getElementById('moveBack'),
        moveMmenu = document.getElementById('moveMmenu');

    fillBtnsSelectList(buttons, moveBack, params.moveBack);
    fillBtnsSelectList(buttons, moveMmenu, params.moveMmenu);
}

function fillBtnsSelectList(array, selectEl, selectedValue){
    var option, fragment = document.createDocumentFragment();
    array.forEach(function(item){
        option = document.createElement('option');
        option.value = item;
        option.innerHTML = item;
        if(item === selectedValue) option.setAttribute('selected', 'selected');

        fragment.appendChild(option);
    });
    selectEl.appendChild(fragment);
}

function strToJson(str) {
    var pattern1 = new RegExp(/([\d\w]+)(=+)(?!\{)([\d\w@\-_.\s,?!*%$^&#+]*)(?=\,|\})/, 'g');
    var pattern2 = new RegExp(/([\d\w#*]+)(=+)(?=\{)/, 'g');
    return str
    .replace(pattern1, function(full, key, equal, value) {
        if(value !== 'null') value = JSON.stringify(value);
        return '"'+key+'":'+value;
    })
    .replace(pattern2, function(full, key, equal) {
        return '"'+key+'":';
    });
}

function setAttSettings(params, temp){
    var objects, settsForm = document.getElementById('attvariables'),
        greetsFile = '',
        ringbackMusic = '',
        connFailedFile = '',
        leaveMsg = '',
        moveBtns = {},
        value = null;

    if(params && settsForm)
        setFormData(settsForm, params);

    params.forEach(function(obj){
        if(obj.key === 'jsonString'){
            // value = strToJson(obj.value);
            value = obj.value;
            objects = JSON.parse(value);
            PbxObject.attendant.objects = objects;
        } else if(obj.key === 'connectors'){
            // value = strToJson(obj.value);
            value = obj.value;
            addConnectors(JSON.parse(value));
        } else if(obj.key === 'greetings'){
            greetsFile = obj.value;
        } else if(obj.key === 'ringbackMusic'){
            ringbackMusic = obj.value;
        } else if(obj.key === 'connectionFailed'){
            connFailedFile = obj.value;
        } else if(obj.key === 'leaveMessage'){
            leaveMsg = obj.value;
        } else if(obj.key === 'moveBack'){
            moveBtns.moveBack = obj.value;
        } else if(obj.key === 'moveMmenu'){
            moveBtns.moveMmenu = obj.value;
        }
    });

    if(!params.length){
        moveBtns.moveBack = '#';
        moveBtns.moveMmenu = '*';
    }

    customize_upload('attGreetings', greetsFile);
    customize_upload('ringbackMusic', ringbackMusic);
    customize_upload('connectionFailed', connFailedFile);
    customize_upload('leaveMessage', leaveMsg);
    setInitAttMoveBtns(moveBtns);
    addAttObjects(objects, '');
    buildSchema(objects);
}

function buildSchema(objects){
    var schema = document.getElementById('att-schema'),
        keyParent, list, litem, array = [];

    addToSchema('home', {name: '<i class="fa fa-home"></i>', type: PbxObject.attendant.types.menu}, schema); //add home level;

    for(key in objects){
        if(objects.hasOwnProperty(key)){
            array.push(objects[key]);
        }
    }
    sortByKey(array, 'oid');
    array.forEach(function(item){
        keyParent = item.oid.substr(0, item.oid.length-1);
        if(item.oid === '0'){
            list = schema.querySelector('ul[data-oid="home"]');
        } else{
            list = schema.querySelector('ul[data-oid="'+keyParent+'"]');
        }
        addToSchema(item.oid, item, list);
    });
    addEvent(schema, 'click', setAttPosition);
}

function addToSchema(oid, params, listEl){
    var parentId = oid.substr(0, oid.length-1), li, el;
    if(listEl)
        el = listEl;
    else
        el = (oid !== '0') ? document.querySelector('#att-schema ul[data-oid="'+parentId+'"]') : document.querySelector('#att-schema ul[data-oid="home"]');
        
    li = createSchemaBranch(oid, params);
    el.appendChild(li);
}

function createSchemaBranch(oid, params){
    var li = document.createElement('li');
    li.setAttribute('data-oid', oid);
    if(params.type === PbxObject.attendant.types.menu){
        if(oid === 'home'){
           li.className = 'active'; 
        }
        // li.innerHTML = '<a href="#'+(oid === 'home' ? '' : oid)+'">'+params.name+'</a><ul data-oid="'+oid+'"></ul>';
        li.innerHTML = '<label class="fa fa-minus" for="t-'+oid+'"></label>'+
                        '<input type="checkbox" name="tree-node" id="t-'+oid+'"/>'+
                        ' <a href="#'+(oid === 'home' ? '' : oid)+'">'+params.name+
                        (params.button ?
                        '<small class="nowrap text-muted"> '+generateAttObjPath(oid)+'</small>' : '')+
                        // '<small class="nowrap text-muted"> '+PbxObject.frases.ATTENDANT.BUTTON+' '+params.button+'</small>' : '')+
                        '</a>'+
                        '<ul data-oid="'+oid+'"></ul>';
    } else{
        li.innerHTML = params.name;
        if(params.button && params.button !== 'null') 
            li.innerHTML += ' <small class="nowrap text-muted"> '+generateAttObjPath(oid)+'</small>';
    }

    return li;
}

function rebuildSchema(){
    var schema = document.getElementById('att-schema');

    if(schema.children[0]){
        schema.removeChild(schema.children[0]);
    }

    buildSchema(PbxObject.attendant.objects);
    setSchemaActiveEl(PbxObject.attendant.currentPid);
}

function removeFromSchema(oid){
    var el = document.querySelector('#att-schema li[data-oid="'+oid+'"]');
    el.parentNode.removeChild(el);
}

function setSchemaActiveEl(hash){
    var schema = document.getElementById('att-schema'),
        el = schema.querySelector('li a[href="#'+hash+'"]'),
        activeEl = schema.querySelector('li.active');

    if(el){
        if(activeEl) activeEl.className = '';
        el.parentNode.className = 'active';
    }
}

function addAttObjects(objects, id){
    if(objects){
        for(key in objects){
            if(objects.hasOwnProperty(key)){
                if(key.substr(0, key.length-1) == id)
                    addAttObject(objects[key]);
            }
        }
    }
}

function addAttObject(params, instance){
    var obj = new AttObject(params),
        activeCanvas = document.querySelector('.att-canvas.active'),
        oid = PbxObject.attendant.currentPid + (params.button ? params.button : 0),
        msg = '', prevOid;
    
    if(!params.button){
        var initBtn = activeCanvas.querySelector('.att-init-button');
        if(initBtn && isMainEl()) initBtn.parentNode.removeChild(initBtn); //remove init button if main element created
    } else {
        changeAvailableButtons(params.button, activeCanvas);
    }

    if(instance){
        activeCanvas.insertBefore(obj, instance.element);
        instance.removeElement(null, instance.params);

        if(instance.params.button !== params.button){
            prevOid = PbxObject.attendant.currentPid + instance.params.button;
            changeObjectsParent(prevOid, oid);
        }
    } else{
        activeCanvas.insertBefore(obj, activeCanvas.lastChild);
    }

    params.oid = oid;
    if(PbxObject.attendant.objects[oid] !== params){
        PbxObject.attendant.objects[oid] = params;
        if(instance){
            rebuildSchema();
        } else{
            addToSchema(oid, params);
        }
    }
}

function AttObject(params){

    var data = formAttParams(params),
        temp = PbxObject.templates['attendant_object'],
        rendered = Mustache.render(temp, data),
        wrapper = document.createElement('div'),
        oid = PbxObject.attendant.currentPid + (params.button ? params.button : 0);


    wrapper.className = 'att-obj-wrapper';
    wrapper.innerHTML = rendered;

    var enterBtn = wrapper.querySelector('#enter-att-menu'),
        editBtn = wrapper.querySelector('#edit-att-object'),
        removeBtn = wrapper.querySelector('#remove-att-object');
        removeTreeBtn = wrapper.querySelector('#remove-att-tree');

    if(enterBtn){
        addEvent(enterBtn, 'click', function(e){
            this.enterAttMenu(e, params);
        }.bind(this));
    }
    if(editBtn){
        addEvent(editBtn, 'click', function(e){
            this.editObject(e, params);
        }.bind(this));
    }
    if(removeBtn){
        addEvent(removeBtn, 'click', function(e){
            this.removeElement(e, params);
        }.bind(this));
    }
    if(removeTreeBtn){
        addEvent(removeTreeBtn, 'click', function(e){
            this.removeElement(e, params, true);
        }.bind(this));
    }

    this.oid = oid;
    this.params = params;
    this.element = wrapper;


    return wrapper;
}

AttObject.prototype.enterAttMenu = function(e, params){
    var e = e || window.event;
    e.preventDefault();

    makeActiveCanvas(this.oid);
    // setSchemaActiveEl('#'+this.oid);
    // addAttBreadcrumb(params.name, this.oid);
}
AttObject.prototype.editObject = function(e, params){
    var e = e || window.event;
    e.preventDefault();
    showAttObjectSetts(this.params, this);

}
AttObject.prototype.removeElement = function(e, params, deep){
    // var e = e;
    if(e) e.preventDefault();

    var enterBtn = this.element.querySelector('#enter-att-menu'),
        editBtn = this.element.querySelector('#edit-att-object'),
        removeBtn = this.element.querySelector('#remove-att-object');
        removeTreeBtn = this.element.querySelector('#remove-att-tree');

    //remove event listeners
    if(enterBtn){ // only if the object type is "menu"
        removeEvent(enterBtn, 'click', function(){
            this.enterAttMenu(e, params);
        }.bind(this));
    }
    if(editBtn){
        removeEvent(editBtn, 'click', function(){
            this.editObject(e, params);
        }.bind(this));
    }
    if(removeBtn){
        removeEvent(removeBtn, 'click', function(e){
            this.removeElement(e);
        }.bind(this));
    }
    if(removeTreeBtn){
        removeEvent(removeTreeBtn, 'click', function(e){
            this.removeElement(e);
        }.bind(this));
    }

    this.element.parentNode.removeChild(this.element);

    if(e){
        removeObject(this.oid, deep);
        removeFromSchema(this.oid);
        if(this.oid == '0') createInitButton();
    } else {
        removeObject(this.oid);
    }
    
    changeAvailableButtons(params.button);
}

function removeObject(oid, deep){
    var obj, 
        objects = PbxObject.attendant.objects,
        attName = document.getElementById('objname').value,
        exp = deep ? new RegExp(oid+"\d*") : new RegExp("^"+oid+"$");

    for(var key in objects){
        if(objects.hasOwnProperty(key)){
            if(exp.test(key)){
                // obj = objects[key];
                // if(obj.type === PbxObject.attendant.types.menu){
                //     if(obj.data && !obj.file)
                //         console.log('/attendant/'+attName+'/'+obj.data);
                //         // deleteFile('/attendant/'+attName+'/'+obj.data);
                // }
                delete objects[key];
            }
        }
    }
    removeCanvases(oid);
}

function changeObjectsParent(prevParent, newParent){
    var objects = PbxObject.attendant.objects,
        exp = new RegExp(prevParent+"\d*"),
        newKey = '';
    for(var key in objects){
        if(objects.hasOwnProperty(key)){
            if(exp.test(key)){
                newKey = key.replace(prevParent, newParent);
                objects[newKey] = objects[key];
                objects[newKey].oid = newKey;
                delete objects[key];
            }
        }
    }
}

function checkParams(params){
    var msg = '';
    if(!params.button && !isMainEl()){
        msg += PbxObject.frases.ATT__BTN_MISSED+'\n';
    } 
    if(params.type !== PbxObject.attendant.types.menu && !params.connector){
        msg += PbxObject.frases.ATT__CONN_MISSED+'\n';
    }
    if(params.type === PbxObject.attendant.types.menu && !params.file) {
        msg += PbxObject.frases.ATT__AUDIO_FILE_MISSED+'\n';
    }

    if(msg !== ''){
        alert(msg);
        return false;
    } else{
        return true;
    }
}

function showAttObjectSetts(params, object){
    // console.log('showAttObjectSetts', params);

    // if(params.data && !params.file){
    //     params.dataUnchanged = true;
    // }

    function setAttObjectOnKeypress(e) {
        if(e.keyCode == 10 || e.keyCode == 13) {
            setAttObject(params, object);
        }
    }

    var renderParams = formAttParams(params);

    console.log('showAttObjectSetts data: ', renderParams);
    getAttTemplate('attendant_modal', function(temp){

        var rendered = Mustache.render(temp, renderParams);
        if(!cont){
            cont = document.createElement('div');
            cont.id = 'att-setts-cont';
            $('#pagecontainer').prepend(cont);
        }
        $(cont).html(rendered);

        var cont = document.getElementById('att-setts-cont'),
        dataEl = document.getElementById('att-setts-data'),
        connEl = document.querySelector('#att-setts-form select[name="data"]'),
        btnEl = document.querySelector('#att-setts-form select[name="button"]');

        if(connEl && params.connector) connEl.value = params.connector;
        if(btnEl && params.button) btnEl.value = params.button;
        if(params.type === PbxObject.attendant.types.menu)
            customize_upload('audioFile', (params.data || ''));

        $('#set-att-object').on('click', function(e){
            setAttObject(params, object);
        });

        $('#att-setts-modal [data-toggle="popover"]').popover({
            placement: 'top',
            trigger: 'focus'
        });

        // render 'data' element
        if(dataEl) {
            ReactDOM.render(Select3({
                name: "data",
                placeholder: PbxObject.frases.ATTENDANT.DATA_PLACEHOLDER,
                frases: PbxObject.frases,
                value: { value: renderParams.data.data, label: renderParams.data.data },
                options: renderParams.connectors
            }), dataEl);
        }

        // trigger modal events
        // $("#att-setts-modal .select2").select2();
        $('#att-setts-modal').on('shown.bs.modal', function(){
            document.querySelector('#att-setts-modal input[name="name"]').focus();
        });
        $('#att-setts-modal').on('hide.bs.modal', function() {
            $('#att-setts-modal [data-toggle="popover"]').popover('destroy');
            $('#set-att-object').off('click', function(e){
                setAttObject(params, object);
            });
        });

        $('#att-setts-modal').modal();

    });
}

function setAttObject(params, object){

    var attParams = collectAttParams(params);

    if(!checkParams(attParams)) return;
    if(object){
        addAttObject(attParams, object);
    } else{
        addAttObject(attParams);
    }
    $('#att-setts-modal').modal('hide');
}

function collectAttParams(instParams){
    var cont = document.getElementById('att-setts-cont'),
        objType = instParams.type,
        el = objType === PbxObject.attendant.types.menu ? 'input' : 'select',
        // data = cont.querySelector(el+'[name="data"]').value,
        connectorName,
        data = '',
        params = {};

    if(!isMainEl()) params.button = cont.querySelector('select[name="button"]').value;
    else params.button = null;
    params.name = cont.querySelector('input[name="name"]').value || generateAttObjName(objType, params.button);
    params.type = objType;
    // if(data) params.data = data;

    if(objType === PbxObject.attendant.types.menu){
        var fileEl = cont.querySelector('input[type="file"]'),
            digits = cont.querySelector('[name="digits"]');

        if(fileEl){
            if(fileEl.files.length){
                // params.file = fileEl.cloneNode(false); //clone element that holds audio file and pass it as a parameter
                params.file = fileEl;
                params.data = fileEl.files[0].name;
                // data = fileEl.files[0].name;
            } else if(instParams.file){
                params.file = instParams.file;
            }
        }
        // if(data){
        //     params.data = data;
        // }
        if(!params.data && instParams.file){
            params.data = instParams.file.files[0].name;
            // params.data = instParams.file.value;
        }
        // else{
        //     var title = cont.querySelector('.upload-filename');
        //     if(title) params.data = title.textContent;
        // }
        
        params.digits = digits.checked ? '14' : '1';

    } else{
        connectorName = cont.querySelector('[name="data"]').value;
        params.data = connectorName;
        params.connector = connectorName;
        // params.data = getConnectorNumber(data);
    }

    if(objType === PbxObject.attendant.types.mail){
        var subject = cont.querySelector('input[name="subject"]'),
            body = cont.querySelector('textarea[name="body"]');

        params.subject = subject.value;
        params.body = body.value;
    }

    return params;
}

function formAttParams(data){
    // var emailPattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
        // pattern = (data.type === PbxObject.attendant.types.mail) ? emailPattern : '',
    var params = {
        data: data,
        pid: PbxObject.attendant.currentPid,
        connectors: [],
        buttons: PbxObject.attendant.availableButtons,
        frases: PbxObject.frases,
        typeMenu: function(){
            return (this.data.type == PbxObject.attendant.types.menu);
        },
        typeCommutator: function(){
            return (this.data.type == PbxObject.attendant.types.commutator);
        },
        typeEmail: function(){
            return (this.data.type == PbxObject.attendant.types.mail);
        },
        allowMultipleDigits: function(){
            return (this.data.digits === '14' ? true : false);
        },
        objType: function(){
            return this.frases.ATTENDANT[this.data.type.toUpperCase()];
        }
    };
    params.data.name = params.data.name || generateAttObjName(params.data.type, params.pid);
    if(data.type === PbxObject.attendant.types.commutator) {
        // filter out emails and concat routes
        params.connectors = PbxObject.attendant.connectors.filter(function(item) {
            return item.ext.indexOf('@') === -1;
        });
        params.connectors = params.connectors.concat(PbxObject.attendant.routes);

    } else if(data.type === PbxObject.attendant.types.mail) {
        // filter only emails
        params.connectors = PbxObject.attendant.connectors.filter(function(item) {
            console.log('fliter: ', item);
            return item.ext.indexOf('@') !== -1;
        });
    }
    params.connectors = params.connectors.map(formatConnectors);
    sortByKey(params.connectors, 'ext');

    return params;
}

function formatConnectors(object) {
    return {
        value: object.ext,
        label: (object.name ? (object.ext + ' - ' + object.name) : object.ext)
    };
}

function generateAttObjName(type, button, objName){
    // if(!button && button !== null) return;
    var value = "";
    if(!PbxObject.attendant.currentPid && !objName){
        value = type === PbxObject.attendant.types.menu ? PbxObject.frases.ATTENDANT.MAIN_MENU : PbxObject.frases.ATTENDANT.MAIL;
    } else {
        value = objName || PbxObject.frases.ATTENDANT[type.toUpperCase()];
    }

    console.log('generateAttObjPath: ', value);
    
    return value;
}

function generateAttObjPath(oid){
    return oid.replace('0', '')
        .split('')
        .reduce(function(prev, curr){
            return prev+'.'+curr;
        });
}

function setAttPosition(e){
    var e = e || window.event;
    if(e){
        var targ = e.target;
        if(targ.nodeName === 'LABEL'){
            if(targ.className === 'fa fa-plus'){
                targ.className = 'fa fa-minus';
            } else{
                targ.className = 'fa fa-plus';
            }
        }
        if(targ.nodeName !== 'A')
            targ = targ.parentNode;
        if(targ.nodeName === 'A'){
            e.preventDefault();
            var canv = targ.href.substr(targ.href.indexOf('#')+1),
                hash = targ.hash;

            makeActiveCanvas(canv);    
        }
    }

    // setSchemaActiveEl(hash);
    // rebuildBreadcrumb(hash);
}

function addConnectors(array){
    var table = document.getElementById('attconnectors').querySelector('tbody');
    array.forEach(function(obj){
        table.appendChild(createConnectorRow(obj));
        PbxObject.attendant.connectors.push(obj);
    });
}

function addConnector(e) {
    var e = e || window.event;
    if(e && e.type == 'click')
        e.preventDefault();

    var table = document.getElementById('attconnectors'),
        tbody = table.querySelector('tbody'),
        name = table.querySelector('input[name="connName"]'),
        val = table.querySelector('input[name="connVal"]'),
        connectors = PbxObject.attendant.connectors,
        valid = true,
        data = {};

    Utils.validateElement(name, name.parentNode);
    Utils.validateElement(val, val.parentNode);

    if(!val.value || !name.value) return false;

    data = {name: name.value, ext: val.value};
    tbody.appendChild(createConnectorRow(data));
    
    //clear fields
    name.value = '';
    val.value = '';

    connectors.push(data);
    
}

// function getConnectorNumber(connName){
//     var val;
//     PbxObject.attendant.connectors.forEach(function(conn){
//         if(conn.name === connName)
//             val = conn.ext;
//     });

//     if(!val)
//         console.error('Connector not found!');
//     else
//         return val;
// }

function removeConnector(object){
    var conns = PbxObject.attendant.connectors;
    conns.forEach(function(conn, index){
        if(conn.name === object.name)
            conns.splice(index, 1);
    });
}

function createConnectorRow(object){
    
    var e = e || window.event;
    if(e && e.type == 'click')
        e.preventDefault();

    var row = document.createElement('tr'),
        cell, div, inp;
    
    cell = row.insertCell(0);
    if(object && object.name) cell.textContent = object.name;
    cell = row.insertCell(1);
    if(object && object.ext) cell.textContent = object.ext;
    cell = row.insertCell(2);
    inp = document.createElement('a');
    inp.href = '#';
    inp.className = 'remove-clr';
    inp.innerHTML = '<i class="fa fa-close"></i>';
    addEvent(inp, 'click', function(e){
        remove_row(e);
        removeConnector(object);
    });
    cell.appendChild(inp);
    return row;
}

function getAttTemplate(tempName, cb){
    PbxObject.templates = PbxObject.templates || {};
    var template = PbxObject.templates[tempName];
    if(!template){
        $.get('/badmin/views/'+tempName+'.html', function(temp){
            PbxObject.templates[tempName] = temp;
            cb(temp);
        });
    } else {
        cb(template);
    }
}

function filterByPattern(array, pattern){
    if(pattern){
        var pt = new RegExp(pattern),
            newArr = array.filter(function(item){
                // console.log(pattern, item.value, pt.test(item.value));
                return pt.test(item.ext);
            });
        return newArr;
    } else{
        return array;
    }
        
}

function isMainEl(){
    return PbxObject.attendant.currentPid ? false : true;
}

function set_attendant(){
    // show_loading_panel();

    var jprms, 
        name = document.getElementById('objname').value,
        cont = document.querySelector('.att-container'),
        objects = PbxObject.attendant.objects;

    var varsFormData = retrieveFormData(document.getElementById('attvariables'));
    var greetings = document.getElementById('attGreetings');
    var ringbackMusic = document.getElementById('ringbackMusic');
    var connFailedPrompt = document.getElementById('connectionFailed');
    var leaveMsg = document.getElementById('leaveMessage');
    var prefix = PbxObject.options.prefix;
    var algdir = 'users'+(prefix ? '/'+prefix : '')+'/attendant/'+name+'/';

    if(greetings.files[0])
        upload(greetings, '/attendant/'+name+'/'+greetings.files[0].name);
    if(ringbackMusic.files[0])
        upload(ringbackMusic, '/attendant/'+name+'/'+ringbackMusic.files[0].name);
    if(connFailedPrompt.files[0])
        upload(connFailedPrompt, '/attendant/'+name+'/'+connFailedPrompt.files[0].name);
    if(leaveMsg.files[0])
        upload(leaveMsg, '/attendant/'+name+'/'+leaveMsg.files[0].name);

    if(name)
        jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD); //if name field value is empty show alert message
        return false;
    }
    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    jprms += '\"kind\":\"attendant\",';
    var enabled = document.getElementById('enabled');
    if(enabled != null) {
        jprms += '\"enabled\":'+enabled.checked+',';
    }
    jprms += '"debug":'+document.getElementById('debug').checked+',';

    jprms += '\"parameters\":[';

    jprms += '{';
    jprms += '\"key\":\"algdir\",';
    jprms += '\"value\":"'+algdir+'"';
    jprms += '},';

    var file;
    for(var key in objects){
        if(objects.hasOwnProperty(key)){
            file = objects[key].file;
            if(file){
                if(file.files.length)
                    upload(file, '/attendant/'+name+'/'+file.files[0].name);
                
                delete objects[key].file;
            }
        }
    }

    jprms += '{';
    jprms += '\"key\":\"jsonString\",';
    jprms += '\"value\":'+JSON.stringify(objects);
    
    jprms += '},';

    jprms += '{';
    jprms += '\"key\":\"connectors\",';
    jprms += '\"value\":'+JSON.stringify(PbxObject.attendant.connectors);
    jprms += '},';

    for (var key in varsFormData) {
        if(varsFormData.hasOwnProperty(key)){
            jprms += '{';
            jprms += '\"key\":"'+key+'",';
            jprms += '\"value\":"'+varsFormData[key]+'"';
            jprms += '},';
        }
    };

    jprms += '],';
    // console.log(jprms);

    json_rpc_async('setObject', jprms, function(result) {
        
        set_object_success(result);

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
}

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

    var maxusers = PbxObject.options.maxusers; 
    var storelimit = PbxObject.options.storelimit; 

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

                if(kind === 'users' && addUserForm.storelimit && storelimit && maxusers) 
                    addUserForm.storelimit.value = (convertBytes(storelimit, 'Byte', 'GB') / maxusers).toFixed(2);
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
        if(members) fill_list_items('members', members, 'number');

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

        if(addUserForm.storelimit && storelimit && maxusers) 
            addUserForm.storelimit.value = (convertBytes(storelimit, 'Byte', 'GB') / maxusers).toFixed(2);
            console.log('storelimit=', storelimit, maxusers, (convertBytes(storelimit, 'Byte', 'GB') / maxusers));

        
        if(activeServices.length) {
            $('#services-cont').append(activeServices.map(createServiceBtn));
        } else {
            if(!PbxObject.options.ldap || (PbxObject.options.ldap && !PbxObject.options.ldap.directoryServer))
                $('#add-external-user').hide();
        }

        // qparams = getQueryParams();
        var serviceParams = window.sessionStorage.getItem('serviceParams');
        if(serviceParams) {
            getExternalUsers(JSON.parse(serviceParams));
            window.sessionStorage.removeItem('serviceParams');
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
    var button = document.createElement('button');
    button.type = 'button';
    button.className = "btn btn-default padding-lg pl-users";
    button.innerHTML = '<span>'+PbxObject.frases.IMPORT_USERS_FROM+' </span><strong>'+params.name+'</strong>';
    
    addEvent(button, 'click', function(e){
        getExternalUsers(params);
    });

    return button;
}

function getExternalUsers(params){
    PbxObject.LdapConnection = Ldap({
        service_id: params.id,
        service_type: params.type,
        available: PbxObject.available,
        onaddusers: setExternalUsers
    });

    if(params.type === 1) {
        // PbxObject.LdapConnection = Ldap({
        //     service_id: params.id,
        //     service_type: params.type,
        //     available: PbxObject.available,
        //     onaddusers: setExternalUsers
        // });
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
        json_rpc_async('getExternalUsers', { service_id: params.id }, function(result) {
            console.log('getExternalUsers result: ', result);
            if(result) PbxObject.LdapConnection.showUsers(result);
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

var BillingApi = {

	url: 'https://dee6c679.ngrok.io/branch/api/',
	// url: 'https://api-web.ringotel.net/branch/api/',
	cache: {},

	fetch: function(method, url, data, options, callback){
	    var xhr, response, requestTimer, dataStr;

	    xhr = new XMLHttpRequest();
	    xhr.open(method, url, true);
	    if(options && options.headers) {
	        options.headers.forEach(function(header) {
	            xhr.setRequestHeader(header.name, header.value);
	        });
	    }

	    requestTimer = setTimeout(function(){
	        xhr.abort();
	    }, 60000);
	    
	    xhr.onload = function(e) {
	        
	        clearTimeout(requestTimer);

	        var redirect = e.target.getAllResponseHeaders();
	        var status = e.target.status;
	        var response = e.target.responseText;
	        if(response) {
	            try {
	                response = JSON.parse(response);
	            } catch(err) {
	                console.log('response in not JSON');
	            }
	        }
	            
	        if(status === 403) {
	            logout();
	        } else if(status === 200) {
	            if(callback) callback(null, response);
	        } else if(status >= 500) {
	            if(callback) return callback('The service is under maintenance. Please, try again later.');
	        } else {
	            if(callback) callback(response.error);
	        }

	    };

	    if(data) {
	        xhr.setRequestHeader('Content-Type', 'application/json');
	        dataStr = JSON.stringify(data);
	        xhr.send(dataStr);
	    } else {
	        xhr.send();
	    }
	    
	},

	request: function(method, params, callback) {
		var access_token = window.localStorage.getItem('ringo_tid');
		if(!access_token) return callback('MISSING_TOKEN');
		this.fetch(
		    'POST',
		    (this.url+method+'?access_token='+encodeURIComponent(access_token)),
		    (params || null),
		    null,
		    function(err, result) {
		        if(err || result.error) return callback(err || result.error);
		        if(callback) callback(null, result);
		    }
		);
	},

	sendAppsLinks: function(email, callback) {
		this.request('sendAppsLinks', { email: email }, callback);
	},

	getProration: function(sub, amount) {
		console.log('getProration: ', sub, amount);
		var now = Date.now();
		var cycle = Math.floor((sub.nextBillingDate - sub.prevBillingDate) / 1000);
		var left = sub.nextBillingDate > now ? Math.floor((sub.nextBillingDate - now) / 1000) : 0;
		var ratio = (left / cycle).toFixed(2);
		var proration = parseFloat(amount) * parseFloat(ratio);
		
		return proration;
	},

	getProfile: function(callback) {
		this.request('getProfile', null, callback);
	},

	updateBalance: function(params, callback) {
		this.request('updateBalance', params, callback);	
	},

	changeAdminEmail: function(params, callback) {
		this.request('changeAdminEmail', params, callback);	
	},

	changePassword: function(params, callback) {
		this.request('changePassword', params, callback);	
	},

	addCard: function(params, callback) {
		this.request('addCard', params, callback);	
	},

	updateCard: function(params, callback) {
		this.request('updateCard', params, callback);	
	},

	getPlans: function(params, callback) {
		this.request('getPlans', params, callback);	
	},

	changePlan: function(params, callback) {
		this.request('changePlan', params, callback);	
	},

	getSubscription: function(callback) {
		this.request('getSubscription', null, callback);
	},

	updateSubscription: function(params, callback) {
		this.request('updateSubscription', params, callback);
	},

	renewSubscription: function(callback) {
		this.request('renewSubscription', null, callback);
	},

	addCoupon: function(params, callback) {
		this.request('addCoupon', params, callback);
	},

	getInvoices: function(callback) {
		this.request('getInvoices', null, callback);
	},

	getDiscounts: function(callback) {
		this.request('getDiscounts', null, callback);
	},
	
	getAssignedDids: function(callback) {
		this.request('getAssignedDids', null, callback);		
	},

	getUnassignedDids: function(callback) {
		this.request('getUnassignedDids', null, callback);		
	},

	orderDid: function(params, callback) {
		this.request('orderDid', params, callback);		
	},

	unassignDid: function(params, callback) {
		this.request('unassignDid', params, callback);
	},

	getDidPrice: function(params, callback) {
		this.request('getDidPrice', params, callback);
	},

	getDid: function(params, callback) {
		this.request('getDid', params, callback);
	},

	getDidCountries: function(callback) {
		this.request('getDidCountries', null, callback);
	},

	getDidLocations: function(params, callback) {
		this.request('getDidLocations', params, callback);
	},

	hasDids: function(callback) {
		this.request('hasDids', null, callback);
	},

	updateDidStatus: function(params, callback) {
		this.request('updateDidStatus', params, callback);
	},

	updateDidRegistration: function(params, callback) {
		this.request('updateDidRegistration', params, callback);
	},

	getCredits: function(callback) {
		this.request('getCredits', null, callback);
	},

	addCredits: function(params, callback) {
		this.request('addCredits', params, callback);
	}

};
function load_billing() {
	
	console.log('load_billing');
	close_options();

	var cont = document.getElementById('el-loaded-content');
	var profile = PbxObject.profile;
	var sub = {};
	var dids = [];
	var invoices = [];
	var discounts = [];
	var methods = {
		changePlan: changePlan,
		updateLicenses: updateLicenses,
		addCredits: addCredits
	}

	BillingApi.getSubscription(function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err.message);
		sub = response.result;

		BillingApi.getAssignedDids(function(err, response) {
			if(err) return notify_about('error' , err.message);
			dids = response.result;

			init();
			show_content();

			getDiscounts(function(err, response) {
				if(err) return notify_about('error', err.message);
				discounts = response;

				// init();

				getInvoices(function(err, response) {
					if(err) return notify_about('error', err.message);
					invoices = response.filter(function(item) {
						return (item.paidAmount && parseFloat(item.paidAmount) > 0);
					});

					console.log('invoices: ', invoices);
					init();
				});
			});

		});

	});

	function init() {
		ReactDOM.render(BillingComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    dids: dids,
		    frases: PbxObject.frases,
		    invoices: invoices,
		    discounts: discounts,
		    addCard: addCard,
		    editCard: editCard,
		    renewSub: renewSub,
		    onPlanSelect: onPlanSelect,
		    updateLicenses: onUpdateLicenses,
		    addCredits: addCredits,
		    extend: deepExtend,
		    addCoupon: addCoupon,
		    utils: {
		    	convertBytes: convertBytes,
		    	getProration: getProration
		    }
		}), cont);
	}

	function addCard(callback) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			allowRememberMe: false,
			panelLabel: "Add card",
			amount: null,
			closed: function(result) {
				console.log('addCard closed: ', result);
				
				if(!PbxObject.stripeToken) return callback(null);
				var reqParams = {
					service: 'stripe',
					token: PbxObject.stripeToken.id,
					card: PbxObject.stripeToken.card
				};

				BillingApi.addCard(reqParams, function(err, response) {
					console.log('saveCard response: ', err, PbxObject.stripeToken, response);
					
					if(err || response.error) {
						notify_about('error', err.message || response.error.message);
						callback(null);
					} else {
						callback(PbxObject.stripeToken);
						set_object_success();
					}

					PbxObject.stripeToken = null;

				});
			}
		});
	}

	function editCard(callback) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			allowRememberMe: false,
			panelLabel: "Add card",
			// currency: 'eur',
			// amount: plan.amount*100,
			closed: function(result) {
				console.log('editCard closed: ', result);

				if(!PbxObject.stripeToken) return callback(null);;
				var reqParams = {
					service: 'stripe',
					token: PbxObject.stripeToken.id,
					card: PbxObject.stripeToken.card
				};

				BillingApi.updateCard(reqParams, function(err, response) {
					console.log('updateCard response: ', err, PbxObject.stripeToken, response);				
					
					if(err || response.error) {
						notify_about('error', err.message || response.error.message);
						callback(null);
					} else {
						callback(PbxObject.stripeToken);
						set_object_success();
					}

					PbxObject.stripeToken = null;
				});

			}
		});
	}

	function renewSub(callback) {

		show_loading_panel();

		BillingApi.renewSubscription({ subId: sub._id }, function(err, response) {
			console.log('renewSubscription response: ', err, response);

			show_content();

			if(err || response.error) {
				notify_about('error', err.message || response.error.message);
			} else {
				callback(err, response);
				set_object_success();
			}
		});
			
	}

	function updateBalance(params, callbackFn) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			panelLabel: "Pay",
			allowRememberMe: false,
			currency: params.payment.currency,
			amount: params.payment.chargeAmount*100,
			closed: function(result) {
				console.log('updateBalance closed: ', result, PbxObject.stripeToken);

				if(!PbxObject.stripeToken) return;

				var reqParams = {
					currency: params.payment.currency,
					amount: params.payment.chargeAmount,
					description: 'Update balance',
					token: PbxObject.stripeToken.id
				};

				BillingApi.updateBalance(reqParams, function(err, response) {

					console.log('updateBalance: ', err, response);

					if(err) {
						notify_about('error', err.message);
					} else {

						if(methods[callbackFn])
							methods[callbackFn](params);

						PbxObject.stripeToken = null;		

					}	

				});

			}
		});
	}

	function addCoupon(string) {
		BillingApi.addCoupon({ coupon: string }, function(err, response) {
			console.log('addCoupon response: ', err, string, response);
			if(err) return notify_about('error', err.message);
			discounts.push(response);
			set_object_success();
			init();
		});
	}

	function onPlanSelect(params) {
		console.log('changePlan: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			// if((parseFloat(params.payment.chargeAmount) > 0) && !profile.billingMethod) return updateBalance(params, 'changePlan');

			changePlan(params);

		});

	}

	function changePlan(params, callback) {
		show_loading_panel();

		BillingApi.changePlan({
			subId: sub._id,
			planId: params.plan.planId
		}, function(err, response) {
			console.log('changePlan response: ', err, response);

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE') updateBalance(params, 'changePlan');
				else notify_about('error', err.message);
				return;
			}
						
			sub = response.result;

			set_object_success();

			init();
		});
	}

	function onUpdateLicenses(params){
		console.log('updateLicenses: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			// if((parseFloat(params.payment.chargeAmount) > 0) && !profile.billingMethod) return updateBalance(params, 'updateLicenses');

			updateLicenses(params);

		});
	}

	function updateLicenses(params) {
		show_loading_panel();

		BillingApi.updateSubscription({
			subId: sub._id,
			addOns: params.addOns,
			quantity: params.quantity
		}, function(err, response) {
			console.log('updateLicenses response: ', err, response);

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE') updateBalance(params, 'updateLicenses');
				else notify_about('error', err.message);
				return;
			}

			sub = response.result;

			set_object_success();
			
			init();
		});
	}

	function addCredits(params) {
		showModal('confirm_add_credits_modal', { frases: PbxObject.frases, payment: params }, function(result, modal) {
			console.log('confirm_add_credits_modal submit:', result);

			$(modal).modal('toggle');
		

			show_loading_panel();

			BillingApi.addCredits({ amount: params.chargeAmount }, function(err, response) {
				remove_loading_panel();
				
				if(err) {
					if(err.name === 'NO_PAYMENT_SOURCE') updateBalance({ payment: params }, 'addCredits');
					else notify_about('error', err.message);
					return;
				}

				set_object_success();
				init();

			});
		});
	}

	function getInvoices(callback) {
		BillingApi.getInvoices(function(err, response) {
			console.log('getInvoices response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getDiscounts(callback) {
		BillingApi.getDiscounts(function(err, response) {
			console.log('getDiscounts response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getProration(sub, amount) {
		return BillingApi.getProration(sub, amount);
	}

}
function load_branch_options() {

	var options = {};
	var initLang = null;
	var branchOptions = null;
	var singleBranch = false;

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			options = result;
			initLang = options.lang;

			singleBranch = result.mode === 1 || !result.prefix;

		    if(singleBranch) {
		    	json_rpc_async('getDeviceSettings', null, function(result) {
		    		branchOptions = result;
		    		render();
		    		close_options();
		    	});
		    } else {
		    	render();
		    	close_options();
		    }
		});

	}

	function saveOptions(newOptions, callback) {

		var handler;
		var files = [];

		if(newOptions.options && newOptions.options.files) {
			files = [].concat(newOptions.options.files);
			delete newOptions.options.files;
		}

		console.log('saveOptions: ', options, newOptions, files);

		// Upload audio files
		if(files.length) {
			files.forEach(function(item) {
				uploadFile(item);
			})
		}

		if(newOptions.lang && newOptions.lang !== initLang) {	    
		    handler = set_options_success;
		} else {
		    handler = set_object_success;
		}

		json_rpc_async('setPbxOptions', newOptions, function(result) {
			PbxObject.options = options = newOptions;

			console.log('setPbxOptions success: ', newOptions, options);

			if(!newOptions.adminpass) {
			    handler();
			} else {
			    if(window.localStorage['ringo_tid'] && !singleBranch) {
			        BillingApi.changePassword({ login: newOptions.adminname, password: newOptions.adminpass }, function(err, result) {
			            if(!err) {
			            	handler();
			            	if(callback) callback();
			            }
			        });

			    } else {
			        handler();
			        if(callback) callback();
			    }
			}

			if(window.localStorage['ringo_tid'] && !singleBranch) {
				if(newOptions.email) {
					BillingApi.changeAdminEmail({ email: newOptions.email }, function(err, result) {
					    if(err) notify_about('error', err);
					});
				}
			}
		});
	}

	function saveBranchOptions(newOptions) {
		console.log('saveBranchOptions: ', newOptions);

		json_rpc_async('setDeviceSettings', newOptions, null);
	}

	function render() {
		var componentParams = {
			frases: PbxObject.frases,
		    singleBranch: singleBranch,
		    params: options,
		    branchParams: branchOptions,
		    saveOptions: saveOptions,
		    saveBranchOptions: saveBranchOptions
		};

		console.log('render: ', componentParams);

		ReactDOM.render(OptionsComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_certificates(){
	if(PbxObject.options.mode && PbxObject.options.mode !== 0)
		$('#createCertBtn').click(createCert);
	else
		$('#createCertBtn').remove();
	
	$('#importCertBtn').click(importCert);

	getCertificates();
    set_page();
}

function getCertificates(){
	json_rpc_async('getCertificates', null, function(result){
		fillCertTable(result);
	});
}

function fillCertTable(certs){
	if(!certs) return;
	var table = document.querySelector('#certificates tbody');
	certs.forEach(function(cert){
		table.appendChild(createCertRow(cert));
	});
	close_options();
	show_content();
}

function createCertRow(certName){
	var row = document.createElement('tr'),
		cell, a, button;

	cell = row.insertCell(0);
	a = document.createElement('a');
	a.href = '#';
	a.innerHTML = certName;
	addEvent(a, 'click', function(e){
		// if(e) e.preventDefault();
		downloadCert(e, certName);
	});
	cell.appendChild(a);

	cell = row.insertCell(1);
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-eye"></i>';
    addEvent(button, 'click', function(){
        showCert(certName);
    });
    cell.appendChild(button);

    cell = row.insertCell(2);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-remove"></i>';
    addEvent(button, 'click', function(){
        removeCert(certName);
    });
    cell.appendChild(button);

    row.setAttribute('data-cert', certName);

    return row;
}

function downloadCert(e, certName){
	var targ = e.target;
	if(targ.getAttribute('download')) return;
	e.preventDefault();
	json_rpc_async('getCertificate', {alias: certName}, function(result){
		targ.setAttribute('download', 'certificate.pem');
		targ.href = 'data:text/plain;charset=utf-8,' + result;
		targ.click();
	});
}

function createCert(){
	openModal({
		tempName: 'create_cert', 
		modalId: 'createCertModal'
	}, function() {
		$('#createCert').click(function(){
			addNewCert();
		});
	});
}

function addNewCert(){
	var certForm = document.getElementById('newCertForm');
	var certInfo = retrieveFormData(certForm);
	if(certInfo && Object.keys(certInfo).length !== 0){
		certInfo.V = parseInt(certInfo.V);
	    json_rpc_async('createCertificate', certInfo, function(result){
	    	if(result){
	    		fillCertTable([certInfo.CN]);
	    		$('#createCertModal').modal('hide');
	    	}
	    });
    }
}

function importCert(){
	openModal({
		tempName: 'import_cert', 
		modalId: 'importCertModal',
		data: {
			certonly: (PbxObject.options.mode === 0)
		}
	}, function() {
		$('#importCert').click(function(){
			importNewCert();
		});
	});
}

function importNewCert(){
	var certForm = document.getElementById('importCertForm');
	var certInfo = retrieveFormData(certForm);
	console.log('certInfo: ', certInfo);
	if(certInfo && Object.keys(certInfo).length !== 0){
	    json_rpc_async('setCertificate', certInfo, function(result){
	    	if(result === 'OK'){
	    		$('#importCertModal').modal('hide');
	    		var table = document.querySelector('#certificates tbody');
	    		clearTable(table);
	    		getCertificates();	
	    	}
	    });
    }
}

function showCert(cert){
	json_rpc_async('getCertificate', {alias: cert}, function(result){
		openModal({
			tempName: 'show_cert', 
			modalId: 'showCertModal',
			data : {name: cert, certificate: result}
		});
	});
}

function removeCert(cert){
	json_rpc_async('removeCertificate', {alias: cert}, function(result){
		var row = document.querySelector('#certificates tbody tr[data-cert="'+cert+'"]');
		row.parentNode.removeChild(row);
	});
}

// function openModal(params){
// 	var data = {};
// 	getPartial(params.tempName, function(template){
// 		data.frases = PbxObject.frases;
// 		if(params.data) data.data = params.data;

// 		var rendered = Mustache.render(template, data),
// 			cont = document.querySelector('#el-loaded-content');

// 		cont.insertAdjacentHTML('afterbegin', rendered);

// 		if(params.cb) params.cb();
// 		$('#'+params.modalId).modal();
// 	});
// }
function load_channel_records() {
	
	// PbxObject.chrecPicker = new Picker('chrecs-date-picker', {submitFunction: getChannelData, actionButton: true, buttonSize: 'md'});
	ChannelRecords();
	show_content();
}

function ChannelRecords(){

	PbxObject.ChannelPlayer = PbxObject.ChannelPlayer || new ChannelPlayer({ audio: document.getElementById('channel-audiorec') });

	var player = PbxObject.ChannelPlayer,
		dateFrom = document.getElementById('date-from'),
		dateTo = document.getElementById('date-to'),
		recsNum = document.getElementById('cpl-recs'),
		eventsNum = document.getElementById('cpl-events'),
		downloadLink = document.getElementById('cpl-download'),
		onlineEventsCont = document.getElementById('online-events-cont'),
		offlineEventsCont = document.getElementById('offline-events-cont'),
		rangeEventsCont = document.getElementById('range-events'),
		eventsCont = document.getElementById('channel-events'),
		onlineEvents = document.getElementById('online-events'),
		stateCont = document.getElementById('channel-state'),
		fileTime = document.getElementById('cpl-time'),
		fileDuration = document.getElementById('cpl-duration'),
		currentFile = document.getElementById('cpl-currentFile'),
		currentTrack = document.getElementById('cpl-currentTrack'),
		playBtn = document.getElementById('cpl-play'),
		seek = document.getElementById('cpl-seek'),
		controls = document.getElementById('cpl-controls'),
		submitBtn = document.getElementById('cpl-submit-btn'),
		eventsView = document.getElementById('events-view');
		combined = [],
		begin = moment().subtract(30, 'minutes'),
		end = moment(),
		lastEvents = [];
		onlineElements = {};
		// combined = combineChannelData(data.records, data.events),

	// console.log('combined: ', combined);

	$('#channel-player-cont').affix({
		offset: {
			top: 200
		}
	});

	rome(dateFrom, { initialValue: begin });
	rome(dateTo, { initialValue: end });

	initChannelPlayerEvents();
	getChannelData({  begin: begin.valueOf(), end: end.valueOf() });

	function getChannelData(params){
		var reqParams = {
			oid: window.location.hash.substr(window.location.hash.indexOf('?')+1),
			begin: params.begin,
			end: params.end
		},
		data = {};

		json_rpc_async('getChannelRecords', reqParams, function(records) {
			data.records = records;
			json_rpc_async('getChannelEvents', reqParams, function(events) {
				data.events = events;
				$(document).trigger('channelRecords:data', [data]);
			});
		});
	}

	function getChannelState(time){
		json_rpc_async('getChannelState', {oid: window.location.hash.substr(window.location.hash.indexOf('?')+1), time: time}, function(result) {
			console.log('getChannelState: ', time, result);
			$(document).trigger('channelRecords:state', [result]);
		});
	}

	function onNewData(e, data){
		console.log('onNewData: ', data);

		recsNum.innerText = data.records.length;
		eventsNum.innerText = data.events.length;

		combined = combineChannelData(data.records, data.events);
		console.log('combined: ', combined);

		if(!combined.length) return;
		
		// Init player
		clearTable(rangeEventsCont);
		lastEvents = [];
		addEventsTo(data.events, rangeEventsCont);
		initPlayer(combined);
	}

	function onNewEvent(e, data){
		console.log('onNewEvent: ', data);
		if(lastEvents.indexOf(data.channelEvent.timecode) !== -1) return;
		lastEvents.push(data.channelEvent.timecode);
		addEventsTo([data.channelEvent], eventsCont);
		triggerOnlineEvent(data.channelEvent);

	}

	function selectEvent(e, data){
		[].forEach.call(rangeEventsCont.children, function(item){
			if(parseInt(item.getAttribute('data-event'), 10) === data.channelEvent.timecode) item.classList.add('list-group-item-success');
			else item.classList.remove('list-group-item-success');
		});
	}

	function onChannelState(e, data){
		console.log('onChannelState: ', data);
		clearTable(eventsCont);
		clearTable(onlineEvents);
		onlineElements = {};
		lastEvents = [];

		addEventsTo(data, eventsCont);
		data.forEach(triggerOnlineEvent);
	}

	function addEventsTo(data, cont){
		console.log('addEventsTo: ', data);
		var fragment = document.createDocumentFragment();
		data.forEach(function(item) {
			fragment.insertBefore(addEventRow(item), fragment.firstChild);
		});
		cont.insertBefore(fragment, cont.firstChild);
	}

	function addEventRow(params, state){
		var li = document.createElement('li');
			icon = document.createElement('i'),
			user = document.createElement('span'),
			evt = document.createElement('span'),
			time = document.createElement('span');

		li.className = 'list-group-item';
		li.setAttribute('data-event', params.timecode);

		icon.className = 'fa fa-fw fa-'+getIconFromState(params.event);
		user.innerText = params.user+' ';
		evt.innerText = PbxObject.frases.CHANNEL_EVENTS[params.event.toString()];
		time.innerText = moment(params.timecode).format('DD/MM/YY HH:mm:ss');
		time.className = 'pull-right';

		li.appendChild(icon);
		li.appendChild(user);
		li.appendChild(evt);
		li.appendChild(time);

		return li;
	}

	function createOnlineEventRow(params, state){
		var li = document.createElement('li');
			user = document.createElement('span'),
			// evt = document.createElement('span'),
			// time = document.createElement('span');

		li.className = 'list-group-item';
		li.setAttribute('data-event', params.timecode);
		user.innerText = params.user+' ';
		// evt.innerText = PbxObject.frases.CHANNEL_EVENTS[params.event.toString()];
		// time.innerText = moment(params.timecode).format('DD/MM/YY HH:mm:ss');
		// time.className = 'pull-right';

		li.appendChild(user);
		// li.appendChild(evt);
		// li.appendChild(time);

		return li;
	}

	function triggerOnlineEvent(evt){
		console.log(evt);
		var el;
		if(!onlineElements[evt.user]) {
			el = createOnlineEventRow(evt);
			onlineEvents.appendChild(el);
			onlineElements[evt.user] = el;
		}

		el = $(onlineElements[evt.user]);

		if(evt.event === 25) {
			el.show();
		} else if(evt.event === 26) {
			el.hide();
		} else if(evt.event === 27) {
			el.remove();
			$(onlineEvents).prepend(el);
			el.addClass('list-group-item-success');
		} else if(evt.event === 28) {
			el.removeClass('list-group-item-success');
		} else if(evt.event === 29) {
			el.addClass('list-group-item-danger');
		} else if(evt.event === 30) {
			el.removeClass('list-group-item-danger');
		}
	}

	function onPlaying(e, data){
		console.log('onPlaying: ', data, player.audio.currentTime);

		if(data.trackIndex === 0 && !player.audio.currentTime) getChannelState(Math.floor(data.track.timecode+data.currentTime));
		
		currentFile.innerText = data.track.file;
		currentTrack.innerText = data.trackIndex+1;
		playBtn.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
		// fileDuration.textContent = formatTimeString(parseInt(data.duration, 10), 'hh:mm:ss');
	}

	function onPause(){
		console.log('onPause');
		playBtn.innerHTML = '<i class="fa fa-fw fa-play"></i>';
	}

	function onSeeked(e, data){
		console.log('onSeeked: ', data);
		getChannelState(Math.floor( data.track.timecode + (data.currentTime || 0) ));
	}

	function onSeekedClick(e){
		var currentTime = (player.duration * ((e.offsetX || e.layerX) / seek.clientWidth)).toFixed(2);
		console.log('seek click: ', currentTime);
		playByCurrentTime(currentTime);
	}

	function onInit(e, data){
		console.log('onInit: ', data);
		var lastTrack = data.playlist[data.playlist.length-1],
		lastts = lastTrack.timecode + lastTrack.duration*1000;
		console.log('onInit: ', lastTrack, lastts);
		fileDuration.textContent =  moment(lastts).format('DD/MM/YY HH:mm:ss');
	}

	function onTrackChange(e, data){
		// getChannelState(data.track.timecode);
		downloadLink.href = data.src;
		downloadLink.setAttribute('download', data.src);
	}

	function onEventClick(e){
		var targ = e.target, timecode;
		if(targ.nodeName === 'span') targ = targ.parentNode;
		timecode = targ.getAttribute('data-event');
		console.log(timecode);
		playByTimecode(timecode);
	}

	function clickHandler(e){
		var evt = e || window.event,
			targ = evt.target;
		if(targ.nodeName === 'I') targ = targ.parentNode;
		if(targ.id === 'cpl-play') player.play();
		if(targ.id === 'cpl-stop') player.stop();
		if(targ.id === 'cpl-prev') player.prev();
		if(targ.id === 'cpl-next') player.next();
	}

	function initChannelPlayerEvents(){
		$(document).on('player:init', onInit);
		$(document).on('player:seeked', onSeeked);
		$(document).on('player:timeupdate', setProgress);
		$(document).on('player:timeupdate', updateProgress);
		$(document).on('player:playing', onPlaying);
		$(document).on('player:pause', onPause);
		$(document).on('player:next', onSeeked);
		$(document).on('player:prev', onSeeked);
		$(document).on('player:ended', onPlayEnded);
		$(document).on('player:trackchange', onTrackChange);
		$(document).on('channelRecords:data', onNewData);
		$(document).on('channelRecords:event', onNewEvent);
		$(document).on('channelRecords:event', selectEvent);
		$(document).on('channelRecords:state', onChannelState);
		$(document).on('channelRecords:viewchange', onViewChange);
		addEvent(controls, 'click', clickHandler);
		addEvent(seek, 'click', onSeekedClick);
		addEvent(submitBtn, 'click', function(e) {
			getChannelData({ begin: moment(dateFrom.value).valueOf(), end: moment(dateTo.value).valueOf() });
		});
		addEvent(eventsView, 'change', function(e) {
			$(document).trigger('channelRecords:viewchange', [{ online: this.checked }]);
		});
		addEvent(rangeEventsCont, 'click', onEventClick);
		addEvent(eventsCont, 'click', onEventClick);
	}

	function initPlayer(data){
		player.playlist = data;
		player.duration = (data[data.length-1].timecode + data[data.length-1].duration*1000 - data[0].timecode)/1000;
		player.init().playTrack();
	}

	function setProgress(e, data){
		var seekValue = data.currentTime === 0 ? 0 : Math.floor((100 / data.duration) * data.currentTime);
		// console.log('player:timeupdate', data, seekValue);
		seek.value = seekValue;
	}

	function updateProgress(e, data){
		var firstEventTimecode = data.track.timecode,
			currTs = firstEventTimecode + player.audio.currentTime*1000;
			// currTs = firstEventTimecode + data.currentTime*1000;
		
		getCurrEvents(combined[data.trackIndex].events, currTs);

		fileTime.textContent = moment(currTs).format('DD/MM/YY HH:mm:ss');
		// console.log('player:timeupdate', data, currTs, currEvents);
	}

	function playByCurrentTime(currentTime){
		var ts = combined[0].timecode + currentTime*1000;
		combined.forEach(function(item, index, array) {
			// if(ts >= item.timecode && ts < array[index+1].timecode) {
			if(ts >= item.timecode && ts < item.timecode+item.duration*1000) {
				console.log('playByCurrentTime: ', ts, item);
				player.playTrack(index, (ts-item.timecode)/1000);
			}
		});
	}

	function playByTimecode(ts){
		combined.forEach(function(item, index, array) {
			if(ts >= item.timecode && ts < array[index+1].timecode) {
				console.log('playByTimecde: ', ts, index, item);
				player.playTrack(index, (ts-item.timecode)/1000);
			}
		});
	}

	function onPlayEnded(e, data){
		player.playTrack(player.trackIndex+1);
	}

	function onViewChange(e, mode){
		if(mode.online) {
			offlineEventsCont.classList.add('hidden');
			onlineEventsCont.classList.remove('hidden');
		} else {
			offlineEventsCont.classList.remove('hidden');
			onlineEventsCont.classList.add('hidden');
		}
	}

	function getIconFromState(state){
		var icon = '';
		switch (state) {
			case 25:
				icon = 'rss';
				break;
			case 26:
				icon = 'sign-out';
				break;
			case 27:
				icon = 'microphone';
				break;
			case 28:
				icon = 'microphone-slash';
				break;
			case 29:
				icon = 'close';
				break;
			case 30:
				icon = 'check';
				break;
		}
		return icon;
	}

	function getCurrEvents(events, ts){
		var timeSeconds = Math.floor(ts/1000);
		events.forEach(function(item){
			if(timeSeconds === Math.floor(item.timecode/1000))
				$(document).trigger('channelRecords:event', [{ channelEvent: item, timeSeconds: timeSeconds }]);
		});
	}

	function combineChannelData(records, events){
		var newArray = [], eventIndex = 0;

		function insertEvents(record) {
			var recLastTs = record.timecode + record.duration*1000;

			record.events = [];

			for (var i = eventIndex; i < events.length; i++) {
				if(events[i].timecode <= recLastTs) {
					record.events.push(events[i]);
				} else {
					eventIndex = i;
					break;
				}
			}
			return record;
		}

		for (var i = 0; i < records.length; i++) {
			newArray.push(insertEvents(records[i]));
		}

		return newArray;
	}	
}


function load_channel_statistics(){

	init();
    set_page();

    // function formatTimeString(time, format){
    //     var h, m, s, newtime;
    //     h = Math.floor(time / 3600);
    //     time = time - h * 3600;
    //     m = Math.floor(time / 60);
    //     s = Math.floor(time - m * 60);

    //     newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
    //     if(!format || format == 'hh:mm:ss'){
    //         newtime += ':' + (s < 10 ? '0'+s : s);
    //     }
    //     return newtime;
    // }

    // function formatIndex(value, format) {
    // 	var result = value;
    // 	if(format === 'ms') result = this._formatTimeString(result / 1000);

    // 	return result;
    // }

    // function getIndexFormat(index) {
    // 	var durations = /art|atfr|atrm|atta/;
    // 	if(index.match(durations)) {
    // 		return 'duration';
    // 	}

    // 	return 'number';
    // }

	function init(params){
		console.log('load_chats_report params: ', params);

		var componentParams = {
			frases: PbxObject.frases
		};

		ReactDOM.render(AnalyticsComponent(componentParams), document.getElementById('el-loaded-content'));
	}

}
function ChannelPlayer(params){
	'use strict';
	if(!params.audio) throw 'audio is undefined';
	this.audio = params.audio;
	this.path = window.location.protocol+'//'+window.location.host+'/records/' || params.path;
	this.playlist = params.playlist || [];
	this.trackIndex = 0;

	return this.initEvents();
}

ChannelPlayer.prototype = {

	initEvents: function(){
		addEvent(this.audio, "playing", function(e) {
			$(document).trigger('player:playing', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], currentTime: this.audio.currentTime, duration: this.audio.duration }]);
		}.bind(this), true);

		addEvent(this.audio, 'loadedmetadata', function(e) {
			$(document).trigger('player:loadedmetadata', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], duration: this.audio.duration }]);
		}.bind(this));

		addEvent(this.audio, "pause", function(e) {
			$(document).trigger('player:pause', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex] }]);
		}.bind(this), true);

		// addEvent(this.audio, "loadedmetadata", function(e) {
		// 	$(document).trigger('player:loadedmetadata', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex] }]);
		// }.bind(this), true);

		addEvent(this.audio, "seeked", function(e) {
			$(document).trigger('player:seeked', [{
				trackIndex: this.trackIndex,
				track: this.playlist[this.trackIndex],
				// duration: this.audio.duration,
				// currentTime: this.audio.currentTime,
				duration: (this.duration || this.playlist[this.trackIndex].duration),
				currentTime: (this.playlist[this.trackIndex].timecode - this.playlist[0].timecode)/1000 + this.audio.currentTime
			}]);
		}.bind(this), true);

		//set up event to update the progress bar
		addEvent(this.audio, "timeupdate", function(e) {
			$(document).trigger('player:timeupdate', [{
				trackIndex: this.trackIndex,
				track: this.playlist[this.trackIndex],
				// duration: this.audio.duration,
				// currentTime: this.audio.currentTime,
				duration: (this.duration || this.playlist[this.trackIndex].duration),
				currentTime: (this.playlist[this.trackIndex].timecode - this.playlist[0].timecode)/1000 + this.audio.currentTime
			}]);
		}.bind(this), true);

		// when playback completes
		addEvent(this.audio, "ended", function(e) {
			$(document).trigger('player:ended', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], currentTime: this.audio.currentTime }]);
		}.bind(this), true);

		return this;
	},

	init: function(){
		$(document).trigger('player:init', [{ audio: this.audio, path: this.path, playlist: this.playlist, trackIndex: this.trackIndex, duration: this.duration }]);
		return this;
	},

	playTrack: function(trackIndex, currentTime){
		if(!this.playlist.length || trackIndex > this.playlist.length-1 || trackIndex < 0) return this;
		var track = this.playlist[trackIndex || this.trackIndex],
			src = this.path + track.file;
		
		if(trackIndex !== undefined) this.trackIndex = trackIndex;
		if(this.audio.src !== src) {
			this.audio.src = src;
			$(document).trigger('player:trackchange', [{ trackIndex: this.trackIndex, track: track, src: this.audio.src }]);
		}

		if(currentTime !== undefined) {
			this.audio.currentTime = currentTime;
		}
		console.log('play: ', trackIndex, currentTime);
		this.audio.play();
	},

	play: function(){
		if (this.audio.paused) {
		    this.audio.play();
		} else {
		    this.audio.pause();
		}

		return this;
	},

	stop: function(){
		this.audio.pause();
		this.trackIndex = 0;
		this.audio.currentTime = 0;

		return this;
	},

	next: function(){
		var trackIndex = this.trackIndex+1;

		this.audio.pause();
		this.audio.currentTime = 0;
		this.playTrack(trackIndex);

		$(document).trigger('player:next', [{ trackIndex: this.trackIndex, track: this.playlist[trackIndex] }]);

		return this;
	},

	prev: function(){
		var trackIndex = this.trackIndex-1;

		this.audio.pause();
		this.audio.currentTime = 0;
		this.playTrack(trackIndex);

		$(document).trigger('player:prev', [{ trackIndex: this.trackIndex, track: this.playlist[trackIndex] }]);

		return this;
	}

};
function load_channels(result){
    // console.log(result);
    var row,
        table = document.getElementById('channels').getElementsByTagName('tbody')[0],
        // passReveal = [].slice.call(document.querySelectorAll('.password-reveal')),
        fragment = document.createDocumentFragment();

    // PbxObject.extensions = result;
    var channels = [];
    for(var i=0; i<result.length; i++){

        if(result[i].kind !== "channel") continue;
        row = createChannelRow(result[i]);
        fragment.appendChild(row);
        channels.push(result[i]);
    }
        
    table.appendChild(fragment);
    
    PbxObject.channels = channels;
    add_search_handler();
    show_content();

    addEvent(table, 'click', tableClickHandler);

    // $('[data-toggle="popover"]').popover({
    //     content: function(){
    //         return showParties(this);
    //     }
    // });
}

function tableClickHandler(e){
    var e = e || window.event,
        targ = e.target,
        cl;

    if(targ.nodeName !== 'BUTTON') targ = targ.parentNode;
    // if(targ.nodeName !== 'BUTTON') return;
    cl = targ.className;
    if(cl.indexOf('showPartiesBtn') != -1){
        showParties(targ);
    } else if(cl.indexOf('deleteObjBtn') != -1){
        delete_extension(e);
    }
}

function createChannelRow(data){
    var row = document.createElement('tr'),
        info = getInfoFromState(data.state, data.group),
        status = info.rstatus,
        classname = info.rclass,
        cell, a, newkind;

    cell = row.insertCell(0);
    if(data.oid){
        a = document.createElement('a');
        a.href = '#' + data.kind + '?' + data.oid;
        a.textContent = data.ext;
        cell.appendChild(a);
    } else {
        cell.textContent = data.ext;
    }
    
    cell = row.insertCell(1);
    cell.setAttribute('data-cell', 'name');
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.setAttribute('data-cell', 'status');
    cell.textContent = status || "";

    cell = row.insertCell(3);
    cell.setAttribute('data-cell', 'parties');
    if(data.parties) cell.textContent = data.parties.length || '';

    cell = row.insertCell(4);
    button = createNewButton({
        type: 'popover',
        classname: 'btn btn-primary btn-sm showPartiesBtn',
        placement: 'left',
        // dataContent: ' ',
        dataTrigger: 'focus',
        content: '<i class="fa fa-user"></i>',
    });
    cell.appendChild(button);
    if(!data.parties) button.disabled = 'disabled';

    cell = row.insertCell(5);
    cell.innerHTML = '<a type="button" class="btn btn-primary btn-sm" href="#channel_records?'+data.oid+'"><i class="fa fa-history"></i></a>';

    cell = row.insertCell(6);
    if(data.oid) {
        button = createNewButton({
            title: PbxObject.frases.DELETE,
            classname: 'btn btn-danger btn-sm deleteObjBtn',
            content: '<i class="fa fa-trash"></i>',
        });
        cell.appendChild(button);
    }

    row.id = data.oid;
    row.setAttribute('data-ext', data.ext);
    row.className = classname;

    return row;
}

function showParties(targ){
    var row = getClosest(targ, 'tr'),
        channels = PbxObject.channels,
        cont = '', length, pts;

    channels.forEach(function(channel){
        if(channel.oid === row.id){
            pts = channel.parties;
            if(pts){
                length = pts.length;
                pts.sort();
                pts.forEach(function(party, index){
                    cont += party;
                    if(index != length-1) cont += ', ';
                });
            }
        }
    });
    targ.setAttribute('data-content', cont);
    $(targ).popover('toggle');
    // return cont;
}
function load_chatchannel(params) {

	console.log('load_chat_group: ', params);
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont;

	if(!params.name) params.enabled = true;

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	function getDefaultName() {
		var name = PbxObject.frases.CHAT_CHANNEL.DEFAULT_NAME + ' ';
		name += PbxObject.objects ? filterObject(PbxObject.objects, PbxObject.kind).length+1 : 1;
		return name;
	}

	function onNameChange(name) {
		objParams.name = name;
	}

	function onStateChange(state) {
		objParams.enabled = state;
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result) {
		    console.log('onStateChange: ', state, result);
		});
	}

	// function onAddMembers() {
	// 	var params = PbxObject.name ? { groupid: PbxObject.oid } : null;

	//     json_rpc_async('onAddMembers', params, function(result){
	// 		console.log('onAddMembers: ', result);
	// 		showAvailableUsers(result);
	// 	});
	// }

	function showAvailableUsers() {
		modalCont = document.getElementById('available-users-cont');
		if(modalCont) {
			modalCont.parentNode.removeChild(modalCont);
		}

		modalCont = document.createElement('div');
		modalCont.id = "available-users-cont";
		document.body.appendChild(modalCont);

		ReactDOM.render(AvailableUsersModalComponent({
		    frases: PbxObject.frases,
		    onSubmit: addMembers,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);

	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);
		console.log('addMembers: ', array, objParams);

		setChatChannel(objParams, function(result) {
			init(objParams);
		});
		$('#available-users-modal').modal('hide');
	}

	function deleteMember(params) {
		var oid = params.oid;
		console.log('deleteMember: ', oid);
		objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
		setChatChannel(objParams, function(result) {
			init(objParams);
		});
	}

	function setChatChannel(params, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var objName = params.name || defaultName;

		json_rpc_async('setObject', {
			kind: PbxObject.kind,
			oid: params.oid,
			name: objName,
			enabled: params.enabled,
			members: (params.members.length ? params.members.reduce(function(prev, next) { prev.push(next.number || next.ext); return prev; }, []) : [])
		}, function(result) {
			PbxObject.name = objParams.name = objName;
			if(handler) handler();
			if(callback) callback(result);
		});
	}

	function removeChatChannel() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    onAddMembers: showAvailableUsers,
		    setObject: setChatChannel,
		    onNameChange: onNameChange,
		    onStateChange: onStateChange,
		    getInfoFromState: getInfoFromState,
		    getExtension: getExtension,
		    deleteMember: deleteMember
		};

		if(params.name) {
			componentParams.removeObject = removeChatChannel;
		}

		ReactDOM.render(ChatchannelComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(objParams);
	show_content();
    set_page();

}
function load_chattrunk(params) {

	console.log('load_chat_trunk: ', PbxObject.kind, params);
	console.log('window parent: ', window.opener);
	console.log('window onTokenReceived: ', window.onTokenReceived);
	var frases = PbxObject.frases;
	var driver = new Driver({
		nextBtnText: frases.GET_STARTED.STEPS.NEXT_BTN,
		prevBtnText: frases.GET_STARTED.STEPS.PREV_BTN,
		doneBtnText: frases.GET_STARTED.STEPS.DONE_BTN,
		closeBtnText: frases.GET_STARTED.STEPS.CLOSE_BTN
	});
	var driverSteps = [];
	var initParams = params;
	var handler = null;
	var type = params.type || 'FacebookMessenger';
	var services = [{
		id: 'FacebookMessenger',
		name: "Messenger",
		icon: '/badmin/images/channels/fm.png',
		params: {
			appId: '1920629758202993'
		},
		component: FacebookTrunkComponent
	}, {
		id: 'Email',
		name: "Email",
		icon: '/badmin/images/channels/email.png',
		providers: {
			gmail: {
				protocol: 'imap',
				hostname: 'imap.gmail.com',
				port: 993,
				usessl: true
			},
			outlook: {
				protocol: 'imap',
				hostname: 'imap-mail.outlook.com',
				port: 993,
				usessl: true
			},
			office365: {
				protocol: 'imap',
				hostname: 'outlook.office365.com',
				port: 993,
				usessl: true
			},
			icloud: {
				protocol: 'imap',
				hostname: 'imap.mail.me.com',
				port: 993,
				usessl: true
			},
			aol: {
				protocol: 'imap',
				hostname: 'imap.aol.com',
				port: 993,
				usessl: true
			},
			yahoo: {
				protocol: 'imap',
				hostname: 'imap.mail.yahoo.com',
				port: 993,
				usessl: true
			}
		},
		component: EmailTrunkComponent
	}, {
		id: 'Viber',
		name: "Viber",
		icon: '/badmin/images/channels/viber.ico',
		component: ViberTrunkComponent
	}, {
		id: 'Telegram',
		name: "Telegram",
		icon: '/badmin/images/channels/telegram.png',
		component: TelegramTrunkComponent
	}, {
		id: 'Telephony',
		name: 'Number',
		icon: '/badmin/images/channels/did.png',
		component: DidTrunkComponent
	}
	// {
	// 	id: 'Facebook',
	// 	name: "Facebook",
	// 	icon: '/badmin/images/facebook.png',
	// 	params: {
	// 		appId: '1920629758202993'
	// 	}
		
	// },{
	// 	id: 'Twitter',
	// 	name: "Twitter",
	// 	icon: '/badmin/images/twitter.png',
	// 	params: {
	// 		oauth_consumer_key: 'RBk2sDm5bYowCA7mLttioe4BC',
	// 		oauth_nonce: 'ASLAfjiaFOIJFIFJfnfnoie399'+Date.now()
	// 	}
	];

	var modalCont = document.getElementById('create-service-group');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "create-service-group";
		document.body.appendChild(modalCont);
	}

	var query = window.location.href;
	var search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null;
	var queryParams = getQueryParams(search);
	var selectedService = queryParams.channel;
	var userAccessToken = search ? queryParams.access_token : null;

	if(window.opener && window.onTokenReceived) {
		return window.onTokenReceived(userAccessToken);
	} else if(userAccessToken) {
		services = services.map(function(item) {
			console.log('load_chattrunk services:', item);
			if(item.id === 'FacebookMessenger') item.params.userAccessToken = userAccessToken;
			// if(item.id === 'FacebookMessenger') item.params.userAccessToken = PbxObject.userAccessToken;
			return item;
		});
	}

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	params.sessiontimeout = (params.sessiontimeout || 86400*7);
	params.replytimeout = (params.replytimeout || 3600);

    set_page();
    render(type, params);

	function onStateChange(state, callback) {
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result, err) {
		    console.log('onStateChange: ', state, result, err);
		    if(callback) callback(err, result);
		});
	}

	function setObject(params, cb) {

		console.log('setObject: ', params);
		
		driver.reset();

	    show_loading_panel();

	    params.directref = true;

		json_rpc_async('setObject', params, function(result, err) {
			if(err) {
				return notify_about('error', err.message);
			}

			if(PbxObject.name) {
				set_object_success();
			} else {
				PbxObject.name = params.name;
			}

			render(params.type, params);
			remove_loading_panel();

		});
    	
	}

	function confirmRemoveObject(type, callback) {
		var props = {
			frases: PbxObject.frases,
			name: PbxObject.name,
			warning: (type === 'Telephony' ? 
				PbxObject.frases.CHAT_TRUNK.DID.DELETE_SIP_CHANNEL_MSG 
				: PbxObject.frases.CHAT_TRUNK.DID.DELETE_OTHER_CHANNEL_MSG
			),
			onSubmit: callback
		};

		ReactDOM.render(DeleteObjectModalComponent(props), modalCont);
	}

	function updateBalance(params, callback) {
		PbxObject.stripeHandler.open({
			// name: 'Ringotel',
			// zipCode: true,
			// locale: 'auto',
			panelLabel: "Pay",
			allowRememberMe: false,
			// currency: params.currency,
			amount: params.chargeAmount*100,
			closed: function(result) {
				console.log('updateBalance closed: ', result, PbxObject.stripeToken);

				if(!PbxObject.stripeToken) return;

				var reqParams = {
					currency: params.currency,
					amount: params.chargeAmount,
					description: 'Update balance',
					token: PbxObject.stripeToken.id
				};

				show_loading_panel();

				BillingApi.updateBalance(reqParams, function(err, response) {

					console.log('updateBalance: ', err, response);

					remove_loading_panel();

					if(err) {
						notify_about('error', err.message);
					} else {

						if(callback) callback(params);

						PbxObject.stripeToken = null;		

					}	

				});

			}
		});
	}

	function confirmPayment(params, callback) {
		console.log('confirmPayment params:', params);
		showModal('confirm_payment_modal', { frases: PbxObject.frases, payment: params }, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			callback(params);

		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
	}

	function addSteps(stepParams) {
		driverSteps = driverSteps.concat(stepParams);
	}

	function nextStep(stepParams) {
		driver.moveNext();
	}

	function highlightStep(stepParams) {
		driver.highlight(stepParams);
	}

	function initSteps() {
		if(!PbxObject.tourStarted) return;

		driverSteps.push({
			element: '.object-name-cont .btn-success',
			popover: {
				title: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].TITLE,
				description: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].DESC,
				position: 'bottom'
			}
		});

		setTimeout(function() {
			console.log('initSteps: ', driverSteps);
			driver.defineSteps(driverSteps);
			driver.start();
		}, 500);
	}

	function onTokenReceived(token) {
		PbxObject.userAccessToken = token;
	}

	function render(type, params) {
		var componentParams = {
			type: type,
			services: services,
			frases: PbxObject.frases,
		    params: params,
		    selected: selectedService,
		    getObjects: getObjects,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    updateBalance: updateBalance,
		    confirmRemoveObject: confirmRemoveObject,
		    removeObject: removeObject,
		    confirmPayment: confirmPayment,
		    initSteps: initSteps,
		    addSteps: addSteps,
		    nextStep: nextStep,
		    highlightStep: highlightStep,
		    onTokenReceived: onTokenReceived
		};

		console.log('render: ', componentParams);

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_cli(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'cli';

    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');

    if(result.name) {
        name.value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

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

function set_cli(){
        
    var name = document.getElementById('objname').value;
    var handler;

    if(name)
        var jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
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
    
    var e = e || window.event;
    if(e && e.type == 'click')
        e.preventDefault();

    var table = document.getElementById('clinumbers').getElementsByTagName('tbody')[0],
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        cell, div, inp;
    // var tr = document.createElement('tr');
    
    // var td = document.createElement('td');
    cell = row.insertCell(0);
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('input');
    inp.className = 'form-control';
    inp.setAttribute('type', 'text');
    inp.setAttribute('name', 'number');
    if(object && object.number) inp.value = object.number;
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
    
    // td = document.createElement('td');
    cell = row.insertCell(1);
    div = document.createElement('div');
//    div.className = 'col-xs-6';
    div.className = 'form-group';
    inp = document.createElement('textarea');
    inp.className = 'form-control y-resizable';
    inp.setAttribute('rows', '3');
//    cell.setAttribute('type', 'text');
    inp.setAttribute('name', 'description');
    if(object && object.description) inp.value = object.description;
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
    
    // td = document.createElement('td');
    cell = row.insertCell(2);
    div = document.createElement('div');
    div.className = 'form-group';
//    div.className = 'col-xs-2';
    inp = document.createElement('a');
    inp.href = '#';
    // cell.setAttribute('type', 'checkbox');
    inp.className = 'remove-clr';
    inp.innerHTML = '<i class="fa fa-close"></i>';
    addEvent(inp, 'click', remove_row);
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
}
function load_customers(params) {

	console.log('load_customers: ', PbxObject.kind, params);
	var frases = PbxObject.frases;
	var customers = [];
	var modalCont = document.getElementById('modal-cont');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

    set_page();
    close_options();
    getCustomers();

    function getCustomers() {
    	json_rpc_async('getCustomers', null, function(result, err) {
    		console.log('getCustomers: ', err, result);
    		customers = result.reverse();
    		render(customers);
    	});
    }

    function onDelete(cid) {
    	console.log('onDelete: ', cid);
    	ReactDOM.render(
    		DeleteObjectModalComponent({
    			frases: frases,
    			warning: frases.CUSTOMERS.ON_DELETE_WARNING,
    			onSubmit: function() {
    				deleteCustomer(cid);
    			}
    		}),
    		modalCont
    	);
    }

    function deleteCustomer(cid) {
    	json_rpc_async('deleteCustomerData', {
    		customerid: cid
    	}, function(result, err) {
    		console.log('deleteCustomerData result: ', err, result);
    		
    		customers = customers.filter(function(item) {
    			return item.id !== cid;
    		});

    		notify_about('success', frases.CUSTOMERS.ON_DELETED_MSG);
    		render(customers);
    	});
    }

    function openCustomerInfo(params) {
    	ReactDOM.render(
    		CustomerInfoModalComponent({
    			frases: frases,
    			params: params,
    			onDelete: onDelete
    		}),
    		modalCont
    	);
    }

	function render(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    openCustomerInfo: openCustomerInfo
		};

		ReactDOM.render(CustomersComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_dashboard(){
    PbxObject.Dashboard = new Dashboard();
}

function Dashboard(){
    var self = this,
        loaded = false,
        inc = document.querySelectorAll('.calls-incoming'),
        out = document.querySelectorAll('.calls-outgoing'),
        conn = document.querySelectorAll('.calls-connected'),
        load = document.querySelectorAll('.calls-load'),
        ttrunks = document.getElementById('calls-trunks').querySelector('tbody'),
        tcalls = document.getElementById('calls-table').querySelector('tbody'),
        lrow = ttrunks.rows.length,
        trunks = [],
        insData, outsData, intsData, lostData, linesData, time, item,
        row, cell, a, picker, chartData, chartOpts;

    this.init = function(){
        var start, interval, params;
        picker = new Picker();
        start = picker.today();
        interval = 3600*1000;
        params = '\"begin\":'+start+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
        this.update = setInterval(this.checkStates.bind(this), 1000);
        this.statUpdate = setInterval(this.updateStatistics.bind(this), 1800*1000);
        addEvent(window, 'hashchange', this.stopUpdate.bind(this));

        show_content();
        set_page();

    };

    this.checkStates = function(){
        sendData('getCurrentState', null, 6);
        sendData('getCurrentCalls', null, 5);
        // json_rpc_async('getCurrentCalls', null, this.setCurrentCalls.bind(this));
        // json_rpc_async('getCurrentState', null, this.setCurrentState.bind(this));

        // console.log('update');
    };

    this.updateStatistics = function(){
        var start, interval, params;
        picker = new Picker();
        start = picker.today();
        interval = 3600*1000;
        params = '\"begin\":'+start+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
    };

    this.setCurrentState = function(result){
        // console.log(loaded);
        if(loaded === false){
            show_content();
            loaded = true;
            // console.log(loaded);
        }

        trunks = result.trunks;

        for (var i = 0; i < inc.length; i++) {
            if(inc[i].textContent != result.in) inc[i].textContent = result.in;
        }
        for (var i = 0; i < out.length; i++) {
            if(out[i].textContent != result.out) out[i].textContent = result.out;
        }
        for (var i = 0; i < conn.length; i++) {
            if(conn[i].textContent != result.conn) conn[i].textContent = result.conn;
        }
        for (var i = 0; i < load.length; i++) {
            // load[i].textContent = Math.round(result.load) + '%';
            load[i].textContent = parseFloat(result.load).toFixed(1) + '%';
        }

        for (var i = 0; i < trunks.length; i++) {
            
            var className = trunks[i].enabled ? 'success' : 'danger';
            if(ttrunks.rows[i]){
                ttrunks.rows[i].cells[0].className = className;
                if(ttrunks.rows[i].cells[1].firstChild.textContent != trunks[i].name)
                    ttrunks.rows[i].cells[1].firstChild.textContent = trunks[i].name;
                if(ttrunks.rows[i].cells[2].textContent != trunks[i].in)
                    ttrunks.rows[i].cells[2].textContent = trunks[i].in;
                if(ttrunks.rows[i].cells[3].textContent != trunks[i].out)
                    ttrunks.rows[i].cells[3].textContent = trunks[i].out;
                ttrunks.rows[i].cells[4].textContent = parseFloat(trunks[i].load).toFixed(1) + '%';
                if(ttrunks.rows[i].cells[5].textContent != trunks[i].address)
                    ttrunks.rows[i].cells[5].textContent = trunks[i].address;
            } else {
                row = ttrunks.insertRow(i);
                
                cell = row.insertCell(0);
                cell.className = className;

                cell = row.insertCell(1);

                if(trunks[i].type === 'system') {
                    cell.innerText = trunks[i].name;
                } else {
                    a = document.createElement('a');
                    a.href = '#trunk/'+trunks[i].oid;
                    a.textContent = trunks[i].name;
                    cell.appendChild(a);
                }

                cell = row.insertCell(2);
                cell.textContent = trunks[i].in;

                cell = row.insertCell(3);
                cell.textContent = trunks[i].out;

                cell = row.insertCell(4);
                cell.textContent = parseFloat(trunks[i].load).toFixed(1) + '%';

                cell = row.insertCell(5);
                cell.textContent = trunks[i].address;
            }

        }
        
    };

    this.setCurrentCalls = function(result){
        if(!result) return;
        if(tcalls.rows.length > result.length) {
            this.clearTable(tcalls, result.length);
        }
        for (var i = 0; i < result.length; i++) {

            if(tcalls.rows[i]){
                tcalls.rows[i].cells[0].textContent = result[i].caller;
                tcalls.rows[i].cells[1].textContent = result[i].called;
                if(result[i].time)
                    tcalls.rows[i].cells[2].textContent = formatTimeString(result[i].time, 'hh:mm:ss');
            }
            else{
                row = tcalls.insertRow(i);
                
                cell = row.insertCell(0);
                cell.textContent = result[i].caller;

                cell = row.insertCell(1);
                cell.textContent = result[i].called;

                cell = row.insertCell(2);
                cell.textContent = formatTimeString(result[i].time, 'hh:mm:ss');
            }

        }

    };

    this.clearTable = function(table, rows){

        row = rows - 1;
        while(table.rows.length != rows){

            table.deleteRow(row);
            row = row - 1;

        }

    };

    this.stopUpdate = function(){
        clearInterval(this.update);
        clearInterval(this.statUpdate);
        removeEvent(window, 'hashchange', this.stopUpdate.bind(this));

    };

    this.createGraph = function(data){
        // console.log(data);
        if(!data.length){
            $("#outCalls-graph").html('<h4 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h4>');
            $("#inAndLost-graph").html('<h4 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h4>');
            $("#intCalls-graph").html('<h4 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h4>');
            $("#linesLoad-graph").html('<h4 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h4>');
            // var graph = document.getElementById('calls-graph');
            // graph.innerHTML = '<h2 class="back-msg">'+PbxObject.frases.STATISTICS.NO_DATA+'</h2>';
        }
        else {
            insData = []; outsData = []; intsData = []; lostData = []; linesData = []; time; item;
            for(var i=0, length = data.length; i<length; i++){
                item = data[i];
                time = item.t;
                insData.push([time, item.i]);
                outsData.push([time, item.o]);
                intsData.push([time, item.l]);
                lostData.push([time, item.m]);
                linesData.push([time, item.p]);
            }
            var barsOpts = {
                show: true,
                barWidth: 3600*1000,
                lineWidth: 0,
                // order: 1,
                fill: 0.7
                // fillColor: false
            };
            insAndLostData = [{
                label: PbxObject.frases.STATISTICS.CONNECTEDCALLS,
                stack: 0,
                bars: barsOpts,
                data: insData,
                color: "#3c763d"
            }, {
                label: PbxObject.frases.STATISTICS.LOSTCALLS,
                stack: 0,
                bars: barsOpts,
                data: lostData,
                color: "#AA4643"
            }];
            outsData = [{
                label: PbxObject.frases.SETTINGS.OUTCALLS,
                bars: barsOpts,
                data: outsData,
                color: "#4572A7"
            }];
            intsData = [{
                label: PbxObject.frases.SETTINGS.INTCALLS,
                bars: barsOpts,
                data: intsData,
                color: "#BADABA"
            }];
            linesData = [{
                label: PbxObject.frases.STATISTICS.LINES_PAYLOAD,
                data: linesData,
                lines: {
                    show: true,
                    fill: false
                },
                points: {
                    show: true
                },
                // yaxis: 2,
                color: "#3c763d"
            }];
            chartOpts = {
                xaxis: {
                    mode: "time",
                    timeformat: '%H:%M',
                    timezone: 'browser',
                    tickSize: 0,
                    tickLength: 0 // hide gridlines
                },
                yaxis: {
                    min: 0,
                    tickFormatter: function (val) {
                        return val.toFixed(1);
                    }
                },
                grid: {
                    margin: 0,
                    hoverable: true,
                    borderWidth: 0,
                    color: '#ccc'
                },
                legend: false,
                tooltip: true,
                tooltipOpts: {
                    content: '%x <br> %s: %y.1',
                    yDateFormat: "%H:%M"
                }
            };
            $.plot($("#outCalls-graph"), outsData, chartOpts);
            $.plot($("#inAndLost-graph"), insAndLostData, chartOpts);
            $.plot($("#intCalls-graph"), intsData, chartOpts);
            $.plot($("#linesLoad-graph"), linesData, chartOpts);

            addEvent(window, 'resize', self.resizeChart);
            addEvent(window, 'hashchange', function(){
                removeEvent(window, 'resize', self.resizeChart);
            });
        }
    };

    this.resizeChart = function(){
        $.plot($("#outCalls-graph"), outsData, chartOpts);
        $.plot($("#inAndLost-graph"), insAndLostData, chartOpts);
        $.plot($("#intCalls-graph"), intsData, chartOpts);
        $.plot($("#linesLoad-graph"), linesData, chartOpts);
    };

    this.init();

}

function EventEmitter() {

	var subs = {};
	var hOP = subs.hasOwnProperty;	

	function on(sub, listener){
		// Create the subscription's object if not yet created
		if(!hOP.call(subs, sub)) subs[sub] = [];

		// Add the listener to queue
		var index = subs[sub].push(listener) -1;

		// Provide handle back for removal of subscription
		return {
			off: function() {
				delete subs[sub][index];
			}
		};
	}

	function emit(sub, info){
		// If the subscription doesn't exist, or there's no listeners in queue, just leave
		if(!hOP.call(subs, sub)) return;

		// Cycle through subscriptions queue, fire!
		subs[sub].forEach(function(item) {
			item(info !== undefined ? info : {});
		});
	}

	return {
		on: on,
		emit: emit
	};

}
function load_extensions(result) {
    // console.log(result);
    // var row,
    //     table = document.getElementById('extensions').getElementsByTagName('tbody')[0],
    //     // passReveal = [].slice.call(document.querySelectorAll('.password-reveal')),
    //     fragment = document.createDocumentFragment();

    // PbxObject.extensions = result;

    // for(var i=0; i<result.length; i++){

    //     // if(!result[i].oid) continue;

    //     row = createExtRow(result[i]);
    //     fragment.appendChild(row);

    // }
        
    // table.appendChild(fragment);
    
    // // if(passReveal.length) {
    // //     passReveal.forEach(function(item){
    // //         addEvent(item, 'click', revealPassword);
    // //     });
    // // }

    // // var $modal = $('#el-extension');
    // // $('#pagecontainer').prepend($modal);
    // // $($modal).insertBefore('#pagecontainer');

    // TableSortable.sortables_init();
    // add_search_handler();

    var data = filterObject(result, ['user', 'phone']);

    function init(data){
        var componentParams = {
            frases: PbxObject.frases,
            data: data,
            getExtension: getExtension,
            deleteExtension: deleteExtension
        };

        ReactDOM.render(ExtensionsComponent(componentParams), document.getElementById('el-loaded-content'));
    }

    init(data);
    set_page();
    show_content();

}

function getExtensions(cb) {
    json_rpc_async('getExtensions', null, cb);
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
            a.href = '#' + data.kind + '/' + data.oid;
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
    cell.innerHTML = '<span class="label label-'+info.className+'">'+(status || '')+'</span>';

    // cell = row.insertCell(6);
    // if(data.kind) {
    //     if(data.kind == 'user' || data.kind == 'phone') {
    //         button = createNewButton({
    //             type: 'tooltip',
    //             title: PbxObject.frases.EDIT,
    //             classname: 'btn btn-link btn-primary btn-md',
    //             content: '<i class="fa fa-edit"></i>',
    //             handler: editExtension
    //         });
    //         cell.appendChild(button);
    //     }    
    // }
    cell = row.insertCell(6);
    if(data.oid) {
        button = createNewButton({
            type: 'tooltip',
            title: PbxObject.frases.DELETE,
            classname: 'btn btn-link btn-danger btn-md',
            content: '<i class="fa fa-trash"></i>',
            handler: delete_extension
        });
        cell.appendChild(button);
    }

    // row.id = data.ext;
    row.id = data.oid;
    row.setAttribute('data-ext', data.ext);
    row.setAttribute('data-kind', data.kind);
    // row.className = classname;

    return row;

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

    if(!PbxObject.templates.extension){
        $.get('/badmin/views/extension.html', function(template){
            PbxObject.templates = PbxObject.templates || {};
            PbxObject.templates.extension = template;
            json_rpc_async('getObject', { oid: oid }, load_extension);
        });
    } else {
        json_rpc_async('getObject', { oid: oid }, load_extension);
    }
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
    if(kind === 'user' || kind === 'phone'){
        var newkind = kind === 'user' ? 'users':'unit';
        sel = document.createElement('select');
        sel.className = 'form-control extgroup';
        cell.appendChild(sel);
        fill_group_choice(newkind, group, sel);
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
    // cell.textContent = kind;
    cell.textContent = cells[4].textContent;
    cell = tr.insertCell(5);
    cell.textContent = status;

    cell = tr.insertCell(6);
    button = createNewButton({
        type: 'tooltip',
        title: PbxObject.frases.CANCEL,
        classname: 'btn btn-link btn-default btn-md',
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
        classname: 'btn btn-link btn-success btn-md',
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

        result.storelimit = result.storelimit ? convertBytes(result.storelimit, 'Byte', 'GB').toFixed(2) : 0;
        result.storesize = result.storesize ? convertBytes(result.storesize, 'Byte', 'GB').toFixed(2) : 0;
        result.storefree = result.storelimit - result.storesize;
        // if(result.storesize) result.storesize = convertBytes(result.storesize, 'Byte', 'GB').toFixed(2);
        // if(result.storelimit) {
        //     result.storelimit = convertBytes(result.storelimit, 'Byte', 'GB').toFixed(2);
        // } else {
        //     storelimitCont.style.display = 'none';
        // }
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
    if(groupid){
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
    
    json_rpc_async('setObject', jprms, function(){
        $('#el-extension').modal('hide');
    });

    upload('upload-avatar', '/$AVATAR$?userid='+PbxObject.userid);
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
        json_rpc_async('getUserInfo', '"userid":"'+userid+'"', function(result){
            PbxObject.vars.infoShown = true;
            data = {
                data: result,
                frases: PbxObject.frases
            };
            rendered = Mustache.render(template, data);
            $('#userInfo').html(rendered);
            btn.innerHTML = btnContent;
            $('#userInfo').collapse('toggle');
        });

    });
}

function GetStarted(container) {
	var extensions = [],
		objects = PbxObject.objects
		// welcomeModal = 'welcome-modal',
		// wgSteps = [],
		// dashTour = {};

	var modalCont = document.getElementById('modals-cont');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "gs-modal-cont";
		document.body.appendChild(modalCont);
	}

	this.init = function() {
		// createTour();

		// Get initial data for the Widget
		// if(typeof objects === 'object') {
			// createWidget();
		// } else {

			getExtensions(function(exts) {
			    extensions = exts;
			    console.log('extensions:', extensions);

			    // getObjects(null, function(objs) {
			    	// objects = objs;

			    	console.log('objects:', objects);

			    	// createWidget();

			    	if(doWelcomeModalNeeded()) {
			    		initGetStarted();
			    		appStorage.set('welcomed', true);
			    	}

					createGSButton();

			    	// if(doWelcomeModalNeeded())
			    	// 	loadWelcomeModal();
			    // });

			});
		// }		
	};

	function doWelcomeModalNeeded() {
		// var noRoutesObjs = filterKinds(objects, 'routes', true);
		return !appStorage.get('welcomed') && (!extensions.length || extensions.length < 2);
	}

	// function loadWelcomeModal() {
	//     var modalCont = document.createElement('div');
	//     $('body').prepend(modalCont);

	//     ReactDOM.render(WelcomeModal({
	//         startTour: startTour,
	//         frases: PbxObject.frases
	//     }), modalCont);

	//     $('#welcome-modal').modal();

	//     appStorage.set('welcomed', true);
	// }

	// function startTour() {
	//     dashTour.start();
	// }

	// function createWidget() {

	// 	var allDone = true;

	// 	wgSteps = [
	// 		{
	// 			component: "AddExtensions",
	// 		    name: "addExtensions",
	// 		    icon: "fa fa-users",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.A.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.A.BODY,
	// 		    done: filterKinds(objects, 'users').length > 0 || filterKinds(objects, 'equipment').length > 0
	// 		}, {
	// 			component: "AddServiceGroup",
	// 		    name: "addServiceGroup",
	// 		    icon: "icon-headset_mic",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.B.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.B.BODY,
	// 		    done: filterKinds(objects, ['hunting','icd','chatchannel']).length > 0
	// 		}, {
	// 			component: "AddChannel",
	// 		    name: "addChannel",
	// 		    icon: "fa fa-whatsapp",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.B.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.B.BODY,
	// 		    done: filterKinds(objects, ['chattrunk']).length > 0
	// 		}
	// 		// {
	// 		// 	// component: "AddTrunk",
	// 		//     name: "addAttendant",
	// 		//     icon: "icon-room_service",
	// 		//     title: PbxObject.frases.GET_STARTED.STEPS.C.TITLE,
	// 		//     desc: PbxObject.frases.GET_STARTED.STEPS.C.BODY,
	// 		//     done: filterKinds(objects, 'attendant').length > 0,
	// 		//     onClick: function() {
	// 		//     	window.location.hash = '#attendant/attendant';
	// 		//     }
	// 		// }, 
	// 		// {
	// 		// 	// component: "AddTrunk",
	// 		//     name: "addTrunk",
	// 		//     icon: "fa fa-cloud",
	// 		//     title: PbxObject.frases.GET_STARTED.STEPS.D.TITLE,
	// 		//     desc: PbxObject.frases.GET_STARTED.STEPS.D.BODY,
	// 		//     done: filterKinds(objects, 'trunk').length > 0,
	// 		//     onClick: function() {
	// 		//     	window.location.hash = '#trunk/trunk';
	// 		//     }
	// 		// }
	// 	];

	// 	wgSteps.forEach(function(item) {
	// 		if(!item.done) allDone = false;
	// 	});

	// 	ReactDOM.render(GsWidget({
	// 	    steps: wgSteps,
	// 	    frases: PbxObject.frases
	// 	}), document.getElementById('get-started-cont'));

	// 	if(allDone) setAllDone();
	// }

	function initGetStarted() {
		var initialStep = extensions.length < 2 ? 0 : 2;
		// var initialStep = 0;

		ReactDOM.render(GSModalComponent({
		    frases: PbxObject.frases,
		    initialStep: initialStep,
		    profile: PbxObject.profile,
		    options: PbxObject.options,
		    objects: PbxObject.objects,
		    onClose: onClose,
		    sendLinks: sendLinks
		}), modalCont);

	}

	function sendLinks(email) {
		
	}

	function onClose(init) {
		PbxObject.tourStarted = init ? true : false;
	}

	function createGSButton() {
		var ul = document.createElement('ul');
		var li = document.createElement('li');
		var cont = document.querySelector('#pbxmenu');
		var child = document.querySelector('#pbxmenu .nav-list');

		ul.className = 'nav-list';
		ul.appendChild(li);
		cont.insertBefore(ul, child);

		ReactDOM.render(InitGSButtonComponent({
		    frases: PbxObject.frases,
		    onClick: initGetStarted
		}), li);
	}

	// function createTour() {
	// 	dashTour = MyTour('dashboard', PbxObject.tours.dashboard());
 //    }

    // function setAllDone() {
    // 	var panelEl = document.querySelector('#get-started-panel');
    // 	panelEl.classList.add('minimized');
    // 	panelEl.classList.add('all-done');
    // }

	function filterKinds(array, kinds, reverse) {
		return array.filter(function(item) {
			return reverse ? (Array.isArray(kinds) ? kinds.indexOf(item.kind) === -1 : item.kind !== kinds) : (Array.isArray(kinds) ? kinds.indexOf(item.kind) !== -1 : item.kind === kinds);
		});
	}
		
}
function load_hunting(params) {

	console.log('load_hunting: ', params);
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont;

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	function getDefaultName() {
		var name = PbxObject.frases.HUNTING_GROUP.DEFAULT_NAME + ' ';
		name += PbxObject.objects ? filterObject(PbxObject.objects, PbxObject.kind).length+1 : 1;
		return name;
	}

	function onNameChange(name) {
		objParams.name = name;
	}

	function onStateChange(state) {
		objParams.enabled = state;
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result) {
		    console.log('onStateChange: ', state, result);
		});
	}

	// function onAddMembers() {
	// 	var params = PbxObject.name ? { groupid: PbxObject.oid } : null;

	//     json_rpc_async('onAddMembers', params, function(result){
	// 		console.log('onAddMembers: ', result);
	// 		showAvailableUsers(result);
	// 	});
	// }

	function showAvailableUsers() {
		console.log('showAvailableUsers: ');
		modalCont = document.getElementById('available-users-cont');

		if(modalCont) {
			modalCont.parentNode.removeChild(modalCont);
		}

		modalCont = document.createElement('div');
		modalCont.id = "available-users-cont";
		document.body.appendChild(modalCont);

		ReactDOM.render(AvailableUsersModalComponent({
		    frases: PbxObject.frases,
		    onSubmit: addMembers,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);

		// $('#'+modalId).modal();
	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);
		console.log('addMembers: ', array, objParams);

		setObject(objParams, function(result) {
			init(objParams);
		});
		$('#available-users-modal').modal('hide');
	}

	function deleteMember(params) {
		var oid = params.oid;
		console.log('deleteMember: ', oid);
		objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
		setObject(objParams, function(result) {
			init(objParams);
		});
	}

	function setObject(props, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var objName = props.name || defaultName;

	    console.log('setObject: ', props);

		json_rpc_async('setObject', {
			kind: PbxObject.kind,
			oid: props.oid,
			name: objName,
			enabled: props.enabled,
			options: props.options,
			members: (props.members.length ? props.members.reduce(function(prev, next) { prev.push(next.number || next.ext); return prev; }, []) : [])
		}, function(result) {
			PbxObject.name = objParams.name = objName;

			// Upload audio files
			if(props.files && props.files.length) {
				console.log('upload Files: ', props.files);
				props.files.forEach(function(item) {
					uploadFile(item);
				})
			}

			// Add new route to the routing table
			if(props.route && props.route.ext) {
			    console.log('set route props: ', props.route);
			    var routeProps = {
			    	number: props.route.ext,
			    	target: { oid: PbxObject.oid, name: PbxObject.name }
			    };
			    if(params.routes.length) routeProps.oid = params.routes[0].id;
			    
			    setObjRoute(routeProps);
			    
			}

			if(handler) handler();
			if(callback) callback(result);
		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    onAddMembers: showAvailableUsers,
		    setObject: setObject,
		    onNameChange: onNameChange,
		    onStateChange: onStateChange,
		    getInfoFromState: getInfoFromState,
		    getExtension: getExtension,
		    deleteMember: deleteMember
		};

		if(params.name) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(HuntingGroupComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(objParams);
	show_content();
    set_page();

}
function load_icd(params) {

	console.log('load_icd: ', params);
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont;

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	function getDefaultName() {
		var name = PbxObject.frases.ICD_GROUP.DEFAULT_NAME + ' ';
		name += PbxObject.objects ? filterObject(PbxObject.objects, PbxObject.kind).length+1 : 1;
		return name;
	}

	function onNameChange(name) {
		objParams.name = name;
	}

	function onStateChange(state) {
		objParams.enabled = state;
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result) {
		    console.log('onStateChange: ', state, result);
		});
	}

	// function onAddMembers() {
	// 	var params = PbxObject.name ? { groupid: PbxObject.oid } : null;

	//     json_rpc_async('onAddMembers', params, function(result){
	// 		console.log('onAddMembers: ', result);
	// 		showAvailableUsers(result);
	// 	});
	// }

	function showAvailableUsers() {
		console.log('showAvailableUsers: ');
		modalCont = document.getElementById('available-users-cont');

		if(modalCont) {
			modalCont.parentNode.removeChild(modalCont);
		}

		modalCont = document.createElement('div');
		modalCont.id = "available-users-cont";
		document.body.appendChild(modalCont);

		ReactDOM.render(AvailableUsersModalComponent({
		    frases: PbxObject.frases,
		    onSubmit: addMembers,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);

	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);
		console.log('addMembers: ', array, objParams);

		setObject(objParams, function(result) {
			init(objParams);
		});
		$('#available-users-modal').modal('hide');
	}

	function deleteMember(params) {
		var oid = params.oid;
		console.log('deleteMember: ', oid);
		objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
		setObject(objParams, function(result) {
			init(objParams);
		});
	}

	function setObject(props, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var objName = props.name || defaultName;

	    console.log('setObject: ', props);

		json_rpc_async('setObject', {
			kind: PbxObject.kind,
			oid: props.oid,
			name: objName,
			enabled: props.enabled,
			options: props.options,
			members: (props.members.length ? props.members.reduce(function(prev, next) { prev.push(next.number || next.ext); return prev; }, []) : [])
		}, function(result) {
			PbxObject.name = objParams.name = objName;

			// Upload audio files
			if(props.files && props.files.length) {
				console.log('upload Files: ', props.files);
				props.files.forEach(function(item) {
					uploadFile(item);
				})
			}

			// Add new route to the routing table
			if(props.route && props.route.ext) {
			    console.log('set route props: ', props.route);
			    var routeProps = {
			    	number: props.route.ext,
			    	target: { oid: PbxObject.oid, name: PbxObject.name }
			    };
			    if(params.routes.length) routeProps.oid = params.routes[0].id;
			    
			    setObjRoute(routeProps);
			    
			}

			if(handler) handler();
			if(callback) callback(result);
		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    onAddMembers: showAvailableUsers,
		    setObject: setObject,
		    onNameChange: onNameChange,
		    onStateChange: onStateChange,
		    getInfoFromState: getInfoFromState,
		    getExtension: getExtension,
		    deleteMember: deleteMember
		};

		if(params.name) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(IcdGroupComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(objParams);
	show_content();
    set_page();

}
function Ldap(options){
    var options = options || {},
    available = [],
    ldapUsers = [],
    selectedUsers = [],
    modal = null;

    console.log('new LDAP: ', options);

    var prevValue, newValue, userIndex, obj = {};
    // var loc = window.location;
    // var lastURL = window.location.href;
    var serviceParams = { id: options.service_id, type: options.service_type };
    // var newhref = loc.origin + loc.pathname + (loc.search ? loc.search : '?') + '&service_id='+options.service_id+'&service_type='+options.service_type + loc.hash;

    return {
        options: options,
        getUsers: getUsers,
        getExternalUsers: getExternalUsers,
        setUsers: setUsers,
        setExternalUsers: setExternalUsers,
        showUsers: showUsers,
        auth: openAuthModal,
        close: closeModal
    };

    function getUsers(authData, cb){
        json_rpc_async('getDirectoryUsers', authData, function(result) {
            console.log('getDirectoryUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function getExternalUsers(cb){
        // var params = {
            // url: '/services/'+options.service_id+'/Users'
            // method: 'GET'
        // };
        // if(authData) {
        //     params.method = 'POST';
        //     // params.data = {username: authData.username, password: authData.password};
        //     params.data = 'username='+authData.username+'&password='+authData.password;
        // }
        
        // request(params.method, params.url, params.data, null, function(err, data) {
        //     if(err) {
        //         console.log('getExternalUsers error: ', err);
        //         if(err && err.code === 401) {
        //             options.external = true;
        //             openAuthModal();
        //         } else {
        //             var loc = window.location,
        //             newhref = loc.origin + loc.pathname + (loc.search ? loc.search : '?') + '&service_id='+options.service_id+'&service_type='+options.service_type + loc.hash;
        //             window.sessionStorage.setItem('lastURL', newhref);
        //             window.location = loc.origin + '/services/'+options.service_id+'/Users';
        //         }
        //     } else {
        //         console.log('getExternalUsers: ', data);
        //         if(cb) cb(data.result);
        //         else showUsers(data.result);
        //     }
        // })
        console.log('getExternalUsers');

        $.ajax({
            url: '/services/'+options.service_id+'/Users'
        }).then(function(data){
            console.log('getExternalUsers: ', data);
            if(data.result.location) {
                // window.sessionStorage.setItem('lastURL', lastURL);
                window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                return window.location = data.result.location;
            }
            if(cb) cb(data.result);
            else showUsers(data.result);

        }, function(err){
            var error = err.responseJSON.error;
            console.log('getExternalUsers error: ', error);
            if(error && error.redirection) {
                // window.sessionStorage.setItem('lastURL', lastURL);
                window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                window.location = error.redirection;
            // } else if(error && error.code === 401) {
            //     options.external = true;
            //     openAuthModal();
            } else {
                // window.sessionStorage.setItem('lastURL', lastURL);
                window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                window.location = loc.origin + '/services/'+options.service_id+'/Users';
            }
        });
    }

    function setUsers(data, cb){
        console.log('setDirectoryUsers: ', data);
        json_rpc_async('setDirectoryUsers', data, function(result) {
            console.log('setDirectoryUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function setExternalUsers(data, cb){
        console.log('setExternalUsers: ', data);
        json_rpc_async('setExternalUsers', data, function(result) {
            console.log('setExternalUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function openAuthModal(params){
        if(params) {
            getUsers(params, function(result) {
                if(result) showUsers(result);
            });
        } else {
            showModal('ldap_auth', {service_id: options.service_id, domains: options.domains}, ldapAuth);
        }
    }

    function ldapAuth(data, modalObject){
        console.log('ldapLogin: ', data, modalObject);
        var btn = modalObject.querySelector('button[data-type="submit"]'),
            prevhtml = btn.innerHTML;
        
        modal = modalObject;
        btn = $(btn);
        btn.prop('disabled', true);
        btn.html('<i class="fa fa-fw fa-spinner fa-spin"></i>');
        
        options.auth = data;

        if(options.external) {
            getExternalUsers(data, function(result){
                console.log('getExternalUsers login result: ', result);
                btn.prop('disabled', false);
                btn.html(prevhtml);

                if(result) {
                    $(modalObject).modal('hide');
                    showUsers(result);
                }
            });
        } else {
            getUsers(data, function(result) {
                console.log('ldapLogin result: ', result);
                btn.prop('disabled', false);
                btn.html(prevhtml);

                if(result) {
                    $(modalObject).modal('hide');
                    showUsers(result);
                }
            });
        }
    }

    function showUsers(users){
        var usersArray = users.map(function(item, index) {
            item.index = index;
            return item;
        });
        
        ldapUsers = users;
        available = options.available.map(function(item, index){
            return {
                id: index+1,
                text: item
            };
        });
        available.unshift({ id: 0, text: '----------' });

        console.log('showModal: ', PbxObject.available, options.available, available);

        showModal('ldap_users', {
            users: usersArray,
        }, addLdapUsers, onLdapModalOpen, onLdapModalClose);
    }

    function addLdapUsers(data, modalObject){
        console.log('addLdapUsers: ', selectedUsers);

        function hasExt(item){
            return item.hasOwnProperty('ext');
        }

        modal = modalObject;

        options.onaddusers(selectedUsers.filter(hasExt));

    }

    function onLdapModalOpen(modalObject){
            
        $(modalObject).on('click', function(e){
            e.preventDefault();
            var targ = e.target;
            if(targ.name !== 'add-ldap-user') targ = targ.parentNode;
            if(targ.name === 'add-ldap-user') addExtSelection(targ);
        });

        modal = modalObject;

        TableSortable.sortables_init();
    }

    function addExtSelection(el){
        var id,
            $select,
            $el = $(el),
            $cont = $el.next();

        userIndex = parseInt(el.getAttribute('data-index'), 10);
        prevValue = $el.data('data-selected');

        $cont.html('<select style="width: 100%;"></select>');
        $select = $cont.children(':first');
        
        $el.hide();
        $select.select2({
            data: sortByKey(available, 'id')
        });

        console.log('available: ', available);

        $select.on('select2:open', onSelectOpen);
        $select.on('select2:close', onSelectSelected);
        $select.on('select2:close', function(){
            if(newValue && newValue.id !== 0) {
                $el.text(newValue.text);
                id = newValue.id;
            } else if(newValue && newValue.id === 0){
                $el.html('<i class="fa fa-plus-circle fa-fw fa-lg"></i>');
                id = newValue.id;
            } else {
                $el.text(prevValue.text);
                id = prevValue.id;
            }
            $el.data('data-selected', id);
            $el.show();
            $cont.hide();
        });

        $cont.show();
        if(prevValue) $select.val(prevValue).trigger('change');
        $select.select2('open');

    }

    function onSelectOpen(e){
        prevValue = available[parseInt(this.value, 10)];
        newValue = null;
    }

    function onSelectSelected(e){
        newValue = available[parseInt(this.value, 10)];

        if(prevValue.id !== newValue.id) {
            if(prevValue.id !== 0) {
                prevValue.disabled = false;

                selectedUsers.splice(selectedUsers.indexOf(userIndex), 1);
            }
            if(newValue.id !== 0) {
                newValue.disabled = true;

                obj = ldapUsers[userIndex];
                obj.ext = newValue.text;
                delete obj.index;
                
                selectedUsers.push(obj);
            }
        }

        $(this).off('select2:open', onSelectOpen);
        $(this).off('select2:close', onSelectSelected);
        // destroy select element
        $(this).select2('destroy');
    }

    function onLdapModalClose(modalObject){
        console.log('LDAP modal closed');
        available = [];
        ldapUsers = [];
        selectedUsers = [];
    }

    function closeModal(){
        $(modal).modal('hide');
    }
}
window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };

 function initGlobals(global) {
    // WTF??
    global.PbxObject = {
        options: {},
        optionsOpened: false,
        systime: '',
        initInterval: {},
        websocket: {},
        websocketTry: 0,
        currentObj: {},
        protocolOpts: {},
        frases: {},
        smallScreen: false,
        Dashboard: {},
        channels: [],
        members: [],
        available: [],
        extensions: [],
        objects: undefined,
        groups: {},
        templates: {},
        partials: {},
        name: '',
        language: '',
        query: '',
        kind: '',
        oid: ''
    };
 }

 init();

function init(){
    var fn = setupPage;
    initGlobals(window);

    window.clearInterval(PbxObject.initInterval);
    if (document.readyState === "complete" || document.readyState === "interactive") {
        fn();
    } else {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function factorial() {
                document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                fn();
            }, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', arguments.callee);
                    fn();
                }
            });
        }
    }
}

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/logout', true);
    xhr.onload = function (e) {
        console.log('logout: ', e);
        window.location = '/';
    };
    xhr.send();

    setLastQuery('');
}

function createWebsocket(){

    var protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
    var websocket = new WebSocket(protocol + '//'+window.location.host+'/','json.api.smile-soft.com'); //Init Websocket handshake

    websocket.onopen = function(e){
        console.log('WebSocket opened: ', e);
        PbxObject.websocketTry = 1;
    };
    
    websocket.onmessage = function(e){
        // console.log(e);
        handleMessage(e.data);
    };
    
    websocket.onclose = onWebsocketClose;

    window.onbeforeunload = function() {
        websocket.onclose = function () {}; // disable onclose handler first
        websocket.close()
    };

    PbxObject.websocket = websocket;

}

function onWebsocketClose(e) {
    console.log('WebSocket closed', e);
    if(e.code === 1006) return window.location = '/';
    var time = generateInterval(PbxObject.websocketTry);
    setTimeout(function(){
        PbxObject.websocketTry++;
        createWebsocket();
    }, time);
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

function loadStripeJs() {
    if(window.StripeCheckout) return configureStripe();

    $.ajaxSetup({ cache: true });
    $.getScript('https://checkout.stripe.com/checkout.js', configureStripe);
}

function configureStripe() {
    var stripeHandler = StripeCheckout.configure({
        // key: 'pk_live_6EK33o0HpjJ1JuLUWVWgH1vT',
        key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
        image: '/badmin/images/Ringotel_emblem_new.png',
        billingAddress: true,
        email: PbxObject.profile.email,
        currency: PbxObject.profile.currency,
        name: 'Ringotel',
        zipCode: true,
        locale: 'auto',
        token: function(token) {
            console.log('stripe token: ', token);
            PbxObject.stripeToken = token;
        }
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function() {
      stripeHandler.close();
    });

    PbxObject.stripeHandler = stripeHandler;
}

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
    
    if(xmlhttp.status === 403) return window.location = '/';

    var parsedJSON = JSON.parse(xmlhttp.responseText);
    if(parsedJSON.error != undefined){
        notify_about('error' , parsedJSON.error.message);
        return;
    }
    return parsedJSON.result;
}

function json_rpc_async(method, params, handler, id){
    var xhr = {};
    var jsonrpc = {};
    var parsedJSON = {};
    var requestTimer = null;

    if(params !== null){
        if(typeof params === 'object'){
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":'+JSON.stringify(params)+', \"id\":'+1+'}';
        } else{
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';    
        }
    } else{
        jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';
    }
    
    xhr = new XMLHttpRequest();
    xhr.open("POST", "/", true);

    requestTimer = setTimeout(function(){
        xhr.abort();
        notify_about('info' , PbxObject.frases.TIMEOUT);
        show_content();
    }, 60*1000);

    xhr.onreadystatechange = function() {
        if (xhr.readyState==4){
            clearTimeout(requestTimer);
            if(xhr.status != 200) {
                console.error(method, xhr.responseText);

                if(xhr.status === 403) return window.location = '/';
                if(xhr.responseText) parsedJSON = JSON.parse(xhr.responseText);

                if(handler) {
                    handler(null, parsedJSON.error);
                } else {
                    notify_about('error', (parsedJSON.error ? parsedJSON.error.message : PbxObject.frases.ERROR));
                }
                show_content();

            } else {
                if(xhr.responseText != null) {
                    if(!xhr.responseText) return handler();
                    parsedJSON = JSON.parse(xhr.responseText);

                    if(parsedJSON.error){
                        if(handler) handler(null, parsedJSON.error);

                        notify_about('error' , (parsedJSON.error ? parsedJSON.error.message : PbxObject.frases.ERROR));
                        show_content();

                    } else if(parsedJSON.result){
                        if(handler !== null) handler(parsedJSON.result);

                    }
                }
            }
        }
    };

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(jsonrpc);
}

/**
 * Send request to the server via XMLHttpRequest
 */
function request(method, url, data, options, callback){
    var xhr, response, requestTimer, dataStr;

    xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if(options && options.headers) {
        options.headers.forEach(function(header) {
            xhr.setRequestHeader(header.name, header.value);
        });
    }

    requestTimer = setTimeout(function(){
        xhr.abort();
    }, 60000);
    
    xhr.onload = function(e) {
        
        clearTimeout(requestTimer);

        var redirect = e.target.getAllResponseHeaders();
        var status = e.target.status;
        var response = e.target.responseText;
        if(response) {
            try {
                response = JSON.parse(response);
            } catch(err) {
                console.log('response in not JSON');
            }
        }
            
        if(status === 403) {
            logout();
        } else if(status === 200) {
            if(callback) callback(null, response);
        } else if(status >= 500) {
            if(callback) return callback('The service is under maintenance. Please, try again later.');
        } else {
            if(callback) callback(response.error);
        }

    };

    if(data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        dataStr = JSON.stringify(data);
        xhr.send(dataStr);
    } else {
        xhr.send();
    }
    
}

function getTranslations(language, callback){
    var xhr = new XMLHttpRequest();
    var file = 'translations_'+language+'.json';
    xhr.open('GET', '/badmin/translations/'+file, true);
    xhr.onload = function (e) {
        if(e.target.status === 403) {
            logout();
        } else if(e.target.status === 200) {
            var data = JSON.parse(xhr.responseText);
            PbxObject.frases = data;
            callback(null, data);
        } else {
            callback('ERROR_OCCURED');
        }
    };
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send();
}

// function loadTranslations(result){
//     PbxObject.frases = result;
//     init();
// }

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
        $('#sidebar-toggle').toggleClass('flipped');
        PbxObject.smallScreen = isSmall;
    }
}

function handleMessage(data){
    var data = JSON.parse(data),
        method = data.method;
    
    if(data.method){ //if the message content has no "id" parameter, i.e. sent from the server without request
        var params = data.params;
        console.log('handleMessage', data.method, params);

        if(method == 'stateChanged' || method == 'objectUpdated'){
            // updateExtensionRow(params);
            // emit event
            $(document).trigger('onmessage.object.update', params);

        } else if(method == 'conferenceUpdate'){
            updateConference(data);

        }  else if(method == 'objectCreated'){
            // newObjectAdded(params);
            // emit event
            $(document).trigger('onmessage.object.add', params);
            
        } else if(method == 'objectDeleted') {
            $(document).trigger('onmessage.object.delete', params);
            
        }
    } else{
        callbackOnId(data.id, data.result);
    }
}

function callbackOnId(id, result){

    if(id == 5){
        PbxObject.Dashboard.setCurrentCalls(result);
    } else if(id == 6){
        PbxObject.Dashboard.setCurrentState(result);
    } else if(id == 7){
        setCallStatistics(result);
    }
}

function subscribeToEvents() {
    $(document).on('onmessage.object.update', updateExtensionRow);
    $(document).on('onmessage.object.update', updateMenu);
    $(document).on('onmessage.object.update', function(event, params) {
        console.log('onmessage.object.update: ', PbxObject.oid, params);
        // if object's state change and object oid === params.oid
        if(PbxObject.oid === params.oid) objectStateUpdated(params);
        updateObjectCache(params);
    });
    $(document).on('onmessage.object.add', newObjectAdded);
    $(document).on('onmessage.object.delete', onObjectDelete);
}

function getPbxOptions(callback) {
    var cache = window.sessionStorage.getItem('pbxOptions');
    if(cache) {
        callback(JSON.parse(cache));
    } else {
        json_rpc_async('getPbxOptions', null, function(result) {
            PbxObject.options = result;
            callback(result);
        });
    }
}

function setupPage() {
    var language, 
        lastURL = window.sessionStorage.getItem('lastURL'),
        query = location.hash.substring(1),
        profile = {};
        // search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null;

    createWebsocket();

    getSystemTime();

    getPbxOptions(function(options) {

        // PbxObject.options = options;

        language = options.lang || 'en';
        moment.locale(language);
        
        getTranslations(language, function(err, translations) {

            if(err) return notify_about('error', err);

            // PbxObject.frases = translations;

            if(options.mode !== 1) { // if cloud branch
                BillingApi.getProfile(function(err, response) {
                    if(err) {
                        notify_about('error', err);
                    } else {
                        profile = response.result;
                    }

                    console.log('getProfile: ', err, response);

                    // if(lastURL) {
                    //     window.sessionStorage.removeItem('lastURL');
                    //     window.location = lastURL;
                    // } else 

                    if(window.sessionStorage.query && !window.opener) {

                        // if(search) PbxObject.lastSearch = getQueryParams(search);

                        window.location.hash = window.sessionStorage.query;
                    }

                    PbxObject.profile = profile;

                    // if(profile._id) {
                    //     analytics.identify(profile._id, {
                    //       name: profile.name,
                    //       email: profile.email,
                    //       company: profile.company
                    //     });
                    // }

                    init_page();

                });
            } else {
                init_page();
            }

        });

    });
}

function init_page(){

    // set globals

    // initiate EventEmitter
    window.Events = EventEmitter();

    var maintemp = $('#main-template').html();
    var mainrend = Mustache.render(maintemp, PbxObject.frases);
    $('#pagecontainer').html(mainrend);

    switchMode(PbxObject.options);
    document.getElementsByTagName('title')[0].innerHTML = 'UCC ' + PbxObject.frases.PBXADMIN;

    setPageHeight();
    subscribeToEvents();
    
    if(PbxObject.options.mode !== 1) loadStripeJs();

    new GetStarted().init();

    // PbxObject.groups = {};
    // PbxObject.templates = {};
    // PbxObject.language = window.localStorage.getItem('pbxLanguage');
    PbxObject.language = PbxObject.options.lang;
    PbxObject.smallScreen = isSmallScreen();

    $(window).resize(function(){
        setPageHeight();
        changeOnResize(isSmallScreen());
    });

    if(!isSmallScreen()) {
        $('#pagecontent').addClass('squeezed-right');
    } else{
        $('#sidebar-toggle').toggleClass('flipped');
    }
    if($(window).width() > 767 && $(window).width() < 959) {
        $('#pbxmenu').addClass('squeezed-menu');
        $('#pagecontent').removeClass('squeezed-right');
    }
    
    //set default loading page
    if(!location.hash.substring(1))
        location.hash = 'dashboard';

    // load_pbx_options(PbxObject.options);
    
    get_object();
    set_listeners();

    $('[data-toggle="tooltip"]').tooltip({
        delay: {"show": 1000, "hide": 100}
    });

    $('.tab-switcher', '#pbxoptions').click(function(e) {
        switch_options_tab($(this).attr('data-tab'));
    });

    // var wizzard = Wizzard({frases: PbxObject.frases});
}

// init tour
function initTour(params) {
    console.log('initTour: ', params, PbxObject.tours[params.kind]);
    var kind = params.kind || '';
    var tourOptions = params.tourOptions || {};
    tourOptions.frases = PbxObject.frases;

    if(PbxObject.tours[kind]) 
        MyTour(kind, PbxObject.tours[kind](tourOptions)).start();
}

function set_listeners(){

    addEvent(window, 'hashchange', get_object);
    $('.sidebar-toggle', '#pagecontent').click(toggle_sidebar);
    $('.options-open', '#pagecontent').click(open_options);
    $('.options-close', '#pbxoptions').click(close_options);
    $('#pbxmenu li a').click(onMenuClick);
    $('#logout-btn').click(logout);
    
    // var attachFastClick = Origami.fastclick;
    // attachFastClick(document.body);
}

function onMenuClick(e) {
    var target = this;
    var href = target.href;
    if(href && href.substring(href.length-1) === "#") e.preventDefault();
    showGroups(target);
}

function showGroups(targetEl, show){
    var self = targetEl;
    var checkElement;
    var parent = $(self).parent();
    var kind = $(self).attr('data-kind');
    if(!parent.hasClass('active')){
        if(kind) {
            var ul = document.createElement('ul');
            ul.id = 'ul-'+kind;

            // if(kind != 'unit' && kind != 'icd' && kind != 'hunting' && kind != 'pickup' && kind != 'cli') {
            //     likind = document.createElement('li');
            //     likind.className = 'menu-name';
            //     likind.innerHTML = PbxObject.frases.KINDS[kind];
            //     ul.appendChild(likind);
            // }

            show_loading_panel(parent[0]);

            // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
            getObjects(kind, function(result){
                console.log('showGroups: ', kind, result);

                var li = document.createElement('li');
                li.className = 'add-group-object';
                li.setAttribute('data-oid', kind);
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
                // else if(kind === 'trunk') {
                //     a.href = '#new_trunk';
                // } 
                else{
                    a.href = '#'+kind+'/'+kind;
                    // a.href = '#'+kind+'?'+kind;
                }
                a.innerHTML ='<i class="fa fa-plus"></i><span>'+(isGroup(kind) ? PbxObject.frases.ADD_GROUP : PbxObject.frases.ADD)+'</span>';
                li.appendChild(a);
                ul.appendChild(li);

                var i, gid, name, li, a, rem, objects = result;
                sortByKey(objects, 'name');
                for(i=0; i<objects.length; i++){
                    if(kind === 'trunk' && objects[i].type === 'system') {
                        continue;
                    } else {
                        gid = objects[i].oid;
                        name = objects[i].name;
                        li = document.createElement('li');
                        li.setAttribute('data-oid', gid);
                        a = document.createElement('a');
                        a.href = '#'+kind+'/'+gid;
                        // a.href = '#'+kind+'?'+gid;
                        a.innerHTML = name;
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                }
                $(self).siblings().remove('ul');
                parent.append(ul);

                show_content(false);

                checkElement = $(self).next('ul');
                if(checkElement) checkElement.slideDown('normal');
                parent.addClass('active');
            });
            
        } else {
            checkElement = $(self).next('ul');
            if(checkElement) {
                checkElement.slideDown('normal');
            }
            parent.addClass('active');
        }
    } else {
        checkElement = $(self).next('ul');
        if(!show && checkElement) {
            parent.removeClass('active');
            checkElement.slideUp('normal');
        }
    }
    parent.siblings('li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function hideGroups() {
    $('#pbxmenu li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function get_object(e){

    var query = location.hash.substring(1),
        search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null,
        kind = query.indexOf('/') != -1 ? query.substring(0, query.indexOf('/')) : query.substring(0),
        oid = query.indexOf('/') != -1 ? query.substring(query.indexOf('/')+1, (search ? query.indexOf('?') : query.length)) : null,
        lang = PbxObject.language,
        callback = null,
        fn = null;
    
    if(query === PbxObject.query) return;
    if(query){

        PbxObject.query = query;
        PbxObject.search = search;
        PbxObject.kind = kind;
        PbxObject.oid = oid;

        $('#dcontainer').addClass('faded');

        show_loading_panel();
        setLastQuery(query);
        setActiveMenuElement(kind, oid);


        var modal = document.getElementById('el-extension');
        if(modal) modal.parentNode.removeChild(modal);

        // var groupKinds = ['equipment', 'unit', 'users', 'hunting', 'icd', 'conference', 'selector', 'channel', 'pickup'];
        var groupKinds = ['equipment', 'unit', 'conference', 'selector', 'channel', 'pickup'];
        if(groupKinds.indexOf(kind) != -1){
            kind = 'bgroup';
        }

        // callback = 'load_' + kind;
        // fn = window[callback];

        if(PbxObject.templates[kind]){
            load_template(PbxObject.templates[kind], kind);
        } else {
            // $("#dcontainer").load('/badmin/views/'+kind+'.html', function(template){
            request('GET', '/badmin/views/'+kind+'.html', null, null, function(err, template) {
                PbxObject.templates[kind] = template;
                load_template(template, kind);
            });
            // $.get('/badmin/views/'+kind+'.html', function(template){
            //     PbxObject.templates[kind] = template;
            //     load_template(template, kind);
            // });
        }

        // Analytics
        ga('set', 'page', ('/'+kind));
        ga('send', 'pageview');

    }

    if(isSmallScreen() && $('#pagecontent').hasClass('squeezed-right')) {
        $('#pagecontent').toggleClass('squeezed-right');
        $('#pbxmenu').toggleClass('squeezed-right');
        $('#pbxmenu').scrollTop(0);
    }
}

function load_template(template, kind){
    var callback = 'load_' + kind;
    var fn = window[callback];
    var rendered = Mustache.render(template, PbxObject.frases);
    $("#dcontainer").html(rendered);

    if(kind === 'extensions' || kind === 'channels') {
        getExtensions(fn);
    } else if(PbxObject.oid) {
        json_rpc_async('getObject', '\"oid\":\"'+PbxObject.oid+'\"', fn);
    } else {
        fn();
    }
    // else if(kind == 'calls' || kind == 'records' || kind == 'rec_settings' || kind == 'certificates' || kind == 'statistics' || kind == 'reports'){
    //     json_rpc_async('getObject', '\"oid\":\"'+PbxObject.oid+'\"', fn);
    // }
    $('#dcontainer').scrollTop(0);
    $('.squeezed-menu > ul').children('li.active').removeClass('active').children('ul:visible').slideUp('normal');
}

function getPartial(partialName, cb){
    PbxObject.partials = PbxObject.partials || {};
    var template = PbxObject.partials[partialName];
    if(template){
        cb(template);
    } else{
        request('GET', '/badmin/partials/'+partialName+'.html', null, null, function(err, template) {
            PbxObject.partials[partialName] = template;
            cb(template);
        });
        // $.get('/badmin/partials/'+partialName+'.html', function(template){
        //     PbxObject.partials[partialName] = template;
        //     cb(template);
        // });
    }
}

function getTemplate(tempName, cb){
    PbxObject.templates = PbxObject.templates || {};
    var template = PbxObject.templates[tempName];
    if(!template){
        request('GET', '/badmin/views/'+tempName+'.html', null, null, function(err, template) {
            PbxObject.templates[tempName] = temp;
            cb(temp);
        });
        // $.get('/badmin/views/'+tempName+'.html', function(temp){
        //     PbxObject.templates[tempName] = temp;
        //     cb(temp);
        // });
    } else {
        cb(template);
    }
}

function getTempParams() {
    return PbxObject.currentObj;
}

function updateTempParams(obj) {
    console.log('updateTempParams: ', obj);
    PbxObject.currentObj = extend(PbxObject.currentObj || {}, obj);
}

function setTempParams(obj) {
    console.log('setTempParams: ', obj);
    PbxObject.currentObj = obj;
}

function clearTempParams() {
    PbxObject.currentObj = {};
}

function setLastQuery(query) {
    window.sessionStorage.query = query;
}

function setActiveMenuElement(kind, oid) {
    var menu = document.getElementById('pbxmenu');
    var menuItem = menu.querySelector('.nav-list li a[data-kind="'+kind+'"]');
    var item;

    console.log('setActiveMenuElement', kind, oid, menuItem);

    if(!oid) hideGroups();
    if(!menuItem) return;

    if(!menuItem.classList.contains('active') && !menu.classList.contains('squeezed-menu')) {
        showGroups(menuItem, true);
        setTimeout(function() {
           setActiveMenuItemElement(menuItem, oid);
        }, 500);
    }
    
    setActiveMenuItemElement(menuItem, oid);

}

function setActiveMenuItemElement(menu, oid) {
    var items = [].slice.call(menu.parentNode.querySelectorAll('ul li'));
    items.map(function(item) {
        if(item.hasAttribute('data-oid') && item.getAttribute('data-oid') === oid) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
        return item;
    });
    
    console.log('setActiveMenuItemElement', menu.parentNode, items, oid);
    
}

function set_page(){
    var kind = PbxObject.kind;
    // var groupKinds = ['equipment', 'unit', 'users', 'icd', 'hunting', 'conference', 'selector', 'channel', 'pickup'];
    var groupKinds = ['equipment', 'unit', 'users', 'conference', 'selector', 'channel', 'pickup'];
    if(groupKinds.indexOf(kind) != -1){
        kind = 'bgroup';
    }
    // var chk = document.getElementsByClassName('delall'),
    var container = document.getElementById('dcontainer'),
        trow = container.querySelectorAll('.transrow'),
        clirow = container.querySelectorAll('.clirow'),
        // addConnRow = container.querySelectorAll('.connRow'),
        addRoute = document.getElementById('add-route'),
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
    if(addRoute){
        // for(i=0;i<rtrow.length;i++){
            addEvent(addRoute, 'click', add_new_route);
        // }
    }
    // if(addConnRow.length){
    //     for(i=0;i<addConnRow.length;i++){
    //         addEvent(addConnRow[i], 'click', addConnectorRow);
    //     }
    // }

    if(so){
        var text = PbxObject.name ? PbxObject.frases.SAVE : PbxObject.frases.CREATE;
        so.innerHTML = '<i class="fa fa-check"></i> '+text;
        so.onclick = function(){
            fn();
        };
    }
    if(delobj){
        if(PbxObject.name){
            delobj.onclick = function(){
                delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
            };
        }
        else delobj.setAttribute('disabled', 'disabled');
    }

    // if(kind == 'hunting' || kind == 'icd' || kind == 'unit' || kind == 'routes'){
        var sortable = document.getElementsByClassName('el-sortable');
        for(var i=0;i<sortable.length;i++){
            new Sortable(sortable[i]);
        }
    // }

    add_search_handler();

    $('.selectable-cont').click(function(e){
        var targ = e.target;
        if(targ.getAttribute('data-value')) {
            move_list_item(e);
        } else{
            var cont = getClosest(targ, '.selectable-cont'),
                to, from;

            if(targ.classList.contains('assign-all')) {
                to = cont.querySelector('.members');
                from = cont.querySelector('.available');
            } else if(targ.classList.contains('unassign-all')) {
                to = cont.querySelector('.available');
                from = cont.querySelector('.members');
            } else {
                return;
            }
            // console.log(to, from);
            move_list(to, from);
        }
    });

    $('#dcontainer div.panel-header:not(.panel-static)').click(toggle_panel);
    $('#dcontainer [data-toggle="popover"]').popover({
        placement: 'top',
        trigger: 'focus'
    });
    $('#dcontainer [data-toggle="tooltip"]').tooltip({
        delay: {"show": 1000, "hide": 100}
    });

}

function setBreadcrumbs(){
    var breadcrumb = document.getElementById('main-breadcrumb');
    while (breadcrumb.firstChild) {
        breadcrumb.removeChild(breadcrumb.firstChild);
    }
    if(!PbxObject.kind) return;
    var objname = document.getElementById('objname');
    var crumbs = document.createDocumentFragment();
    var bc1, bc2;
    
    bc1 = document.createElement('li');
    bc1.innerHTML = '<a href="#'+PbxObject.kind+'/'+PbxObject.kind+'">'+PbxObject.frases.KINDS[PbxObject.kind]+'</a>';

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

function getAvailablePool(cb) {
    json_rpc_async('getObject', { oid: 'user' }, function(result) {
        console.log('getAvailablePool: ', result);
        cb(result.available.sort());
    });
}

function toggle_sidebar(e){
    if(e) e.preventDefault();

    $(this).toggleClass('flipped');
    $('#pagecontent').toggleClass('squeezed-right');
    $('#pbxmenu').toggleClass('squeezed-right');
    if(!isSmallScreen())
        toggle_menu();
}

function toggle_menu(){
    $('#pbxmenu').toggleClass('squeezed-menu');
}

function open_options(e){
    if(e) e.preventDefault();
    $('#el-slidemenu').addClass('hide-menu');
    $('#pagecontent').addClass('pushed-left');
    $('#pbxoptions').addClass('pushed-left');
    isOptionsOpened(true);
}
function close_options(e){
    if(e) e.preventDefault();
    $('#pagecontent').removeClass('pushed-left');
    $('#pbxoptions').removeClass('pushed-left');
    $('#el-slidemenu').removeClass('hide-menu');
    setTimeout(function(){
       $('#pbxoptions').removeClass('top-layer');
       $('#el-options-content').remove();
    }, 500);
    isOptionsOpened(false);
}

function isOptionsOpened(bool) {
    if(bool !== undefined) PbxObject.optionsOpened = bool;
    return PbxObject.optionsOpened ? true : false;
}

function showModal(modalId, data, onsubmit, onopen, onclose){
    var modal = document.getElementById(modalId),
        cont = document.getElementById('pagecontainer');
        // cont = document.querySelector('#el-loaded-content');
    
    if(modal) modal.parentNode.removeChild(modal);

    getPartial(modalId, function(template) {
        data.frases = PbxObject.frases;
        modal = Mustache.render(template, data);
        cont.insertAdjacentHTML('afterbegin', modal);
        $('#'+modalId).modal(); 
        $('#'+modalId).on('shown.bs.modal', function(e) {
            if(onsubmit) setModal(this, onsubmit);
            if(onopen) onopen(this);
        });
        if(onclose) {
            $('#'+modalId).on('hide.bs.modal', function(e) {
                onclose(this);
            });
        }
    });
}

function setModal(modalObject, onsubmit){
    var submitBtn = modalObject.querySelector('[data-type="submit"]'),
        form = modalObject.querySelector('form');

    if(submitBtn) {
        addEvent(submitBtn, 'click', function(e) {
            e.target.disabled = true;
            onsubmit(form ? retrieveFormData(form) : null, modalObject);
            // $(modalObject).modal('hide');
        });
    }
        
}

function openModal(params, callback){
    var data = {},
        modal = document.getElementById(params.modalId);
    getPartial(params.tempName, function(template){
        data.frases = PbxObject.frases;
        if(params.data) data.data = params.data;

        var rendered = Mustache.render(template, data),
            cont = document.querySelector('#pagecontainer');

        if(modal) modal.parentNode.removeChild(modal);
        cont.insertAdjacentHTML('afterbegin', rendered);
        $('#'+params.modalId).modal();
        if(callback) callback();
    });
}

function toggle_panel(e){
    e.preventDefault();
    var $panel = $(this).closest('.panel'),
        // $el = $panel.find('.panel-body');
        $el = $panel.children('.panel-body');

    $el.slideToggle();
    $panel.toggleClass('minimized');
}

function toggle_presentation() {
    $('#el-slidemenu').addClass('hide-menu');
    // $('.options-open', '#pagecontent').removeClass('spinner');
    $('#pagecontent').addClass('pushed-left');
    $('#pbxoptions').addClass('pushed-left');
    // $('.tab-switcher', '#pbxoptions').click(function(e) {
    //     switch_options_tab($(this).attr('data-tab'));
    // });
}

function show_loading_panel(container){
    if(document.getElementById('el-loading')) return;
    if(typeof container === 'string') container = document.getElementById(container);
    var back = document.createElement('div');
    back.id = 'el-loading';
    back.className = 'el-loading-panel ';
    // var load = document.createElement('img');
    var load = document.createElement('div');
    // load.src = '/badmin/images/sprites_white.png';
    load.className = 'loader';
    load.innerHTML = '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>'
    back.appendChild(load);

    var cont = container || document.getElementById('pagecontainer');
    cont.appendChild(back);
}

function remove_loading_panel(){
    var loading = document.getElementById('el-loading');
    if(loading) loading.parentNode.removeChild(loading);
}

function show_content(togglecont){
    setBreadcrumbs();
    remove_loading_panel();

    $('#dcontainer').removeClass('faded');

    if(togglecont === false) return;
}

//TODO stick to DRY principles
function switchMode(options){
    // var menu = document.getElementById('pbxmenu');
    // var lists = [].slice.call(menu.querySelectorAll('ul li'));
    var config = options.config;
    var mode = options.mode;
    var lists = [].slice.call(document.querySelectorAll('.branch-mode'));
    if(config.indexOf('channels') == -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-channels') != -1)
                item.parentNode.removeChild(item);
        });
    } 
    // else {
    //     lists.forEach(function(item){
    //         if(item.className.indexOf('mode-equipment') != -1)
    //             item.parentNode.removeChild(item);
    //     });
    // }
    if(config.indexOf('no selectors') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-selector') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no users') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-users') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no trunks') !== -1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-trunks') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(config.indexOf('no groups') !== -1) {
        lists.forEach(function(item){
            // if(item.className.indexOf('mode-groups') != -1 || item.className.indexOf('mode-equipment') != -1)
            if(item.className.indexOf('mode-groups') != -1)
                item.parentNode.removeChild(item);
        });
    }
    if(mode === 1) {
        lists.forEach(function(item){
            if(item.className.indexOf('mode-single') != -1)
                item.parentNode.removeChild(item);
        });
    }
}

function switch_presentation(kind, cont, selector){
    var container = cont || document.getElementById('dcontainer');
    var selector = selector ? '.'+selector : '.pl-kind';
    var panels = [].slice.call(container.querySelectorAll(selector));
    var action;
    panels.forEach(function(item){
        if(item.classList.contains('pl-'+kind) || item.classList.contains('pl-all')) {
            item.style.display = '';
            if(item.classList.contains('pl-no-'+kind)) {
                item.style.display = 'none';    
            }
            // if(!(item.classList.contains('pl-no-'+kind))) {
                // action = 'add';
            // } else {
                // action = 'remove';
            // }
        } else {
            item.style.display = 'none';
        }
        
        // item.classList[action]('revealed');
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
        if(childs[i].id != tabid) 
            childs[i].style.display = 'none';
        else
            childs[i].style.display = '';
    }
}

function add_search_handler(){
    var inputs = [].slice.call(document.querySelectorAll('.el-search'));
    if(inputs.length){
        inputs.forEach(function(item){
            if(item.getAttribute('data-element')) {
                item.oninput = function(e){
                    filter_element(e);
                };
            }
        });
    }
}

function makeElement(data, element, itemMaker, clear){
    var fragment = document.createDocumentFragment();
    data.forEach(function(item) {
        fragment.appendChild(itemMaker(item));
    });
    if(clear) clearTable(element);
    element.appendChild(fragment);
}

function filter_element(e){
    var e = e || window.event;
    var text, val, row, prevstyle,
        input = e.target || this,
        tid = input.getAttribute('data-element'),
        el = document.getElementById(tid);
        val = input.value.toLowerCase();

    if(el.nodeName == 'TABLE') {
        defClass = 'table-row';
        el = el.querySelector('tbody');
    } else {
        defClass = 'block';
    }

    for(var i=0; i<el.children.length; i++){
        child = el.children[i];
        text = child.textContent.toLowerCase();
        child.style.display = text.indexOf(val) === -1 ? 'none' : defClass;
    }
}

function arrayToPattern(prev, next) {
    return prev+'|'+next;
}

function filterObject(array, kind, reverse) {
    var newArray = [],
        match = false,
        kinds = !kind ? [] : (Array.isArray(kind) ? kind : [kind]);
        // pattern = kind ? 
        //     (Array.isArray(kind) ? kind.reduce(arrayToPattern) : kind) :
        //     '';

    // pattern = new RegExp(pattern);
    
    if(!kinds.length) return array;

    newArray = array.filter(function(item) {
        match = kinds.indexOf(item.kind) !== -1;
        return reverse ? !match : match;

        // console.log('filterObject match: ', kind, match);

        // match = reverse ? !(item.kind.match(pattern)) : item.kind.match(pattern); 

        // if(!kind) {
        //     return true;
        // } else {
        //     return Array.isArray(kind) ? (kind.indexOf(match[0]) !== -1) : (kind === match[0]);
        // }
        // return reverse ? !(pattern.test(item.kind)) : pattern.test(item.kind);
    });

    return newArray;
}

function getObjects(kind, callback, reverse) {
    if(typeof PbxObject.objects === 'object') {
        callback(filterObject(PbxObject.objects, kind, reverse));
    } else {
        json_rpc_async('getObjects', { kind: 'all' }, function(result) {
            sortByKey(result, 'name');
            PbxObject.objects = result;
            callback(filterObject(PbxObject.objects, kind, reverse));
        });
    }
}

// function getAllowedObjects(type, callback) {
//     if(typeof PbxObject.objects === 'object') {
//         callback(filterObject(PbxObject.objects, type));
//     } else {
//         json_rpc_async('getObjects', '\"kind\":\"all\"', function(result) {
//             sortByKey(result, 'name');
//             PbxObject.objects = result || [];
//             callback(filterObject(PbxObject.objects, type));
//         });
//     }
// }

function addObjects(array, params, key) {
    console.log('addObjects: ', array, params, key);
    array.push(params);
    return sortByKey(array, key);
}


function updateObjects(array, params, key) {
    console.log('updateObjects: ', array, params, key);
    array = array.map(function(item, index, array) {
        if(item[key] === params[key]) {
            return extend(array[index], params);
        } else {
            return item;
        }
    });
    return array;
}

function deleteObjects(array, params, key) {
    console.log('deleteObjects: ', array, params, key);

    array = array.filter(function(item, index, array) {
        return item[key] !== params[key];
    });
    console.log('deleteObjects arrays: ', array);
    return array;
}

function notify_about(status, message){
    var notifyUp,
        ico,
        cls,
        div = document.createElement('div'),
        close = document.createElement('i'),
        body = document.getElementsByTagName('body')[0];
    switch(status){
        case 'success':
            ico = '<span class="fa fa-check"></span>';
            cls = 'el-notifier-ok';
            break;
        case 'error':
            ico = '<span class="fa fa-close"></span>';
            cls = 'el-notifier-error';
            break;
        default:
            ico = '<span class="fa fa-warning"></span>';
            cls = 'el-notifier-info';
    }
    close.className = 'fa fa-close el-close-notify';
    div.className = 'el-notifier '+cls;
    div.innerHTML += ico+' '+message;
    div.appendChild(close);
    body.appendChild(div);
    notifyUp = setTimeout(function(){
        removeEvent(close, 'click', function(){
            body.removeChild(div);
            clearTimeout(notifyUp);
        });
        body.removeChild(div);
    }, 7000);
    addEvent(close, 'click', function(){
        body.removeChild(div);
        clearTimeout(notifyUp);
    });
}

function append_transforms(tableid, transforms) {
    transforms.forEach(function(item) {
        append_transform(null, tableid, item);
    });
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
    inp.innerHTML = '<i class="fa fa-minus"></i>';
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

function transformsToArray(tableid) {
    var table = document.getElementById(tableid).getElementsByTagName('tbody')[0];
    var children = [].slice.call(table.children);
    var inputs, row;

    children = children

    // get input values
    .map(function(item) {
        row = {};
        [].slice.call(item.querySelectorAll('input[name]'))
        .map(function(input) {
            row[input.name] = (input.type === 'checkbox') ? input.checked : input.value;
        });

        return row;
    })
    .filter(function(item) {
        return item.number !== "";
    });

    return children;

}

function encode_transforms(tableid){
    var table = document.getElementById(tableid).getElementsByTagName('tbody')[0];
    var jprms = '';
    var i = table.children.length;
    while(i--){
        var tr = table.children[i];
        var inp = tr.getElementsByTagName('input');
        var l = inp.length;
        var number = tr.querySelector('input[name="number"]');
        if(!number.value) continue;
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
    var targ = e.currentTarget;
    var el = targ.parentNode, row;
    while(el.nodeName != 'TBODY'){
        if(el.nodeName == 'TR'){
            row = el;
        }
        el = el.parentNode;
    }
    el.removeChild(row);
}

// Updates object params in cached object
function updateObjectCache(params) {
    var objectsCache = PbxObject.objects || [];
    var obj = objectsCache.filter(function(item) {
        return item.oid === params.oid;
    })[0];

    if(obj) {
        obj.enabled = params.enabled;
        obj.name = params.name;
    }

}

function objectStateUpdated(params) {
    var enabled = document.getElementById('enabled');
    if(enabled) {
        enabled.checked = params.enabled;
    }

    console.log('objectStateUpdated: ', params);
    // if object is trunk and "up" property changed
    if(params.up !== undefined) {
        changeTrunkRegState(params.up);
    }
}

function newObjectAdded(event, data){

    var oid = data.oid,
        kind = data.kind,
        name = data.name,
        enabled = data.enabled,
        nameEl = document.getElementById('objname'),
        setobj = document.getElementById('el-set-object'),
        delobj = document.getElementById('el-delete-object'),
        ul = document.getElementById('ul-'+data.kind);

    remove_loading_panel();
    notify_about('success', name+' '+PbxObject.frases.CREATED);

    if(data.ext) 
        addObjects(PbxObject.extensions, data, 'ext');

    if(kind === 'phone' || kind === 'user') return;

    console.log('newObjectAdded: ', nameEl, name);
    if(nameEl && name) nameEl.value = name;
    
    if(ul){
        var li = document.createElement('li'),
            a = document.createElement('a');
        a.href = '#'+kind+'/'+oid;
        a.innerHTML = name;
        li.setAttribute('data-oid', oid);
        li.appendChild(a);
        ul.appendChild(li);
    }

    if(delobj && delobj.hasAttribute('disabled')) {
        delobj.removeAttribute('disabled');
        delobj.onclick = function(){
            delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, data.ext);
        };
    }

    if(kind !== 'application'){
        PbxObject.query = kind+'/'+oid;
        window.location.href = '#'+PbxObject.query;
    }

    if(setobj) 
        setobj.innerHTML = "<i class=\"fa fa-check fa-fw\"></i> " + PbxObject.frases.SAVE;
    
    if(typeof PbxObject.objects === 'object') {
        PbxObject.objects.push(data);
        sortByKey(PbxObject.objects, 'name');
    }

}

function updateMenu(event, data) {
    var ul = document.getElementById('ul-'+data.kind);
    var anchors = [];
    if(ul) {
        anchors = anchors.slice.call(ul.querySelectorAll('li a'));
        anchors.forEach(function(a) {
            if(a.href.indexOf(data.oid) !== -1) {
                a.textContent = data.name;
            }
        });
    }
}

function objectDeleted(data){
    // var ul = document.getElementById('ul-'+data.kind);
    // if(ul){
    //     var li, a, href;
    //     for(var i=0;i<ul.children.length;i++){
    //         li = ul.children[i];
    //         a = li.querySelector('a');
    //         if(a && a.href) {
    //             href = a.href;
    //             if(href && href.substring(href.indexOf('/')+1) == data.oid){
    //                 ul.removeChild(li);
    //             }
    //         } else {
    //             continue;
    //         }
    //     }
    // }

    var ulEl = data.kind ? document.getElementById('ul-'+data.kind) : document.querySelector('#pbxmenu .nav-list');
    var items = ulEl ? [].slice.call(ulEl.querySelectorAll('li ul li')) : [];
    var itemOid;

    console.log('objectDeleted: ', data.kind, ulEl, items);

    items.forEach(function(item) {
        itemOid = item.getAttribute('data-oid');
        if(itemOid && itemOid === data.oid) item.parentNode.removeChild(item);
    });

    if(typeof PbxObject.objects === 'object') {
        PbxObject.objects = PbxObject.objects.filter(function(obj){
            return obj.oid !== data.oid;
        });
    }
}

function set_object_success(message){
    remove_loading_panel();

    notify_about('success', PbxObject.frases.SAVED);
}

function set_options_success() {
    // var i, newpath = '', parts = window.location.pathname.split('/');
    // for (i = 0; i < parts.length; i++) {
    //     if (parts[i] === 'en' || parts[i] === 'uk' || parts[i] === 'ru') {
    //         parts[i] = PbxObject.language;
    //     }
    //     newpath += '/';
    //     newpath += parts[i];
    // }
    // var newURL = window.location.protocol + "//" + window.location.host + newpath.substring(1);
    // window.location.href = newURL;
    window.location.reload(false);
}

function delete_object(name, kind, oid, noConfirm){
    var c = noConfirm ? true : confirm(PbxObject.frases.DODELETE+' '+name+'?');
    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            objectDeleted({name: name, kind: kind, oid: oid});
            window.location.hash = kind+'/'+kind;
        });

    } else{
        return false;
    }
}

function deleteExtension(params){
    var oid = params.oid,
        ext = params.ext,
        group = params.group,
        msg = PbxObject.frases.DODELETE + ' ' + params.name + ' ' +PbxObject.frases.FROM.toLowerCase() + ' ' + (group ? group : "") + '?',
        conf = confirm(msg);

    PbxObject.members = PbxObject.members || [];
    PbxObject.available = PbxObject.available || [];

    if (conf){
        json_rpc_async('deleteObject', { oid: oid }, function(){
            // remove member from array
            PbxObject.members.forEach(function(item, index, array) {
                if(item.oid === oid) {
                    array.splice(index, 1);
                }
            });

            // add extension to available
            PbxObject.available.push(ext);
            PbxObject.available.sort();
        });        
    } else {
        return;
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
        msg = PbxObject.frases.DODELETE + ' ' + ext + ' ' +PbxObject.frases.FROM.toLowerCase() + ' ' + (group ? group : "") + '?',
        c = confirm(msg);

    PbxObject.members = PbxObject.members || [];
    PbxObject.available = PbxObject.available || [];

    if (c){
        json_rpc_async('deleteObject', '\"oid\":\"'+oid+'\"', function(){
            if(anchor) {
                anchor.removeAttribute('href');
                removeEvent(anchor, 'click', get_extension);
            }

            // remove member from array
            PbxObject.members.forEach(function(item, index, array) {
                if(item.oid === oid) {
                    array.splice(index, 1);
                }
            });

            // add extension to available
            PbxObject.available.push(ext);
            PbxObject.available.sort();
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

function onObjectDelete(event, params) {
    if(params.ext && (/extensions|equipment/.test(PbxObject.kind)) ) {
        delete_extension_row(params);
        PbxObject.extensions = deleteObjects(PbxObject.extensions, params, 'ext');
    } else {
        objectDeleted(params);
    }
}

function delete_extension_row(params){
    var table = document.getElementById('extensions') || document.getElementById('group-extensions');
    // console.log(table);
    table = table.querySelector('tbody');

    var row = document.getElementById(params.oid);
    table.removeChild(row);

    var available = document.getElementById('available-users');
    if(available) {
        available.innerHTML += '<option value="'+params.ext+'">'+params.ext+'</option>';
    }
}

function validateInput(e){
    var e = e || window.event;
    // Allow: backspace, tab, delete, escape, enter
    if ([46, 9, 8, 27, 13].indexOf(e.keyCode) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) || 
         // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40) || 
         // Allow: comma and dash 
        (e.keyCode == 188 && e.shiftKey === false) || 
        (e.keyCode == 189 && e.shiftKey === false)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function escapeValue(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getFileName(ArrayOrString){
    if(ArrayOrString !== null) {
        var name = '';
        if(Array.isArray(ArrayOrString)){
            ArrayOrString.forEach(function(file, index, array){
                name += ' '+file;
                if(index !== array.length-1) name += ',';
            });
        } else {
            name = ' '+ArrayOrString;
        }
        return name;
    }
    return '';
}

function customize_upload(id, resultFilename){
    var upl = document.getElementById(id);
    if(!upl) {
        console.error('custommize_upload: File element not found');
        return;
    }
    var uplparent = upl.parentNode,
        uplbtn = document.createElement('button'),
        uplname = document.createElement('span');
        
    uplparent.className += ' nowrap';

    var filename = getFileName(resultFilename);
    uplname.innerHTML = filename;
    uplname.title = filename;
    uplname.className = 'upload-filename'

    uplbtn.type = 'button';
    uplbtn.className = 'btn btn-default btn-sm needsclick';
    uplbtn.innerHTML = PbxObject.frases.UPLOAD;
    uplbtn.onclick = function(){
        upl.click();
    };
    uplparent.insertBefore(uplbtn, upl);
    uplparent.insertBefore(uplname, upl);
    upl.onchange = function(){
        if(this.files.length){
            filename = getFileName(this.files[0].name);
            uplname.innerHTML = filename;
            uplname.title = filename;
        } else{
            uplname.innerHTML = ' ';
            uplname.title = '';
        }
    };
}

function upload(inputid, urlString){
    var upload;
    if(isElement(inputid))
        upload = inputid;
    else if(typeof inputid === 'string')
        upload = document.getElementById(inputid);
    else
        return false;

    var filelist = upload.files;
    if(filelist.length == 0){
        return false;
    }
    var file = filelist[0];
    var url = urlString ? urlString : '/'+file.name;
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
                if(inputid == 'uploadapp') {
                    notify_about('success' , file.name+' '+PbxObject.frases.UPLOADED);
                }
            }
        }
    };
    xmlhttp.open("PUT", url, true);
    // xmlhttp.setRequestHeader("X-File-Name", file.name);
    // xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send(file);
    console.log('upload', file, url);
}

function uploadFile(file, urlString){
    var upload;

    if(!file){
        return false;
    }

    // var file = files[0];
    var url = urlString ? urlString : '/'+file.name;
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
        }
    };
    xmlhttp.open("PUT", url, true);
    xmlhttp.send(file);

}

function deleteFile(url){

    if(!url) return;
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
        }
    };
    xmlhttp.open("DELETE", url, true);
    // xmlhttp.setRequestHeader("X-File-Name", file.name);
    // xmlhttp.setRequestHeader("X-File-Size", file.size);
    xmlhttp.send();
    console.log('file deleted', url);
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function get_object_link(oid){
    var result = json_rpc('getObject', '\"oid\":\"'+oid+'\"');
    location.hash = result.kind+'/'+oid;
}

function setObjectState(oid, state, callback) {
    if(!oid || state === undefined) return;
    json_rpc_async('setObjectState', {
        oid: oid,
        enabled: state
    }, function(result, err){
        if(err) notify_about('error', err.message);
        if(callback) callback(result, err);
    });
}

function setFormData(formEl, data){
    var field, name;
    for (var i = 0; i < formEl.elements.length; i++) {
        field = formEl.elements[i];
        if (!field.hasAttribute("name")) { continue; };
        name = field.name;
        
        data.forEach(function(obj){
            if(obj.hasOwnProperty('key')){
                if(obj.key === name && field.type !== 'file')
                    if(field.type === 'checkbox')
                        field.checked = obj.value;
                    else
                        field.value = obj.value;
            }
        });
    };
}

function retrieveFormData(formEl){
    var data = {}, type, field, name, value;
    for (var i = 0; i < formEl.elements.length; i++) {

        field = formEl.elements[i];
        type = field.getAttribute('data-type') || field.type;

        if (!field.hasAttribute("name")) { continue; };

        name = field.name;

        if(type === 'number') {
            value = parseFloat(field.value);
        } else if(type === 'checkbox'){
            value = field.checked;
        } else if(type === 'file'){
            value = field.files.length ? field.files[0].name : null;
        } else {
            value = field.value;
        }

        if(value !== undefined && value !== null) data[name] = value;
    };

    return data;
}

function isSmallScreen(){
    return $(window).width() < 768;
}

function convertBytes(value, fromUnits, toUnits){
    var coefficients = {
        'Byte': 1,
        'KB': 1000,
        'MB': 1000000,
        'GB': 1000000000
    }
    return value * coefficients[fromUnits] / coefficients[toUnits];
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function toTheTop(elementId){
    var scrollTop = $(document).scrollTop();
    var scrollTo = elementId ? $("#"+elementId).offset().top : 0;
    if(scrollTop < scrollTo) return;
    $('html body').animate({
        scrollTop: scrollTo
    }, 500);
}

function copyFromField(targ, fieldId) {
    // var e = e || window.event;
    // var button = e.currentTarget;
    var elgroup = getClosest(targ, '.input-group'),
        input = elgroup.querySelector('input'),
        field = document.getElementById(fieldId);

    input.value = field.value;
}

function revealPassword(targ) {
    // var e = e || window.event;
    // var button = e.currentTarget;
    var elgroup = getClosest(targ, '.input-group');
    var input = elgroup.querySelector('input');
    if(input.type == 'password') {
        input.type = 'text';
        targ.innerHTML = '<i class="fa fa-eye-slash" data-toggle="tooltip" title="'+PbxObject.frases.HIDE_PWD+'"></i>';
    } else {
        input.type = 'password';
        targ.innerHTML = '<i class="fa fa-eye" data-toggle="tooltip" title="'+PbxObject.frases.REVEAL_PWD+'"></i>';
    }
}

function generatePassword(targ){
    // var e = e || window.event;
    // var button = e.currentTarget;
    // console.log(e, button);

    var elgroup, input;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var pass = "";
    var length = 8;
    var i;

    for(var x=0; x<length; x++){
        i = Math.floor(Math.random() * 62);
        pass += chars.charAt(i);
    }

    if(targ) {
        elgroup = getClosest(targ, '.input-group');
        input = elgroup.querySelector('input');
        input.value = pass;
    } else {
        return pass;
    }

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

}

function checkAll(selector, checked){
    [].forEach.call(document.querySelectorAll(selector), function(item) {
        item.checked = checked;
    });
}

function isVisible(elementId, bolean){
    var el = document.getElementById(elementId);
    var action = bolean ? 'remove' : 'add';
    el.classList[action]('hidden');
}

function switchDisabledState(e){
    var chk, checked, evt, elname, els;
    if(isElement(e))
        chk = e;
    else {
        evt = e || window.event;
        chk = evt.target;
    }
    checked = chk.checked;
    // console.log(checked);
    elname = chk.getAttribute('data-name');
    els = [].slice.call(document.querySelectorAll('input[name="'+elname+'"]'));
    els.forEach(function(item){
        item.disabled = !checked;
    });
}

function isElement(o){
  return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
}

function isGroup(kind){
    var groupKinds = ['equipment', 'unit', 'users', 'icd', 'hunting', 'cli', 'pickup'];
    if(groupKinds.indexOf(kind) != -1){
        return true;
    }
}

function isMaxNumber(num){
    return num === 2147483647;
}

function sortSelectOptions(selectElement) {
    var options = selectElement.querySelectorAll('options');
     
    options.sort(function(a,b) {
    if (a.text.toUpperCase() > b.text.toUpperCase()) return 1;
    else if (a.text.toUpperCase() < b.text.toUpperCase()) return -1;
    else return 0;
    });
     
    $(selectElement).empty().append( options );
}

function sortByKey(object, key){
    object.sort(function(a, b){
        if (a[key] < b[key])
            return -1;
        if (a[key] > b[key])
            return 1;
        return 0;
    });
    return object
}

function objFromString(obj, i){
    return obj[i];
}

function formatTimeString(time, format){
    var h, m, s, newtime;
    h = Math.floor(time / 3600);
    time = time - h * 3600;
    m = Math.floor(time / 60);
    newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
    if(format == 'hh:mm:ss'){
        s = time - m * 60;
        newtime += ':' + (s < 10 ? '0'+s : s);
    }
    return newtime;
}

function formatDateString(date){
    var p = (parseInt(date)) !== 'NaN' ? parseInt(date) : date;
    // if(p === 'NaN') p = date;
    var strDate = new Date(p);
    // console.log(p, strDate);
    var day = strDate.getDate() < 10 ? '0' + strDate.getDate() : strDate.getDate(),
        month = (strDate.getMonth()+1) < 10 ? '0' + (strDate.getMonth()+1) : strDate.getMonth()+1,
        hours = strDate.getHours() < 10 ? '0' + strDate.getHours() : strDate.getHours(),
        minutes = strDate.getMinutes() < 10 ? '0' + strDate.getMinutes() : strDate.getMinutes();

    return (day + '/' + month + '/' + strDate.getFullYear() + ' ' + hours + ':' + minutes);
}

function fillTable(table, dataArray, createRowFn, callback){
    if(!table || !dataArray || !createRowFn) return;
    
    if(typeof dataArray === 'object') {
        dataArray.forEach(function(item){
            table.appendChild(createRowFn(item));
        });
    } else {
        table.appendChild(createRowFn(dataArray));
    }
    
    if(callback) callback();
}

function clearTable(table){
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
}

function clearColumns(table){
    var thead = table.querySelector('thead');
    var allRows = table.rows;
    while(thead.rows[0].cells.length > 1){
        for (var i=0; i<allRows.length; i++) {
            if (allRows[i].cells.length > 1) {
                allRows[i].deleteCell(-1);
            }
        }
    }
}

function elPosition(el){
    // checking where's more space left in the viewport: above or below the element
    var vH = getViewportH(),
        ot = getOffset(el),
        spaceUp = ot.top,
        spaceDown = vH - spaceUp - el.offsetHeight;
    
    return ( spaceDown <= el.offsetHeight ? 'top' : 'bottom' );
}

// from https://github.com/ryanve/response.js/blob/master/response.js
function getViewportH() {
    var docElem = document.documentElement,
        client = docElem['clientHeight'],
        inner = window['innerHeight'];
    if( client < inner )
        return inner;
    else
        return client;
}

// http://stackoverflow.com/a/11396681/989439
function getOffset( el ) {
    return el.getBoundingClientRect();
}

function extend( a, b ) {
    for( var key in b ) {
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

function deepExtend(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}

function addEvent(obj, evType, fn) {
  if (obj.addEventListener) obj.addEventListener(evType, fn, false);
  else if (obj.attachEvent) obj.attachEvent("on"+evType, fn);
}
function removeEvent(obj, evType, fn) {
  if (obj.removeEventListener) obj.removeEventListener(evType, fn, false);
  else if (obj.detachEvent) obj.detachEvent("on"+evType, fn);
}

function createNewButton(props){
    var button = document.createElement('button');
    if(props.type === 'popover' || props.type === 'tooltip'){
        button.setAttribute('data-toggle', props.type);
        if(props.html !== undefined) button.setAttribute('data-html', props.html);
        if(props.placement) button.setAttribute('data-placement', props.placement);
        if(props.dataContent) button.setAttribute('data-content', props.dataContent);
        if(props.dataTrigger) button.setAttribute('data-trigger', props.dataTrigger);
    }
    button.className = props.classname || '';
    button.innerHTML = props.content || '';
    
    if(props.title) button.title = props.title;
    if(props.handler) addEvent(button, (props.evtType || 'click'), props.handler);

    return button;
}

function setAccordion(container){
    var cont = container ? container : '';
    $(cont+' .acc-cont > .acc-pane').slideToggle();
    $(cont+" .acc-cont > .acc-header").click(function () {
        // $(this).next(".acc-pane").slideToggle().siblings(".acc-pane:visible").slideUp();
        $(this).next(".acc-pane").slideToggle();
        $(this).toggleClass("current");
        $(this).siblings(".acc-header").removeClass("current");
    });
}

function createCodecRow(data){
    var row, cell;
    row = document.createElement('tr');
    cell = row.insertCell(0);
    cell.className = 'draggable';
    cell.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
    cell = row.insertCell(1);
    cell.className = 'codec-name';
    cell.innerHTML = data.codec;
    cell = row.insertCell(2);
    cell.innerHTML = '<input type="text" class="form-control codec-frames" value="'+(data.frame ? data.frame : 30)+'">';
    cell = row.insertCell(3);
    cell.innerHTML = '<input type="checkbox" '+(data.enabled ? 'checked' : '')+' class="codec-enabled">';

    return row;
}

function buildCodecsTable(elementOrId, data, available){
    var unavailable = [],
        fragment = document.createDocumentFragment(),
        el = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
    
    unavailable = unavailable.concat(available);

    data.forEach(function(item){
        item.enabled = true;
        fragment.appendChild(createCodecRow(item));
        if(unavailable.indexOf(item.codec) != -1)
            unavailable.splice(unavailable.indexOf(item.codec), 1);
    });

    unavailable.forEach(function(codec){
        fragment.appendChild(createCodecRow({codec: codec}));
    });
    el.appendChild(fragment);
}

function getCodecsString(elementOrId){
    var codec,
        codecs = [],
        el = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);

    for(var i=0, row; row = el.rows[i]; i++){
        if(row.getElementsByClassName('codec-enabled')[0].checked){
            codec = {
                codec: row.getElementsByClassName('codec-name')[0].textContent,
                frame: parseInt(row.getElementsByClassName('codec-frames')[0].value)
            };
            codecs.push(codec);
        }
    }

    return codecs;
}

function getFriendlyCodeName(code){
    return PbxObject.frases.CODES[code.toString()];
}

function fill_select_items(selectId, items){
    var el = document.getElementById(selectId), opt;
    items.forEach(function(item){
        opt = document.createElement('option');
        opt.value = item.oid;
        opt.textContent = item.name;
        el.appendChild(opt);
    });
}

function fill_list_items(listid, items, prop){
    if(listid == 'available' || (PbxObject.kind != 'hunting' && PbxObject.kind != 'icd' && PbxObject.kind != 'unit')) {
        items.sort();
    }
    var list = document.getElementById(listid),
        fragment = document.createDocumentFragment();
    for(var i=0; i<items.length; i++){
        var item = (prop && items[i][prop]) ? items[i][prop] : items[i];
        var li = document.createElement('li');
        // addEvent(item, 'click', move_list_item);
        li.setAttribute('data-value', item);
        li.innerHTML = item;
        fragment.appendChild(li);
    }
    list.appendChild(fragment);
}

// function move_list_item(e){
//     var li = e.target;
//     var parent = li.parentNode;
//     if(parent.id == 'available'){
//         parent.removeChild(li);
//         document.getElementById('members').appendChild(li);
//     }
//     else{
//         parent.removeChild(li);
//         document.getElementById('available').appendChild(li);
//     }
// }

function move_list_item(e){
    var li = e.target;
    var cont = getClosest(li, '.selectable-cont');
    var parent = li.parentNode;
    if(parent.classList.contains('available')){
        parent.removeChild(li);
        cont.querySelector('.members').appendChild(li);
    }
    else{
        parent.removeChild(li);
        cont.querySelector('.available').appendChild(li);
    }
}

function move_list(to, from){
    var to = isElement(to) ? to : document.getElementById(to),
        from = isElement(from) ? from : document.getElementById(from),
        fromList = [].slice.call(from.querySelectorAll('li'));

    fromList.forEach(function(item){
        to.appendChild(item);
    });
}

function changeGroupType(grouptype){
    // console.log(grouptype);
    var elements = [].slice.call(document.querySelectorAll('.object-type'));
    elements.forEach(function(el){
        if(el.classList.contains(grouptype)) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function newInput(data){
    var div = document.createElement('div');
        div.className = 'form-group';
    if(data.label) {
        var label = '<label for="'+data.id+'">'+data.label+'</label>';
        div.innerHTML += label;
    }
    var input = '<input type="'+(data.type || 'text')+'" class="form-control" id="'+(data.id || '')+'" value="'+(data.value || '')+'">';
    div.innerHTML += input;
    return div;
}

function switchVisibility(selector, isVisible){
    if(isVisible) $(selector).show();
    else $(selector).hide();
}

function get_protocol_opts(protocol, params){
    
    var proto = protocol == 'h323' ? 'h323' : 'sip';
    var options = params.parameters;
    var opts = Object.keys(PbxObject.protocolOpts).length !== 0 ? PbxObject.protocolOpts : options;
    var sipModes = [
        {mode: 'sip info', sel: 'sip info' === opts.dtmfmode},
        {mode: 'rfc2833', sel: 'rfc2833' === opts.dtmfmode},
        {mode: 'inband', sel: 'inband' === opts.dtmfmode}
    ];
    var h323Modes = [
        {mode: 'h245alpha', sel: 'h245alpha' === opts.dtmfmode},
        {mode: 'h245signal', sel: 'h245signal' === opts.dtmfmode},
        {mode: 'rfc2833', sel: 'rfc2833' === opts.dtmfmode},
        {mode: 'inband', sel: 'inband' === opts.dtmfmode}
    ];
    var data = {
        opts: opts,
        internal: params.type === 'internal',
        frases: PbxObject.frases
    };
    data.opts.dtmfmodes = proto == 'h323' ? h323Modes : sipModes;

    var rendered = Mustache.render(PbxObject.templates.protocol, data);
    var cont = document.getElementById('proto-cont');
    if(!cont) {
        cont = document.createElement('div');
        cont.id = 'proto-cont';
        $('#pagecontainer').prepend(cont);
        // document.getElementById('dcontainer').appendChild(cont);
    }
    $(cont).html(rendered);

    var codecs = ["Opus", "G.711 Alaw", "G.711 Ulaw", "G.729", "G.723"];
    var codecsTable = document.getElementById('protocol-codecs').querySelector('tbody');
    buildCodecsTable(codecsTable, data.opts.codecs, codecs);
    new Sortable(codecsTable);

    switch_presentation(proto, cont);
    $('#el-protocol').modal();
    $('#el-set-protocol').click(function(){
        save_proto_opts(proto);
    });
}

function save_proto_opts(proto){
    var opts = PbxObject.protocolOpts;
    var codecsTable = document.getElementById('protocol-codecs').querySelector('tbody');
    opts.codecs = getCodecsString(codecsTable);

    if(document.getElementById('t1'))
        opts.t1 = parseInt(document.getElementById('t1').value);
    if(document.getElementById('t2'))
        opts.t2 = parseInt(document.getElementById('t2').value);
    if(document.getElementById('t3'))
        opts.t3 = parseInt(document.getElementById('t3').value);
    if(document.getElementById('t38fax'))
        opts.t38fax = document.getElementById('t38fax').checked;
    if(document.getElementById('pvideo'))
        opts.video = document.getElementById('pvideo').checked;
    if(document.getElementById('earlymedia'))
        opts.earlymedia = document.getElementById('earlymedia').checked;
    if(document.getElementById('dtmfrelay'))
        opts.dtmfrelay = document.getElementById('dtmfrelay').checked;
        opts.dtmfmode = document.getElementById('dtmfmode').value;
    if(proto == 'h323'){
        opts.faststart = document.getElementById('faststart').checked;
        opts.h245tunneling = document.getElementById('h245tunneling').checked;
        opts.playringback = document.getElementById('playringback').checked;
    }
    else{
        opts.nosymnat = document.getElementById('nosymnat').checked;
        opts.buffering = document.getElementById('buffering').checked;
        opts.noprogress = document.getElementById('noprogress').checked;
        opts.noredirectinfo = document.getElementById('noredirectinfo').checked;
        opts.passanumber = document.getElementById('passanumber').checked;
    }
    
    $('#el-protocol').modal('hide');
}

function updateConference(data){
    // console.log(data);
    var pr = data.params;
    var row = document.getElementById(pr.oid);
    if(row){
        var parties = row.querySelector('[data-cell="parties"]');
        if(parties){
            var btn = row.querySelector('.showPartiesBtn');
            if(pr.total){
                parties.textContent = pr.total;
                btn.removeAttribute('disabled');
            } else{
                parties.textContent = '';
                btn.setAttribute('disabled', 'disabled');
            }
        }
    }

    var channels = PbxObject.channels;
    if(!channels) return;
    channels.forEach(function(channel){
        if(channel.oid === pr.oid){
            var arr = channel.parties;
            if(pr.state == 1) {
                if(!arr) channel.parties = arr = [];
                if(arr.indexOf(pr.number) == -1)
                    arr.push(pr.number);
            } else if(pr.state == 0){
                arr.splice(arr.indexOf(pr.number), 1);
            }
        }
    });
}

function getInfoFromState(state, group){
    var status, className;

    if(state == 1) {
        className = 'success';
    } else if(state == 8) {
        className = 'connected';
    } else if(state == 2 || state == 5) {
        className = 'warning';
    } else if(state == 0 || (state == -1 && group)) {
        // state = '';
        className = 'default';
    } else if(state == 3) {
        className = 'danger';
    } else if(state == 6 || state == 7) {
        className = 'info';        
    } else {
        className = 'active';
    }
    status = PbxObject.frases.STATES[state] || '';

    return {
        rstatus: status,
        rclass: 'bg-'+className,
        className: className
    }

}

function getQueryParams(str){
    return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}

function getSystemTime(){
    json_rpc_async('getSystemTime', null, function (result){
        PbxObject.systime = result;
    });
}

function fill_group_choice(kind, groupid, select){
    // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
    var select = select || document.getElementById("extgroup");
    // for(var i=0;i<=select.options.length;i++){
    //     select.remove(select.selectedIndex[i]);
    // }
    if(!select) return;
    while(select.firstChild) {
        select.removeChild(select.firstChild);
    }
    getObjects(kind, function(result){
        var gid, name, option, i;
        
        if(!result.length) {
            option = document.createElement('option');
            option.value = '';
            option.innerHTML = groupid;
            option.disabled = 'disabled';
            select.appendChild(option);
            return;
        }

        for(i=0; i<result.length; i++){
            gid = result[i].oid;
            name = result[i].name;
            option = document.createElement('option');
            option.setAttribute('value', gid);
            if(gid == groupid || name == groupid) {
                option.selected = "true";
            }
            option.innerHTML = result[i].name;
            select.appendChild(option);
        }
    });
}

function change_protocol(){
    var value = this.value || document.getElementById('protocols').value;
    // console.log(value);
    if(value == 'h323') {
        document.getElementById('sip').parentNode.style.display = 'none';
        document.getElementById('h323').parentNode.style.display = '';
    } else{
        document.getElementById('sip').parentNode.style.display = '';
        document.getElementById('h323').parentNode.style.display = 'none';
    }
};
function load_new_trunk() {

	var trunks = [
		{
			type: 'sip',
			name: 'SIP trunk',
			href: '#trunk/trunk',
			icon: 'fa fa-fw fa-phone'
		}, {
			type: 'Messenger',
			name: 'Messenger',
			href: '#chattrunk/chattrunk?type=Messenger',
			icon: 'fa fa-fw fa-facebook'
		}
	];

	function init(params) {
		console.log('init: ', params);

		var componentParams = {
			frases: PbxObject.frases,
		    trunks: trunks
		};

		ReactDOM.render(NewTrunkComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(trunks);
	show_content();
    set_page();

}
function load_numbers(params) {

	console.log('load_numbers');

	getCoutries();

	function getCoutries() {
		billingRequest('getDidCountries', null, function(err, response) {
			console.log('getSubscription response: ', err, response.result);
			if(err) return notify_about('error' , err.message);
		});
	}

}
function Pagination(options){

    // this.records = {};
    // this.pagins = null;

    this.options = options;

    // pagnum = pagnum > this.maxpagins ? this.maxpagins : pagnum;


    this.createPagination = function(start, end){

        if(this.pagin) {
            clearTable(this.options.table);
            // this._destroyPagination();
        }
        this.currentRange = []; //the currentRange array is needed to trach the current range of pages in pagination element
        if(this.options.pagnum <= 1) return; //if the number of pages is more than 1, then create Pagination            

        var ul, li, a;
        var start = start || this.options.page;
        var end = end || (this.options.pagnum > this.options.maxpagins ? this.options.maxpagins : this.options.pagnum);
        var container = document.querySelector('.pagination-container');
        var pagin = document.createElement('ul');
        var info = document.createElement('p');

        pagin.className = 'pagination custom-pagination';
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="first">&laquo;</a>';
        pagin.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="prev">-</a>';
        pagin.appendChild(li);
        for (var i = start; i <= end; i++) {

            li = document.createElement('li');
            li.innerHTML = '<a href="#" data-page="'+i+'">'+i+'</a>';
            pagin.appendChild(li);

            if(i==end) this.lastPage = li;
            this.currentRange.push(i);

        }
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="next">+</a>';
        pagin.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="last">&raquo;</a>';
        pagin.appendChild(li);

        this.pagin = pagin;
        this.paginInfo = info;
        while(container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(pagin);
        container.appendChild(info);

        pagin.onclick = this._getSelectedPage.bind(this);
        // this.selectPage(this.options.page);
    };

    this._getSelectedPage = function(e){
        e.preventDefault();
        var target = e.target;
        var page = this._isPagin(target); //if element has data-page attribute
        if(!page) {
            if(target.className == 'next') {
                page = this.currentPage+1;
            } else if(target.className == 'prev') {
                page = this.currentPage-1;
            } else if(target.className == 'first') {
                page = 1;
                if(this.options.pagnum >= this.options.maxpagins) {
                    // this._destroyPagination();
                    this.createPagination(1, this.options.maxpagins);
                }
            } else if(target.className == 'last') {
                page = this.options.pagnum;
                if(page >= this.options.maxpagins) {
                    // console.log(page-this.options.maxpagins+1, page);
                    // this._destroyPagination();
                    this.createPagination(page-this.options.maxpagins+1, page);
                }
            }
        }
        if(page > this.options.pagnum || page < 1) return;
        this.selectPage(page);
    };

    this.selectPage = function(page){
        var page = parseInt(page);
        var ind = parseInt(page) * parseInt(this.options.rows) - parseInt(this.options.rows); //starting row, based on the page number
        var len = page * parseInt(this.options.rows); //index of the last row on the page, based on the page number
        len = len < this.options.records.length ? len : this.options.records.length; //if index of the last row is more than total length of result, then index is equal to result.length

        this.currentPage = page;
        clearTable(this.options.table);

        for (var i = ind; i < len; i++) {
            build_records_row(this.options.records[i], this.options.table);
        }

        if(this.currentRange.length) { //if number of pages is greater than 1
            if(this.currentRange.indexOf(page) == this.currentRange.length-1 || this.currentRange.indexOf(page) == this.currentRange.length-2) {
                this._appendPage();
            } else if(this.currentRange.indexOf(page) == 0 || this.currentRange.indexOf(page) == 1) {
                this._prependPage();
            }
            var currentLi = this.pagin.querySelector('li.active');
            if(currentLi) currentLi.classList.remove('active');
            this.pagin.querySelector('a[data-page="'+page+'"]').parentNode.classList.add('active');
        }

        if(this.paginInfo) 
            this.paginInfo.innerHTML = PbxObject.frases.FROM2.toLowerCase() + ' ' +
                                    ind + ' ' +
                                    PbxObject.frases.TO.toLowerCase() + ' ' +
                                    len + ' ' +
                                    PbxObject.frases.RECORDS.REC.toLowerCase();
    };

    this._appendPage = function(){
        var nextpage = this.currentRange[this.currentRange.length-1]+1;
        if(nextpage > this.options.pagnum) return;
        var lastPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[this.currentRange.length-1]+'"]').parentNode;
        var firstPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[0]+'"]').parentNode;
        var li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="'+nextpage+'">'+nextpage+'</a>';
        this.pagin.insertBefore(li, lastPageElement.nextSibling);
        this.pagin.removeChild(firstPageElement);

        this.currentRange.push(nextpage);
        this.currentRange.shift();
    };

    this._prependPage = function() {
        var prevpage = this.currentRange[0]-1;
        if(prevpage < 1) return;
        var lastPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[this.currentRange.length-1]+'"]').parentNode;
        var firstPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[0]+'"]').parentNode;
        var li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="'+prevpage+'">'+prevpage+'</a>';
        this.pagin.insertBefore(li, firstPageElement);
        this.pagin.removeChild(lastPageElement);

        this.currentRange.unshift(prevpage);
        this.currentRange.pop();
    };

    this._destroyPagination = function(){
        while (this.pagin && this.pagin.hasChildNodes()) {
            this.pagin.removeChild(this.pagin.firstChild);
        }
    };

    this._isPagin = function(element){
        return element.getAttribute('data-page');
    };
}
function Picker(pickrElement, defaults){

    var pickr = document.getElementById(pickrElement),
        frases = PbxObject.frases,
        rangeEl,
        button,
        // fields,
        options,
        customRange = false,
        self = this,
        cfrom,
        cto;

    this.defaults = {
        defaultOption: 'today',
        interval: false,
        actionButton: true,
        buttonSize: 'sm',
        buttonColor: 'default'
    };
    this.defaults = extend( {}, this.defaults );
    extend( this.defaults, defaults );

    this.date = {};
    this.interval = this.defaults.interval ? 3600*1000 : null;
    this.intervalString = 'hour';
    this.fields = {};

    this._pickerHandler = function(e){
        var target = e.target,
            range, interval;
        if(target.nodeName === 'LABEL'){
            range = target.children[0].getAttribute('data-range');
            if(range){
                self._setCurrentRange(range);
                if(range === 'custom') {
                    customRange = true; //if custom range option is selected
                    rangeEl.classList.remove('ghosted');
                } else {
                    customRange = false;
                    rangeEl.classList.add('ghosted');
                }
            } else{
                interval = target.children[0].getAttribute('data-interval');
                if(interval){
                    if(interval === 'hour') this.interval = 60*60*1000;
                    else if(interval === '1/2_hour') this.interval = 30*60*1000;
                    else if(interval === '1/4_hour') this.interval = 15*60*1000;
                    else if(interval === 'day') this.interval = 24*60*60*1000;
                    // else if(interval === 'month') this.interval = 30*24*60*60*1000;
                    this.intervalString = interval;
                }
            }
        } else if(target.nodeName === 'BUTTON'){
            if(target.name === "submitButton"){
                if(customRange) self._rangeToString(); //if custom range option is selected
                if(self.defaults.submitFunction) self.defaults.submitFunction({ date: this.date });
            } else if(target.name === "selectButton"){
                if(customRange) self._rangeToString();
            }
            pickr.classList.toggle('open');
        }
    };
    
    this._init = function(){
        if(!pickr) return;
        var type, field,
        template = this.template();
        pickr.innerHTML = template;

        dropdown = pickr.querySelector('.dropdown-menu');
        options = [].slice.call(pickr.querySelectorAll('input[name="options"]'));
        button = pickr.querySelector('.dropdown-button');
        btnText = button.querySelector('.btn-text');
        rangeEl = pickr.querySelector('.custom-range');

        button.onclick = function(){
            pickr.classList.toggle('open');
        };
        dropdown.onclick = function(e){
            self._pickerHandler(e);
        };

        this._setCurrentRange(this.defaults.defaultOption);

        cfrom = document.getElementById('custom-range-from');
        cto = document.getElementById('custom-range-to');

        rome(cfrom, {
            time: false,
            inputFormat: 'DD/MM/YYYY',
            dateValidator: rome.val.beforeEq(cto)
        });
        rome(cto, {
            time: false,
            inputFormat: 'DD/MM/YYYY',
            dateValidator: rome.val.afterEq(cfrom)
        });
    };

    this._setCurrentRange = function(option){
        if(option === 'today'){
            this.date.start = today().toStartOf().valueOf();
            this.date.end = today().toEndOf().valueOf();
        } else if(option === 'yesterday'){
            this.date.end = today().toEndOf().minus(1).valueOf();
            this.date.start = today().toStartOf().minus(1).valueOf();
        } else if(option === 'week'){
            this.date.end = today().toEndOf().valueOf();
            this.date.start = today().toStartOf().minus(7).valueOf();
        } else if(option === '30_days'){
            this.date.end = today().toEndOf().valueOf();
            this.date.start = today().toStartOf().minus(30).valueOf();
        } else if(option === '60_days'){
            this.date.end = today().toEndOf().valueOf();
            this.date.start = today().toStartOf().minus(60).valueOf();
        }
        // else if(option === 'month'){
        //     var curr_date = new Date();
        //     var first_day = new Date(curr_date.getFullYear(), curr_date.getMonth(), 1);
        //     var last_day = new Date(curr_date.getFullYear(), curr_date.getMonth()+1, 0);
        //     var month_start_date = this.formatDate(first_day);
        //     var month_end_date = this.formatDate(last_day);
            
        //     this.date.start = month_start_date;
        //     this.date.end = month_end_date;
        // } 
        else if(option === 'custom'){
            this._setCustomRange();
        }
        this._setButtonText();
    };

    this._rangeToString = function(){
        var start = rome.find(cfrom).getDateString('MM/DD/YYYY');
        var end = rome.find(cto).getDateString('MM/DD/YYYY');
        this.date.start = today(start).toStartOf().valueOf();
        this.date.end = today(end).toEndOf().valueOf();

        this._setButtonText();
    };

    this.formatDate = function(date, format){
        var m = ("0"+ (date.getMonth()+1)).slice(-2); // in javascript month start from 0.
        var d = ("0"+ date.getDate()).slice(-2); // add leading zero 
        var y = date.getFullYear();
        var result = format == 'mm/dd/yyyy' ? (m+'/'+d+'/'+y) : (d +'/'+m+'/'+y);
        return  result;
    };

    this._setCustomRange = function(date){
        var start = today().toStartOf().dateOf();
        var end = today().toEndOf().dateOf();
        
        cfrom.value = this.formatDate(start);
        cto.value = this.formatDate(end);
    };

    this._setButtonText = function(){
        btnText.innerHTML = this.formatDate(new Date(this.date.start)) + ' - ' + this.formatDate(new Date(this.date.end));
    };

    this._closeDropdowns = function(){
        pickr.classList.toggle('open');
        removeEvent(document, 'click', this._closeDropdowns);
    };

    this.today = function(){
        return today().toStartOf().valueOf();
    };

    this.template = function(){
        return (
        '<button type="button" class="btn btn-'+this.defaults.buttonColor+' btn-'+this.defaults.buttonSize+' btn-block dropdown-button" aria-expanded="true">'+
            '<span class="btn-text" style="margin-right:5px"></span>'+
            '<span class="caret"></span>'+
        '</button>'+
        '<div class="dropdown-menu">'+
            '<div class="col-xs-12 btn-group btn-group-vertical" data-toggle="buttons">'+
                '<label class="btn btn-default active">'+
                    '<input type="radio" name="options" data-range="today"autocomplete="on" checked>'+frases.DATE_PICKER.TODAY+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="yesterday" autocomplete="off" checked>'+frases.DATE_PICKER.YESTERDAY+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="week" autocomplete="off">'+frases.DATE_PICKER.LAST_7_DAYS+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="30_days" autocomplete="off">'+frases.DATE_PICKER.LAST_30_DAYS+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="60_days" autocomplete="off">'+frases.DATE_PICKER.LAST_60_DAYS+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="custom" autocomplete="off">'+frases.DATE_PICKER.CUSTOM_RANGE+''+
                '</label>'+
            '</div>'+
            '<div class="col-xs-12 custom-range ghosted">'+
                '<br>'+
                '<div class="input-group">'+
                        '<input type="text" class="form-control" id="custom-range-from">'+
                        '<span class="input-group-addon"><i class="fa fa-calendar"></i></span>'+
                        '<input type="text" class="form-control" id="custom-range-to">'+
                '</div>'+
            '</div>'+
            (this.defaults.interval ? '<div class="col-xs-12 custom-interval">'+
                '<hr>'+
                    '<p>'+frases.DATE_PICKER.INTERVAL+'</p>'+
                '<div class="btn-group btn-group-justified" data-toggle="buttons">'+
                    '<label class="btn btn-default">'+
                        '<input type="radio" name="options" data-interval="1/4_hour" autocomplete="off">15'+frases.MIN+
                    '</label>'+
                    '<label class="btn btn-default">'+
                        '<input type="radio" name="options" data-interval="1/2_hour" autocomplete="off">30'+frases.MIN+
                    '</label>'+
                    '<label class="btn btn-default active">'+
                        '<input type="radio" name="options" data-interval="hour" autocomplete="off" checked>'+frases.HOUR+
                    '</label>'+
                    '<label class="btn btn-default">'+
                        '<input type="radio" name="options" data-interval="day" autocomplete="off">'+frases.DAY+
                    '</label>'+
                '</div>'+
            '</div>' : '')+
            '<div class="col-xs-12">'+
            '<hr>'+
            (this.defaults.actionButton ?
                '<button type="button" name="submitButton" class="btn btn-primary btn-md btn-block">'+frases.SEARCH+'</button>' :
                '<button type="button" name="selectButton" class="btn btn-primary btn-md btn-block">'+frases.SELECT+'</button>')+
            '</div>'+
        '</div>'
        );
    };

    this._init();

 }
function Player(){
    var player,
        seek,
        time,
        play,
        dur,
        link,
        oAudio,
        trackIndex = 1,
        shown = false,
        controls,
        pbControl,
        currentFile = "",
    //display and update progress bar

    init = function(){
        // console.log('init');
        var temp = template();
        player = document.createElement('div');
        player.id = 'rec-player';
        player.className = 'pl-cont';
        player.innerHTML = temp;
        document.querySelector('body').appendChild(player);

        seek = document.getElementById('pl-seek');
        time = document.getElementById('pl-time');
        play = document.getElementById('pl-play');
        dur = document.getElementById('pl-duration');
        link = document.getElementById('pl-download');
        oAudio = document.getElementById('audio-rec');
        controls = document.getElementById('pl-controls');
        pbControl = document.getElementById('pl-pb-control');

        initEvents();
    },
    //added events
    initEvents = function(){
        addEvent(player, 'click', function(e){
            clickHandler(e);
        });
        //set up event to toggle play button to pause when playing
        addEvent(oAudio, "playing", function() {
            play.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
            if(global.lastEl) global.lastEl.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
        }, true);

        addEvent(oAudio, 'loadedmetadata', function() {
            dur.textContent = formatTimeString(parseInt(oAudio.duration), 'hh:mm:ss');
        });

        // //set up event to toggle play button to play when paused
        addEvent(oAudio, "pause", function() {
            play.innerHTML = '<i class="fa fa-fw fa-play"></i>';
            if(global.lastEl) global.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
        }, true);
        //set up event to update the progress bar
        addEvent(oAudio, "timeupdate", progressBar, true);

        // when playback completes
        addEvent(oAudio, "ended", playTrack(trackIndex+1), true);

        //set up mouse click to control position of audio
        addEvent(seek, "click", function(e) {
            if (!e) e = window.event;
            oAudio.currentTime = (oAudio.duration * ((e.offsetX || e.layerX) / seek.clientWidth)).toFixed(2);
            // console.log('currentTime: '+oAudio.currentTime);
        }, true);
    },

    progressBar = function() {
        var percent = oAudio.currentTime === 0 ? 0 : Math.floor((100 / oAudio.duration) * oAudio.currentTime);
        time.textContent = formatTimeString(parseInt(oAudio.currentTime), 'hh:mm:ss');
        seek.value = percent;

        $(document).trigger('player:timeupdate', [{ time: oAudio.currentTime*1000, trackIndex: trackIndex }]);
    },

    playTrack = function(track) {
        if(!global.playlist.length || track <= 1 || track >= global.playlist.length) return;
        
        trackIndex = track;

        $(document).trigger('player:track', [{ track: trackIndex }]);

        oAudio.src = global.filePath + global.playlist[trackIndex-1].file;
        currentFile = global.playlist[trackIndex-1].file;
        link.href = oAudio.src;
        link.setAttribute('download', oAudio.src);
        oAudio.play();

        console.log('playTrack: ', trackIndex, global.playlist[trackIndex-1].file);
    },

    clickHandler = function(e){
        if(!e) e = window.event;
        var targ = e.target;
        if(targ.nodeName == 'I') targ = targ.parentNode;
        // console.log(targ);
        if(targ.id == 'pl-play') global.playAudio();
        if(targ.id == 'pl-stop') global.stopAudio();
        if(targ.id == 'pl-prev') global.prevAudio();
        if(targ.id == 'pl-next') global.nextAudio();
        if(targ.id == 'pl-close') close();
    },

    show = function(){
        player.classList.add('shown');
        shown = true;

        if(global.playlist.length) {
            controls.style.width = '475px';
            pbControl.classList.remove('hidden');
        }
    },

    close = function(){
        player.classList.remove('shown');
        global.stopAudio();
        shown = false;
    },

    template = function(){
        return (
            '<audio id="audio-rec" type="audio/x-wav; codecs=\'1\'"></audio>'+
            '<div class="pl-controls" id="pl-controls">'+
                '<a href="#" download="" class="pl-control bg-success pull-left" id="pl-download"><i class="fa fa-download"></i></a>'+
                '<button class="pl-control bg-primary pull-left" id="pl-play"><i class="fa fa-fw fa-play"></i></button>'+
                '<div id="pl-pb-control" class="hidden" style="display:inline;height: 100%;">'+
                    '<button class="pl-control bg-primary pull-left" id="pl-prev"><i class="fa fa-fw fa-backward"></i></button>'+
                    '<button class="pl-control bg-primary pull-left" id="pl-next"><i class="fa fa-fw fa-forward"></i></button>'+
                '</div>'+
                '<div class="pl-time"><span id="pl-time"></span>/<span id="pl-duration"></span></div>'+
                '<progress id="pl-seek" max="100" value="0" class-"pl-seek-bar"></progress>'+
                '<button class="pl-control bg-danger pull-right" id="pl-close"><i class="fa fa-fw fa-close"></i></button>'+
                '<button class="pl-control bg-primary pull-right" id="pl-stop"><i class="fa fa-fw fa-stop"></i></button>'+
            '</div>'
        );
    },

    global = {
        playlist: [],
        filePath: '',
        audioFile: '',
        audioURL: '',
        audio: oAudio,
        lastEl: null,
        playAudio: function() {
            if(shown === false)
                show();
            //Skip loading if current file hasn't changed.
            if (this.audioURL !== currentFile) {
                oAudio.src = this.filePath + this.audioURL;
                currentFile = this.audioURL;
                link.href = this.audioURL;
                link.setAttribute('download', this.audioFile);
            }
            console.log('playAudio: ', oAudio.src, currentFile);
            //Tests the paused attribute and set state. 
            if (oAudio.paused) {
                oAudio.play();
            } else {
                oAudio.pause();
            }
        },
        prevAudio: function() {
            this.stopAudio();
            playTrack(trackIndex-1);
        },
        nextAudio: function() {
            this.stopAudio();
            playTrack(trackIndex+1);
        },
        stopAudio: function() {
            oAudio.pause();
            oAudio.currentTime = 0;
        }
    };

    init();
    return global;
}
function load_rec_settings(){

	json_rpc_async('getVoiceRecordingList', '', function(result){
		getRecObjects(result);
	});

	$('#set-rec-settings').click(function(){
		setRecObjects();
	});
}

function getRecObjects(result){
	var count = 0;
	var cbNumber = 2;
	var obj = {};
	obj.result = result;

	function checkCount(){
		count += 1;
		if(count === cbNumber)
			fillSelects(obj);
	}

	json_rpc_async('getObjects', '\"kind\":\"trunk\"', function(trunks){
		if(result.trunks){
			obj.trunks = trunks.filter(function(trunk){
				return result.trunks.indexOf(trunk.name) == -1;
			});
		} else
			obj.trunks = trunks;

		checkCount();
	});
	json_rpc_async('getExtensions', null, function(exts){
		var extresult = filterObject(exts, ['phone', 'user']);
		console.log('getRecObjects: ', extresult);
		if(result.extensions) {
			obj.exts = extresult.filter(function(item){
				return result.extensions.indexOf(item.ext) === -1;
			});

		} else {
			obj.exts = extresult;

		}

		checkCount();
	});
}

function fillSelects(obj){

	// $('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').prop('checked', true);
	// $('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').parent().button('toggle');
	document.querySelector('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').checked = true;
	document.querySelector('#ext-rec-mode input[value="'+obj.result.extmode+'"]').checked = true;
	// $('#ext-rec-mode input[value="'+obj.result.extmode+'"]').parent().button('toggle');

	if(obj.result.trunks)
		fill_list_items('rec-trunks', obj.result.trunks);
	if(obj.result.extensions)
		fill_list_items('rec-ext', obj.result.extensions);

	fill_list_items('av-trunks', obj.trunks, 'name');
	fill_list_items('av-ext', obj.exts, 'ext');

	close_options();
	set_page();
	show_content();

}

function setRecObjects(){
	var jprms = '';

	// var trunksmode = document.querySelector('#trunks-rec-mode label.active input');
	var trunksmode = document.querySelector('#trunks-rec-mode input:checked');
	var extmode = document.querySelector('#ext-rec-mode input:checked');
	// var extmode = document.querySelector('#ext-rec-mode label.active input');
	var recTrunks = document.getElementById('rec-trunks');
	var recExt = document.getElementById('rec-ext');

	jprms += '"trunks":[';
	for(var i=0; i<recTrunks.children.length; i++){
	    jprms += '"'+recTrunks.children[i].innerHTML+'",';
	}
	jprms += '],';

	jprms += '"extensions":[';
	for(var i=0; i<recExt.children.length; i++){
	    jprms += '"'+recExt.children[i].innerHTML+'",';
	}
	jprms += '],';

	jprms += '"trunksmode":'+trunksmode.value+',';
	jprms += '"extmode":'+extmode.value+',';

	// console.log(jprms);

	json_rpc_async('setVoiceRecordingList', jprms, function(){
		set_object_success();
	});
}

function load_records(){
    //     start = new Date(picker.date.start).getTime(),
    //     end = new Date(picker.date.end).getTime(),
    //     interval = picker.interval,
    //     params = '\"begin\":'+start+', \"end\":'+end;

    // json_rpc_async('getCallStatisticsGraph', params, function(result){
    //     self.createGraph(result);
    // });

    PbxObject.Pagination = new Pagination();
    PbxObject.recPicker = new Picker('recs-date-picker', {submitFunction: getRecParams, actionButton: false, buttonSize: 'md'});

    var methods = {
        playRecord: playRecord,
        getQos: getQos,
        toggleRecQoS: toggleRecQoS
    };

    var elmode = [].slice.call(document.querySelectorAll('.init-mode'));
    elmode.forEach(function(item){
        if(item.value === "0") item.checked = true;
    });

    function handleTableClick(e) {
        e.preventDefault();

        var target = e.target.nodeName === 'I' ? e.target.parentNode : e.target;
        var method = target.getAttribute('data-method');
        var param = target.getAttribute('data-param');

        if(methods[method])
            methods[method](param, target);
        
    }

    json_rpc_async('getObjects', '\"kind\":\"trunk\"', function(result){
        // var trunks = document.getElementById('searchtrunk');
        // var opt = document.createElement('option');
        // opt.value = PbxObject.frases.ALL;
        // opt.textContent = PbxObject.frases.ALL;
        // trunks.appendChild(opt);
        result.unshift({oid:PbxObject.frases.ALL, name: PbxObject.frases.ALL});
        fill_select_items('searchtrunk', result);
    });
    $('#getcalls-btn').click(function(e){
        getRecParams(e);
    });
    $('#sample-data').hide();
    $('#search-calls .panel-body').slideToggle();
    $('#extendedsearch').click(function(e){
        e.preventDefault();
        var $panel = $(this).closest('.panel'),
            $el = $panel.find('.panel-body');

        if(($el).is(':visible')){
            $(this).text(PbxObject.frases.MORE);
        }
        else{
            $(this).text(PbxObject.frases.LESS);
        }

        $el.slideToggle();
    });

    $('#records-table').click(handleTableClick);

    TableSortable.sortables_init();

    getRecords({
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end
    }, showRecords);

    show_content();

}

function build_records_row(data, table){

    if(!data) return;
    var cell,
        textContent = '',
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        time = data['td'],
        h, m, s;

    if(data['id'])
        row.id = data['id'];

    cell = row.insertCell(0);
    // date = day + '/' + month + '/' + date.getFullYear() + ' ' + hours + ':' + minutes;
    cell.textContent = formatDateString(data.ts);

    cell = row.insertCell(1);
    cell.className = 'nowrap';
    cell.textContent = data['na'];

    cell = row.insertCell(2);
    // cell.className = 'nowrap';
    textContent = (data['nc'] && data['nc'] !== data['nb'] ) ? (data['nb'] + ' (' + data['nc'] + ')') : data['nb'];
    cell.textContent = textContent
    cell.title = textContent;

    // cell = row.insertCell(3);
    // cell.textContent = data['nc'] || "";
    // cell.className = 'nowrap';
    // cell.title = data['nc'] || '';

    cell = row.insertCell(3);
    if(data['ta']) {
        textContent = (data['tb'] ) ? data['ta'] + ' (' + data['tb'] + ')' : data['ta'];
    } else {
        textContent = data['tb'];
    }
    cell.textContent = textContent;

    // cell = row.insertCell(4);
    // if(data['tb']) cell.textContent = data['tb'];

    cell = row.insertCell(4);
    cell.textContent = formatTimeString(time, 'hh:mm:ss');

    cell = row.insertCell(5);
    cell.textContent = getFriendlyCodeName(data['cs']);

    cell = row.insertCell(6);
    cell.textContent = parseFloat(data['tr']).toFixed(2);

    cell = row.insertCell(7);
    cell.textContent = parseFloat(data['ch']).toFixed(2);

    cell = row.insertCell(8);
    if(data['fi']){
        var a = document.createElement('a');
        a.href = '#';
        // a.setAttribute('data-src', data['fi']);
        a.setAttribute('data-method', 'playRecord');
        a.setAttribute('data-param', data['fi']);
        a.innerHTML = '<i class="fa fa-play fa-fw"></i>';
        // a.onclick = function(e){
        //     playRecord(e);
        // };
        cell.appendChild(a);
    }
    cell = row.insertCell(9);
    cell.innerHTML = data['fi'] ? '<a href="'+window.location.protocol+'//'+window.location.host+'/records/'+data['fi']+'" download="'+data['fi']+'"><i class="fa fa-fw fa-download"></i></a>' : '';
    // cell.innerHTML = data['fi'] ? '<a href="#" onclick="playRecord(e)" data-src="'+data['fi']+'"><i class="fa fa-play fa-fw"></i></a>' : '';

    cell = row.insertCell(10);
    cell.innerHTML = '<a href="#" data-method="getQos" data-param="'+ data.id +'"><i class="fa fa-fw fa-info"></i></a>';
}

function getRecParams(e){

    show_loading_panel(e.target);
    
    // var from = PbxObject.Picker.date.from,
    //     to = PbxObject.Picker.date.to,
    //     dbegin = new Date(from.year, from.month - 1, from.day, from.hours, from.minutes),
    //     dend = new Date(to.year, to.month - 1, to.day, to.hours, to.minutes),
    // var date = PbxObject.Picker.getDate(),
    var elorder = document.querySelectorAll('.init-order'),
        elmode = document.querySelectorAll('.init-mode'),
        number = document.getElementById('searchnum'),
        trunk = document.getElementById('searchtrunk'),
        order, mode, i;

    for(i=0; i<elorder.length; i++){
        if(elorder[i].checked)
            order = elorder[i].value;
    }
    for(i=0; i<elmode.length; i++){
        if(elmode[i].checked)
            mode = elmode[i].value;
    }
    
    // if(date.begin > date.end){
    //     alert(PbxObject.frases.PICKERROR2);
    //     return;
    // }
    
    // var params = '';
    // params += '"begin": ' + PbxObject.recPicker.date.start;
    // params += ', "end": ' + PbxObject.recPicker.date.end;
    // if(number.value)
    //     params += ', "number": "' + number.value + '"';
    // if(trunk.value !== PbxObject.frases.ALL)
    //     params += ', "trunk": "' + trunk.options[trunk.selectedIndex].textContent + '"';    
    // if(mode)
    //     params += ', "mode": ' + mode;
    // if(order)
    //     params += ', "order": ' + order;

    var params = {
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end
    };

    if(number.value) params.number = number.value;
    if(trunk.value !== PbxObject.frases.ALL) 
        params.trunk = trunk.options[trunk.selectedIndex].textContent;
    if(mode) params.mode = parseInt(mode, 10);
    if(order) params.order = parseInt(order, 10);

    getRecords(params, showRecords);

}

function getRecords(params, cb) {
    json_rpc_async('getCalls', params, cb);
}

function showRecords(result){
    // console.log(result);
    show_content();

    var table = document.getElementById('records-table').querySelector('tbody');
    var rows = document.getElementById('searchrows');
    if(!rows.value && result.length > 20) rows.value = 20; //if result is bigger than 20 records then "max rows" is set to 20
    var rlength = rows.value ? parseInt(rows.value) : result.length, //the amount of rows on page is set based of the "max rows" parameter or is equal result.length
        pagnum = result.length > rlength ? Math.ceil(result.length / rlength) : 1; //if the number rows is less "than max rows" then the number of pages is equal 1

    var key, cost = 0;
    for (var i = 0; i < result.length; i++) {
        for(key in result[i]){
            if(key == 'ch'){
                cost += parseFloat(result[i][key]);
            }
        }
    }
    cost = cost.toFixed(2);

    $('#sample-data').show();
    $('#sample-length').text(result.length);
    $('#sample-cost').text(cost);

    PbxObject.Pagination.options = {
        table: table,
        page: 1,
        maxpagins: 5,
        rows: rlength,
        records: result,
        pagnum: pagnum,
        buildTableFunction: build_records_row
    };
    PbxObject.Pagination.createPagination();
    PbxObject.Pagination.selectPage(1);
}

function getQos(recid, targ) {
    console.log('getQos: ', recid, targ);
    if(!recid) return;
    // var targInitHtml = targ.innerHTML;
    var targInitHtml = targ.innerHTML;
    var targMethod = targ.getAttribute('data-method');

    targ.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    targ.setAttribute('data-method', '');

    getRecords({
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end,
        qos: true,
        id: recid
    }, function(result) {
        console.log('getQos result: ', result);
        targ.innerHTML = targInitHtml;
        targ.setAttribute('data-method', 'toggleRecQoS');
        showRecQoS(recid, result);
    });
}

function toggleRecQoS(recid) {
    console.log('toggleRecQoS: ', recid);
    $('#'+recid+'-qos').collapse('toggle');
}

function showRecQoS(recid, data) {

    var row = document.createElement('tr');
    var cell = document.createElement('td');
    var contEl = document.createElement('div');

    contEl.id = recid + '-qos';
    contEl.className = "collapse";
    cell.colSpan = '11';
    cell.style.padding = '0';
    cell.style.borderTop = 'none';
    cell.appendChild(contEl);
    row.appendChild(cell);

    $(row).insertAfter('#'+recid);


    ReactDOM.render(
        RecQosTable({
            frases: PbxObject.frases,
            data: data[0],
            utils: {
                formatTimeString: formatTimeString
            }
        }),
        contEl
    );

    $(contEl).collapse();
}

function playRecord(src, targ){
    // if(!e) e = window.event;
    // e.preventDefault();
    // var player
        // targ = e.currentTarget,
        // src = targ.getAttribute('data-src');

    PbxObject.Player = PbxObject.Player || new Player();
    var player = PbxObject.Player;
    if(player.lastEl !== null && player.lastEl != targ){
        player.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
    }
    player.lastEl = targ;
    player.audioFile = src;
    player.audioURL = window.location.protocol+'//'+window.location.host+'/records/'+src;
    player.playAudio();
}
function load_reports(){
    new Reports();
}

function chartOptions(timeFormat) {
    // var timeFormat = (function(intr){
    //     return (intr == 'hour' ? "%H:%M" : (intr == 'day') ? "%d %b" : (intr == '1/2_hour') ? "%H:%M" : "%H:%M");
    // })(picker.intervalString);

    return {
        xaxis: {
            // min: new Date(picker.date.start).getTime(),
            // max: new Date(picker.date.end).getTime(),
            mode: "time",
            timeformat: timeFormat,
            timezone: 'browser',
            tickSize: 0,
            // tickSize: tickSize,
            // monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            monthNames: PbxObject.frases.MONTHS_SHORT,
            tickLength: 0, // hide gridlines
            // axisLabel: "hours",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
            axisLabelPadding: 15,
            color: "#555"
        },
        yaxes: {
            position: 0,
            tickFormatter: function (val) {
                return val.toFixed(1);
            },
            min: 0,
            axisLabel: PbxObject.frases.KINDS.calls,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
            axisLabelPadding: 5,
            color: "#555"
        },
        grid: {
            hoverable: true,
            borderWidth: {
                top: 0,
                right: 0,
                bottom: 1,
                left: 1
            }
            // color: '#ccc'
        },
        legend: {
            labelBoxBorderColor: "none",
            noColumns: 5,
            position: "ne",
            margin: 0,
            labelFormatter: function(label, series) {
                console.log(series);
                return '<span class="chart-label">'+label+'</span>';
            }
        },
        tooltip: true,
        tooltipOpts: {
            content: '%x <br> %s: %y.2',
            yDateFormat: timeFormat
        }
    };
}

function Reports(){
    var loaded = false,
        inc = document.querySelectorAll('.calls-incoming'),
        out = document.querySelectorAll('.calls-outgoing'),
        conn = document.querySelectorAll('.calls-connected'),
        load = document.querySelectorAll('.calls-load'),
        self = this,
        row, cell, a, picker, chartData, chartOpts;

    this.init = function(){
        var start, end, interval, params;
        picker = new Picker('calls-date-picker', {submitFunction: self.getStatistics, interval: true, buttonSize: 'md'});
        start = picker.date.start;
        end = picker.date.end;
        interval = picker.interval;
        params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
            show_content();
        });
    };

    this.getStatistics = function(){
        $('#reports-cont').addClass('faded');
        var start = picker.date.start,
            end = picker.date.end,
            interval = picker.interval,
            params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;
            
        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
            $('#reports-cont').removeClass('faded');
        });
    };

    this.createGraph = function(data){
        // console.log(data);
        if(!data.length){
            $("#outCalls-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#inAndLost-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#intCalls-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#linesLoad-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            
            return;
            // var graph = document.getElementById('calls-graph');
            // graph.innerHTML = '<h2 class="back-msg">'+PbxObject.frases.STATISTICS.NO_DATA+'</h2>';
        }

        var insData = [], outsData = [], intsData = [], lostData = [], linesData = [], time, item;
        var tickSize = (picker.intervalString == '1/2_hour' || picker.intervalString == '1/4_hour') ? [] : [1, picker.intervalString];

        var timeFormat = (function(intr){
            return (intr == 'hour' ? "%H:%M" : (intr == 'day') ? "%d %b" : (intr == '1/2_hour') ? "%H:%M" : "%H:%M");
        })(picker.intervalString);

        for(var i=0, length = data.length; i<length; i++){
            item = data[i];
            time = item.t;
            insData.push([time, item.i]);
            outsData.push([time, item.o]);
            intsData.push([time, item.l]);
            lostData.push([time, item.m]);
            linesData.push([time, item.p]);
        }
        var barsOpts = {
            show: true,
            barWidth: picker.interval,
            lineWidth: 0,
            // order: 1,
            fill: 0.7
            // fillColor: false
        };
        insAndLostData = [{
            label: PbxObject.frases.STATISTICS.CONNECTEDCALLS,
            stack: 0,
            bars: barsOpts,
            data: insData,
            color: "#3c763d"
        }, {
            label: PbxObject.frases.STATISTICS.LOSTCALLS,
            stack: 0,
            bars: barsOpts,
            data: lostData,
            color: "#AA4643"
        }];
        outsData = [{
            label: PbxObject.frases.SETTINGS.OUTCALLS,
            bars: barsOpts,
            data: outsData,
            color: "#4572A7"
        }];
        intsData = [{
            label: PbxObject.frases.SETTINGS.INTCALLS,
            bars: barsOpts,
            data: intsData,
            color: "#BADABA"
        }];
        linesData = [{
            label: PbxObject.frases.STATISTICS.LINES_PAYLOAD,
            data: linesData,
            lines: {
                show: true,
                fill: false
            },
            points: {
                show: true
            },
            color: "#3c763d"
        }];
        chartOpts = {
            // series: {
            //     stack: 0,
            //     bars: {
            //         show: true,
            //         barWidth: picker.interval/4,
            //         lineWidth: 0,
            //         order: 1,
            //         fillColor: {
            //             colors: [{
            //                 opacity: 1
            //             }, {
            //                 opacity: 0.7
            //             }]
            //         }
            //     }
            // },
            xaxis: {
                // min: new Date(picker.date.start).getTime(),
                // max: new Date(picker.date.end).getTime(),
                mode: "time",
                timeformat: timeFormat,
                timezone: 'browser',
                tickSize: 0,
                // tickSize: tickSize,
                // monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                monthNames: PbxObject.frases.MONTHS_SHORT,
                tickLength: 0, // hide gridlines
                // axisLabel: "hours",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 15,
                color: "#555"
            },
            yaxes: {
                position: 0,
                tickFormatter: function (val) {
                    return val.toFixed(1);
                },
                min: 0,
                axisLabel: PbxObject.frases.KINDS.calls,
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5,
                color: "#555"
            },
            grid: {
                hoverable: true,
                borderWidth: {
                    top: 0,
                    right: 0,
                    bottom: 1,
                    left: 1
                }
                // color: '#ccc'
            },
            legend: {
                labelBoxBorderColor: "none",
                noColumns: 5,
                position: "ne",
                margin: 0
                // container: $('#calls-graph-labels')
            },
            tooltip: true,
            tooltipOpts: {
                content: '%x <br> %s: %y.2',
                yDateFormat: timeFormat
            }
            // colors: ["#3c763d", "#BADABA", "#4572A7", "#AA4643", "#555"]
        };

        var outCallsOpts = new chartOptions(timeFormat);
        outCallsOpts.legend.container = $('#outCalls-graph-lg');
        var inAndLostCallsOpts = new chartOptions(timeFormat);
        inAndLostCallsOpts.legend.container = $('#inAndLost-graph-lg');
        var intCallsOpts = new chartOptions(timeFormat);
        intCallsOpts.legend.container = $('#intCalls-graph-lg');
        var linesLoadOpts = new chartOptions(timeFormat);
        linesLoadOpts.legend.container = $('#linesLoad-graph-lg');

        $.plot($("#outCalls-graph"), outsData, outCallsOpts);
        $.plot($("#inAndLost-graph"), insAndLostData, inAndLostCallsOpts);
        $.plot($("#intCalls-graph"), intsData, intCallsOpts);
        $.plot($("#linesLoad-graph"), linesData, linesLoadOpts);
        // addEvent(window, 'resize', self.resizeChart);
    };

    this.init();
}
function load_routes(result){
    // console.log(result);
    
    PbxObject.oid = result.oid;
    // PbxObject.kind = 'routes';
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

    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');

    if(result.name) {
        name.value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

    var i, table = document.getElementById('rtable'),
        ul = document.getElementById('priorities'),
        priorities = result.priorities;
    for(i=0; i<priorities.length; i++){
        var li = document.createElement('li');
        li.setAttribute('data-routepriority', priorities[i]);
        li.innerHTML = PbxObject.routepriorities[priorities[i]];
        ul.appendChild(li);
    }

    var transforms = result.anumbertransforms;
    if(transforms.length) {
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    } else { 
        append_transform(null, 'transforms1');
    }

    transforms = result.bnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms2', transforms[i]);
        }
    } else{
        append_transform(null, 'transforms2');
    }
    
    if(result.routes != undefined){
        build_routes_table(result.routes);
    } else{
        show_content();
    }
    
    TableSortable.sortables_init();
    set_page();
}

function set_routes(){
        
    var name = document.getElementById('objname').value;
    if(name)
        var jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    } else {
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }
    
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    jprms += '\"kind\":\"routes\",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
 
    jprms += '\"priorities\":[';
    var ul = document.getElementById('priorities');
    var i, j;
    for(i=0; i<ul.children.length; i++){
        jprms += ul.children[i].getAttribute('data-routepriority')+',';
    }
    
    jprms += '],';
    jprms += '\"anumbertransforms\":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '\"bnumbertransforms\":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    
    jprms += '\"routes\":[';
    var str, row, table = document.getElementById('rtable'); 
    for(i=1; i<table.rows.length; i++){
        row = table.rows[i];
        // if(row.className == 'route-on-edit') continue;
        if(!row.cells[0].textContent) continue;
        str = '';
        str += '"number":"'+row.cells[0].textContent+'",';
        str += '"description":"'+row.cells[1].textContent+'",';
        str += '"target":{"oid":"'+row.cells[2].getAttribute('data-gid')+'"},';
        str += '"priority":'+parseInt(row.cells[3].getAttribute('data-priority'))+',';
        str += '"cost":'+parseFloat(row.cells[4].textContent)+',';
        if(str != '') jprms += '{'+str+'},';
    }
    jprms += ']';
    // console.log(jprms);
    json_rpc_async('setObject', jprms, handler);
}

function getRouteObjects(callback) {
    getObjects(['equipment','users','cli','timer','routes','pickup', 'chattrunk' ,'chatchannel'], function(result) {
        callback(result);
    }, true);
}

function build_routes_table(routes){
    var result, fragment,
    tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];

    getRouteObjects(function(result) {
        if(!routes.length && result.length) tbody.appendChild(build_route_row(null, result));
        else {
            sortByKey(routes, 'number');
            fragment = document.createDocumentFragment();
            for(var i=0; i<routes.length; i++){
                fragment.appendChild(add_route_row(routes[i], result));
            }
            tbody.appendChild(fragment);
        }    
        show_content();
    });
}

function editRow(row, route) {
    getRouteObjects(function(result) {
        var newroute = build_route_row(route, result);
        row.parentNode.insertBefore(newroute, row);
        row.style.display = 'none';
    });
}

function add_new_route(e){
    var e = e || window.event;
    if(e) e.preventDefault();

    getRouteObjects(function(result) {
        var tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];
        tbody.insertBefore(build_route_row(null, result), tbody.children[0]);
    });

}

function add_route_row(route, objects){
    var row, cell;
    row = document.createElement('tr');
    cell = row.insertCell(0);
    cell.textContent = route.number;

    cell = row.insertCell(1);
    cell.textContent = route.description;
    cell.className = 'nowrap';
    cell.title = route.description || '';

    cell = row.insertCell(2);
    var obj = {};
    for(i=0; i<objects.length; i++){
        if(objects[i].oid == route.target.oid){
            obj = objects[i];
            cell.setAttribute('data-gid', route.target.oid);
            cell.setAttribute('data-gname', obj.name);
            cell.innerHTML = '<a href="#'+obj.kind+'/'+obj.oid+'">'+obj.name+'</a>';
        }
    }

    cell = row.insertCell(3);
    cell.setAttribute('data-priority', route.priority);
    cell.textContent = route.priority == 0 ? 'OFF' : route.priority == 10 ? 'EXV' : route.priority;

    cell = row.insertCell(4);
    cell.textContent = parseFloat(route.cost).toFixed(2);

    cell = row.insertCell(5);
    button = document.createElement('button');
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML = '<i class="fa fa-edit"></i>';
    addEvent(button, 'click', function(){
        editRow(row, route);
        // var newroute = build_route_row(route, objects);
        // row.parentNode.insertBefore(newroute, row);
        // row.style.display = 'none';
    });
    cell.appendChild(button);

    cell = row.insertCell(6);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', function(e){
        var c = confirm(PbxObject.frases.DELETE+' '+PbxObject.frases.ROUTE.toLowerCase()+'?');
        if(c) {
            deleteRoute(route.oid);
            remove_row(e);
            // set_routes();
        } else {
            return false;
        }
    });
    cell.appendChild(button);

    return row;
}

function build_route_row(route, objects){
    var rowData = {},
        tr = document.createElement('tr'),
        td = document.createElement('td'),
        div = document.createElement('div'),
        number = document.createElement('input'),
        optgroups = {}, optgroup, option, kind, oid;

    tr.className = "route-on-edit";
    div.className = 'form-group';
    number.className = 'form-control';
    number.setAttribute('type', 'text');
    number.setAttribute('name', 'number');
    number.setAttribute('size', '12');

    rowData.groupid = PbxObject.oid;

    if(route != null) {
        number.value = route.number;
        rowData.oid = route.oid;
    }
    rowData.number = number.value.trim();
    number.onchange = function(){ rowData.number = number.value.trim() };
    div.appendChild(number);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    descr = document.createElement('input');
    descr.className = 'form-control';
    descr.setAttribute('type', 'text');
    descr.setAttribute('name', 'description');
    if(route != null) {
        descr.value = route.description;
    }
    rowData.description = descr.value;
    descr.onchange = function(){ rowData.description = descr.value };
    div.appendChild(descr);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    target = document.createElement('select');
    target.className = 'form-control';
    target.setAttribute('name', 'target');
    for(var i=0; i<objects.length; i++){
        kind = objects[i].kind;
        if(optgroups[kind]){
            optgroup = optgroups[kind];
        } else {
            optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
            optgroups[kind] = optgroup;
            target.appendChild(optgroup)
        }
        // if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'routes' || kind == 'users' || kind == 'pickup') {
        //     continue;
        // }
        oid = objects[i].oid;
        option = document.createElement('option');
        option.setAttribute('value', oid);
        option.innerHTML = objects[i].name;
        if(route != null && oid == route.target.oid){
            option.setAttribute('selected', '');
        }
        optgroup.appendChild(option);
        // target.appendChild(option);
    }
    if(objects.length){
        rowData.target = {oid: target.options[target.selectedIndex].value, name: target.options[target.selectedIndex].textContent};
        target.onchange = function(){ rowData.target = {oid: target.options[target.selectedIndex].value, name: target.options[target.selectedIndex].textContent} };
    }
    div.appendChild(target);
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    priority = document.createElement('select');
    priority.className = 'form-control';
    priority.setAttribute('name', 'priority');
    for(var i=0; i<=10; i++){
        var option = document.createElement('option');
        option.value = i;
        if(route != null && i == route.priority){
            option.setAttribute('selected', '');
        }
        if(i == 0) {
            option.innerHTML = 'OFF';
        }
        else if(i == 10) {
            option.innerHTML = 'EXV';
        }
        else option.innerHTML = i;
        priority.appendChild(option);        
    }
    if(!route) priority.selectedIndex = 1;
    div.appendChild(priority);
    rowData.priority = priority.options[priority.selectedIndex].value;
    priority.onchange = function(){ rowData.priority = priority.options[priority.selectedIndex].value };
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cost = document.createElement('input');
    cost.className = 'form-control';
    cost.setAttribute('type', 'text');
    cost.setAttribute('name', 'cost');
    cost.setAttribute('size', '2');
    if(route != null && route.cost) {
        cost.setAttribute('value', parseFloat(route.cost).toFixed(2));
    } else {
        cost.value = parseFloat(0).toFixed(2);
    }
    rowData.cost = parseFloat(cost.value).toFixed(2);
    cost.onchange = function(){ rowData.cost = parseFloat(cost.value).toFixed(2) };
    div.appendChild(cost);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-chevron-left"></i>';
    addEvent(button, 'click', function(){
        var row = tr.nextSibling;
        if(row && row.nodeName == 'TR' && row.style.display == 'none') {
            row.style.display = 'table-row';
        }
        tr.parentNode.removeChild(tr);
    });
    td.appendChild(button);
    tr.appendChild(td);

    td = document.createElement('td');
    button = document.createElement('button');
    button.className = 'btn btn-success btn-sm';
    button.innerHTML = '<i class="fa fa-check"></i>';
    addEvent(button, 'click', function(){
        var name = document.getElementById('objname').value;
        if(!name) {
            alert(PbxObject.frases.MISSEDNAMEFIELD);
            return;
        }
        if(!rowData.number) {
            alert(PbxObject.frases.MISSED_ROUTE_NUMBER);
            return;
        }
        
        if(isNaN(rowData.cost)) rowData.cost = 0.00;

        var row = tr.nextSibling;
        var newrow = add_route_row(rowData, objects);

        tr.parentNode.insertBefore(newrow, tr);
        if(row && row.nodeName == 'TR' && row.style.display == 'none') {
            row.parentNode.removeChild(row);
        }
        tr.parentNode.removeChild(tr);
        setRoute(rowData, set_object_success);
    });
    td.appendChild(button);
    tr.appendChild(td);
        
    return tr;
}

function setRoute(data, callback){
    var jprms = '',
        params = data,
        cb = callback || null;

    if(data.oid) params.oid = data.oid;
    if(data.priority) params.priority = parseFloat(data.priority);
    if(data.cost) params.cost = parseFloat(data.cost);

    // if(data.oid) jprms += '\"oid\":\"'+data.oid+'\",';
    // jprms += '\"groupid\":\"'+PbxObject.oid+'\",';
    // jprms += '"number":"'+data.number+'",';
    // jprms += '"description":"'+data.description+'",';
    // jprms += '"target":{"oid":"'+data.target.oid+'", "name":"'+data.target.name+'"},';
    // jprms += '"priority":'+data.priority+',';
    // jprms += '"cost":'+data.cost+',';
    
    console.log('setRoute: ', params);
    json_rpc_async('setRoute', params, cb);
}

function deleteRoute(routeOid){
    var jprms = '\"oid\":\"'+routeOid+'\"';
    // console.log(jprms);
    json_rpc_async('deleteRoute', jprms, set_object_success);
}
function load_services() {

	var services = [];
	var ldap = {};

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			ldap.props = result.ldap || {};
			ldap.name = 'Microsoft Active Directory';
			ldap.id = 'MicrosoftAD';

			services = result.services;

	    	render();
	    	close_options();
		});

	}

	function saveOptions(serviceOptions) {
		console.log('saveOptions: ', serviceOptions);
		var params = {
			method: "setSubscription",
			params: serviceOptions
			// services: Array.isArray(serviceOptions) ? serviceOptions : [serviceOptions]
		};

		var url = '/services/'+serviceOptions.id+'/Subscription';
		url += "?state="+(serviceOptions.state ? 1 : 0);
		url += Object.keys(serviceOptions.props).reduce(function(str, key) {
			str += "&"+key+"="+serviceOptions.props[key];
			return str;
		}, "");

		console.log('saveOptions: ', serviceOptions, url);

		request('GET', url, null, null, function(err, response) {
			if(err) return notify_about('error', err);
			// if(response.result.status === 503) return notify_about('error', response.result.description);
			if(!response.result) return;

			if(response.result.location) {
				window.location = response.result.location;
			} else if(response.result.status === 200) {
				set_object_success();
				services = services.map(function(item) {
					if(item.id === serviceOptions.id) 
						item = serviceOptions;

					return item;
				});

				console.log('saveOptions saved: ', err, response, services);

				render();
			}

		});

		// json_rpc_async('setPbxOptions', params, function() {
		// 	services = services.map(function(item) {
		// 		if(item.id === serviceOptions.id) 
		// 			item = serviceOptions;

		// 		return item;
		// 	});

		// 	console.log('saveOptions saved: ', services);

		// 	render();
		// 	set_object_success();
		// });
	}

	function saveLdapOptions(newOptions) {
		json_rpc_async('setPbxOptions', { ldap: newOptions.props }, function() {
			ldap = newOptions;

			console.log('saveLdapOptions saved: ', newOptions);

			render();
			set_object_success();
		});
	}

	function render() {
		var componentParams = {
			frases: PbxObject.frases,
		    saveOptions: saveOptions,
		    saveLdapOptions: saveLdapOptions,
		    services: services,
		    ldap: ldap
		};

		ReactDOM.render(ServicesComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_statistics(){
    new Statistics();
}

function Statistics(){

    var picker,
        trtable = document.getElementById('trunks-statistics-table'),
        exttable = document.getElementById('ext-statistics-table'),
        extStatBtn = document.getElementById('ext-stats-btn'),
        btnGroup = document.getElementById('ext-stat-kind'),
        lostStatBtn = document.getElementById('lost-stats-btn'),
        trunksQosBtn = document.getElementById('trunks-qos-btn'),
        cont = document.getElementById('dcontainer'),
        inc = [].slice.call(cont.querySelectorAll('.data-model')),
        extStatKind = 'inbound',
        oid = PbxObject.oid,
        start, end, params,
        renewStat = true,
        renewLost = true,
        trunksQosOpened = false;
        self = this;

    function renderTrunksQosStat(data) {
        if(!data) return;
        ReactDOM.render(
            TrunksQosTable({
                frases: PbxObject.frases,
                data: data,
                utils: {
                    formatTimeString: formatTimeString
                }
            }),
            document.getElementById('trunks-qos-cont')
        );
    }

    function openTrunksQosStat() {
        if(trunksQosOpened) return false;
        trunksQosOpened = true;

        $('#trunks-qos-cont').addClass('faded');
        getTrunksQosData({ begin: picker.date.start,  end: picker.date.end }, function(data) {
            console.log('openTrunksQosStat data: ', data);
            renderTrunksQosStat(data);
            $('#trunks-qos-cont').removeClass('faded');
        });
    }

    function getTrunksQosData(params, callback){
        json_rpc_async('getTrunksStatistics', {
            begin: params.begin, 
            end: params.end
        }, callback);   
    }

    this._init = function(){
        picker = new Picker('statistics-date-picker', {submitFunction: self.getStatisticsData, interval: true, buttonSize: 'md'});
        start = picker.date.start;
        end = picker.date.end;
        interval = picker.interval;
        // params = '\"begin\":'+start+', \"end\":'+end;

            
        json_rpc_async('getCallStatistics', { begin: start, end: end }, self._setStatistics);
        json_rpc_async('getCallStatisticsGraph', { begin: start, end: end, interval: interval }, self._setCharts);

        extStatBtn.onclick = function(){
            if(extStatBtn.getAttribute('data-state') !== 'shown'){
                extStatBtn.setAttribute('data-state', 'shown');
                self._getExtStatisticsData();
            } else {
                extStatBtn.setAttribute('data-state', 'hidden');
            }
        };
        btnGroup.onclick = function(e){
            var e = e || window.event;
            var target = e.target;
            if(target.nodeName === 'LABEL'){
                extStatKind = target.children[0].getAttribute('data-kind');
                renewStat = true;
                self._getExtStatisticsData();
            }
        };
        lostStatBtn.onclick = function(){
            if(lostStatBtn.getAttribute('data-state') !== 'shown'){
                lostStatBtn.setAttribute('data-state', 'shown');
                self._getLostStatisticsData();
            } else {
                lostStatBtn.setAttribute('data-state', 'hidden');
            }
        };

        trunksQosBtn.onclick = openTrunksQosStat;

        switch_presentation(oid);
        set_page();
    };

    this.getColumns = function(data, colname, match, params) {
        // var columns = [];
        // var col = [];
        var col = [colname];
        var value = null;
        var convert = params ? params.convert : null;

        data.map(function(item) {
            for(var key in item) {
                if(key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
                    value = item[key];
                    
                    if(convert === 'minutes') {
                        value = parseFloat(((value / 1000) / 60).toFixed(2));
                    }

                    col.push(value);
                }
            }

            // columns.push(col);
        }.bind(this));

        return col;
        // return columns;
    };

    this.getStatisticsData = function(){
        var params = { begin: picker.date.start,  end: picker.date.end };

        $('#statistics-cont').addClass('faded');

        json_rpc_async('getCallStatistics', params, function(result){
            self._setStatistics(result);
            $('#statistics-cont').removeClass('faded');
        });

        json_rpc_async(
            'getCallStatisticsGraph', 
            { 
                begin: picker.date.start, 
                end: picker.date.end, 
                interval: picker.interval 
            }, 
            self._setCharts
        );

        getTrunksQosData(params, renderTrunksQosStat);

        renewStat = true;
        renewLost = true;
        if(extStatBtn.getAttribute('data-state') == 'shown')
            self._getExtStatisticsData();
        if(lostStatBtn.getAttribute('data-state') == 'shown')
            self._getLostStatisticsData();
    };

    this._getExtStatisticsData = function(){
        if(!renewStat) return;
        renewStat = false;
        $('#extStat-cont').addClass('faded');
        start = picker.date.start;
        end = picker.date.end;
        params = '\"begin\":'+start+', \"end\":'+end+', \"kind\":"'+extStatKind+'"';
        // console.log(params);
        json_rpc_async('getCallStatisticsExt', params, function(result){
            self._setExtStatistics(result);
            $('#extStat-cont').removeClass('faded');
        });
    };

    this._getLostStatisticsData = function(){
        if(!renewLost) return;
        renewLost = false;

        $('#lostCalls-cont').addClass('faded');
        start = picker.date.start;
        end = picker.date.end;
        params = '\"begin\":'+start+', \"end\":'+end;
        // console.log(params);
        json_rpc_async('getLostCalls', params, function(result){
            self._setLostStats(result);   
            $('#lostCalls-cont').removeClass('faded');
        });
    };

    this._setStatistics = function(data) {
        var attr, value, chartData,
            newdata = data;

        newdata.inbounds.duration = formatTimeString(newdata.inbounds.duration, 'hh:mm:ss');
        newdata.outbounds.duration = formatTimeString(newdata.outbounds.duration, 'hh:mm:ss');
        newdata.internals.duration = formatTimeString(newdata.internals.duration, 'hh:mm:ss');
        if(newdata.outbounds.cost !== undefined) {
            newdata.outbounds.cost = parseFloat(newdata.outbounds.cost).toFixed(2);
        }

        inc.forEach(function(item){
            attr = item.getAttribute('data-model');
            if(attr == 'inbounds.lost'){
                if(newdata.inbounds.lost === 0) item.classList.remove('negtv-col');
                else item.classList.add('negtv-col');
            }
            var value = attr.split('.').reduce(objFromString, newdata);
            item.textContent = value;
        });
        // console.log(newdata.trunks);
        self._build_trunks_statistics(newdata.trunks);
        show_content();
    };

    this._setExtStatistics = function(data) {
        clearColumns(exttable);
        for(var i=0; i<data.length; i++){
            self._buildExtStatColumn(data[i]);
        }
        // build_ext_statistics(data);
    };

    this._setLostStats = function(data){
        var tRows = document.createDocumentFragment(),
        tbody = document.getElementById('lost-calls-table').querySelector('tbody');
        for(var i=0; i<data.length; i++){
            tRows.appendChild(self._buildLostCallsTable(data[i]));
        }
        // console.log(data);
        tbody.appendChild(tRows);
    };

    this._setCharts = function(data) {

        data = data.map(function(item) {
            item['s'] = item.i - item.m;
            return item;
        });

        console.log('statistics charts data: ', data);

        var outChart = c3.generate({
            bindto: '#outbounds-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.OUTCALLS, ['o']),
                ]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d-%m-%Y'
                    }
                }
            }
        });

        var insChart = c3.generate({
            bindto: '#inbounds-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.INCALLS, ['s']),
                    self.getColumns(data, PbxObject.frases.STATISTICS.LOSTCALLS, ['m']),
                ],
                type: 'bar',
                groups: [[PbxObject.frases.SETTINGS.INCALLS, PbxObject.frases.STATISTICS.LOSTCALLS]]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d-%m-%Y'
                    }
                }
            }
        });

        var intsChart = c3.generate({
            bindto: '#internals-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.INTCALLS, ['l']),
                ]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d-%m-%Y'
                    }
                }
            }
        });
    };

    this._build_trunks_statistics = function(data){
        var table = trtable.querySelector('tbody');
        clearTable(table);
        for (var i = 0; i < data.length; i++) {
            row = table.insertRow(i);
            
            cell = row.insertCell(0);
            cell.textContent = data[i].trunk !== undefined ? data[i].trunk : '';

            cell = row.insertCell(1);
            cell.textContent = data[i].in !== undefined ? data[i].in : '';

            cell = row.insertCell(2);
            cell.textContent = data[i].insec !== undefined ? formatTimeString(data[i].insec, 'hh:mm:ss') : '';

            cell = row.insertCell(3);
            cell.textContent = data[i].out !== undefined ? data[i].out : '';

            cell = row.insertCell(4);
            cell.textContent = data[i].outsec !== undefined ? formatTimeString(data[i].outsec, 'hh:mm:ss') : '';

            cell = row.insertCell(5);
            cell.textContent = data[i].cost !== undefined ? parseFloat(data[i].cost).toFixed(2) : '';
        }
    };

    this._buildExtStatColumn = function(data){
        // var table = document.getElementById('ext-statistics-table'),
        var thead = exttable.querySelector('thead'),
            tbody = exttable.querySelector('tbody'),
            newTH, newCell, param;

        for (var h=0; h<thead.rows.length; h++) {
            newTH = document.createElement('th');
            thead.rows[h].appendChild(newTH);
            newTH.innerHTML = data.ext;
        }
        for (var i=0; i<tbody.rows.length; i++) {
            newCell = tbody.rows[i].insertCell(-1);
            switch(i){
                case 0: param='total';break;
                case 1: param='connected';break;
                case 2: param='duration';break;
                case 3: param='cost';break;
            }
            newCell.innerHTML = data[param] !== undefined ?
                (param === 'duration' ?
                    formatTimeString(data[param], 'hh:mm:ss') : param === 'cost' ?
                        parseFloat(data[param]).toFixed(2) : data[param]) : '';
        }
    };

    this._buildLostCallsTable = function(data){
        var row = document.createElement('tr'),
            cell;

        cell = row.insertCell(0);
        cell.textContent = formatDateString(data.ts) || "";

        cell = row.insertCell(1);
        cell.textContent = data.na || "";
        
        cell = row.insertCell(2);
        cell.textContent = data.nb || "";

        cell = row.insertCell(3);
        cell.textContent = data.nc || "";

        cell = row.insertCell(4);
        cell.textContent = getFriendlyCodeName(data.cs) || "";

        return row;
    };

    this._init();
}
var appStorage = new AppStorage('app-storage', 'localStorage');

function AppStorage(id, type) {

	if(type !== 'localStorage' && type !== 'sessionStorage')
		return console.error('No such storage type. Choose either "localStorage" or "sessionStorage".');

	var glObj = window[type],
		cache = glObj.getItem(id) ? JSON.parse(glObj.getItem(id)) : {};

	this.set = function(key, data, cacheOnly) {
		cache[key] = data;
		if(!cacheOnly) glObj.setItem(id, JSON.stringify(cache));
		return this;
	};

	this.get = function(key) {
		return key ? cache[key] : cache;
	};

	this.remove = function(key) {
		key ? delete cache[key] : cache = {};
		return this;
	};

	this.setType = function(type) {
		if(window[type]) glObj = window[type];
		return this;
	};
		
}
function load_storages(){
	var storeTable,
		availableStorages,
		fileStorage,
		storageInfo,
		totalStorage,
		modalCont = document.getElementById('storage-settings-cont');


	if(PbxObject.options.mode === 1 || !PbxObject.options.prefix) {
		getStorages(function (result){
			fileStorage = result;
			init();
		});
	} else {
		fileStorage = null;
	}

	getStorageInfo(function (result){
		storageInfo = result;
		init();
	});

	function openStorageSettings(data) {
		if(modalCont) // TODO: find a solution
			modalCont.parentNode.removeChild(modalCont);

		// if(!modalCont) {
			modalCont = document.createElement('div');
			modalCont.id = "storage-settings-cont";
			document.body.appendChild(modalCont);
		// }

		if(data.maxsize)
			data.maxsize = convertBytes(data.maxsize, 'Byte', 'GB');

		ReactDOM.render(StorageComponent({
		    frases: PbxObject.frases,
		    data: data,
		    onSubmit: saveStorage
		}), modalCont);

		$('#storage-settings').modal();
	}

	function saveStorage(data){
		console.log('saveStorage: ', data);
		if(!data.path) return;
		if(!data.id) delete data.id;
		if(data.maxsize !== undefined) data.maxsize = convertBytes(data.maxsize, 'GB', 'Byte');
		data.state = parseInt(data.state, 10);

	    json_rpc_async('setFileStore', data, function(result){
			if(result){
				getStorages(function (result){
					fileStorage = result;

					getTotalStorage(function (result){
						PbxObject.options = result;
	
						renderUI();
						$('#storage-settings').modal('hide');
					});
				});
			}
		});
	}

    function init() {
		show_content();

    	if(fileStorage === undefined || storageInfo == undefined) return;

		renderUI();    	
		TableSortable.sortables_init();
		close_options();
	    set_page();
    }

    function renderUI(){
    	ReactDOM.render(UsageComponent({
    	    options: PbxObject.options,
    	    frases: PbxObject.frases,
    	    storageInfo: storageInfo,
    	    fileStorage: fileStorage,
    	    getTotalStorage: getTotalStorage,
    	    utils: {
    	    	convertBytes: convertBytes,
    	    	formatDateString: formatDateString,
    	    	getFriendlyStorageState: getFriendlyStorageState
    	    },
    	    openStorageSettings: openStorageSettings
    	}), document.getElementById('el-loaded-content'));
    }
}

function getStorages(callback){
	json_rpc_async('getFileStore', null, function (result){
		if(callback) callback(result);
	});
}

function getStorageInfo(callback){
	json_rpc_async('getStoreInfo', null, function (result){
		sortByKey(result, 'user');
		if(callback) callback(result);
	});
}

function getTotalStorage(callback){
	json_rpc_async('getPbxOptions', null, function (result){
		if(callback) callback(result);
	});
}

function setUserStoreLimit(oid, limit, input){
	json_rpc_async('setStoreLimit', { oid: oid, limit: convertBytes(parseFloat(limit), 'GB', 'Byte') }, function (result){
		console.log(result);
		input.value = convertBytes(result, 'Byte', 'GB').toFixed(2);
	});
}

function getFriendlyStorageState(state){
	return PbxObject.frases.STORAGE.STATES[state];
}
function load_timer(result){
    // console.log(result);
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'timer';

    var date = new Date();
    var yeardays = [];
    var pickr;
    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');
    
    if(result.name){
        name.value = result.name;
    }

    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

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
        var day = document.getElementById('t-d'+result.weekdays[i]);
        day.checked = true;
        if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.add('active');
    }
    
    fill_timer_targets('objects');
    setTimezones(
        document.getElementById('timer_timezone'), 
        (result.timezone || PbxObject.options.timezone)
    );

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
    
    var trange = document.getElementById('timer-range');
    addEvent(trange, 'click', check_days);

    var calendarWrapper = document.createElement('div');
    calendarWrapper.className = "timer-dates-wrapper no-weekdays no-years";
    document.body.appendChild(calendarWrapper);

    // init yeardates picker
    pickr = flatpickr('#timer-dates', {
        locale: PbxObject.language || 'en',
        mode: 'multiple',
        dateFormat: 'd F',
        appendTo: calendarWrapper,
        minDate: new Date(2017, 0, 1), // not a leap year
        maxDate: new Date(2017, 11, 31), // not a leap year
        onChange: function(selectedDates, dateStr){
            setTempParams({ selectedDates: selectedDates });
        }
    });

    // format yeardates and set them in picker
    if(result.yeardays) {
        result.yeardays.forEach(function(item){
            yeardays.push(moment().dayOfYear(item).format());
        })
        
        pickr.setDate(yeardays);
    }
}

function setTimezones(cont, selected) {
    var tzones = moment.tz.names() || [];
    var fragment = document.createDocumentFragment();
    var option = null;

    tzones.map(function(item) {
        option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        if(item === selected) option.selected = true;

        fragment.appendChild(option);
        return item;
    });

    cont.appendChild(fragment);
}

function set_timer(){
        
    var jprms, 
        name = document.getElementById('objname').value,
        timezone = document.getElementById('timer_timezone');

    if(name)
        jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
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

    if(timezone.value || PbxObject.options.timezone)
        jprms += '\"timezone\":\"'+ (timezone.value || PbxObject.options.timezone) +'\",';

    jprms += '\"weekdays\":[';
    var i;
    for(i=0; i<7; i++){
        if(document.getElementById('t-d'+i).checked){
            jprms += i+',';
        }
    }
    jprms += '],';

    // Set yeardays
    if(PbxObject.currentObj && PbxObject.currentObj.selectedDates) {
        jprms += '\"yeardays\":[';
        PbxObject.currentObj.selectedDates.forEach(function(item){
            jprms += (moment(item).dayOfYear() + ',');
        });
        jprms += '],';
    }
        


    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    
    jprms += '\"targets\":[';
    for(i=0; i < targets.children.length; i++){
        var tr = targets.children[i];
        if(tr.id != undefined && tr.id != ''){
            jprms += '{\"oid\":\"'+targets.children[i].id+'\",\"action\":\"'+(tr.children[0].getAttribute('data-action'))+'\"},';
        }
    }
    jprms += ']';
    
    json_rpc_async('setObject', jprms, handler); 
}

function timer_target_row(oid, name, action){
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var a = document.createElement('a');
    var straction = action == "Enable" ? PbxObject.frases.ENABLE : PbxObject.frases.DISABLE;

    td.textContent = straction;
    td.setAttribute('data-action', action);
    tr.appendChild(td);

    td = document.createElement('td');
    tr.id = oid;
    a.href = '#';
    a.onclick = function(e){
        get_object_link(oid);
        e.preventDefault();
    };
    a.innerHTML = name;
    td.appendChild(a);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-minus"></i>';
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
    var objects = document.getElementById(id),
        optgroups = {}, optgroup, option, kind, oid,
        result;
    if(typeof PbxObject.objects === 'object') {
        result = PbxObject.objects;
    } else {
        result = json_rpc('getObjects', '\"kind\":\"all\"');
        sortByKey(result, 'name');
        PbxObject.objects = result;
    }
    // var result = json_rpc('getObjects', '\"kind\":\"all\"');
    for(var i=0; i<result.length; i++){
        kind = result[i].kind;
        if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'users') {
            continue;
        }
        if(optgroups[kind]){
            optgroup = optgroups[kind];
        } else {
            optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
            optgroups[kind] = optgroup;
            objects.appendChild(optgroup);    
        }
        oid = result[i].oid;
        option = document.createElement('option');
        option.value = oid;
        option.innerHTML = result[i].name;
        optgroup.appendChild(option);
        // objects.appendChild(option);
    }
}

function check_days(e){
    var e = e || window.event,
        targ = e.target,
        filter = targ.getAttribute('data-filter'), day;

    e.preventDefault();

    for(var i=0; i<7; i++){
        day = document.getElementById('t-d'+i);
        if((filter === 'timer-workdays' && (i===5 || i===6)) || (filter === 'timer-holidays' && i<5)){
            if(day.checked) day.checked = false;
            if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.remove('active');
            continue;
        }
        day.checked = true;
        if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.add('active');
    }
}
function today(date) {

    'use strict';

    var _date = date ? new Date(date) : new Date();
    var scope = {
        valueOf: valueOf,
        dateOf: dateOf,
        toStartOf: toStartOf,
        toEndOf: toEndOf,
        plus: plus,
        minus: minus
    };

    function valueOf() {
        return _date.valueOf();
    }

    function dateOf() {
        return _date;
    }

    function toStartOf(period) {
        if(period === 'month') {
            _date = new Date(_date.setDate(1));
        } else if(period === 'year') {
            _date = new Date(_date.setMonth(0,1));
        } else {
            _date = new Date(_date.setHours(0,0,0,1));
        }

        return scope;
    }

    function toEndOf(period) {
        if(period === 'month') {
            scope.toStartOf('month').plus(1, 'month').minus(1);
        } else if(period === 'year') {
            _date = new Date(_date.setMonth(11,31));
        } else {
            _date = new Date(_date.setHours(23,59,59));
        }

        return scope;
    }

    function plus(number, period) {
        if(!period) {
            _date = new Date(_date.setDate(_date.getDate() + number));
        } else if(period.match(/month|months/g)) {
            _date = new Date(_date.setMonth(_date.getMonth() + number));
        } else if(period.match(/year|years/g)) {
            _date = new Date(_date.setFullYear(_date.getFullYear() + number));
        }

        return scope;
    };

    function minus(number, period) {
        if(!period) {
            _date = new Date(_date.setDate(_date.getDate() - number));
        } else if(period.match(/month|months/g)) {
            _date = new Date(_date.setMonth(_date.getMonth() - number));
        } else if(period.match(/year|years/g)) {
            _date = new Date(_date.setFullYear(_date.getFullYear() - number));
        }

        return scope;
    };

    return scope;

 }
function MyTour(name, options) {

	if(!name) return console.error('tour name is undefined');
	if(!options) return console.error('options is undefined');

	// PbxObject.tours = PbxObject.tours || [];

	var tour = {};
	var defaults = {
		name: name,
        backdrop: true,
        backdropContainer: "#pagecontent",
        storage: false,
        template: ["<div class='popover tour'>",
	        			"<div class='arrow'></div>",
	        			"<h3 class='popover-title'></h3>",
						"<div class='popover-content'></div>",
						"<div class='popover-navigation'>",
	    					"<button class='btn btn-default' data-role='prev'><i class='fa fa-angle-left'></i></button>",
	    					"<span data-role='separator'> </span>",
	    					"<button class='btn btn-default' data-role='next'><i class='fa fa-angle-right'></i></button>",
	    					"<button class='btn btn-link' data-role='end'>", 
	    						PbxObject.frases.TOURS.END_TOUR,
	    					"</button>",
							// "<button class='btn btn-default' data-role='end'>End tour</button>",
						"</div>",
					"</div>"].join(''),
        steps: []
	};

	if(options) extend(defaults, options);

	tour = new Tour(defaults);
	tour.init();

	// PbxObject.tours[name] = tour;

	return tour;
}
function load_trunk(result){
    // console.log(result);
    var type = result.type,
        types = [].slice.call(document.querySelectorAll('[name="trunkType"]'));
        // passanumberEl = document.getElementById('passanumber');

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
            getProtocolOptions(result.parameters);
            // get_protocol_opts(protocols.value, result);
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
        
        if(document.getElementById('regexpires')) 
            document.getElementById('regexpires').value = result.parameters.regexpires || 60;

    }
    // if(passanumberEl) passanumberEl.checked = result.parameters.passanumber;

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

    // renderTrunkIncRoute({
    //     route: result.inboundbnumbertransforms.filter(getCurrIncRoutes)[0],
    //     frases: PbxObject.frases
    // });

    // renderTrunkOutRoute();
    
}

function getProtocolOptions(params) {
    var protocols = document.getElementById('protocols');
    var types = [].slice.call(document.querySelectorAll('[name="trunkType"]'));
    var type = "";
    types.forEach(function (item){
        if(item.checked) {
            type = item.value;
        }
    });

    console.log('getProtocolOptions: ', params, type);

    get_protocol_opts(protocols.value, { parameters: params, type: type });
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

    var routes = null;

    getRouteOptions(function(options) {
        if(params.route) {
            routes = options.filter(function(item) {
                return (item.ext === params.route.prefix);
            })[0];
        }

        console.log('renderTrunkIncRoute: ', routes);

        // Render incoming route parameter
        ReactDOM.render(
            TrunkIncRoute({
                // options: options,
                // routes: routes,
                routes: result.inboundbnumbertransforms,
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
        // passanumberEl = document.getElementById('passanumber'),
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
            // jprms += '"regexpires":'+document.getElementById('regexpires').value+',';
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

    // if(passanumberEl) jprms += '"passanumber":' + passanumberEl.checked+',';
    if(register) jprms += '"regexpires":'+document.getElementById('regexpires').value+',';

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

    console.log(jprms);
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
function load_users(params) {

	console.log('load_users: ', params);
	var frases = PbxObject.frases;
	var driver;
	var driverSettings = {
		nextBtnText: frases.GET_STARTED.STEPS.NEXT_BTN,
		prevBtnText: frases.GET_STARTED.STEPS.PREV_BTN,
		doneBtnText: frases.GET_STARTED.STEPS.DONE_BTN,
		closeBtnText: frases.GET_STARTED.STEPS.CLOSE_BTN
	};
	var driverSteps = [];
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont = document.getElementById('modal-cont');
	var activeServices = PbxObject.options.services.filter(function(service){
	    return service.state;
	});
	var tourStarted = false;

	if(PbxObject.options.ldap && PbxObject.options.ldap.directoryServer.trim().length) {
		activeServices.unshift({
			id: "MicrosoftAD",
			name: "Microsoft Active Directory",
			props: PbxObject.options.ldap,
			state: true,
			types: 1
		});
	}

	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	init(objParams);
	show_content();
    set_page();

	function getDefaultName() {
		var name = PbxObject.frases.USERS_GROUP.DEFAULT_NAME + ' ';
		name += PbxObject.objects ? filterObject(PbxObject.objects, PbxObject.kind).length+1 : 1;
		return name;
	}

	function onNameChange(name) {
		objParams.name = name;
	}

	function openNewUserForm() {
		console.log('openNewUserForm');

		if(driver) driver.reset(); // close the tour

		var options = PbxObject.options;
		// var maxusers = options.maxusers;
		// var storelimit = Math.ceil(convertBytes(options.storelimit, 'Byte', 'GB'));
		var storeperuser = options.storelimit / options.maxusers;

		params.storelimit = storeperuser;

		modalCont = document.getElementById('modal-cont');

		if(modalCont) {
			modalCont.parentNode.removeChild(modalCont);
		}

		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);

		ReactDOM.render(NewUsersModalComponent({
		    frases: PbxObject.frases,
		    params: params,
		    onSubmit: addUser,
		    generatePassword: generatePassword,
		    convertBytes: convertBytes,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);
	}

	function addUser(userParams) {
		console.log('addUser: ', params);

		if(!PbxObject.name) {
			return setObject({
				name: objParams.name,
				profile: objParams.profile,
				members: []
			}, function() {
				addUser(userParams);
			});
		}

		userParams.kind = params.kind === 'users' ? 'user' : 'phone';
		userParams.groupid = params.oid;

		json_rpc_async('setObject', userParams, function(result, error) {

			if(error) return notify_about('error', error.message);

			$('#modal-cont .modal').modal('hide');

			userParams.oid = result;
			userParams.reg = "";
			userParams.state = 0;

			objParams.available = objParams.available.filter(function(item) {
				return item !== userParams.number;
			});

			objParams.members.push(userParams);

			init(objParams);

			if(tourStarted) {
				onFirstUserCreated();
			}

		});
	}

	function onFirstUserCreated() {
		console.log('onFirstUserCreated');

		driverSettings.onReset = showGSLink;
		driver = new Driver(driverSettings);
		driver.highlight({
			element: '#group-extensions',
			popover: {
				title: PbxObject.frases.GET_STARTED.CREATE_USERS.STEPS["2"].TITLE,
				description: PbxObject.frases.GET_STARTED.CREATE_USERS.STEPS["2"].TITLE,
				position: 'bottom'
			}
		});
	}

	function onImportUsers(serviceParams) {
		console.log('onImportUsers: ', serviceParams);
		if(serviceParams.id === 'MicrosoftAD') {
			PbxObject.LdapConnection = Ldap({
			    domains: serviceParams.props.directoryDomains.split(' '),
			    available: objParams.available,
			    onaddusers: onAddLdapUsers
			});
			PbxObject.LdapConnection.auth();
		} else {
			getExternalUsers(serviceParams);
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

	function getExternalUsers(serviceParams){
		console.log('getExternalUsers:', serviceParams);

		PbxObject.LdapConnection = Ldap({
		    service_id: serviceParams.id,
		    service_type: serviceParams.type,
		    available: objParams.available,
		    onaddusers: setExternalUsers
		});

	    if(serviceParams.type === 1 || serviceParams.types === 1) {
	        PbxObject.LdapConnection.getExternalUsers();
	    } else {
	        json_rpc_async('getExternalUsers', { service_id: serviceParams.id }, function(result) {
	            console.log('getExternalUsers result: ', result);
	            if(result) PbxObject.LdapConnection.showUsers(result);
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

	function deleteMember(params) {
		var oid = params.oid;
		var msg = PbxObject.frases.DODELETE + ' ' + params.name + '?';
        var conf = confirm(msg);
		
		if(conf) {
			objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
			setObject(objParams, function(result) {
				init(objParams);
			});
		}
			
	}

	function setObject(props, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var objName = props.name || defaultName;
	    var groupParams = {
	    	kind: PbxObject.kind,
	    	oid: objParams.oid,
	    	name: objName,
	    	profile: props.profile,
	    	// enabled: props.enabled,
	    	// options: props.options,
	    	members: (props.members.length ? props.members.reduce(function(prev, next) { prev.push(next.number || next.ext); return prev; }, []) : [])
	    };

	    console.log('setObject: ', props);

		json_rpc_async('setObject', groupParams, function(result) {
			PbxObject.name = objParams.name = objName;

			if(handler) handler();
			if(callback) callback(result);
		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	function addSteps(stepParams) {
		driverSteps = driverSteps.concat(stepParams);
	}

	function initSteps() {
		console.log('initSteps: ', driverSteps);
		if(PbxObject.tourStarted && driverSteps.length) {
			tourStarted = true;
			driverSettings.onReset = showGSLink;
			driver = new Driver(driverSettings);
			driver.defineSteps(driverSteps);
			driver.start();
		}
	}

	function showGSLink() {
		console.log('showGSLink');
		driver = new Driver({
			nextBtnText: frases.GET_STARTED.STEPS.NEXT_BTN,
			prevBtnText: frases.GET_STARTED.STEPS.PREV_BTN,
			doneBtnText: frases.GET_STARTED.STEPS.DONE_BTN,
			closeBtnText: frases.GET_STARTED.STEPS.CLOSE_BTN
		});
		driver.highlight({
			element: '.init-gs-btn',
			popover: {
				title: PbxObject.frases.GET_STARTED.CREATE_USERS.STEPS["3"].TITLE,
				description: PbxObject.frases.GET_STARTED.CREATE_USERS.STEPS["3"].DESC,
				position: 'right'
			}
		});
	}

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    setObject: setObject,
		    onAddMembers: openNewUserForm,
		    onNameChange: onNameChange,
		    getExtension: getExtension,
		    activeServices: activeServices,
		    onImportUsers: onImportUsers,
		    deleteMember: deleteMember,
		    addSteps: addSteps,
		    initSteps: initSteps
		};

		if(params.name) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(UsersGroupComponent(componentParams), document.getElementById('el-loaded-content'));
	}	

}
var Utils = {
	validateElement: function(element, stateElement) {
	    var valid = !!element.value;
	    if(!valid) {
	        stateElement ? stateElement.classList.add('has-error') : element.classList.add('has-error');
	        valid = false;
	    } else {
	        stateElement ? stateElement.classList.remove('has-error') : element.classList.remove('has-error');
	    }

	    return valid;
	},
	validateEmail: function(string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(string);
	}
};
PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.attendant = function(){

    var frases = PbxObject.frases;

    return {
        storage: window.localStorage,
        backdrop: false,
        steps: [
            {
                placement: 'bottom',
                element: "#objname",
                title: frases.TOURS.ATTENDANT.A.TITLE,
                content: frases.TOURS.ATTENDANT.A.BODY
            }, {
                placement: 'bottom',
                element: "#object-route-cont",
                title: frases.TOURS.ATTENDANT.B.TITLE,
                content: frases.TOURS.ATTENDANT.B.BODY
            }, {
                placement: 'left',
                element: "#enabled-cont",
                title: frases.TOURS.ATTENDANT.C.TITLE,
                content: frases.TOURS.ATTENDANT.C.BODY
            }, {
                placement: 'right',
                element: "#attGreetings",
                title: frases.TOURS.ATTENDANT.D.TITLE,
                content: frases.TOURS.ATTENDANT.D.BODY
            }, {
                placement: 'right',
                element: "#att-email-setts",
                title: frases.TOURS.ATTENDANT.E.TITLE,
                content: frases.TOURS.ATTENDANT.E.BODY
            }, {
                placement: 'right',
                element: "#attconnectors",
                title: frases.TOURS.ATTENDANT.F.TITLE,
                content: frases.TOURS.ATTENDANT.F.BODY
            }, {
                reflex: true,
                placement: 'bottom',
                element: "#att-obj-types",
                title: frases.TOURS.ATTENDANT.G.TITLE,
                content: frases.TOURS.ATTENDANT.G.BODY,
                onShow: function() {
                    $('#att-container .att-init-button').removeClass('open');
                },
                onHidden: function() {
                    $('#att-container .att-init-button').addClass('open');
                }
            }, {
                reflex: true,
                backdrop: true,
                placement: 'bottom',
                element: "#att-obj-types + .dropdown-menu",
                title: frases.TOURS.ATTENDANT.H.TITLE,
                content: frases.TOURS.ATTENDANT.H.BODY,
                onHidden: function() {
                    $('#att-container .att-init-button').removeClass('open');
                }
            }
        ]
    }
}
PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.dashboard = function() {
    return {
        steps: [
            {
                // orphan: true,
                backdropPadding: { top: 10 },
                placement: 'top',
                element: "#dash-tour-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.A.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.A.BODY
            }, {
                backdropPadding: { top: 10 },
                element: "#dash-graph-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.B.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.B.BODY,
                placement: "bottom"
            }, {
                backdropPadding: { top: 10 },
                element: "#dash-monitor-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.C.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.C.BODY,
                placement: "top"
            }, {
                element: "#dash-trstate-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.D.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.D.BODY,
                placement: "top"
            }, {
                element: "#dash-callmonitor-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.E.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.E.BODY,
                placement: "top"
            }, {
                element: "#home-btn",
                content: PbxObject.frases.TOURS.DASHBOARD.F.BODY,
                placement: "bottom"
            }, {
                element: "#pbxmenu",
                title: PbxObject.frases.TOURS.DASHBOARD.G.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.G.BODY,
                placement: "right"
            }, {
                element: "#history-dropdown-cont .dropdown-menu",
                title: PbxObject.frases.TOURS.DASHBOARD.H.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.H.BODY,
                placement: "left",
                onShow: function() {
                	$('#history-dropdown-cont').addClass('open');
                },
                onShown: function() {
                	$('#history-dropdown-cont .tour-step-backdrop').css('position', 'absolute');
                },
                onHide: function() {
                	$('#history-dropdown-cont').removeClass('open');
                }
            }, {
                reflex: true,
                element: "#open-opts-btn",
                content: PbxObject.frases.TOURS.DASHBOARD.I.BODY,
                placement: "left"
            }, {
                element: "#pbxoptions",
                title: PbxObject.frases.TOURS.DASHBOARD.J.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.J.BODY,
                placement: "left",
                onShow: function() {
                    if(!isOptionsOpened()) open_options();
                },
                onHide: function() {
                	if(isOptionsOpened()) close_options();
                }
            }, {
                element: "#get-started-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.K.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.K.BODY,
                placement: "bottom"
            }
        ]
    }
}
PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.equipment = function(params){

    var frases = params.frases;

    return {
        storage: window.localStorage,
        backdrop: false,
        steps: [
            {
                placement: 'bottom',
                element: "#objname",
                title: 'Group name',
                content: 'Enter a group name'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#equipment-group-setts",
                title: 'Group settings',
                content: 'Select the signaling <b>protocol</b> for devices to connect with. <b>Device type</b> is basicaly the type of devices that would be connected to the server.'
            }, {
                reflex: true,
                placement: 'top',
                element: "#add-newuser-btn",
                title: 'Creating new extensions',
                content: 'Click this button to open the <b>Create extensions</b> form',
                onHidden: function() {
                    $('#new-user-form').collapse('show');
                }
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                reflex: 'users.create',
                placement: 'top',
                element: "#new-user-form",
                title: 'Creating new extensions',
                content: 'To create a new extension, fill in the form with the extension\'s data and then click <b>Create</b> button. After creating a first extension, the equipment group will be created also (<br/> Make sure to fill in the <b>Group name</b> field above). <br/> Click <b>Clear</b> button to clear the form.'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#group-extensions",
                title: 'Extensions list',
                content: 'All extensions that were added to the group are listed here with the real-time updates of the extensions statuses'
            }, {
                placement: 'top',
                element: "#ext-features-panel",
                title: 'Extension features',
                content: 'Select which of the features of IP PBX would be available to the extensions of current group',
                onShow: function() {
                    $('#ext-features-panel').removeClass('minimized');
                }
            }, {
                placement: 'bottom',
                element: "#el-set-object",
                title: 'Saving changes',
                content: 'Click <b>Save</b> button to save changes'
            }
        ]
    }
}
PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.users = function(params){

    var frases = params.frases;

    return {
        storage: window.localStorage,
        backdrop: false,
        steps: [
            {
                placement: 'bottom',
                element: "#objname",
                title: 'Group name',
                content: 'Enter a group name'
            }, {
                reflex: true,
                placement: 'top',
                element: "#add-newuser-btn",
                title: 'Creating new users',
                content: 'Click this button to open the <b>Create users</b> form',
                onHidden: function() {
                    $('#new-user-form').collapse('show');
                }
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                reflex: 'users.create',
                placement: 'top',
                element: "#new-user-form",
                title: 'Creating new users',
                content: 'To create a new user, fill in the form with the user\'s data and then click <b>Create</b> button. After creating a first user, the users group will be created also (<br/> Make sure to fill in the <b>Group name</b> field above). <br/> Click <b>Clear</b> button to clear the form.'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#group-extensions",
                title: 'Users list',
                content: 'All users that were added to the group are listed here with the real-time updates of the users statuses'
            }, {
                placement: 'top',
                element: "#ext-features-panel",
                title: 'Extension features',
                content: 'Select which of the features of IP PBX would be available to the extensions of current group',
                onShow: function() {
                    $('#ext-features-panel').removeClass('minimized');
                }
            }, {
                placement: 'bottom',
                element: "#el-set-object",
                title: 'Saving changes',
                content: 'Click <b>Save</b> button to save changes'
            }
        ]
    }
}
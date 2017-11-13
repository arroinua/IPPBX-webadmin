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

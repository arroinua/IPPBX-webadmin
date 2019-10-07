function load_application(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;

    init(result);
    
    show_content();
    set_page();

    function setObject(params, file) {
        show_loading_panel();

        var setParams = {};

        if(file) {
            setParams = extend(params, {method: 'setObject', id: 1, file: file, filename: file.name});
            delete setParams.parameters;
            request('POST', '/', setParams, onSetObject);
        } else {
            json_rpc_async('setObject', params, onSetObject);
        }
            
    }

    function onSetObject(err, response) {
        Utils.debug('onSetObject: ', err, response);
        json_rpc_async('getObject', {oid: response.result.result}, function(result) {
            set_object_success();
            init(result);
        });
    }

    function onNameChange(name) {
        PbxObject.name = name;
    }

    function onStateChange(state) {
        if(!PbxObject.name) return;
        setObjectState(PbxObject.oid, state, function(result) {
            return true;
        });
    }

    function removeObject() {
        delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
    }

    function init(params) {
        var componentParams = {
            frases: PbxObject.frases,
            params: params,
            setObject: setObject,
            onNameChange: onNameChange,
            onStateChange: onStateChange
        };

        if(params.name) {
            componentParams.removeObject = removeObject;
        }

        ReactDOM.render(ApplicationComponent(componentParams), document.getElementById('el-loaded-content'));
    }
}
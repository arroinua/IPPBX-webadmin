function load_location(params) {

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

	function setObject(props, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var setParams = extend({}, props);
	    setParams.kind = PbxObject.kind;
	    setParams.name = props.name || defaultName;
	    setParams.profile = {
	    	anumbertransforms: props.profile.anumbertransforms || [],
	    	bnumbertransforms: props.profile.bnumbertransforms || []
	    };

	    delete setParams.members;

		json_rpc_async('setObject', setParams, function(result, err) {
			
			if(err) return notify_about('error', err.message);

			PbxObject.name = objParams.name = setParams.name;

			set_object_success();
			init(setParams);
			
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
		    getExtension: getExtension
		};

		if(params.name) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(LocationGroupComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(objParams);
	show_content();
    set_page();

}
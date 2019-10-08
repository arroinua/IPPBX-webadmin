function load_selector(params) {

	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont;
	var members = [].concat(objParams.members);
	var availableList = [];

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	getExtensions(function(result) {
		availableList = result.filter(function(item) { return (item.kind === 'user' || item.kind === 'phone') });
		objParams.members = availableList.filter(function(item) { return members.indexOf(item.ext) !== -1 });

		init(objParams);
		show_content();
	    set_page();
	});

	function getDefaultName() {
		var name = PbxObject.frases.KINDS['selector'] + ' ';
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
			return true;
		});
	}

	// function onAddMembers() {
	// 	var params = PbxObject.name ? { groupid: PbxObject.oid } : null;

	//     json_rpc_async('onAddMembers', params, function(result){
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
		    availableList: availableList,
		    excludeList: objParams.members,
		    onSubmit: addMembers,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);

		// $('#'+modalId).modal();
	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);

		if(PbxObject.name) {
			saveObject(objParams, function(result) {
				init(objParams);
			});
		} else {
			init(objParams);
		}

		$('#available-users-modal').modal('hide');
	}

	function deleteMember(params) {
		var oid = params.oid;
		objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });

		if(PbxObject.name) {
			saveObject(objParams, function(result) {
				init(objParams);
			});
		} else {
			init(objParams);
		}
			
	}

	function saveObject(newParams, callback) {

	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var props = extend({}, newParams);
	    var objName = props.name || defaultName;

		props.members = props.members.reduce(function(array, item) { array = array.concat([item.ext]); return array; }, []);

		setObject({
			kind: PbxObject.kind,
			oid: props.oid,
			name: objName,
			owner: props.owner,
			enabled: props.enabled,
			options: props.options,
			members: props.members
		}, function(result) {
			PbxObject.name = objParams.name = objName;

			// Upload audio files
			if(props.files && props.files.length) {
				props.files.forEach(function(item) {
					uploadFile(item);
				})

			}

			// Add new route to the routing table
			if(props.route && props.route.ext) {
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
		    setObject: saveObject,
		    onNameChange: onNameChange,
		    onStateChange: onStateChange,
		    getInfoFromState: getInfoFromState,
		    getExtension: getExtension,
		    deleteMember: deleteMember
		};

		if(params.name) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(SelectorComponent(componentParams), document.getElementById('el-loaded-content'));
	}

}
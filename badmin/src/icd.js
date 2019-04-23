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
		console.log('showAvailableUsers: ', objParams);
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
		    excludeList: objParams.members,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);

	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);
		console.log('addMembers: ', array, objParams);

		if(PbxObject.name) {
			setObject(objParams, function(result) {
				init(objParams);
			});
		} else {
			init(objParams);	
		}

		$('#available-users-modal').modal('hide');

	}

	function deleteMember(params) {
		var oid = params.oid;
		console.log('deleteMember: ', oid);
		objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });

		if(PbxObject.name) {
			setObject(objParams, function(result) {
				init(objParams);
			});
		} else {
			init(objParams);
		}
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
			// if(props.route && props.route.ext) {
			//     console.log('set route props: ', props.route);
			//     var routeProps = {
			//     	number: props.route.ext,
			//     	target: { oid: PbxObject.oid, name: PbxObject.name }
			//     };
			//     if(params.routes.length) routeProps.oid = params.routes[0].id;
			    
			//     setObjRoute(routeProps);
			    
			// }

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
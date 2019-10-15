function load_chatchannel(params) {

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

		getExtensions(function(result) {
			
		    ReactDOM.render(AvailableUsersModalComponent({
		        frases: PbxObject.frases,
		        onSubmit: addMembers,
		        availableList: result.filter(function(item) { return item.kind === 'user' }),
		        excludeList: objParams.members,
		        groupid: PbxObject.name ? PbxObject.oid : null
		    }), modalCont);
		})

	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);

		if(PbxObject.name) {
			setChatChannel(objParams, function(result) {
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
			setChatChannel(objParams, function(result) {
				init(objParams);
			});
		} else {
			init(objParams);
		}
			
	}

	function setChatChannel(params, callback) {
	    if(PbxObject.name) {
	    	handler = set_object_success;
	    }

	    var objName = params.name || defaultName;

		setObject({
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
		    onAddMembers: (PbxObject.isUserAccount ? (checkPermissions('chatchannel', 3) ? showAvailableUsers : null) : showAvailableUsers),
		    setObject: (PbxObject.isUserAccount ? (checkPermissions('chatchannel', 3) ? saveObject : null) : saveObject),
		    onNameChange: onNameChange,
		    onStateChange: (PbxObject.isUserAccount ? (checkPermissions('chatchannel', 3) ? onStateChange : null) : onStateChange),
		    getInfoFromState: getInfoFromState,
		    getExtension: getExtension,
		    deleteMember: (PbxObject.isUserAccount ? (checkPermissions('chatchannel', 3) ? deleteMember : null) : deleteMember)
		};

		if(params.name && (PbxObject.isUserAccount ? (checkPermissions('chatchannel', 15) ? true : null) : true)) {
			componentParams.removeObject = removeChatChannel;
		}

		ReactDOM.render(ChatchannelComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(objParams);
	show_content();
    set_page();

}
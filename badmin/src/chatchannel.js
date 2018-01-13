function load_chatchannel(params) {

	console.log('load_chat_group: ', params);
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalId = 'available-users-modal';
	var modalCont = document.getElementById('available-users-cont');

	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "available-users-cont";
		document.body.appendChild(modalCont);
	}

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

	function getAvailableUsers() {
		var params = PbxObject.name ? { groupid: PbxObject.oid } : null;

	    json_rpc_async('getAvailableUsers', params, function(result){
			console.log('getAvailableUsers: ', result);
			showAvailableUsers(result);
		});
	}

	function showAvailableUsers(data) {
		console.log('showAvailableUsers: ', data);

		ReactDOM.render(AvailableUsersComponent({
			modalId: modalId,
		    frases: PbxObject.frases,
		    data: data,
		    onSubmit: addMembers
		}), modalCont);

		$('#'+modalId).modal();
	}

	function addMembers(array) {
		objParams.members = objParams.members.concat(array);
		console.log('addMembers: ', array, objParams);

		setChatChannel(objParams, function(result) {
			init(objParams);
		});
		$('#available-users-modal').modal('hide');
	}

	function deleteMember(oid) {
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
		    getAvailableUsers: getAvailableUsers,
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
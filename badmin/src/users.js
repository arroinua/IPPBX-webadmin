function load_users(params) {

	var frases = PbxObject.frases;
	var objParams = params;
	var handler = null;
	var defaultName = getDefaultName();
	var modalCont = document.getElementById('modal-cont');
	var activeServices = PbxObject.options.services ? PbxObject.options.services.filter(function(service){
	    return service.state;
	}) : [];
	var serviceParams = window.sessionStorage.serviceParams;

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

	objParams.available.sort();

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

		modalCont = document.getElementById('modal-cont');

		if(modalCont) {
			modalCont.parentNode.removeChild(modalCont);
		}

		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);

		rednerNewUserModal();

	}

	function rednerNewUserModal() {
		var options = PbxObject.options;
		var storeperuser = options.storelimit / options.maxusers;

		objParams.storelimit = storeperuser;

		ReactDOM.render(NewUsersModalComponent({
		    frases: PbxObject.frases,
		    params: objParams,
		    onSubmit: addUser,
		    generatePassword: generatePassword,
		    convertBytes: convertBytes,
		    groupid: PbxObject.name ? PbxObject.oid : null
		}), modalCont);
	}

	function addUser(params, callback) {

		var userParams = extend({}, params);

		if(!PbxObject.name) {
			return saveObject({
				name: objParams.name,
				profile: objParams.profile,
				members: []
			}, function() {
				addUser(userParams, callback);
			});
		}

		userParams.kind = objParams.kind === 'users' ? 'user' : 'phone';
		userParams.groupid = objParams.oid;

		setObject(userParams, function(result, error) {

			if(error) {
				callback(error);
				return notify_about('error', error.message);
			}

			userParams.oid = result;
			userParams.reg = "";
			userParams.state = 0;

			objParams.available = objParams.available.filter(function(item) {
				return item !== userParams.number;
			});

			objParams.members.push(userParams);

			init(objParams);

			if(callback) callback(null, result);

		});
	}

	function onImportUsers(serviceParams) {
		if(serviceParams.id === 'MicrosoftAD') {
			PbxObject.LdapConnection = Ldap({
			    domains: serviceParams.props.directoryDomains.split(' '),
			    available: objParams.available,
			    onaddusers: onAddLdapUsers,
			    members: objParams.members
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

	    var ldapConn = PbxObject.LdapConnection;
	    
	    ldapConn.setUsers({
	        groupid: PbxObject.oid,
	        username: ldapConn.options.username,
	        password: ldapConn.options.password,
	        domain: ldapConn.options.domain,
	        users: users
	    }, function(result) {
	        ldapConn.close();
	        
	    });
	}

	function getExternalUsers(serviceParams){

		PbxObject.LdapConnection = Ldap({
		    service_id: serviceParams.id,
		    service_type: serviceParams.type,
		    available: objParams.available,
		    onaddusers: setExternalUsers,
		    members: objParams.members
		});

	    PbxObject.LdapConnection.getExternalUsers();
	}

	function setExternalUsers(users){
	    if(!PbxObject.name) {
	        set_bgroup(users, setExternalUsers);
	        return;
	    }

	    show_loading_panel();

	    var ldapConn = PbxObject.LdapConnection;

	    ldapConn.setExternalUsers({
	        groupid: PbxObject.oid,
	        service_id: ldapConn.options.service_id,
	        users: users
	    }, function(result) {
	        ldapConn.close();
			if(result === 'OK') set_object_success();
	    });
	}

	function deleteMember(params) {
		var oid = params.oid;
		var msg = PbxObject.frases.DODELETE + ' ' + params.name + '?';
        var conf = confirm(msg);

		if(conf) {
			json_rpc_async('deleteObject', { oid: oid }, function(){
				objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
				objParams.available = objParams.available.concat([params.ext]).sort();
				init(objParams);
			});
			
		}
			
	}

	function saveObject(props, callback) {
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

		setObject(groupParams, function(result) {
			PbxObject.name = objParams.name = objName;

			if(handler) handler();
			if(callback) callback(result);
		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	function updateUsersList(e, object) {
		if(object.ext === undefined) return;
		objParams.members.push(object);
		init(objParams);
	}

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    setObject: (PbxObject.isUserAccount ? (checkPermissions('users', (PbxObject.name ? 3 : 7)) ? saveObject : null) : saveObject),
		    onAddMembers: openNewUserForm,
		    onNameChange: onNameChange,
		    getExtension: getExtension,
		    activeServices: activeServices,
		    onImportUsers: (PbxObject.isUserAccount ? (checkPermissions('users', (PbxObject.name ? 3 : 7)) ? onImportUsers : null) : onImportUsers),
		    deleteMember: (PbxObject.isUserAccount ? (checkPermissions('users', 15) ? deleteMember : null) : deleteMember)
		};

		if(params.name && (PbxObject.isUserAccount ? (checkPermissions('users', 15) ? true : null) : true)) {
			componentParams.removeObject = removeObject;
		}

		ReactDOM.render(UsersGroupComponent(componentParams), document.getElementById('el-loaded-content'));

		if(serviceParams && serviceParams.id && getQueryParams().success === 1) {
			getExternalUsers(serviceParams);
		}
	}	

}
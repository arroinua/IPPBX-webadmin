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

		// if(driver) driver.reset(); // close the tour

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
		// var maxusers = options.maxusers;
		// var storelimit = Math.ceil(convertBytes(options.storelimit, 'Byte', 'GB'));
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

	function addUser(userParams, callback) {
		console.log('addUser: ', params);

		userParams = extend({}, userParams);

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

			if(error) {
				callback(error);
				return notify_about('error', error.message);
			}

			// $('#modal-cont .modal').modal('hide');

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

			if(callback) callback(null, result);

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

	    if((serviceParams.type & 1 !== 0) || (serviceParams.types & 1 !== 0)) {
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
			json_rpc_async('deleteObject', { oid: oid }, function(){
				objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
				init(objParams);
			});
			
			// objParams.members = objParams.members.filter(function(item) { return item.oid !== oid; });
			// setObject(objParams, function(result) {
				// init(objParams);
			// });
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
function load_services() {

	var services = [];
	var ldap = {};
	var extensions = [];
	var ldapConn = {};
	var serviceParams = window.sessionStorage.serviceParams;

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			
			services = result.services;

			getExtensions(['phone', 'user'], function(result) {
				extensions = result;

				console.log('getExtensions: ', extensions);

				ldap.props = result.ldap || {};
				ldap.name = 'Microsoft Active Directory';
				ldap.id = 'MicrosoftAD';
				ldap.types = 1;

		    	render();
			})
				
		});

	}

	function getExternalUsers(serviceParams){
		console.log('getExternalUsers:', serviceParams);

		ldapConn = Ldap({
		    service_id: serviceParams.id,
		    service_type: serviceParams.type,
		    available: [],
		    onaddusers: setExternalUsers,
		    members: extensions
		})

		ldapConn.getExternalUsers();

	    // if((serviceParams.type & 1 !== 0) || (serviceParams.types & 1 !== 0)) {
	    // } else {
	    //     json_rpc_async('getExternalUsers', { service_id: serviceParams.id }, function(result) {
	    //         console.log('getExternalUsers result: ', result);
	    //         if(result) PbxObject.LdapConnection.showUsers(result);
	    //     });
	    // }
	}

	function setExternalUsers(users){

	    console.log('setExternalUsers: ', users);

	    if(!users.length) return;

	    show_loading_panel();

	    ldapConn.setExternalUsers({
	        service_id: ldapConn.options.service_id,
	        users: users
	    }, function(result) {
	        console.log('addLdapUsers result: ', result);
	        ldapConn.close();
			if(result === 'OK') set_object_success();
	        // refreshUsersTable(function(availableUsers){
	        //     ldapConn.options.available = availableUsers;
	        // });
	    });
	}

	function saveOptions(serviceOptions) {
		console.log('saveOptions: ', serviceOptions);
		// var params = {
		// 	method: "setSubscription",
		// 	params: serviceOptions
		// 	// services: Array.isArray(serviceOptions) ? serviceOptions : [serviceOptions]
		// };

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
			} else {
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
		    onImportUsers: getExternalUsers,
		    ldap: ldap
		};

		ReactDOM.render(ServicesComponent(componentParams), document.getElementById('el-loaded-content'));

		if(serviceParams && serviceParams.id && getQueryParams().success === 1) {
			getExternalUsers(serviceParams);
		}

		show_content();
	}

}
function load_services() {

	var services = [];
	var ldap = null;
	var extensions = [];
	var ldapConn = {};
	var serviceParams = window.sessionStorage.serviceParams;
	var config = [];
	var businessIntegrations = ['Azure', 'Zapier'];
	var premiumIntegrations = ['DynamicsCRMOnline', 'MicrosoftAD'];

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			
			config = result.config;
			services = filterServices(result.services, config);

			if(isBranchPackage('premium')) {
				ldap = {};
				ldap.props = result.ldap || {};
				ldap.name = 'Microsoft Active Directory';
				ldap.id = 'MicrosoftAD';
				ldap.types = 1;
			}

			getExtensions(['phone', 'user'], function(result) {
				extensions = result;

		    	render();
			})
				
		});

	}

	function getExternalUsers(serviceParams){

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

	    if(!users.length) return;

	    show_loading_panel();

	    ldapConn.setExternalUsers({
	        service_id: ldapConn.options.service_id,
	        users: users
	    }, function(result) {
	        ldapConn.close();
			if(result === 'OK') set_object_success();
	        // refreshUsersTable(function(availableUsers){
	        //     ldapConn.options.available = availableUsers;
	        // });
	    });
	}

	function saveOptions(serviceOptions) {
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

				render();
			}

		});

		// json_rpc_async('setPbxOptions', params, function() {
		// 	services = services.map(function(item) {
		// 		if(item.id === serviceOptions.id) 
		// 			item = serviceOptions;

		// 		return item;
		// 	});


		// 	render();
		// 	set_object_success();
		// });
	}

	function saveLdapOptions(newOptions) {
		json_rpc_async('setPbxOptions', { ldap: newOptions.props }, function() {
			ldap = newOptions;

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

	function filterServices(array, config) {
		var restrictList = isBranchPackage('team') ? businessIntegrations.join(premiumIntegrations) : ((isBranchPackage('business') || isBranchPackage('trial')) ? premiumIntegrations : [] );
		return array.filter(function(item) {
			return restrictList.indexOf(item.id) === -1;
		})
	}

}
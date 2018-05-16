function load_services() {

	var services = [];
	var ldap = {};

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			ldap.props = result.ldap || {};
			ldap.name = 'Microsoft Active Directory';
			ldap.id = 'MicrosoftAD';

			services = result.services;

	    	render();
	    	close_options();
		});

	}

	function saveOptions(serviceOptions) {
		console.log('saveOptions: ', serviceOptions);
		var params = {
			method: "setSubscription",
			params: serviceOptions
			// services: Array.isArray(serviceOptions) ? serviceOptions : [serviceOptions]
		};

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
			} else if(response.result.status === 200) {
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
		    ldap: ldap
		};

		ReactDOM.render(ServicesComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
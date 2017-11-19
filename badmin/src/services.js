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

	function saveOptions(newOptions) {
		console.log('saveOptions: ', newOptions);
		var params = {
			services: Array.isArray(newOptions) ? newOptions : [newOptions]
		};

		json_rpc_async('setPbxOptions', params, function() {
			services = services.map(function(item) {
				if(item.id === newOptions.id) 
					item = newOptions;

				return item;
			});

			console.log('saveOptions saved: ', services);

			render();
			set_object_success();
		});
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
function renderSidebar(params) {

	var profile = PbxObject.profile;
	var config = PbxObject.options.config || [];
	var branchMode = getInstanceMode();

	_init(params);


	function hasConfig(item) {
		return isBranchPackage(item);
	}

	function _getMenuItems() {
	    var menuItems = [
	        {
	            name: 'dashboard',
	            iconClass: 'fa fa-fw fa-pie-chart',
				objects: [
					{ kind: 'guide', iconClass: 'fa fa-fw fa-arrow-circle-o-right', standout: true }, 
					{ kind: 'realtime', iconClass: 'fa fa-fw fa-tachometer' }, 
					{ kind: 'records', iconClass: 'fa fa-fw fa-phone' }, 
					{ kind: 'statistics', iconClass: 'fa fa-fw fa-table' }, 
					{ kind: 'channel_statistics', iconClass: 'fa fa-fw fa-area-chart' }, 
					{ kind: 'extensions', iconClass: 'icon-uniE908' },
					{ kind: 'reg_history', iconClass: 'fa fa-fw fa-history' }
				]
	        }, {
	            name: 'users',
	            iconClass: 'icon-contact',
	            // objects: [{ kind: 'extensions' }],
	            type: "group",
	            // shouldRender: !hasConfig('no-users'),
	            fetchKinds: ['users']
	        }, {
	            name: 'equipment',
	            iconClass: 'icon-landline',
	            type: "group",
	            fetchKinds: ['equipment']
	        }, {
	            name: 'servicegroup',
	            iconClass: 'icon-headset_mic',
	            type: "group",
	            // iconClass: 'fa fa-fw fa-users',
	            fetchKinds: ['hunting', (hasConfig('team') ? '' : 'icd'), (hasConfig('team') ? '' : 'chatchannel')]
	            // fetchKinds: ['hunting', 'icd', 'chatchannel', 'selector']
	        }, {
	            name: 'chattrunk',
	            iconClass: 'icon-perm_phone_msg',
	            shouldRender: !hasConfig('team'),
	            fetchKinds: ['chattrunk']
	        }, {
	            name: 'trunk',
	            iconClass: 'icon-dialer_sip',
	            fetchKinds: ['trunk']
	        }, {
	            name: 'attendant',
	            iconClass: 'fa fa-fw fa-sitemap',
	            fetchKinds: ['attendant']
	        }, {
	            name: 'application',
	            iconClass: 'fa fa-fw fa-cubes',
	            shouldRender: hasConfig('enterprise'),
	            fetchKinds: ['application']
	        }, {
	            name: 'timer',
	            iconClass: 'fa fa-fw fa-clock-o',
	            fetchKinds: ['timer']
	        }, {
	            name: 'routes',
	            iconClass: 'fa fa-fw fa-arrows',
	            fetchKinds: ['routes']
	        }, {
	            name: 'location',
	            iconClass: 'fa fa-fw fa-map-marker',
	            shouldRender: hasConfig('enterprise'),
	            fetchKinds: ['location']
	        }, {
	            name: 'settings',
	            shouldRender: false,
	            objects: [
	            	{ kind: 'branch_options', iconClass: 'fa fa-fw fa-sliders' }, 
	            	{ kind: 'rec_settings', iconClass: 'fa fa-fw fa-microphone' }, 
	            	{ kind: 'services', iconClass: 'fa fa-fw fa-plug' }, 
	            	{ kind: 'storages', iconClass: 'fa fa-fw fa-hdd-o' }, 
	            	{ kind: ((branchMode === 0 && !profile.partnerid) ? 'licenses' : ''), iconClass: 'fa fa-fw fa-key' }, 
	            	{ kind: ((branchMode === 0 && !profile.partnerid) ? 'billing' : ''), iconClass: 'fa fa-fw fa-credit-card' }, 
	            	{ kind: 'certificates', iconClass: 'fa fa-fw fa-lock' }, 
	            	{ kind: 'customers', iconClass: 'fa fa-fw fa-users' }
	            ]
	        }
	    ];

	    return menuItems;
	}

	function _getMenuObjects(menu, branchOptions, callback) {
		var objects = [];

		// switch(menu.name) {
		// 	case 'dashboard':
		// 		objects = [{ kind: 'dashboard', iconClass: 'fa fa-fw fa-tachometer' }, { kind: 'realtime', iconClass: 'fa fa-fw fa-heart' }, { kind: 'statistics', iconClass: 'fa fa-fw fa-table' }, { kind: 'channel_statistics', iconClass: 'fa fa-fw fa-area-chart' }, { kind: 'records', iconClass: 'fa fa-fw fa-phone' }, { kind: 'reg_history', iconClass: 'fa fa-fw fa-history' }];
		// 		break;
		// 	case 'settings':
		// 		objects = [{ kind: 'branch_options', iconClass: 'fa fa-fw fa-sliders' }, { kind: 'rec_settings', iconClass: 'fa fa-fw fa-microphone' }, { kind: 'services', iconClass: 'fa fa-fw fa-plug' }, { kind: 'storages', iconClass: 'fa fa-fw fa-hdd-o' }, { kind: ((branchOptions.mode === 0 && !profile.partnerid) ? 'billing' : ''), iconClass: 'fa fa-fw fa-credit-card' }, { kind: 'certificates', iconClass: 'fa fa-fw fa-lock' }, { kind: 'customers', iconClass: 'fa fa-fw fa-users' }];
		// 		break;
		// 	case 'users':
		// 		objects = [{ kind: 'extensions', iconClass: 'fa fa-fw fa-users' }]
		// 	default:
		// 		objects = []
		// }

		if(menu.fetchKinds && menu.fetchKinds.length) {
		    getObjects(menu.fetchKinds, function(result) {
		    	objects = result ? objects.concat(result) : objects;
		    	if(menu.fetchKinds.indexOf('trunk') !== -1) {
		    		objects = objects.filter(function(item) { 
		    			return item.type !== 'service'; 
		    		})
		    	}
		        return callback(objects);
		    });
		} else {
			// switch(menu.name) {
			// 	case 'dashboard':
			// 		objects = [{ kind: 'dashboard', iconClass: 'fa fa-fw fa-tachometer' }, { kind: 'realtime', iconClass: 'fa fa-fw fa-heart' }, { kind: 'statistics', iconClass: 'fa fa-fw fa-table' }, { kind: 'channel_statistics', iconClass: 'fa fa-fw fa-area-chart' }, { kind: 'records', iconClass: 'fa fa-fw fa-phone' }, { kind: 'reg_history', iconClass: 'fa fa-fw fa-history' }];
			// 		break;
			// 	case 'settings':
			// 		objects = [{ kind: 'branch_options', iconClass: 'fa fa-fw fa-sliders' }, { kind: 'rec_settings', iconClass: 'fa fa-fw fa-microphone' }, { kind: 'services', iconClass: 'fa fa-fw fa-plug' }, { kind: 'storages', iconClass: 'fa fa-fw fa-hdd-o' }, { kind: ((branchOptions.mode === 0 && !profile.partnerid) ? 'billing' : ''), iconClass: 'fa fa-fw fa-credit-card' }, { kind: 'certificates', iconClass: 'fa fa-fw fa-lock' }, { kind: 'customers', iconClass: 'fa fa-fw fa-users' }];
			// 		break;
			// 	case 'users':
			// 		objects = [{ kind: 'extensions', iconClass: 'fa fa-fw fa-users' }]
			// 	default:
			// 		objects = []
			// }

			return callback(objects);
		}
	}

	function _getActiveKind(kind) {
	    if(kind.match('hunting|icd|chatchannel|selector')) return 'servicegroup';
	    else if(kind.match('guide|realtime|statistics|channel_statistics|records|extensions|reg_history')) return 'dashboard';
	    else if(kind.match('extensions')) return 'users';
	    else if(kind.match('branch_options|rec_settings|services|storages|licenses|billing|certificates|customers|developer')) return 'settings';
	    else return kind;
	}

	function _selectKind(kind) {
		var newParams = extend({}, params);
		newParams.activeKind = kind;
		newParams.activeItem = params.activeItem || params.activeKind;
		_init(newParams);
	}

	function _init(params) {
	    var menuItems = _getMenuItems();
	    var activeKind = _getActiveKind(params.activeKind);
	    var activeItem = params.activeItem || params.activeKind;
	    var menuParams = menuItems.filter(function(item) { return item.name === activeKind })[0];
	    
	    _getMenuObjects(menuParams, params.branchOptions, function(result) {
	    	componentParams = {
	    	    frases: PbxObject.frases,
	    	    menuItems: menuItems, 
	    	    activeKind: activeKind,
	    	    activeItem: activeItem,
	    	    selectedMenu: menuParams,
	    	    selectKind: _selectKind,
	    	    objects: result
	    	};

	    	ReactDOM.render(SideBarComponent(componentParams), document.getElementById('pbxmenu'));
	    });

	}

}
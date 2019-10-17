function renderSidebar(params) {

	var profile = PbxObject.profile;
	var config = PbxObject.options.config || [];
	var branchMode = getInstanceMode();
	var permsObj = (PbxObject.options.permissions && PbxObject.isUserAccount) ? PbxObject.options.permissions.reduce(function(result, item) { result[item.name] = item.grant; return result; }, {}) : null;

	_init(params);


	function hasConfig(item) {
		return item ? isBranchPackage(item) : false;
	}

	function shouldRender(kind, config) {
		return permsObj ? (config ? (hasConfig(config) && !!permsObj[kind]) : !!permsObj[kind]) : (config ? hasConfig(config) : true);
	}

	function _getMenuItems() {
	    var menuItems = [
	    	{
	            name: 'profile',
	            iconClass: 'fa fa-id-card',
	            link: '#profile',
	            shouldRender: !!PbxObject.isUserAccount
	        }, {
	            name: 'dashboard',
	            iconClass: 'fa fa-fw fa-pie-chart',
	            shouldRender: (shouldRender('statistics') || shouldRender('records') || shouldRender('users') || shouldRender('customers')),
				objects: [
					{ kind: (permsObj ? '' : 'guide'), iconClass: 'fa fa-fw fa-arrow-circle-o-right', standout: true }, 
					{ kind: (shouldRender('trunks') ? 'realtime' : ''), iconClass: 'fa fa-fw fa-tachometer' }, 
					{ kind: (shouldRender('records') ? 'records' : ''), iconClass: 'fa fa-fw fa-phone' }, 
					{ kind: (shouldRender('statistics') ? 'statistics' : ''), iconClass: 'fa fa-fw fa-table' }, 
					{ kind: (shouldRender('statistics') ? 'channel_statistics' : ''), iconClass: 'fa fa-fw fa-area-chart' }, 
					{ kind: (shouldRender('users') || shouldRender('equipment') ? 'extensions' : ''), iconClass: 'icon-uniE908' },
					{ kind: (shouldRender('users') ? 'reg_history' : ''), iconClass: 'fa fa-fw fa-history' },
					{ kind: (shouldRender('customers') ? 'customers' : ''), iconClass: 'fa fa-fw fa-users' }
				]
	        }, {
	            name: 'users',
	            iconClass: 'icon-contact',
	            // objects: [{ kind: 'extensions' }],
	            type: "group",
	            shouldRender: shouldRender('users'),
	            fetchKinds: ['users']
	        }, {
	            name: 'equipment',
	            iconClass: 'icon-landline',
	            type: "group",
	            shouldRender: shouldRender('equipment'),
	            fetchKinds: ['equipment']
	        }, {
	            name: 'servicegroup',
	            iconClass: 'icon-headset_mic',
	            type: "group",
	            // iconClass: 'fa fa-fw fa-users',
	            fetchKinds: ['hunting', (hasConfig('team') ? '' : 'icd'), (hasConfig('team') ? '' : 'chatchannel')],
	            shouldRender: shouldRender('chatchannel'),
	            // fetchKinds: ['hunting', 'icd', 'chatchannel', 'selector']
	        }, {
	            name: 'chattrunk',
	            iconClass: 'icon-perm_phone_msg',
	            // shouldRender: !hasConfig('team'),
	            shouldRender: shouldRender('chattrunk', 'free|trial|business|enterprise'),
	            fetchKinds: ['chattrunk']
	        }, {
	            name: 'trunk',
	            iconClass: 'icon-dialer_sip',
	            shouldRender: shouldRender('trunk'),
	            fetchKinds: ['trunk']
	        }, {
	            name: 'attendant',
	            iconClass: 'fa fa-fw fa-sitemap',
	            shouldRender: shouldRender('attendant'),
	            fetchKinds: ['attendant']
	        }, {
	            name: 'application',
	            iconClass: 'fa fa-fw fa-cubes',
	            // shouldRender: hasConfig('enterprise'),
	            shouldRender: shouldRender('application', 'enterprise'),
	            fetchKinds: ['application']
	        }, {
	            name: 'timer',
	            iconClass: 'fa fa-fw fa-clock-o',
	            shouldRender: shouldRender('timer'),
	            fetchKinds: ['timer']
	        }, {
	            name: 'routes',
	            iconClass: 'fa fa-fw fa-arrows',
	            shouldRender: shouldRender('routes'),
	            fetchKinds: ['routes']
	        }, {
	            name: 'location',
	            iconClass: 'fa fa-fw fa-map-marker',
	            shouldRender: shouldRender('location', 'enterprise'),
	            // shouldRender: hasConfig('enterprise'),
	            fetchKinds: ['location']
	        }
	    ];

	    if(!permsObj) {
	    	menuItems = menuItems.concat([{
	    		name: 'settings',
	    		shouldRender: false,
	    		objects: [
	    			{ kind: 'branch_options', iconClass: 'fa fa-fw fa-sliders' }, 
	    			{ kind: 'rec_settings', iconClass: 'fa fa-fw fa-microphone' }, 
	    			{ kind: 'services', iconClass: 'fa fa-fw fa-plug' }, 
	    			{ kind: 'storages', iconClass: 'fa fa-fw fa-hdd-o' }, 
	    			{ kind: ((branchMode === 0 && !profile.partnerid) ? 'licenses' : ''), iconClass: 'fa fa-fw fa-key' }, 
	    			{ kind: ((branchMode === 0 && !profile.partnerid) ? 'billing' : ''), iconClass: 'fa fa-fw fa-credit-card' }, 
	    			{ kind: 'certificates', iconClass: 'fa fa-fw fa-lock' }
	    		]
	    	}])
	    }

	    return menuItems;
	}

	function _getMenuObjects(menu, branchOptions, callback) {
		var objects = [];

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
			return callback(objects);
		}
	}

	function _getActiveKind(kind) {
	    if(kind.match('hunting|icd|chatchannel|selector')) return 'servicegroup';
	    else if(kind.match('guide|realtime|statistics|channel_statistics|records|extensions|reg_history|customers')) return 'dashboard';
	    else if(kind.match('extensions')) return 'users';
	    else if(kind.match('branch_options|rec_settings|services|storages|licenses|billing|certificates|developer')) return 'settings';
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
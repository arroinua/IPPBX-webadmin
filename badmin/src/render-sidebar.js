function renderSidebar(params) {

	_init(params);

	function _getMenuItems() {
	    var menuItems = [
	        {
	            name: 'dashboard',
	            iconClass: 'fa fa-fw fa-pie-chart'
	        }, {
	            name: 'users',
	            iconClass: 'fa fa-fw fa-users',
	            fetchKinds: ['users']
	        }, {
	            name: 'chattrunk',
	            iconClass: 'fa fa-fw fa-whatsapp',
	            fetchKinds: ['chattrunk']
	        }, {
	            name: 'servicegroup',
	            iconClass: 'fa fa-fw fa-comments-o',
	            fetchKinds: ['hunting', 'icd', 'chatchannel']
	        }, {
	            name: 'attendant',
	            iconClass: 'icon-room_service',
	            fetchKinds: ['attendant']
	        }, {
	            name: 'trunk',
	            iconClass: 'fa fa-fw fa-cloud',
	            fetchKinds: ['trunk']
	        }, {
	            name: 'equipment',
	            iconClass: 'fa fa-fw fa-fax',
	            fetchKinds: ['equipment']
	        }, {
	            name: 'timer',
	            iconClass: 'fa fa-fw fa-calendar',
	            fetchKinds: ['timer']
	        }, {
	            name: 'routes',
	            iconClass: 'fa fa-fw fa-arrows',
	            fetchKinds: ['routes']
	        }, {
	            name: 'settings',
	            shouldRender: false
	        }
	    ];

	    return menuItems;
	}

	function _getMenuObjects(menu, branchOptions, callback) {
		var objects = [];

		if(menu.fetchKinds && menu.fetchKinds.length) {
		    window.getObjects(menu.fetchKinds, function(result) {
		    	objects = result || [];
		        return callback(objects);
		    });
		} else {
			switch(menu.name) {
				case 'dashboard':
					objects = [{ kind: 'dashboard', iconClass: 'fa fa-fw fa-tachometer' }, { kind: 'statistics', iconClass: 'fa fa-fw fa-table' }, { kind: 'channel_statistics', iconClass: 'fa fa-fw fa-area-chart' }, { kind: 'records', iconClass: 'fa fa-fw fa-phone' }, { kind: 'reg_history', iconClass: 'fa fa-fw fa-history' }];
					break;
				case 'settings':
					objects = [{ kind: 'branch_options', iconClass: 'fa fa-fw fa-sliders' }, { kind: 'rec_settings', iconClass: 'fa fa-fw fa-microphone' }, { kind: 'services', iconClass: 'fa fa-fw fa-plug' }, { kind: 'storages', iconClass: 'fa fa-fw fa-hdd-o' }, { kind: (branchOptions.mode === 0 ? 'billing' : ''), iconClass: 'fa fa-fw fa-credit-card' }, { kind: 'certificates', iconClass: 'fa fa-fw fa-lock' }, { kind: 'customers', iconClass: 'fa fa-fw fa-users' }];
					break;
				default:
					objects = []
			}

			return callback(objects);
		}
	}

	function _getActiveKind(kind) {
	    if(kind.match('hunting|icd|chatchannel')) return 'servicegroup';
	    else if(kind.match('statistics|channel_statistics|records|reg_history')) return 'dashboard';
	    else if(kind.match('branch_options|rec_settings|services|storages|billing|certificates|customers')) return 'settings';
	    else return kind;
	}

	function _selectKind(kind) {
		var newParams = extend({}, params);
		newParams.activeKind = kind;
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
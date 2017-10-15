function load_chattrunk(params) {

	console.log('load_chat_trunk: ', PbxObject.kind, params);
	var initParams = params;
	var handler = null;
	var type = params.type || 'FacebookMessenger';
	var routes = [];
	var services = [{
		id: 'FacebookMessenger',
		name: "Messenger",
		icon: '/badmin/images/facebook_messenger.png',
		params: {
			appId: '1920629758202993'
		}
	}
	// {
	// 	id: 'Facebook',
	// 	name: "Facebook",
	// 	icon: '/badmin/images/facebook.png',
	// 	params: {
	// 		appId: '1920629758202993'
	// 	}
		
	// },{
	// 	id: 'Twitter',
	// 	name: "Twitter",
	// 	icon: '/badmin/images/twitter.png',
	// 	params: {
	// 		oauth_consumer_key: 'RBk2sDm5bYowCA7mLttioe4BC',
	// 		oauth_nonce: 'ASLAfjiaFOIJFIFJfnfnoie399'+Date.now()
	// 	}
	// },{
	// 	id: 'Viber',
	// 	name: "Viber",
	// 	icon: '/badmin/images/viber.ico'
	// }
	];

	params.sessiontimeout = (params.sessiontimeout || 86400*7)/60;
	params.replytimeout = (params.replytimeout || 86400)/60;

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	init();
    set_page();

	function init() {
		getObjects('chatchannel', function(result) {
			console.log('getObjects: ', result);
			routes = result || [];

			render();
			// initServices(type);

		});
	}

	function onStateChange(state) {
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result) {
		    console.log('onStateChange: ', state, result);
		});
	}

	function setObject(params, cb) {

	    if(!params.pageid) return console.error('pageid is not defined');

	    show_loading_panel();

	    var props = {
	    	kind: PbxObject.kind,
	    	oid: params.oid,
	    	name: params.name,
	    	enabled: params.enabled || true,
	    	type: params.type,
	    	pageid: params.pageid,
	    	pagename: params.pagename,
	    	sessiontimeout: parseFloat(params.sessiontimeout)*60,
	    	replytimeout: parseFloat(params.replytimeout)*60,
	    	// properties: params.properties,
	    	routes: params.routes
	    };

	    if(PbxObject.name) {
	    	handler = set_object_success;
	    } else {
	    	props.properties = params.properties;
	    }

    	json_rpc_async('setObject', props, function(result) {
    		PbxObject.name = params.name;
    		if(handler) handler();
    		if(cb) cb(null, result);
    		show_content();
    	});
	}

	function removeObject(params) {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
	}

	// function render(serviceParams) {
	function render() {
		var componentParams = {
			type: type,
			services: services,
			// onServiceChange: onServiceChange,
			frases: PbxObject.frases,
		    params: params,
		    // serviceParams: serviceParams,
		    routes: routes,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    removeObject: removeObject
		};

		console.log('render: ', componentParams);

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
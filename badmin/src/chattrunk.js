function load_chattrunk(params) {

	console.log('load_chat_trunk: ', params);
	var initParams = params;
	var handler = null;
	var type = params.type || 'FacebookMessenger';
	var routes = [];
	var serviceParams = {
		loginHandler: null,
		pages: null, // Facebook & Messenger
		userAccessToken: null // Facebook & Messenger
	};
	var servicesOptions = {
		facebook: {
			appId: '1920629758202993'
		},
		twitter: {
			oauth_consumer_key: 'RBk2sDm5bYowCA7mLttioe4BC',
			oauth_nonce: 'ASLAfjiaFOIJFIFJfnfnoie399'+Date.now()
		}
	};
	var services = [{
		id: 'Facebook',
		name: "Facebook",
		icon: 'fa fa-fw fa-facebook'
	},{
		id: 'Twitter',
		name: "Twitter",
		icon: 'fa fa-fw fa-twitter'
	}];

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

			initServices(type);

		});
	}

	function initServices(type) {
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			console.log('initServices '+ type);
			serviceParams.loginHandler = fbLogin;
			initFB();
		} else if(type === 'Twitter') {
			console.log('initServices '+ type);
			serviceParams.loginHandler = fbLogin;
			initTwitter();
		}
	}

	function initTwitter() {
		console.log('initTwitter');
	}

	function initFB() {
		if(window.FB === undefined) {
			getFbSDK(function() {
				FB.init({
					appId: servicesOptions.facebook.appId,
					autoLogAppEvents: true,
					status: true,
					version: 'v2.9'
				});     
				FB.getLoginStatus(updateStatusCallback);
			});
		} else {
			FB.getLoginStatus(updateStatusCallback);
		}
	}

	function updateStatusCallback(result) {
		console.log('updateStatusCallback: ', result);
		if(result.status === 'connected') {
			
			serviceParams.userAccessToken = result.authResponse.accessToken;

			getFbPages(function(pages) {
				serviceParams.pages = pages;
				if(!params.properties.id) {
					params.properties = pages[0];
					params.properties.access_token = serviceParams.userAccessToken;
				}
				render(serviceParams);
			});
		} else {
			render(serviceParams);
		}
	}

	function getFbPages(cb) {
		FB.api('/me/accounts', function(response) {
			console.log('getFbPages: ', response);
			if(cb) cb(response.data || null); 
		});
	}

	// function subToFbPage(params, cb) {
	// 	FB.api('/'+params.id+'/subscribed_apps', 'post', { access_token: params.access_token }, function(response) {
	// 		console.log('subscribeToApp response: ', response);
	// 		if(cb) cb(response.error, response);
	// 	});
	// }

	// function getPageProps(pages, id) {
	// 	var props = {};
	// 	pages.forEach(function(item) {
	// 		if(item.id === id) { props = item; }
	// 	});
	// 	return props;
	// }

	function fbLogin() {
		FB.login(function(response) {
			console.log('FB.login: ', response);
			updateStatusCallback(response);
		}, {scope: 'email, manage_pages, read_page_mailboxes, pages_messaging'});
	}

	function getFbSDK(cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);

	}

	function onStateChange(state) {
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result) {
		    console.log('onStateChange: ', state, result);
		});
	}

	// function setService(params, cb) {

	// 	console.log('setService params', params);
	// 	if(PbxObject.name) return cb();

	//     if(type === 'FacebookMessenger' || type === 'Facebook') {
	// 	    subToFbPage(params, function(err, response) {
	// 			if(err || !response.success) return cb(err || ("Page wasn't subscribed. Status: "+response.status));
	// 			cb(null, response);
	//     	});
	//     } else {
	//     	cb();
	//     }
		
	// }
	
	function onServiceChange(serviceType) {
		initServices(serviceType);
	}

	function setObject(params, cb) {

	    if(!params.pageid) return console.error('pageid is not defined');
	    var props = {
	    	kind: PbxObject.kind,
	    	oid: params.oid,
	    	name: params.name,
	    	enabled: params.enabled || true,
	    	type: type,
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

	    // setService(params.properties, function(err, response) {
	    // 	if(err) return notify_about('error', err);
	    	
	    	json_rpc_async('setObject', props, function(result) {
	    		if(handler) handler();
	    		if(cb) cb(null, result);
	    	});
	    // });		
	}

	// function removeService(params, cb) {
	// 	console.log('removeService: ', params);
	// 	if(type === 'FacebookMessenger' || type === 'Facebook') {
	// 		var access_token = getPageProps(serviceParams.pages, params.id).access_token;

	// 		FB.api('/'+params.id+'/subscribed_apps', 'delete', { access_token: access_token }, function(response) {
	// 			console.log('Unsubscribe app response: ', response);
	// 			if(response.error || !response.success) {
	// 				return cb(response.error || { message: ('Unsubscribe failed. Reason: '+response.status) });
	// 			}
	// 			cb(null, response);
	// 		});
	// 	}
	// }

	function removeObject(params) {
		// if(params.pageid) {
		// 	if (confirm(PbxObject.frases.DODELETE+' '+params.name+'?')){
		// 		removeService(params.properties, function(err, response) {
		// 			if(err) return notify_about('error', err.message);
		// 			delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
		// 		});
		// 	}
		// } else {
			delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid);
		// }
	}

	function render(serviceParams) {
		var componentParams = {
			type: type,
			services: services,
			onServiceChange: onServiceChange,
			frases: PbxObject.frases,
		    params: params,
		    serviceParams: serviceParams,
		    routes: routes,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    removeObject: removeObject
		};

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
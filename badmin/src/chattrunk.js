function load_chattrunk(params) {

	console.log('load_chat_trunk: ', PbxObject.kind, params);
	var initParams = params;
	var handler = null;
	var type = params.type || 'FacebookMessenger';
	// var routes = [];
	var services = [{
		id: 'FacebookMessenger',
		name: "Messenger",
		icon: '/badmin/images/channels/fm.png',
		params: {
			appId: '1920629758202993'
		},
		component: FacebookTrunkComponent
	}, {
		id: 'Email',
		name: "Email",
		icon: '/badmin/images/channels/email.png',
		providers: {
			gmail: {
				protocol: 'imap',
				hostname: 'imap.gmail.com',
				port: 993,
				usessl: true
			},
			outlook: {
				protocol: 'imap',
				hostname: 'imap-mail.outlook.com',
				port: 993,
				usessl: true
			},
			office365: {
				protocol: 'imap',
				hostname: 'outlook.office365.com',
				port: 993,
				usessl: true
			},
			icloud: {
				protocol: 'imap',
				hostname: 'imap.mail.me.com',
				port: 993,
				usessl: true
			},
			aol: {
				protocol: 'imap',
				hostname: 'imap.aol.com',
				port: 993,
				usessl: true
			},
			yahoo: {
				protocol: 'imap',
				hostname: 'imap.mail.yahoo.com',
				port: 993,
				usessl: true
			}
		},
		component: EmailTrunkComponent
	}, {
		id: 'Viber',
		name: "Viber",
		icon: '/badmin/images/channels/viber.ico',
		component: ViberTrunkComponent
	}, {
		id: 'Telephony',
		name: 'Number',
		icon: '/badmin/images/channels/did.png',
		component: DidTrunkComponent
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
	];

	var modalCont = document.getElementById('create-service-group');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "create-service-group";
		document.body.appendChild(modalCont);
	}

	params.sessiontimeout = (params.sessiontimeout || 86400*7)/60;
	params.replytimeout = (params.replytimeout || 3600)/60;

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	// init();
    set_page();
    render();


	// function init() {
	// 	getObjects('chatchannel', function(result) {
	// 		console.log('getObjects: ', result);
	// 		routes = result || [];

	// 		render();
	// 		// initServices(type);

	// 	});
	// }

	function onStateChange(state, callback) {
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result, err) {
		    console.log('onStateChange: ', state, result, err);
		    if(callback) callback(err, result);
		});
	}

	function setObject(params, cb) {

		console.log('setObject: ', params);

	    // if(!params.pageid) return console.error('pageid is not defined');

	    show_loading_panel();

	    var props = {
	    	kind: PbxObject.kind,
	    	oid: params.oid,
	    	name: params.name,
	    	directref: params.directref || true,
	    	enabled: params.enabled || true,
	    	type: params.type,
	    	pagename: params.pagename,
	    	sessiontimeout: parseFloat(params.sessiontimeout)*60,
	    	replytimeout: parseFloat(params.replytimeout)*60,
	    	// properties: params.properties,
	    	routes: params.routes
	    };

	    if(params.pageid) props.pageid = params.pageid;

	    if(PbxObject.name) {
	    	handler = set_object_success;
	    } else {
	    	if(Object.keys(params.properties).length) props.properties = params.properties;
	    	else return console.error('Properties are empty');
	    }

    	json_rpc_async('setObject', props, function(result, err) {
    		if(err) {
    			notify_about('error', err.message);
    			cb(err);
    			return;
    		}

    		PbxObject.name = params.name;
    		if(handler) handler();
    		if(cb) cb(null, result);
    		show_content();
    	});
	}

	function confirmRemoveObject(type, callback) {
		var props = {
			frases: PbxObject.frases,
			name: PbxObject.name,
			warning: type === 'Telephony' ? "By deleting the channel the number assigned to it will be also deleted." : null,
			onSubmit: callback
		};

		ReactDOM.render(DeleteObjectModalComponent(props), modalCont);
	}

	function removeObject(type, params) {
		console.log('removeObject: ', type, params);

		confirmRemoveObject(type, function() {
			
			if(type === 'Telephony') {
				billingRequest('unassignDid', { number: params.number }, function(err, response) {
					console.log('unassignDid: ', response);
				});
			}

			delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
		});
	}

	function createGroup(type) {
		var componentParams = {
			type: type,
			frases: PbxObject.frases,
			onSubmit: function(params) {
				console.log('createGroup: ', params);
			}
		};

		ReactDOM.render(CreateGroupModalComponent(componentParams), modalCont);
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
		    // routes: routes,
		    createGroup: createGroup,
		    getObjects: getObjects,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    removeObject: removeObject
		};

		console.log('render: ', componentParams);

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_chattrunk(params) {

	console.log('load_chat_trunk: ', PbxObject.kind, params);
	var initParams = params;
	var handler = null;
	var type = params.type || 'FacebookMessenger';
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

	PbxObject.oid = params.oid;
	PbxObject.name = params.name;

	params.sessiontimeout = (params.sessiontimeout || 86400*7);
	params.replytimeout = (params.replytimeout || 3600);

    set_page();
    render(type, params);

	function onStateChange(state, callback) {
		if(!PbxObject.name) return;
		setObjectState(PbxObject.oid, state, function(result, err) {
		    console.log('onStateChange: ', state, result, err);
		    if(callback) callback(err, result);
		});
	}

	function setObject(params, cb) {

		console.log('setObject: ', params);

	    show_loading_panel();

	    params.directref = true;

		json_rpc_async('setObject', params, function(result, err) {
			if(err) {
				return notify_about('error', err.message);
			}

			if(PbxObject.name) {
				set_object_success();
			} else {
				PbxObject.name = params.name;
			}

			render(params.type, params);
			remove_loading_panel();
		});
    	
	}

	function confirmRemoveObject(type, callback) {
		var props = {
			frases: PbxObject.frases,
			name: PbxObject.name,
			warning: (type === 'Telephony' ? 
				PbxObject.frases.CHAT_TRUNK.DID.DELETE_SIP_CHANNEL_MSG 
				: PbxObject.frases.CHAT_TRUNK.DID.DELETE_OTHER_CHANNEL_MSG
			),
			onSubmit: callback
		};

		ReactDOM.render(DeleteObjectModalComponent(props), modalCont);
	}

	function updateBalance(params, callback) {
		PbxObject.stripeHandler.open({
			// name: 'Ringotel',
			// zipCode: true,
			// locale: 'auto',
			panelLabel: "Pay",
			allowRememberMe: false,
			// currency: params.currency,
			amount: params.chargeAmount*100,
			closed: function(result) {
				console.log('updateBalance closed: ', result, PbxObject.stripeToken);

				if(!PbxObject.stripeToken) return;

				var reqParams = {
					currency: params.currency,
					amount: params.chargeAmount,
					description: 'Update balance',
					token: PbxObject.stripeToken.id
				};

				show_loading_panel();

				billingRequest('updateBalance', reqParams, function(err, response) {

					console.log('updateBalance: ', err, response);

					remove_loading_panel();

					if(err) {
						notify_about('error', err.message);
					} else {

						if(callback) callback(params);

						PbxObject.stripeToken = null;		

					}	

				});

			}
		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
	}

	function render(type, params) {
		var componentParams = {
			type: type,
			services: services,
			frases: PbxObject.frases,
		    params: params,
		    getObjects: getObjects,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    updateBalance: updateBalance,
		    confirmRemoveObject: confirmRemoveObject,
		    removeObject: removeObject
		};

		console.log('render: ', componentParams);

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
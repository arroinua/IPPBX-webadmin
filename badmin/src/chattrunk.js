function load_chattrunk(params) {

	console.log('load_chat_trunk: ', PbxObject.kind, params);
	console.log('window parent: ', window.opener);
	console.log('window onTokenReceived: ', window.onTokenReceived);
	var frases = PbxObject.frases;
	var driver = new Driver({
		nextBtnText: frases.GET_STARTED.STEPS.NEXT_BTN,
		prevBtnText: frases.GET_STARTED.STEPS.PREV_BTN,
		doneBtnText: frases.GET_STARTED.STEPS.DONE_BTN,
		closeBtnText: frases.GET_STARTED.STEPS.CLOSE_BTN
	});
	var driverSteps = [];
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
		id: 'Telegram',
		name: "Telegram",
		icon: '/badmin/images/channels/telegram.png',
		component: TelegramTrunkComponent
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

	var query = window.location.href;
	var search = query.indexOf('?') !== -1 ? query.substring(query.indexOf('?')+1) : null;
	var queryParams = getQueryParams(search);
	var selectedService = queryParams.channel;
	var userAccessToken = search ? queryParams.access_token : null;

	if(window.opener && window.onTokenReceived) {
		return window.onTokenReceived(userAccessToken);
	} else if(userAccessToken) {
		services = services.map(function(item) {
			console.log('load_chattrunk services:', item);
			if(item.id === 'FacebookMessenger') item.params.userAccessToken = userAccessToken;
			// if(item.id === 'FacebookMessenger') item.params.userAccessToken = PbxObject.userAccessToken;
			return item;
		});
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
		
		driver.reset();

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

				BillingApi.updateBalance(reqParams, function(err, response) {

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

	function confirmPayment(params, callback) {
		console.log('confirmPayment params:', params);
		showModal('confirm_payment_modal', { frases: PbxObject.frases, payment: params }, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			callback(params);

		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
	}

	function addSteps(stepParams) {
		driverSteps = driverSteps.concat(stepParams);
	}

	function nextStep(stepParams) {
		driver.moveNext();
	}

	function highlightStep(stepParams) {
		driver.highlight(stepParams);
	}

	function initSteps() {
		if(!PbxObject.tourStarted) return;

		driverSteps.push({
			element: '.object-name-cont .btn-success',
			popover: {
				title: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].TITLE,
				description: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].DESC,
				position: 'bottom'
			}
		});

		setTimeout(function() {
			console.log('initSteps: ', driverSteps);
			driver.defineSteps(driverSteps);
			driver.start();
		}, 500);
	}

	function onTokenReceived(token) {
		PbxObject.userAccessToken = token;
	}

	function render(type, params) {
		var componentParams = {
			type: type,
			services: services,
			frases: PbxObject.frases,
		    params: params,
		    selected: selectedService,
		    getObjects: getObjects,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    updateBalance: updateBalance,
		    confirmRemoveObject: confirmRemoveObject,
		    removeObject: removeObject,
		    confirmPayment: confirmPayment,
		    initSteps: initSteps,
		    addSteps: addSteps,
		    nextStep: nextStep,
		    highlightStep: highlightStep,
		    onTokenReceived: onTokenReceived
		};

		console.log('render: ', componentParams);

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
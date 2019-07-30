function load_chattrunk(params) {

	var queryParams = getQueryParams();
	var frases = PbxObject.frases;
	var initParams = params;
	var handler = null;
	var type = params.type || 'Telephony';
	var services = [
	{
		id: 'Telephony',
		name: frases.CHAT_TRUNK.DID.SERVICE_NAME,
		icon: '/badmin/images/channels/did.png',
		component: DidTrunkComponent
	}, {
		id: 'FacebookMessenger',
		name: frases.CHAT_TRUNK.FACEBOOK.SERVICE_NAME,
		icon: '/badmin/images/channels/facebook.png',
		params: {
			appId: '1920629758202993',
			redirectUri: 'https://main.ringotel.net/chatbot/FacebookMessenger'
		},
		component: FacebookTrunkComponent
	// }, {
	// 	id: 'Instagram',
	// 	name: "Instagram",
	// 	icon: '/badmin/images/channels/instagram.png',
	// 	params: {
	// 		// appId: '507766126349295',
	// 		appId: '1920629758202993',
	// 		// redirectUri: 'https://m2.ringotel.net/chatbot/FacebookMessenger'
	// 		redirectUri: 'https://main.ringotel.net/chatbot/FacebookMessenger'
	// 	},
	// 	component: InstagramTrunkComponent
	}, {
		id: 'Email',
		name: frases.CHAT_TRUNK.EMAIL.SERVICE_NAME,
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
		id: 'WebChat',
		name: frases.CHAT_TRUNK.WEBCHAT.SERVICE_NAME,
		icon: '/badmin/images/channels/webchat.png',
		component: WebchatTrunkComponent
	}, {
		id: 'Webcall',
		name: frases.CHAT_TRUNK.WEBCALL.SERVICE_NAME,
		icon: '/badmin/images/channels/webchat.png',
		component: WebcallTrunkComponent
	}
	// ,{
	// 	id: 'Twitter',
	// 	name: "Twitter",
	// 	icon: '/badmin/images/twitter.png',
	// 	params: {
	// 		oauth_consumer_key: 'RBk2sDm5bYowCA7mLttioe4BC',
	// 		oauth_nonce: 'ASLAfjiaFOIJFIFJfnfnoie399'+Date.now()
	// 	}
	];

	var userAccessToken = (getQueryParams().access_token || getQueryParams(window.location.hash.substr(window.location.hash.indexOf('?'))).access_token) || null;
	var onTokenReceived = null;

	try {
		onTokenReceived = (window.opener && window.opener.onTokenReceived) ? window.opener.onTokenReceived : null;
	} catch(error) {
		onTokenReceived = null;
	}

	if(onTokenReceived) {
		return onTokenReceived(userAccessToken);
	} else if(userAccessToken) {
		services = services.map(function(item) {
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
		    if(callback) callback(err, result);
		});
	}

	function setObject(params, cb) {

		// driver.reset();

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
				if(params.oid) {
					getPageid(params, function(result) {
						if(result.pageid) {
							render(result.type, result);
						}
					});
				}

			}

			render(params.type, params);
			remove_loading_panel();

		});
    	
	}

	function getPageid(params, callback) {
		json_rpc_async('getObject', { oid: params.oid }, callback);
	}

	function confirmRemoveObject(type, callback) {
		var modalCont = document.getElementById('modal-cont');
		var props = {
			frases: PbxObject.frases,
			name: PbxObject.name,
			warning: (type === 'Telephony' ? 
				PbxObject.frases.CHAT_TRUNK.DID.DELETE_SIP_CHANNEL_MSG 
				: PbxObject.frases.CHAT_TRUNK.DID.DELETE_OTHER_CHANNEL_MSG
			),
			onSubmit: callback
		};

		if(!modalCont) {
			modalCont = document.createElement('div');
			modalCont.id = "modal-cont";
			document.body.appendChild(modalCont);
		}

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

				if(!PbxObject.stripeToken) return;

				var reqParams = {
					currency: params.currency,
					amount: params.chargeAmount,
					description: 'Update balance',
					token: PbxObject.stripeToken.id
				};

				show_loading_panel();

				BillingApi.updateBalance(reqParams, function(err, response) {

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
		showModal('confirm_payment_modal', { frases: PbxObject.frases, payment: params }, function(result, modal) {

			$(modal).modal('toggle');

			callback(params);

		});
	}

	function removeObject() {
		delete_object(PbxObject.name, PbxObject.kind, PbxObject.oid, true);
	}

	// function addSteps(stepParams) {
	// 	driverSteps = driverSteps.concat(stepParams);
	// }

	// function nextStep(stepParams) {
	// 	driver.moveNext();
	// }

	// function highlightStep(stepParams) {
	// 	driver.highlight(stepParams);
	// }

	// function initSteps() {
	// 	if(!PbxObject.tourStarted) return;

	// 	driverSteps.push({
	// 		element: '.object-name-cont .btn-success',
	// 		popover: {
	// 			title: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].TITLE,
	// 			description: PbxObject.frases.GET_STARTED.STEPS.OBJECT_NAME["2"].DESC,
	// 			position: 'bottom'
	// 		}
	// 	});

	// 	setTimeout(function() {
	// 		driver.defineSteps(driverSteps);
	// 		driver.start();
	// 	}, 500);
	// }

	// function onTokenReceived(token) {
	// 	PbxObject.userAccessToken = token;
	// }

	function render(type, params) {
		var componentParams = {
			type: type,
			services: services,
			frases: PbxObject.frases,
		    params: params,
		    selected: queryParams.channel,
		    getObjects: getObjects,
		    onStateChange: onStateChange,
		    setObject: setObject,
		    updateBalance: updateBalance,
		    confirmRemoveObject: confirmRemoveObject,
		    removeObject: removeObject,
		    confirmPayment: confirmPayment,
		    // initSteps: initSteps,
		    // addSteps: addSteps,
		    // nextStep: nextStep,
		    // highlightStep: highlightStep
		    // onTokenReceived: onTokenReceived
		};

		ReactDOM.render(ChatTrunkComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function PaymentsApi(token, frases, BillingApi) {

	var stripe = Stripe(token);
	var elements = stripe.elements();
	var card = null;
	var stripeIntent = null;
	var payment = null;
	var countries = [];
	var modalCont = document.getElementById('modal-cont');
	
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

	return {
		open: open,
		authenticate: authenticate
	};

	function open(params, callback) {
		
		if(!params.profile) return callback('profile param is undefined');

		if(params.payment) {
			payment = params.payment;
			renderCardForm({ profile: params.profile, payment: params.payment }, function(err, result) {
				callback(generateError(err), result);
			});
		} else {
			show_loading_panel();
			
			createSetupIntent(function(err, response) {
				if(err || response.error) return callback(err || response.error);
				stripeIntent = response.result;
				
				show_content();
				renderCardForm({ profile: params.profile }, function(err, result) {
					callback(generateError(err), result);
				});

			})
		}
	}

	function authenticate(params, callback) {
		createPaymentIntent(params, function(err, response) {
			if(err) return callback(generateError(err));

			handleNextActions(response.result, params.payment, function(err, result) {
				callback(generateError(err), result);
			});
		})
	}

	function renderCardForm(params, callback) {
		ReactDOM.render(NewPaymentComponent({
			profile: params.profile,
			payment: params.payment,
			frases: frases,
			renderCardElement: renderCardElement,
			onClose: destroyCardElement,
			onSubmit: submitCard,
			onCallback: callback,
			getCountries: getCountries
		}), modalCont);
	}

	function createSetupIntent(callback) {
		BillingApi.request('createSetupIntent', { returnUrl: window.location.href }, callback);
	}

	function createPaymentIntent(params, callback) {
		BillingApi.request('createPaymentIntent', { payment: params.payment }, callback);
	}

	function renderCardElement(el) {
		var style = {
			base: {
				fontSize: "14px",
				color: "#555",
				fontFamily: '"Trebuchet MS", Helvetica, sans-serif'
			}
		};
		card = elements.create('card', {style: style});
		card.mount(el);
		return card;
		
	}

	function destroyCardElement() {
		return card.destroy();
	}

	function submitCard(params, callback) {
		var setupParams = {};
		if(params.details) setupParams = params.details;
		if(params.address) setupParams.address = params.address;

		if(params.payment) createPaymentMethod(setupParams, params.payment, callback);
		else handleCardSetup(setupParams, callback);
		

	}

	function handleCardSetup(setupParams, callback) {
		stripe.handleCardSetup(
		    stripeIntent.client_secret, card, {
		    	payment_method_data: {
			    	billing_details: setupParams
		    	}
		    }
		)
		.then(function(result) {
			if(result.error) callback(result.error);
			else addPaymentMethod(result.setupIntent, callback);
		})
		.catch(function(err) {
			callback(err);
		});
	}

	function createPaymentMethod(setupParams, payment, callback) {
		stripe.createPaymentMethod('card', card, {
			billing_details: setupParams
		}).then(function(result) {
		    if (result.error) {
		      callback(result.error);
		    } else {
				BillingApi.request('confirmPayment', {
					service: 'stripe',
					payment: payment,
					payment_method_id: result.paymentMethod.id,
					confirmation_method: 'manual'
		  		}, function(err, response) {
		  			if(err) return callback(err);
		  			handleNextActions(response.result, payment, callback);
		  		});
		    }
		});
	}

	function handleNextActions(response, payment, callback) {
		if (response.requires_action) {
		    // Use Stripe.js to handle required card action
		    stripe.handleCardAction(
		    	response.payment_intent_client_secret
		    ).then(function(result) {
		      if (result.error) {
		        callback(result.error);
		      } else {
		        // The card action has been handled
		        // The PaymentIntent can be confirmed again on the server
		        BillingApi.request('updateBalance', {
		        	token: result.paymentIntent.id,
		        	service: 'stripe',
		        	payment: payment
		        	// payment_intent_id: result.paymentIntent.id
		        }, function(err, confirmResult) {
		        	if(err) return callback(err);
		        	handleNextActions(confirmResult, payment, callback);
		        });
		      }
		    });
		} else {
		    callback();
		}
	}

	function addPaymentMethod(setupIntent, callback) {
		BillingApi.request('addPaymentMethod', {
			service: 'stripe',
			paymentMethod: setupIntent.payment_method
  		}, function(err, response) {

  			if(err || response.error) {
  				callback(err || response.error);
  			} else {
  				callback(null, response.result);
  			}

  		});
	}

	function generateError(err) {
		if(!err) return null;
		return {
			name: (err.name || 'generic_decline'), 
			message: (err.name ? PbxObject.frases.CHECKOUT.ERROR[err.name] : PbxObject.frases.CHECKOUT.ERROR['generic_decline'])
		}
	}

	function getCountries(cb) {

		if(countries.length) return countries;

		$.ajax('https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;')
		.then(function(data) {
			countries = data;
			cb(null, data);
		}, function(err) {
			cb(err);
		});
	}

}
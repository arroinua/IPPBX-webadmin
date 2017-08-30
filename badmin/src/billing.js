function load_billing() {
	console.log('load_billing');
	close_options();

	var cont = document.getElementById('el-loaded-content');
	var profile = {};
	var sub = {};
	var plans = [];
	var stripeToken;
	var stripeHandler;

	billingRequest('getSubscription', null, function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err);
		sub = response.result._subscription;

		billingRequest('getProfile', null, function(err, response) {
			console.log('getProfile: ', err, response);
			if(err) return notify_about('error' , err);
			profile = response.result;

			getPlans(sub.currency, function(err, result) {
				if(err) return notify_about('error' , err);
				plans = result;

				// init();
				loadStripeJs();
			});

		});

	});

	function loadStripeJs() {
		if(window.StripeCheckout) return init();

		$.ajaxSetup({ cache: true });
		$.getScript('https://checkout.stripe.com/checkout.js', function(){
			stripeHandler = StripeCheckout.configure({
				key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
				image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
				locale: 'auto',
				token: function(token) {
					console.log('stripe token: ', token);
					stripeToken = token;
				}
			});

			// Close Checkout on page navigation:
			window.addEventListener('popstate', function() {
			  stripeHandler.close();
			});

			init();
		});
	}

	function init() {
		ReactDOM.render(BillingComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    frases: PbxObject.frases,
		    plans: plans,
		    addCard: addCard,
		    editCard: editCard,
		    onPlanSelect: onPlanSelect,
		    updateLicenses: updateLicenses
		}), cont);

		// set_page();
		show_content();
	}

	function addCard() {
		stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			allowRememberMe: false,
			panelLabel: "Add card",
			// currency: 'eur',
			// amount: plan.amount*100,
			closed: function(result) {
				console.log('onPlanSelect closed: ', result);
				saveCard(stripeToken, function(err, response) {
					if(err || !response.success) return;

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.card = stripeToken.card;
					init();
				});
			}
		});
	}

	function editCard() {
		stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			allowRememberMe: false,
			panelLabel: "Add card",
			// currency: 'eur',
			// amount: plan.amount*100,
			closed: function(result) {
				console.log('onPlanSelect closed: ', result);
				updateCard(stripeToken, function(err, response) {
					if(err || !response.success) return;

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.card = stripeToken.card;
					init();
				});
			}
		});
	}

	function saveCard(params, callback) {
		console.log('saveCard: ', params);
		if(!params) return;
		var reqParams = {
			service: 'stripe',
			token: params.id,
			card: params.card
		};

		billingRequest('addCard', reqParams, function(err, response) {
			console.log('saveCard response: ', err, params, response);
			callback(err, response);
		});
	}

	function updateCard(params, callback) {
		console.log('updateCard: ', params);
		if(!params) return;
		var reqParams = {
			service: 'stripe',
			token: params.id,
			card: params.card
		};

		billingRequest('updateCard', reqParams, function(err, response) {
			console.log('updateCard response: ', err, params, response);
			callback(err, response);
		});
	}

	function onPlanSelect(plan) {
		plan.amount = plan.price * sub.quantity;
		checkout(plan);
	}

	function checkout(params) {
		console.log('checkout: ', params);
		// var amount = plan.price * sub.quantity;
		var reqParams = {
			// resultUrl: window.location.href,
			// paymentMethod: 1,
			// paymentService: 'stripe',
			payment: {
				method: 'card',
				service: 'stripe'
			},
			amount: params.amount,
			currency: params.currency,
			order: [{
				action: 'changePlan',
				description: 'Subscription for plan "'+params.planId+'"',
				amount: params.amount,
				data: { planId: params.planId }
			}]
		};

		if(confirm('Pay '+params.amount+''+params.currency+'?')) {
			billingRequest('checkout', reqParams, function(err, response) {
				console.log('checkout response: ', err, params, response);
				if(response.locations) window.location = response.location;
				// if(err) return callback();
				// if(callback) callback(response.result || [])
			});
		}

		// billingRequest('changePlan', { planId: planId }, function(err, response) {
		// 	console.log('changePlan response: ', err, planId, response);
		// 	// if(err) return callback();
		// 	// if(callback) callback(response.result || [])
		// });	
	}

	function updateLicenses(params){
		console.log('updateLicenses: ', params);

		var amount = plan.price * sub.quantity;
		var reqParams = {
			resultUrl: window.location.href,
			payment: {
				method: 'card',
				service: 'stripe'
			},
			amount: amount,
			currency: sub.currency,
			order: [{
				action: 'changePlan',
				description: 'Subscription for plan "'+plan.planId+'"',
				amount: amount,
				data: { planId: plan.planId }
			}]
		};
		billingRequest('checkout', reqParams, function(err, response) {
			console.log('checkout response: ', err, plan, response);
			if(response.locations) window.location = response.location;
			// if(err) return callback();
			// if(callback) callback(response.result || [])
		});
	}

	function getPlans(currency, callback) {
		billingRequest('getPlans', { currency: currency }, function(err, response) {
			console.log('getPlans response: ', err, currency, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});
	}
}
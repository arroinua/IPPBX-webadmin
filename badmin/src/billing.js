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
		sub = response.result;

		billingRequest('getProfile', null, function(err, response) {
			console.log('getProfile: ', err, response);
			if(err) return notify_about('error' , err);
			profile = response.result;

			getPlans(profile.currency, function(err, result) {
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
		    updateLicenses: updateLicenses,
		    extend: deepExtend
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
				console.log('addCard closed: ', result);
				saveCard(stripeToken, function(err, response) {
					if(err || !response.success) return;

					console.log('editCard token: ', stripeToken);

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.push(stripeToken.card);
					profile.defaultBillingMethod = {
						params: stripeToken.card
					};
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
				console.log('editCard closed: ', result);
				updateCard(stripeToken, function(err, response) {
					if(err || !response.success) return;

					console.log('editCard token: ', stripeToken);

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.push(stripeToken.card);
					profile.defaultBillingMethod = {
						params: stripeToken.card
					};
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

	// function onPlanSelect(plan) {
	// 	changePlan(plan);
	// }

	function onPlanSelect(plan) {
		console.log('changePlan: ', plan);
		billingRequest('changePlan', {
			subId: sub._id,
			planId: plan.planId
		}, function(err, response) {
			if(err) return notify_about('error', err.message);
			console.log('changePlan: ', err, response);
			sub = response.result;
			init();
		});
	}

	function updateLicenses(params){
		console.log('updateLicenses: ', params);
		billingRequest('updateSubscription', {
			subId: sub._id,
			addOns: params.addOns,
			quantity: params.quantity
		}, function(err, response) {
			if(err) return notify_about('error', err.message);
			console.log('updateLicenses: ', err, response);
			sub = response.result;
			init();
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
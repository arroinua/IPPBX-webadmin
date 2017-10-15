function load_billing() {
	
	console.log('load_billing');
	close_options();

	var cont = document.getElementById('el-loaded-content');
	var profile = {};
	var sub = {};
	var plans = [];
	var invoices = [];
	var discounts = [];
	var stripeToken;
	var stripeHandler;

	loadStripeJs();

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

				init();

				getDiscounts(function(err, response) {
					if(err) return notify_about('error' , err);
					discounts = response;

					// init();

					getInvoices(function(err, response) {
						if(err) return notify_about('error' , err);
						invoices = response;
						console.log('invoices: ', invoices);
						init();
					});
				});

					

				// set_page();
				show_content();
			});

		});

	});

	function loadStripeJs() {
		if(window.StripeCheckout) return;

		$.ajaxSetup({ cache: true });
		$.getScript('https://checkout.stripe.com/checkout.js', function(){
			stripeHandler = StripeCheckout.configure({
				// key: 'pk_live_6EK33o0HpjJ1JuLUWVWgH1vT',
				key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
				// image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
				image: '/badmin/images/Ringotel_emblem_new.png',
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

			// init();
		});
	}

	function init() {
		ReactDOM.render(BillingComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    frases: PbxObject.frases,
		    plans: plans,
		    invoices: invoices,
		    discounts: discounts,
		    addCard: addCard,
		    editCard: editCard,
		    onPlanSelect: onPlanSelect,
		    updateLicenses: updateLicenses,
		    extend: deepExtend,
		    addCoupon: addCoupon
		}), cont);
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
				
				show_loading_panel();

				saveCard(stripeToken, function(err, response) {
					show_content();

					if(err || !response || !response.success) return;

					console.log('editCard token: ', stripeToken);

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.push(stripeToken.card);
					profile.defaultBillingMethod = {
						params: stripeToken.card
					};

					stripeToken = null;
					
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

				show_loading_panel();

				updateCard(stripeToken, function(err, response) {
					show_content();

					if(err || !response || !response.success) return;

					console.log('editCard token: ', stripeToken);

					profile.billingDetails = profile.billingDetails || {};
					profile.billingDetails.push(stripeToken.card);
					profile.defaultBillingMethod = {
						params: stripeToken.card
					};

					stripeToken = null;

					init();
				});
			}
		});
	}

	function saveCard(params, callback) {
		console.log('saveCard: ', params);
		if(!params) return callback();;
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
		if(!params) return callback();
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

	function addCoupon(string) {
		billingRequest('addCoupon', { coupon: string }, function(err, response) {
			console.log('addCoupon response: ', err, string, response);
			if(err) return notify_about('error', err.message);
			if(!response.success) return notify_about('error', response.error.message);
			discounts.push(response);
			init();
		});
	}

	function onPlanSelect(params) {
		console.log('changePlan: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			show_loading_panel();

			billingRequest('changePlan', {
				subId: sub._id,
				planId: params.plan.planId
			}, function(err, response) {
				if(err) return notify_about('error', err.message);
				console.log('changePlan: ', err, response);
				
				$(modal).modal('toggle');
				
				sub = response.result;

				show_content();
				init();
			});

		});

	}

	function updateLicenses(params){
		console.log('updateLicenses: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			show_loading_panel();

			billingRequest('updateSubscription', {
				subId: sub._id,
				addOns: params.addOns,
				quantity: params.quantity
			}, function(err, response) {
				if(err) return notify_about('error', err.message);
				console.log('updateLicenses: ', err, response);

				$(modal).modal('toggle');

				sub = response.result;
				
				show_content();
				init();
			});

		});
	}

	function getPlans(currency, callback) {
		billingRequest('getPlans', { currency: currency }, function(err, response) {
			console.log('getPlans response: ', err, currency, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});
	}

	function getInvoices(callback) {
		billingRequest('getInvoices', null, function(err, response) {
			console.log('getInvoices response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getDiscounts(callback) {
		billingRequest('getDiscounts', null, function(err, response) {
			console.log('getDiscounts response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

}
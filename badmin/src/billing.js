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
		if(err) return notify_about('error' , err.message);
		sub = response.result;

		billingRequest('getProfile', null, function(err, response) {
			console.log('getProfile: ', err, response);
			if(err) return notify_about('error' , err.message);
			profile = response.result;

			getPlans(profile.currency, function(err, result) {
				if(err) return notify_about('error', err.message);
				plans = result;

				init();

				getDiscounts(function(err, response) {
					if(err) return notify_about('error', err.message);
					discounts = response;

					// init();

					getInvoices(function(err, response) {
						if(err) return notify_about('error', err.message);
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
		if(window.StripeCheckout) return configureStripe();

		$.ajaxSetup({ cache: true });
		$.getScript('https://checkout.stripe.com/checkout.js', configureStripe);
	}

	function configureStripe() {
		stripeHandler = StripeCheckout.configure({
			// key: 'pk_live_6EK33o0HpjJ1JuLUWVWgH1vT',
			key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
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
		    renewSub: renewSub,
		    onPlanSelect: onPlanSelect,
		    updateLicenses: updateLicenses,
		    extend: deepExtend,
		    addCoupon: addCoupon
		}), cont);
	}

	function openStripeWindow(onCLoseHandler) {
		stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			allowRememberMe: false,
			panelLabel: "Add card",
			// currency: 'eur',
			// amount: plan.amount*100,
			closed: onCLoseHandler
		});
	}

	function addCard(callback) {
		openStripeWindow(function(result) {
			console.log('addCard closed: ', result);
			
			if(!stripeToken) return callback(null);
			var reqParams = {
				service: 'stripe',
				token: stripeToken.id,
				card: stripeToken.card
			};

			billingRequest('addCard', reqParams, function(err, response) {
				console.log('saveCard response: ', err, stripeToken, response);
				
				if(err || response.error) {
					notify_about('error', err.message || response.error.message);
					callback(null);
				} else {
					callback(stripeToken);
				}

				stripeToken = null;

			});
		});
	}

	function editCard(callback) {
		openStripeWindow(function(result) {
			console.log('editCard closed: ', result);

			if(!stripeToken) return callback(null);;
			var reqParams = {
				service: 'stripe',
				token: stripeToken.id,
				card: stripeToken.card
			};

			billingRequest('updateCard', reqParams, function(err, response) {
				console.log('updateCard response: ', err, stripeToken, response);				
				
				if(err || response.error) {
					notify_about('error', err.message || response.error.message);
					callback(null);
				} else {
					callback(stripeToken);
				}

				stripeToken = null;
			});

		});
	}

	function renewSub(callback) {

		show_loading_panel();

		billingRequest('renewSubscription', { subId: sub._id }, function(err, response) {
			console.log('renewSubscription response: ', err, response);

			show_content();

			if(err || response.error) notify_about('error', err.message || response.error.message);
			callback(err, response);
		});
			
	}

	// function saveCard(params, callback) {
	// 	console.log('saveCard: ', params);
	// 	if(!params) return callback();;
	// 	var reqParams = {
	// 		service: 'stripe',
	// 		token: params.id,
	// 		card: params.card
	// 	};

	// 	billingRequest('addCard', reqParams, function(err, response) {
	// 		console.log('saveCard response: ', err, params, response);
	// 		callback(err, response);
	// 	});
	// }

	// function updateCard(params, callback) {
	// 	console.log('updateCard: ', params);
	// 	if(!params) return callback();
	// 	var reqParams = {
	// 		service: 'stripe',
	// 		token: params.id,
	// 		card: params.card
	// 	};

	// 	billingRequest('updateCard', reqParams, function(err, response) {
	// 		console.log('updateCard response: ', err, params, response);
	// 		callback(err, response);
	// 	});
	// }

	function addCoupon(string) {
		billingRequest('addCoupon', { coupon: string }, function(err, response) {
			console.log('addCoupon response: ', err, string, response);
			if(err) return notify_about('error', err.message);
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
				show_content();

				if(err) return notify_about('error', err.message);
				console.log('changePlan: ', err, response);
				
				$(modal).modal('toggle');
				
				sub = response.result;

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
				show_content();

				if(err) return notify_about('error', err.message);
				console.log('updateLicenses: ', err, response);

				$(modal).modal('toggle');

				sub = response.result;
				
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
function load_billing() {
	
	console.log('load_billing');
	close_options();

	var cont = document.getElementById('el-loaded-content');
	var profile = PbxObject.profile;
	var sub = {};
	var plans = [];
	var invoices = [];
	var discounts = [];
	// var stripeToken;
	// var stripeHandler;

	var methods = {
		changePlan: changePlan,
		updateLicenses: updateLicenses
	}

	// loadStripeJs();

	billingRequest('getSubscription', null, function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err.message);
		sub = response.result;

		// billingRequest('getProfile', null, function(err, response) {
		// 	console.log('getProfile: ', err, response);
		// 	if(err) return notify_about('error' , err.message);

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
					invoices = response.filter(function(item) {
						return (item.paidAmount && parseFloat(item.paidAmount) > 0);
					});

					console.log('invoices: ', invoices);
					init();
				});
			});

				

			// set_page();
			show_content();
		});

		// });

	});

	// function loadStripeJs() {
	// 	if(window.StripeCheckout) return configureStripe();

	// 	$.ajaxSetup({ cache: true });
	// 	$.getScript('https://checkout.stripe.com/checkout.js', configureStripe);
	// }

	// function configureStripe() {
	// 	stripeHandler = StripeCheckout.configure({
	// 		// key: 'pk_live_6EK33o0HpjJ1JuLUWVWgH1vT',
	// 		key: 'pk_test_XIMDHl1xSezbHGKp3rraGp2y',
	// 		image: '/badmin/images/Ringotel_emblem_new.png',
	// 		billingAddress: true,
	// 		// email: profile.email,
	// 		// name: 'Ringotel',
	// 		// zipCode: true,
	// 		// locale: 'auto',
	// 		token: function(token) {
	// 			console.log('stripe token: ', token);
	// 			stripeToken = token;
	// 		}
	// 	});

	// 	// Close Checkout on page navigation:
	// 	window.addEventListener('popstate', function() {
	// 	  stripeHandler.close();
	// 	});
	// }

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
		    updateLicenses: onUpdateLicenses,
		    extend: deepExtend,
		    addCoupon: addCoupon
		}), cont);
	}

	function addCard(callback) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			allowRememberMe: false,
			panelLabel: "Add card",
			amount: null,
			closed: function(result) {
				console.log('addCard closed: ', result);
				
				if(!PbxObject.stripeToken) return callback(null);
				var reqParams = {
					service: 'stripe',
					token: PbxObject.stripeToken.id,
					card: PbxObject.stripeToken.card
				};

				billingRequest('addCard', reqParams, function(err, response) {
					console.log('saveCard response: ', err, PbxObject.stripeToken, response);
					
					if(err || response.error) {
						notify_about('error', err.message || response.error.message);
						callback(null);
					} else {
						callback(PbxObject.stripeToken);
						set_object_success();
					}

					PbxObject.stripeToken = null;

				});
			}
		});
	}

	function editCard(callback) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			allowRememberMe: false,
			panelLabel: "Add card",
			// currency: 'eur',
			// amount: plan.amount*100,
			closed: function(result) {
				console.log('editCard closed: ', result);

				if(!PbxObject.stripeToken) return callback(null);;
				var reqParams = {
					service: 'stripe',
					token: PbxObject.stripeToken.id,
					card: PbxObject.stripeToken.card
				};

				billingRequest('updateCard', reqParams, function(err, response) {
					console.log('updateCard response: ', err, PbxObject.stripeToken, response);				
					
					if(err || response.error) {
						notify_about('error', err.message || response.error.message);
						callback(null);
					} else {
						callback(PbxObject.stripeToken);
						set_object_success();
					}

					PbxObject.stripeToken = null;
				});

			}
		});
	}

	function renewSub(callback) {

		show_loading_panel();

		billingRequest('renewSubscription', { subId: sub._id }, function(err, response) {
			console.log('renewSubscription response: ', err, response);

			show_content();

			if(err || response.error) {
				notify_about('error', err.message || response.error.message);
			} else {
				callback(err, response);
				set_object_success();
			}
		});
			
	}

	function updateBalance(params, callbackFn) {
		PbxObject.stripeHandler.open({
			email: profile.email,
			name: 'Ringotel',
			zipCode: true,
			locale: 'auto',
			panelLabel: "Pay",
			allowRememberMe: false,
			currency: params.payment.currency,
			amount: params.payment.chargeAmount*100,
			closed: function(result) {
				console.log('updateBalance closed: ', result, PbxObject.stripeToken);

				if(!PbxObject.stripeToken) return;

				var reqParams = {
					currency: params.payment.currency,
					amount: params.payment.chargeAmount,
					description: 'Update balance',
					token: PbxObject.stripeToken.id
				};

				billingRequest('updateBalance', reqParams, function(err, response) {

					console.log('updateBalance: ', err, response);

					if(err) {
						notify_about('error', err.message);
					} else {

						if(methods[callbackFn])
							methods[callbackFn](params);

						PbxObject.stripeToken = null;		

					}	

				});

			}
		});
	}

	function addCoupon(string) {
		billingRequest('addCoupon', { coupon: string }, function(err, response) {
			console.log('addCoupon response: ', err, string, response);
			if(err) return notify_about('error', err.message);
			discounts.push(response);
			set_object_success();
			init();
		});
	}

	function onPlanSelect(params) {
		console.log('changePlan: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			// if((parseFloat(params.payment.chargeAmount) > 0) && !profile.billingMethod) return updateBalance(params, 'changePlan');

			changePlan(params);

		});

	}

	function changePlan(params, callback) {
		show_loading_panel();

		billingRequest('changePlan', {
			subId: sub._id,
			planId: params.plan.planId
		}, function(err, response) {
			console.log('changePlan response: ', err, response);

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE') updateBalance(params, 'changePlan');
				else notify_about('error', err.message);
				return;
			}
						
			sub = response.result;

			set_object_success();

			init();
		});
	}

	function onUpdateLicenses(params){
		console.log('updateLicenses: ', params);

		showModal('confirm_payment_modal', params, function(result, modal) {
			console.log('confirm_payment_modal submit:', result);

			$(modal).modal('toggle');

			// if((parseFloat(params.payment.chargeAmount) > 0) && !profile.billingMethod) return updateBalance(params, 'updateLicenses');

			updateLicenses(params);

		});
	}

	function updateLicenses(params) {
		show_loading_panel();

		billingRequest('updateSubscription', {
			subId: sub._id,
			addOns: params.addOns,
			quantity: params.quantity
		}, function(err, response) {
			console.log('updateLicenses response: ', err, response);

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE') updateBalance(params, 'updateLicenses');
				else notify_about('error', err.message);
				return;
			}

			sub = response.result;

			set_object_success();
			
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
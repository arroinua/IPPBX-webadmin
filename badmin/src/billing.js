function load_billing() {
	
	console.log('load_billing');
	close_options();

	var cont = document.getElementById('el-loaded-content');
	var profile = PbxObject.profile;
	var sub = {};
	var dids = [];
	var invoices = [];
	var discounts = [];
	var methods = {
		changePlan: changePlan,
		updateLicenses: updateLicenses,
		addCredits: addCredits
	}

	BillingApi.getSubscription(function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err.message);
		sub = response.result;

		BillingApi.getAssignedDids(function(err, response) {
			if(err) return notify_about('error' , err.message);
			dids = response.result;

			init();
			show_content();

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

		});

	});

	function init() {
		ReactDOM.render(BillingComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    dids: dids,
		    frases: PbxObject.frases,
		    invoices: invoices,
		    discounts: discounts,
		    addCard: addCard,
		    editCard: editCard,
		    renewSub: renewSub,
		    onPlanSelect: onPlanSelect,
		    updateLicenses: onUpdateLicenses,
		    addCredits: addCredits,
		    extend: deepExtend,
		    addCoupon: addCoupon,
		    utils: {
		    	convertBytes: convertBytes,
		    	getProration: getProration
		    }
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

				BillingApi.addCard(reqParams, function(err, response) {
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

				BillingApi.updateCard(reqParams, function(err, response) {
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

		BillingApi.renewSubscription({ subId: sub._id }, function(err, response) {
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

				BillingApi.updateBalance(reqParams, function(err, response) {

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
		BillingApi.addCoupon({ coupon: string }, function(err, response) {
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

		BillingApi.changePlan({
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

		BillingApi.updateSubscription({
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

	function addCredits(params) {
		showModal('confirm_add_credits_modal', { frases: PbxObject.frases, payment: params }, function(result, modal) {
			console.log('confirm_add_credits_modal submit:', result);

			$(modal).modal('toggle');
		

			show_loading_panel();

			BillingApi.addCredits({ amount: params.chargeAmount }, function(err, response) {
				remove_loading_panel();
				
				if(err) {
					if(err.name === 'NO_PAYMENT_SOURCE') updateBalance({ payment: params }, 'addCredits');
					else notify_about('error', err.message);
					return;
				}

				set_object_success();
				init();

			});
		});
	}

	function getInvoices(callback) {
		BillingApi.getInvoices(function(err, response) {
			console.log('getInvoices response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getDiscounts(callback) {
		BillingApi.getDiscounts(function(err, response) {
			console.log('getDiscounts response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getProration(sub, amount) {
		return BillingApi.getProration(sub, amount);
	}

}
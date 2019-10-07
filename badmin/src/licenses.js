function load_licenses() {
	
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
	};
	var modalCont = document.getElementById('modal-cont');
	
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

	BillingApi.getSubscription(function(err, response) {
		if(err) return notify_about('error' , err.message);
		sub = PbxObject.subscription = response.result;

		BillingApi.getAssignedDids(function(err, response) {
			if(err) return notify_about('error' , err.message);
			dids = response.result;

			getDiscounts(function(err, response) {
				if(err) return notify_about('error', err.message);
				discounts = response;

				init();
				show_content();
			});

		});

	});

	function init() {
		ReactDOM.render(LicensesComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    dids: dids,
		    frases: PbxObject.frases,
		    discounts: discounts,
		    renewSub: renewSub,
		    editCard: editPaymentMethod,
		    onPlanSelect: changePlan,
		    updateLicenses: onUpdateLicenses,
		    addCredits: addCredits,
		    extend: deepExtend,
		    addCoupon: addCoupon,
		    countSubAmount: countSubAmount,
		    currencyNameToSymbol: currencyNameToSymbol,
		    utils: {
		    	convertBytes: convertBytes,
		    	getProration: getProration
		    }
		}), cont);
	}

	function renewSub(callback) {

		show_loading_panel();

		var requestParams = { subId: sub._id };

		BillingApi.renewSubscription(requestParams, function(err, response) {

			show_content();

			if(err || response.error) {
				if(err.name === 'NO_PAYMENT_SOURCE') return updateBalance(requestParams, renewSub);
				notify_about('error', err.message || response.error.message);
			} else {
				callback(err, response);
				set_object_success();
			}
		});
			
	}

	function editPaymentMethod(cb) {
		updateBalance(null, function(result) {
			cb(result);
		})
	}

	function updateBalance(params, callbackFn) {
		var paymentParams = (params && params.payment) ? {
			currency: params.payment.currency,
			amount: params.payment.chargeAmount,
			description: 'Update balance'
		} : null;

		PbxObject.PaymentsApi[profile.billingMethod ? 'authenticate' : 'open']({ profile: profile, payment: paymentParams }, function(err, result) {

			if(err) return notify_about('error', err.message);

			if(typeof callbackFn === 'string') methods[callbackFn](params, true);
			else callbackFn(params, true);

		});
	}

	// function updateBalance(params, callbackFn) {
	// 	PbxObject.stripeHandler.open({
	// 		email: profile.email,
	// 		name: 'Ringotel',
	// 		zipCode: true,
	// 		locale: 'auto',
	// 		panelLabel: "Pay",
	// 		allowRememberMe: false,
	// 		currency: params.payment.currency,
	// 		amount: params.payment.chargeAmount*100,
	// 		closed: function(result) {

	// 			if(!PbxObject.stripeToken) return;

	// 			var reqParams = {
	// 				currency: params.payment.currency,
	// 				amount: params.payment.chargeAmount,
	// 				description: 'Update balance',
	// 				token: PbxObject.stripeToken.id
	// 			};

	// 			BillingApi.updateBalance(reqParams, function(err, response) {


	// 				if(err) {
	// 					notify_about('error', err.message);
	// 				} else {

	// 					if(methods[callbackFn])
	// 						methods[callbackFn](params);

	// 					PbxObject.stripeToken = null;		

	// 				}	

	// 			});

	// 		}
	// 	});
	// }

	function addCoupon(string) {
		BillingApi.addCoupon({ coupon: string }, function(err, response) {
			if(err) return notify_about('error', err.message);
			discounts.push(response);
			set_object_success();
			init();
		});
	}

	// function onPlanSelect(params) {

		// showConfirmModal('confirm_payment_modal', params, changePlan);

	// }

	function changePlan(params, noConfirm) {

		if(!noConfirm) return showConfirmModal('confirm_payment_modal', params, changePlan);

		show_loading_panel();

		BillingApi.changePlan({
			subId: sub._id,
			planId: params.plan.planId
		}, function(err, response) {

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE' || err.name === 'authentication_required') updateBalance(params, 'changePlan');
				else notify_about('error', err.message);
				return;
			}
						
			sub = PbxObject.subscription = response.result;

			set_object_success();

			init();
		});
	}

	function onUpdateLicenses(){
		ReactDOM.render(UpdateLicenseModalComponent({
		    options: PbxObject.options,
		    sub: sub,
		    discounts: discounts,
		    frases: PbxObject.frases,
		    onSubmit: updateLicenses,
		    countSubAmount: countSubAmount,
		    currencyNameToSymbol: currencyNameToSymbol,
		    utils: {
		    	convertBytes: convertBytes,
		    	getProration: getProration
		    }
		}), modalCont);

	}

	function updateLicenses(params, noConfirm) {

		if(!noConfirm) return showConfirmModal('confirm_payment_modal', params, updateLicenses);

		show_loading_panel();

		BillingApi.updateSubscription({
			subId: sub._id,
			addOns: params.addOns,
			quantity: params.quantity
		}, function(err, response) {

			show_content();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE' || err.name === 'authentication_required') updateBalance(params, 'updateLicenses');
				else notify_about('error', err.message);
				return;
			}

			sub = PbxObject.subscription = response.result;

			set_object_success();
			
			init();
		});
	}

	function addCredits(params, noConfirm) {
		if(!noConfirm) return showConfirmModal('confirm_payment_modal', { payment: {chargeAmount: params.amount, currencySymbol: currencyNameToSymbol(profile.currency)} }, addCredits);

		show_loading_panel();

		BillingApi.addCredits({ amount: params.payment.chargeAmount }, function(err, response) {
			remove_loading_panel();
			
			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE' || err.name === 'authentication_required') updateBalance({ payment: params }, 'addCredits');
				else notify_about('error', err.message);
				return;
			}

			set_object_success();
			init();

		});
	}

	function getDiscounts(callback) {
		BillingApi.getDiscounts(function(err, response) {
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function getProration(sub, amount) {
		return BillingApi.getProration(sub, amount);
	}

	function countSubAmount(sub) {
		var amount = sub.quantity * sub.plan.price;
		var priceProp = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';

		if(sub.addOns && sub.addOns.length){
		    sub.addOns.forEach(function (item){
		        if(item.quantity) amount += (item.price * item.quantity);
		    });
		}

		if(sub.hasDids) {
			dids.forEach(function(item) {
				amount += item.included ? 0 : parseFloat(item[priceProp]);
			});
		}

		return amount.toFixed(2);
	}

	function showConfirmModal(template, params, callback) {
		
		var data = extend({ frases: PbxObject.frases }, params);

		showModal(template, data, function(result, modal) {
			$(modal).modal('toggle');

			callback(params, true);
		});
	}

	function currencyNameToSymbol(name) {
		var symbol = "";

		switch(name.toLowerCase()) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	}

}
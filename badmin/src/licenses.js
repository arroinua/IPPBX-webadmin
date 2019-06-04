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
	}
	var modalCont = document.getElementById('modal-cont');
	
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

	BillingApi.getSubscription(function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err.message);
		sub = response.result;

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
		    onPlanSelect: onPlanSelect,
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

		showConfirmModal('confirm_payment_modal', params, changePlan);

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

	function showConfirmModal(template, params, callback) {
		showModal(template, params, function(result, modal) {
			$(modal).modal('toggle');

			callback(params);
		});
	}

	function updateLicenses(params) {

		showConfirmModal('confirm_payment_modal', params, function(params) {
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
		});
	}

	function addCredits(params) {
		showConfirmModal('confirm_add_credits_modal', { frases: PbxObject.frases, payment: params }, function(params) {

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
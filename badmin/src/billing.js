function load_billing() {
	
	var cont = document.getElementById('el-loaded-content');
	var profile = PbxObject.profile;
	var sub = {};
	var invoices = [];

	BillingApi.getSubscription(function(err, response) {
		console.log('getSubscription response: ', err, response.result);
		if(err) return notify_about('error' , err.message);
		sub = response.result;

		init();
		show_content();

		getInvoices(function(err, response) {
			if(err) return notify_about('error', err.message);
			invoices = response.filter(function(item) {
				return (item.paidAmount && parseFloat(item.paidAmount) > 0);
			});

			console.log('invoices: ', invoices);
			init();
		});

	});

	function init() {
		ReactDOM.render(BillingComponent({
		    options: PbxObject.options,
		    profile: profile,
		    sub: sub,
		    frases: PbxObject.frases,
		    invoices: invoices,
		    addCard: addCard,
		    editCard: editCard,
		    extend: deepExtend
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

	function getInvoices(callback) {
		BillingApi.getInvoices(function(err, response) {
			console.log('getInvoices response: ', err, response);
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

}
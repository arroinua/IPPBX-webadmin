function load_billing() {
	
	var cont = document.getElementById('el-loaded-content');
	var profile = PbxObject.profile;
	var sub = {};
	var invoices = [];
	var card = null;
	var stripeIntent = null;
	var frases = PbxObject.frases;

	BillingApi.getSubscription(function(err, response) {
		if(err) return notify_about('error' , err.message);
		sub = PbxObject.subscription = response.result;

		init();
		show_content();

		getInvoices(function(err, response) {
			if(err) return notify_about('error', err.message);
			invoices = response.filter(function(item) {
				return (item.paidAmount && parseFloat(item.paidAmount) > 0);
			});

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
		    onAddPaymentMethod: onAddPaymentMethod,
		    setPrimaryPaymentMethod: setPrimaryPaymentMethod,
		    removePaymentMethod: removePaymentMethod,
		    extend: deepExtend
		}), cont);
	}

	function addPaymentMethod(err, result) {
		if(err) {
			notify_about('error', err.message);
		} else {
			set_object_success();
			profile.billingMethod = result;
			profile.billingDetails = (profile.billingDetails || []).concat([result]);
			init();
		}
	}

	function onAddPaymentMethod(callback) {

		PbxObject.PaymentsApi.open({profile: profile}, addPaymentMethod);

	}

	function setPrimaryPaymentMethod(pmid) {
		var billingDetails = profile.billingDetails;
		var primaryMethod = billingDetails.filter(function(item) { return item.id === pmid; })[0];

		if(!primaryMethod) return;

		showConfirmModal({
			type: 'primary',
			title: frases.BILLING.PAYMENT_METHODS.SET_PRIMARY_TITLE,
			text: Utils.interpolate(frases.BILLING.PAYMENT_METHODS.SET_PRIMARY_CONTENT, { method: (primaryMethod.params.brand.toUpperCase() + ' ' + primaryMethod.params.last4 ) })
		}, function() {

			show_loading_panel();

			BillingApi.request('setPrimaryPaymentMethod', { pmid: pmid }, function(err, response) {

				show_content();
				
				if(err || response.error) return notify_about('error', err.message || response.error.message);

				profile.billingMethod = primaryMethod;

				set_object_success();

				init();

			});
		})
			
	}

	function removePaymentMethod(pmid) {
		var method = profile.billingDetails.filter(function(item) { return item.id === pmid; })[0];

		showConfirmModal({
			type: 'danger',
			title: frases.BILLING.PAYMENT_METHODS.REMOVE_METHOD_TITLE,
			warning: Utils.interpolate(frases.BILLING.PAYMENT_METHODS.REMOVE_METHOD_CONTENT, { method: (method.params.brand.toUpperCase() + ' ' + method.params.last4) })
		}, function() {

			show_loading_panel();

			BillingApi.request('removePaymentMethod', { pmid: pmid }, function(err, response) {

				show_content();
				
				if(err || response.error) return notify_about('error', err.message || response.error.message);

				profile.billingDetails = profile.billingDetails.filter(function(item) {
					return item.id !== pmid;
				});

				if(profile.billingDetails.length) profile.billingMethod = profile.billingDetails[0];
				else profile.billingMethod = null;

				set_object_success();

				init();

			});

		})
	}

	function getInvoices(callback) {
		BillingApi.getInvoices(function(err, response) {
			if(err) return callback(err);
			if(callback) callback(null, response.result || [])
		});	
	}

	function showConfirmModal(params, callback) {
		var modalCont = document.getElementById('modal-cont');
		var props = {
			frases: PbxObject.frases,
			type: params.type,
			title: params.title,
			warning: params.warning,
			text: params.text,
			onSubmit: callback
		};

		if(!modalCont) {
			modalCont = document.createElement('div');
			modalCont.id = "modal-cont";
			document.body.appendChild(modalCont);
		}

		ReactDOM.render(ConfirmActionModalComponent(props), modalCont);
	}

}
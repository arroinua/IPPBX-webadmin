function load_customers(params) {

	console.log('load_customers: ', PbxObject.kind, params);
	var frases = PbxObject.frases;
	var customers = [];
	var modalCont = document.getElementById('modal-cont');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

    set_page();
    close_options();
    getCustomers();

    function getCustomers() {
    	json_rpc_async('getCustomers', null, function(result, err) {
    		console.log('getCustomers: ', err, result);
    		customers = result.reverse();
    		render(customers);
    	});
    }

    function onDelete(cid) {
    	console.log('onDelete: ', cid);
    	ReactDOM.render(
    		DeleteObjectModalComponent({
    			frases: frases,
    			warning: frases.CUSTOMERS.ON_DELETE_WARNING,
    			onSubmit: function() {
    				deleteCustomer(cid);
    			}
    		}),
    		modalCont
    	);
    }

    function deleteCustomer(cid) {
    	json_rpc_async('deleteCustomerData', {
    		customerid: cid
    	}, function(result, err) {
    		console.log('deleteCustomerData result: ', err, result);
    		
    		customers = customers.filter(function(item) {
    			return item.id !== cid;
    		});

    		notify_about('success', frases.CUSTOMERS.ON_DELETED_MSG);
    		render(customers);
    	});
    }

    function getPrivacyPrefs(customerId, callback) {
        console.log('getPrivacyPrefs: ', customerId);
        json_rpc_async('getCustomerConsent', { customerid: customerId }, function(response, err) {
            console.log('getCustomerConsent: ', response);
            if(err) return notify_about('error', err);
            callback(response);
        });
    }

    function openCustomerInfo(params) {
    	ReactDOM.render(
    		CustomerInfoModalComponent({
    			frases: frases,
    			params: params,
    			onDelete: onDelete,
                getPrivacyPrefs: getPrivacyPrefs
    		}),
    		modalCont
    	);
    }

	function render(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
		    openCustomerInfo: openCustomerInfo
		};

		ReactDOM.render(CustomersComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
function load_customers(params) {

	var frases = PbxObject.frases;
	var customers = [];
    // var importServices = [{ id: 'csv', name: '.csv' }, { id: 'Zendesk', name: 'Zendesk' }];
    var importServices = PbxObject.options.services || [];
    var availableServices = [{ id: 'csv', name: '.csv' }].concat(filterServices(importServices));
	var modalCont = document.getElementById('modal-cont');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

    set_page();
    close_options();
    getCustomers();

    function filterServices(list) {
        // var integrations = PbxObject.options.services.map(function(item) { return item.id });
        // return list.filter(function(item) { return integrations.indexOf(item.id) !== -1 || item.id === 'csv' });
        return list.filter(function(item) { return item.state });
    }

    function getCustomers() {
    	json_rpc_async('getCustomers', null, function(result, err) {
    		customers = sortByKey(result || [], 'name');
    		render(customers);
            show_content();
    	});
    }

    function onDelete(cid) {
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
    		
    		customers = customers.filter(function(item) {
    			return item.id !== cid;
    		});

    		notify_about('success', frases.CUSTOMERS.ON_DELETED_MSG);
    		render(customers);
    	});
    }

    function getPrivacyPrefs(customerId, callback) {
        json_rpc_async('getCustomerConsent', { customerid: customerId }, function(response, err) {
            if(err) return notify_about('error', err);
            callback(response);
        });
    }

    function openCustomerInfo(params) {
    	ReactDOM.render(
    		CustomerInfoModalComponent({
    			frases: frases,
    			params: params,
    			onDelete: (PbxObject.isUserAccount ? (checkPermissions('customers', 15) ? onDelete : null) : onDelete),
                getPrivacyPrefs: getPrivacyPrefs
    		}),
    		modalCont
    	);
    }

    // function openImportSettings(service, data) {
    //     var componentParams = {
    //         frases: PbxObject.frases,
    //         data: data,
    //         service: service,
    //         onSubmit: importCustomers
    //     };

    //     ReactDOM.render(ImportSettingsComponent(componentParams), document.getElementById('el-loaded-content'));
    // }

    function importCustomers(params) {
        show_loading_panel();

        var method = params.service_id ? 'importContacts' : 'importCustomers';

        json_rpc_async(method, params, function(result, error) {
            if(error && error.message) {
                var message = JSON.parse(error.message);
                if(message.error.code === 401) {
                    openAuthModal({ service_id: params.service_id, path: ('/services/'+params.service_id+'/Contacts') }, function(err, result) {
                        if(!err) return importCustomers(params);
                        notify_about('error', err.message);
                    });
                } else {
                    notify_about('error', message.error.message);
                } 
            } else {
                showModal('import_result_modal', { contacts: result, contactsCount: result.length }, function(data, modalObject) {
                    $(modalObject).modal('hide');
                    return getCustomers();
                });
                // notify_about('success', PbxObject.frases.SAVED);
            }
        });
    }

    function openAuthModal(params, callback){
        showModal('ldap_auth', { service_id: params.service_id }, function(data, modalObject) {
            var btn = modalObject.querySelector('button[data-type="submit"]'),
                prevhtml = btn.innerHTML;
            
            btn = $(btn);
            btn.prop('disabled', true);
            btn.html('<i class="fa fa-fw fa-spinner fa-spin"></i>');

            authInService(data, params.path, function(err, result) {
                btn.prop('disabled', false);
                btn.html(prevhtml);

                $(modalObject).modal('hide');
                callback(null, result);
            })
        });
    }

    function authInService(authData, path, callback) {
        // var path = '/services/'+options.service_id+'/Contacts';
        var params = {
            url: path
        };
        if(authData) {
            params.method = 'POST';
            params.data = 'username='+authData.username+'&password='+authData.password;
        }
        
        $.ajax(params).then(function(data){
            if(data) {
                if(data.result.location) {
                    window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                    return window.location = data.result.location;
                }
                callback(data.result);
            } else {
                callback();
            }
                

        }, function(err){
            var error = null;

            if(err.responseJSON.error && err.responseJSON.error.message) {
                error = JSON.parse(err.responseJSON.error.message).error;
            }
            
            if(error && error.redirection) {
                window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                window.location = error.redirection;
            } else if(error && error.code === 401) {
                callback(error);
            } else {
                window.sessionStorage.setItem('serviceParams', JSON.stringify(serviceParams));
                window.location = loc.origin + path;
            }
        });
    }

    // function importFromService(service) {
    //     if(service.id === 'csv') return importFromCSV();
        

    //     json_rpc_async('importContacts', { service_id: 'Zendesk' }, function(result) {
    //         console.log('importContacts: ', service, result);
    //     })
    // }

    function importFromService(service) {
        var componentParams = {};
        var modalCont = document.getElementById('modal-cont');

        if(modalCont) {
            modalCont.parentNode.removeChild(modalCont);
        }

        modalCont = document.createElement('div');
        modalCont.id = "modal-cont";
        document.body.appendChild(modalCont);

        componentParams = {
            frases: PbxObject.frases,
            selectedService: service,
            onSubmit: importCustomers
        };

        ReactDOM.render(ImportDataModalComponent(componentParams), modalCont);        
    }

	function render(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params,
            import: (PbxObject.isUserAccount ? (checkPermissions('customers', 7) ? importFromService : null) : importFromService),
            importServices: availableServices,
		    openCustomerInfo: openCustomerInfo
		};

		ReactDOM.render(CustomersComponent(componentParams), document.getElementById('el-loaded-content'));

	}

}
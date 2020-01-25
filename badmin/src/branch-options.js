function load_branch_options() {

	var options = {};
	var initLang = null;
	var branchOptions = null;
	var singleBranch = false;

	init();

	function init() {
		json_rpc_async('getPbxOptions', null, function(result){
			options = result;
			initLang = options.lang;

			singleBranch = result.mode === 1 || !result.prefix;

		    if(singleBranch) {
		    	json_rpc_async('getDeviceSettings', null, function(result) {
		    		branchOptions = result;
		    		render();
		    		close_options();
		    	});
		    } else {
		    	render();
		    	close_options();
		    }
		});

	}

	function saveOptions(newOptions, callback) {

		var handler;
		// var files = [];

		if(newOptions.files) {
			newOptions.files.forEach(function(item) {
				uploadFile(item);
			})
			delete newOptions.files;
		}


		// Upload audio files
		// if(files.length) {
		// 	files.forEach(function(item) {
		// 		uploadFile(item);
		// 	})
		// }

		if(newOptions.lang && newOptions.lang !== initLang) {	    
		    handler = set_options_success_with_reload;
		} else {
		    handler = set_object_success;
		}

		json_rpc_async('setPbxOptions', newOptions, function(result) {
			options = deepExtend(options, newOptions);
			PbxObject.options = options;

			// if(!newOptions.adminpass) {
			    handler();
			// } 
			// else {
			    // if(window.localStorage['ringo_tid'] && !singleBranch) {
			    //     BillingApi.changePassword({ login: newOptions.adminname, password: newOptions.adminpass }, function(err, result) {
			    //         if(!err) {
			    //         	handler();
			    //         	if(callback) callback();
			    //         }
			    //     });

			    // } else {
			        // handler();
			    // }
			// }

			if(callback) callback();


			// if(window.localStorage['ringo_tid'] && !singleBranch) {
			// 	if(newOptions.email) {
			// 		BillingApi.changeAdminEmail({ email: newOptions.email }, function(err, result) {
			// 		    if(err) notify_about('error', err);
			// 		});
			// 	}
			// }
		});
	}

	function generateApiKey(params, callback) {
		show_loading_panel();
		json_rpc_async('createAPIKey', params, function(result) {
			show_content();
			if(result) set_object_success();
			callback(result);
		});
	}

	function deleteApiKey(params, callback) {
		show_loading_panel();
		json_rpc_async('deleteAPIKey', params, function(result) {
			show_content();
			set_object_success();
			callback(result);
		});	
	}

	function saveBranchOptions(newOptions) {
		json_rpc_async('setDeviceSettings', newOptions, null);
	}

	function updatePassword(params, callback) {
		json_rpc_async('setPbxOptions', params, function(result, err) {
			if(!err && !result.error) set_object_success();
			if(callback) callback(err, result);
		});
	}

	function showChangePassSettings() {
		var modalCont = document.getElementById('modal-cont');

		if(modalCont) modalCont.parentNode.removeChild(modalCont);

		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);

		ReactDOM.render(ChangePasswordComponent({
			frases: PbxObject.frases,
			open: true,
			onSubmit: updatePassword
		}), modalCont);
	}

	function render() {
		var componentParams = {
			frases: PbxObject.frases,
		    singleBranch: singleBranch,
		    params: options,
		    branchParams: branchOptions,
		    saveOptions: saveOptions,
		    generateApiKey: generateApiKey,
		    deleteApiKey: deleteApiKey,
		    saveBranchOptions: saveBranchOptions,
		    showChangePassSettings: showChangePassSettings
		};

		ReactDOM.render(OptionsComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
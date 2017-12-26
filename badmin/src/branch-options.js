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
		var files = [];

		if(newOptions.options && newOptions.options.files) {
			files = [].concat(newOptions.options.files);
			delete newOptions.options.files;
		}

		console.log('saveOptions: ', options, newOptions, files);

		// Upload audio files
		if(files.length) {
			files.forEach(function(item) {
				uploadFile(item);
			})
		}

		if(newOptions.lang && newOptions.lang !== initLang) {	    
		    handler = set_options_success;
		} else {
		    handler = set_object_success;
		}

		json_rpc_async('setPbxOptions', newOptions, function(result) {
			PbxObject.options = options = newOptions;

			console.log('setPbxOptions success: ', newOptions, options);

			if(!newOptions.adminpass) {
			    handler();
			} else {
			    if(window.localStorage['ringo_tid'] && !singleBranch) {
			        billingRequest('changePassword', { login: newOptions.adminname, password: newOptions.adminpass }, function(err, result) {
			            if(!err) {
			            	handler();
			            	if(callback) callback();
			            }
			        });
			    } else {
			        handler();
			        if(callback) callback();
			    }
			}
		});
	}

	function saveBranchOptions(newOptions) {
		console.log('saveBranchOptions: ', newOptions);

		json_rpc_async('setDeviceSettings', newOptions, null);
	}

	function render() {
		var componentParams = {
			frases: PbxObject.frases,
		    singleBranch: singleBranch,
		    params: options,
		    branchParams: branchOptions,
		    saveOptions: saveOptions,
		    saveBranchOptions: saveBranchOptions
		};

		console.log('render: ', componentParams);

		ReactDOM.render(OptionsComponent(componentParams), document.getElementById('el-loaded-content'));

		show_content();
	}

}
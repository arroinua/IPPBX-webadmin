function load_storages(){
	var storeTable,
		availableStorages,
		fileStorage,
		storageInfo,
		extensions,
		totalStorage,
		modalCont = document.getElementById('modal-cont');

	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "modal-cont";
		document.body.appendChild(modalCont);
	}

	if(PbxObject.options.mode === 1 || !PbxObject.options.prefix) {
		getStorages(function (result){
			fileStorage = result;
			init();
		});
	} else {
		fileStorage = null;
	}

	getStorageInfo(function (result){
		
		storageInfo = result;
		
		getExtensions(function(list) {

			extensions = list;

			init();
		})
	});

	function openStorageSettings(params) {
		var data = extend({}, params);

		if(data.maxsize) data.maxsize = convertBytes(data.maxsize, 'Byte', 'GB');

		ReactDOM.render(StorageComponent({
		    frases: PbxObject.frases,
		    data: data,
		    onSubmit: saveStorage
		}), modalCont);
	}

	function saveStorage(data, callback){
		if(!data.path) return;
		if(!data.id) delete data.id;
		if(data.maxsize !== undefined) data.maxsize = convertBytes(data.maxsize, 'GB', 'Byte');
		data.state = parseInt(data.state, 10);

	    json_rpc_async('setFileStore', data, function(result, err){
	    	if(err) return callback(err);
			
			notify_about('success', PbxObject.frases.SAVED);
			
			getStorages(function (result){
				fileStorage = result;

				getTotalStorage(function (result){
					PbxObject.options = result;

					renderUI();
					if(callback) callback();
				});
			});
		});
	}

    function init() {
		show_content();

    	if(fileStorage === undefined || storageInfo == undefined) return;

		renderUI();    	
		TableSortable.sortables_init();
		close_options();
	    set_page();
    }

    function renderUI(){
    	ReactDOM.render(UsageComponent({
    	    options: PbxObject.options,
    	    frases: PbxObject.frases,
    	    storageInfo: storageInfo,
    	    fileStorage: fileStorage,
    	    extensions: extensions,
    	    getTotalStorage: getTotalStorage,
    	    utils: {
    	    	convertBytes: convertBytes,
    	    	formatDateString: formatDateString,
    	    	getFriendlyStorageState: getFriendlyStorageState
    	    },
    	    openStorageSettings: openStorageSettings
    	}), document.getElementById('el-loaded-content'));
    }
}

function getStorages(callback){
	json_rpc_async('getFileStore', null, function (result){
		if(callback) callback(result);
	});
}

function getStorageInfo(callback){
	json_rpc_async('getStoreInfo', null, function (result){
		sortByKey(result, 'user');
		if(callback) callback(result);
	});
}

function getTotalStorage(callback){
	json_rpc_async('getPbxOptions', null, function (result){
		if(callback) callback(result);
	});
}

function setUserStoreLimit(oid, limit, input){
	json_rpc_async('setStoreLimit', { oid: oid, limit: convertBytes(parseFloat(limit), 'GB', 'Byte') }, function (result){
		input.value = convertBytes(result, 'Byte', 'GB').toFixed(2);
	});
}

function getFriendlyStorageState(state){
	return PbxObject.frases.STORAGE.STATES[state];
}
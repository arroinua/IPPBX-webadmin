function load_storages(){
	var storeTable,
		availableStorages,
		fileStorage,
		storageInfo,
		totalStorage,
		modalCont = document.getElementById('storage-settings-cont');


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
		init();
	});

	function openStorageSettings(data) {
		if(modalCont) // TODO: find a solution
			modalCont.parentNode.removeChild(modalCont);

		// if(!modalCont) {
			modalCont = document.createElement('div');
			modalCont.id = "storage-settings-cont";
			document.body.appendChild(modalCont);
		// }

		if(data.maxsize)
			data.maxsize = convertBytes(data.maxsize, 'Byte', 'GB');

		ReactDOM.render(StorageComponent({
		    frases: PbxObject.frases,
		    data: data,
		    onSubmit: saveStorage
		}), modalCont);

		$('#storage-settings').modal();
	}

	function saveStorage(data){
		console.log('saveStorage: ', data);
		if(!data.path) return;
		if(!data.id) delete data.id;
		if(data.maxsize !== undefined) data.maxsize = convertBytes(data.maxsize, 'GB', 'Byte');
		data.state = parseInt(data.state, 10);

	    json_rpc_async('setFileStore', data, function(result){
			if(result){
				getStorages(function (result){
					fileStorage = result;

					getTotalStorage(function (result){
						PbxObject.options = result;
	
						renderUI();
						$('#storage-settings').modal('hide');
					});
				});
			}
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

// function createStorageRow(params){
// 	var row = document.createElement('tr'),
// 		cell, a, button;

// 	cell = row.insertCell(0);
// 	cell.classList.add((params.state === 1 || params.state === 2) ? 'success' : 'danger');
	
// 	cell = row.insertCell(1);
// 	cell.textContent = getFriendlyStorageState(params.state);

// 	cell = row.insertCell(2);
// 	cell.textContent = params.path;

// 	cell = row.insertCell(3);
// 	cell.textContent = convertBytes(params.freespace, 'Byte', 'GB').toFixed(2);

// 	cell = row.insertCell(4);
// 	cell.textContent = convertBytes(params.usedsize, 'Byte', 'GB').toFixed(2);

// 	cell = row.insertCell(5);
// 	cell.textContent = convertBytes(params.maxsize, 'Byte', 'GB').toFixed(2);

// 	cell = row.insertCell(6);
// 	if(params.created) cell.textContent = formatDateString(params.created);

// 	cell = row.insertCell(7);
// 	if(params.updated) cell.textContent = formatDateString(params.updated);
	
// 	cell = row.insertCell(8);
//     button = document.createElement('button');
//     button.className = 'btn btn-default btn-sm';
//     button.innerHTML = '<i class="fa fa-edit"></i>';
//     addEvent(button, 'click', function(){
//         editStorage(params);
//     });
//     cell.appendChild(button);

// 	row.setAttribute('data-id', params.id);

// 	return row;
// }



// function saveStorage(){
// 	var form = document.getElementById('storageForm');
// 	var formData = retrieveFormData(form);

// 	if(formData && Object.keys(formData).length !== 0){
// 		if(formData.maxsize > 0) formData.maxsize = convertBytes(formData.maxsize, 'GB', 'Byte');
// 		if(!formData.id) delete formData.id;
// 	    json_rpc_async('setFileStore', formData, function(result){
// 			if(result){
// 				getStorages(function (result){
// 					var table = document.querySelector('#storages tbody');
// 					clearTable(table);
// 					fillTable(table, result, createStorageRow);
// 				});
// 				getTotalStore(function (result){
// 					setTotalStore(result);
// 				});
// 				$('#storageModal').modal('hide');
// 			}
// 		});
// 	}
// }

// function editStorage(params){

// 	openModal({
// 		tempName: 'storage_settings',
// 		modalId: 'storageModal',
// 		data : params
// 	}, function (){
// 		if(params) {
// 			var maxsize = document.querySelector('#storageForm input[name="maxsize"]'),
// 				states = document.querySelector('#storageForm select[name="state"]'),
// 				state = params.state.toString();

// 			if(maxsize.value > 0) maxsize.value = convertBytes(maxsize.value, 'Byte', 'GB').toFixed(2);

// 			[].slice.call(states.options).forEach(function (option, index){
// 				if(option.value === state) {
// 					states.selectedIndex = index;
// 				}
// 			});
// 		}
// 	});
// }

function setUserStoreLimit(oid, limit, input){
	json_rpc_async('setStoreLimit', { oid: oid, limit: convertBytes(parseFloat(limit), 'GB', 'Byte') }, function (result){
		console.log(result);
		input.value = convertBytes(result, 'Byte', 'GB').toFixed(2);
	});
}

function getFriendlyStorageState(state){
	return PbxObject.frases.STORAGE.STATES[state];
}
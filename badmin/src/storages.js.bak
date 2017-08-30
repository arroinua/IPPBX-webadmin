function load_storages(){
	var storeTable,
		availableStorages,
		storeInfoTable = document.querySelector('#store-info tbody');

	if(PbxObject.options.mode === 1 || !PbxObject.options.prefix) {
		storeTable = document.querySelector('#storages tbody');
		getStorages(function (result){
			fillTable(storeTable, result, createStorageRow, function (){
				show_content();
			});
		});
	} else {
		availableStorages = document.getElementById('storages-cont');
		availableStorages.parentNode.removeChild(availableStorages);
		show_content();
	}

	getStoreInfo(function (result){
		fillTable(storeInfoTable, result, createStoreInfoRow);
	});

	getTotalStore(function (result){
		setTotalStore(result);
	});

	TableSortable.sortables_init();
	close_options();
    set_page();
}

function getStorages(callback){
	json_rpc_async('getFileStore', null, function (result){
		if(callback) callback(result);
	});
}

function getStoreInfo(callback){
	json_rpc_async('getStoreInfo', null, function (result){
		sortByKey(result, 'user');
		if(callback) callback(result);
	});
}

function getTotalStore(callback){
	json_rpc_async('getPbxOptions', null, function (result){
		if(callback) callback(result);
	});
}

function setTotalStore(result){
	var storesize = result.storesize,
		storelimit = result.storelimit,
		elStoresize = document.querySelector('.store-size'),
		elStorefree = document.querySelector('.store-free'),
		elStorelimit = document.querySelector('.store-limit');
	
	if(storesize !== undefined) elStoresize.textContent = convertBytes(storesize, 'Byte', 'GB').toFixed(2);
	if(storelimit !== undefined) elStorelimit.textContent = convertBytes(storelimit, 'Byte', 'GB').toFixed(2);
	if(storesize !== undefined && storelimit !== undefined) elStorefree.textContent = convertBytes((storelimit - storesize), 'Byte', 'GB').toFixed(2);
}

function createStorageRow(params){
	var row = document.createElement('tr'),
		cell, a, button;

	cell = row.insertCell(0);
	cell.classList.add((params.state === 1 || params.state === 2) ? 'success' : 'danger');
	
	cell = row.insertCell(1);
	cell.textContent = getFriendlyStorageState(params.state);

	cell = row.insertCell(2);
	cell.textContent = params.path;

	cell = row.insertCell(3);
	cell.textContent = convertBytes(params.freespace, 'Byte', 'GB').toFixed(2);

	cell = row.insertCell(4);
	cell.textContent = convertBytes(params.usedsize, 'Byte', 'GB').toFixed(2);

	cell = row.insertCell(5);
	cell.textContent = convertBytes(params.maxsize, 'Byte', 'GB').toFixed(2);

	cell = row.insertCell(6);
	if(params.created) cell.textContent = formatDateString(params.created);

	cell = row.insertCell(7);
	if(params.updated) cell.textContent = formatDateString(params.updated);
	
	cell = row.insertCell(8);
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-edit"></i>';
    addEvent(button, 'click', function(){
        editStorage(params);
    });
    cell.appendChild(button);

	row.setAttribute('data-id', params.id);

	return row;
}

function createStoreInfoRow(params){

	function setInputValue(value, input){
		if(value < 0) return;
		input.value = value.toFixed(2);
		setUserLimitValue();
	}

	var row = document.createElement('tr'),
		cell, button, input, div, limit;

	cell = row.insertCell(0);
	cell.textContent = params.user;

	cell = row.insertCell(1);
	cell.textContent = params.size ? convertBytes(params.size, 'Byte', 'GB').toFixed(2) : parseFloat(0).toFixed(2);

	cell = row.insertCell(2);
	var inputGroup = document.createElement('div');
	inputGroup.className = 'input-group';

	input = document.createElement('input');
	input.value = params.limit ? convertBytes(params.limit, 'Byte', 'GB').toFixed(2) : parseFloat(0.00).toFixed(2);
	input.className = 'form-control';
	// input.type = 'number';
	input.setAttribute('step', '0.10');
	input.setAttribute('min', '0');
	addEvent(input, 'change', function (e){
		setInputValue(parseFloat(input.value), input);
	});
	inputGroup.appendChild(input);

	div = document.createElement('div');
	div.className = 'input-group-btn';

	button = document.createElement('button');
	button.className = 'btn btn-default';
	button.innerHTML = '<i class="fa fa-minus"></i>';
	addEvent(button, 'click', function (e){
		setInputValue(parseFloat(input.value) - 0.10, input);
	});
	div.appendChild(button);

	button = document.createElement('button');
	button.className = 'btn btn-default';
	button.innerHTML = '<i class="fa fa-plus"></i>';
	addEvent(button, 'click', function (e){
		setInputValue(parseFloat(input.value) + 0.10, input);
	});
	div.appendChild(button);

	inputGroup.appendChild(div);
	cell.appendChild(inputGroup);

	row.setAttribute('data-id', params.oid);

	var setUserLimitValue = debounce(function (){
		setUserStoreLimit(params.oid, parseFloat(input.value), input);
	}, 2000);

	return row;
}

function createStorage(){
	openModal({
		tempName: 'storage_settings',
		modalId: 'storageModal'
	});
}

function saveStorage(){
	var form = document.getElementById('storageForm');
	var formData = retrieveFormData(form);

	if(formData && Object.keys(formData).length !== 0){
		if(formData.maxsize > 0) formData.maxsize = convertBytes(formData.maxsize, 'GB', 'Byte');
		if(!formData.id) delete formData.id;
	    json_rpc_async('setFileStore', formData, function(result){
			if(result){
				getStorages(function (result){
					var table = document.querySelector('#storages tbody');
					clearTable(table);
					fillTable(table, result, createStorageRow);
				});
				getTotalStore(function (result){
					setTotalStore(result);
				});
				$('#storageModal').modal('hide');
			}
		});
	}
}

function editStorage(params){

	openModal({
		tempName: 'storage_settings',
		modalId: 'storageModal',
		data : params
	}, function (){
		if(params) {
			var maxsize = document.querySelector('#storageForm input[name="maxsize"]'),
				states = document.querySelector('#storageForm select[name="state"]'),
				state = params.state.toString();

			if(maxsize.value > 0) maxsize.value = convertBytes(maxsize.value, 'Byte', 'GB').toFixed(2);

			[].slice.call(states.options).forEach(function (option, index){
				if(option.value === state) {
					states.selectedIndex = index;
				}
			});
		}
	});
}

function setUserStoreLimit(oid, limit, input){
	json_rpc_async('setStoreLimit', { oid: oid, limit: convertBytes(parseFloat(limit), 'GB', 'Byte') }, function (result){
		console.log(result);
		input.value = convertBytes(result, 'Byte', 'GB').toFixed(2);
	});
}

function getFriendlyStorageState(state){
	return PbxObject.frases.STORAGE.STATES[state];
}
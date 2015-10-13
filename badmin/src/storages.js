function load_storages(){
	var table = document.querySelector('#storages tbody');
	getStorages(function (result){
		fillTable(table, result, createStorageRow, function (){
			show_content();
		});
	});
	close_options();
    set_page();
}

function getStorages(callback){
	json_rpc_async('getFileStore', null, function (result){
		if(callback) callback(result);
	});
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
	cell.textContent = convertBytes(params.freespace, 'Byte', 'GB').toFixed();

	cell = row.insertCell(4);
	cell.textContent = convertBytes(params.usedsize, 'Byte', 'GB').toFixed();

	cell = row.insertCell(5);
	cell.textContent = convertBytes(params.maxsize, 'Byte', 'GB').toFixed();

	cell = row.insertCell(6);
	if(params.created) cell.textContent = formatDateString(params.created);

	cell = row.insertCell(7);
	if(params.updated) cell.textContent = formatDateString(params.updated);
	
	cell = row.insertCell(8);
    button = document.createElement('button');
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML = '<i class="fa fa-edit"></i>';
    addEvent(button, 'click', function(){
        editStorage(params);
    });
    cell.appendChild(button);

	row.setAttribute('data-id', params.id);

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

			if(maxsize.value > 0) maxsize.value = convertBytes(maxsize.value, 'Byte', 'GB').toFixed();

			[].slice.call(states.options).forEach(function (option, index){
				if(option.value === state) {
					states.selectedIndex = index;
				}
			});
		}
	});
}

function getFriendlyStorageState(state){
	return PbxObject.frases.STORAGE.STATES[state];
}

function openModal(params, callback){
	var data = {},
		modal = document.getElementById(params.modalId);
	getPartial(params.tempName, function(template){
		data.frases = PbxObject.frases;
		if(params.data) data.data = params.data;

		var rendered = Mustache.render(template, data),
			cont = document.querySelector('#el-loaded-content');

		if(modal) modal.parentNode.removeChild(modal);
		cont.insertAdjacentHTML('afterbegin', rendered);
		$('#'+params.modalId).modal();
		if(callback) callback();
	});
}
function load_certificates(){
	$('#createCertBtn').click(createCert);
	$('#importCertBtn').click(importCert);

	getCertificates();
    set_page();
}

function getCertificates(){
	json_rpc_async('getCertificates', null, function(result){
		fillCertTable(result);
	});
}

function fillCertTable(certs){
	if(!certs) return;
	var table = document.querySelector('#certificates tbody');
	certs.forEach(function(cert){
		table.appendChild(createCertRow(cert));
	});
	close_options();
	show_content();
}

function createCertRow(certName){
	var row = document.createElement('tr'),
		cell, a, button;

	cell = row.insertCell(0);
	a = document.createElement('a');
	a.href = '#';
	a.innerHTML = certName;
	addEvent(a, 'click', function(e){
		// if(e) e.preventDefault();
		downloadCert(e, certName);
	});
	cell.appendChild(a);

	cell = row.insertCell(1);
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-eye"></i>';
    addEvent(button, 'click', function(){
        showCert(certName);
    });
    cell.appendChild(button);

    cell = row.insertCell(2);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-remove"></i>';
    addEvent(button, 'click', function(){
        removeCert(certName);
    });
    cell.appendChild(button);

    row.setAttribute('data-cert', certName);

    return row;
}

function downloadCert(e, certName){
	var targ = e.target;
	if(targ.getAttribute('download')) return;
	e.preventDefault();
	json_rpc_async('getCertificate', {alias: certName}, function(result){
		targ.setAttribute('download', 'certificate.pem');
		targ.href = 'data:text/plain;charset=utf-8,' + result;
		targ.click();
	});
}

function createCert(){
	openModal({
		tempName: 'create_cert', 
		modalId: 'createCertModal',
		cb: function(){
			$('#createCert').click(function(){
				addNewCert();
			});
		}
	});
}

function addNewCert(){
	var certForm = document.getElementById('newCertForm');
	var certInfo = retrieveFormData(certForm);
	if(certInfo && Object.keys(certInfo).length !== 0){
		certInfo.V = parseInt(certInfo.V);
	    json_rpc_async('createCertificate', certInfo, function(result){
	    	if(result){
	    		fillCertTable([certInfo.CN]);
	    		$('#createCertModal').modal('hide');
	    	}
	    });
    }
}

function importCert(){
	openModal({
		tempName: 'import_cert', 
		modalId: 'importCertModal',
		cb: function(){
			$('#importCert').click(function(){
				importNewCert();
			});
		}
	});
}

function importNewCert(){
	var certForm = document.getElementById('importCertForm');
	var certInfo = retrieveFormData(certForm);
	if(certInfo && Object.keys(certInfo).length !== 0){
	    json_rpc_async('setCertificate', certInfo, function(result){
	    	if(result === 'OK'){
	    		$('#importCertModal').modal('hide');
	    		var table = document.querySelector('#certificates tbody');
	    		clearTable(table);
	    		getCertificates();	
	    	}
	    });
    }
}

function showCert(cert){
	json_rpc_async('getCertificate', {alias: cert}, function(result){
		openModal({
			tempName: 'show_cert', 
			modalId: 'showCertModal',
			data : {name: cert, certificate: result}
		});
	});
}

function removeCert(cert){
	json_rpc_async('removeCertificate', {alias: cert}, function(result){
		var row = document.querySelector('#certificates tbody tr[data-cert="'+cert+'"]');
		row.parentNode.removeChild(row);
	});
}

function openModal(params){
	var data = {};
	getPartial(params.tempName, function(template){
		data.frases = PbxObject.frases;
		if(params.data) data.data = params.data;

		var rendered = Mustache.render(template, data),
			cont = document.querySelector('#el-loaded-content');

		cont.insertAdjacentHTML('afterbegin', rendered);
		if(params.cb) params.cb();
		$('#'+params.modalId).modal();
	});
}
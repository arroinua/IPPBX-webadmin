function load_rec_settings(){

	json_rpc_async('getVoiceRecordingList', null, function(result){
		getRecObjects(result);
	});

	$('#set-rec-settings').click(function(){
		setRecObjects();
	});
}

function getRecObjects(result){
	var count = 0;
	var cbNumber = 2;
	var obj = {};
	obj.result = result;

	function checkCount(){
		count += 1;
		if(count === cbNumber)
			fillSelects(obj);
	}

	json_rpc_async('getObjects', {kind: "trunk"}, function(trunks){
		if(result.trunks){
			obj.trunks = trunks.filter(function(trunk){
				return result.trunks.indexOf(trunk.name) == -1;
			});
		} else
			obj.trunks = trunks;

		checkCount();
	});
	json_rpc_async('getExtensions', null, function(exts){
		var extresult = filterObject(exts, ['phone', 'user']);
		if(result.extensions) {
			obj.exts = extresult.filter(function(item){
				return result.extensions.indexOf(item.ext) === -1;
			});

		} else {
			obj.exts = extresult;

		}

		checkCount();
	});
}

function fillSelects(obj){

	// $('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').prop('checked', true);
	// $('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').parent().button('toggle');
	document.querySelector('#trunks-rec-mode input[value="'+obj.result.trunksmode+'"]').checked = true;
	document.querySelector('#ext-rec-mode input[value="'+obj.result.extmode+'"]').checked = true;
	// $('#ext-rec-mode input[value="'+obj.result.extmode+'"]').parent().button('toggle');

	if(obj.result.trunks)
		fill_list_items('rec-trunks', obj.result.trunks);
	if(obj.result.extensions)
		fill_list_items('rec-ext', obj.result.extensions);

	fill_list_items('av-trunks', obj.trunks, 'name');
	fill_list_items('av-ext', obj.exts, 'ext');

	close_options();
	set_page();
	show_content();

}

function setRecObjects(){
	var jprms = '';

	// var trunksmode = document.querySelector('#trunks-rec-mode label.active input');
	var trunksmode = document.querySelector('#trunks-rec-mode input:checked');
	var extmode = document.querySelector('#ext-rec-mode input:checked');
	// var extmode = document.querySelector('#ext-rec-mode label.active input');
	var recTrunks = document.getElementById('rec-trunks');
	var recExt = document.getElementById('rec-ext');

	jprms += '"trunks":[';
	for(var i=0; i<recTrunks.children.length; i++){
	    jprms += '"'+recTrunks.children[i].innerHTML+'",';
	}
	jprms += '],';

	jprms += '"extensions":[';
	for(var i=0; i<recExt.children.length; i++){
	    jprms += '"'+recExt.children[i].innerHTML+'",';
	}
	jprms += '],';

	jprms += '"trunksmode":'+trunksmode.value+',';
	jprms += '"extmode":'+extmode.value+',';


	json_rpc_async('setVoiceRecordingList', jprms, function(){
		set_object_success();
	});
}

function load_wizard() {
	console.log('load wizard!');

	var activeTab = 'extensions';

	$('a[href="#wizard-tab-'+activeTab+'"]').tab('show');

	$('#wizard-tablist a[data-toggle="tab"]').on('show.bs.tab', function(e) {
		activeTab = e.target.getAttribute('data-tab');
		loadTab(activeTab, '#wizard-tab-'+activeTab);
		console.log('show.bs.tab: ', activeTab);
	});

	loadTab(activeTab, '#wizard-tab-'+activeTab);

	show_content();
}

function loadTab(activeTab, container, params){
	getPartial('wizards/'+activeTab, function(template) {
		var data = {};
		var rendered;

		data.frases = PbxObject.frases;
		if(params) data.data = params;

		rendered = Mustache.render(template, data);

		$(container).html(rendered);
	});
}
function load_new_trunk() {

	var trunks = [
		{
			type: 'sip',
			name: 'SIP trunk',
			href: '#trunk/trunk',
			icon: 'fa fa-fw fa-phone'
		}, {
			type: 'Messenger',
			name: 'Messenger',
			href: '#chattrunk/chattrunk?type=Messenger',
			icon: 'fa fa-fw fa-facebook'
		}
	];

	function init(params) {

		var componentParams = {
			frases: PbxObject.frases,
		    trunks: trunks
		};

		ReactDOM.render(NewTrunkComponent(componentParams), document.getElementById('el-loaded-content'));
	}

	init(trunks);
	show_content();
    set_page();

}
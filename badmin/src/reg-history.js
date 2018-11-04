function load_reg_history(params) {

	console.log('load_reg_history: ', params);
	init();

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: params
		};

		ReactDOM.render(UsersRegHistoryComponent(componentParams), document.getElementById('el-loaded-content'));
	}
	
	show_content();
    // set_page();

}
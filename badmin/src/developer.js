function load_developer() {

	init();
	show_content();

	function init(params) {
		var componentParams = {
			frases: PbxObject.frases,
		    params: PbxObject.options
		};

		ReactDOM.render(DeveloperComponent(componentParams), document.getElementById('el-loaded-content'));
	}
}
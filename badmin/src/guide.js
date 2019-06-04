function load_guide() {

	getObjects('chattrunk', function(channels) {
		getExtensions(function(result) {
			ReactDOM.render(GuideComponent({
			    frases: PbxObject.frases,
			    options: PbxObject.options,
			    profile: PbxObject.profile,
			    extensions: result,
			    channels: channels
			}), document.getElementById('dcontainer'));
		})
	})
		

	show_content();

}
function load_profile(){

    var kind = PbxObject.options.profile.kind == 'user' ? 'users' : 'unit';
    var params = extend({}, PbxObject.options.profile);
    var groups = [];

    getObjects(kind, function(result) {
        groups = groups.concat(result);
        init(params, groups);
    });

	function init(profile, groups) {
        show_content();

        var cont = document.getElementById('el-loaded-content');
        var panel = document.createElement('div');
        var panelBody = document.createElement('div');
        var params = extend({}, profile);

        params.permissions = null;

        panel.className = 'panel';
        panelBody.className = 'panel-body';
        panel.appendChild(panelBody);
        cont.appendChild(panel);

        ReactDOM.render(ExtensionComponent({
            frases: PbxObject.frases,
            params: profile,
            groups: groups,
            onSubmit: (PbxObject.isUserAccount ? (checkPermissions('user', 3) ? setExtension : null) : setExtension),
            generatePassword: generatePassword,
            convertBytes: convertBytes,
            getObjects: getObjects,
            isUserAccount: PbxObject.isUserAccount,
            onChange: function() {}
        }), panelBody);
	}	
}
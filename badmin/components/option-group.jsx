function OptGroupComponent(props) {

	function _createOptionsGroups(routes) {
		var optgroups = {}, optgroup, option;
		var list = routes.map(function(item) {
			if(optgroups[item.kind]){
			    optgroup = optgroups[item.kind];
			} else {
			    optgroup = document.createElement('optgroup');
			    optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
			    optgroups[kind] = optgroup;
			    objects.appendChild(optgroup);    
			}
			oid = result[i].oid;
			option = document.createElement('option');
			option.value = oid;
			option.innerHTML = result[i].name;
			optgroup.appendChild(option);
		});
		    kind = result[i].kind;
		    
	}

	return null;
}

OptGroupComponent = React.createFactory(OptGroupComponent);

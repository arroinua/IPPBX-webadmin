function ExtensionPermissionsComponent(props) {

	var frases = props.frases;
	// var defaultPerms = [
	// 	{ name: 'statistics', grant: 0 },
	// 	{ name: 'records', grant: 0 },
	// 	{ name: 'customers', grant: 0 },
	// 	{ name: 'users', grant: 0 },
	// 	{ name: 'equipment', grant: 0 },
	// 	{ name: 'channels', grant: 0 }
	// ];
	var permsList = [
		{ name: 'none', grant: 0 },
		{ name: 'read', grant: 1 },
		{ name: 'read_write', grant: 3 },
		{ name: 'read_write_create', grant: 7 },
		{ name: 'all_operations', grant: 15 }
	];
	var perms = props.permissions;
	// var perms = (props.permissions && props.permissions.length) ? props.permissions : defaultPerms;
	// var permOptions = permsList.map(function(item) { return <option key={item.name} value={item.grant}>{frases.PERMISSIONS.LEVELS[item.name] || item.name}</option> });

	function changePermission(e) {
		var name = e.target.name;
		var value = e.target.value;
		var newPerms = perms.map(function(item) { 
			if(item.name === name) item.grant = parseInt(value, 10);
			return item;
		});

		props.onChange(newPerms);
	}

	return (
		<div className="col-xs-12">
			<table className="table">
				<tbody>
				{
					perms.map(function(perm) {
						if(perm.name.match('^(chatchannel|chattrunk|icd|unit|hunting|phone|user)$')) return null;
						return (
							<tr key={perm.name}>
								<td>{frases.PERMISSIONS.TYPES[perm.name] || perm.name}</td>
								<td className="col-sm-4">
									<select className="form-control" value={perm.grant} name={perm.name} onChange={changePermission}>
										{ 
											permsList.map(function(item) { 
												if(perm.name.match('statistics|records') && item.name.match('read_write|read_write_create|all_operations')) return null;
												else return <option key={item.name} value={item.grant}>{frases.PERMISSIONS.LEVELS[item.name] || item.name}</option> 
											})
										}
									</select>
								</td>
							</tr>
						)
					})
				}
				</tbody>
			</table>
		</div>
	)

}
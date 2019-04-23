function UserStorageComponent(props) {

	function getExtension(e) {
		e.preventDefault();
		props.getExtension(props.user.oid);
	}

	return (
	    <tr>
	    	<td><a href="#" onClick={getExtension}>{ props.user ? (props.user.ext + ' - ' + props.user.name) : null }</a></td>
	    	<td>{ props.size }</td>
	    	<td>{ props.limit }</td>
	    	<td>{ props.free }</td>
	    </tr>
	);
}
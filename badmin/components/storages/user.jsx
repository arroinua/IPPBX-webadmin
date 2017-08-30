function UserStorageComponent(props) {

	return (
	    <tr>
	    	<td>{ props.user }</td>
	    	<td>{ props.size }</td>
	    	<td>{ props.limit }</td>
	    </tr>
	);
}
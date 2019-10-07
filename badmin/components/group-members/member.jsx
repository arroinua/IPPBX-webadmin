function GroupMemberComponent(props) {

	var item = props.item;
	var itemState = props.itemState;

	function getExtension() {
		if(!item.kind || item.kind === 'user' || item.kind === 'phone') {
			props.getExtension(item.oid);
		} else {
			window.location.hash = '#' + item.kind + '/' + item.oid;
		}
	}

	function deleteMember(e) {
		e.stopPropagation();
		props.deleteMember(item);
	}

	return (
	    <tr id={item.oid} onClick={getExtension} style={{ cursor: "pointer" }}>
	    	{
	    		props.sortable && (
	    			<td className="draggable" style={{ textAlign: "center" }}>
	    				<i className="fa fa-ellipsis-v"></i>
	    			</td>
	    		)
	    	}
	    	<td style={{ textAlign: "center" }}><span className={"fa " + props.icon}></span></td>
	    	<td data-cell="status" style={{ "textAlign": "left" }}><span className={"label label-"+itemState.className}>{ itemState.rstatus }</span> { item.logged ? <span className="label label-success"><i className="fa fa-fw fa-phone"></i></span> : '' }</td>
	    	<td data-cell="ext">{item.number || item.ext}</td>
	    	<td data-cell="name">{item.name}</td>
	    	{
	    		props.withGroup && (
			    	<td data-cell="group">{item.group}</td>
	    		)
	    	}
	    	<td data-cell="reg">{item.reg}</td>
	    	<td style={{ "textAlign": "right" }}>
	    		<button className="btn btn-link btn-danger btn-md" onClick={deleteMember}><i className="fa fa-trash"></i></button>
	    	</td>
	    </tr>
	);
}

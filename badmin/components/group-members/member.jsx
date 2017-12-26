function GroupMemberComponent(props) {

	var item = props.item;
	var itemState = props.itemState;

	return (
	    <tr id={item.oid} key={item.number || item.ext}>
	    	{
	    		props.sortable && (
	    			<td className="draggable">
	    				<i className="fa fa-ellipsis-v"></i>
	    			</td>
	    		)
	    	}
	    	<td>
	    		<a href="" onClick={props.getExtension}>{item.number || item.ext}</a>
	    	</td>
	    	<td data-cell="name">{item.name}</td>
	    	<td data-cell="reg">{item.reg}</td>
	    	<td data-cell="status" style={{ "textAlign": "right" }}><span className={"label label-"+itemState.className}>{ itemState.rstatus }</span></td>
	    	<td style={{ "textAlign": "right" }}>
	    		<button className="btn btn-link btn-danger btn-md" onClick={props.deleteMember.bind(this, item.oid)}><i className="fa fa-trash"></i></button>
	    	</td>
	    </tr>
	);
}

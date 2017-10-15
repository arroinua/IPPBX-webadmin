function GroupMemberComponent(props) {

	var item = props.item;
	var itemState = props.itemState;

	return (
	    <tr id={item.oid} className={ itemState.rclass } key={item.number || item.ext}>
	    	<td>
	    		<a href="" onClick={props.getExtension}>{item.number || item.ext}</a>
	    	</td>
	    	<td data-cell="name">{item.name}</td>
	    	<td data-cell="reg">{item.reg}</td>
	    	<td data-cell="status" style={{ "textAlign": "right" }}>{ itemState.rstatus }</td>
	    	<td style={{ "textAlign": "right" }}>
	    		<button className="btn btn-danger btn-sm" onClick={props.deleteMember.bind(this, item.oid)}><i className="fa fa-trash"></i></button>
	    	</td>
	    </tr>
	);
}

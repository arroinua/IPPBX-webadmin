function IpTableRowComponent(props) {

	return (
	    <tr>
	    	<td><input className="form-control" name="net" value={props.rule.net} onBlur={props.onBlur} onChange={props.onChange} /></td>
	    	<td><input className="form-control" name="mask" value={props.rule.mask} onBlur={props.onBlur} onChange={props.onChange} /></td>
	    	<td><button type="button" className="btn btn-default btn-link" onClick={props.onClick}><i className="fa fa-remove text-muted"></i></button></td>
	    </tr>
	);
}

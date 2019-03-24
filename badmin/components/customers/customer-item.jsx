function CustomerItemComponent(props) {

	function onClick(e) {
		e.preventDefault();
		props.onClick(props.item);
	}

	return (
		<tr>
			<td>{props.item.name ? props.item.name : (props.item.usinfo && (props.item.usinfo.email || props.item.usinfo.phone))}</td>
			<td>{moment(props.item.created).format('DD/MM/YY HH:mm:ss')}</td>
			<td>{props.item.createdby}</td>
			<td className={props.item.consent ? "text-success" : "text-muted"}>
				<span className={"fa fa-fw "+(props.item.consent ? "fa-check" : "fa-minus")}></span>
			</td>
			<td><a href="#" onClick={onClick}>{props.frases.CUSTOMERS.DETAILS_BTN}</a></td>
		</tr>
	)
}
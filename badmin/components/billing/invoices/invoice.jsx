function InvoiceComponent(props) {
	
	var invoice = props.invoice;
	var item = props.invoice.items[0];
	var cellStyle = {
		borderTop: 'none'
	};

	return (

		<tr>
			<td style={cellStyle}><small className={"label "+(invoice.status === 'paid' ? 'label-success' : 'label-warning')}>{invoice.status}</small></td>
			<td style={cellStyle}><b>{ invoice.currency } { invoice.paidAmount || item.amount } </b></td>
			<td style={cellStyle}><span>{ item.description } </span></td>
			<td style={cellStyle}><span className="text-muted"> { new Date(invoice.createdAt).toLocaleDateString() } </span></td>
		</tr>

	);
}
function CustomerInfoComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var cname = params.name ? params.name : (params.usinfo.email || params.usinfo.phone);

	params.usinfo = params.usinfo || {};

	return (
		<div>
			<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.name} value={cname} />
			<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.created} value={moment(params.created).format('DD/MM/YY HH:mm:ss')} />
			<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.createdby} value={params.createdby} />
			<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.consent} value={params.consent ? frases.CUSTOMERS.HAS_CONSENT_MSG : frases.CUSTOMERS.NO_CONSENT_MSG} />
			<hr/>

			{
				Object.keys(params.usinfo).map(function(key) {
					return <CustomerInfoItemComponent key={key} label={frases.CUSTOMERS.FIELDS[key]} value={params.usinfo[key]} />
				})
			}
			
		</div>
	);
}
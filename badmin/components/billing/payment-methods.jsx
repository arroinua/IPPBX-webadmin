function ManagePaymentMethodComponent(props) {

	function _isCardExpired(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth()+1;
		var year = date.getFullYear();

		return expMonth < month && expYear <= year;
	}

	function _cardWillExpiredSoon(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth()+1;
		var year = date.getFullYear();

		return ((expMonth - month) < 1 && (expYear - year) < 1);
	}

	var profile = props.profile;
	var billingDetails = profile.billingDetails;
	var frases = props.frases;

	return (
		<div>
			<div className="table-responsive">
				<table className="table">
					{
						(billingDetails && billingDetails.length) ? (
							<tbody>
								{
									billingDetails.map(function(item) {
										return (
											<tr key={item.id}>
												<td><span className="text-uppercase">{item.params.brand}</span></td>
												<td className="text-muted" style={{ userSelect: 'none' }}>•••• •••• •••• {item.params.last4}</td>
												<td><span>{item.params.exp_month}/{item.params.exp_year}</span></td>
												<td className="text-right">
													{
														(item.id === profile.billingMethod.id) ? (
															<button className="btn btn-success btn-link"><span className="fa fa-check"></span> {frases.BILLING.PAYMENT_METHODS.PRIMARY_BTN}</button>
														) : (
															<button className="btn btn-link" onClick={function(e) { props.setPrimaryPaymentMethod(item.id) }}>{frases.BILLING.PAYMENT_METHODS.SET_PRIMARY_BTN}</button>
														)
													}
												</td>
												<td className="text-right">
													<button className="btn btn-danger btn-link" onClick={function(e) { props.removePaymentMethod(item.id) }}><span className="fa fa-fw fa-trash"></span> {frases.BILLING.PAYMENT_METHODS.REMOVE_BTN}</button>
												</td>
											</tr>
										)
									})
								}
							</tbody>
						) : (
							<tbody>
								<tr><td colSpan="5">{frases.BILLING.PAYMENT_METHODS.NO_METHODS_MSG}</td></tr>
							</tbody>
						)

					}
				</table>
			</div>
			<div>
				<button className="btn btn-primary" onClick={props.onClick}><i className="fa fa-plus"></i> {frases.BILLING.PAYMENT_METHODS.ADD_NEW_METHOD_BTN}</button>
			</div>
		</div>
	);
}

ManagePaymentMethodComponent = React.createFactory(ManagePaymentMethodComponent);

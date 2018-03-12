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

	var paymentMethod = props.paymentMethod;

	return (
		<div className="text-center">
			<h3><i className="fa fa-credit-card"></i></h3>
			<a href="#" onClick={props.onClick} className="text-uppercase">{ props.buttonText }</a>
			{
				paymentMethod && (
					<div>
						<p className="text-muted" style={{ userSelect: 'none' }}>
							<b>{paymentMethod.params.brand}</b> •••• •••• •••• {paymentMethod.params.last4}
							<br/>
							{paymentMethod.params.exp_month}/{paymentMethod.params.exp_year}
						</p>
						{
							_isCardExpired(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? (
								<div className="alert alert-warning" role="alert">
									Your payment method has been expired. Please <a href="#" onClick={props.onClick} className="alert-link">add a valid payment method</a> to avoid service interruption.
								</div>
							) : _cardWillExpiredSoon(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? (
								<div className="alert alert-warning" role="alert">
									Your payment method will expire soon. Please <a href="#" onClick={props.onClick} className="alert-link">update your payment method</a> to avoid service interruption.
								</div>
							) : ('')
						}
					</div>
				)
			}
					
		</div>
	);
}

ManagePaymentMethodComponent = React.createFactory(ManagePaymentMethodComponent);

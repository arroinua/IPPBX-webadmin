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
	var frases = props.frases;

	return (
		<div className="text-center">
			<h3><i className="fa fa-credit-card"></i></h3>
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
									{frases.BILLING.ALERTS.CARD_EXPIRED_P1} <a href="#" onClick={props.onClick} className="alert-link">{frases.BILLING.UPDATE_PAYMENT_METHOD}</a> {frases.BILLING.ALERTS.CARD_EXPIRED_P2}.
								</div>
							) : _cardWillExpiredSoon(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? (
								<div className="alert alert-warning" role="alert">
									{frases.BILLING.ALERTS.CARD_WILL_EXPIRE_P1} <a href="#" onClick={props.onClick} className="alert-link">{frases.BILLING.UPDATE_PAYMENT_METHOD}</a> {frases.BILLING.ALERTS.CARD_WILL_EXPIRE_P2}.
								</div>
							) : ('')
						}
					</div>
				)
			}
			<a href="#" onClick={props.onClick} className="text-uppercase">{ props.buttonText }</a>
		</div>
	);
}

ManagePaymentMethodComponent = React.createFactory(ManagePaymentMethodComponent);

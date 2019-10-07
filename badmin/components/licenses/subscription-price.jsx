
var SubscriptionPriceComponent = React.createClass({

	propTypes: {
		subscription: React.PropTypes.object,
		discounts: React.PropTypes.array,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object,
		updateLicenses: React.PropTypes.func
	},

	_currencyNameToSymbol: function(name) {
		var symbol = "";

		switch(name) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	},

	_updateLicenses: function(e) {
		e.preventDefault();
		this.props.updateLicenses();
	},

	render: function() {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var attributes = sub.plan.attributes || sub.plan.customData;
		var discounts = this.props.discounts;
		var subAmount = sub.amount;
		var propString = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';
		var currencySymbol = this._currencyNameToSymbol(sub.plan.currency);
		// var addonsPrice = sub.addOns.reduce(function(amount, item) {
		// 	amount += parseFloat(item.price) * item.quantity;
		// 	return amount;
		// }, 0);
		var didsPrice = this.props.dids.reduce(function(amount, item) {
			amount += (item.included ? 0 : parseFloat(item[propString]));
			return amount;
		}, 0);

		// apply discounts
		if(discounts.length) {
			subAmount = subAmount * discounts[0].coupon.percent / 100;
		}

		return (
			<div className="row">
				<div className="col-xs-12">
				    <div className="table-responsive">
				    	<table className="table table-bordered">
				    		<thead>
				    			<tr>
				    				<th>{frases.BILLING.LICENSE}</th>
				    				<th>{frases.BILLING.QUANTITY}</th>
				    				<th>{frases.BILLING.PRICE}</th>
				    				<th>{frases.BILLING.AMOUNT}</th>
				    			</tr>
				    		</thead>
				    		<tbody>
				    			{
				    				sub.addOns.map(function(item) {
				    					if(!item.name) return null;
			    						return (
				    						<tr key={item.name}>
				    							<td>{frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description}</td>
				    							<td>{item.quantity}</td>
				    							<td>{currencySymbol}{item.price}</td>
				    							<td>{currencySymbol}{ (item.quantity * item.price).toFixed(2) } </td>
				    						</tr>
				    					)
				    				})
				    			}
				    			{
				    				sub.quantity ? (
						    			<tr>
						    				<td>{frases.USERS}</td>
						    				<td>{sub.quantity}</td>
						    				<td>{currencySymbol}{sub.plan.price}</td>
						    				<td>{currencySymbol}{(parseFloat(sub.plan.price) * sub.quantity).toFixed(2)}</td>
						    			</tr>
				    				) : null
				    			}
				    			{
				    				(this.props.dids.length) ? (
				    					<tr>
				    						<td>{frases.NUMBERS}</td>
				    						<td>{this.props.dids.length}</td>
				    						<td colSpan="2"> {currencySymbol}{ didsPrice.toFixed(2) } </td>
				    					</tr>	
				    				) : null
				    			}
				    			<tr className="active">
				    				<td colSpan="3">{ sub.plan.billingPeriodUnit === 'years' ? frases.BILLING.ANNUALLY_TOTAL : frases.BILLING.MONTHLY_TOTAL }</td>
				    				<td>{currencySymbol}{parseFloat(subAmount).toFixed(2)}</td>
				    			</tr>
				    			{
				    				sub.plan.trialPeriod ? (
				    					<tr>
				    						<td colSpan="4">{ frases.BILLING.TRIAL_EXPIRES } <b>{ window.moment(sub.trialExpires).format('DD MMMM YYYY') }</b></td>
				    					</tr>
				    				) : ((!sub.plan.trialPeriod && (parseFloat(subAmount) > 0)) ? (
				    					<tr className="active">
				    						<td colSpan="4">{ frases.BILLING.NEXT_CHARGE } <b>{ window.moment(sub.nextBillingDate).format('DD MMMM YYYY') }</b></td>
				    					</tr>
				    				) : null)
				    			}
				    		</tbody>
				    	</table>
				    </div>
				</div>
				<div className="col-xs-12 text-center">
					<a
						href="#"
						className="text-uppercase btn btn-link" 
						onClick={sub.status === 'active' && this._updateLicenses} 
						disabled={sub.status !== 'active'}
					>{frases.BILLING.MANAGE_LICENSES_BTN}</a>
				</div>

			</div>
		);
	}
});

SubscriptionPriceComponent = React.createFactory(SubscriptionPriceComponent);

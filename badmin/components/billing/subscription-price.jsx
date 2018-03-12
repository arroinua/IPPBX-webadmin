
var SubscriptionPriceComponent = React.createClass({

	propTypes: {
		subscription: React.PropTypes.object,
		discounts: React.PropTypes.array,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object
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

	render: function() {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var discounts = this.props.discounts;
		var subAmount = sub.amount;
		var propString = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';
		var currencySymbol = this._currencyNameToSymbol(sub.plan.currency);
		var addonsPrice = sub.addOns.reduce(function(amount, item) {
			amount += parseFloat(item.price) * item.quantity;
			return amount;
		}, 0);
		var didsPrice = this.props.dids.reduce(function(amount, item) {
			amount += parseFloat(item[propString]);
			return amount;
		}, 0);

		// apply discounts
		if(discounts.length) {
			subAmount = subAmount * discounts[0].coupon.percent / 100;
		}

		return (
		    <div>
		    	<h5>
		    		<span>{sub.quantity} x Users</span>
		    		<strong> {currencySymbol}{ (parseFloat(sub.plan.price) * sub.quantity).toFixed(2) } </strong>
		    	</h5>
		    	{
		    		(didsPrice !== 0) && (
		    			<h5>
		    				<span>{this.props.dids.length} x Numbers</span>
		    				<strong> {currencySymbol}{ didsPrice.toFixed(2) } </strong>
		    			</h5>	
		    		)
		    	}
		    	{
		    		(addonsPrice !== 0) && (
		    			<h5>
		    				<span>Addons</span>
		    				<strong> {currencySymbol}{ addonsPrice.toFixed(2) } </strong>
		    			</h5>
		    		)
		    	}
		    	<h3 style={{ margin: 0 }}>
		    		<small>{ sub.plan.billingPeriodUnit === 'years' ? frases.BILLING.ANNUALLY_TOTAL : frases.BILLING.MONTHLY_TOTAL }</small>
		    		<span> {currencySymbol}{parseFloat(subAmount).toFixed(2)} </span>
		    	</h3>
		    	{
		    		!sub.plan.trialPeriod && (
		    			<p className="text-muted">{ frases.BILLING.NEXT_CHARGE } <b>{ window.moment(sub.nextBillingDate).format('DD MMMM YYYY') }</b></p>
		    		)
		    	}
		    </div>
		);
	}
});

SubscriptionPriceComponent = React.createFactory(SubscriptionPriceComponent);

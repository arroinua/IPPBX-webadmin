
var CallCreditsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		discounts: React.PropTypes.array,
		addCredits: React.PropTypes.func,
	},

	getInitialState: function() {
		return {
			credits: null,
			amount: 20,
			amounts: [10,20,50,100]
		};
	},

	componentWillMount: function() {
		this._getCredits();
	},

	componentWillReceiveProps: function(props) {
		this.setState({ credits: null });
		this._getCredits();
	},

	_currencyNameToSymbol: function(name) {
		var symbol = "";

		switch(name.toLowerCase()) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = name;
				break;
		}

		return symbol;
	},

	_onAddCredits: function() {
		var currencySymbol = this._currencyNameToSymbol(this.props.subscription.plan.currency);
		this.props.addCredits({ chargeAmount: this.state.amount, currency: currencySymbol });
	},

	_getCredits: function() {
		BillingApi.getCredits(function(err, response) {
			if(err) {
				this.setState({ credits: 0 });	
				return notify_about('error', err.message);
			}
			this.setState({ credits: (response.result ? response.result.balance : 0) });
		}.bind(this));
	},

	_setAmount: function(e) {
		e.preventDefault();
		var amount = e.target.value;
		this.setState({ amount: amount });
	},

	render: function() {
		var frases = this.props.frases;
		var currencySymbol = this._currencyNameToSymbol(this.props.subscription.plan.currency);

		return (
			<div>
			    <div className="clearfix">
			    	<div className="pull-left">
				    	<h3 style={{ margin: 0 }}>
				    		{
				    			this.state.credits !== null ? (
				    				<span> {currencySymbol}{parseFloat(this.state.credits).toFixed(2)} </span>
				    			) : (
				    				<Spinner/>
				    			)
				    		}
				    	</h3>
				    </div>
				    <div className="pull-right">
				    	<a 
				    		href="#" 
				    		className="text-uppercase" 
				    		style={{ fontSize: "14px" }} 
				    		role="button" 
				    		data-toggle="collapse" 
				    		href="#creditsCollapse" 
				    		aria-expanded="false" 
				    		aria-controls="creditsCollapse"
				    	>{ frases.BILLING.ADD_CALL_CREDITS_BTN }</a>
				    </div>
			    </div>
	    		<div className="collapse" id="creditsCollapse">
	    			<form style={{ margin: "20px 0" }}>
	    				<div className="input-group">
    				    	<select name="credits-amount" className="form-control" value={ this.state.amount } onChange={ this._setAmount }>
    				    	    {
    				    	    	this.state.amounts.map(function(item) {
    				    	    		return <option key={item} value={item}>{currencySymbol}{item}</option>
    				    	    	})
    				    	    }
    				    	</select>
    				    	<span className="input-group-btn">
    				    		<button className="btn btn-primary" type="button" onClick={this._onAddCredits}>{frases.BILLING.BUY_CALL_CREDITS_BTN}</button>
    				    	</span>
	    				</div>
		    		</form>
	    		</div>
			</div>
		);
	}
});

CallCreditsComponent = React.createFactory(CallCreditsComponent);

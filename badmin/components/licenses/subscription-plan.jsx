var SubscriptionPlanComponent = React.createClass({

	propTypes: {
		subscription: React.PropTypes.object,
		frases: React.PropTypes.object,
		openPlans: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		currencyNameToSymbol: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			plans: []
		};
	},

	_openPlans: function(e) {
		if(e) e.preventDefault();
		// this.setState({ changePlanOpened: !this.state.changePlanOpened });

		if(!this.state.plans.length) {
			BillingApi.getPlans({ currency: this.props.subscription.plan.currency }, function(err, response) {
				if(err) return;
				this.setState({ plans: response.result });
			}.bind(this));
		}
	},

	render: function() {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var plans = this.state.plans;
		var currencySymbol = this.props.currencyNameToSymbol(sub.plan.currency);

		return (
		    <div className="clearfix">
		    	<div className="pull-left">
		    		<h3 style={{ margin: 0 }}>
		    			<small>{ frases.BILLING.CURRENT_PLAN } </small>
		    			<span>{ sub.plan.name } </span>
		    		</h3>
		    	</div>
		    	<div className="pull-right">
		    		{
		    			sub.state === 'past_due' ? (
		    				<a href="#" className="btn btn-action" style={{ fontSize: "14px" }} onClick={this.props.renewSub}>{ frases.BILLING.RENEW_SUB }</a>
		    			) : (
		    				<a 
		    					href="#" 
		    					className="text-uppercase" 
		    					style={{ fontSize: "14px" }} 
		    					role="button" 
		    					onClick={this._openPlans}
		    					data-toggle="collapse" 
		    					href="#plansCollapse" 
		    					aria-expanded="false" 
		    					aria-controls="plansCollapse"
		    				>{ frases.BILLING.UPGRADE_PLAN }</a>
		    			)
		    		}
		    	</div>
		    	<div className="row">
		    		<div className="col-xs-12">
		    			<div className="collapse" id="plansCollapse">
		    				{
		    					plans.length ? (
		    						<PlansComponent plans={plans} frases={frases} onPlanSelect={this.props.onPlanSelect} currentPlan={sub.plan} currencySymbol={currencySymbol} />
		    					) : (
		    						<Spinner />
		    					)
		    				}
		    			</div>
		    			<p></p>
		    		</div>
		    	</div>
		    </div>
		);
	}
});

SubscriptionPlanComponent = React.createFactory(SubscriptionPlanComponent);

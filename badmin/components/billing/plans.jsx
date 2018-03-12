
var PlansComponent = React.createClass({

	propTypes: {
		plans: React.PropTypes.array,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.object,
		onPlanSelect: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			plans: []
		};
	},

	getInitialState: function() {
		return {
			showMonthlyPlans: false
		}
	},

	componentDidMount: function() {

		console.log('PlansComponent: ', this.props.currentPlan);

		this.setState({
			showMonthlyPlans: (this.props.currentPlan.billingPeriodUnit === 'months')
		});
	},

	_togglePlans: function(annually) {
		console.log('_togglePlans: ', annually);
		this.setState({ showMonthlyPlans: !annually });
	},

	_filterPlans: function(plan) {
		var showMonthlyPlans = this.state.showMonthlyPlans;
		if(showMonthlyPlans && plan.billingPeriodUnit === 'months') {
			return plan;
		} else if(!showMonthlyPlans && plan.billingPeriodUnit === 'years') {
			return plan;
		} else if(this.props.currentPlan.planId === 'trial' && plan.planId === 'trial') {
			return plan;
		} else {
			return null;
		}
	},

	render: function() {
		var frases = this.props.frases;
		var plans = this.props.plans.filter(this._filterPlans);

		return (
		    <div className="panel-body" style={{ background: 'none' }}>
		    	<div className="row">
		    		<div className="col-xs-12 text-center" style={{ marginBottom: "20px" }}>
			    		<div className="btn-group btn-group-custom" data-toggle="buttons">
			    		  	<label className={"btn btn-primary " + (!this.state.showMonthlyPlans ? 'active' : '')} onClick={this._togglePlans.bind(this, true)}>
			    		    	<input type="radio" name="billing-period" autoComplete="off" checked={!this.state.showMonthlyPlans} /> { frases.BILLING.PLANS.ANNUAL_PLANS }
			    		  	</label>
			    		  	<label className={"btn btn-primary " + (this.state.showMonthlyPlans ? 'active' : '')} onClick={this._togglePlans.bind(this, false)}>
			    		    	<input type="radio" name="billing-period" autoComplete="off" checked={this.state.showMonthlyPlans} /> { frases.BILLING.PLANS.MONTHLY_PLANS }
			    		  	</label>
			    		</div>
					</div>
		    	</div>
		    	<div className="row">
			    	{ plans.map(function(plan, index) {

			    		return (
			    			<div className="col-xs-12 col-sm-6 col-lg-4 text-center" key={plan.planId}>
			    				<PlanComponent plan={plan} frases={frases} onSelect={this.props.onPlanSelect} currentPlan={this.props.currentPlan.planId === plan.planId} />
			    			</div>
			    		);

			    	}.bind(this)) }
			    </div>
		    </div>
		);
	}
});

PlansComponent = React.createFactory(PlansComponent);

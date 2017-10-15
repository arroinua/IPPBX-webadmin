
var PlansComponent = React.createClass({

	propTypes: {
		plans: React.PropTypes.array,
		frases: React.PropTypes.object,
		maxusers: React.PropTypes.number,
		sub: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			plans: []
		};
	},

	render: function() {
		var frases = this.props.frases;
		var plans = this.props.plans;
		var column = plans.length ? (12/plans.length) : 12;
		var maxusers = this.props.maxusers;
		var currentSub = this.props.sub;

		return (
			<div className="row">
				
					{ this.props.plans.map(function(plan, index) {

						return (
							<div className={"col-xs-"+column}>
								<PlanComponent plan={plan} planIndex={index} frases={frases} currentPlan={currentSub.planId} maxusers={maxusers} key={plan.planId} />
							</div>
						);

					}) }
			</div>
		);
	}
});

PlansComponent = React.createFactory(PlansComponent);

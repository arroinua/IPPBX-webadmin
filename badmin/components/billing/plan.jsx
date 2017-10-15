
var PlanComponent = React.createClass({

	propTypes: {
		plan: React.PropTypes.object,
		frases: React.PropTypes.object,
		maxusers: React.PropTypes.number,
		currentPlan: React.PropTypes.string,
		onSelect: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			plan: {}
		};
	},

	_selectPlan: function() {
		this.props.onSelect(this.props.plan);
	},

	render: function() {
		var frases = this.props.frases;
		var plan = this.props.plan;

		return (
			<div className="panel" style={{ border: 'none', boxShadow: 'none', textAlign: 'center' }}>
				<div className="panel-header">{ plan.name }</div>
				<div className="panel-body">
					<ul style={{ padding: '0', listStyle: 'none' }}>
						<li>{plan.price}{plan.currency} { frases.BILLING.PLANS.PER_USER }</li>
					</ul>
					<a href="">{ frases.BILLING.PLANS.SHOW_ALL_FEATURES }</a>
				</div>
				<div className="panel-footer" style={{ padding: 0 }}>
						{ 
							(this.props.currentPlan === plan.planId) ? 
								(<p style={{ padding: "15px 0" }}>{ frases.BILLING.PLANS.CURRENT_PLAN }</p>) : 
								(<button className="btn btn-link text-uppercase" style={{ width: "100%", padding: "15px 0" }} onClick={this._selectPlan}>{ frases.BILLING.PLANS.SELECT_PLAN }</button>)
						}
				</div>
			</div>
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);


var PlanComponent = React.createClass({

	propTypes: {
		plan: React.PropTypes.object,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.object,
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
		var period = plan.billingPeriodUnit;
		var attributes = plan.attributes || plan.customData;

		return (
			<div className="panel" style={{ border: '1px solid #54c3f0', boxShadow: 'none', textAlign: 'center' }}>
				<div className="panel-header" style={{ color: '#55c3f0' }}>{ plan.name }</div>
				<div className="panel-body">
					<ul style={{ padding: '0', listStyle: 'none' }}>
						<li><strong>{period === 'months' ? plan.price : (plan.price / 12)}</strong>{plan.currency} { frases.BILLING.PLANS.PER_USER }/{ frases.BILLING.PLANS.PER_MONTH }</li>
						<li><strong>{attributes.storageperuser}</strong>GB { frases.BILLING.PLANS.PER_USER }</li>
						<li><strong>{attributes.linesperuser}</strong> { frases.BILLING.AVAILABLE_LICENSES.LINES } { frases.BILLING.PLANS.PER_USER }</li>
					</ul>
					<a href="https://ringotel.co/pricing/" target="_blanc">{ frases.BILLING.PLANS.SHOW_ALL_FEATURES }</a>
				</div>
				<div className="panel-footer" style={{ padding: 0, background: 'none', borderTop: 'none' }}>
						{ 
							(this.props.currentPlan.planId === plan.planId) ? 
								(<p style={{ padding: "15px 0" }} className="text-muted text-uppercase">{ frases.BILLING.PLANS.CURRENT_PLAN }</p>) : 
								(<button className="btn btn-link text-uppercase" style={{ width: "100%", padding: "15px 0" }} onClick={this._selectPlan}>{ frases.BILLING.PLANS.SELECT_PLAN }</button>)
						}
				</div>
			</div>
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);

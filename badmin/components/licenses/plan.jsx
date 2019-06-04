
var PlanComponent = React.createClass({

	propTypes: {
		plan: React.PropTypes.object,
		plansLength: React.PropTypes.number,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.bool,
		onSelect: React.PropTypes.func,
		currencySymbol: React.PropTypes.string
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
		var addOns = plan.addOns.reduce(function(obj, item) { obj[item.name] = item; return obj; }, {});
		var symbol = this.props.currencySymbol;

		return (
			<div className="pricing-item" style={{ width: isSmallScreen() ? "100%" : (Math.floor(100 / this.props.plansLength)+"%") }}>
				{
					plan.trialPeriod ? (
						<div className="pricing-head">
							<h4 className="pricing-plan-name">{ plan.name }</h4>
							<h4><strong>{addOns.lines.quantity}</strong> <small>{frases.BILLING.PLANS.LINES}</small></h4>
							<h4><strong>{attributes.maxusers}</strong> <small>{frases.BILLING.PLANS.USERS}</small></h4>
							<h4><strong>{attributes.storageperuser}GB</strong> <small>{ frases.BILLING.PLANS.PER_USER }</small></h4>
							<h4><small>{frases.BILLING.PLANS.UNLIMITED} {frases.BILLING.PLANS.SIP_EXTENSIONS}</small></h4>
						</div>
					) : (
						<div className="pricing-head">
							<h4 className="pricing-plan-name">{ plan.name }</h4>
							<h4>
								<span>{symbol}{addOns.lines.price}</span> <small>{ frases.BILLING.PLANS.PER_LINE }/{ frases.BILLING.PLANS.PER_MONTH }</small>
							</h4>
							<h4><span>{symbol}{period === 'months' ? plan.price : (plan.price / 12)}</span> <small>{ frases.BILLING.PLANS.PER_USER }/{ frases.BILLING.PLANS.PER_MONTH }</small></h4>
							<h4><strong>{attributes.storageperuser}GB</strong> <small>{ frases.BILLING.PLANS.PER_USER }</small></h4>
							<h4><small>{frases.BILLING.PLANS.UNLIMITED} {frases.BILLING.PLANS.SIP_EXTENSIONS}</small></h4>
						</div>
					)
				}
				<div className="pricing-body">
					<p><a href="https://ringotel.co/pricing/" target="_blank">{ frases.BILLING.PLANS.SHOW_ALL_FEATURES }</a></p>
					{ 
						(this.props.currentPlan) ? 
							(
								<p className="text-muted text-uppercase" style={{ padding: "6px 0", margin: "0" }}>{ frases.BILLING.PLANS.CURRENT_PLAN }</p>
							) : (
								plan.trialPeriod ? (
									<button className="btn btn-default" disabled>{ frases.BILLING.PLANS.SELECT_PLAN }</button>
								) : (
									<button className="btn btn-action" onClick={this._selectPlan}>{ frases.BILLING.PLANS.SELECT_PLAN }</button>
								)
							)
					}
				</div>
			</div>
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);

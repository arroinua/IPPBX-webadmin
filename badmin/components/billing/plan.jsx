
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
						<li>{plan.customData.storageperuser}GB Storage per user</li>
						<li>•</li>
						<li>{plan.maxlines ? plan.maxlines : 'Unlimited'} number of lines</li>
						<li>•</li>
						<li>{plan.price}{plan.currency} per user</li>
						<li>•</li>
						<li>{plan.price * this.props.maxusers}{plan.currency} per {this.props.maxusers} users/month</li>
					</ul>
				</div>
				<div className="panel-footer">
					{ 
						(this.props.currentPlan === plan.planId) ? 
							("Your plan") : 
							(<button className="btn btn-link text-uppercase" onClick={this._selectPlan}>Select</button>)
					}
				</div>
			</div>
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);

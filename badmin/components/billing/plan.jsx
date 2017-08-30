
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

	_convertBytes: function(value, fromUnits, toUnits){
	    var coefficients = {
	        'Byte': 1,
	        'KB': 1000,
	        'MB': 1000000,
	        'GB': 1000000000
	    }
	    return value * coefficients[fromUnits] / coefficients[toUnits];
	},

	_selectPlan: function() {
		this.props.onSelect(this.props.plan);
	},

	_convertBytes: function(value, fromUnits, toUnits){
	    var coefficients = {
	        'Byte': 1,
	        'KB': 1000,
	        'MB': 1000000,
	        'GB': 1000000000
	    }
	    return value * coefficients[fromUnits] / coefficients[toUnits];
	},

	render: function() {
		var frases = this.props.frases;
		var plan = this.props.plan;

		return (
			<div className="panel" style={{ border: 'none', boxShadow: 'none', textAlign: 'center' }}>
				<div className="panel-header">{ plan.name }</div>
				<div className="panel-body">
					<ul style={{ padding: '0', listStyle: 'none' }}>
						<li>{this._convertBytes(plan.customData.storageperuser, 'Byte', 'GB')}GB Storage per user</li>
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

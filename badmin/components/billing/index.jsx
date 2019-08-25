var BillingComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		frases: React.PropTypes.object,
		extend: React.PropTypes.func,
		onAddPaymentMethod: React.PropTypes.func,
		setPrimaryPaymentMethod: React.PropTypes.func,
		removePaymentMethod: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			invoices: [],
			openNewCardForm: false
		};
	},

	componentWillMount: function() {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));

		this.setState({
			profile: this.props.profile,
			sub: sub,
			options: this.props.options
		});
	},

	componentWillReceiveProps: function(props) {
		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};

		this.setState({
			sub: sub,
			options: props.options,
			profile: props.profile,
			invoices: props.invoices
		});
	},

	_addPaymentMethod: function(e) {
		if(e) e.preventDefault();
		
		var profile = this.state.profile;

		this.props.onAddPaymentMethod(function(result) {
			if(!result) return;
			
			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _editPaymentMethod: function(e) {
	// 	e.preventDefault();
		
	// 	var profile = this.state.profile;

	// 	this.props.onEditPaymentMethod(function(result) {
	// 		if(!result) return;

	// 		profile.billingMethod = {
	// 			params: result.card
	// 		};

	// 		this.setState({ profile: profile });
	// 	}.bind(this));
	// },

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
				symbol = "€";
				break;
		}

		return symbol;
	},

	render: function() {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var sub = this.state.sub;
		var options = this.props.options;
		var openNewCardForm = this.state.openNewCardForm

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
					{	
						sub.status === 'past_due' ? (
							<div className="alert alert-warning" role="alert">
								{frases.BILLING.ALERTS.PAST_DUE} <a href="#" onClick={this._renewSub} className="alert-link">{frases.BILLING.RENEW_SUB}</a> {frases.OR} <a href="#" onClick={this._updateAndRenewSub} className="alert-link">{frases.BILLING.UPDATE_PAYMENT_METHOD}</a>.
							</div>
						) : (sub.plan.planId === 'trial' && sub.status === 'expired') ? (
							<div className="alert alert-warning" role="alert">
								{frases.BILLING.ALERTS.TRIAL_EXPIRED} <a href="#plansCollapse" data-toggle="collapse" aria-expanded="false" aria-controls="plansCollapse" onClick={this._openPlans} className="alert-link">{frases.BILLING.UPGRADE_PLAN_ALERT_MSG}</a>
							</div>
						) : ('')

					}
					
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<PanelComponent header={frases.BILLING.PAYMENT_METHOD_TITLE}>
							<ManagePaymentMethodComponent 
								frases={frases}
								profile={profile} 
								onClick={this._addPaymentMethod}
								setPrimaryPaymentMethod={this.props.setPrimaryPaymentMethod}
								removePaymentMethod={this.props.removePaymentMethod}
							/>
						</PanelComponent>
					</div>
					<div className="col-xs-12">
						<PanelComponent header={frases.BILLING.INVOICES.INVOICES}>
							<InvoicesComponent items={this.state.invoices} frases={frases} />
						</PanelComponent>
					</div>
				</div>
			</div>
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);

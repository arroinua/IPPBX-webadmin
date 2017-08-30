
var BillingComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		frases: React.PropTypes.object,
		plans: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func
	},

	// getDefaultProps: function() {
	// 	return {
	// 		sub: {}
	// 	};
	// },

	getInitialState: function() {
		return {
			changePlanOpened: false,
			addLicenseOpened: false,
			licenseEdit: false,
			currentPlan: {},
			addOns: {},
			maxusers: '',
			storelimit: '',
			maxlines: '',
			diff: {},
			monthlyTotal: ''
		};
	},

	componentDidMount: function() {
		var options = this.props.options;
		var sub = this.props.sub;
		var addOns = {};

		// Convert subscription addOns from array to object
		if(sub.addOns.length) {
			addOns = sub.addOns.reduce(function(result, item) {
				result[item.name] = item;
				return result;
			}, {});
		}

		this.setState({
			addOns: addOns,
			minUsers: (options.users > 5 ? options.users : 5),
			minStorage: options.storesize,
			maxusers: options.maxusers,
			maxlines: addOns.lines.quantity,
			storelimit: addOns.storage.quantity,
			monthlyTotal: sub.amount
		});
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

	_setUpdate: function(item) {
		console.log('_setUpdate:', item);
		var params = this.state;
		if(item.min !== undefined && item.value < item.min) return;
		if(item.max !== undefined && item.value > item.max) return;
		params[item.key] = item.value;
		this._checkUpdate(params);
	},

	_checkUpdate: function(state) {
		var sub = this.props.sub;
		var options = this.props.options;
		var addOns = this.state.addOns;
		var amount = parseFloat(sub.amount);
		var diff = {
			maxusers: (state.maxusers - options.maxusers),
			storelimit: (state.storelimit - addOns.storage.quantity),
			maxlines: (state.maxlines - addOns.lines.quantity)
		};

		if(options.maxusers !== state.maxusers || addOns.storage.quantity !== state.storelimit || addOns.lines.quantity !== state.maxlines) {
			state.licenseEdit = true;
		} else {
			return this._cancelEditLicenses();
		}

		amount += diff.maxusers * parseFloat(sub.price);
		if(addOns.storage && diff.storelimit)
			amount += this._convertBytes(diff.storelimit, 'Byte', 'GB') * parseFloat(addOns.storage.price);
		if(addOns.lines && diff.maxlines)
			amount += diff.maxlines * parseFloat(addOns.lines.price);
		
		state.diff = diff;
		state.monthlyTotal = amount;

		console.log('_checkUpdate: ', state);

		this.setState(state);
	},

	_addCard: function(e) {
		e.preventDefault();
		this.props.addCard();
	},

	_editCard: function(e) {
		e.preventDefault();
		this.props.editCard();
	},

	_openPlans: function() {
		this.setState({ changePlanOpened: !this.state.changePlanOpened });

		// this.props.getPlans(this.props.sub.currency, function(result) {
		// 	console.log('BillingComponent getPlans: ', result);
		// 	this.setState({ plans: result });
		// }.bind(this));
	},

	_openLicenses: function() {
		this.setState({ addLicenseOpened: !this.state.addLicenseOpened });
	},

	_onPlanSelect: function(plan) {
		console.log('_onPlanSelect: ', plan);
		this.props.onPlanSelect(plan);
	},

	_updateLicenses: function() {
		this.props.updateLicenses();
	},

	_cancelEditLicenses: function() {
		var options = this.props.options;
		var addOns = this.state.addOns;
		this.setState({ 
			licenseEdit: false,
			maxusers: options.maxusers,
			maxlines: addOns.lines.quantity,
			storelimit: addOns.storage.quantity,
			monthlyTotal: this.props.sub.amount
		});
	},

	render: function() {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var sub = this.props.sub;
		var options = this.props.options;
		var plans = this.props.plans;
		var column = plans.length ? (12/plans.length) : 12;
		var onPlanSelect = (profile.billingDetails && profile.billingDetails.card) ? this._onPlanSelect : this._addCard;
		var trial = sub.planId === 'trial' ? true : false;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<h2 className="pull-left">
							<small>Current plan </small>
							<span>{ sub.planId } </span>
							<small className={"label "+(sub.state === 'active' ? 'label-success' : 'label-warning')} style={{ fontSize: "14px" }}>{sub.state}</small>
						</h2>
						<h2 className="pull-right">
							<a href="#" className="text-uppercase" style={{ fontSize: "14px" }} onClick={ this._openPlans }>Upgrade plan</a>
						</h2>
					</div>
					<div className="col-xs-12">
						{
							(profile.billingDetails && profile.billingDetails.card) ? (
								<p className="text-muted" style={{ userSelect: 'none' }}>
									•••• •••• •••• {profile.billingDetails.card.last4}
									<span> </span>
									<a href="#" onClick={this._editCard} className="text-uppercase">Edit</a>
									<br/>
									{profile.billingDetails.card.exp_month}/{profile.billingDetails.card.exp_year}
								</p>
							) : (
								<div className="alert alert-info" role="alert">
									To upgrade plan and add licenses, please <a href="#" onClick={this._addCard} className="alert-link">add credit card</a> to your account
								</div>
							)
						}
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12 col-custom">
						<div className={"panel " + (this.state.changePlanOpened ? "" : " minimized")}>
						    <div className="panel-body">
						    	<div className="row">
							    	{ plans.map(function(plan, index) {

							    		return (
							    			<div className={"col-xs-12 col-sm-"+column} key={plan.planId}>
							    				<PlanComponent plan={plan} onSelect={onPlanSelect} currentPlan={sub.planId} maxusers={options.maxusers} />
							    			</div>
							    		);

							    	}) }
							    </div>
						    </div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<div className="panel">
							<div className="panel-header">
								<span>Available licenses</span>
							</div>
							<div className="panel-body">
								<div className="row" style={{ textAlign: "center" }}>
							        <div className="col-sm-4">
							        	<div className="input-group">
							        		<span className="input-group-btn">
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "maxusers", value: (this.state.maxusers-1), min: this.state.minUsers })}><i className="fa fa-minus"></i></button>
							        		</span>
							        		<h3 className="data-model">{ this.state.maxusers }</h3>
							        		<span className="input-group-btn">
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "maxusers", value: (this.state.maxusers+1) })}><i className="fa fa-plus"></i></button>
							        		</span>
							        	</div>
							            <p>Users</p>
							        </div>
							        <div className="col-sm-4">
							        	<div className="input-group">
							        		<span className="input-group-btn">
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "storelimit", value: (this.state.storelimit-5000000000), min: this.state.minStorage })}><i className="fa fa-minus"></i></button>
							        		</span>
							            	<h3 className="data-model">{ this._convertBytes(this.state.storelimit, 'Byte', 'GB') }</h3>
								            <span className="input-group-btn">
								            	<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "storelimit", value: (this.state.storelimit+5000000000) })}><i className="fa fa-plus"></i></button>
								            </span>
								        </div>
							            <p>Extra Storage (GB)</p>
							        </div>
							        <div className="col-sm-4">
							        	<div className="input-group">
							        		<span className="input-group-btn">
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "maxlines", value: (this.state.maxlines-2), min: 0 })}><i className="fa fa-minus"></i></button>
							        		</span>
							            	<h3 className="data-model">{ this.state.maxlines }</h3>
							                <span className="input-group-btn">
							                	<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUpdate.bind(this, { key: "maxlines", value: (this.state.maxlines+2) })}><i className="fa fa-plus"></i></button>
							                </span>
							            </div>
							            <p>Extra Lines</p>
							        </div>
							    </div>
								<hr/>
							    <div className="row">
									<div className="col-xs-12">
										<div className="alert alert-info" role="alert">
											To add more licenses, please <a href="#" onClick={this._openPlans} className="alert-link">upgrade your plan</a>
										</div>
										<div className={"text-center "+(this.state.licenseEdit ? '' : 'hidden')}>
											<button className="btn btn-default btn-lg" style={{ marginRight: "5px" }} onClick={this._cancelEditLicenses}>Cancel</button>
											<span>  </span>
											<button className="btn btn-primary btn-lg" onClick={this._updateLicenses}>Update licenses </button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<h2><small>Monthly total</small> {this.state.monthlyTotal} {sub.currency}</h2>
					</div>
				</div>
			</div>
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);

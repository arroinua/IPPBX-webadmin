
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
		updateLicenses: React.PropTypes.func,
		extend: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			changePlanOpened: false,
			addLicenseOpened: false
		};
	},

	componentDidMount: function() {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));

		// Convert subscription addOns from array to object
		// if(sub.addOns.length) {
		// 	addOns = sub.addOns.reduce(function(result, item) {
		// 		result[item.name] = item;
		// 		return result;
		// 	}, {});
		// }

		this.setState({
			sub: sub,
			minUsers: options.users,
			minStorage: options.storesize
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

	_setUsersQuantity: function(params) {
		console.log('_setUsers:', params);
		var sub = this.state.sub;
		var total = sub.quantity + params.quantity;
		if(total < this.state.minUsers) return;
		sub.quantity = total;

		sub.amount = this._countSubAmount(sub);
		this.setState({ sub: sub });
		
	},

	_setAddonQuantity: function(params) {
		console.log('_setAddonQuantity:', params);
		var sub = this.state.sub;
		var addon = sub.addOns[params.index];
		var newQuantity = addon.quantity + params.quantity;

		if(newQuantity < 0) return;
		if(addon.name === 'storage' && newQuantity < this.state.minStorage) return;

		addon.quantity = newQuantity;
		sub.addOns[params.index] = addon;
		sub.amount = this._countSubAmount(sub);
		this.setState({ sub: sub });
	},

	_countSubAmount: function(sub) {
		var amount = sub.quantity * sub.plan.price;
		if(sub.addOns && sub.addOns.length){
		    sub.addOns.forEach(function (item){
		        if(item.quantity) amount += (item.price * item.quantity);
		    });
		}

		return amount.toFixed(2);
	},

	_countNewPlanAmount: function(currsub, newsub) {
		var currAmount = currsub.amount;
		var newAmount = newsub.amount;
		var chargeAmount = 0;
		var prorationRatio = 1;
		var proratedAmount = 0;

		console.log('_countPayAmount: ', currsub, newsub);

		// if new plan with different billing period
		if(currsub.plan.trialPeriod || newsub.plan.billingPeriod !== currsub.plan.billingPeriod || newsub.plan.billingPeriodUnit !== currsub.plan.billingPeriodUnit) {
			newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
			newsub.prevBillingDate = Date.now();
		} else {
			var cycleDays = moment(newsub.nextBillingDate).diff(moment(newsub.prevBillingDate), 'days');
			var proratedDays = moment(newsub.nextBillingDate).diff(moment(), 'days');
			prorationRatio = proratedDays/cycleDays;

			console.log('_countPayAmount: ', cycleDays, proratedDays);
		}
		
		currAmount = currAmount * prorationRatio;
		chargeAmount = newAmount * prorationRatio;

		if(chargeAmount >= currAmount) {
			chargeAmount = chargeAmount - currAmount;
		} else {
			proratedAmount = currAmount - chargeAmount;
			chargeAmount = 0;
		}

		console.log('_countPayAmount: ', currAmount, newAmount, chargeAmount, proratedAmount);
		return { totalAmount: newAmount, chargeAmount: chargeAmount };
	},

	_setUpdate: function(item) {
		console.log('_setUpdate:', item);
		var params = this.state;
		if(item.min !== undefined && item.value < item.min) return;
		if(item.max !== undefined && item.value > item.max) return;
		params[item.key] = item.value;
		this._checkUpdate(params);
	},

	_addCard: function(e) {
		if(e) e.preventDefault();
		this.props.addCard();
	},

	_editCard: function(e) {
		e.preventDefault();
		this.props.editCard();
	},

	_getPaymentMethod: function(sources) {
		if(!sources || !sources.length) return null;
		return sources.reduce(function(prev, next) {
			if(next.default) return prev = next;
		}, null);
	},

	_openPlans: function(e) {
		if(e) e.preventDefault();
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
		var profile = this.props.profile;
		var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		if(!paymentMethod) return this._addCard();

		var sub = this.state.sub;
		sub.plan = plan;
		sub.amount = this._countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);


		var confirm = window.confirm('Your new monthly rate would be '+amounts.totalAmount+'. Today you will be charged '+amounts.chargeAmount.toFixed(2)+'.');
		if(confirm) {
			console.log('confirm change plan');
			this.props.onPlanSelect(plan);
		} else {
			sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
			sub.amount = this._countSubAmount(sub);
		}
	},

	_updateLicenses: function() {
		var sub = this.state.sub;
		var chargeAmount = sub.amount - this.props.sub.amount;
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		console.log('updateLicenses: ', cycleDays, proratedDays, chargeAmount);
		
		if(chargeAmount < 0) 
			chargeAmount = 0;
		else 
			chargeAmount = chargeAmount * (proratedDays/cycleDays);

		console.log('updateLicenses2: ', sub.amount, chargeAmount);

		var confirm = window.confirm('Your new monthly rate would be '+sub.amount+'. Today you will be charged '+chargeAmount.toFixed(2)+'.');
		if(confirm) {
			console.log('confirm update');
			this.props.updateLicenses(sub);
		}

	},

	_cancelEditLicenses: function() {
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		this.setState({ 
			sub: sub
		});
	},

	render: function() {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var sub = this.props.sub;
		var currSub = this.state.sub;
		var options = this.props.options;
		var plans = this.props.plans;
		var column = plans.length ? (12/plans.length) : 12;
		var onPlanSelect = this._onPlanSelect;
		var trial = sub.plan.planId === 'trial' ? true : false;

		console.log('billing render component: ', sub, currSub);

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<h2 className="pull-left">
							<small>Current plan </small>
							<span>{ sub.plan.name } </span>
							<small className={"label "+(sub.state === 'active' ? 'label-success' : 'label-warning')} style={{ fontSize: "14px" }}>{sub.state}</small>
						</h2>
						<h2 className="pull-right">
							<a href="#" className="text-uppercase" style={{ fontSize: "14px" }} onClick={ this._openPlans }>Upgrade plan</a>
						</h2>
					</div>
					<div className="col-xs-12">
						{
							paymentMethod ? (
								<p className="text-muted" style={{ userSelect: 'none' }}>
									<b>{paymentMethod.params.brand}</b> •••• •••• •••• {paymentMethod.params.last4}
									<span> </span>
									<a href="#" onClick={this._editCard} className="text-uppercase">Edit</a>
									<br/>
									{paymentMethod.params.exp_month}/{paymentMethod.params.exp_year}
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
					<div className="col-xs-12">
						<h2><small>Monthly total</small> {sub.plan.currency} {sub.amount}</h2>
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
							    				<PlanComponent plan={plan} onSelect={onPlanSelect} currentPlan={sub.plan.planId} maxusers={options.maxusers} />
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
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUsersQuantity.bind(this, { quantity: -1 })}><i className="fa fa-minus"></i></button>
							        		</span>
							        		<h3 className="data-model">{ currSub.quantity }</h3>
							        		<span className="input-group-btn">
							        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setUsersQuantity.bind(this, { quantity: +1 })}><i className="fa fa-plus"></i></button>
							        		</span>
							        	</div>
							            <p>Users</p>
							        </div>

							        {
							        	currSub.addOns.map(function(item, index) {

							        		return (

					        			        <div className="col-sm-4" key={item.name}>
					        			        	<div className="input-group">
					        			        		<span className="input-group-btn">
					        			        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setAddonQuantity.bind(this, { index: index, quantity: -1 })}><i className="fa fa-minus"></i></button>
					        			        		</span>
					        			            	<h3 className="data-model">{ item.quantity }</h3>
					        				            <span className="input-group-btn">
					        				            	<button className="btn btn-default" type="button" disabled={trial} onClick={this._setAddonQuantity.bind(this, { index: index, quantity: +1 })}><i className="fa fa-plus"></i></button>
					        				            </span>
					        				        </div>
					        			            <p>{ item.name }</p>
					        			        </div>

							        		);

							        	}.bind(this))
							        }

							    </div>
							    <div className="row">
									<div className="col-xs-12">
										<div className={"alert alert-info "+((paymentMethod && trial)  ? '' : 'hidden')} role="alert">
											To add more licenses, please <a href="#" onClick={this._openPlans} className="alert-link">upgrade your plan</a>
										</div>
										<div className={"text-center "+(sub.amount !== currSub.amount ? '' : 'hidden')}>
											<hr/>
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
						<div className="panel">
							<div className="panel-header">
								<span>Invoices</span>
							</div>
							<div className="panel-body">
								<p>No invoices for period</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);

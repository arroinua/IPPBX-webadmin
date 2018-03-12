
var BillingComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object,
		invoices: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		extend: React.PropTypes.func,
		addCoupon: React.PropTypes.func,
		utils: React.PropTypes.object,
	},

	getInitialState: function() {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			plans: [],
			invoices: []
			// changePlanOpened: false,
			// addLicenseOpened: false
		};
	},

	componentWillMount: function() {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			profile: this.props.profile,
			sub: sub,
			options: this.props.options,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			minUsers: options.users,
			minStorage: options.storesize
		});
	},

	componentWillReceiveProps: function(props) {
		console.log('componentWillReceiveProps: ', props);

		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			sub: sub,
			options: props.options,
			profile: props.profile,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			invoices: props.invoices,
			discounts: props.discounts,
			stateChanged: true
		});
	},

	_extendAddons: function(addOns, array) {
		var newItem;
		return addOns.map(function(addon) {
			newItem = {};
			array.forEach(function(item){
				if(addon.name === item.name) {
					newItem = deepExtend(newItem, addon);
					newItem.quantity = item.quantity;
				}
			});
			return newItem;
		});
	},

	_countSubAmount: function(sub) {
		var amount = sub.quantity * sub.plan.price;
		var priceProp = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';

		if(sub.addOns && sub.addOns.length){
		    sub.addOns.forEach(function (item){
		        if(item.quantity) amount += (item.price * item.quantity);
		    });
		}

		if(sub.hasDids) {
			this.props.dids.forEach(function(item) {
				amount += item.included ? 0 : parseFloat(item[priceProp]);
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
			prorationRatio = this.state.proratedDays / this.state.cycleDays;
			
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
		
		var profile = this.state.profile;

		this.props.addCard(function(result) {
			if(!result) return;
			
			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	_editCard: function(e) {
		e.preventDefault();
		
		var profile = this.state.profile;

		this.props.editCard(function(result) {
			if(!result) return;

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _openPlans: function(e) {
	// 	if(e) e.preventDefault();
	// 	// this.setState({ changePlanOpened: !this.state.changePlanOpened });

	// 	if(!this.state.plans.length) {
	// 		billingRequest('getPlans', { currency: this.props.sub.plan.currency }, function(err, response) {
	// 			if(err) return;
	// 			this.setState({ plans: response.result });
	// 		}.bind(this));
	// 	}
	// },

	// _openLicenses: function() {
	// 	this.setState({ addLicenseOpened: !this.state.addLicenseOpened });
	// },

	_onPlanSelect: function(plan) {
		console.log('_onPlanSelect 1: ', plan, this.state.sub);
		var profile = this.props.profile;
		var paymentMethod = profile.billingMethod;

		var sub = JSON.parse(JSON.stringify(this.props.sub));
		sub.plan = plan;
		sub.addOns = this._extendAddons(plan.addOns, sub.addOns);

		console.log('_onPlanSelect 2: ', plan, sub);
		
		sub.amount = this._countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		this.props.onPlanSelect({ 
			plan: plan,
			annually: (plan.billingPeriodUnit === 'years'),
			payment: {
				currency: plan.currency,
				totalAmount: amounts.totalAmount,
				discounts: this.props.discounts,
				chargeAmount: amounts.chargeAmount.toFixed(2)
			}
		});

		// sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		// sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		// sub.amount = this._countSubAmount(sub);
	},

	_updateLicenses: function(params) {

		console.log('_updateLicenses: ', params);

		var sub = this.state.sub;
		sub.quantity = params.quantity;
		sub.addOns = params.addOns;
		sub.amount = this._countSubAmount(sub);

		var chargeAmount = sub.amount - this.props.sub.amount;
		
		if(chargeAmount < 0) chargeAmount = 0;
		else chargeAmount = chargeAmount * (this.state.proratedDays / this.state.cycleDays);

		this.props.updateLicenses({
			addOns: sub.addOns,
			quantity: sub.quantity,
			payment: {
				currency: sub.plan.currency,
				totalAmount: sub.amount,
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2)
			}
		});

	},

	_updateAndRenewSub: function(e) {
		if(e) e.preventDefault();
		this.props.editCard(function(result) {
			if(!result) return;

			var profile = this.state.profile;
			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });

			this.props.renewSub(function(err) {
				if(err) return;
				var sub = this.state.sub;
				sub.state = 'active';
				this.setState({ sub: sub });
			});
		}.bind(this));
	},

	_renewSub: function(e) {
		if(e) e.preventDefault();
		this.props.renewSub(function(err) {
			if(err) return;
			var sub = this.state.sub;
			sub.state = 'active';
			this.setState({ sub: sub });
		}.bind(this));
	},

	_addCoupon: function(coupon) {
		this.props.addCoupon(coupon);
	},

	// _currencyNameToSymbol: function(name) {
	// 	var symbol = "";

	// 	switch(name) {
	// 		case "eur":
	// 			symbol = "€";
	// 			break;
	// 		case "usd":
	// 			symbol = "$";
	// 			break;
	// 		default:
	// 			symbol = "€";
	// 			break;
	// 	}

	// 	return symbol;
	// },

	render: function() {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var paymentMethod = profile.billingMethod;
		var sub = this.state.sub;
		var discounts = this.props.discounts;
		var options = this.props.options;
		var plans = this.state.plans;
		var column = plans.length ? (12/plans.length) : 12;
		var trial = sub.plan.planId === 'trial' || sub.state === 'past_due';

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
					{	
						sub.status === 'past_due' ? (
							<div className="alert alert-warning" role="alert">
								We were not able to receive subscription payment. You may not use all available features on your subscription plan. Please, ensure that your payment method is valid and has sufficient funds and <a href="#" onClick={this._renewSub} className="alert-link">renew subscription</a> or <a href="#" onClick={this._updateAndRenewSub} className="alert-link">update your payment method</a>.
							</div>
						) : (sub.plan.planId === 'trial' && sub.status === 'expired') ? (
							<div className="alert alert-warning" role="alert">
								Your trial period has been expired. <a href="#plansCollapse" data-toggle="collapse" aria-expanded="false" aria-controls="plansCollapse" onClick={this._openPlans} className="alert-link">Upgrade your subscription plan</a> and use all available features.
							</div>
						) : ('')

					}
					
					</div>
				</div>
				<div className="row">
					<div className="col-sm-8">
						<PanelComponent>
							<SubscriptionPriceComponent 
								frases={frases} 
								subscription={sub} 
								discounts={discounts} 
								dids={this.props.dids} 
							/>
							<br/>
							<SubscriptionPlanComponent 
								frases={frases} 
								subscription={sub}
								plans={plans}
								renewSub={this._renewSub}
								onPlanSelect={this._onPlanSelect}
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-4">
						<PanelComponent>
							<ManagePaymentMethodComponent 
								paymentMethod={paymentMethod} 
								onClick={paymentMethod ? this._editCard : this._addCard}
								buttonText={paymentMethod ? frases.BILLING.EDIT_PAYMENT_METHOD : frases.BILLING.ADD_CREDIT_CARD}
							/>
						</PanelComponent>
					</div>
				</div>

				<PanelComponent header={frases.USAGE.PANEL_TITLE}>
					<StorageUsageComponent 
						frases={frases} 
						stateChanged={this.state.stateChanged} 
						subscription={sub}
						updateLicenses={this._updateLicenses}
						utils={this.props.utils} 
					/>
				</PanelComponent>

			    <div className="row">
					<div className="col-sm-8">
						<InvoicesComponent items={this.state.invoices} frases={frases} />
					</div>
					<div className="col-sm-4">
						<DiscountsComponent items={discounts} addCoupon={this._addCoupon} frases={frases} />
					</div>
				</div>
			</div>
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);

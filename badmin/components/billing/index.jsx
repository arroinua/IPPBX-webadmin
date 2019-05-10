
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
		addCredits: React.PropTypes.func,
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

		console.log('BillingComponent proration: ', cycleDays, proratedDays);

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
		var totalAmount = 0;
		var proratedAmount = null;
		var currentSubProration = null;
		var newSubProration = null;
		var getProration = this.props.utils.getProration;

		console.log('_countPayAmount: ', currsub, newsub);

		if(parseFloat(currAmount) <= 0 || currsub.plan.trialPeriod || currsub.plan.billingPeriod !== newsub.plan.billingPeriod || currsub.plan.billingPeriodUnit !== newsub.plan.billingPeriodUnit) {
			newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
			newsub.prevBillingDate = Date.now();
			chargeAmount = parseFloat(newAmount);

		} else {
			currentSubProration = getProration(currsub, currAmount)
			newSubProration = getProration(newsub, newAmount);

			if(newSubProration >= currentSubProration) {
				chargeAmount = newSubProration - currentSubProration;
			} else {
				proratedAmount = currentSubProration - newSubProration;
				chargeAmount = 0;
			}

			console.log('changePlan proration: ', currAmount, newAmount, currentSubProration, newSubProration, chargeAmount, proratedAmount);
		}

		// if new plan with different billing period
		// if(currAmount <= 0 || currsub.plan.trialPeriod || newsub.plan.billingPeriod !== currsub.plan.billingPeriod || newsub.plan.billingPeriodUnit !== currsub.plan.billingPeriodUnit) {
		// 	newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
		// 	newsub.prevBillingDate = Date.now();
		// } else {
		// 	prorationRatio = this.state.proratedDays / this.state.cycleDays;
		// }
		
		// currAmount = currAmount * prorationRatio;
		// chargeAmount = newAmount * prorationRatio;

		// if(chargeAmount >= currAmount) {
		// 	chargeAmount = chargeAmount - currAmount;
		// } else {
		// 	proratedAmount = currAmount - chargeAmount;
		// 	chargeAmount = 0;
		// }

		// totalAmount = newAmount - currAmount;

		// console.log('_countPayAmount: ', currAmount, newAmount, chargeAmount, proratedAmount);
		return { newSubAmount: newAmount, totalAmount: (totalAmount > 0 ? totalAmount : 0), chargeAmount: chargeAmount };
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

		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var nextBillingDate = sub.nextBillingDate;
		var isTrial = plan.planId === 'trial';

		sub.plan = plan;
		sub.addOns = this._extendAddons(plan.addOns, sub.addOns);		
		sub.amount = this._countSubAmount(sub);

		console.log('_onPlanSelect 2: ', plan, sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		this.props.onPlanSelect({ 
			plan: plan,
			annually: (plan.billingPeriodUnit === 'years'),
			payment: {
				currency: plan.currency,
				newSubAmount: amounts.newSubAmount,
				discounts: this.props.discounts,
				nextBillingDate: (nextBillingDate && !isTrial ? moment(nextBillingDate).format('DD/MM/YY') : null),
				chargeAmount: amounts.chargeAmount.toFixed(2),
				totalAmount: amounts.totalAmount.toFixed(2)
			}
		});

		// sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		// sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		// sub.amount = this._countSubAmount(sub);
	},

	_updateLicenses: function(params) {

		var getProration = this.props.utils.getProration;
		var sub = this.state.sub;
		sub.quantity = params.quantity;
		sub.addOns = params.addOns;
		sub.amount = this._countSubAmount(sub);

		var chargeAmount = 0;
		var totalAmount = parseFloat(sub.amount) - parseFloat(this.props.sub.amount);
		var proration = getProration(sub, totalAmount);

		if(totalAmount > 0) {
			chargeAmount = proration > 1 ? proration : 1;
		}

		console.log('_updateLicenses: ', totalAmount, proration);

		this.props.updateLicenses({
			addOns: sub.addOns,
			quantity: sub.quantity,
			annually: (sub.plan.billingPeriodUnit === 'years'),
			payment: {
				currency: sub.plan.currency,
				newSubAmount: sub.amount,
				nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY'),
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2),
				totalAmount: totalAmount.toFixed(2)
			}
		});

		sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		sub.quantity = this.props.sub.quantity;
		sub.amount = this._countSubAmount(sub);

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
					<div className="col-sm-4">
						<PanelComponent>
							<SubscriptionPriceComponent 
								frases={frases} 
								subscription={sub} 
								discounts={discounts} 
								dids={this.props.dids} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-4">
						<PanelComponent>
							<CallCreditsComponent 
								frases={frases} 
								subscription={sub} 
								addCredits={this.props.addCredits}
								discounts={discounts} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-4">
						<PanelComponent>
							<ManagePaymentMethodComponent 
								frases={frases}
								paymentMethod={paymentMethod} 
								onClick={paymentMethod ? this._editCard : this._addCard}
								buttonText={paymentMethod ? frases.BILLING.EDIT_PAYMENT_METHOD : frases.BILLING.ADD_CREDIT_CARD}
							/>
						</PanelComponent>
					</div>
				</div>
				
				<PanelComponent>
					<SubscriptionPlanComponent 
						frases={frases} 
						subscription={sub}
						plans={plans}
						renewSub={this._renewSub}
						onPlanSelect={this._onPlanSelect}
					/>
				</PanelComponent>

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

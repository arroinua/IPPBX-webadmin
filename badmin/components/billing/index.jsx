
var BillingComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		frases: React.PropTypes.object,
		plans: React.PropTypes.array,
		invoices: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		extend: React.PropTypes.func,
		addCoupon: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			invoices: [],
			changePlanOpened: false,
			addLicenseOpened: false
		};
	},

	componentWillReceiveProps: function(props) {
		console.log('componentWillReceiveProps: ', props);

		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			sub: sub,
			profile: props.profile,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			invoices: props.invoices,
			discounts: props.discounts
		});
	},

	componentDidMount: function() {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		// Convert subscription addOns from array to object
		// if(sub.addOns.length) {
		// 	addOns = sub.addOns.reduce(function(result, item) {
		// 		result[item.name] = item;
		// 		return result;
		// 	}, {});
		// }

		this.setState({
			profile: this.props.profile,
			sub: sub,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
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


			// profile.billingDetails = profile.billingDetails || [];
			// profile.billingDetails.push(result.card);
			// profile.defaultBillingMethod = {
			// 	params: result.card
			// };
			
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

			// profile.billingDetails = profile.billingDetails || [];
			// profile.billingDetails.push(result.card);
			// profile.defaultBillingMethod = {
			// 	params: result.card
			// };

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _getPaymentMethod: function(sources) {
	// 	if(!sources || !sources.length) return null;
	// 	return sources.reduce(function(prev, next) {
	// 		if(next.default) return prev = next;
	// 	}, null);
	// },

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
		// var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var paymentMethod = profile.billingMethod;
		if(!paymentMethod) return this._addCard();

		var sub = this.state.sub;
		sub.plan = plan;
		sub.amount = this._countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		this.props.onPlanSelect({ 
			plan: plan,
			payment: {
				currency: plan.currency,
				totalAmount: amounts.totalAmount,
				discounts: this.props.discounts,
				chargeAmount: amounts.chargeAmount.toFixed(2)
			}
		});

		sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		sub.amount = this._countSubAmount(sub);
	},

	_updateLicenses: function() {
		var sub = this.state.sub;
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

	_cancelEditLicenses: function() {
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		this.setState({ 
			sub: sub
		});
	},

	_isCardExpired: function(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth()+1;
		var year = date.getFullYear();

		return expMonth < month && expYear <= year;
	},

	_cardWillExpiredSoon: function(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth()+1;
		var year = date.getFullYear();

		return (expMonth - month) < 1;
	},

	_addCoupon: function(coupon) {
		this.props.addCoupon(coupon);
	},

	render: function() {
		var frases = this.props.frases;
		var profile = this.props.profile;
		// var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var paymentMethod = profile.billingMethod;
		var sub = this.props.sub;
		var discounts = this.props.discounts;
		var currSub = this.state.sub;
		var options = this.props.options;
		var plans = this.props.plans;
		var column = plans.length ? (12/plans.length) : 12;
		var onPlanSelect = this._onPlanSelect;
		var trial = sub.plan.planId === 'trial' || sub.state === 'past_due';
		var subAmount = sub.amount;

		// apply discounts
		if(discounts.length) {
			subAmount = subAmount * discounts[0].coupon.percent / 100;
		}

		console.log('billing render component: ', sub, currSub, discounts, subAmount);

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
					{
						!paymentMethod ? (
							<div className="alert alert-info" role="alert">
								{ frases.BILLING.PAYMENT_METHOD_WARNING_P1 } <a href="#" onClick={this._addCard} className="alert-link">{ frases.BILLING.ADD_CREDIT_CARD }</a> { frases.BILLING.PAYMENT_METHOD_WARNING_P2 }
							</div>
						) : this._isCardExpired(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? (
							<div className="alert alert-warning" role="alert">
								Your payment method has been expired. Please <a href="#" onClick={this._editCard} className="alert-link">add a valid payment method</a> to avoid service interruption.
							</div>
						) : this._cardWillExpiredSoon(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? (
							<div className="alert alert-warning" role="alert">
								Your payment method will expire soon. Please <a href="#" onClick={this._editCard} className="alert-link">update your payment method</a> to avoid service interruption.
							</div>
						) : ('')
					}
					{	
						sub.state === 'past_due' ? (
							<div className="alert alert-warning" role="alert">
								We were not able to receive subscription payment. You may not use all available features on your subscription plan. Please, ensure that your payment method is valid and has sufficient funds and <a href="#" onClick={this._renewSub} className="alert-link">renew subscription</a> or <a href="#" onClick={this._updateAndRenewSub} className="alert-link">update your payment method</a>.
							</div>
						) : (sub.plan.planId === 'trial' && sub.state === 'expired') ? (
							<div className="alert alert-warning" role="alert">
								Your trial period has been expired. <a href="#plansCollapse" data-toggle="collapse" aria-expanded="false" aria-controls="plansCollapse" onClick={this._openPlans} className="alert-link">Upgrade your subscription plan</a> and use all available features.
							</div>
						) : ('')

					}
					
					</div>
					<div className="col-sm-6">
						<h2>
							<small>{ frases.BILLING.CURRENT_PLAN } </small>
							<span>{ sub.plan.name } </span>
							{
								sub.state === 'past_due' ? (
									<a href="#" className="text-uppercase" style={{ fontSize: "14px" }} onClick={this._renewSub}>Renew</a>
								) : (
									<a 
										href="#" 
										className="text-uppercase" 
										style={{ fontSize: "14px" }} 
										role="button" 
										onClick={this._openPlans}
										data-toggle="collapse" 
										href="#plansCollapse" 
										aria-expanded="false" 
										aria-controls="plansCollapse"
									>{ frases.BILLING.UPGRADE_PLAN }</a>
								)
							}
						</h2>
						{
							sub.plan.trialPeriod ? (
								<p className="text-muted">{ frases.BILLING.TRIAL_EXPIRES } <b>{ window.moment(this.state.sub.trialExpires).format('DD MMMM YYYY') }</b></p>
							) : (
								<p className="text-muted">{ frases.BILLING.NEXT_CHARGE } <b>{ window.moment(this.state.sub.nextBillingDate).format('DD MMMM YYYY') }</b></p>
							)
						}
					</div>
					<div className="col-sm-6" style={{ textAlign: "right" }}>
						<h2><small>{ frases.BILLING.MONTHLY_TOTAL }</small> {sub.plan.currency} {parseFloat(subAmount).toFixed(2)}</h2>
						{
							paymentMethod && (
								<p className="text-muted" style={{ userSelect: 'none' }}>
									<a href="#" onClick={sub.state === 'past_due' ? this._updateAndRenewSub : this._editCard} className="text-uppercase">{ frases.BILLING.EDIT_PAYMENT_METHOD }</a>
									<span> </span>
									<b>{paymentMethod.params.brand}</b> •••• •••• •••• {paymentMethod.params.last4}
									<br/>
									{paymentMethod.params.exp_month}/{paymentMethod.params.exp_year}
								</p>
							)
						}
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12 col-custom">
						<div className="collapse" id="plansCollapse">
						    <div className="panel-body" style={{ background: 'none' }}>
						    	<div className="row">
							    	{ plans.map(function(plan, index) {

							    		return (
							    			<div className={"col-xs-12 col-sm-4"} key={plan.planId}>
							    				<PlanComponent plan={plan} frases={frases} onSelect={onPlanSelect} currentPlan={sub.plan.planId} maxusers={options.maxusers} />
							    			</div>
							    		);

							    	}) }
							    </div>
						    </div>
						</div>
						<p></p>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<div className="panel">
							<div className="panel-header">
								<span>{ frases.BILLING.AVAILABLE_LICENSES.AVAILABLE_LICENSES }</span>
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
							            <p>{ frases.BILLING.AVAILABLE_LICENSES.USERS }</p>
							        </div>

							        {
							        	currSub.addOns.map(function(item, index) {

							        		return (

					        			        <div className="col-sm-4" key={item.name}>
					        			        	<div className="input-group">
					        			        		<span className="input-group-btn">
					        			        			<button className="btn btn-default" type="button" disabled={trial} onClick={this._setAddonQuantity.bind(this, { index: index, quantity: ( item.name === 'storage' ? -5 : -2 ) })}><i className="fa fa-minus"></i></button>
					        			        		</span>
					        			            	<h3 className="data-model">{ item.quantity }</h3>
					        				            <span className="input-group-btn">
					        				            	<button className="btn btn-default" type="button" disabled={trial} onClick={this._setAddonQuantity.bind(this, { index: index, quantity: ( item.name === 'storage' ? +5 : +2 ) })}><i className="fa fa-plus"></i></button>
					        				            </span>
					        				        </div>
					        			            <p>{ frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] }</p>
					        			        </div>

							        		);

							        	}.bind(this))
							        }

							    </div>
							    <div className="row">
									<div className="col-xs-12">
										<div className={"alert alert-info "+((paymentMethod && trial)  ? 'hidden' : 'hidden')} role="alert">
											To add more licenses, please <a href="#" onClick={this._openPlans} className="alert-link">upgrade your plan</a>
										</div>
										<div className={"text-center "+(sub.amount !== currSub.amount ? '' : 'hidden')}>
											<hr/>
											<button className="btn btn-default btn-lg" style={{ marginRight: "5px" }} onClick={this._cancelEditLicenses}>{ frases.BILLING.CANCEL_LICENSE_UPDATE }</button>
											<span>  </span>
											<button className="btn btn-primary btn-lg" onClick={this._updateLicenses}>{ frases.BILLING.UPDATE_LICENSES } </button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
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

var UpdateLicenseModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		sub: React.PropTypes.object,
		utils: React.PropTypes.object,
		onSubmit: React.PropTypes.func,
		countSubAmount: React.PropTypes.func,
		currencyNameToSymbol: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			quantity: 0,
			addOns: [],
			quantityChanged: false
		};
	},

	componentWillMount: function() {
		var addOns = this.props.sub.addOns.map(function(item) {
			item = extend({}, item);
			return item;
		})
		this.setState({
			quantity: this.props.sub.quantity,
			addOns: addOns
		})
	},

	_updateLicenses: function(params) {

		var getProration = this.props.utils.getProration;
		var sub = deepExtend({}, this.props.sub);

		sub.quantity = this.state.quantity;
		sub.addOns = this.state.addOns;
		sub.amount = this.props.countSubAmount(sub);

		var chargeAmount = 0;
		var totalAmount = parseFloat(sub.amount) - parseFloat(this.props.sub.amount);
		var proration = getProration(sub, totalAmount);

		if(totalAmount > 0) {
			chargeAmount = proration > 1 ? proration : 1;
		}

		console.log('_updateLicenses: ', totalAmount, proration);

		this.props.onSubmit({
			addOns: sub.addOns,
			quantity: sub.quantity,
			annually: (sub.plan.billingPeriodUnit === 'years'),
			payment: {
				noCharge: (chargeAmount <= 0),
				currencySymbol: this.props.currencyNameToSymbol(sub.plan.currency),
				currency: sub.plan.currency,
				newSubAmount: sub.amount,
				nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY'),
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2),
				totalAmount: totalAmount.toFixed(2)
			}
		});
	},

	_onQuantityChange: function(value) {
		if(value < 0 || value < this.props.options.users || value > this.props.sub.plan.attributes.maxusers) return;
		this.setState({ quantity: value, quantityChanged: true });
	},

	_onAddOnQuantityChange: function(addOnName, value) {
		if(value < 0 || ( addOnName === 'storage' && this.props.utils.convertBytes(value, 'GB', "Byte") < this.props.options.storesize)) return;
		var addOns = this.state.addOns.map(function(item) { if(item.name === addOnName) item.quantity = value; return item; })

		this.setState({ addOns: addOns, quantityChanged: true });
	},

	_getBody: function() {
		var frases = this.props.frases;
		var readOnly = this.props.sub.plan.trialPeriod;
		return (
			<div>
				<AddLicenseItemComponent label={frases.USERS} quantity={this.state.quantity} onChange={this._onQuantityChange} />
				{
					this.state.addOns.map(function(item) {
						return (
							<AddLicenseItemComponent key={item.name} label={(item.name && frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()]) ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description} quantity={item.quantity} onChange={this._onAddOnQuantityChange.bind(this, item.name)} readOnly={readOnly} />
						)
					}.bind(this))
				}
			</div>
		);
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				size="sm"
				title={ frases.BILLING.UPDATE_LICENSES }
				submitText={frases.SUBMIT} 
				cancelText={frases.CANCEL} 
				submit={this._updateLicenses}
				closeOnSubmit={true}
				disabled={!this.state.quantityChanged}
				body={body}
			></ModalComponent>

		);
	}
	
});

UpdateLicenseModalComponent = React.createFactory(UpdateLicenseModalComponent);


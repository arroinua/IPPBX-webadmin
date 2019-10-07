var DidTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		buyDidNumber: React.PropTypes.func,
		getObjects: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			init: false,
			fetch: false,
			sub: null,
			isTrial: null,
			totalAmount: 0,
			chargeAmount: 0,
			numbers: null,
			countries: [],
			regions: null,
			locations: null,
			didTypes: ['Local'],
			availableNumbers: null,
			selectedCountry: {},
			selectedRegion: {},
			selectedLocation: {},
			selectedAvailableNumber: {},
			selectedPriceObject: {},
			selectedType: 'Local',
			selectedNumber: {},
			selectedTrunk: {},
			limitReached: false,
			showNewDidSettings: false,
			showConnectTrunkSettings: false,
			fetchingCountries: false
		};
	},

	componentWillMount: function() {
		var sub = {};

		if(!this.props.properties || (!this.props.properties.number && !this.props.properties.id)) 
			return this.setState({ init: true });

		if(this.props.properties.number) {
			this.setState({ fetch: true });

			BillingApi.getSubscription(function(err, response) {
				if(err) {
					this.setState({ fetch: false });
					return notify_about('error' , err.message);
				}

				sub = response.result;

				this._getDid(this.props.properties.number, function(err, response) {
					if(err) {
						this.setState({ fetch: false });
						return notify_about('error', err);
					}

					this.setState({
						init: true,
						isTrial: (sub.plan.planId === 'trial' || sub.plan.numId === 0),
						sub: response.result,
						fetch: false,
						showNewDidSettings: true,
						selectedNumber: response.result	
					});
				}.bind(this));

			}.bind(this));
		} else if(this._isTrunkChannel(this.props.properties.id)) {
			this.setState({
				init: true,
				showConnectTrunkSettings: true
			});
		}

	},

	componentWillReceiveProps: function(props) {
		if(this.state.fetch && props.properties && props.properties.number) {
			this.setState({ fetch: false });

			this._getDid(props.properties.number, function(err, response) {
				if(err) return notify_about('error', err);
				this.setState({ selectedNumber: response.result });

			}.bind(this));
		} else if(this._isTrunkChannel(props.properties.id)) {
			this.setState({ 
				fetch: false,
				showConnectTrunkSettings: true
			});
		}
				
	},

	_onChange: function() {

		var params = {
			poid: this.state.selectedPriceObject ? this.state.selectedPriceObject._id : null,
			dgid: this.state.selectedLocation ? this.state.selectedLocation._id : null,
			anid: this.state.selectedAvailableNumber ? this.state.selectedAvailableNumber.id : null,
			totalAmount: this.state.totalAmount,
			chargeAmount: this.state.chargeAmount,
			newSubAmount: this.state.newSubAmount,
			nextBillingDate: this.state.nextBillingDate,
			currency: this._currencyNameToSymbol(this.state.sub.plan.currency)
		};
		
		this.props.onChange(params);
	},

	_isTrunkChannel: function(str) {
		return (str ? str.indexOf('@') !== -1 : false);
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

	// _setSelectedNumber: function(number) {
	// 	// var data = this.state.data;
	// 	var selectedNumber = this.state.numbers.filter(function(item) { return item.number === number })[0];
	// 	// data.number = data.id = number;

	// 	// this.setState({ data: data, selectedNumber: selectedNumber });
	// 	this.setState({ selectedNumber: selectedNumber });
	// 	// this.props.onChange(data);
	// },

	_onCountrySelect: function(e) {
		var value = e.target.value;
		var state = this.state;
		var country = this.state.countries.filter(function(item) { return item.id === value })[0] || {};
		
		state.selectedCountry = country;
		state.selectedLocation = {};
		state.selectedRegion = {};
		state.selectedLocation = {};
		state.selectedAvailableNumber = {};
		state.regions = null;
		state.locations = null;
		state.needRegion = (country.attributes.iso === 'US' || country.attributes.iso === 'CA');

		this.setState(state);

		if(!value) return;

		if(state.needRegion) {
			BillingApi.request('getDidRegions', { country: country.id }, function(err, response) {
				this.setState({ regions: response.result || [] });
			}.bind(this));
		} else {
			this._getDidLocations({ country: country.id, type: state.selectedType }, function(err, response) {
				if(err) return notify_about('error', err);
				this.setState({ locations: response.result || [] });
			}.bind(this));
		}

	},

	_onRegionSelect: function(e) {
		var value = e.target.value;
		var state = this.state;
		var region = this.state.regions.filter(function(item) { return item.id === value })[0] || {};

		state.selectedRegion = region;
		state.selectedLocation = {};
		state.selectedAvailableNumber = {};
		state.locations = null;

		this.setState(state);

		this._getDidLocations({ country: state.selectedCountry.id, region: region.id, type: state.selectedType }, function(err, response) {
			if(err) return notify_about('error', err);
			this.setState({ locations: response.result || [] });
		}.bind(this));
	},

	_onLocationSelect: function(e) {
		var value = e.target.value;
		var state = this.state;

		var selectedLocation = {};
		var selectedPriceObject = {};

		if(value) {
			selectedLocation = state.locations.filter(function(item) { return item._id === value; })[0];
		}

		state.selectedLocation = selectedLocation;
		state.selectedPriceObject = selectedPriceObject;
		state.selectedAvailableNumber = {};
		state.availableNumbers = null;

		this.setState(state);

		this._getAvailableNumbers({ dgid: selectedLocation._id }, function(err, response) {
			if(err) return notify_about('error', err);

			this.setState({  availableNumbers: response.result });
		}.bind(this));

	},

	_onAvailableNumberSelect: function(e) {
		var value = e.target.value;
		var state = this.state;

		if(value) {
			state.selectedAvailableNumber = state.availableNumbers.filter(function(item) { return item.id === value; })[0];
		}

		this.setState(state);

		this._getDidPrice({ iso: state.selectedCountry.attributes.iso, areaCode: state.selectedLocation.areaCode }, function(err, response) {
			if(err) return notify_about('error', err);
			this._setDidPrice(response.result);
			
		}.bind(this));
	},

	_setDidPrice: function(priceObj) {
		var sub = this.state.sub;
		var amount = this.state.isTrial ? 0 : this._getDidAmount(sub.plan.billingPeriodUnit, priceObj);
		// var proratedAmount = BillingApi.getProration(sub, amount);
		// var proratedAmount = (amount * (this.state.proratedDays / this.state.cycleDays)).toFixed(2);

		this.setState({
			selectedPriceObject: priceObj,
			totalAmount: amount,
			chargeAmount: amount,
			newSubAmount: (parseFloat(sub.amount) + amount),
			nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY')
		});

		this._onChange();
	},

	// _getAssignedDids: function(callback) {
	// 	BillingApi.('getAssignedDids', null, callback);
	// },

	_getDid: function(number, callback) {
		BillingApi.getDid({ number: number }, callback);
	},

	_getDidCountries: function(callback) {
		BillingApi.getDidCountries(callback);
	},

	_getDidLocations: function(params, callback) {
		BillingApi.getDidLocations(params, callback);
	},

	_getAvailableNumbers: function(params, callback) {
		BillingApi.request('getAvailableNumbers', params, callback);
	},

	_getDidPrice: function(params, callback) {
		BillingApi.request('getDidPrice', params, callback);
	},

	_getDidAmount: function(billingPeriodUnit, priceObj) {
		var state = this.state;
		var amount = 0;
		if(!billingPeriodUnit || !priceObj) return amount;
		amount = (billingPeriodUnit === 'years' ? priceObj.annualPrice : priceObj.monthlyPrice);
		return amount ? parseFloat(amount) : 0;
	},

	_getCreatedTrunks: function() {
		this.props.getObjects('trunk', function(result) {
			this.setState({
				trunks: result || []
			});
		});
	},

	_showNewDidSettings: function(e) {
		e.preventDefault();
		this.setState({ showNewDidSettings: !this.state.showNewDidSettings, fetchingCountries: true });

		var sub = this.state.sub;
		var maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;

		BillingApi.hasDids(function(err, count) {
			if(err) return notify_about('error', err);

			if(count.result >= maxdids) {
				this.setState({ limitReached: true, countries: [], fetchingCountries: false });
				return;
			}

			if(!this.state.countries.length) {
				this._getDidCountries(function(err, response) {
					if(err) return notify_about('error', err);
					this.setState({ countries: response.result, fetchingCountries: false });
				}.bind(this));
			}
		}.bind(this));
				
	},

	_showConnectTrunkSettings: function() {
		this.setState({ showNewDidSettings: false, showConnectTrunkSettings: true, fetchingTrunks: true });
	},

	_onTrunkSelect: function(params) {
		this.props.onChange(params);
	},

	// function getBody() {
	// 	return (
	// 		<div className="col-sm-8 col-sm-offset-4">
	// 			<p>{frases.BILLING.CONFIRM_PAYMENT.ADD_NUMBER_NEW_AMOUNT} <strong>€{ amount }</strong>. {frases.BILLING.CONFIRM_PAYMENT.TODAY_CHARGE_MSG} <strong>€{ proratedAmount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
	// 			<p>{frases.BILLING.CONFIRM_PAYMENT.NEW_SUB_AMOUNT} <strong>€{ parseFloat(sub.amount) + amount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
	// 			{
	// 				selectedPriceObject.restrictions && (
	// 					<DidRestrictionsComponent frases={frases} list={selectedPriceObject.restrictions.split(',')} />
	// 				) 
	// 			}
	// 			<p><button className="btn btn-primary" onClick={this._buyDidNumber}>{frases.CHAT_TRUNK.DID.BUY_NUMBER_BTN}</button></p>
	// 		</div>
	// 	)
	// },

	render: function() {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedRegion = state.selectedRegion;
		var selectedLocation = state.selectedLocation;
		var selectedAvailableNumber = state.selectedAvailableNumber;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;
		var properties = this.props.properties || {};

		// if(sub && selectedPriceObject) {
		// 	amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
		// 	proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
		// 	maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		// }

		if(!this.state.init) return <Spinner />;

		if(this.state.selectedNumber && this.state.selectedNumber._id) return <SelectedDidNumberComponent frases={frases} number={this.state.selectedNumber} />

		if(this.state.showConnectTrunkSettings) {
			return <ConnectTrunkSettings 
				getObjects={this.props.getObjects} 
				pageid={properties.id}
				frases={this.props.frases} 
				onChange={this._onTrunkSelect}
				isNew={this.props.isNew}
			/>
		}

		if(!this.state.showNewDidSettings && !this.state.showConnectTrunkSettings) {
			return (
				<div className="row">
					<div className="col-sm-offset-4 col-sm-4 col-xs-6 text-center">
					    <a 
					    	href="#" 
					    	style={{ textDecoration: "none", width: "50px", height: "150px", border: "1px solid #eee" }}
					    	onClick={this._showNewDidSettings}
					    >
			    			<span 
			    				className="fa fa-plus-circle"
			    				style={{ fontSize: "2em", color: "#333", padding: "5px 0" }}
			    			></span>
			    			<br/>
					    	<span>Buy a new number</span>
					    </a>
					</div>
					<div className="col-sm-4 col-xs-6 text-center">
					    <a 
					    	href="#" 
					    	style={{ textDecoration: "none", width: "50px", height: "150px", border: "1px solid #eee" }}
					    	onClick={this._showConnectTrunkSettings}
					    >
			    			<span 
			    				className="fa fa-plug"
			    				style={{ fontSize: "2em", color: "#333", padding: "5px 0" }}
			    			></span>
			    			<br/>
					    	<span>I already have a number</span>
					    </a>
					</div>
				</div>
			)
		}

		return (
			<div>
				{
					this.state.limitReached ? (
						<div className="form-group">
							<div className="col-sm-8 col-sm-offset-4">
								<p>{frases.CHAT_TRUNK.DID.LIMIT_REACHED.MAIN_MSG}</p> 
								<p><a href="#billing">{frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_LINK}</a> {frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_MSG}</p>
							</div>
						</div>
					) : (
						<RentDidComponent frases={frases} sub={sub} onChange={this.props.onChange} />
					)
				}
			</div>		
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);

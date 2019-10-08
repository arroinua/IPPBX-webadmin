var RentDidComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		sub: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			init: false,
			totalAmount: 0,
			chargeAmount: 0,
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
			fetchingCountries: false
		};
	},

	componentWillMount: function() {
		if(!this.state.countries.length) {
			this.setState({ fetchingCountries: true });
			this._getDidCountries(function(err, response) {
				if(err) return notify_about('error', err);
				this.setState({ countries: response.result, fetchingCountries: false, init: true });
			}.bind(this));
		}
	},

	// componentWillReceiveProps: function(props) {
	// },

	_onChange: function() {

		var params = {
			poid: this.state.selectedPriceObject ? this.state.selectedPriceObject._id : null,
			area: this.state.selectedLocation ? this.state.selectedLocation.id : null,
			anid: this.state.selectedAvailableNumber ? this.state.selectedAvailableNumber.id : null,
			totalAmount: this.state.totalAmount,
			chargeAmount: this.state.chargeAmount,
			newSubAmount: this.state.newSubAmount,
			nextBillingDate: this.state.nextBillingDate,
			currencySymbol: this._currencyNameToSymbol(this.props.sub.plan.currency)
		};
		
		this.props.onChange(params);
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
		state.needRegion = (country.iso === 'US' || country.iso === 'CA');

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
		var state = extent({}, this.state);
		var region = state.regions.filter(function(item) { return item.id === value })[0] || {};

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
		var state = extend({}, this.state);

		var selectedLocation = {};
		var selectedPriceObject = {};

		if(value) {
			selectedLocation = state.locations.filter(function(item) { return item.id === value; })[0];
		}

		state.selectedLocation = selectedLocation;
		state.selectedPriceObject = selectedPriceObject;
		state.selectedAvailableNumber = {};
		state.availableNumbers = null;

		this.setState(state);

		this._getAvailableNumbers({ area: selectedLocation.id }, function(err, response) {
			if(err) return notify_about('error', err);

			this.setState({  availableNumbers: response.result });

			this._getDidPrice({ iso: state.selectedCountry.iso, areaCode: state.selectedLocation.areaCode }, function(err, response) {
				if(err) return notify_about('error', err);
				this._setDidPrice(response.result);
				
			}.bind(this));
		}.bind(this));

	},

	_onAvailableNumberSelect: function(e) {
		var value = e.target.value;
		var state = extend({}, this.state);

		if(value) {
			state.selectedAvailableNumber = state.availableNumbers.filter(function(item) { return item.id === value; })[0];
		}

		this.setState(state);

		this._getDidPrice({ iso: state.selectedCountry.iso, areaCode: state.selectedLocation.areaCode }, function(err, response) {
			if(err) return notify_about('error', err);
			this._setDidPrice(response.result);
			
		}.bind(this));
	},

	_setDidPrice: function(priceObj) {
		var sub = this.props.sub;
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

	render: function() {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = this.props.sub;
		var selectedCountry = state.selectedCountry;
		var selectedRegion = state.selectedRegion;
		var selectedLocation = state.selectedLocation;
		var selectedAvailableNumber = state.selectedAvailableNumber;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;
		var properties = this.props.properties || {};

		if(!this.state.init || this.state.fetchingCountries) return <Spinner />;

		return (
			<form className="form-horizontal" autoComplete='off'>
				<div className="form-group">
					<label htmlFor="country" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_COUNTRY}</label>
					<div className="col-sm-4">
		    			<select className="form-control" name="country" value={selectedCountry.id || ""} onChange={this._onCountrySelect}>
		    				<option value="">----------</option>
		    				{
		    					this.state.countries.map(function(item) {
		    						return <option key={item.id} value={item.id}>{item.name + " ("+item.prefix+")"}</option>
		    					})
		    				}
		    			</select>
					</div>
				</div>
				{
					selectedCountry.id && (
						<div>
							{
								state.needRegion && (
									<div className="form-group">
									    <label htmlFor="location" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_REGION}</label>
								    	{
								    		state.regions ? (
								    			<div>
								    				{
								    					state.regions.length ? (
								    						<div className="col-sm-4">
										    					<select className="form-control" name="location" value={selectedRegion.id} onChange={this._onRegionSelect} autoComplete='off' required>
										    						<option value="">----------</option>
										    						{
										    							state.regions.map(function(item) {
										    								return <option key={item.id} value={item.id}>{item.name}</option>
										    							})
										    						}
										    					</select>
										    				</div>
									    				) : (
									    					<div className="col-sm-8">
									    						<p>{frases.CHAT_TRUNK.DID.CHECK_COUNTRY_AVAILABILITY_MSG}</p>
									    					</div>
									    				)
								    				}
								    			</div>
								    		) : (
								    			<Spinner classname="text-left" />
								    		)
								    	}
									</div>
								)
							}

							{
								(!state.needRegion || selectedRegion.id) && (
									<div className="form-group">
									    <label htmlFor="location" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_LOCATION}</label>
								    	{
								    		state.locations ? (
								    			<div>
								    				{
								    					state.locations.length ? (
								    						<div className="col-sm-4">
										    					<select className="form-control" name="location" value={selectedLocation.id} onChange={this._onLocationSelect} autoComplete='off' required>
										    						<option value="">----------</option>
										    						{
										    							state.locations.map(function(item) {
										    								return <option key={item.id} value={item.id}>{item.areaName + " ("+item.areaCode+")"}</option>
										    							})
										    						}
										    					</select>
										    				</div>
									    				) : (
									    					<div className="col-sm-8">
									    						<p>{frases.CHAT_TRUNK.DID.CHECK_COUNTRY_AVAILABILITY_MSG}</p>
									    					</div>
									    				)
								    				}
								    			</div>
								    		) : (
								    			<Spinner classname="text-left" />
								    		)
								    	}
									</div>
								)
							}

							{
								selectedLocation.id && (
									<div className="form-group">
									    <label htmlFor="number" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_NUMBER}</label>
								    	{
								    		state.availableNumbers ? (
								    			<div>
								    				{
								    					state.availableNumbers.length ? (
								    						<div className="col-sm-4">
										    					<select className="form-control" name="number" value={selectedAvailableNumber.id} onChange={this._onAvailableNumberSelect} autoComplete='off' required>
										    						<option value="">----------</option>
										    						{
										    							state.availableNumbers.map(function(item) {
										    								return <option key={item.id} value={item.id}>{item.number}</option>
										    							})
										    						}
										    					</select>
										    				</div>
									    				) : (
									    					<div className="col-sm-8">
									    						<p>{frases.CHAT_TRUNK.DID.CHECK_LOCATION_AVAILABILITY_MSG}</p>
									    					</div>
									    				)
								    				}
								    			</div>
								    		) : (
								    			<Spinner classname="text-left" />
								    		)
								    	}
									</div>
								)
							}

							{
								selectedAvailableNumber.id && (
									<div className="form-group">
										{
											(selectedPriceObject && selectedPriceObject._id) ? (
												<div className="col-sm-8 col-sm-offset-4">
													<p>{frases.BILLING.CONFIRM_PAYMENT.ADD_NUMBER_NEW_AMOUNT} <strong>{this._currencyNameToSymbol(sub.plan.currency)}{ amount }</strong>, {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
													{
														selectedPriceObject.restrictions && (
															<DidRestrictionsComponent frases={frases} list={selectedPriceObject.restrictions.split(',')} />
														) 
													}
												</div>
											) : !selectedPriceObject ? (
												<div className="col-sm-8 col-sm-offset-4">
													<p>{frases.CHAT_TRUNK.DID.CHECK_LOCATION_AVAILABILITY_MSG}</p>
												</div>
											) : (
												<Spinner classname="text-left" />
											)
										}
									</div>
								)
							}
							
						</div>
					)
				}
			</form>
		);
	}
});

RentDidComponent = React.createFactory(RentDidComponent);

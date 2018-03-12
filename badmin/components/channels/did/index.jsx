var DidTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			init: false,
			fetch: true,
			sub: null,
			cycleDays: 0,
			proratedDays: 0,
			totalAmount: 0,
			chargeAmount: 0,
			numbers: null,
			countries: [],
			locations: null,
			didTypes: ['Local'],
			selectedCountry: {},
			selectedLocation: {},
			selectedPriceObject: {},
			selectedType: 'Local',
			selectedNumber: {},
			limitReached: false,
			showNewDidSettings: false,
			fetchingCountries: false
		};
	},

	componentWillMount: function() {
		billingRequest('getSubscription', null, function(err, response) {
			console.log('getSubscription response: ', err, response.result);
			if(err) return notify_about('error' , err.message);

			var sub = response.result;
			var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
			var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

			this.setState({ 
				init: true,
				sub: response.result,
				cycleDays: cycleDays,
				proratedDays: proratedDays
			});

			if(this.props.properties && this.props.properties.number) {
				this.setState({ fetch: false });

				this._getDid(this.props.properties.number, function(err, response) {
					if(err) return notify_about('error', err);
					this.setState({
						selectedNumber: response.result
					});

				}.bind(this));
			}

		}.bind(this));

	},

	componentWillReceiveProps: function(props) {

		console.log('DidTrunkComponent componentWillReceiveProps', props);

		if(this.state.fetch && props.properties && props.properties.number) {
			this.setState({ fetch: false });

			this._getDid(props.properties.number, function(err, response) {
				if(err) return notify_about('error', err);
				this.setState({ selectedNumber: response.result });

			}.bind(this));
		}
				
	},

	_onChange: function() {
		var params = {
			poid: this.state.selectedPriceObject ? this.state.selectedPriceObject._id : null,
			dgid: this.state.selectedLocation ? this.state.selectedLocation._id : null,
			chargeAmount: this.state.chargeAmount,
			currency: this.state.sub.plan.currency
		};
		
		this.props.onChange(params);
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
		state.locations = null;

		this.setState(state);

		if(!value) return;

		this._getDidLocations({ country: country.id, type: state.selectedType }, function(err, response) {
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

		this.setState(state);

		billingRequest('getDidPrice', { iso: state.selectedCountry.attributes.iso, areaCode: state.selectedLocation.areaCode }, function(err, response) {
			if(err) return notify_about('error', err);
			this._setDidPrice(response.result);
			
		}.bind(this));

	},

	_setDidPrice: function(priceObj) {
		var sub = this.state.sub;
		var amount = this._getDidAmount(sub.plan.billingPeriodUnit, priceObj);
		var proratedAmount = (amount * (this.state.proratedDays / this.state.cycleDays)).toFixed(2);

		this.setState({
			selectedPriceObject: priceObj,
			totalAmount: amount,
			chargeAmount: proratedAmount
		});

		this._onChange();
	},

	// _getAssignedDids: function(callback) {
	// 	billingRequest('getAssignedDids', null, callback);
	// },

	_getDid: function(number, callback) {
		billingRequest('getDid', { number: number }, callback);
	},

	_getDidCountries: function(callback) {
		billingRequest('getDidCountries', null, callback);
	},

	_getDidLocations: function(params, callback) {
		billingRequest('getDidLocations', params, callback);
	},

	_getDidAmount: function(billingPeriodUnit, priceObj) {
		var state = this.state;
		var amount = null;
		if(!billingPeriodUnit || !priceObj) return amount;
		amount = (billingPeriodUnit === 'years' ? priceObj.annualPrice : priceObj.monthlyPrice);
		return amount ? parseFloat(amount) : null;
	},

	_showNewDidSettings: function(e) {
		e.preventDefault();
		this.setState({ showNewDidSettings: !this.state.showNewDidSettings, fetchingCountries: true });

		var sub = this.state.sub;
		var maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;

		billingRequest('hasDids', null, function(err, count) {
			if(err) return notify_about('error', err);

			if(maxdids >= count) {
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

	render: function() {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedLocation = state.selectedLocation;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;

		// if(sub && selectedPriceObject) {
		// 	amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
		// 	proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
		// 	maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		// }

		console.log('DidTrunkComponent render: ', this.state);

		return (
			<form className="form-horizontal" autoComplete='off'>
				{
					this.state.init ? (
						<div>
							{
								this.props.isNew ? (
									<div>
										{
											!this.state.showNewDidSettings ? (
												<div className="form-group">
													<div className="col-sm-4 col-sm-offset-4">
														<button className="btn btn-primary" onClick={this._showNewDidSettings}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.DID.ADD_NUMBER_BTN}</button>
													</div>
												</div>
											) : (
												<div>
													{
														this.state.fetchingCountries ? (
															<Spinner />
														) : (

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
																		<div className="form-group">
																			<label htmlFor="country" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_COUNTRY}</label>
																			<div className="col-sm-4">
																    			<select className="form-control" name="country" value={selectedCountry.id || ""} onChange={this._onCountrySelect}>
																    				<option value="">----------</option>
																    				{
																    					this.state.countries.map(function(item) {
																    						return <option key={item.id} value={item.id}>{item.attributes.name + " ("+item.attributes.prefix+")"}</option>
																    					})
																    				}
																    			</select>
																			</div>
																		</div>
																	)
																}
															</div>

														)
													}

													{
														selectedCountry.id && (
															<div>
																<div className="form-group">
																    <label htmlFor="location" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.SELECT_LOCATION}</label>
															    	{
															    		this.state.locations ? (
															    			<div>
															    				{
															    					this.state.locations.length ? (
															    						<div className="col-sm-4">
																	    					<select className="form-control" name="location" value={selectedLocation._id} onChange={this._onLocationSelect} autoComplete='off' required>
																	    						<option value="">----------</option>
																	    						{
																	    							this.state.locations.map(function(item) {
																	    								return <option key={item._id} value={item._id}>{item.areaName + " ("+item.areaCode+")"}</option>
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
															    			<Spinner />
															    		)
															    	}
																</div>

																{
																	selectedLocation._id && (
																		<div className="form-group">
																			{
																				(selectedPriceObject && selectedPriceObject._id) ? (
																					<div className="col-sm-8 col-sm-offset-4">
																						<p>{frases.BILLING.CONFIRM_PAYMENT.ADD_NUMBER_NEW_AMOUNT} <strong>€{ amount }</strong>. {frases.BILLING.CONFIRM_PAYMENT.TODAY_CHARGE_MSG} <strong>€{ proratedAmount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
																						<p>{frases.BILLING.CONFIRM_PAYMENT.NEW_SUB_AMOUNT} <strong>€{ parseFloat(sub.amount) + amount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
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
																					<Spinner />
																				)
																			}
																		</div>
																	)
																}
																
															</div>
														)
													}


												</div>
											)
										}
										
									</div>
								) : (
									(this.state.selectedNumber && this.state.selectedNumber._id) ? (
										<SelectedDidNumberComponent frases={frases} number={this.state.selectedNumber} />
									) : (
										<Spinner />
									)
								)
							}
						</div>
					) : (
						<Spinner />
					)
				}
						
			</form>
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);

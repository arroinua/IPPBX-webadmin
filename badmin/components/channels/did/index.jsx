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
			data: {},
			sub: null,
			newDid: null,
			cycleDays: 0,
			proratedDays: 0,
			number: "",
			numbers: null,
			countries: [],
			locations: [],
			didTypes: ['Local'],
			selectedCountry: {},
			selectedLocation: {},
			selectedPriceObject: {},
			selectedType: 'Local',
			showNewDidSettings: false
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
				sub: response.result,
				cycleDays: cycleDays,
				proratedDays: proratedDays
			});

			this._getAssignedDids(function(err, response) {
				if(err) return notify_about('error', err);

				this.setState({
					data: this.props.properties || {},
					numbers: response.result || []
				});

			}.bind(this));

		}.bind(this));

	},

	componentWillReceiveProps: function(props) {
		this.setState({
			data: props.properties || {}
		});		
	},

	_onChange: function(e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		console.log('DidTrunkComponent onChange: ', target.name, value);

		data[target.name] = value;

		this.setState({
			data: data
		});

		this.props.onChange(data);

	},

	_onNumberSelect: function(e) {
		var value = e.target.value;
		var state = this.state;
		var data = this.state.data;

		if(!value) {
			data.number = "";
		} else if(value === 'other') {
			data.number = "";
		} else {
			data.number = value;
		}

		data.id = value;

		this.setState({ data: data, number: value });

		this.props.onChange(data);

	},

	_onCountrySelect: function(e) {
		var value = e.target.value;
		var state = this.state;
		var country = this.state.countries.filter(function(item) { return item.id === value })[0] || {};
		
		state.selectedCountry = country;
		state.selectedLocation = {};
		state.locations.length = 0;

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

		state.selectedPriceObject = {};

		if(value) {
			state.selectedLocation = state.locations.filter(function(item) { return item._id === value; })[0];
		} else {
			state.selectedLocation = {};
		}

		this.setState(state);

		billingRequest('getDidPrice', { iso: state.selectedCountry.attributes.iso, areaCode: state.selectedLocation.areaCode }, function(err, response) {
			if(err) return notify_about('error', err);
			this.setState({ selectedPriceObject: response.result || {} });
		}.bind(this));

	},

	_getAssignedDids: function(callback) {
		billingRequest('getAssignedDids', null, callback);
	},

	_getDidCountries: function(callback) {
		billingRequest('getDidCountries', null, callback);
	},

	_getDidLocations: function(params, callback) {
		billingRequest('getDidLocations', params, callback);
	},

	_showNewDidSettings: function(e) {
		e.preventDefault();
		var show = this.state.showNewDidSettings;
		
		if(!show && !this.state.countries.length) this._getDidCountries(function(err, response) {
			if(err) return notify_about('error', err);
			this.setState({ countries: response.result });
		}.bind(this));

		this.setState({ showNewDidSettings: !this.state.showNewDidSettings });
	},

	_buyDidNumber: function(e) {
		e.preventDefault();
		show_loading_panel();

		var params = {
			poid: this.state.selectedPriceObject._id,
			dgid: this.state.selectedLocation._id
		};

		billingRequest('orderDid', params, function(err, response) {
			console.log('_buyDidNumber: ', err, response);
			remove_loading_panel();

			if(err) return notify_about('error', err);
			if(!response.success && response.error.name === 'ENOENT') {
				return notify_about('Number is not available');
			}

			var state = this.state;
			state.numbers.push(response.result);
			state.showNewDidSettings = false;
			state.number = response.result.number;

			this.setState(state);
			this.props.onChange(state.data);

			set_object_success();

		}.bind(this));
	},

	_extendProps: function(toObj, fromObj) {
		for(var key in fromObj) {
			toObj[key] = fromObj[key];
		}

		return toObj;
	},

	_getDidAmount: function(billingPeriodUnit, priceObj) {
		var state = this.state;
		if(!billingPeriodUnit || !priceObj) return null;
		return billingPeriodUnit === 'years' ? priceObj.annualPrice : priceObj.monthlyPrice;
	},

	render: function() {
		var state = this.state;
		var frases = this.props.frases;
		var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedLocation = state.selectedLocation;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = 0, proratedAmount = 0;
		var maxdids = null;
		var maxReached = false;

		if(sub) {
			amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
			proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
			maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		}

		console.log('DidTrunkComponent render: ', state.data, this.props.serviceParams);

		return (
			<div>
				{
					this.state.numbers ? (
						this.state.showNewDidSettings ? (
							<form className="form-horizontal" autoComplete='off'>
								<div className="form-group">
									<div className="col-sm-4 col-sm-offset-4">
										<a href="" onClick={this._showNewDidSettings}><i className="fa fa-arrow-left"></i> Select existed phone number</a>
									</div>
								</div>
								{
									(maxdids && (maxdids <= state.numbers.length)) ? (
										<div className="col-sm-8 col-sm-offset-4">
											<p>You can only have one number during your tria period. <br/> <a href="#billing">Change plan</a> to add more numbers.</p>
											<br/>
										</div>
									) : (
										<div>
											{
												
												<div className="form-group">
												    <label htmlFor="country" className="col-sm-4 control-label">Select Country</label>
												    <div className="col-sm-4">
												    	{
												    		this.state.countries.length ? (
												    			<select className="form-control" name="country" value={selectedCountry.id || ""} onChange={this._onCountrySelect}>
												    				<option value="">Select country</option>
												    				{
												    					this.state.countries.map(function(item) {
												    						return <option key={item.id} value={item.id}>{item.attributes.name + " ("+item.attributes.prefix+")"}</option>
												    					})
												    				}
												    			</select>
												    		) : (
																<Spinner />
												    		)
												    	}
														    	
												    </div>
												</div>
											}

											{
												selectedCountry.id && (
													<div className="form-group">
													    <label htmlFor="location" className="col-sm-4 control-label">Select Location</label>
													    <div className="col-sm-4">
													    	{
													    		this.state.locations.length ? (
													    			<select className="form-control" name="location" value={selectedLocation._id} onChange={this._onLocationSelect} autoComplete='off' required>
													    				<option value="">Select location</option>
													    				{
													    					this.state.locations.map(function(item) {
													    						return <option key={item._id} value={item._id}>{item.areaName + " ("+item.areaCode+")"}</option>
													    					})
													    				}
													    			</select>
													    		) : (
													    			<Spinner />
													    		)
													    	}
													    </div>
													</div>
												)
											}

											{
												selectedLocation._id && (
													<div className="form-group">
														{
															selectedPriceObject._id ? (
																<div className="col-sm-8 col-sm-offset-4">
																	<p>Adding local number adds <strong>€{ amount }</strong> to your { sub.plan.billingPeriodUnit === 'years' ? "annual" : "monthly"} bill. Today you will be charged <strong>€{ proratedAmount }</strong> plus applicable taxes and fees for the prorated cost of adding this number.</p>
																	<p>Your new subscription amount will be <strong>€{ parseFloat(sub.amount) + amount }</strong> plus applicable taxes and fees.</p>
																	<button className="btn btn-primary" onClick={this._buyDidNumber}>Buy number (€{ proratedAmount })</button>
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
										
							</form>
						) : (
							<form className="form-horizontal" autoComplete='off'>
								<div className="form-group">
									<div className="col-sm-4 col-sm-offset-4">
										<button className="btn btn-primary" onClick={this._showNewDidSettings}><i className="fa fa-plus-circle"></i> Add new local number</button>
									</div>
								</div>
								<div className="form-group">
									<div className="col-sm-4 col-sm-offset-4">
										<p>or</p>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="ctc-select-2" className="col-sm-4 control-label">Select number</label>
									<div className="col-sm-4">
										<select className="form-control" name="number" value={this.state.number} onChange={this._onNumberSelect}>
											<option value="">Not selected</option>
											{
												this.state.numbers.map(function(item) {
													return <option key={item._id} value={item.number}>{item.formatted}</option>
												})
											}
											<option value="other">Other external number</option>
										</select>
									</div>
								</div>

								{
									this.state.number === 'other' && (
										<div className="form-group">
										    <label htmlFor="ext-number" className="col-sm-4 control-label">Phone number</label>
										    <div className="col-sm-4">
										    	<input type="text" className="form-control" name="number" value={data.number} onChange={this._onChange} />
										    </div>
										</div>
									)
								}
							</form>	
						)
					) : (
						<Spinner />
					)
				}
						
			</div>
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);

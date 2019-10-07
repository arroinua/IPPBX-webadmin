 var ChatTrunkComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		selected: React.PropTypes.string,
		getObjects: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		updateBalance: React.PropTypes.func,
		confirmRemoveObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		confirmPayment: React.PropTypes.func,
		onTokenReceived: React.PropTypes.func
		// addSteps: React.PropTypes.func,
		// nextStep: React.PropTypes.func,
		// highlightStep: React.PropTypes.func,
		// initSteps: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			routes: null,
			serivceInited: false,
			selectedRoute: null,
			validationError: false
		};
	},

	componentWillMount: function() {
		var params = this.props.params;
		var type = this.props.type;

		this.setState({ 
			routes: [],
			type: type,
			params: params || {},
			serivceInited: true
		});

		this._setService(this.props.selected || type);
	},

	// componentDidMount: function() {
		// if(this.props.addSteps && !this.props.params.pageid) {
			// this.props.addSteps([{
			// 	element: '.sessiontimeout',
			// 	popover: {
			// 		title: 'Session timeout',
			// 		description: 'Set how long does the requests be allocated to the assigned user before it goes to the unified queue.',
			// 		position: 'top'
			// 	}
			// }]);

			// this.props.initSteps();
		// }
	// },

	componentWillReceiveProps: function(props) {
		this.setState({
			type: props.type || this.props.type,
			params: props.params || this.props.params
		});		
	},

	_onStateChange: function(state, callback) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state, function(err, result) {
			if(callback) callback(err, result);
		});
	},

	_onNameChange: function(value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
	},
	
	_setObject: function() {
		var params = {};
		var selectedRoute = this.state.selectedRoute;
		var properties = this.state.params.properties;

		if(!selectedRoute || !selectedRoute.oid || !selectedRoute.name) return notify_about('info', this.props.frases.CHAT_TRUNK.SERVICE_GROUP_NOT_SELECTED);

		Object.keys(this.state.params).forEach(function(key) {
			params[key] = this.state.params[key];
		}.bind(this));

		params.type = this.state.type;
		if(properties.id) params.pageid = properties.id;
		params.pagename = properties.name || '';
		params.routes = [{
			target: {
				oid: selectedRoute.oid,
				name: selectedRoute.name
			},
			priority: 1,
			timeout: 86400
		}];

		if(!this._validateSettings(params))	{
			notify_about('error', this.props.frases.MISSEDFILED);
			return this.setState({ validationError: true });
		} else {
			this.setState({ validationError: false });
		}

		if(!params.pageid && params.type === 'Telephony') {
			this._buyDidNumber(params.properties, false, function(err, result) {

				if(err) return notify_about('error', err.message);

				params.pageid = params.pagename = result;
				params.properties = { number: result, id: result }

				this.props.setObject(params);

			}.bind(this));

		} else {
			this.props.setObject(params);
		}
	},

	_buyDidNumber(params, noConfirm, callback) {
	    if(!params.area || !params.poid) return callback({ message: this.props.frases.CHAT_TRUNK.DID.NOTIFY_LOCATION_NOT_SELECTED });

	    var thisObj = this;

	    this.props.confirmPayment(params, noConfirm, function(result) {

	    	show_loading_panel();

	    	BillingApi.orderDid(params, function(err, response) {

	    		remove_loading_panel();

	    		if(err) {
	    			if(err.name === 'NO_PAYMENT_SOURCE' || err.name === 'authentication_required') {
	    				thisObj.props.updateBalance({ chargeAmount: params.chargeAmount, currency: params.currency }, function(err, result) {
	    					thisObj._buyDidNumber(params, true, callback);
	    				});
	    				return;
	    			} else {
	    				return callback(err);
	    			}
	    		}

	    		if(!response.success && response.error.name === 'ENOENT') {
	    			return callback(this.props.frases.CHAT_TRUNK.DID.NOTIFY_NO_AVAILABLE_NUMBERS);
	    		}

	    		callback(null, response.result.number);

	    	});
	    });
	},

	_removeObject: function() {
		var state = this.state;
		var type = state.type;
		var removeObject = this.props.removeObject;

		this.props.confirmRemoveObject(type, function() {
			show_loading_panel();
			
			if(type === 'Telephony' && state.params.properties.number) {
				// if(!state.params.properties.number) return console.error('number is not defined');
				
				BillingApi.unassignDid({ number: state.params.properties.number }, function(err, response) {
					if(err) return notify_about('error', err.message);
					removeObject();
					remove_loading_panel();
				});

			} else {
				removeObject();
				remove_loading_panel();

			}
		});
	},

	_onPropsChange: function(properties) {
		// var params = this.state.params;
		// params.properties = properties;
		var params = this.state.params;
		params.properties = properties;
		this.setState({ params: params });
	},

	_onParamsChange: function(e) {
		var target = e.target;
		var params = this.state.params;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if(target.name === 'replytimeout' || target.name === 'sessiontimeout') 
			value = parseInt(value, 10) * 60;

		params[target.name] = value;

		this.setState({ params: params });
	},

	_selectRoute: function(route) {
		this.setState({ selectedRoute: route });
	},

	_setService: function(type) {
		if(this.state.type === type) return;

		var params = this.props.params;
		params.properties = params.pageid ? params.properties : {};
		this.setState({ 
			type: type,
			params: params
		});
	},

	_getServiceParams: function(type) {
		return this.props.services.reduce(function(prev, next) {
			if(next.id === type) prev = next;
			return prev;
		}, {});
	},

	_toMinutes: function(value) {
		return parseInt(value, 10)/60;
	},

	_validateSettings: function(params) {
		var valid = true;
		switch(params.type) {
			case 'Telephony':
				valid = (params.properties.number || params.properties.id || (params.properties.poid !== undefined && params.properties.area !== undefined));
				break;
			case 'FacebookMessenger':
			case 'Viber':
			case 'Telegram':
				valid = !!params.properties.access_token;
				break;
			case 'WebChat':
				valid = params.properties.origin !== undefined;
				break;
			case 'Email':
				valid = (params.properties.username && params.properties.hostname && params.properties.port);
				break;
			default:
				valid = true;
		}

		return valid;
	},

	render: function() {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var serviceParams = this._getServiceParams(type);
		var ServiceComponent = serviceParams.component;

		if(!params) return null;

		return (
			<div>
				<ObjectName 
					name={params.name} 
					frases={frases} 
			    	placeholder={frases.CHAT_TRUNK.OBJ_NAME_PLACEHOLDER}
					enabled={params.enabled || false}
					submitDisabled={this.state.submitDisabled}
					onStateChange={this._onStateChange}
					onChange={this._onNameChange}
					onSubmit={this._setObject}
					onCancel={this.state.params.pageid ? this._removeObject : null}
					// addSteps={this.props.addSteps}
				/>
				<PanelComponent>
					{
						this.state.serivceInited ? (
							<div className="row">
								<div className="col-xs-12">
									<form className="form-horizontal">
										<div className="form-group">
											<label className="col-sm-4 control-label">{params.pageid ? frases.CHAT_TRUNK.SELECTED_SERVICE : frases.CHAT_TRUNK.SELECT_SERVICE}</label>
											<div className="col-sm-8">
												{
													this.props.services.map(function(item) {
														return ( 
															<TrunkServiceItemComponent 
																key={item.id}
																selected={item.id === type} 
																item={item} 
																onClick={this._setService} 
																disabled={params.pageid && item.id !== type}
															/>
														)
													}.bind(this))
												}
											</div>
										</div>
									</form>
									<hr/>
								</div>
								<div className="col-xs-12">
									<div>
										<ServiceComponent
											frases={frases}
											properties={params.properties}
											serviceParams={serviceParams}
											onChange={this._onPropsChange}
											onTokenReceived={this.props.onTokenReceived}
											isNew={!params.pageid}
											pageid={params.pageid}
											// addSteps={this.props.addSteps}
											// nextStep={this.props.nextStep}
											// highlightStep={this.props.highlightStep}
											getObjects={this.props.getObjects}
											validationError={this.state.validationError}
										/>

										<hr className="col-xs-12"/>

										<form className="form-horizontal">
											<div className="form-group">
												<ChannelRouteComponent 
													frases={frases} 
													type={type} 
													routes={this.props.params.routes} 
													onChange={this._selectRoute} 
													// addSteps={this.props.addSteps} 
												/>
											</div>

											<hr />

											{
												(type !== 'Telephony' && type !== 'Webcall') && (
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.REPLY_TIMEOUT}</label>
														<div className="col-sm-3">
															<input type="number" className="form-control replytimeout" name="replytimeout" value={this._toMinutes(params.replytimeout)} onChange={this._onParamsChange} />
														</div>
													</div>
												)
											}
											<div className="form-group">
												<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SESSION_TIMEOUT}</label>
												<div className="col-sm-3">
													<input type="number" className="form-control sessiontimeout" name="sessiontimeout" value={this._toMinutes(params.sessiontimeout)} onChange={this._onParamsChange} />
												</div>
											</div>
										</form>

									</div>
								</div>
							</div>		
						) : (
							<div className="row">
								<div className="col-xs-12">
									<Spinner />
								</div>
							</div>
						)
					}
							
				</PanelComponent>
			</div>
		);
	}
});

ChatTrunkComponent = React.createFactory(ChatTrunkComponent);

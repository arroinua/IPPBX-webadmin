 var ChatTrunkComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		getObjects: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		updateBalance: React.PropTypes.func,
		confirmRemoveObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			routes: null,
			serivceInited: false,
			selectedRoute: null
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

		this._setService(type);
	},

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

		console.log('setObject: ', properties, selectedRoute, this.state.params);

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

		console.log('setObject params: ', params);

		if(!params.pageid && params.type === 'Telephony') {
			this._buyDidNumber(params.properties, function(err, result) {

				if(err) return notify_about('error', err.message);

				params.pageid = params.pagename = result;
				params.properties = { number: result, id: result }

				this.props.setObject(params);

			}.bind(this));

		} else {
			this.props.setObject(params);
		}
	},

	_buyDidNumber(params, callback) {
		console.log('_buyDidNumber: ', params);

	    if(!params.dgid || !params.poid) return callback({ message: this.props.frases.CHAT_TRUNK.DID.NOTIFY_LOCATION_NOT_SELECTED });

	    var thisObj = this;

	    show_loading_panel();

		billingRequest('orderDid', params, function(err, response) {
			console.log('_buyDidNumber: ', err, response, params);

			remove_loading_panel();

			if(err) {
				if(err.name === 'NO_PAYMENT_SOURCE') {
					thisObj.props.updateBalance({ chargeAmount: params.chargeAmount, currency: params.currency }, function(err, result) {
						thisObj._buyDidNumber(params, callback);
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
	},

	_removeObject: function() {
		var state = this.state;
		var type = state.type;
		var removeObject = this.props.removeObject;

		this.props.confirmRemoveObject(type, function() {
			show_loading_panel();
			
			if(type === 'Telephony') {
				if(!state.params.properties.number) return console.error('number is not defined');
				
				billingRequest('unassignDid', { number: state.params.properties.number }, function(err, response) {
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

		console.log('_onParamsChange: ', target.name, value);

		this.setState({ params: params });
	},

	// _selectRoute: function(e) {
	// 	var value = e.target.value;
	// 	var selectedRoute = {};
	// 	this.state.routes.forEach(function(item) {
	// 		if(item.oid === value) selectedRoute = item;
	// 	});

	// 	console.log('_selectRoute: ', selectedRoute);

	// 	this.setState({ selectedRoute: selectedRoute });
	// },

	_selectRoute: function(route) {
		console.log('_selectRoute: ', route);
		this.setState({ selectedRoute: route });
	},

	_setService: function(type) {
		if(this.state.type === type) return;

		var params = this.props.params;
		params.properties = params.pageid ? params.properties : {};
		// this._getAvailableRoutes(type, function(result) {
		this.setState({ 
			type: type,
			params: params
			// properties: 
			// routes: result,
			// selectedRoute: (params.routes && params.routes.length) ? params.routes[0].target : ((this.props.routes && this.props.routes.length) ? this.props.routes[0] : [])
		});
		// }.bind(this));
	},

	// _getAvailableRoutes: function(type, callback) {
	// 	console.log('_getAvailableRoutes: ', type);
	// 	var groupType = type === 'Telephony' ? ['hunting', 'icd'] : ['chatchannel'];
	// 	var routes = [];

	// 	getExtensions(function(result) {
	// 		routes = result;
	// 		this.props.getObjects(groupType, function(result) {
	// 			routes = routes.concat(result);
	// 			callback(routes);
	// 		});
	// 	}.bind(this));
	// },

	// _getComponentName: function(type) {
	// 	var component = null;
	// 	if(type === 'FacebookMessenger' || type === 'Facebook') {
	// 		component = FacebookTrunkComponent;
	// 	} else if(type === 'Twitter') {
	// 		component = TwitterTrunkComponent;
	// 	} else if(type === 'Viber') {
	// 		component = ViberTrunkComponent;
	// 	} else if(type === 'Email') {
	// 		component = EmailTrunkComponent;
	// 	}

	// 	return component;		
	// },

	_getServiceParams: function(type) {
		return this.props.services.reduce(function(prev, next) {
			if(next.id === type) prev = next;
			return prev;
		}, {});
	},

	_toMinutes: function(value) {
		return parseInt(value, 10)/60;
	},

	// _createGroup: function(e) {
	// 	e.preventDefault();
	// 	this.props.createGroup(this.state.type);
	// },
	// {
	// 	this.state.routes ? (
	// 		this.state.routes.length ? (
	// 			<div className="form-group">
	// 				<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_CHANNEL}</label>
	// 				<div className="col-sm-4">
	// 					<select className="form-control" id="ctc-select-2" value={this.state.selectedRoute.oid} onChange={this._selectRoute}>
	// 						{
	// 							this.state.routes.map(function(item) {
	// 								return <option key={item.oid} value={item.oid}>{item.name}</option>
	// 							})
	// 						}
	// 					</select>
	// 				</div>
	// 			</div>
	// 		) : (
	// 			<div className="form-group">
	// 				<div className="col-sm-4 col-sm-offset-4">
	// 					<button className="btn btn-primary" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create group</button>
	// 				</div>
	// 			</div>
	// 		)
	// 	) : (
	// 		<Spinner/>
	// 	)
	// }

	render: function() {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var serviceParams = this._getServiceParams(type);
		var ServiceComponent = serviceParams.component;

		console.log('ChatTrunkComponent: ', params, ServiceComponent);

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
				/>
				<PanelComponent>
					{
						this.state.serivceInited ? (
							<div className="row">
								<div className="col-xs-12">
									<form className="form-horizontal">
										<div className="form-group">
											<label className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_SERVICE}</label>
											<div className="col-sm-8">
												{
													this.props.services.map(function(item) {
														return ( 
															<div key={item.id} className="text-center col-sm-2 col-xs-3" style={{ padding: "20px 0" }}>
																<TrunkServiceItemComponent 
																	selected={item.id === type} 
																	item={item} 
																	onClick={this._setService} 
																	disabled={params.pageid && item.id !== type}
																/>
															</div>
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
											properties={this.state.params.properties}
											serviceParams={serviceParams}
											onChange={this._onPropsChange}
											isNew={!this.state.params.pageid}
										/>

										<hr className="col-xs-12"/>

										<form className="form-horizontal">
											<div className="form-group">
												<ChannelRouteComponent frases={frases} type={type} routes={this.props.params.routes} onChange={this._selectRoute} />
											</div>

											<hr />

											{
												type !== 'Telephony' && (
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.REPLY_TIMEOUT}</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="replytimeout" value={this._toMinutes(params.replytimeout)} onChange={this._onParamsChange} />
														</div>
													</div>
												)
											}
											<div className="form-group">
												<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SESSION_TIMEOUT}</label>
												<div className="col-sm-4">
													<input type="number" className="form-control" name="sessiontimeout" value={this._toMinutes(params.sessiontimeout)} onChange={this._onParamsChange} />
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

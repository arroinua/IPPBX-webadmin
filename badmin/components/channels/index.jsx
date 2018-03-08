 var ChatTrunkComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		// routes: React.PropTypes.array,
		getObjects: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			routes: null,
			serivceInited: false,
			selectedRoute: null,
			properties: null
		};
	},

	componentWillMount: function() {
		var params = this.props.params;
		var type = this.props.type;

		this.setState({ 
			routes: [],
			type: type,
			isNew: !params.pageid,
			params: params || {},
			properties: params.properties,
			serivceInited: true
		});

		this._setService(type);
	},

	componentWillReceiveProps: function(props) {
		var params = props.params;
		this.setState({
			type: props.type,
			params: params || {},
			properties: params.properties
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
		var properties = this.state.properties;

		console.log('setObject: ', properties, selectedRoute, this.state.params);

		if(!selectedRoute) return console.error('route is not selected');
		if(!Object.keys(properties).length || !properties.id) {
			return notify_about('info', 'Fill in all required fields');
		}

		Object.keys(this.state.params).forEach(function(key) {
			params[key] = this.state.params[key];
		}.bind(this));

		// if(!pages || !pages.length) return console.error('page is not selected');;

		params.type = this.state.type;
		if(properties.id) params.pageid = properties.id;
		params.pagename = properties.name || '';
		params.properties = properties;
		params.routes = [];
		params.routes.push({
			target: {
				oid: selectedRoute.oid,
				name: selectedRoute.name
			},
			priority: 1,
			timeout: 86400
		});

		console.log('setObject params: ', params);

		this.props.setObject(params, function(err, result) {
			if(err) return;
			this.setState({ params: params });
		}.bind(this));
	},

	_removeObject: function() {
		this.props.removeObject(this.state.type, this.state.properties);
	},

	_onPropsChange: function(properties) {
		// var params = this.state.params;
		// params.properties = properties;
		this.setState({ properties: properties });
	},

	_onParamsChange: function(e) {
		var target = e.target;
		var params = this.state.params;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = value;
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
		var params = this.props.params;

		// this._getAvailableRoutes(type, function(result) {
		this.setState({ 
			type: type, 
			properties: this.state.isNew ? {} : this.state.properties
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

	_getComponentName: function(type) {
		var component = null;
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			component = FacebookTrunkComponent;
		} else if(type === 'Twitter') {
			component = TwitterTrunkComponent;
		} else if(type === 'Viber') {
			component = ViberTrunkComponent;
		} else if(type === 'Email') {
			component = EmailTrunkComponent;
		}

		return component;		
	},

	_getServiceParams: function(type) {
		return this.props.services.reduce(function(prev, next) {
			if(next.id === type) prev = next;
			return prev;
		}, {});
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

										{
											this.state.serivceInited && (

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
																	<input type="number" className="form-control" name="replytimeout" value={params.replytimeout} onChange={this._onParamsChange} />
																</div>
															</div>
														)
													}
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SESSION_TIMEOUT}</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="sessiontimeout" value={params.sessiontimeout} onChange={this._onParamsChange} />
														</div>
													</div>
												</form>

											)
										}

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

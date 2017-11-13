 var ChatTrunkComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		routes: React.PropTypes.array,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			routes: []
		};
	},

	getInitialState: function() {
		return {
			serivceInited: true
		};
	},

	componentWillMount: function() {
		var params = this.props.params;
		this.setState({
			type: this.props.type,
			params: params || {},
			selectedRoute: params.routes.length ? params.routes[0].target : (this.props.routes.length ? this.props.routes[0] : null)
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			type: props.type,
			params: props.params || {}
		});		
	},

	_onStateChange: function(state) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function(value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
	},
	
	_setObject: function() {
		var params = this.state.params;
		// var pages = this.state.pages;
		var selectedRoute = this.state.selectedRoute || this.props.routes[0];
		var properties = this.state.params.properties || {};

		console.log('setObject: ', properties, selectedRoute);

		// if(!pages || !pages.length) return console.error('page is not selected');;
		if(!selectedRoute) return console.error('route is not selected');

		params.type = this.state.type;
		params.pageid = properties.id;
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

		this.props.setObject(params, function(err, result) {
			this.setState({ params: params });
		}.bind(this));
	},

	_removeObject: function() {
		this.props.removeObject(this.state.params);
	},

	_onPropsChange: function(properties) {
		var params = this.state.params;
		params.properties = properties;
		this.setState({ params: params });
	},

	_onParamsChange: function(e) {
		var target = e.target;
		var params = this.state.params;

		params[target.name] = target.value;
		this.setState({ params: params });
	},

	_selectRoute: function(e) {
		console.log('_selectRoute: ', e);
		var value = e.target.value;
		var selectedRoute = {};
		this.props.routes.forEach(function(item) {
			if(item.oid === value) selectedRoute = item;
		});

		this.setState({ selectedRoute: selectedRoute });
	},

	_setService: function(type) {
		this.setState({ 
			type: type
		});
	},

	_getComponentName: function(type) {
		var component = null;
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			component = FacebookTrunkComponent;
		} else if(type === 'Twitter') {
			component = TwitterTrunkComponent;
		} else if(type === 'Viber') {
			component = ViberTrunkComponent;
		}

		return component;		
	},

	_getServiceParams: function(type) {
		return this.props.services.reduce(function(prev, next) {
			if(next.id === type) prev = next;
			return prev;
		}, {});
	},

	render: function() {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var ServiceComponent = this._getComponentName(type);
		var serviceParams = this._getServiceParams(type);
		
		console.log('ChatTrunkComponent: ', params, ServiceComponent);

		return (
			<div>
				<ObjectName 
					name={params.name} 
					frases={frases} 
					enabled={params.enabled || false}
					submitDisabled={this.state.submitDisabled}
					onStateChange={this._onStateChange}
					onChange={this._onNameChange}
					onSubmit={this._setObject}
					onCancel={this.state.params.pageid ? this._removeObject : null}
				/>
				<PanelComponent>
					{
						!this.props.routes.length ? (

							<h4>{frases.CHAT_TRUNK.NO_CHANNELS_MSG_1}<a href="#chatchannel/chatchannel"> {frases.CHAT_TRUNK.CREATE_CHANNEL}</a> {frases.CHAT_TRUNK.NO_CHANNELS_MSG_2}</h4>
						
						) : (

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
											properties={this.props.params.properties}
											serviceParams={serviceParams}
											onChange={this._onPropsChange}
											isNew={!this.state.params.pageid}
										/>

										{
											this.state.serivceInited && (

												<form className="form-horizontal">
													<hr/>
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_CHANNEL}</label>
														<div className="col-sm-4">
															<select className="form-control" id="ctc-select-2" value={this.state.selectedRoute.oid} onChange={this._selectRoute}>
																{
																	this.props.routes.map(function(item) {

																		return (

																			<option key={item.oid} value={item.oid}>{item.name}</option>

																		);

																	})
																}
															</select>
														</div>
													</div>
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SESSION_TIMEOUT}</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="sessiontimeout" value={params.sessiontimeout} onChange={this._onParamsChange} />
														</div>
													</div>
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.REPLY_TIMEOUT}</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="replytimeout" value={params.replytimeout} onChange={this._onParamsChange} />
														</div>
													</div>
												</form>

											)
										}

									</div>
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

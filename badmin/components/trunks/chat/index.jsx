 var ChatTrunkComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		routes: React.PropTypes.array,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			routes: [],
			serviceParams: {}
		};
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {},
	// 		properties: {},
	// 		selectedRoute: {}
	// 	};
	// },

	componentWillMount: function() {
		var params = this.props.params;
		this.setState({
			type: this.props.type,
			params: params || {},
			serviceParams: this.props.serviceParams || null,
			submitDisabled: this._isSubmitDisabled(this.props),
			serivceInited: this._isServiceInited(this.props),
			selectedRoute: params.routes.length ? params.routes[0].target : (this.props.routes.length ? this.props.routes[0] : null)
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			type: props.type,
			serviceParams: props.serviceParams || null,
			submitDisabled: this._isSubmitDisabled(props),
			serivceInited: this._isServiceInited(props),
		});		
	},

	_isServiceInited: function(props) {
		var inited = false;
		var type = props.type;
		var serviceParams = props.serviceParams;
		
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			if(serviceParams.pages && serviceParams.pages.length) inited = true;
		}

		console.log('_isServiceInited: ', type, inited);

		return inited;
	},

	_isSubmitDisabled: function(props) {
		var disabled = false;
		var type = props.type;
		var serviceParams = props.serviceParams;
		
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			if(!serviceParams.pages || !serviceParams.pages.length) disabled = true;
		}

		return disabled;
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

		params.pageid = properties.id;
		params.pagename = properties.name;
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
		this.setState({ type: type });
	},

	_getComponentName: function(type) {
		var component = null;
		if(type === 'FacebookMessenger' || type === 'Facebook') {
			component = FacebookTrunkComponent;
		} else if(type === 'Twitter') {
			component = TwitterTrunkComponent;
		}

		return component;		
	},

	render: function() {
		var params = this.state.params;
		var frases = this.props.frases;
		var ServiceComponent = this._getComponentName(this.state.type);
		
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
				<div className="row">
					<div className="col-xs-12">
						{
							this.props.services.map(function(item, index, array) {
								return (
									<TrunkServiceItemComponent key={item.id} params={item} className="col-sm-2 col-xs-4 text-center" onClick={this._setService} />
								)
							}.bind(this))
						}
					</div>
				</div>
				<PanelComponent header="Trunk settings">
					<div className="row">
						<div className="col-xs-12">
							{
								!this.props.routes.length ? (
									<p>You need to<a href="#chatchannel/chatchannel">Create a Chat channel</a> before connecting a Chat trnuk</p>
								) : (

									<div>

										<ServiceComponent
											frases={frases}
											properties={this.props.params.properties}
											serviceParams={this.state.serviceParams}
											loginHandler={this.props.serviceParams.loginHandler}
											onChange={this._onPropsChange}
											disabled={!!this.state.params.pageid}
										/>

										{
											this.state.serivceInited && (

												<form className="form-horizontal">
													<hr/>
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">Select Chat Channel</label>
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
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">Session timeout (min)</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="sessiontimeout" value={params.sessiontimeout} onChange={this._onParamsChange} />
														</div>
													</div>
													<div className="form-group">
														<label htmlFor="ctc-select-2" className="col-sm-4 control-label">Reply timeout (min)</label>
														<div className="col-sm-4">
															<input type="number" className="form-control" name="replytimeout" value={params.replytimeout} onChange={this._onParamsChange} />
														</div>
													</div>
												</form>

											)
										}

										
									</div>

								)
							}
						</div>
					</div>
				</PanelComponent>
			</div>
		);
	}
});

ChatTrunkComponent = React.createFactory(ChatTrunkComponent);

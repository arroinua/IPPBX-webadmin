var ChannelRouteComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		routes: React.PropTypes.array,
		onChange: React.PropTypes.func,
		// addSteps: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			options: {},
			routes: null,
			selectedRoute: {}
		};
	},

	componentWillMount: function() {
		this._setRoutes(this.props);
			
	},

	componentDidMount: function() {
		var frases = this.props.frases;

		// this.props.addSteps([{
		// 	element: '.channel-routes',
		// 	popover: {
		// 		title: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].TITLE,
		// 		description: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].DESC,
		// 		position: 'bottom'
		// 	}
		// }, {
		// 	element: '.create-group-links',
		// 	popover: {
		// 		title: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].TITLE,
		// 		description: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].DESC,
		// 		position: 'top'
		// 	}
		// }]);
			
	},

	componentWillReceiveProps: function(props) {
		if(props.type !== this.props.type) {
			this.setState({ routes: [] });
			this._setRoutes(props);
		}
	},

	_setRoutes: function(props) {
		// var props = this.props;
		var selectedRoute = {};

		this._getAvailableRoutes(props.type, function(result) {
			selectedRoute = (props.routes && props.routes.length) ? props.routes[0].target : ((result && result.length) ? result[0] : {});

			this.setState({
				routes: result || [],
				selectedRoute: selectedRoute
			});

			this.props.onChange(selectedRoute);

		}.bind(this));
	},

	_selectRoute: function(e) {
		var value = e.target.value;
		var selectedRoute = {};
		this.state.routes.forEach(function(item) {
			if(item.oid === value) selectedRoute = item;
		});

		this.setState({ selectedRoute: selectedRoute });
		this.props.onChange(selectedRoute);
	},

	_getAvailableRoutes: function(type, callback) {
		// var type = this.props.type;
		var isTelephonyChannel = (type === 'Telephony' || type === 'Webcall');
		var groupType = isTelephonyChannel ? ['hunting', 'icd', 'attendant'] : ['chatchannel'];
		var routes = [];


		getObjects(groupType, function(result) {
			routes = routes.concat(result);

			if(isTelephonyChannel) {
				getExtensions(function(extensions) {
					routes = routes.concat(filterObject(extensions, ['user', 'phone']));
					callback(routes);
				})
			} else {
				callback(routes);
			}
			
		});
			
	},

	_handleOnChange: function(e) {
		var target = e.target;
		var params = this.state.params;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = value;
		this.setState({ options: params });
	},

	_groupObjects: function(array) {
		var frases = this.props.frases;
		var groups = {};
		var kind = null;
		var optgroup = null;
		
		array.map(function(item) {
			kind = item.kind;
			if(!groups[kind]){
			    groups[kind] = [];
			}

			groups[kind].push(item);

			return item;

		});

		return (
			Object.keys(groups).map(function(key) {

				return (
					<optgroup label={frases.KINDS[key]} key={key}>
						{
							groups[key].map(function(item) {

								return <option key={item.oid} value={item.oid}>{item.name}</option>

							})	
						}
					</optgroup>
				)

			})
		);

	},

	render: function() {
		var frases = this.props.frases;
		var selectedRoute = this.state.selectedRoute;
		
		// this.state.routes.map(function(item) {
		// 	return <option key={item.oid} value={item.oid}>{item.name}</option>
		// }.bind(this))

		return (
			this.state.routes ? (
				<div>
					<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_SERVICE_GROUP}</label>
					{
						this.state.routes.length ? (
							<div className="col-sm-3">
								<select className="form-control channel-routes" value={selectedRoute.oid} onChange={this._selectRoute}>
									{
										this._groupObjects(this.state.routes)
									}
								</select>
							</div>
						) : (
							<div className="col-sm-4">
								<p>{frases.CHAT_TRUNK.NO_SERVICE_GROUP}</p>
							</div>
						)
					}
					<div className="col-sm-1 text-center"><strong>{frases.OR}</strong></div>
					{
						(this.props.type === 'Telephony' || this.props.type === 'Webcall') ? (
							<div className="col-sm-4 create-group-links">
								<a href="#hunting/hunting" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_HUNTING_GROUP}</a>
								<a href="#icd/icd" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_ICD_GROUP}</a>
								<a href="#attendant/attendant" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_ATTENDANT}</a>
							</div>
						) : (
							<div className="col-sm-4 create-group-links">
								<a href="#chatchannel/chatchannel" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_SERVICE_GROUP}</a>
							</div>
						)
					}
				</div>
						
			) : (
				<Spinner/>
			)
		);
	}
});

ChannelRouteComponent = React.createFactory(ChannelRouteComponent);

var ChannelRouteComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		routes: React.PropTypes.array,
		onChange: React.PropTypes.func
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
			console.log('_getAvailableRoutes: ', result);

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

		console.log('_selectRoute: ', selectedRoute);

		this.setState({ selectedRoute: selectedRoute });
		this.props.onChange(selectedRoute);
	},

	_getAvailableRoutes: function(type, callback) {
		// var type = this.props.type;
		console.log('_getAvailableRoutes: ', type);
		var groupType = type === 'Telephony' ? ['hunting', 'icd'] : ['chatchannel'];

		getObjects(groupType, function(result) {
			callback(result);
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

	_createGroup: function() {

	},

	render: function() {
		var frases = this.props.frases;
		var selectedRoute = this.state.selectedRoute;
		
		return (
			this.state.routes ? (
				<div>
					<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_SERVICE_GROUP}</label>
					{
						this.state.routes.length ? (
							<div className="col-sm-4">
								<select className="form-control" value={selectedRoute.oid} onChange={this._selectRoute}>
									{
										this.state.routes.map(function(item) {
											return <option key={item.oid} value={item.oid}>{item.name}</option>
										})
									}
								</select>
							</div>
						) : (
							<div className="col-sm-4">
								<p>You don't have service groups yet.</p>
							</div>
						)
					}
					{
						this.props.type === 'Telephony' ? (
							<div className="col-sm-4">
								<a href="#hunting/hunting" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create Hunting group</a>
								<a href="#icd/icd" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create Hotline</a>
							</div>
						) : (
							<div className="col-sm-4">
								<a href="#chatchannel/chatchannel" className="btn btn-link" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create Service group</a>
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

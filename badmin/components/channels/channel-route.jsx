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

	componentWillReceiveProps: function(props, prevprops) {
		if(prevprops.type !== props) {
			this.setState({ routes: [] });
		}
		this._setRoutes(props);
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

	_getAvailableRoutes: function(type, callback) {
		// var type = this.props.type;
		console.log('_getAvailableRoutes: ', type);
		var groupType = type === 'sip' ? ['hunting', 'icd'] : ['chatchannel'];

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
		
		return (
			this.state.routes ? (
				<div>
					<select className="form-control" value={this.state.selectedRoute.oid} onChange={this._selectRoute}>
						{
							this.state.routes.map(function(item) {
								return <option key={item.oid} value={item.oid}>{item.name}</option>
							})
						}
					</select>
					<p>or</p>
					<button className="btn btn-primary" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create group</button>

					<hr/>

					<div className="form-group">
					    <label className="col-sm-4 control-label">
					        <span>{frases.HUNTINGTYPE.HUNTINGTYPE} </span>
					        <a tabIndex="0" role="button" className="popover-trigger info" data-toggle="popover" data-content={frases.GRP__HUNT_MODE}></a>
					    </label>
					    <div className="col-sm-4">
					        <select data-type="number" name="huntmode" value={ this.state.options.huntmode } onChange={ this._handleOnChange } className="form-control">
					            <option value="1">{frases.HUNTINGTYPE.SERIAL}</option>
					            <option value="3">{frases.HUNTINGTYPE.PARALLEL}</option>
					        </select>
					    </div>
					</div>
					<div className="form-group">
					    <label className="col-sm-4 control-label">
					        <span>{frases.HUNT_TOUT} </span>
					        <a tabIndex="0" role="button" className="popover-trigger info" data-toggle="popover" data-content={frases.GRP__CALL_TOUT}></a>
					    </label>
					    <div className="col-sm-4">
					        <input type="number" className="form-control" value={ this.state.options.timeout } name="timeout" onChange={ this._handleOnChange } />
					    </div>
					</div>
					<div className="form-group">
					    <div className="col-sm-offset-4 col-sm-8">
					        <div className="checkbox">
					            <label>
					                <input type="checkbox" name="huntfwd" checked={ this.state.options.huntfwd } onChange={ this._handleOnChange } /> {frases.FORWFROMHUNT}
					            </label>
					            
					        </div>
					    </div>
					</div>
					<div className="form-group">
					    <label className="col-sm-4 control-label">
					        <span>{frases.GREETNAME} </span>
					        <a tabIndex="0" role="button" className="popover-trigger info" data-toggle="popover" data-content={frases.UNIT__GREETINGS}></a>
					    </label>
					    <div className="col-sm-4">
					        <FileUpload name="greeting" value={this.state.options.greeting} onChange={this._onFileUpload} />
					    </div>
					</div>
					<div className="form-group">
					    <label className="col-sm-4 control-label">
					        <span>{frases.WAIT_MUSIC} </span>
					        <a tabIndex="0" role="button" className="popover-trigger info" data-toggle="popover" data-content={frases.UNIT__WAITMUSIC}></a>
					    </label>
					    <div className="col-sm-4">
					        <FileUpload name="waitmusic" value={this.state.options.waitmusic} onChange={this._onFileUpload} />
					    </div>
					</div>

				</div>
			) : (
				<Spinner/>
			)
		);
	}
});

ChannelRouteComponent = React.createFactory(ChannelRouteComponent);

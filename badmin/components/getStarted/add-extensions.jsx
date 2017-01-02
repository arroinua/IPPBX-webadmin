
var AddExtensions = React.createClass({

	propTypes: {
		step: React.PropTypes.object
	},

	getDefaultProps: function() {
		step: {}
	},

	getInitialState: function() {
		return {
			extensions: []
		};
	},

	// componentDidMount() {
		// this._getUserGroups(function(result) {
		// 	this.setState({
		// 		userGroups: result 
		// 	});
		// }.bind(this));

		// this._getPhoneGroups(function(result) {
		// 	this.setState({
		// 		phoneGroups: result 
		// 	});
		// }.bind(this));
	// },

	// _getUserGroups: function(cb) {
	// 	json_rpc_async('getObjects', { kind: "users" }, function(result) {
	// 		console.log('getObjects users: ', result);
	// 		if(cb) cb(result);
	// 	});
	// },

	// _getPhoneGroups: function(cb) {
	// 	json_rpc_async('getObjects', { kind: "equipment" }, function(result) {
	// 		console.log('getObjects phones: ', result);
	// 		if(cb) cb(result);
	// 	});
	// },

	// _getAvailableExtensions: function() {
		
	// },

	// _addExtension: function() {
	// 	console.log('addExtension: ');
	// },

	_chooseGroup: function(type) {
		window.location.hash = '#'+type+'?'+type;
		console.log('close Modal: ', this.props.step.name, $('#'+this.props.step.name));
		$('#'+this.props.step.name).modal('hide');
	},

	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-xs-12 text-center">
						<h3>Add extensions for company employees.</h3>
						<br/><br/>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 text-center">
						<button onClick={this._chooseGroup.bind(this, 'users')} className="btn btn-primary btn-xl"><i className="fa fa-user"></i> Create user group</button>
						<br/><br/>
						<p>Users could be registered with Ringotel's apps.</p>
					</div>
					<div className="col-sm-6 text-center">
						<button onClick={this._chooseGroup.bind(this, 'equipment')} className="btn btn-primary btn-xl"><i className="fa fa-fax"></i> Create equipment group</button>
						<br/><br/>
						<p>Create Equipment group, in order to connect third-party SIP softphones, IP phones, etc.</p>
					</div>
				</div>
			</div>
		);
	}
});

AddExtensions = React.createFactory(AddExtensions);
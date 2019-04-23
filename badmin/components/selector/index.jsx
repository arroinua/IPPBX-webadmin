var SelectorComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		getInfoFromState: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {},
			files: null,
			validationError: false
			// filteredMembers: []
		};
	},

	componentWillMount: function() {
		// var params = extend({}, this.props.params);
		// var members = [].concat(params.members);
		
		this.setState({ params: this.props.params });

		
	},

	componentWillReceiveProps: function(props) {
		this.setState({ params: props.params });
	},

	_setObject: function() {
		var params = extend({}, this.state.params);

		if(!params.owner) {
			if(!params.members.length) {
				this.setState({ validationError: true });
				return notify_about('error', this.props.frases.MISSEDFILED);
			} else {
				params.owner = params.members[0].ext;
			}
		} else {
			this.setState({ validationError: false });
		}

		// params.options = this.state.params.options;
		if(this.state.files) params.files = [].concat(this.state.files);
		// params.route = this.state.route;
		
		this.props.setObject(params);
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
		this.props.onNameChange(value);
	},

	_onAddMembers: function() {
		this.props.onAddMembers();
	},

	_handleOnChange: function(e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if(target.name === 'owner') {
			params[target.name] = value;
		} else {
			params.options[target.name] = type === 'number' ? parseFloat(value) : value;
		}

		this.setState({
			params: params
		});
	},

	_onFileUpload: function(params) {
		var state = extend({}, this.state);
		var found = false;

		state.files = state.files || [];

		var files = state.files.map(function(item) {
			if(item.name === params.name) {
				item = params;
				found = true;
			}
			return item;
		});

		if(!found){
			files.push(params);
		}

		state.params.options[params.name] = params.filename;
		state.files = files;

		this.setState(state);	
	},

	_onRouteChange: function(route) {
		this.setState({
			route: route
		});
	},

	_onSortMember: function(array) {
		var newParams = extend({}, this.state.params);
		newParams.members = array;

		this.setState({
			params: newParams
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled || false}
			    	onStateChange={this._onStateChange}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.props.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<GroupMembersComponent frases={frases} members={members} getExtension={this.props.getExtension} onAddMembers={this._onAddMembers} deleteMember={this.props.deleteMember} />
			    	</div>
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.SETTINGS.SETTINGS}>
			    			<SelectorSettingsComponent frases={frases} validationError={this.state.validationError} params={params} onChange={this._handleOnChange} onFileUpload={this._onFileUpload} />
			    		</PanelComponent>
			    	</div>
			    </div>
			</div>
		);
	}
});

SelectorComponent = React.createFactory(SelectorComponent);

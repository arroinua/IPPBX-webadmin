var HuntingGroupComponent = React.createClass({

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
			files: []
			// filteredMembers: []
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {},
			options: this.props.params.options,
			removeObject: this.props.removeObject
			// filteredMembers: this.props.params.members
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params,
			options: this.props.params.options,
			removeObject: props.removeObject
			// filteredMembers: props.params.members
		});
	},

	_setObject: function() {
		var params = this.state.params;
		params.options = this.state.options;
		params.files = this.state.files.reduce(function(array, item) { array.push(item.file); return array; }, []);
		params.route = this.state.route;
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
		var options = extend({}, this.state.options);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		options[target.name] = type === 'number' ? parseFloat(value) : value;

		console.log('_handleOnChange: ', target, value);

		this.setState({
			options: options
		});
	},

	_onFileUpload: function(params) {
		var state = this.state;
		var found = false;

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

		state.options[params.name] = params.filename;
		state.files = files;

		console.log('_onFileUpload: ', params, files);

		this.setState({
			state: state
		});	
	},

	// _onFileUpload: function(e) {
	// 	var options = this.state.options;
	// 	var files = this.state.files;
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;

	// 	options[target.name] = value;
	// 	files.push(file);

	// 	console.log('_onFileUpload: ', target, value, file);

	// 	this.setState({
	// 		options: options,
	// 		files: files
	// 	});	
	// },

	_onRouteChange: function(route) {
		console.log('_onRouteChange: ', route);
		this.setState({
			route: route
		});
	},

	_onSortMember: function(array) {
		var newParams = extend({}, this.state.params);
		newParams.members = array;

		console.log('_onSortMember array: ', array);

		this.setState({
			params: newParams
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		// var filteredMembers = this.state.filteredMembers || [];

		console.log('remder: ', params.name, params);

		//<div className="form-group">
		//    <label className="col-sm-4 control-label">
		  //      <span>{frases.EXTENSION} </span>
		    //</label>
		    //<div className="col-sm-8">
		    //	<ObjectRoute frases={frases} routes={params.routes} removeRoute={this._onRouteRemove} onChange={this._onRouteChange} />
		    //</div>
		//</div>
		//<hr/>

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled || false}
			    	onStateChange={this._onStateChange}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.state.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<GroupMembersComponent frases={frases} sortable={true} onSort={this._onSortMember} members={members} getExtension={this.props.getExtension} onAddMembers={this._onAddMembers} deleteMember={this.props.deleteMember} />
			    	</div>
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.SETTINGS.SETTINGS}>
			    			<form className="form-horizontal">
			    			    <div className="form-group">
			    			        <label className="col-sm-4 control-label">
			    			            <span>{frases.HUNTINGTYPE.HUNTINGTYPE} </span>
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
			    			        </label>
			    			        <div className="col-sm-4">
			    			        	<div className="input-group">
			    			        	    <input type="number" className="form-control" value={ this.state.options.timeout } name="timeout" onChange={ this._handleOnChange } />
			    			        	    <span className="input-group-addon">{frases.SECONDS}</span>
			    			        	</div>
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
			    			    <hr/>
			    			    <div className="form-group">
			    			        <label className="col-sm-4 control-label">
			    			            <span>{frases.GREETNAME} </span>
			    			        </label>
			    			        <div className="col-sm-6">
			    			            <FileUpload frases={frases} name="greeting" value={this.state.options.greeting} onChange={this._onFileUpload} />
			    			        </div>
			    			    </div>
			    			    <div className="form-group">
			    			        <label className="col-sm-4 control-label">
			    			            <span>{frases.WAIT_MUSIC} </span>
			    			        </label>
			    			        <div className="col-sm-6">
			    			            <FileUpload frases={frases} name="waitmusic" value={this.state.options.waitmusic} onChange={this._onFileUpload} />
			    			        </div>
			    			    </div>
			    			</form>
			    		</PanelComponent>
			    	</div>
			    </div>
			</div>
		);
	}
});

HuntingGroupComponent = React.createFactory(HuntingGroupComponent);

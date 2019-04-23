 var IcdGroupComponent = React.createClass({

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
			files: [],
			filteredMembers: []
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {},
			options: this.props.params.options,
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params,
			options: this.props.params.options,
			removeObject: props.removeObject,
			filteredMembers: props.params.members
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
		var state = extend({}, this.state);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.options[target.name] = type === 'number' ? parseFloat(value) : value;

		this.setState({
			state: state
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

		this.setState({
			state: state
		});	
	},

	// _onFileUpload: function(e) {
	// 	var state = this.state;
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;

	// 	state.options[target.name] = value;
	// 	state.files.push(file);


	// 	this.setState({
	// 		state: state
	// 	});	
	// },

	// _onRouteChange: function(route) {
	// 	this.setState({
	// 		route: route
	// 	});
	// },
	
	_onSortMember: function(array) {
		var params = this.state.params;
		params.members = array;
		this.setState({
			params: params
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];

		// <div className="form-group">
		    // <label className="col-sm-4 control-label">
		        // <span>{frases.EXTENSION} </span>
		    // </label>
		    // <div className="col-sm-4">
		    	// <ObjectRoute frases={frases} routes={params.routes} onChange={this._onRouteChange} />
		    // </div>
		// </div>
		// <hr/>

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
			    			<ul className="nav nav-tabs" role="tablist">
			    				<li role="presentation" className="active"><a href="#tab-icd-general" aria-controls="general" role="tab" data-toggle="tab">{frases.ICD_GROUP.GENERAL_SETTINGS_TAB}</a></li>
			    				<li role="presentation"><a href="#tab-icd-queue" aria-controls="queue" role="tab" data-toggle="tab">{frases.ICD_GROUP.QUEUE_SETTINGS_TAB}</a></li>
			    			</ul>

							<div className="tab-content" style={{ padding: "20px 0" }}>
								<div role="tabpanel" className="tab-pane fade in active" id="tab-icd-general">
									<form className="form-horizontal">
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.ROUTEMETH.ROUTEMETH} </span>
										    </label>
										    <div className="col-sm-4">
										        <select name="method" className="form-control" value={ this.state.options.method } onChange={ this._handleOnChange }>
										            <option value="0">{frases.ROUTEMETH.UNIFORM}</option>
										            <option value="1">{frases.ROUTEMETH.PRIORITY}</option>
										            <option value="2">{frases.ROUTEMETH.RANDOM}</option>
										            <option value="3">{frases.ROUTEMETH.CALLER_ID}</option>
										        </select>
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.PRIORITY} </span>
										    </label>
										    <div className="col-md-2 col-sm-4">
										        <input type="text" className="form-control" name="priority" value={ this.state.options.priority } onChange={ this._handleOnChange } />
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.SETTINGS.MAXCONN} </span>
										    </label>
										    <div className="col-md-2 col-sm-4">
										        <input type="text" className="form-control" name="maxlines" value={ this.state.options.maxlines } onChange={ this._handleOnChange } />
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.NOANSTOUT} </span>
										    </label>
										    <div className="col-sm-4">
										        <div className="input-group">
										            <input type="text" className="form-control" name="natimeout" value={ this.state.options.natimeout } onChange={ this._handleOnChange } />	
										            <span className="input-group-addon">{frases.SECONDS}</span>
										        </div>
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.RESUMETIME} </span>
										    </label>
										    <div className="col-sm-4">
										        <div className="input-group">
										            <input type="text" className="form-control" name="resumetime" value={ this.state.options.resumetime } onChange={ this._handleOnChange } />
										            <span className="input-group-addon">{frases.SECONDS}</span>
										        </div>
										    </div>
										</div>
										<div className="form-group">
										    <div className="col-sm-offset-4 col-sm-8">
										        <div className="input-group">
										            <div className="checkbox">
										                <label>
										                    <input type="checkbox" name="autologin" checked={ this.state.options.autologin } onChange={ this._handleOnChange } /> 
										                    <span>{frases.AUTOREG} </span> 
										                </label>
										            </div>
										            <span className="input-group-btn">
										                <button type="button" className="btn btn-default" name="open-autologin-options" style={{ display: "none" }}>
										                    <i className="fa fa-cog fa-fw"></i>
										                </button>
										            </span>
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
										        <span>{frases.QUEUEPROMPT} </span>
										    </label>
										    <div className="col-sm-6">
										    	<FileUpload frases={frases} name="queueprompt" value={this.state.options.queueprompt} onChange={this._onFileUpload} />
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.QUEUEMUSIC} </span>
										    </label>
										    <div className="col-sm-6">
										    	<FileUpload frases={frases} name="queuemusic" value={this.state.options.queuemusic} onChange={this._onFileUpload} />
										    </div>
										</div>
										<hr/>
										<div className="form-group">
										    <div className="col-sm-offset-4 col-sm-8">
										        <div className="checkbox">
										            <label>
										                <input type="checkbox" name="canpickup" checked={ this.state.options.canpickup } onChange={ this._handleOnChange } /> 
										                <span>{frases.ALLOW_PICKUP} </span> 
										            </label>
										        </div>
										    </div>
										</div>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.GROUPNUM} </span>
										    </label>
										    <div className="col-md-2 col-sm-4">
										        <input type="text" className="form-control" name="groupno" value={ this.state.options.groupno } onChange={ this._handleOnChange } />
										    </div>
										</div>
										<hr/>
										<div className="form-group">
										    <label className="col-sm-4 control-label">
										        <span>{frases.APPLICATION} </span>
										    </label>
										    <div className="col-sm-8">
										        <input type="text" className="form-control" name="application" value={ this.state.options.application } onChange={ this._handleOnChange } />
										    </div>
										</div>
									</form>
								</div>

								<div role="tabpanel" className="tab-pane fade" id="tab-icd-queue">
									<form className="form-horizontal">
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.QUEUELEN} </span>
								            </label>
								            <div className="col-md-2 col-sm-4">
								                <input type="text" className="form-control" name="queuelen" value={ this.state.options.queuelen } onChange={ this._handleOnChange } />
								            </div>
								        </div>
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.OVERFLOWREDIR} </span>
								            </label>
								            <div className="col-sm-8">
								                <input type="text" className="form-control" name="overflowredirect" value={ this.state.options.overflowredirect } onChange={ this._handleOnChange } />
								            </div>
								        </div>
								        <hr/>
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.MAXQWAIT} </span>
								            </label>
								            <div className="col-md-2 col-sm-4">
								                <div className="input-group">
								                    <input type="text" className="form-control" name="maxqwait" value={ this.state.options.maxqwait } onChange={ this._handleOnChange } />
								                    <span className="input-group-addon">{frases.SECONDS}</span>
								                </div>
								            </div>
								        </div>
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.OVERTIMEREDIR} </span>
								            </label>
								            <div className="col-sm-8">
								                <input type="text" className="form-control" name="overtimeredirect" value={ this.state.options.overtimeredirect } onChange={ this._handleOnChange } />
								            </div>
								        </div>
								        <hr/>
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.INDICMODE} </span>
								            </label>
								            <div className="col-md-2 col-sm-4">
								                <input type="text" className="form-control" name="indicationmode" value={ this.state.options.indicationmode } onChange={ this._handleOnChange } />
								            </div>
								        </div>
								        <div className="form-group">
								            <label className="col-sm-4 control-label">
								                <span>{frases.INDICTIME} </span>
								            </label>
								            <div className="col-md-2 col-sm-4">
								                <div className="input-group">
								                    <input type="text" className="form-control" name="indicationtime" value={ this.state.options.indicationtime } onChange={ this._handleOnChange } />
								                    <span className="input-group-addon">{frases.SECONDS}</span>
								                </div>
								            </div>
								        </div>
									</form>
								</div>
							</div>
			    		</PanelComponent>
			    	</div>
			    </div>
			</div>
		);
	}
});

IcdGroupComponent = React.createFactory(IcdGroupComponent);

var UsersGroupComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		onImportUsers: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		activeServices: React.PropTypes.array,
		deleteMember: React.PropTypes.func
		// addSteps: React.PropTypes.func
		// initSteps: React.PropTypes.func
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
			// options: this.props.params.options,
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});
	},

	// componentDidMount: function() {
	// 	if(!this.props.params.name) this.props.initSteps(); // start tour if the group is new
	// },

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params,
			// options: this.props.params.options,
			removeObject: props.removeObject,
			filteredMembers: props.params.members
		});
	},

	_setObject: function() {
		var params = this.state.params;
		// params.options = this.state.options;
		// params.files = this.state.files.reduce(function(array, item) { array.push(item.file); return array; }, []);
		// params.route = this.state.route;
		this.props.setObject(params);
	},

	_onNameChange: function(value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onFeatureChange: function(params) {
		var state = this.state;
		state.params.profile = params;

		this.setState({
			state: state
		});
	},

	_onTransformsChange: function(params) {
		var state = this.state;
		var profile = state.params.profile;

		profile.transforms = params;

		this.setState({
			state: state
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	// enabled={params.enabled || false}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.state.removeObject}
			    	// addSteps={this.props.addSteps}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<GroupMembersComponent 
			    			frases={frases} 
			    			doSort={true}
			    			onSort={this._onSortMember} 
			    			members={members}
			    			kind={params.kind}
			    			getExtension={this.props.getExtension} 
			    			onAddMembers={this.props.onAddMembers} 
			    			onImportUsers={this.props.onImportUsers} 
			    			activeServices={this.props.activeServices}
			    			deleteMember={this.props.deleteMember} 
			    			// addSteps={this.props.addSteps}
			    		/>
			    	</div>
			    </div>
			    <div className="row">
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.SETTINGS.SETTINGS} classname={'minimized'}>
			    			<ul className="nav nav-tabs" role="tablist">
			    				<li role="presentation" className="active"><a href="#tab-group-features" aria-controls="features" role="tab" data-toggle="tab">{frases.USERS_GROUP.EXT_FEATURES_SETTS}</a></li>
			    				<li role="presentation"><a href="#tab-group-outrules" aria-controls="outrules" role="tab" data-toggle="tab">{frases.USERS_GROUP.OUTCALLS_SETTS}</a></li>
			    			</ul>

							<div className="tab-content" style={{ padding: "20px 0" }}>
								<div role="tabpanel" className="tab-pane fade in active" id="tab-group-features">
									<GroupFeaturesComponent frases={frases} groupKind={params.kind} params={params.profile} onChange={this._onFeatureChange} />
								</div>

								<div role="tabpanel" className="tab-pane fade" id="tab-group-outrules">
									<div className="col-sm-12">
										<div className="alert alert-info" role="alert">
											<button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
											<p><strong>{frases.NUMBER_TRANSFORMS.NUMBER_TRANSFORMS}</strong></p>
											<p>{frases.NUMBER_TRANSFORMS.HELPERS.NUMBER}</p>
											<p>{frases.NUMBER_TRANSFORMS.HELPERS.STRIP}</p>
											<p>{frases.NUMBER_TRANSFORMS.HELPERS.PREFIX}</p>
											<p>{frases.NUMBER_TRANSFORMS.HELPERS.DOLLAR}</p>
										</div>
									</div>
									<NumberTransformsComponent frases={frases} type="outboundb" transforms={params.profile.bnumbertransforms} onChange={this._onTransformsChange} />
								</div>
							</div>
			    		</PanelComponent>
			    	</div>
			    </div>
			    {
			    	members.length ? <DownloadAppsLightbox frases={frases} /> : null
			    }
			</div>
		);
	}
});

UsersGroupComponent = React.createFactory(UsersGroupComponent);

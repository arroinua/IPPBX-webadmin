var LocationGroupComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		getExtension: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {}
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params
		});
	},

	_setObject: function() {
		var params = this.state.params;
		this.props.setObject(params);
	},

	_onNameChange: function(value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onTransformsChange: function(type, params) {
		var state = this.state;
		var profile = state.params.profile;

		profile[type] = params;

		this.setState({
			state: state
		});
	},

	_validateIp: function(string) {
		var value;
		var validIp = true;
		var bytes = string.split('.');

		value = bytes.map(function(str, index, array) {
			if(isNaN(str) || array.length > 4) {
				validIp = false;
			} else if(str.length > 3) {
				if(array.length === 4) validIp = false;
				else {
					str = str.substring(0, 3) + '.' + str.substring(3);
				}
			}
			
			return str;

		}).join('.');

		if(!validIp) return false;

		return value;
	},

	_handleOnBlur: function(event) {
		var state = extend({}, this.state.params);
		var target = event.target;
		var name = target.name;
		var	value = target.value;
		var bytes = value ? value.split('.') : [];
		var emptyBytes = 4 - bytes.length;

		if(emptyBytes) {
			for (var i = 0; i < emptyBytes; i++) {
				bytes.push('0');
			}
		}

		state[name] = bytes.join('.');
		this.setState({ params: state });

	},

	_handleRuleChange: function(event) {
		var state = extend({}, this.state.params);
		var target = event.target;
		var name = target.name;
		var value = this._validateIp(target.value);

		if(value === false) return;

		state[name] = value;
		this.setState({ params: state });

	},

	// _onFeatureChange: function(params) {
	// 	var state = this.state;
	// 	state.params.profile = params;

	// 	this.setState({
	// 		state: state
	// 	});
	// },

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	placeholder={frases.NAME}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.props.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<GroupMembersComponent 
			    			frases={frases} 
			    			members={members}
			    			kind={params.kind}
			    			getExtension={this.props.getExtension}
			    		/>
			    	</div>
			    </div>
			    <div className="row">
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.SETTINGS.SETTINGS}>
			    			<form className="form-horizontal">
			    				<div className="form-group">
			    				    <label className="col-sm-4 control-label">{frases.SETTINGS.SECURITY.NETWORK} / {frases.SETTINGS.SECURITY.NETMASK}</label>
			    				    <div className="col-sm-3">
			    				        <input type="text" className="form-control" name="network" value={ params.network } onBlur={this._handleOnBlur} onChange={ this._handleRuleChange } />
			    				    </div>
			    				    <span className="col-sm-1 text-center" style={{ fontSize: "1.5em" }}> / </span>
			    				    <div className="col-sm-3">
			    				        <input type="text" className="form-control" name="netmask" value={ params.netmask } onBlur={this._handleOnBlur} onChange={ this._handleRuleChange } />
			    				    </div>
			    				</div>
			    			</form>
			    			<br/><br/>
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
							<div className="col-sm-6">
								<NumberTransformsComponent frases={frases} type="outbounda" transforms={params.profile.anumbertransforms} onChange={this._onTransformsChange.bind(this, 'anumbertransforms')} />
							</div>
							<div className="col-sm-6">
								<NumberTransformsComponent frases={frases} type="outboundb" transforms={params.profile.bnumbertransforms} onChange={this._onTransformsChange.bind(this, 'bnumbertransforms')} />
							</div>
			    		</PanelComponent>
			    	</div>
			    </div>
			</div>
		);
	}
});

LocationGroupComponent = React.createFactory(LocationGroupComponent);

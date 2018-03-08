var EmailTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			data: {},
			provider: ""
		};
	},

	componentWillMount: function() {
		this.setState({
			data: this.props.properties || {}
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			data: props.properties || {}
		});		
	},

	_onChange: function(e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		console.log('EmailTrunkComponent onChange: ', value);

		data[target.name] = value;

		if(target.name === 'username') data.id = value;

		this.setState({
			data: data
		});

		this.props.onChange(data);

	},

	_onProviderSelect: function(e) {
		var provider = e.target.value;
		var props = this.props.serviceParams.providers[provider];
		var state = this.state;

		state.provider = provider;

		if(provider && provider !== 'other') {
			state.data = this._extendProps(state.data, props);
		} else {
			state.data.hostname = "";
			state.data.port = "";
		}

		this.setState(state);
	},

	_extendProps: function(toObj, fromObj) {
		for(var key in fromObj) {
			toObj[key] = fromObj[key];
		}

		return toObj;
	},

	render: function() {
		var data = this.state.data;
		var frases = this.props.frases;
		
		console.log('EmailTrunkComponent render: ', this.state.data, this.props.serviceParams);
		// <option value="pop3">POP3</option>

		return (
			<div>
				{
					this.props.isNew && (
						<form className="form-horizontal" autoComplete='off'>
							<div className="form-group">
							    <label htmlFor="provider" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.SELECT_ACCOUNT_PROVIDER}</label>
							    <div className="col-sm-4">
							    	<select type="text" className="form-control" name="provider" value={this.state.provider} onChange={this._onProviderSelect}>
							    		<option value="">{frases.CHAT_TRUNK.EMAIL.NOT_SELECTED}</option>
							    		<option value="gmail">Gmail</option>
							    		<option value="outlook">Outlook</option>
							    		<option value="office365">Office 365</option>
							    		<option value="icloud">iCloud</option>
							    		<option value="yahoo">Yahoo</option>
							    		<option value="aol">AOL</option>
							    		<option value="other">{frases.CHAT_TRUNK.EMAIL.OTHER_PROVIDER}</option>
							    	</select>
							    </div>
							</div>
						</form>
					)
				}
				
				{
					(this.state.provider || !this.props.isNew) ? (
						<form className="form-horizontal" autoComplete='off'>
							<div className="form-group">
							    <label htmlFor="protocol" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PROTOCOL}</label>
							    <div className="col-sm-4">
							    	<select type="text" className="form-control" name="protocol" value={data.protocol} onChange={this._onChange} autoComplete='off' required>
							    		<option value="pop3">POP3</option>
							    		<option value="imap">IMAP</option>
							    	</select>
							    </div>
							</div>
							{
								this.state.provider === 'other' && (
									<div className="form-group">
									    <label htmlFor="usermail" className="col-sm-4 control-label">{frases.EMAIL}</label>
									    <div className="col-sm-4">
									    	<input type="text" className="form-control" name="usermail" value={data.usermail} onChange={this._onChange} autoComplete='off' required />
									    </div>
									</div>
								)
							}
							<div className="form-group">
							    <label htmlFor="username" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.USERNAME}</label>
							    <div className="col-sm-4">
							    	<input type="text" className="form-control" name="username" value={data.username} onChange={this._onChange} autoComplete='off' required />
							    </div>
							</div>
							<div className="form-group">
							    <label htmlFor="password" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PASSWORD}</label>
							    <div className="col-sm-4">
							    	<input type="password" className="form-control" name="password" value={data.password} onChange={this._onChange} autoComplete='off' required />
							    </div>
							</div>
							<div className="form-group">
							    <label htmlFor="hostname" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.HOSTNAME}</label>
							    <div className="col-sm-4">
							    	<input type="text" className="form-control" name="hostname" value={data.hostname} onChange={this._onChange} autoComplete='off' required />
							    </div>
							</div>
							<div className="form-group">
							    <label htmlFor="port" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PORT}</label>
							    <div className="col-sm-2">
							    	<input type="number" className="form-control" name="port" value={data.port} onChange={this._onChange} autoComplete='off' required />
							    </div>
							</div>
							<div className="form-group">
								<div className="col-sm-4 col-sm-offset-4">
								  	<div className="checkbox">
								    	<label>
								      		<input type="checkbox" checked={data.usessl} name="usessl" onChange={this._onChange} /> {frases.CHAT_TRUNK.EMAIL.SSL}
								    	</label>
								  	</div>
								</div>
							</div>
						</form>
					) : null
				}
			</div>
		);
	}
});

EmailTrunkComponent = React.createFactory(EmailTrunkComponent);

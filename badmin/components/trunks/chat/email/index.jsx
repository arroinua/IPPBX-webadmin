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
			props: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			props: this.props.properties || {}
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			props: props.properties || {}
		});		
	},

	_onChange: function(e) {
		var target = e.target;
		var props = this.state.props;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		console.log('EmailTrunkComponent onChange: ', value);

		props[target.name] = value;

		if(target.name === 'username') props.id = value;

		this.setState({
			props: props
		});

		this.props.onChange(props);

	},

	render: function() {
		var props = this.state.props;
		var frases = this.props.frases;
		
		console.log('EmailTrunkComponent render: ', this.state.props, this.props.serviceParams);
		// <option value="pop3">POP3</option>

		return (
			<form className="form-horizontal" autoComplete='off'>
				<input type="text" style={{display:"none"}} />
				<input type="password" style={{display:"none"}} />
				<div className="form-group">
				    <label htmlFor="protocol" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PROTOCOL}</label>
				    <div className="col-sm-4">
				    	<select type="text" className="form-control" name="protocol" value={props.protocol} onChange={this._onChange} autoComplete='off' required>
				    		<option value="pop3">POP3</option>
				    		<option value="imap">IMAP</option>
				    	</select>
				    </div>
				</div>
				<div className="form-group">
				    <label htmlFor="username" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.USERNAME}</label>
				    <div className="col-sm-4">
				    	<input type="text" className="form-control" name="username" value={props.username} onChange={this._onChange} autoComplete='off' required />
				    </div>
				</div>
				<div className="form-group">
				    <label htmlFor="password" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PASSWORD}</label>
				    <div className="col-sm-4">
				    	<input type="password" className="form-control" name="password" value={props.password} onChange={this._onChange} autoComplete='off' required />
				    </div>
				</div>
				<div className="form-group">
				    <label htmlFor="hostname" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.HOSTNAME}</label>
				    <div className="col-sm-4">
				    	<input type="text" className="form-control" name="hostname" value={props.hostname} onChange={this._onChange} autoComplete='off' required />
				    </div>
				</div>
				<div className="form-group">
				    <label htmlFor="port" className="col-sm-4 control-label">{frases.CHAT_TRUNK.EMAIL.PORT}</label>
				    <div className="col-sm-2">
				    	<input type="number" className="form-control" name="port" value={props.port} onChange={this._onChange} autoComplete='off' required />
				    </div>
				</div>
				<div className="form-group">
					<div className="col-sm-4 col-sm-offset-4">
					  	<div className="checkbox">
					    	<label>
					      		<input type="checkbox" checked={props.usessl} name="usessl" onChange={this._onChange} /> {frases.CHAT_TRUNK.EMAIL.SSL}
					    	</label>
					  	</div>
					</div>
				</div>
			</form>
		);
	}
});

EmailTrunkComponent = React.createFactory(EmailTrunkComponent);

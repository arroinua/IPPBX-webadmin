var ApiKeysComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		generateApiKey: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			keyName: "",
			keys: {}
		};
	},

	componentWillMount: function() {
		var keysObj = this.props.params.apikeys || {};
		var keyObj = {};
		var keysArray = Object.keys(keysObj).map(function(key) {
			keyObj.key = key;
			keyObj.value = keysObj[key];
			keyObj.show = false;
			return keyObj;
		});

		this.setState({
			keys: keysArray
		});		
	},

	componentWillReceiveProps: function(props) {
		var keysObj = props.params.apikeys || {};
		var keyObj = {};
		var keysArray = Object.keys(keysObj).map(function(key) {
			keyObj.key = key;
			keyObj.value = keysObj[key];
			keyObj.show = false;
			return keyObj;
		});

		this.setState({
			keys: keysArray
		});		
	},

	_onChange: function(e) {
		console.log('_onChange', e.target.value);
		this.setState({
			keyName: e.target.value
		});
	},

	_onSubmit: function(e) {
		e.preventDefault();
		if(!this.state.keyName) return notify_about('info', 'Please specify the key name');

		var state = this.state;

		this.props.generateApiKey({ name: this.state.keyName }, function(result) {
			console.log('generateApiKey result: ', result);
			if(result) {
				state.keys.push({ key: state.keyName, value: result, show: false });
				state.keyName = "";
				this.setState(state);
			}
		}.bind(this));
	},

	_showKey: function(key, e) {
		console.log('_showKey', e, key);
		e.preventDefault();
		var state = this.state;
		state.keys = state.keys.map(function(item) {
			if(item.key === key) item.show = !item.show;
			return item;
		});

		this.setState({
			keys: state.keys
		});
	},

	render: function() {
		var frases = this.props.frases;
		var keys = this.state.keys;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<p>Generate API Keys to access the API methods. The API Key should be sent in the Authorization HTTP header, like this: <code>{"Authorization: Bearer <API Key>"}</code> </p>
						<div className="alert alert-warning"><strong>Important</strong>: The API keys should be kept secret at all times. Don't use them in the environments where they could be compromised (like a browser). If you believe that one of your API keys is compromised, please remove it and generate a new one.</div>
						<form className="form-inline" onSubmit={this._onSubmit}>
							<div className="form-group">
								<input type="text" name="keyName" className="form-control" value={this.state.keyName} onChange={this._onChange} placeholder="Key name" /> 
							</div>
							<span> </span>
							<button type="submit" className="btn btn-primary">Generate API Key</button>
						</form>
					</div>
				</div>
				<div className="row" style={{marginTop: "20px"}}>
					<div className="col-xs-12">
						<hr/>
						<form className="form-horizontal">
						{
							keys.map(function(item, index) {
								return (
									<div key={index} className="form-group">
										<label className="col-sm-2 control-label">{item.key}</label>
										<div className="col-sm-4">
											<input type={item.show ? "text" : "password"} className="form-control" value={item.value} aria-label="API key" readOnly />
										</div>
										<div className="col-sm-2"><a href="#" onClick={this._showKey.bind(this, item.key)}>Show</a></div>
									</div>
								)
							}.bind(this))
						}
						</form>
					</div>
				</div>
			</div>
		);
	}
});

ApiKeysComponent = React.createFactory(ApiKeysComponent);

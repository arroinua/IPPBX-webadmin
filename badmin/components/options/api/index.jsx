var ApiKeysComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		generateApiKey: React.PropTypes.func,
		deleteApiKey: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			keyName: "",
			keys: [],
			scope: "admin"
		};
	},

	componentWillMount: function() {
		this.setState({
			keys: [].concat(this.props.params.apikeys) || []
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			keys: [].concat(props.params.apikeys) || []
		});
	},

	_onChange: function(e) {
		var target = e.target;
		var state = extend({}, this.state);
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		state[target.name] = value;

		this.setState(state);

	},

	_onSubmit: function(e) {
		e.preventDefault();
		if(!this.state.keyName) return notify_about('info', this.props.frases.SETTINGS.API_KEYS.EMPTY_NAME_WARNING);

		var state = this.state;

		this.props.generateApiKey({ name: this.state.keyName, scope: this.state.scope }, function(result) {
			if(result) {
				state.keys.push({ name: state.keyName, value: result, scope: this.state.scope, show: false });
				state.keyName = "";
				this.setState(state);
			}
		}.bind(this));
	},

	_revealValue: function(key, e) {
		e.preventDefault();
		var state = this.state;
		state.keys = state.keys.map(function(item) {
			if(item.name === key) item.show = !item.show;
			return item;
		});

		this.setState({
			keys: state.keys
		});
	},

	_deleteValue: function(key, e) {
		var keys = [].concat(this.state.keys);
		var frases = this.props.frases;
		var conf = confirm( Utils.interpolate(frases.SETTINGS.API_KEYS.DELETE_WARNING, { key: key }));

		if(conf) {
			this.props.deleteApiKey({ name: key }, function(result) {
				keys = keys.filter(function(item) {
					return item.name !== key;
				});
				
				this.setState({ keys: keys });

			}.bind(this));
		}
			
	},

	// _copyToClipboard: function(key, e) {
	// 	this.el.focus();
	// 	this.el.select();

	// 	var copied = document.execCommand('copy');
	// 	if(copied && !this.state.inBuffer) {
	// 		setTimeout(function() {
	// 			this.setState({ inBuffer: false });
	// 		}.bind(this), 5000);
	// 		this._copied();
	// 	}
	// },

	// _copied: function() {
	// 	this.setState({ inBuffer: !this.state.inBuffer });
	// },

	_onRef: function(el) {
		this.el = el;
	},

	render: function() {
		var frases = this.props.frases;
		var keys = this.state.keys;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<p dangerouslySetInnerHTML={{ __html: Utils.htmlDecode(frases.SETTINGS.API_KEYS.DESC) }}></p>
						<div className="alert alert-warning" dangerouslySetInnerHTML={{ __html: Utils.htmlDecode(frases.SETTINGS.API_KEYS.WARNING) }}></div>
						<form className="form-inline" onSubmit={this._onSubmit}>
							<div className="form-group">
								<input type="text" name="keyName" className="form-control" value={this.state.keyName} onChange={this._onChange} placeholder={frases.SETTINGS.API_KEYS.KEY_NAME_LABEL} /> 
								<span> </span>
								<select name="scope" className="form-control" value={this.state.scope} onChange={this._onChange}>
									{
										this.props.params.apis.map(function(scope) {
											return <option key={scope} value={scope}>{scope}</option>
										})
									}
								</select>
								<span> </span>
								<button type="submit" className="btn btn-success">{frases.SETTINGS.API_KEYS.CREATE_KEY_BTN}</button>
							</div>
						</form>
					</div>
				</div>
				<div className="row" style={{marginTop: "20px"}}>
					<div className="col-xs-12">
						<form className="form-horizontal">
						{
							keys.map(function(item, index) {
								return (
									<div key={item.name} className="form-group">
										<hr/>
									    <label className="col-sm-2 control-label">{item.name}</label>
									    <label className="col-sm-2 control-label text-muted">{item.scope}</label>
									    <div className="col-sm-8">
									        <div className="input-group">
									            <input type={ item.show ? "text" : "password"} className="form-control" value={item.value} aria-label="API key" readOnly={true} />
									            <span className="input-group-btn">
									                <button type="button" className="btn btn-default" onClick={this._revealValue.bind(this, item.name)}>
									                    <i className="fa fa-eye" data-toggle="tooltip" title={frases.REVEAL_PWD}></i>
									                </button>
									                <button type="button" className="btn btn-default" onClick={this._deleteValue.bind(this, item.name)}>
									                    <i className="fa fa-trash text-danger" data-toggle="tooltip" title={frases.DELETE}></i>
									                </button>
									            </span>
									        </div>
									    </div>
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

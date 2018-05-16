var NewUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupid: React.PropTypes.string,
		validationError: React.PropTypes.bool,
		generatePassword: React.PropTypes.func,
		validateEmail: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			userParams: {},
			focused: false,
			validationError: false,
			passwordRevealed: false
		};
	},

	componentWillMount: function() {
		this.setState({
			userParams: {
				info: {},
				storelimit: (this.props.params.storelimit || this.props.convertBytes(1, 'GB', 'Byte')),
				password: this.props.generatePassword()
			}
		});
	},

	componentWillReceiveProps: function(props) {
		if(props.validationError !== undefined) {
			this.setState({
				validationError: props.validationError
			});
		}
			
	},

	_revealPassword: function() {
		this.setState({
			passwordRevealed: !this.state.passwordRevealed
		});
	},

	_generatePassword: function() {
		this.state.userParams.password = this.props.generatePassword();
		this.setState({
			userParams: this.state.userParams
		}); 
	},

	_onExtChange: function(params) {
		console.log('_onExtChange: ', params);
		this.state.userParams.number = params.ext;
		this.setState({
			userParams: this.state.userParams
		});
	},

	_onChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var userParams = this.state.userParams;
		var tname = target.name;

		console.log('_onChange: ', tname, value, this.state.focused);

		if(tname === 'email') {
			userParams.info = userParams.info || {};
			userParams.info.email = value;
		} else {
			userParams[target.name] = type === 'number' ? parseFloat(value) : value;
		}

		if(tname === 'name') userParams.display = value;
		if(tname === 'storelimit') userParams.storelimit = this.props.convertBytes(value, 'GB', 'Byte');

		this.setState({
			userParams: userParams
		});

		this.props.onChange(userParams);
	},

	_onFocus: function(e) {
		var userParams = this.state.userParams;
		var email = userParams.info.email;
		if(email) userParams.login = email.substr(0,email.indexOf('@'));

		console.log('_onFocus: ', email, email.substr(0,email.indexOf('@')));

		this.setState({
			userParams: userParams
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var userParams = this.state.userParams;
		var validationError = this.state.validationError;

		console.log('NewUsersComponent: ', params);

		return (
			<div className="row">
			    <form className="col-xs-12" name="new-user-form" autoComplete="nope">
		            <div className={"form-group "+((validationError && !userParams.name) ? 'has-error' : '')}>
		                <label className="control-label">{frases.USERS_GROUP.NAME}</label>
		                <input type="text" className="form-control" name="name" value={userParams.name} onChange={this._onChange} placeholder={frases.USERS_GROUP.PLACEHOLDERS.NAME} autoComplete="none" required />
		            </div>
		            {
		            	params.kind === 'users' && (
		            		<div className={"form-group "+((validationError && (!userParams.info.email || !this.props.validateEmail(userParams.info.email))) ? 'has-error' : '')}>
				                <label className="control-label">{frases.USERS_GROUP.EMAIL}</label>
				                <input type="email" className="form-control" name="email" value={userParams.info.email} onChange={this._onChange} placeholder={frases.USERS_GROUP.PLACEHOLDERS.EMAIL} autoComplete="none" required />
				            </div>
		            	)
		            }
			    	<input autoComplete="none" name="hidden" type="hidden" value="stopautofill" style={{display:"none"}} />
		            <div className={"form-group "+((validationError && !userParams.login) ? 'has-error' : '')}>
		                <label className="control-label">{frases.USERS_GROUP.LOGIN}</label>
		                <input type="text" className="form-control" name="login" value={userParams.login} placeholder={frases.USERS_GROUP.PLACEHOLDERS.LOGIN} onFocus={this._onFocus} onChange={this._onChange} required autoComplete="none" />
		            </div>
			    	<input autoComplete="none" name="hidden" type="hidden" value="stopautofill" style={{display:"none"}} />
		            <div className="form-group">
		                <label className="control-label">{frases.USERS_GROUP.PASSWORD}</label>
	                    <div className="input-group">
	                        <input type={this.state.passwordRevealed ? 'text' : 'password'} name="password" value={userParams.password} className="form-control" placeholder={frases.USERS_GROUP.PLACEHOLDERS.PASSWORD} onChange={this._onChange} required autoComplete="none" />
	                        <span className="input-group-btn">
	                            <button type="button" className="btn btn-default" onClick={this._revealPassword}>
	                                <i className="fa fa-eye" data-toggle="tooltip" title={frases.USERS_GROUP.PLACEHOLDERS.REVEAL_PWD}></i>
	                            </button>
	                            <button type="button" className="btn btn-default" onClick={this._generatePassword}>
	                                <i className="fa fa-refresh" data-toggle="tooltip" title={frases.USERS_GROUP.PLACEHOLDERS.GENERATE_PWD}></i>
	                            </button>
	                        </span>
	                    </div>
		            </div>
		            <div className="form-group">
		                <label className="control-label">{frases.USERS_GROUP.EXTENSION}</label>
		                <ObjectRoute frases={frases} extOnly={true} routes={params.available} onChange={this._onExtChange} />
		            </div>
		            {
		            	params.kind === 'users' && (
		            		<div className="form-group">
			                    <label className="control-label">{frases.USERS_GROUP.MAXSTORAGE}</label>
		                        <div className="input-group">
		                            <input type="number" className="form-control" name="storelimit" value={Math.ceil(this.props.convertBytes(userParams.storelimit, 'Byte', 'GB'))} min="1" step="1" onChange={this._onChange} />
		                            <span className="input-group-addon">GB</span>
		                        </div>
			                </div>
		            	)
		            }
		            {
		            	validationError && (
		            		<div className="alert alert-warning" role="alert">Please, fill in all required fields</div>
		            	)
		            }
			    </form>
			</div>
		);
	}
	
});

NewUsersComponent = React.createFactory(NewUsersComponent);


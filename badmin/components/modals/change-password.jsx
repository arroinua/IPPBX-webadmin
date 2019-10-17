var ChangePasswordComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		open: React.PropTypes.bool,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {},
			errors: [],
			fetching: false,
			validationError: false,
			open: false
		};
	},

	componentWillMount: function() {
		this.setState({ open: true })
	},

	_saveChanges: function() {
		var params = extend({}, this.state.params);
		var errors = [];

		if(params.adminpass !== params.confirmadminpass) return this.setState({ errors: errors.concat({ code: 'password_mismatch' }) });

		this.setState({ fetching: true, validationError: false });

		this.props.onSubmit({ oldadminpass: params.oldadminpass, adminpass: params.adminpass }, function(err, result) {
			if(err) {
				if(err.message === 'Invalid parameter') {
					this.setState({ errors: errors.concat({ code: 'invalid_parameter' }), fetching: false })
				} else {
					this.setState({ errors: errors.concat({ code: 'generic_decline' }), fetching: false })
				}
				return false;
			}

			this.setState({ errors: [], open: false });

		}.bind(this))
	},

	_onChange: function(e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = (target.getAttribute && target.getAttribute('data-type')) || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: params });
	},

	_getBody: function() {
		var frases = this.props.frases;

		return (
			<form className="form">
				<div className="form-group">
					<label className="control-label">{frases.SETTINGS.OLD_PASSWORD}</label>
					<PasswordComponent frases={frases} value={this.state.params.oldadminpass} name="oldadminpass" onChange={this._onChange} />
				</div>
				<div className="form-group">
					<label className="control-label">{frases.SETTINGS.NEW_PASSWORD}</label>
					<PasswordComponent frases={frases} value={this.state.params.adminpass} name="adminpass" onChange={this._onChange} />
				</div>
				<div className="form-group">
					<label className="control-label">{frases.SETTINGS.CONFIRM_NEW_PASSWORD}</label>
					<PasswordComponent frases={frases} value={this.state.params.confirmadminpass} name="confirmadminpass" onChange={this._onChange} />
				</div>
				{
					this.state.errors.length ? (
						<div className="form-group">
							<div className="alert alert-danger" role="alert">
								{
									this.state.errors.map(function(item, index) {
										return (
											<p key={item.code}>{ frases.SETTINGS.CHANGE_PASSWORD_ERROR[item.code] || frases.SETTINGS.CHANGE_PASSWORD_ERROR['generic_decline'] }</p>
										)
									})
								}
							</div>
						</div>
					) : null
				}
			</form>
		)
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();
		var params = this.state.params;

		return (
			<ModalComponent 
				size="sm"
				type="success"
				title={frases.SETTINGS.CHANGE_PASSWORD}
				disabled={!params.adminpass || !params.confirmadminpass || !params.oldadminpass}
				submitText={frases.SUBMIT} 
				cancelText={frases.CANCEL} 
				submit={this._saveChanges} 
				onClose={this.props.onClose}
				closeOnSubmit={false}
				fetching={this.state.fetching}
				open={this.state.open}
				body={body}
			>
			</ModalComponent>
		);
	}
	
});

ChangePasswordComponent = React.createFactory(ChangePasswordComponent);


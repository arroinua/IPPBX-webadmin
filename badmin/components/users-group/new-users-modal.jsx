var NewUsersModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupid: React.PropTypes.string,
		generatePassword: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			userParams: {},
			validationError: false,
			init: false,
			fetching: false,
			closeOnSave: false,
			passwordRevealed: false,
			tkn: Date.now()
		};
	},

	componentWillMount: function() {
		this.setState({
			userParams: window.extend({}, this._getDefaultUserParams(this.props))
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			userParams: window.extend({}, this._getDefaultUserParams(props))
		});
	},

	_onChange: function(userParams) {
		this.setState({ userParams: userParams });
	},

	_saveChanges: function() {
		var userParams = this.state.userParams;
		var errors = {};
		var closeOnSave = this.state.closeOnSave;

		if(!userParams.number || !userParams.name || !userParams.login || !userParams.info.email || !this._validateEmail(userParams.info.email)) {
			this.setState({
				validationError: true
			});

			return notify_about('error', this.props.frases.MISSEDFILED);
		}
		
		this.setState({
			validationError: false,
			fetching: true
		});


		this.props.onSubmit(this.state.userParams, function(error, result) {
			if(error) return this.setState({ fetching: false, closeOnSave: false });
			this.setState({ opened: (closeOnSave ? false : true), fetching: false, closeOnSave: false, userParams: window.extend({}, this._getDefaultUserParams(this.props)) });
		}.bind(this));
	},

	_saveChangesAndClose: function() {
		var saveChanges = this._saveChanges;
		this.setState({ closeOnSave: true });
		setTimeout(saveChanges, 100)
	},

	_validateEmail: function(string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(string);
	},

	_revealPassword: function() {
		this.setState({ passwordRevealed: !this.state.passwordRevealed })
	},

	_getDefaultUserParams: function(props) {
		return {
			info: {},
			storelimit: (props.params.storelimit || props.convertBytes(1, 'GB', 'Byte')),
			password: props.generatePassword(),
			number: (props.params.available && props.params.available.length) ? props.params.available[0] : ""
		}
	},

	_getBody: function() {
		return (
			<NewUsersComponent 
				frases={this.props.frases}
				params={this.props.params}
				userParams={this.state.userParams}
				validationError={this.state.validationError} 
				validateEmail={this._validateEmail} 
				onChange={this._onChange} 
				generatePassword={this.props.generatePassword} 
				revealPassword={this._revealPassword} 
				passwordRevealed={this.state.passwordRevealed} 
				groupid={this.props.groupid}
				convertBytes={this.props.convertBytes}
				tkn={this.state.tkn}
			/>
		);
	},

	_getFooter: function() {
		var frases = this.props.frases;
		return (
			<div className="modal-footer">
				<button className="btn btn-success" onClick={this._saveChangesAndClose} disabled={this.props.fetching ? true : false}>{ this.props.fetching ? <span className="fa fa-spinner fa-spin fa-fw"></span> : frases.ADD_AND_CLOSE}</button>
				<button className="btn btn-success" onClick={this._saveChanges} disabled={this.props.fetching ? true : false}>{ this.props.fetching ? <span className="fa fa-spinner fa-spin fa-fw"></span> : frases.ADD}</button>
				<button className="btn btn-link pull-right" data-dismiss="modal">{frases.CLOSE}</button>
			</div>
		)
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<ModalComponent 
				size="md"
				title={ frases.USERS_GROUP.NEW_USER_MODAL_TITLE }
				type="success"
				fetching={this.state.fetching}
				submitText={frases.ADD} 
				cancelText={frases.CLOSE} 
				submit={this._saveChanges} 
				body={this._getBody()}
				footer={this._getFooter()}
				open={this.state.opened}
			>
			</ModalComponent>
		);
	}
	
});

NewUsersModalComponent = React.createFactory(NewUsersModalComponent);
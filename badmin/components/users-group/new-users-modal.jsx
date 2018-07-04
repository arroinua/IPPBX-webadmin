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
			init: false
		};
	},

	componentWillMount: function() {
		var params = this.props.groupid ? { groupid: this.props.groupid } : null;
		
	},

	_getBody: function() {
		console.log('_getBody');
		var frases = this.props.frases;
		return (
			<NewUsersComponent 
				frases={frases} 
				params={this.props.params} 
				validationError={this.state.validationError} 
				validateEmail={this._validateEmail} 
				onChange={this._onChange} 
				generatePassword={this.props.generatePassword} 
				groupid={this.props.groupid} 
				convertBytes={this.props.convertBytes}
			/>
		);
	},

	_onChange: function(params) {
		this.setState({
			userParams: params
		});
	},

	_saveChanges: function() {
		var userParams = this.state.userParams;
		var errors = {};

		if(!userParams.name || !userParams.login || !userParams.info.email || !this._validateEmail(userParams.info.email)) {
			this.setState({
				validationError: true
			});

			return;
		}
		
		this.setState({
			validationError: false
		});			

		this.props.onSubmit(this.state.userParams);
	},

	_validateEmail: function(string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(string);
	},

	render: function() {
		var frases = this.props.frases;
		console.log('NewUsersModalComponent');

		return (
			<ModalComponent 
				size="md"
				title={ frases.USERS_GROUP.NEW_USER_MODAL_TITLE }
				type="success"
				submitText={frases.ADD} 
				cancelText={frases.CLOSE} 
				submit={this._saveChanges} 
				body={this._getBody()}
			>
			</ModalComponent>
		);
	}
	
});

NewUsersModalComponent = React.createFactory(NewUsersModalComponent);
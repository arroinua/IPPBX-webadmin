var CreateGroupModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			selectedUsers: []
		};
	},

	_onUsersSelected: function(users) {
		console.log('_onUsersSelected: ', users);
		this.setState({ selectedUsers: users });
	},

	_onSubmit: function() {
		console.log('_onSubmit');
	},

	_getBody: function() {
		var frases = this.props.frases;
		return (
			<AvailableUsersComponent frases={frases} onChange={this._onUsersSelected} />
		);
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				size="sm"
				title={ frases.CHAT_CHANNEL.AVAILABLE_USERS }
				submitText={frases.ADD} 
				cancelText={frases.CANCEL} 
				submit={this._onSubmit} 
				body={body}
			></ModalComponent>

		);
	}
	
});

CreateGroupModalComponent = React.createFactory(CreateGroupModalComponent);


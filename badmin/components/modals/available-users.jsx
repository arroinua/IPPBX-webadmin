var AvailableUsersModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		onSubmit: React.PropTypes.func,
		modalId: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			selectedUsers: []
		};
	},

	_saveChanges: function() {
		this.props.onSubmit(this.state.selectedUsers);
	},

	_onUsersSelected: function(users) {
		this.setState({ selectedUsers: users });
	},

	_getBody: function() {
		var frases = this.props.frases;
		return <AvailableUsersComponent frases={frases} onChange={this._onUsersSelected} groupid={this.props.groupid} />;
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				size="sm"
				type="success"
				title={ frases.CHAT_CHANNEL.AVAILABLE_USERS }
				submitText={frases.CHAT_CHANNEL.ADD_SELECTED} 
				cancelText={frases.CANCEL} 
				submit={this._saveChanges} 
				closeOnSubmit={true}
				body={body}
			>
			</ModalComponent>
		);
	}
	
});

AvailableUsersModalComponent = React.createFactory(AvailableUsersModalComponent);


var ImportUsersListModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		service: React.PropTypes.object,
		available: React.PropTypes.array,
		members: React.PropTypes.array,
		externalUsers: React.PropTypes.array,
		onSubmit: React.PropTypes.func,
		deleteAssociation: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			available: [],
			members: [],
			currentIndex: null,
			externalUsers: [],
			deAssociationList: []
		};
	},

	componentWillMount: function() {
		var available = this.props.available.sort().map(function(item, index){
		    return {
		        value: item,
		        label: item
		    };
		});

		var members = this.props.members.map(function(item) {
			return {
				value: item.number,
				label: (item.number + " - " + item.name)
			}
		});

		this.setState({ 
			externalUsers: [].concat(this.props.externalUsers),
			available: available,
			members: sortByKey(members, 'value')
		});
	},

	_saveChanges: function() {
		this.props.onSubmit({ externalUsers: this.state.externalUsers.filter(this._filterNew), deAssociationList: this.state.deAssociationList });
	},

	_onSelect: function(ext, index) {
		var externalUsers = [].concat(this.state.externalUsers);
		externalUsers[index].ext = ext;
		externalUsers[index].new = true;
		this.setState({ externalUsers: externalUsers });
		console.log('_onSelect externalUsers: ', externalUsers);
	},

	_onDeleteAssociation: function(index) {
		var externalUsers = [].concat(this.state.externalUsers);
		var externalUser = externalUsers[index];
		var user = this.props.members.filter(function(item) { return item.number === externalUser.ext })[0];
		var deAssociationList = [this.state.deAssociationList].concat([{ service_id: this.props.service.id, userid: user.userid }]);

		// this.props.deleteAssociation({ service_id: this.props.service.id, userid: user.userid }, function() {
			delete externalUser.ext;
			this.setState({ externalUsers: externalUsers });
		// }.bind(this));
	},

	_onDeselect: function(index) {
		var externalUsers = [].concat(this.state.externalUsers);
		delete externalUsers[index].ext;
		delete externalUsers[index].new;
		this.setState({ externalUsers: externalUsers });
		console.log('_onDeseelect externalUsers: ', externalUsers);	
	},

	_clearList: function() {
		this.setState({ currentIndex: null });
	},

	_setList: function(index, create) {
		var list = (create ? this.state.available : this.state.members);
		var external = this.state.externalUsers.reduce(function(array, next) { array.push(next.ext); return array }, []);

		list = list.filter(function(item) { return external.indexOf(item.value) === -1; });

		console.log('_setList: ', external, list, this.state.members);

		this.setState({ users: list, currentIndex: index });
	},

	_filterNew: function(item){
	    return item.hasOwnProperty('ext') && item.new;
	},

	_getBody: function() {
		return <ImportUsersListComponent 
			frases={this.props.frases} 
			usersList={this.state.users} 
			externalUsers={this.props.externalUsers} 
			hasMembers={this.state.members.length}
			onSelect={this._onSelect}
			onDeselect={this._onDeselect}
			onDeleteAssociation={this._onDeleteAssociation}
			setList={this._setList}
			clearList={this._clearList}
			currentIndex={this.state.currentIndex}
		/>
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();
		var selected = this.state.externalUsers.filter(this._filterNew);

		return (
			<ModalComponent 
				size="lg"
				type="success"
				disabled={!selected.length}
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

ImportUsersListModalComponent = React.createFactory(ImportUsersListModalComponent);


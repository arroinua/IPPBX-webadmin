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
				value: (item.number || item.ext),
				label: ((item.number || item.ext) + " - " + item.name)
			}
		});

		this.setState({ 
			externalUsers: [].concat(this.props.externalUsers),
			available: available,
			members: sortByKey(members, 'value')
		});
	},

	_saveChanges: function() {
		this.props.onSubmit({ selectedUsers: this.state.externalUsers.filter(this._filterNew), deAssociationList: this.state.deAssociationList });
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

		console.log('_onDeleteAssociation: ', externalUsers, externalUser, this.props.members);

		var user = this.props.members.filter(function(item) { return (item.number === externalUser.ext || item.ext === externalUser.ext) })[0];
		var deAssociationList = this.state.deAssociationList.concat([{ service_id: this.props.service.id, userid: user.userid }]);

		// this.props.deleteAssociation({ service_id: this.props.service.id, userid: user.userid }, function() {
			delete externalUser.ext;
			this.setState({ externalUsers: externalUsers, deAssociationList: deAssociationList });
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
		var user = this.props.externalUsers[index];
		var strict = (user.ext && !(user.services && user.services.length));
		var notAvailable = [];

		if(!create && strict) {
			list = list.filter(function(item) { return item.value === user.ext; });			
		} else {
			notAvailable = this.state.externalUsers.reduce(function(array, next) { array.push(next.ext); return array }, []);
			list = list.filter(function(item) { return notAvailable.indexOf(item.value) === -1; });
		}

		console.log('_setList: ', list, this.state.members);

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
			hasAvailable={this.state.available.length}
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
		var hasChanges = (this.state.externalUsers.filter(this._filterNew).length || this.state.deAssociationList.length);

		return (
			<ModalComponent 
				size="lg"
				type="success"
				disabled={!hasChanges}
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


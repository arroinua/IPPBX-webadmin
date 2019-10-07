var UsersRegHistoryComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			users: [],
			selectedUser: {},
			date: {},
			data: [],
			fetching: false,
			filterByIp: ""
		};
	},

	componentWillMount: function() {
		this._getUsers();

	},

	_getUsers: function() {
		var users = [];
		getExtensions(function(result) {
			users = filterObject(result, 'user')
			users = sortByKey(users, 'name');
			this.setState({ users: users });
		}.bind(this));
	},

	_getRegHistory: function() {
		var params = {
			userid: this.state.selectedUser.userid,
			begin: this.state.date.begin,
			end: this.state.date.end
		};

		this.setState({ fetching: true });

		json_rpc_async('getUserRegistrationsHistory', params, this._setRegHistory);
	},

	_setRegHistory: function(data) {
		var filterByIp = this.state.filterByIp;
		if(filterByIp) data = data.filter(function(item) { return item.iaddr === filterByIp; });
		this.setState({ data: data, fetching: false });
	},

	_onUserSelect: function(user) {
		this.setState({ selectedUser: user });
	},

	_onFilterSet: function(e) {
		this.setState({ filterByIp: e.target.value.trim() });
	},

	_onDateSelect: function(params) {
		this.setState({ date: params.date });
	},

	render: function() {

		return (
			<div>
				<UsersRegHistoryBarComponent 
					frases={this.props.frases} 
					users={this.state.users} 
					selectedUser={this.state.selectedUser} 
					onUserSelect={this._onUserSelect}
					onDateSelect={this._onDateSelect}
					onFilterSet={this._onFilterSet}
					filterByIp={this.state.filterByIp}
					getData={this._getRegHistory}
				/>
				<UsersRegHistoryMainComponent frases={this.props.frases} data={this.state.data} fetching={this.state.fetching} />
			</div>
		);
	}
});

UsersRegHistoryComponent = React.createFactory(UsersRegHistoryComponent);

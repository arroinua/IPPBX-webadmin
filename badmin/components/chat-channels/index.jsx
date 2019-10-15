 var ChatchannelComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		getInfoFromState: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	// getDefaultProps: function() {
	// 	return {
	// 		sub: {}
	// 	};
	// },

	getInitialState: function() {
		return {
			params: {},
			filteredMembers: []
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {},
			filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params,
			filteredMembers: props.params.members
		});
	},

	_setObject: function() {
		var params = this.state.params;
		this.props.setObject(params);
	},

	_onStateChange: function(state) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function(value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onFilter: function(items) {
		this.setState({
			filteredMembers: items
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];
		var itemState = {};

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled}
			    	onStateChange={this.props.onStateChange && this._onStateChange}
			    	onChange={this._onNameChange}
			    	onSubmit={this.props.setObject && this._setObject}
			    	onCancel={this.props.removeObject}
			    />
			    <GroupMembersComponent frases={frases} members={members} getExtension={this.props.getExtension} onAddMembers={this.props.onAddMembers} deleteMember={this.props.deleteMember} />
			</div>
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);

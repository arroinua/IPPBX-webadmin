 var ChatchannelComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		getAvailableUsers: React.PropTypes.func,
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
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params,
			removeObject: props.removeObject,
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
		console.log('_onFilter: ', items);
		this.setState({
			filteredMembers: items
		});
	},

	_getAvailableUsers: function() {
		this.props.getAvailableUsers();
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];
		var itemState = {};

		console.log('remder: ', params.name);

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled || false}
			    	onStateChange={this._onStateChange}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.state.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
					    <button type="button" role="button" className="btn btn-default padding-lg" onClick={this._getAvailableUsers}><i className="fa fa-user-plus"></i> {frases.CHAT_CHANNEL.ADD_MEMBERS}</button>
					    <FilterInputComponent items={members} onChange={this._onFilter} />
			    	</div>
			    </div>
			    <PanelComponent header={ filteredMembers.length + " " + frases.CHAT_CHANNEL.MEMBERS}>
				    <div className="table-responsive">
				        <table className="table table-hover sortable" id="group-extensions">
				            
				            <tbody>
				            	{
				            		members.length ?
				            		(filteredMembers.map(function(item) {

				            			itemState = this.props.getInfoFromState(item.state);
				            			console.log('itemState: ', itemState);

				            			return (

				            				<tr id={item.oid} className={ itemState.rclass } key={item.number || item.ext}>
				            					<td>
				            						<a href="" onClick={this.props.getExtension}>{item.number || item.ext}</a>
				            					</td>
				            					<td data-cell="name">{item.name}</td>
				            					<td data-cell="reg">{item.reg}</td>
				            					<td data-cell="status" style={{ "textAlign": "right" }}>{ itemState.rstatus }</td>
				            					<td style={{ "textAlign": "right" }}>
				            						<button className="btn btn-danger btn-sm" onClick={this.props.deleteMember.bind(this, item.oid)}><i className="fa fa-trash"></i></button>
				            					</td>
				            				</tr>

				            			)

				            		}.bind(this))) :
				            		(
				            			<tr>
				            				<td colSpan="3">{frases.CHAT_CHANNEL.NO_MEMBERS}. <a href="#" onClick={this._getAvailableUsers}>{frases.CHAT_CHANNEL.ADD_MEMBERS}</a></td>
				            			</tr>
				            		)
				            	}
				            </tbody>
				        </table>
				    </div>
				</PanelComponent>
			</div>
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);

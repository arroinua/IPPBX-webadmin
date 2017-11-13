 var GroupMembersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		getExtension: React.PropTypes.func,
		getAvailableUsers: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	componentWillMount: function() {
		this.setState({
			filteredMembers: this.props.members || []
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			filteredMembers: props.members || []
		});
	},

	_getInfoFromState: function(state, group){
	    var status, className;

	    if(state == 1) {
	        className = 'success';
	    } else if(state == 8) {
	        className = 'connected';
	    } else if(state == 2 || state == 5) {
	        className = 'warning';
	    } else if(state == 0 || (state == -1 && group)) {
	        // state = '';
	        className = 'default';
	    } else if(state == 3) {
	        className = 'danger';
	    } else if(state == 6 || state == 7) {
	        className = 'info';        
	    } else {
	        className = 'active';
	    }
	    status = PbxObject.frases.STATES[state] || '';

	    return {
	        rstatus: status,
	        rclass: 'bg-'+className,
	        className: className
	    }

	},

	_onFilter: function(items) {
		this.setState({
			filteredMembers: items
		});
	},

	render: function() {
		var frases = this.props.frases;
		var members = this.props.members;
		var filteredMembers = this.state.filteredMembers || [];
		var itemState = {};

		return (
			<PanelComponent header={ filteredMembers.length + " " + frases.CHAT_CHANNEL.MEMBERS}>
			    <div className="row">
			    	<div className="col-xs-12">
					    <button type="button" role="button" className="btn btn-default padding-lg" onClick={this.props.getAvailableUsers}><i className="fa fa-user-plus"></i> {frases.CHAT_CHANNEL.ADD_MEMBERS}</button>
					    <FilterInputComponent items={members} onChange={this._onFilter} />
			    	</div>
			    	<div className="col-xs-12">
					    <div className="table-responsive">
					        <table className="table table-hover sortable" id="group-extensions">
					            
					            <tbody>
					            	{
					            		filteredMembers.length ?
					            		(filteredMembers.map(function(item, index) {

					            			itemState = this._getInfoFromState(item.state);

					            			return <GroupMemberComponent key={index} item={item} itemState={itemState} getExtension={this.props.getExtension} deleteMember={this.props.deleteMember} />

					            		}.bind(this))) :
					            		(
					            			<tr>
					            				<td colSpan="5">{frases.CHAT_CHANNEL.NO_MEMBERS}</td>
					            			</tr>
					            		)
					            	}
					            </tbody>
					        </table>
					    </div>
					</div>
			    </div>
			</PanelComponent>
		);
	}
});

GroupMembersComponent = React.createFactory(GroupMembersComponent);

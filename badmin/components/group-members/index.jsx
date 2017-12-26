 var GroupMembersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		getExtension: React.PropTypes.func,
		getAvailableUsers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		onSort: React.PropTypes.func
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

	_tableRef: function(el) {
		console.log('_tableRef: ', el);
		if(this.props.sortable) return new Sortable(el);
	},

	_reorderMembers: function(members, order) {
		var newArray = [];
		newArray.length = members.length;
		
		members.forEach(function(item, index, array) {
			newArray[order.indexOf(item.oid)] = item;
			// newArray.splice(order.indexOf(item.oid), 0, newArray.splice(index, 1)[0]);
		});

		return newArray;
	},

	_onSortEnd: function(e) {
		var target = e.currentTarget;
		var order = [].slice.call(target.children).map(function(el, index) {
			el = el.id;
			return el;
		});

		this.props.onSort(this._reorderMembers(this.props.members, order));
	},

	render: function() {
		var frases = this.props.frases;
		var members = this.props.members;
		var filteredMembers = this.state.filteredMembers || [];

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
					            
					            <tbody ref={this._tableRef} onTouchEnd={this._onSortEnd} onDragEnd={this._onSortEnd}>
					            	{
					            		filteredMembers.length ? (

					            			filteredMembers.map(function(item, index) {

					            				return <GroupMemberComponent key={item.oid} sortable={this.props.sortable} item={item} itemState={this._getInfoFromState(item.state)} getExtension={this.props.getExtension} deleteMember={this.props.deleteMember} />

					            			}.bind(this))

					            		) : (
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

 var GroupMembersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		withGroups: React.PropTypes.bool,
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

	_getKindIcon: function(kind) {
		var icon = '';

		if(kind === 'user') icon = 'fa-user';
		else if(kind === 'phone') icon = 'fa-fax';
		else if(kind === 'chatchannel') icon = 'fa-comments-o';
		else if(kind === 'hunting') icon = 'icon-find_replace';
		else if(kind === 'icd') icon = 'icon-headset_mic';
		else if(kind === 'selector') icon = 'fa-line-chart';
		else if(kind === 'attendant') icon = 'icon-room_service';
		else if(kind === 'trunk') icon = 'fa-cloud';
		else if(kind === 'chattrunk') icon = 'fa-whatsapp';
		else if(kind === 'timer') icon = 'fa-calendar';
		else if(kind === 'routes') icon = 'fa-arrows';
		else if(kind === 'channel') icon = 'fa-rss';
		else if(kind === 'conference') icon = 'icon-call_split';
		else if(kind === 'pickup') icon = 'icon-phone_missed';
		else if(kind === 'cli') icon = 'icon-fingerprint';

		return icon;
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
			<div className="row">
		    	<div className="col-xs-12">
		    		{
		    			this.props.getAvailableUsers && (
				    		<button type="button" role="button" className="btn btn-default padding-lg" onClick={this.props.getAvailableUsers}><i className="fa fa-user-plus"></i> {frases.CHAT_CHANNEL.ADD_MEMBERS}</button>
		    			)
		    		}
				    <FilterInputComponent items={members} onChange={this._onFilter} />
		    	</div>
		    	<div className="col-xs-12">
					<div className="panel">
						<div className="panel-body" style={{ padding: "0" }}>
						    <div className="table-responsive">
						        <table className="table table-hover sortable" id="group-extensions" style={{ marginBottom: "0" }}>
						            
						            <tbody ref={this._tableRef} onTouchEnd={this._onSortEnd} onDragEnd={this._onSortEnd}>
						            	{
						            		filteredMembers.length ? (

						            			filteredMembers.map(function(item, index) {

						            				item.icon = this._getKindIcon(item.kind);

						            				return <GroupMemberComponent 
						            					key={item.oid} 
						            					sortable={this.props.sortable} 
						            					item={item} 
						            					withGroup={this.props.withGroups} 
						            					itemState={this._getInfoFromState(item.state)} 
						            					getExtension={this.props.getExtension} 
						            					deleteMember={this.props.deleteMember} 
						            				/>

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
				</div>
			</div>
		);
	}
});

GroupMembersComponent = React.createFactory(GroupMembersComponent);

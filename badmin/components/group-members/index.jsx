 var GroupMembersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		withGroups: React.PropTypes.bool,
		getExtension: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		activeServices: React.PropTypes.array,
		onImportUsers: React.PropTypes.func,
		onSort: React.PropTypes.func,
		addSteps: React.PropTypes.func
	},

	componentWillMount: function() {
		this.setState({
			filteredMembers: this.props.members || []
		});		
	},

	componentDidMount: function() {
		console.log('GroupMembersComponent componentDidMount');
		var frases = this.props.frases;

		if(this.props.addSteps) {
			this.props.addSteps([{
				element: '#new-users-btns .btn-primary',
				popover: {
					title: frases.GET_STARTED.CREATE_USERS.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CREATE_USERS.STEPS["1"].DESC,
					position: 'bottom',
					showButtons: false
				}
			}]);
		}
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

	_onImportFromService: function(params) {
		this.props.onImportUsers(params);
	},

	render: function() {
		var frases = this.props.frases;
		var members = this.props.members;
		var filteredMembers = sortByKey(this.state.filteredMembers, 'number') || [];

		// <FilterInputComponent items={members} onChange={this._onFilter} />

		return (
			<div className="row">
		    	<div className="col-xs-12" id="new-users-btns">
		    		{
		    			this.props.onAddMembers && (
				    		<button type="button" role="button" className="btn btn-primary" style={{ margin: "10px 5px" }} onClick={this.props.onAddMembers}><i className="fa fa-user-plus"></i> {frases.ADD_USER}</button>
		    			)
		    		}

		    		{
		    			(this.props.activeServices && this.props.activeServices.length) ? (
		    				<ImportUsersButtonsComponent frases={frases} services={this.props.activeServices} onClick={this._onImportFromService} />
		    			) : null
		    		}
		    	</div>
		    	<div className="col-xs-12">
					<div className="panel">
						<div className="panel-body" style={{ padding: "0" }}>
						    <div className="table-responsive">
						        <table className={"table table-hover" + ((filteredMembers.length && this.props.sortable) ? "sortable" : "")} id="group-extensions" style={{ marginBottom: "0" }}>
						            
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

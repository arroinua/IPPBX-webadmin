 var GroupMembersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		kind: React.PropTypes.string,
		withGroups: React.PropTypes.bool,
		getExtension: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		doSort: React.PropTypes.bool,
		activeServices: React.PropTypes.array,
		onImportUsers: React.PropTypes.func,
		onSort: React.PropTypes.func
		// addSteps: React.PropTypes.func
	},

	componentWillMount: function() {
		this.setState({
			filteredMembers: this.props.members ? [].concat(this.props.members) : []
		});		
	},

	// componentDidMount: function() {
	// 	var frases = this.props.frases;

	// 	if(this.props.addSteps) {
	// 		this.props.addSteps([{
	// 			element: '#new-users-btns .btn-primary',
	// 			popover: {
	// 				title: frases.GET_STARTED.CREATE_USERS.STEPS["1"].TITLE,
	// 				description: frases.GET_STARTED.CREATE_USERS.STEPS["1"].DESC,
	// 				position: 'bottom',
	// 				showButtons: false
	// 			}
	// 		}]);
	// 	}
	// },

	componentWillReceiveProps: function(props) {
		this.setState({
			filteredMembers: props.members ? [].concat(props.members) : []
		});
	},

	_getInfoFromState: function(state, group){
	    var status, className;

	    if(state == 1) { // Idle
	        // className = 'success';
	        className = 'info';
	    } else if(state == 8) { // Connected
	        // className = 'connected';
	        className = 'danger';
	    } else if(state == 2 || state == 5) { // Away
	        className = 'warning';
	    } else if(state == 0 || (state == -1 && group)) { // Offline
	        // state = '';
	        className = 'default';
	    } else if(state == 3) { // DND
	        className = 'danger';
	    } else if(state == 6 || state == 7) { // Calling
	        className = 'danger';        
	    } else { // 
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

		if(kind === 'user') icon = 'icon-contact';
		else if(kind === 'phone') icon = 'icon-landline';
		else if(kind === 'chatchannel') icon = 'icon-headset_mic';
		else if(kind === 'hunting') icon = 'icon-headset_mic';
		else if(kind === 'icd') icon = 'icon-headset_mic';
		else if(kind === 'selector') icon = 'icon-headset_mic';
		else if(kind === 'attendant') icon = 'fa fa-fw fa-sitemap';
		else if(kind === 'trunk') icon = 'icon-dialer_sip';
		else if(kind === 'chattrunk') icon = 'icon-perm_phone_msg';
		else if(kind === 'timer') icon = 'fa fa-fw fa-clock-o';
		else if(kind === 'routes') icon = 'fa-arrows';
		else if(kind === 'channel') icon = 'fa-rss';
		else if(kind === 'conference') icon = 'icon-call_split';
		else if(kind === 'pickup') icon = 'icon-phone_missed';
		else if(kind === 'cli') icon = 'icon-fingerprint';

		return icon;
	},

	_onFilter: function(items) {
		this.setState({
			filteredMembers: [].concat(items)
		});
	},

	_tableRef: function(el) {
		if(this.props.sortable) return new Sortable(el);
	},

	_reorderMembers: function(members, order) {
		var newArray = [];
		newArray.length = members.length;
		
		members.forEach(function(item, index, array) {
			newArray[order.indexOf(item.oid)] = window.extend({}, item);
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
		var filteredMembers = this.props.doSort ? sortByKey(this.state.filteredMembers, 'number') : this.state.filteredMembers;

		return (
			<div>
				<div className="row">
			    	<div className="col-sm-6" id="new-users-btns">
			    		{
			    			this.props.onAddMembers && (
					    		<button type="button" role="button" className="btn btn-primary" style={{ margin: "0 10px 10px 0" }} onClick={this.props.onAddMembers}><i className="fa fa-user-plus"></i> {this.props.kind === 'users' ? frases.CREATE_NEW_USER : frases.ADD_USER}</button>
			    			)
			    		}

			    		{
			    			(this.props.activeServices && this.props.activeServices.length) ? (
			    				<ImportUsersButtonsComponent frases={frases} services={this.props.activeServices} onClick={this._onImportFromService} />
			    			) : null
			    		}
			    	</div>
			    	{
			    		this.props.doSort ? (
			    			<div className="col-sm-6">
								<FilterInputComponent items={members} onChange={this._onFilter} />
					    	</div>
			    		) : null
			    	}
			    </div>
			    <div className="row">
			    	<div className="col-xs-12">
						<div className="panel">
							<div className="panel-body" style={{ padding: "0" }}>
							    <div className="table-responsive">
							        <table className={"table table-hover" + ((filteredMembers.length && this.props.sortable) ? "" : "")} id="group-extensions" style={{ marginBottom: "0" }}>
							            
							            <tbody ref={this._tableRef} onTouchEnd={this._onSortEnd} onDragEnd={this._onSortEnd}>
							            	{
							            		filteredMembers.length ? (

							            			filteredMembers.map(function(item, index) {

							            				return <GroupMemberComponent 
							            					key={item.oid} 
							            					sortable={this.props.sortable} 
							            					item={item} 
							            					icon={this._getKindIcon(item.kind)}
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
			</div>
		);
	}
});

GroupMembersComponent = React.createFactory(GroupMembersComponent);

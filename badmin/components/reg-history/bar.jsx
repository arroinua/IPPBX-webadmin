var UsersRegHistoryBarComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		users: React.PropTypes.array,
		selectedUser: React.PropTypes.object,
		onUserSelect: React.PropTypes.func,
		onDateSelect: React.PropTypes.func,
		onFilterSet: React.PropTypes.func,
		filterByIp: React.PropTypes.string,
		getData: React.PropTypes.func
	},

	_onUserSelect: function(option) {
		var user = this.props.users.filter(function(item) { return item.userid === option.value });
		this.props.onUserSelect(user[0] || {});
	},

	render: function() {
		var users = this.props.users.map(function(item) {
			item.value = item.userid;
			item.label = (item.ext ? (item.ext + ' - ') : '') + item.name + (item.info && item.info.email ? (" (" + item.info.email + ")"  ) : "");
			return item;
		});

		return (
			<PanelComponent>
				<form className="form-inline">
					<div className="row">
						<div className="col-sm-3">
						    <Select3 placeholder={this.props.frases.REG_HISTORY.SELECT_USER_PLACEHOLDER} inputStyles={{ width: "100%" }} value={this.props.selectedUser} options={users} onChange={this._onUserSelect} />
						    <br/>
						</div>
					    <div className="col-sm-3">
				    		<input type="text" placeholder={this.props.frases.REG_HISTORY.IP_FILTER_PLACEHOLDER} style={{width: "100%"}} className="form-control" value={this.props.filterByIp} onChange={this.props.onFilterSet}  />
				    		<br/>
				    	</div>
				    	<div className="col-sm-3">
					    	<DatePickerComponent frases={this.props.frases} onClick={this.props.onDateSelect} actionButton={false} />
					    	<br/>
					    </div>
					    <div className="col-sm-3">
					    	<button type="button" className="btn btn-block btn-primary" onClick={this.props.getData}>{this.props.frases.REG_HISTORY.SEARCH_BTN}</button>
					    </div>
					</div>
				</form>
			</PanelComponent>
		);
	}
});

UsersRegHistoryBarComponent = React.createFactory(UsersRegHistoryBarComponent);

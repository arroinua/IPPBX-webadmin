var AvailableUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		// data: React.PropTypes.array,
		onChange: React.PropTypes.func
		// modalId: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			data: [],
			init: false
		};
	},

	componentWillMount: function() {
		var params = this.props.groupid ? { groupid: this.props.groupid } : null;
		this._getAvailableUsers(params, function(result) {
			var data = result.length ? this._sortItems(result, 'ext') : result;
			this.setState({ data: data, init: true });
		}.bind(this));
	},

	componentWillReceiveProps: function(props) {
		if(props.groupid !== this.props.groupid) {
			var params = props.groupid ? { groupid: props.groupid } : null;

			this.setState({ init: false });

			this._getAvailableUsers(params, function(result) {
				var data = result.length ? this._sortItems(result, 'ext') : result;
				this.setState({ data: data, init: true });
			}.bind(this));
		}
			
	},

	_getAvailableUsers: function(params, callback) {
	    json_rpc_async('getAvailableUsers', params || null, function(result){
			console.log('getAvailableUsers: ', result);
			callback(result);
		}.bind(this));
	},

	_sortItems: function(array, sortBy) {
		return array.sort(function(a, b) {
			return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
		});

	},

	_saveChanges: function() {
		var selectedMembers = this.state.data.filter(function(item) { return item.selected; });

		this.props.onChange(selectedMembers);
		// this.props.onSubmit(selectedMembers);
	},

	_selectMember: function(item) {
		var data = this.state.data;
		data[item].selected = !data[item].selected;
		this.setState({ data: data });

		this._saveChanges();
	},

	_selectAllMembers: function(e) {
		e.preventDefault();
		var data = this.state.data;
		data.map(function(item) {
			item.selected = !item.selected;
			return item;
		});
		this.setState({ data: data });

		this._saveChanges();
	},

	_filterItems: function(e) {
		// var value = e.target.value;
		// var data = this.state.data;

		// data = data.filter(function(item) {
		// 	if(item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
		// 		return item;
		// 	}
		// });

		// this.setState({
		// 	data: data
		// });
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div className="row">
				<div className="col-xs-12">
					{
						this.state.init ? (
							<ul style={{ minHeight: "200px", maxHeight: "400px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 }}>
								<li><input className="form-control" onChange={this._filterItems} placeholder={frases.SEARCH} autoFocus={true} /></li>
								<li>
									<a href="#" style={{ display: "block", padding: "8px 10px" }} onClick={this._selectAllMembers}>{ frases.CHAT_CHANNEL.SELECT_ALL }</a>
								</li>
								{
									this.state.data.map(function(item, index) {
										return (
											<li key={item.ext} style={{ padding: "8px 10px", color: "#333", cursor: "pointer", background: (item.selected ? '#c2f0ff' : 'none') }} onClick={this._selectMember.bind(this, index)}>
												<span>{ item.ext }</span>
												<span> - </span>
												<span>{ item.name }</span>
											</li>

										)

									}.bind(this))
								}						
							</ul>
						) : (
							<Spinner />
						)
					}
							
				</div>
			</div>
		);
	}
	
});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);

var AvailableUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		availableList: React.PropTypes.array,
		excludeList: React.PropTypes.array,
		// data: React.PropTypes.array,
		onChange: React.PropTypes.func
		// modalId: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			data: [],
			filteredData: [],
			init: false
		};
	},

	componentWillMount: function() {
		var data = [];
		var params = null;

		if(this.props.availableList) {
			data = this.props.excludeList ? this._exclude(this.props.availableList, this.props.excludeList) : this.props.availableList;
			return this.setState({ data: data, filteredData: data, init: true });
		}

		params = this.props.groupid ? { groupid: this.props.groupid } : null;
		this._getAvailableUsers(params, function(result) {
			data = this._exclude(result, this.props.excludeList);
			data = this._sortItems(data, 'ext');
			
			this.setState({ data: data, filteredData: data, init: true });
		}.bind(this));
	},

	componentWillReceiveProps: function(props) {
		if(props.groupid !== this.props.groupid) {
			var params = props.groupid ? { groupid: props.groupid } : null;

			this.setState({ init: false });

			this._getAvailableUsers(params, function(result) {
				var data = this._exclude(result, props.excludeList);
				data = this._sortItems(result, 'ext');
				this.setState({ data: data, filteredData: data, init: true });
			}.bind(this));
		}
			
	},

	_getAvailableUsers: function(params, callback) {
	    json_rpc_async('getAvailableUsers', params || null, function(result){
			callback(result);
		}.bind(this));
	},

	_sortItems: function(array, sortBy) {
		if(!array.length) return array;
		return array.sort(function(a, b) {
			return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
		});

	},

	_exclude: function(array, excludeList) {
		if(!excludeList || !excludeList.length) return array;
		var elist = excludeList.reduce(function(array, item) { array = array.concat([item.ext]); return array }, []);
		return array.filter(function(item) { return elist.indexOf(item.ext) === -1 });
	},

	_saveChanges: function() {
		var selectedMembers = this.state.filteredData.filter(function(item) { return item.selected; });

		this.props.onChange(selectedMembers);
		// this.props.onSubmit(selectedMembers);
	},

	_selectMember: function(index) {
		var data = [].concat(this.state.filteredData);
		var item = extend({}, data[index]);
		item.selected = !item.selected;
		data[index] = item;
		this.setState({ data: data, filteredData: data });

		this._saveChanges();
	},

	_selectAllMembers: function(e) {
		e.preventDefault();
		var data = this.state.filteredData.map(function(item) {
			item.selected = !item.selected;
			return item;
		});
		this.setState({ data: data, filteredData: data });

		this._saveChanges();
	},

	_filterItems: function(e) {
		var value = e.target.value;
		var filteredData = [];

		if(!value) {
			filteredData = [].concat(this.state.data);
		} else {
			filteredData = this.state.filter(function(item) {
				if(item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
					return item;
				}
			});
		}
			
		this.setState({
			filteredData: filteredData
		});
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
									this.state.filteredData.map(function(item, index) {
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


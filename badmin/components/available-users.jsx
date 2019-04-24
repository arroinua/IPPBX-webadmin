var AvailableUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		kind: React.PropTypes.string,
		availableList: React.PropTypes.array,
		excludeList: React.PropTypes.array,
		selected: React.PropTypes.array,
		groupid: React.PropTypes.string,
		onChange: React.PropTypes.func,
		styles: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			data: [],
			filteredData: [],
			selected: [],
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
				var data = result.length ? this._sortItems(result, 'ext') : result;
				this.setState({ data: data, init: true });
				this._selectMembers(props.selected || []);
			}.bind(this));
		}
			
	},

	_getAvailableUsers: function(params, callback) {
		var usersOnly = this.props.kind === 'chatchannel';
		var users = [];
	    json_rpc_async((usersOnly ? 'getExtensions' : 'getAvailableUsers'), params, function(result){
	    	users = usersOnly ? result.filter(function(item) { return item.kind === 'user' }) : result;
			callback(users);
		}.bind(this));
	},

	_sortItems: function(array, sortBy) {
		return array.sort(function(a, b) {
			return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
		});

	},

	_exclude: function(array, excludeList) {
		if(!excludeList || !excludeList.length) return array;
		var elist = excludeList.reduce(function(array, item) { array = array.concat([item.ext]); return array }, []);
		return array.filter(function(item) { return elist.indexOf(item.ext) === -1 });
	},

	_saveChanges: function(selected) {
		// var selected = this.state.selected;
		// var selectedMembers = this.state.filteredData
		// .filter(function(item) { return selected.indexOf(item.ext) > -1; });

		this.props.onChange(selected);
		// this.props.onSubmit(selectedMembers);
	},

	_selectMembers: function(selected) {
		// var list = selected.reduce(function(array, item) { array.push(item.ext || item.number); return array; }, []);
		// items = items.map(function(item) { if(list.indexOf(item.ext) !== -1) item.selected = true; return item; });
		var items = selected.map(function(item) { if(!item.ext) item.ext = item.number; return { ext: item.ext, name: item.name, oid: item.oid } });
		this.setState({ selected: items });

	},

	_selectMember: function(index) {
		var members = [].concat(this.state.filteredData);
		var selected = [].concat(this.state.selected);
		var item = members[index];
		// var indexOf = selected.indexOf(item.ext);

		selected = sortByKey(selected.concat([item]), 'ext');

		this.setState({ selected: selected });

		this._saveChanges(selected);
	},

	_deSelectMember: function(id) {
		var selected = [].concat(this.state.selected);

		selected = selected.filter(function(item) { return item.ext !== id; })

		this.setState({ selected: selected });

		this._saveChanges(selected);
	},

	_selectAllMembers: function(e) {
		e.preventDefault();
		// var data = this.state.filteredData;
		// var selected = data.filter(function(item) { return item.selected; });
		// var allSelected = selected.length === data.length;

		// data = data.map(function(item) {
		// 	item.selected = !allSelected;
		// 	return item;
		// });

		// this.setState({ data: data });

		var selected = this.state.selected;
		var allSelected = selected.length === this.state.data.length;

		this._selectMembers(allSelected ? [] : this.state.data);

		this._saveChanges(selected);
	},

	_reduceByKey: function(array, key) {
		return array.reduce(function(result, item) { result = result.concat(item[key]); return result; }, []);
	},

	_filterItems: function(e) {
		var value = e.target.value;
		var data = [].concat(this.state.data);
		var filteredData = [];

		if(!value) {
			filteredData = data;
		} else {
			filteredData = data.filter(function(item) {
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
		var styles = { maxHeight: "300px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 };
		var selected = this._reduceByKey(this.state.selected, 'ext');

		if(this.props.styles) {
			styles = extend(styles, this.props.styles);
		}

		// <p><a href="#" style={{ display: "block", padding: "8px 10px" }} onClick={this._selectAllMembers}>{ frases.CHAT_CHANNEL.SELECT_ALL }</a></p>
		return (
			<div style={{ margin: "20px 0" }}>
				<input className="form-control" onChange={this._filterItems} placeholder={frases.SEARCH} autoFocus={true} />
				{
					this.state.init ? (
						<ul style={styles}>
							{
								this.state.filteredData.map(function(item, index) {
									
									return (
										<li 
											key={item.ext} 
											style={{ padding: "8px 10px", margin: "5px", borderRadius: "20px", color: "#333", background: (selected.indexOf(item.ext) !== -1 ? "#eee" : "transparent"), cursor: "pointer" }} 
											onClick={selected.indexOf(item.ext) !== -1 ? this._deSelectMember.bind(this, item.ext) : this._selectMember.bind(this, index)}
										>
											<span>{ item.ext } - { item.name }</span>
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
		);
	}
	
});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);


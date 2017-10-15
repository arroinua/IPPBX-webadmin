var AvailableUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		onSubmit: React.PropTypes.func,
		modalId: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			data: []
		};
	},

	componentDidMount: function() {
		this.setState({ data: this.props.data || [] });
	},

	componentWillReceiveProps: function(props) {
		this.setState({ data: props.data || [] });	
	},

	_saveChanges: function() {
		var selectedMembers = this.state.data.filter(function(item) { return item.selected; });

		this.props.onSubmit(selectedMembers);
	},

	_selectMember: function(item) {
		var data = this.state.data;
		data[item].selected = !data[item].selected;
		this.setState({ data: data });
	},

	_selectAllMembers: function(e) {
		e.preventDefault();
		var data = this.state.data;
		data.map(function(item) {
			item.selected = !item.selected;
			return item;
		});
		this.setState({ data: data });
	},

	_filterItems: function(e) {
		var value = e.target.value;
		var data = this.props.data;

		data = data.filter(function(item) {
			if(item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
				return item;
			}
		});

		this.setState({
			data: data
		});
	},

	_getModalBody: function() {
		var frases = this.props.frases;

		return (
			<div className="row">
				<div className="col-xs-12">
					<ul style={{ minHeight: "200px", maxHeight: "400px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 }}>
						<li><input className="form-control" onChange={this._filterItems} placeholder={frases.SEARCH} autoFocus={true} /></li>
						<li>
							<a href="#" style={{ display: "block", padding: "8px 10px" }} onClick={this._selectAllMembers}>{ frases.CHAT_CHANNEL.SELECT_ALL }</a>
						</li>
						{
							this.state.data.map(function(item, index) {
								console.log('_getModalBody: ', item);

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
				</div>
			</div>
		);
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getModalBody();

		return (
			<ModalComponent 
				id={this.props.modalId} 
				size="sm"
				title={ frases.CHAT_CHANNEL.AVAILABLE_USERS }
				submitText={frases.ADD} 
				cancelText={frases.CANCEL} 
				submit={this._saveChanges} 
				body={body}
			></ModalComponent>
		);
	}
	
});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);


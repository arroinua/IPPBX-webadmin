var CustomersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.array,
		importServices: React.PropTypes.array,
		openCustomerInfo: React.PropTypes.func,
		import: React.PropTypes.func
	},

	componentWillMount: function() {
		this.setState({
			filteredMembers: this.props.params || []
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			filteredMembers: props.params || []
		});		
	},

	_onFilter: function(items) {
		this.setState({
			filteredMembers: items
		});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var customers = this.state.filteredMembers;
	
		return (
			<PanelComponent>
				<div className="row">
					<div className="col-xs-12">
						<FilterInputComponent frases={frases} items={params} onChange={this._onFilter} />
						{
							(this.props.import && this.props.importServices && this.props.importServices.length) ? (
			    				<ImportUsersButtonsComponent frases={frases} services={this.props.importServices} onClick={this.props.import} />
			    			) : null
						}
					</div>
				</div>
				<div className="table-responsive">
					<CustomersListComponent frases={frases} list={customers} openCustomerInfo={this.props.openCustomerInfo} />
				</div>
			</PanelComponent>
		)
	}
});

CustomersComponent = React.createFactory(CustomersComponent);

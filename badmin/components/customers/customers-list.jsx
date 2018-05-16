var CustomersListComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		list: React.PropTypes.array,
		openCustomerInfo: React.PropTypes.func
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<table className="table">
				<thead>
					<tr>
						<th>{frases.CUSTOMERS.CUSTOMER}</th>
						<th>{frases.CUSTOMERS.FIELDS.created}</th>
						<th>{frases.CUSTOMERS.FIELDS.createdby}</th>
						<th>{frases.CUSTOMERS.FIELDS.consent}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{
						this.props.list.map(function(item, index) {
							return <CustomerItemComponent key={item.id} frases={this.props.frases} item={item} onClick={this.props.openCustomerInfo} />
						}.bind(this))
					}
				</tbody>
			</table>
		)
	}
});

CustomersListComponent = React.createFactory(CustomersListComponent);

var InvoicesComponent = React.createClass({

	propTypes: {
		items: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			items: [],
			hideRows: true
		};
	},

	componentDidMount: function() {
		this.setState({
			items: this.props.items
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			items: props.items
		});
	},

	_showMore: function() {
		this.setState({
			hideRows: !this.state.hideRows
		});
	},

	render: function() {
		var items = this.state.items;
		var frases = this.props.frases;
		var hideRows = this.state.hideRows;

		console.log('InvoicesComponent: ', this.state.items);

		return (
			<div>
				{
					!this.state.items.length ? (
						<p>{ frases.BILLING.INVOICES.NO_INVOICES }</p>
					) : (

						<div className="row">
							<div className="col-xs-12">
								<table className="table">
									<tbody>
										{
											this.state.items.map(function(item, index) {
												if(hideRows && index > 2) {
													return null;
												}
												
												return <InvoiceComponent invoice={item} key={index} />
													
											})
										}
									</tbody>
								</table>
								<button 
									type="button" 
									className="btn btn-link btn-block" 
									onClick={this._showMore}
								>{ hideRows ? 'Show more' : 'Show less' }</button>
							</div>
						</div>

					)
				}
			</div>
		);
	}
});

InvoicesComponent = React.createFactory(InvoicesComponent);
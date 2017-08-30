 var NewTrunkComponent = React.createClass({

	propTypes: {
		trunks: React.PropTypes.array
	},

	render: function() {
		return (
			<div className="row">
				{
					this.props.trunks.map(function(item) {

						return (

							<div className="col-xs-12 col-sm-4" key={item.type}>
								<TrunkTypeItemComponent params={item} />
							</div>

						)

					})
				}
			</div>
		);
	}
});

NewTrunkComponent = React.createFactory(NewTrunkComponent);

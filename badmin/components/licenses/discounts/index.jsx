
var DiscountsComponent = React.createClass({

	propTypes: {
		items: React.PropTypes.array,
		frases: React.PropTypes.object,
		addCoupon: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			items: [],
			coupon: ''
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

	_addCoupon: function() {
		var coupon = this.state.coupon;
		if(!coupon) return;
		this.props.addCoupon(coupon);
	},

	_handleOnChange: function(e) {
		var value = e.target.value;
		this.setState({
			coupon: value
		});
	},

	render: function() {
		var frases = this.props.frases;

		console.log('DiscountsComponent: ', this.state.items);

		return (
			<div className="row">
				<div className="col-xs-12">

					<div className="input-group">
						<input type="text" className="form-control" placeholder="Promo code" value={this.state.coupon} onChange={this._handleOnChange} />
						<span className="input-group-btn">
							<button type="button" className="btn btn-success" onClick={this._addCoupon}>{ frases.BILLING.DISCOUNTS.ACTIVATE_BTN }</button>
						</span>
					</div>
					<br/>
					<h5 className={ this.state.items.length ? '' : 'hidden' }>{ frases.BILLING.DISCOUNTS.ACTIVE_DISCOUNTS }</h5>
					{
						this.state.items.map(function(item) {
							return (

								<h3 key={item._id}><b>{ item.name }</b> <small>{ item.coupon.description }</small></h3>

							);
						})
					}

				</div>
			</div>
		);
	}
});

DiscountsComponent = React.createFactory(DiscountsComponent);
var NewPaymentMethodComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		paymentMethod: React.PropTypes.object
	},

	_onRef: function(el) {
		console.log('_onRef', el);
		if(el) {
			var style = {
				base: {
					height: "34px",
					padding: "6px 12px",
					fontSize: "14px",
					color: "#555",
					fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
					border: '1px solid #dfe4ed',
					borderRadius: '4px'
				}
			};
			var card = PbxObject.stripeElements.create('card', {style: style});
			card.mount(el);
			card.addEventListener('change', function(event) {
			  if(event.error) {
			    console.log('stripe error: ', event.error);
			  } else {
			    console.log('stripe success');
			  }
			});
		}
	},

	_submitForm: function(e) {
		e.preventDefault();
	},

	render: function() {
		var paymentMethod = this.props.paymentMethod;
		var profile = this.props.profile;
		var frases = this.props.frases;

		return (
			<div className="row">
				<div className="col-xs-12">
					<form className="form-horizontal" onSubmit={this._submitForm}>
						<section>
							<h4>Billing information</h4>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="name-element">Name</label>
							    <div className="col-sm-6">
								    <input className="form-control" name="name" />
							    </div>
							</div>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="email-element">Email</label>
							    <div className="col-sm-6">
							    	<input type="email" className="form-control" name="email" />
							    </div>
							</div>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="address-element">Address</label>
							    <div className="col-sm-6">
							    	<input className="form-control" name="address" />
							    </div>
							</div>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="city-element">City</label>
							    <div className="col-sm-6">
							    	<input className="form-control" name="city" />
							    </div>
							</div>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="postal-element">Postal code</label>
							    <div className="col-sm-6">
							    	<input className="form-control" name="postal" />
							    </div>
							</div>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="country-element">Country</label>
							    <div className="col-sm-6">
							    	<select className="form-control" name="country"></select>
							    </div>
							</div>
						</section>
						<section>
							<h4>Payment information</h4>
							<div className="form-group">
							    <label className="col-sm-4 control-label" htmlFor="card-element">Credit or debit card</label>
							    <div className="col-sm-6" id="card-element" ref={this._onRef}></div>
							</div>	
						</section>
						<div className="col-xs-12 text-center">
							<button type="submit" className="btn btn-lg btn-primary">Pay now</button>
						</div>
					</form>
				</div>
				<div className="col-xs-12">
					<div id="card-errors" role="alert"></div>
				</div>
			</div>
		)
	}
})

NewPaymentMethodComponent = React.createFactory(NewPaymentMethodComponent);

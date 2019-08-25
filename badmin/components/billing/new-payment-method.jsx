var NewPaymentComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		payment: React.PropTypes.object,
		profile: React.PropTypes.object,
		renderCardElement: React.PropTypes.func,
		onCallback: React.PropTypes.func,
		getCountries: React.PropTypes.func,
		onClose: React.PropTypes.func,
		onSubmit: React.PropTypes.func
	},

	componentWillMount: function() {
		var details = {
			name: this.props.profile.name,
			email: this.props.profile.email
		};
		var canSubmit = details.name && details.email;

		this.setState({
			details: details,
			address: {},
			modalOpened: true,
			canSubmit: canSubmit,
			errors: [],
			countries: []
		});

		// this._init();
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			modalOpened: true
		});
	},

	// _init: function() {
		// this.props.getCountries(function(err, result) {
		// 	this.setState({ countries: result })
		// }.bind(this))
	// },

	_onModalClosed: function() {
		this.setState({ modalOpened: false })
		this.props.onClose();
	},

	_onChange: function(e) {
		var target = e.target;
		var address = null;
		var details = null;
		var canSubmit = this.state.canSubmit;
		
		if(target.name === 'name' || target.name === 'email') {
			details = extend({}, this.state.details);
			details[target.name] = target.value;
		} else {
			address = extend({}, this.state.address);
			address[target.name] = target.value;
		}

		canSubmit = address ? (address.line1 && address.city && address.postal_code && address.country) : (details.name && details.email);
		this.setState({ address: address, details: details, canSubmit: canSubmit });
	},

	_onRef: function(el) {
		if(el) {
			var card = this.props.renderCardElement(el);
			card.addEventListener('change', function(event) {
			  if(event.error) {
			    this.setState({ errors: [event.error] });
			  } else {
			    this.setState({ errors: [] });
			  }
			}.bind(this));
		}
	},

	_currencyNameToSymbol: function(name) {
		var symbol = "";

		switch(name) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	},

	_submitForm: function(e) {
		e.preventDefault();
		this.setState({ canSubmit: false });
		this.props.onSubmit({ address: this.state.address, details: this.state.details, payment: this.props.payment }, function(err, result) {
			if(err) return this.setState({ errors: [err], canSubmit: true });
			this.setState({ modalOpened: false });
			this.props.onCallback(null, result);
		}.bind(this));
	},

	// <div className="form-group">
	//     <label htmlFor="line1">Address</label>
	//     <input className="form-control" name="line1" placeholder={"Calls road, 1"} required />
	// </div>
	// <div className="row form-group">
	//     <div className="col-sm-8">
	//     	<label htmlFor="city">City</label>
	//     	<input className="form-control" name="city" placeholder={"Callsville"} required />
	//     </div>
	//     <div className="col-sm-4">
	//     	<label htmlFor="postal_code">ZIP</label>
	//     	<input className="form-control" name="postal_code" placeholder={"12345"} required />
	//     </div>
	// </div>
	// <div className="form-group">
	//     <label htmlFor="country">Country</label>
	//     <select className="form-control" name="country" required>
	//     	<option>Select country</option>
	//     	{
	//     		this.state.countries.map(function(item) {
	//     			return (
	//     				<option key={item.alpha2Code} value={item.alpha2Code}>{item.name}</option>
	//     			)
	//     		})
	//     	}
	//     </select>
	// </div>

	_getBody: function() {

		var frases = this.props.frases;

		return (
			<div className="row">
				<div className="col-xs-12">
					<form onSubmit={this._submitForm} onChange={this._onChange}>
						<fieldset style={{ marginBottom: "10px" }}>
							<div className="form-group">
							    <label htmlFor="email">{frases.CHECKOUT.FORM_LABELS.EMAIL}</label>
							    <input className="form-control" name="email" placeholder={frases.CHECKOUT.PLACEHOLDERS.EMAIL} value={this.state.details.email} required />
							</div>
							<div className="form-group">
							    <label htmlFor="name">{frases.CHECKOUT.FORM_LABELS.NAME}</label>
							    <input className="form-control" name="name" placeholder={frases.CHECKOUT.PLACEHOLDERS.NAME} value={this.state.details.name} required />
							</div>
						</fieldset>
						<hr/>
						<fieldset>
							<div className="form-group">
							    <label htmlFor="card-element">{frases.CHECKOUT.FORM_LABELS.CARD}</label>
							    <div 
							    	id="card-element" 
							    	ref={this._onRef}
							    	style={{
							    		padding: "9px 12px",
							    		border: "1px solid #ddd",
							    		borderRadius: "4px"
							    	}}
							    ></div>
							</div>
							{
								this.state.errors.length ? (
									<div className="form-group">
										<div id="card-errors" className="alert alert-danger" role="alert">
											{
												this.state.errors.map(function(item) {
													return (
														<p key={item.code}>{ frases.CHECKOUT.ERROR[item.code] || frases.CHECKOUT.ERROR['generic_decline'] }</p>
													)
												})
											}
										</div>
									</div>
								) : null
							}
						</fieldset>
						<div className="form-group text-center">
							<button disabled={!this.state.canSubmit} type="submit" className="btn btn-lg btn-primary">{this.props.payment ? (frases.CHECKOUT.PAY_BTN+" "+this._currencyNameToSymbol(this.props.payment.currency)+this.props.payment.amount) : frases.CHECKOUT.ADD_METHOD_BTN}</button>
						</div>
						{
							!this.props.payment ? (
								<p className="text-center">{frases.CHECKOUT.ADD_METHOD_NOTICE}</p>
							) : null
						}
					</form>
				</div>
			</div>
		)
	},

	render: function() {
		var paymentMethod = this.props.paymentMethod;
		var profile = this.props.profile;
		var frases = this.props.frases;

		return (
			<ModalComponent size="sm" title={this.props.payment ? frases.CHECKOUT.NEW_PAYMENT : frases.CHECKOUT.NEW_PAYMENT_METHOD_TITLE} open={this.state.modalOpened} body={this._getBody()} onClose={this._onModalClosed} onSubmit={this.props.onSubmit}></ModalComponent>
		)
	}
})

NewPaymentComponent = React.createFactory(NewPaymentComponent);

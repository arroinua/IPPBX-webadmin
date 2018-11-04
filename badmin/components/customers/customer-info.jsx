var CustomerInfoComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		getPrivacyPrefs: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			prefsOpen: false,
			privacyPrefs: null
		};
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			prefsOpen: false,
			privacyPrefs: null
		});
	},

	_getPrivacyPrefs: function() {
		var state = this.state;
		if(state.prefsOpen) {
			this.setState({ prefsOpen: false });
			return;
		}
		
		if(!state.privacyPrefs) {
			this.props.getPrivacyPrefs(this.props.params.id, function(result) {
				this.setState({
					prefsOpen: true,
					privacyPrefs: result
				});
			}.bind(this));
		} else {
			this.setState({ prefsOpen: true });
		}
			
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var cname = params.name ? params.name : (params.usinfo.email || params.usinfo.phone);
	
		params.usinfo = params.usinfo || {};

		return (
			<div>
				<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.name} value={cname} />
				<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.created} value={moment(params.created).format('DD/MM/YY HH:mm:ss')} />
				<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.createdby} value={params.createdby} />
				<CustomerInfoItemComponent label={frases.CUSTOMERS.FIELDS.consent} value={params.consent ? frases.CUSTOMERS.HAS_CONSENT_MSG : frases.CUSTOMERS.NO_CONSENT_MSG} />
				<div className="text-center">
					<button type="button" className="btn btn-link" onClick={this._getPrivacyPrefs}>Privacy Preferences</button>
				</div>
				<br/>
				{
					this.state.privacyPrefs && (
						<div className={"collapse"+(this.state.prefsOpen ? " in" : "")} id="cus-priv-prefs">
							<CustomerPrivacyPrefs frases={frases} params={this.state.privacyPrefs} />
						</div>
					)
				}
				<hr/>
				{
					Object.keys(params.usinfo).map(function(key) {
						return <CustomerInfoItemComponent key={key} label={frases.CUSTOMERS.FIELDS[key]} value={params.usinfo[key]} />
					})
				}
				
			</div>
		);
	}
});

CustomerInfoComponent = React.createFactory(CustomerInfoComponent);

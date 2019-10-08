var DidTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		buyDidNumber: React.PropTypes.func,
		getObjects: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			init: false,
			fetch: false,
			sub: null,
			isTrial: null,
			totalAmount: 0,
			chargeAmount: 0,
			countries: [],
			selectedNumber: {},
			selectedTrunk: {},
			limitReached: false,
			showNewDidSettings: false,
			showConnectTrunkSettings: false
		};
	},

	componentWillMount: function() {
		var state = { fetch: true };

		this.setState(state);

		if(this.props.properties && this.props.properties.number) {

			this._getDid(this.props.properties.number, function(err, response) {
				if(err) return notify_about('error', err);
				state = {
					init: true,
					showNewDidSettings: true,
					selectedNumber: response.result
				}
				this.setState(state);
			}.bind(this));

		} else {
			state = {
				init: true,
				fetch: false
			};

			if(this._isTrunkChannel(this.props.properties.id) || getInstanceMode() === 1) {
				state.showConnectTrunkSettings = true;
				this.setState(state);
			} else {
				this.setState(state);
			}
		}

	},

	componentWillReceiveProps: function(props) {
		if(this.props.isNew && !props.isNew && props.properties && props.properties.number) {
			this.setState({ fetch: false });

			this._getDid(props.properties.number, function(err, response) {
				if(err) return notify_about('error', err);
				this.setState({ selectedNumber: response.result });

			}.bind(this));
		} else if(this._isTrunkChannel(props.properties.id) || getInstanceMode() === 1) {
			this.setState({ 
				fetch: false,
				showConnectTrunkSettings: true
			});
		}
				
	},

	_isTrunkChannel: function(str) {
		return (str ? str.indexOf('@') !== -1 : false);
	},

	_getDid: function(number, callback) {
		BillingApi.getDid({ number: number }, callback);
	},

	// _getCreatedTrunks: function() {
	// 	this.props.getObjects('trunk', function(result) {
	// 		this.setState({
	// 			trunks: result || []
	// 		});
	// 	});
	// },

	_getSubscription: function(callback) {
		var sub = this.state.sub;
		if(sub) return callback(null, sub);
		BillingApi.getSubscription(function(err, response) {
			if(!err && response.result) {
				sub = response.result;
				this.setState({ sub: sub, isTrial: (sub.plan.planId === 'trial' || sub.plan.numId === 0) });
				callback(null, sub);
			}
		}.bind(this));
	},

	_showNewDidSettings: function(e) {
		e.preventDefault();
		this.setState({ showNewDidSettings: !this.state.showNewDidSettings });

		this._getSubscription(function(err, response) {

			var sub = response;
			var maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;

			BillingApi.hasDids(function(err, count) {
				if(err) return notify_about('error', err);

				if(count.result >= maxdids) {
					this.setState({ limitReached: true });
					return;
				}

			}.bind(this));

		}.bind(this));
				
	},

	_showConnectTrunkSettings: function() {
		this.setState({ showNewDidSettings: false, showConnectTrunkSettings: true, fetchingTrunks: true });
	},

	// _onTrunkSelect: function(params) {
	// 	this.props.onChange(params);
	// },

	render: function() {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedRegion = state.selectedRegion;
		var selectedLocation = state.selectedLocation;
		var selectedAvailableNumber = state.selectedAvailableNumber;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;
		var properties = this.props.properties || {};

		// if(sub && selectedPriceObject) {
		// 	amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
		// 	proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
		// 	maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		// }

		if(!this.state.init) return <Spinner />;

		if(this.state.selectedNumber && this.state.selectedNumber._id) return <SelectedDidNumberComponent frases={frases} number={this.state.selectedNumber} />

		if(this.state.showConnectTrunkSettings) {
			return <ConnectTrunkSettings 
				getObjects={this.props.getObjects} 
				pageid={properties.id}
				frases={this.props.frases} 
				onChange={this.props.onChange}
				isNew={this.props.isNew}
			/>
		}

		if(!this.state.showNewDidSettings && !this.state.showConnectTrunkSettings) {
			return (
				<div className="row" style={{ position: 'relative' }}>
					<div className={"col-sm-6 " + (isSmallScreen() ? 'text-center' : 'text-right')}>
					    <a 
					    	href="#" 
					    	className="chattrunk-service-cont"
					    	style={{ textDecoration: "none", maxWidth: "300px", minHeight: "150px" }}
					    	onClick={this._showNewDidSettings}
					    >
			    			<span 
			    				className="icon-add_call"
			    				style={{ fontSize: "2em", color: "#333", padding: "5px 0" }}
			    			></span>
					    	<h4>{frases.CHAT_TRUNK.DID.RENT_NUMBER_BTN_LABEL}</h4>
					    	<p>{frases.CHAT_TRUNK.DID.RENT_NUMBER_BTN_DESC}</p>
					    </a>
					</div>
					<div className="col-sm-1 text-center" style={{ position: "absolute", display: "inline-block", width: "1px", height: "100%", backgroundColor: "#eee", padding: "0" }}></div>
					<div className={"col-sm-5 " + (isSmallScreen() ? 'text-center' : 'text-left')}>
					    <a 
					    	href="#" 
					    	className="chattrunk-service-cont"
					    	style={{textDecoration: "none",  maxWidth: "300px", minHeight: "150px" }}
					    	onClick={this._showConnectTrunkSettings}
					    >
					    	<div>
				    			<span 
				    				className="icon-dialer_sip"
				    				style={{ fontSize: "2em", color: "#333", padding: "5px 0" }}
				    			></span>
				    		</div>
					    	<h4>{frases.CHAT_TRUNK.DID.CONNECT_NUMBER_BTN_LABEL}</h4>
					    	<p>{frases.CHAT_TRUNK.DID.CONNECT_NUMBER_BTN_DESC}</p>
					    </a>
					</div>
				</div>
			)
		}

		return (
			<div>
				{
					this.state.limitReached ? (
						<div className="form-group">
							<div className="col-sm-8 col-sm-offset-4">
								<p>{frases.CHAT_TRUNK.DID.LIMIT_REACHED.MAIN_MSG}</p> 
								<p><a href="#billing">{frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_LINK}</a> {frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_MSG}</p>
							</div>
						</div>
					) : (
						<RentDidComponent frases={frases} sub={sub} onChange={this.props.onChange} />
					)
				}
			</div>		
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);

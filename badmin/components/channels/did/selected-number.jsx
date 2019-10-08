var SelectedDidNumberComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		number: React.PropTypes.object
	},

	updateStatusInterval: null,

	updateRegInterval: null,

	getInitialState: function() {
		return {
			number: {},
			fetchingStatus: false,
			statusUpdates: 0,
			regUpdates: 0,
			maxStatusUpdates: 10,
			maxRegUpdates: 10
		};
	},

	componentWillMount: function() {
		var number = this.props.number
		this.setState({ number: number });

		if(number.status !== 'active') {
			this._fetchUpdateStatus(number.number);

		}

		if(number.awaitingRegistration) {
			this._fetchUpdateRegistration(number.number);

		}
		
	},

	_fetchUpdateStatus: function(number) {
		BillingApi.updateDidStatus({ number: number }, function(err, response) {
			if(err) return notify_about('error', err);
			this._updateStatus(response.result.status);
		}.bind(this));

		this.setState({ fetchingStatus: true });
	},

	_fetchUpdateRegistration: function(number) {
		BillingApi.updateDidRegistration({ number: number }, function(err, response) {
			if(err) return notify_about('error', err);
			this._updateRegistration(response.result.awaitingRegistration);
		}.bind(this));

	},

	_updateStatus: function(status) {
		var state = this.state;
		state.number.status = status;
		state.fetchingStatus = false;
		this.setState(state);
	},

	_updateRegistration: function(awaitingRegistration) {
		var state = this.state;
		state.number.awaitingRegistration = awaitingRegistration;
		this.setState(state);
	},

	render: function() {
		var frases = this.props.frases;
		var selectedNumber = this.state.number;
		
		return (
			<form className="form-horizontal">
				<div className="form-group">
					<label className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.LOCATION}</label>
					<div className="col-sm-4">
						<p className="form-control-static">
							{selectedNumber.country + ", " + selectedNumber.areaName} 
						</p>
					</div>
				</div>
				<div className="form-group">
					<label className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.NUMBER}</label>
					<div className="col-sm-4">
						<p className="form-control-static">
							{selectedNumber.formatted}
						</p>
					</div>
				</div>
				<div className="form-group">
					<label className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.STATUS}</label>
					<div className="col-sm-4">
						{
							!this.state.fetchingStatus ? (
								<span 
									className={"label label-"+((selectedNumber.status === 'active' && !selectedNumber.awaitingRegistration) ? 'success' : 'warning')}
								>
									{selectedNumber.awaitingRegistration ? 'awaiting registration' : selectedNumber.status}
								</span>
							) : (
								<Spinner />
							)
						}
					</div>
				</div>
				{
					selectedNumber.awaitingRegistration && (
						<div className="form-group">
							<div className="col-sm-8 col-sm-offset-4">
								<DidRestrictionsComponent frases={frases} list={selectedNumber.restrictions.split(',')} />
							</div>
						</div>
					)
				}
			</form>
		);
		
	}
});
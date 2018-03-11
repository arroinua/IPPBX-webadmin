var SelectedDidNumberComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		number: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			number: {},
			fetchingStatus: false,
			fetchingRegistration: false
		};
	},

	componentWillMount: function() {
		var state = {
			number: this.props.number
		};

		if(this.props.number.status !== 'active') {
			billingRequest('updateDidStatus', { number: this.props.number.number }, function(err, response) {
				if(err) return notify_about('error', err);
				this._updateStatus(response.result.status);
			}.bind(this));
			state.fetchingStatus = true;
		}

		if(this.props.number.awaitingRegistration) {
			billingRequest('updateDidRegistration', { number: this.props.number.number }, function(err, response) {
				if(err) return notify_about('error', err);
				this._updateRegistration(response.result.awaitingRegistration);
			}.bind(this));
			state.fetchingRegistration = true;
		}
		
		this.setState(state);
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
		state.fetchingRegistration = false;
		this.setState(state);
	},

	render: function() {
		var frases = this.props.frases;
		var selectedNumber = this.state.number;
		
		return (
			<div>
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
			</div>
		);
		
	}
});
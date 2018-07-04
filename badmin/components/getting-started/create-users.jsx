var GSCreateUsersComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		// group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func
	},

	_onAction: function() {
		this.props.closeGS(true);
		window.location.hash = "#users/users";
	},

	_nextStep: function() {
		this.props.nextStep();
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div className="gs-step">
				<div className="row">
					<div className="col-xs-12">
						<div className="gs-step-head">
							<img src="/badmin/images/mainImage.png" />
						</div>
						<div className="gs-step-body">
							<h3>{frases.GET_STARTED.CREATE_USERS.TITLE}</h3>
							<p>{frases.GET_STARTED.CREATE_USERS.DESC}</p>
						</div>
						<div className="gs-step-footer">
							<button type="button" className="btn btn-primary btn-lg" onClick={this._onAction}>{frases.GET_STARTED.CREATE_USERS.START_TOUR}</button>
							<button type="button" className="btn btn-link" onClick={this._nextStep}>{frases.GET_STARTED.CREATE_USERS.SKIP_TOUR}</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

GSCreateUsersComponent = React.createFactory(GSCreateUsersComponent);

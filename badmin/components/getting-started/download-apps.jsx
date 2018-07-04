var GSDownloadAppsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		// group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func,
		sendLinks: React.PropTypes.func
	},

	// _onAction: function() {
	// 	this.props.closeGS(true);
	// 	window.location.hash = "#users/users";
	// },

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
							<img src="/badmin/images/apps.png" />
						</div>
						<GSStepNavComponent onPrev={this.props.prevStep} onNext={this._nextStep} prevText={frases.GET_STARTED.CREATE_USERS.TITLE} nextText={frases.GET_STARTED.CONNECT_CHANNELS.TITLE} />
						<div className="gs-step-body">
							<h3>{frases.GET_STARTED.DOWNLOAD_APPS.TITLE}</h3>
							<p>{frases.GET_STARTED.DOWNLOAD_APPS.DESC}</p>
							<div className="text-center">
								<GSDownloadLinksComponent />
							</div>
						</div>
						<div className="gs-step-footer">
							<button type="button" className="btn btn-link" onClick={this._nextStep}>{frases.GET_STARTED.DOWNLOAD_APPS.SKIP_TOUR}</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

GSDownloadAppsComponent = React.createFactory(GSDownloadAppsComponent);

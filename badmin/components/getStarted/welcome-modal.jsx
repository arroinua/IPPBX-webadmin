
var WelcomeModal = React.createClass({

	propTypes: {
		startTour: React.PropTypes.func,
		modalId: React.PropTypes.string,
		frases: React.PropTypes.object,
	},

	getDefaultProps: function() {
		return {
			modalId: 'welcome-modal'
		};
	},

	// getInitialState: function() {
	// 	return {};
	// },

	_startTour: function() {
		this.props.startTour();
		this._dismissModal()
	},

	_dismissModal: function() {
		$('#'+this.props.modalId).modal('hide');
	},

	_getModalBody: function() {
		return (
			<div className="row">
				<div className="col-xs-12 text-center">
					<h1>
						<span className="fa-stack">
						    <i className="fa fa-circle fa-stack-2x text-success"></i>
						    <i className="fa fa-check fa-stack-1x text-white"></i>
						</span>
					</h1>
					<h1>{this.props.frases.GET_STARTED.WELCOME_MSG}</h1>
					<h4>{this.props.frases.GET_STARTED.TOUR_OFFER}</h4>
					<hr/>
					<div>
						<button className="btn btn-primary" onClick={this._startTour}>{this.props.frases.GET_STARTED.START_TOUR}</button>
						<span> </span>
						<button className="btn btn-default" onClick={this._dismissModal}>{this.props.frases.GET_STARTED.DISMISS_TOUR}</button>
					</div>
				</div>
			</div>
		);
	},

	render: function() {
		var body = this._getModalBody();

		return (
			<ModalComponent id={this.props.modalId} size="lg" body={body} />
		);
	}
});

WelcomeModal = React.createFactory(WelcomeModal);

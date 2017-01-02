
var WelcomeModal = React.createClass({

	propTypes: {
		startTour: React.PropTypes.func,
		modalId: React.PropTypes.string
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
		console.log('_startTour: ', this.props.startTour);
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
					<h1>Welcome to the Ringotel administrative panel</h1>
					<h4>Here you can setup your Ringotel instance in lots of different ways. Would you like to have a starting tour of how to get started?</h4>
					<hr/>
					<div>
						<button className="btn btn-primary" onClick={this._startTour}>Start a tour</button>
						<span> </span>
						<button className="btn btn-default" onClick={this._dismissModal}>No, dismiss</button>
					</div>
				</div>
			</div>
		);
	},

	render: function() {
		var body = this._getModalBody();

		return (
			<ModalComponent id={this.props.modalId} body={body} />
		);
	}
});

WelcomeModal = React.createFactory(WelcomeModal);

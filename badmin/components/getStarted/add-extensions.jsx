
var AddExtensions = React.createClass({

	propTypes: {
		step: React.PropTypes.object,
		frases: React.PropTypes.object
	},

	getDefaultProps: function() {
		step: {}
	},

	getInitialState: function() {
		return {
			extensions: []
		};
	},

	_chooseGroup: function(type) {
		window.location.hash = '#'+type+'?'+type;
		console.log('close Modal: ', this.props.step.name, $('#'+this.props.step.name));
		$('#'+this.props.step.name).modal('hide');
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div>
				<div className="row ">
					<div className="col-sm-6 text-center">
						<div className="gs-item" onClick={this._chooseGroup.bind(this, 'users')}>
							<h3><i className="fa fa-user"></i></h3>
							<h3>{ frases.GET_STARTED.STEPS.A.MODAL.OPTION_1.TITLE }</h3>
							<p>{ frases.GET_STARTED.STEPS.A.MODAL.OPTION_1.DESC }</p>
						</div>
					</div>
					<div className="col-sm-6 text-center">
						<div className="gs-item" onClick={this._chooseGroup.bind(this, 'equipment')}>
							<h3><i className="fa fa-fax"></i></h3>
							<h3>{ frases.GET_STARTED.STEPS.A.MODAL.OPTION_2.TITLE }</h3>
							<p>{ frases.GET_STARTED.STEPS.A.MODAL.OPTION_2.DESC }</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

AddExtensions = React.createFactory(AddExtensions);
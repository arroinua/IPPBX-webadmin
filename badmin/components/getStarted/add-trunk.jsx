
var AddTrunk = React.createClass({

	propTypes: {
		step: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			step: {}
		};
	},

	getInitialState: function() {
		return {};
	},

	_addNewTrunk: function() {
		window.location.hash = '#trunk/trunk';
		$('#'+this.props.step.name).modal('hide');
	},

	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-xs-12 text-center">
						<h4>{this.props.step.title}</h4>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12 text-center">
						<button onClick={this._addNewTrunk} className="btn btn-primary btn-xl"><i className="fa fa-cloud"></i> Add Trunk</button>
						<br/><br/>
					</div>
				</div>
			</div>
		);
	}
});

AddTrunk = React.createFactory(AddTrunk);

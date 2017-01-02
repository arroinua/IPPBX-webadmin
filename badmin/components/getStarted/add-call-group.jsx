
var AddCallGroup = React.createClass({

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

	_chooseGroup: function(type) {
		window.location.hash = '#'+type+'?'+type;
		console.log('close Modal: ', this.props.step.name, $('#'+this.props.step.name));
		$('#'+this.props.step.name).modal('hide');
	},

	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-xs-12 text-center">
						<h3>Call groups, like hunting groups and hotlines, defines how incomming calls would be handled and by whom. In order to create call group, extensions should be created.</h3>
						<br/><br/>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 text-center">
						<button onClick={this._chooseGroup.bind(this, 'hunting')} className="btn btn-primary btn-xl"><i className="icon-find_replace"></i> Create Hunting group</button>
						<br/><br/>
						<p>Within a Hunting group call would be allocated to the available extension, either circular, or simultaneous.</p>
					</div>
					<div className="col-sm-6 text-center">
						<button onClick={this._chooseGroup.bind(this, 'icd')} className="btn btn-primary btn-xl"><i className="icon-headset_mic"></i> Create Hotline</button>
						<br/><br/>
						<p></p>
					</div>
				</div>
			</div>
		);
	}
});

AddCallGroup = React.createFactory(AddCallGroup);

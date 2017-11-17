var IntegrationsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params
		});
	},

	_saveOptions: function() {
		var params = this.state.params || {};
		
	},

	_handleOnChange: function(params) {
		var keys = Object.keys(params);
		
		if(!keys || !keys.length) return;

		var state = this.state.params;
		// var newState = this.state.newParams || {};

		keys.forEach(function(key) {
			state[key] = params[key];
			// newState[key] = params[key];
		});

		this.setState(state);
	},

	_panelHead: function() {
		return (
			<button type="button" className="btn btn-success btn-md" onClick={this._saveOptions}>
				<i className="fa fa-check fa-fw"></i> {this.props.frases.SAVE}
			</button>
		);
	},

	render: function() {
		var frases = this.props.frases;
		var panelHead = this._panelHead();

		console.log('IntegrationsComponent render: ', this.state.params);

		return (
			<div className="row">
				<div className="col-xs-12">
					<PanelComponent header={panelHead}>
						
					</PanelComponent>
				</div>
			</div>
		);
	}
});

IntegrationsComponent = React.createFactory(IntegrationsComponent);

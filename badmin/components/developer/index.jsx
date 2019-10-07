var DeveloperComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			json: "",
			messages: [],
			apikey: ""
		};
	},

	// componentWillMount: function() {
		
	// },

	// componentWillReceiveProps: function(props) {
		
	// },

	_onChange: function(e) {
		var target = e.target;
		var state = extend({}, this.state);
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		state[target.name] = value;

		this.setState(state);

	},

	_onSubmit: function(e) {
		
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<PanelComponent>
				<form className="form-horizontal">
					<div className="form-group">
						<label className="control-label col-sm-4">Select API Key</label>
						<div className="col-sm-4">
							<select name="apikey" className="form-control col-sm-4" value={this.state.apikey} onChange={this._onChange}>
								{
									this.props.params.apikeys.map(function(item) {
										return <option key={item.name} value={item.name}>{item.name}</option>
									})
								}
							</select>
						</div>
					</div>
					<div className="form-group">
						<div className="col-sm-6">
							<textarea className="form-control" style={{ width: "100%", height: "400px" }} placeholder="Enter a JSON string..."></textarea>
							<br/>
							<button type="submit" className="btn btn-success">Send a message</button>
						</div>
						<div className="col-sm-6">
							<textarea className="form-control" style={{ width: "100%", height: "400px" }} placeholder="Response from the server..."></textarea>
						</div>
					</div>
				</form>
			</PanelComponent>
		);
	}
});

DeveloperComponent = React.createFactory(DeveloperComponent);

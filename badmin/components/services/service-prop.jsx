var ServicePropComponent = React.createClass({

	propTypes: {
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {}
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params || {}
		});
	},

	_onChange: function(e) {
		this.props.onChange(e);
	},

	render: function() {
		var params = this.state.params;
		var type = typeof this.props.params.value;
		var label = params.key.replace('_', ' ').replace('directory', '');

		return (
			<div>
				{
					type === 'boolean' ? (
						<div className="form-group">
							<div className="col-sm-4 col-sm-offset-4">
								<div className="checkbox">
									<label>
										<input type="checkbox" checked={params.value} name={params.key} onChange={this._onChange} /> {params.key}
									</label>
								</div>
							</div>
						</div>
					) : type === 'number' ? (
						<div className="form-group">
							<label htmlFor={params.key} className="col-sm-4 control-label">{label}</label>
							<div className="col-sm-4">
							    <input type="number" name={params.key} className="form-control" value={params.value} onChange={this._onChange} />
							</div>
						</div>
					) : (
						<div className="form-group">
							<label htmlFor={params.key} className="col-sm-4 control-label">{label}</label>
							<div className="col-sm-4">
							    <input type="text" name={params.key} className="form-control" value={params.value} onChange={this._onChange} />
							</div>
						</div>
					)
				}
			</div>
		)
	}
});

ServicePropComponent = React.createFactory(ServicePropComponent);
var FetchMethod = React.createClass({

	propTypes: {
		componentProps: React.PropTypes.object,
		method: React.PropTypes.string,
		params: React.PropTypes.object,
		component: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			fetch: false,
			result: null
		};
	},

	componentWillMount: function() {
		this._doFetch(this.props.method, this.props.params, function(result) {
			this.setState({
				result: result
			});
		});
	},

	_doFetch: function(method, params, callback) {
		this.setState({ fetch: true });
		json_rpc_async(method, params, function(result) {
			this.setState({ fetch: false });
			callback(result);
		});
	},

	render: function() {
		var frases = this.props.frases;
		var Component = this.props.component;
		
		return (
			<div>
				{
					this.state.fetch ? (
						<Spinner />
					) : (
						<Component componentProps={this.props.componentProps} result={this.state.result} />
					)
				}		
			</div>
		);
		
	}
});

FetchMethod = React.createFactory(FetchMethod);

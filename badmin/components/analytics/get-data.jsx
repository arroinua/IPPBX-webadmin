 var GetAndRenderAnalyticsDataComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		fetch: React.PropTypes.object,
		method: React.PropTypes.string,
		component: React.PropTypes.func,
		onComponentLoad: React.PropTypes.func,
		onComponentUpdate: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { fetch: {} };
	},

	getInitialState: function() {
		return { data: null, fetching: false };
	},

	componentWillMount: function() {
		this._getData(this.props.method, this.props.fetch, function(result) {
			this.setState({ fetching: false })
			this._setData(result);
		}.bind(this));
	},

	componentWillReceiveProps: function(props) {
		this.setState({ fetching: true });
		
		this._getData(props.method, props.fetch, function(result) {
			this.setState({ fetching: false })
			this._setData(result);
		}.bind(this));
	},

	shouldComponentUpdate: function() {
		return !this.state.fetching;
	},

	_getData: function(method, params, callback) {
		if(!method || !params.date) return;

		json_rpc_async(method, {
			begin: params.date.start || params.date.begin,
			end: params.date.end
		}, callback);
	},

	_setData: function(data) {

		this.setState({
			data: data
		});		
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.state.data;
		var Component = this.props.component;

		console.log('GetAndRenderAnalyticsDataComponent: ', this.props.method, data);

		return (
			data ? <Component frases={frases} fetching={this.state.fetching} data={data} onLoad={this.props.onComponentLoad} onUpdate={this.props.onComponentUpdate} /> : null
		)
	}
});

GetAndRenderAnalyticsDataComponent = React.createFactory(GetAndRenderAnalyticsDataComponent);

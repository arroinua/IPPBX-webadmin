 var GetAndRenderAnalyticsDataComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		fetch: React.PropTypes.object,
		method: React.PropTypes.string,
		component: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { fetch: {} };
	},

	getInitialState: function() {
		return { data: null };
	},

	componentWillMount: function() {
		this._getData(this.props.method, this.props.fetch);
	},

	componentWillReceiveProps: function(props) {
		this._getData(props.method, props.fetch);
	},

	_getData: function(method, params) {
		console.log('GetAndRenderAnalyticsDataComponent _getData: ', method, params);
		if(!method || !params.date) return;

		json_rpc_async(method, {
			begin: params.date.start,
			end: params.date.end
		}, this._setData);
	},

	_setData: function(data) {
		console.log('GetAndRenderAnalyticsDataComponent _setData: ', this.props.method, data);

		this.setState({
			data: data
		});		
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.state.data;
		var Component = this.props.component;

		return <Component frases={frases} data={data} />
	}
});

GetAndRenderAnalyticsDataComponent = React.createFactory(GetAndRenderAnalyticsDataComponent);

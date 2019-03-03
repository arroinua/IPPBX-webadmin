 var ChartComponent = React.createClass({

	propTypes: {
		type: React.PropTypes.string,
		data: React.PropTypes.object,
		options: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			chart: {}
		};
	},

	componentDidMount: function() {
		this._setChart(this.props.data);
		// var el = ReactDOM.findDOMNode(this);
		// var options = this.props.options;
		// var data = this.props.data;
		// var chartOptions = {
		// 	bindto: el,
		// 	data: this.props.data
		// };
		// var chart = {};

		// if(options) {
		// 	for(var key in options) {
		// 		chartOptions[key] = options[key];
		// 	}
		// }

		// data.type = this.props.type;
		// chart = c3.generate(chartOptions);

		// this.setState({ chart: chart });
	},

	componentWillReceiveProps: function(props) {
		console.log('ChartsComponent componentWillReceiveProps: ', props);
		this._setChart(props.data);
		// this._updateChart(props.data);
	},

	componentWillUnmount: function() {
		console.log('ChartsComponent componentWillUnmount');
	},

	shouldComponentUpdate: function() {
		return false;
	},

	_getIds: function() {
		var chart = this.state.chart;
		return chart.data().reduce(function(init, next) {
			init.push(next.id);
			return init;
		}, []);
	},

	_excludeIds: function(fromArray, indexArray) {
		return fromArray.reduce(function(init, next) {
			if(indexArray.indexOf(next) < 0) init.push(next);
			return init;
		}, []);
	},

	_setChart: function(data) {
		var el = ReactDOM.findDOMNode(this);
		var options = this.props.options;
		// var data = this.props.data;
		var chartOptions = {
			bindto: el,
			data: data
		};
		var chart = {};

		if(options) {
			for(var key in options) {
				chartOptions[key] = options[key];
			}
		}

		data.type = this.props.type;
		chart = c3.generate(chartOptions);

		this.setState({ chart: chart });
	},

	_updateChart: function(data) {
		var chart = this.state.chart;
		// var chartIds = this._getIds();
		// var dataIds = data.columns.reduce(function(init, next) {
		// 	init.push(next[0]);
		// 	return init;
		// }, []);
		// var unloadIds = this._excludeIds(chartIds, dataIds);

		// data.done = function() {
		// 	chart.unload(unloadIds);
		// };

		chart.unload();

		setTimeout(function() {
			chart.load(data);
		}, 500);

	},

	render: function() {		
		console.log('ChartsComponent render: ', this.state, this.props);
		return React.createElement('div');
	}
});

ChartComponent = React.createFactory(ChartComponent);

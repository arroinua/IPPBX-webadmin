
var ObjectRoute = React.createClass({

	propTypes: {
		// getOptions: React.PropTypes.func,
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		extOnly: React.PropTypes.bool,
		// clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			route: {},
			routeId: "",
			options: null
		};
	},

	componentWillMount: function() {
		var options = [],
			route = this.props.routes.length ? this.props.routes[0] : null;

		this._getAvailablePool(function(result) {
		    options = result
		    .sort()
		    .map(function(item) { return { value: item, label: item } });

		    options.unshift({ value: 0, label: this.props.frases.SELECT_ROUTE });

		    // set route options
		    this.setState({ options: options });

		    // select route and set current route oid
		    if(route && route.id) {
		    	this.setState({
		    		routeId: route.id,
		    		value: route.ext,
		    		label: route.ext
		    	});
		    	this._onChange({ value: route.ext, label: route.ext });
		    } else {
		    	this.setState({ route: options[1] });
		    	this._onChange(options[1]);
		    }

		}.bind(this));
	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getAvailablePool: function(cb) {
	    window.json_rpc_async('getObject', { oid: 'user' }, function(result) {
	        cb(result.available.sort());
	    });
	},

	_getRouteObj: function(ext) {
		var currRouteObj = {
			ext: ext
		};

		if(this.state.routeId) currRouteObj.oid = this.state.routeId;

		return currRouteObj;

		// var routeObj = this.props.routes.map(function(item) {
		// 	if(item.ext === ext) return item;
		// });


		// return (routeObj.length ? routeObj[0] : { ext: ext })
	},

	_onChange: function(val) {
		if(!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function() {
		return (
			this.state.options ? (
				<Select3 value={this.state.route} readonly={this.props.extOnly} options={this.state.options} onChange={this._onChange} />
			) : (
				<h4 className="fa fa-fw fa-spinner fa-spin"></h4>
			)
	        
		);
	}
});

ObjectRoute = React.createFactory(ObjectRoute);

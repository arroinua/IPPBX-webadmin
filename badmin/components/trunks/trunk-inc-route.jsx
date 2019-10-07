
var TrunkIncRoutes = React.createClass({

	propTypes: {
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			routes: [],
			routeId: "",
			options: []
		};
	},

	componentWillMount: function() {
		var routes = this.props.routes;

		this._getOptions(function(result) {

			if(routes) {
			    routes = options.filter(function(item) {
			        return (item.ext === params.route.prefix);
			    })[0];
			}

			this.setState({ options: result });
		});

	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getOptions: function(callback) {
		if(PbxObject.extensions.length) {
	        callback(PbxObject.extensions);
	    } else {
	        getExtensions(function(result) {
	            callback(result);
	        });
	    }
	},

	_getAvailablePool: function(cb) {
	    json_rpc_async('getObject', { oid: 'user' }, function(result) {
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
				<Select3 value={this.state.route} options={this.state.options} onChange={this._onChange} />
			) : (
				<h4 className="fa fa-fw fa-spinner fa-spin"></h4>
			)
	        
		);
	}
});

TrunkIncRoutes = React.createFactory(TrunkIncRoutes);


var ObjectRoute = React.createClass({

	propTypes: {
		getOptions: React.PropTypes.func,
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		// clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			route: {},
			routeId: "",
			options: []
		};
	},

	componentWillMount: function() {
		var options = [],
			route = this.props.routes.length ? this.props.routes[0] : null;

		this.props.getOptions(function(result) {
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
		    	this.setState({ route: options[0] });
		    	this._onChange(options[0]);
		    }

		}.bind(this));
	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getRouteObj: function(ext) {
		var currRouteObj = {
			ext: ext
		};

		if(this.state.routeId) currRouteObj.oid = this.state.routeId;

		return currRouteObj;

		// var routeObj = this.props.routes.map(function(item) {
		// 	if(item.ext === ext) return item;
		// });

		// console.log('_getRouteObj: ', routeObj);

		// return (routeObj.length ? routeObj[0] : { ext: ext })
	},

	_onChange: function(val) {
		console.log('Select: ', val);
		if(!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function() {
		console.log('ObjectRoute value: ', this.state.route);
		return (
			<Select3 value={this.state.route} options={this.state.options} onChange={this._onChange} />
			
            	//<Select
            	//    name="form-field-name"
            	//    className="obj-route-select"
            	//    clearable={false}
            	//    value={this.state.route}
            	//    options={this.state.options}
            	//    onChange={this._onChange}
            	//    arrowRenderer={function() { return false; }}
            	///>
	        
		);
	}
});

ObjectRoute = React.createFactory(ObjectRoute);
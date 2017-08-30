
var TrunkIncRoute = React.createClass({

	propTypes: {
		options: React.PropTypes.array,
		route: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			route: {},
			options: []
		};
	},

	componentDidMount: function() {

		options = this.props.options
	    .sort()
	    .map(this._toRouteObj);

		options.unshift({ value: 0, label: this.props.frases.TRUNK.INC_ROUTE_DEFAULT_OPTION });

		this.setState({ options: options });

	    // select route and set current route oid
	    if(this.props.route) {
	    	this._onChange(this._toRouteObj(this.props.route));
	    } else {
	    	this._onChange(options[0]);
	    }

	},

	_toRouteObj: function(item) {
		return { value: item.ext, label: (item.name ? (item.ext + ' - ' + item.name) : item.ext) };
	},

	_getRouteObj: function(ext) {
		var currRouteObj = {
			ext: ext
		};

		return currRouteObj;

	},

	_onChange: function(val) {
		console.log('Select: ', val);
		if(!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function() {

		return (
			// <PanelComponent>
            	// <label htmlFor="form-field-name">Route</label>
            	<Select
            	    name="t-inc-route"
            	    clearable={false}
            	    value={this.state.route}
            	    options={this.state.options}
            	    onChange={this._onChange}
            	/>
	        // </PanelComponent>
		);
	}

});

TrunkIncRoute = React.createFactory(TrunkIncRoute);

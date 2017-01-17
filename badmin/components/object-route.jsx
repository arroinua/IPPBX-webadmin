
var ObjectRoute = React.createClass({

	propTypes: {
		getOptions: React.PropTypes.func,
		currentRoute: React.PropTypes.string,
		clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			route: {},
			options: []
		};
	},

	componentDidMount: function() {
		var options = [],
			route;

		this.props.getOptions(function(result) {
		    options = result
		    .sort()
		    .map(function(item) { return { value: item, label: item } });

		    options.unshift({ value: 0, label: 'Not selected' });

		    route = this.props.currentRoute ? 
		    { value: this.props.currentRoute, label: this.props.currentRoute } : 
		    options[0];

		    this.setState({ options: options });
		    this._onChange(route);
		}.bind(this));
	},

	componentWillUnmount: function() {
		this.props.clearCurrObjRoute();
	},

	_onChange: function(val) {
		console.log('Select: ', val);
		this.setState({ route: val });
		this.props.onChange(val ? val.value : '');
	},

	render: function() {

		return (
			<PanelComponent>
            	<label htmlFor="form-field-name">Route</label>
            	<Select
            	    name="form-field-name"
            	    value={this.state.route}
            	    options={this.state.options}
            	    onChange={this._onChange}
            	/>
	        </PanelComponent>
		);
	}
});

ObjectRoute = React.createFactory(ObjectRoute);

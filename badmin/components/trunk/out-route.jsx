
var TrunkOutRoute = React.createClass({

	propTypes: {
		rule: React.PropTypes.object,
		ruleIndex: React.PropTypes.number,
		deleteRule: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			rule: {},
			options: []
		};
	},

	componentDidMount: function() {

		var options = [
			{
				value: 1,
				label: 'starting with prefix'
			},
			{
				value: 2,
				label: 'with a number length of'
			}
		];

		this.setState({ options: options });
		this.setState({ rule: this.props.rule });

	},

	_onChange: function(val) {
		console.log('on rule change: ', val);
		this.setState({ rule: val });
	},

	render: function() {

		return (
			<div className="input-group">
			    			    
			    <span className="input-group-addon tout-route-row">
		        	<Select
		        	    name="t-out-route"
		        	    clearable={false}
		        	    value={this.state.rule}
		        	    options={this.state.options}
		        	    onChange={this._onChange}
		        	/>
	        	</span>

	        	{ this.state.rule.value === 1 &&
	        		<input name="oroute-prefix" className="form-control" />
	        	}

	        	{ this.state.rule.value === 2 &&
	        		<input type="number" name="oroute-numlength" className="form-control" />
	        	}

	        	{ this.state.rule.value &&
		        	<span className="input-group-addon">
		        		<button type="button" className="btn btn-default" onClick={ this.props._deleteRule(this.props.ruleIndex) }><span className="fa fa-remove"></span></button>
		        	</span>
	        	}

	        </div>
		);
	}

});

TrunkOutRoute = React.createFactory(TrunkOutRoute);

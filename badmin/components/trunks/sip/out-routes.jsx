
var TrunkOutRoutes = React.createClass({

	propTypes: {
		// options: React.PropTypes.array,
		// route: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			rules: []
		};
	},

	// componentDidMount: function() {

	// },

	_addRule: function() {
		console.log('_addRule');

		var rules = this.state.rules;
		var route = {
			rule: 0,
			value: ''
		};
		
		rules.push(route);

		this.setState({ rules: rules });
	},

	_deleteRule: function(index) {
		if(index === undefined) return;
		this.state.rules.splice(index, 1);
	},

	render: function() {

		return (
			<div className="tout-routes-cont">

				{ this.state.rules.map(function(rule, index) {
					console.log('rules: ', rule);
					return <TrunkOutRoute rule={ rule } ruleIndex={ index } deleteRule={ this._deleteRule } />
				
				}.bind(this)) }

		        <button type="button" className="btn btn-link" onClick={this._addRule} >+ {this.props.frases.TRUNK.ADD_RULE}</button>

		    </div>
		);
	}

});

TrunkOutRoutes = React.createFactory(TrunkOutRoutes);

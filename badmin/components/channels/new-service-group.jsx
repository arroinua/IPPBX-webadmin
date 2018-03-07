var NewServiceGroupComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {},
	// 		files: []
	// 		// filteredMembers: []
	// 	};
	// },

	componentWillMount: function() {
		
	},

	componentWillReceiveProps: function(props) {
		
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;

		return (
			<div></div>			
		);
	}
});

NewServiceGroupComponent = React.createFactory(NewServiceGroupComponent);

var GsWidget = React.createClass({

	propTypes: {
		steps: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			steps: []
		};
	},

	render: function() {
		var frases = this.props.frases;
		
		return (
			<div className="gs-items-cont">
			    <ul className="gs-items">
			    	{this.props.steps.map(function(item) {
			    		return <GsStep step={item} frases={frases} key={item.name} />
			    	}, this)}
			    </ul>
			</div>
		);
	}
});

GsWidget = React.createFactory(GsWidget);
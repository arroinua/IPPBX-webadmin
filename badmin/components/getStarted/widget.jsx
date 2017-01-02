var GsWidget = React.createClass({

	propTypes: {
		steps: React.PropTypes.array
	},

	getDefaultProps: function() {
		return {
			steps: []
		};
	},

	render: function() {
		return (
			<div className="gs-items-cont">
			    <ul className="gs-items">
			    	{this.props.steps.map(function(item) {
			    		return <GsStep step={item} key={item.name} />
			    	}, this)}
			    </ul>
			</div>
		);
	}
});

GsWidget = React.createFactory(GsWidget);
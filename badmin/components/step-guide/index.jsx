var StepGuide = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		header: React.PropTypes.element,
		steps: React.PropTypes.array,
		footer: React.PropTypes.element
	},

	// getInitialState: function() {
	// 	return {
	// 		stepIndex: 0
	// 	}
	// },

	// _onStepSelect: function(index) {
	// 	this._setStepIndex(index);
	// },

	// _toNext: function() {
	// 	this._setStepIndex(this.state.stepIndex++);
	// },

	// _toPrev: function() {
	// 	this._setStepIndex(this.state.stepIndex--);
	// },

	// _setStepIndex: function(index) {
	// 	this.setState({ stepIndex: (index < 0 ? 0 : (index > this.props.steps.length ? this.props.steps.length-1 : index)) });
	// },

	render: function() {
		// var currStep = this.props.steps[this.state.stepIndex];

		var frases = this.props.frases;

		return (
			<div>
				{this.props.header}
				{
					this.props.steps.map(function(item, index) {
						return (
							<StepGuideStep frases={frases} key={index} params={item} stepIndex={index+1} />
						)
					})
				}
				{this.props.footer}
			</div>
		)
	}

});

StepGuide = React.createFactory(StepGuide);
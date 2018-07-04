var GSStepsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		initialStep: React.PropTypes.number,
		options: React.PropTypes.object,
		onClose: React.PropTypes.func,
		sendLinks: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			step: 0,
			components: [
				GSCreateUsersComponent,
				GSDownloadAppsComponent,
				GSCreateChannelsComponent
			],
			profile: {},
			open: true,
			init: false
		};
	},

	componentWillMount: function() {
		this.setState({ 
			init: true,
			step: this.props.initialStep
		});

	},

	componentWillReceiveProps: function(props) {
		var open = props.open === false ? false : true;

		this.setState({
			open: open,
			step: this.props.initialStep
		});

	},

	_nextStep: function(num) {
		var step = this.state.step;
		var next = step+1;
		console.log('nextStep >>>', next);
		if(!this.state.components[next]) return;
		this.setState({
			step: num || next
		});
	},

	_prevStep: function() {
		var step = this.state.step;
		var next = step-1;
		console.log('<<< prevStep', next);
		if(!this.state.components[next]) return;
		this.setState({
			step: next
		});
	},

	render: function() {
		var Component = this.state.components[this.state.step];

		return (
			<GSStepComponent>
				{
					this.state.init ? (
						<Component 
							frases={this.props.frases} 
							profile={this.state.profile} 
							// group={this.state.group} 
							nextStep={this._nextStep}
							prevStep={this._prevStep}
							closeGS={this.props.onClose}
							sendLinks={this.props.sendLinks}
							// options={this.state.options} 
						/>
					) : (
						<Spinner />
					)
				}
						
			</GSStepComponent>
		);
	}
});

GSModalComponent = React.createFactory(GSModalComponent);

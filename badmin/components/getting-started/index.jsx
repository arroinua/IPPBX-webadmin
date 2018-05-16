var GSModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		initialStep: React.PropTypes.number,
		options: React.PropTypes.object,
		onClose: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			step: 0,
			components: [],
			profile: {},
			open: true,
			init: false
		};
	},

	componentWillMount: function() {
		this.setState({
			components: [
				GSCreateUsersComponent,
				GSDownloadAppsComponent,
				GSCreateChannelsComponent
			]
		});

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

	_closeModal: function(init){
		this.setState({
			open: false
		});

		this.props.onClose(init);

	},

	_onClose: function(){
		this.props.onClose();
	},

	_getBody: function() {
		var Component = this.state.components[this.state.step];
		console.log('_getBody: ', this.state.step);
		return (
			<GSStepComponent>
				{
					this.state.init ? (
						<Component 
							frases={this.props.frases} 
							profile={this.state.profile} 
							group={this.state.group} 
							nextStep={this._nextStep}
							prevStep={this._prevStep}
							closeGS={this._closeModal}
							// options={this.state.options} 
						/>
					) : (
						<Spinner />
					)
				}
						
			</GSStepComponent>
		);
	},

	render: function() {
		var body = this._getBody();

		console.log('GSModalComponent render: ', body, this.state.open);

		return (
			<ModalComponent 
				title={this.props.frases.GET_STARTED.TITLE}
				open={this.state.open}
				onClose={this._onClose}
				body={body} 
			/>
		);
	}
});

GSModalComponent = React.createFactory(GSModalComponent);

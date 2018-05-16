var TelegramTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			init: true
		};
	},

	componentWillMount: function() {
		this._initService();
	},

	componentDidMount: function() {
		var frases = this.props.frases;

		if(this.props.isNew && this.props.addSteps) {

			this.props.addSteps([{
				element: '#ctc-select-2',
				popover: {
					title: frases.GET_STARTED.CONNECT_TELEGRAM.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CONNECT_TELEGRAM.STEPS["1"].DESC,
					position: 'top'
				}
			}]);

		}
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_initService: function() {
		this.setState({
			access_token: this.props.properties.access_token || ''
		});		
	},

	_onChange: function(e) {
		var value = e.target.value;
		var props = {
			access_token: value
		};
		
		this.setState(props);
		this.props.onChange(props);
	},

	render: function() {
		var frases = this.props.frases;
		
		return (
			<div>
				{
					<form className="form-horizontal">
						<div className="form-group">
						    <label htmlFor="ctc-select-2" className="col-sm-4 control-label">Token</label>
						    <div className="col-sm-6">
						    	{
					    			<input 
					    				id="ctc-select-2"
					    				className="form-control" 
					    				value={this.state.access_token} 
					    				onChange={this._onChange}
					    				placeholder="e.g. 110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
					    			/>
						    		
						    	}
						    </div>
						</div>
					</form>
				}	
			</div>
		);
	}
});

TelegramTrunkComponent = React.createFactory(TelegramTrunkComponent);

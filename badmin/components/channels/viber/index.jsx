var ViberTrunkComponent = React.createClass({

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
				element: '#ctc-select-3',
				popover: {
					title: frases.GET_STARTED.CONNECT_VIBER.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CONNECT_VIBER.STEPS["1"].DESC,
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
		
		console.log('Viber _onChange: ', value);

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
						    <label htmlFor="ctc-select-3" className="col-sm-4 control-label">App Key</label>
						    <div className="col-sm-6">
						    	{
					    			<input 
					    				id="ctc-select-3"
					    				className="form-control" 
					    				value={this.state.access_token} 
					    				onChange={this._onChange}
					    				placeholder="e.g. 445da6az1s345z78-dazcczb2542zv51a-e0vc5fva17480im9"
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

ViberTrunkComponent = React.createFactory(ViberTrunkComponent);

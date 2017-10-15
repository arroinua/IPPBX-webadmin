var ViberTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			init: true
		};
	},

	componentWillMount: function() {
		this._initService();
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_initService: function() {
		this.setState({
			app_key: this.props.properties.app_key || ''
		});		
	},

	_onChange: function(e) {
		var value = e.target.value;
		var props = {
			id: value,
			app_key: value
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
						    <label htmlFor="ctc-select-2" className="col-sm-4 control-label">App Key</label>
						    <div className="col-sm-6">
						    	{
					    			<input 
					    				id="ctc-select-2"
					    				className="form-control" 
					    				value={this.state.app_key} 
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

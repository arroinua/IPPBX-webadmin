 var TwitterTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		loginHandler: React.PropTypes.func,
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	// componentWillMount: function() {
	// 	this.setState({
	// 		selectedPage: this.props.properties || {}
	// 	});		
	// },

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_setToken: function() {

	},

	render: function() {
		var logedIn = this.props.serviceParams.pages;
		var frases = this.props.frases;
		
		console.log('TwitterTrunkComponent: ', logedIn);

		return (
			<div>
				{
					!logedIn ? (
						<div className="text-center">
							<button className="btn btn-lg btn-primary" onClick={this.props.loginHandler}><i className="fa fa-fw fa-twitter"></i> Login with Twitter</button>
						</div>
					) :
					(
						<form className="form-horizontal">
							<div className="form-group">
							    <label htmlFor="ctc-select-1" className="col-sm-4 control-label">Select Facebook Page</label>
							    <div className="col-sm-4">
							    	
							    </div>
							</div>
						</form>
					)
				}	
			</div>
		);
	}
});

TwitterTrunkComponent = React.createFactory(TwitterTrunkComponent);

 var TwitterTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	componentWillMount: function() {
		this.setState({
			logedIn: false
		});		
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_login: function() {
		console.log('Login');
	},

	render: function() {
		var frases = this.props.frases;
		
		console.log('TwitterTrunkComponent: ');

		return (
			<div>
				{
					!this.state.logedIn ? (
						<div className="text-center">
							<button className="btn btn-lg btn-primary" onClick={this._login}><i className="fa fa-fw fa-twitter"></i> Login with Twitter</button>
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

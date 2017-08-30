 var FacebookTrunkComponent = React.createClass({

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

	componentWillMount: function() {
		this.setState({
			selectedPage: this.props.properties || {}
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			selectedPage: props.properties || {}
		});		
	},

	_selectPage: function(e) {
		console.log('_selectFbPage: ', e);
		var value = e.target.value;
		var selectedPage = {};
		var pages = this.props.serviceParams.pages;

		pages.forEach(function(item) {
			if(item.id === value) selectedPage = item;
		});

		selectedPage.access_token = this.props.serviceParams.userAccessToken;

		this.setState({ selectedPage: selectedPage });
		this.props.onChange(selectedPage);
	},

	render: function() {
		var pages = this.props.serviceParams.pages;
		var frases = this.props.frases;
		
		console.log('FacebookTrunkComponent: ', pages);

		return (
			<div>
				{
					!pages ? (
						<div className="text-center">
							<p>Connect your Facebook account. You need a Facebook account with permissions to manage a published Facebook page.</p>
							<button className="btn btn-lg btn-primary" onClick={this.props.loginHandler}><i className="fa fa-fw fa-facebook"></i> Login with Facebook</button>
						</div>
					) : !pages.length ? (
						<div className="text-center">It seams that you haven't created or managed any Facebook Page yet. <a href="#">Learn how to create one</a> </div>
					) :
					(
						<form className="form-horizontal">
							<div className="form-group">
							    <label htmlFor="ctc-select-1" className="col-sm-4 control-label">Select Facebook Page</label>
							    <div className="col-sm-4">
							    	{
							    		this.props.disabled ? (
									    	<p className="form-control-static">{this.state.selectedPage.name}</p>
							    		) : (
							    			<select 
							    				className="form-control" 
							    				id="ctc-select-1" 
							    				value={this.state.selectedPage.id} 
							    				onChange={this._selectPage}
							    				disabled={this.props.disabled}
							    			>
							    				{
							    					pages.map(function(item) {

							    						return (

							    							<option key={item.id} value={item.id}>{item.name}</option>

							    						);

							    					})
							    				}
							    			</select>
							    		)
							    	}
							    </div>
							</div>
						</form>
					)
				}	
			</div>
		);
	}
});

FacebookTrunkComponent = React.createFactory(FacebookTrunkComponent);

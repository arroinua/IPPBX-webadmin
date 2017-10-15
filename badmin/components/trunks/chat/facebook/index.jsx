var FacebookTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		// loginHandler: React.PropTypes.func,
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			selectedPage: {},
			pages: null,
			userAccessToken: null,
			init: false
		};
	},

	componentWillMount: function() {
		console.log('FacebookTrunkComponent: ', this.props);

		this._initService();
		
		// this.setState({
		// 	selectedPage: this.props.properties || {}
		// });		
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_initService: function() {
		if(window.FB) {
			window.FB.getLoginStatus(this._updateStatusCallback);
		} else {
			this._getFacebookSDK(function() {
				window.FB.init({
					appId: this.props.serviceParams.params.appId,
					autoLogAppEvents: true,
					status: true,
					version: 'v2.9'
				});     
				window.FB.getLoginStatus(this._updateStatusCallback);
			}.bind(this));
		}
	},

	_getFacebookSDK: function(cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	},

	_updateStatusCallback: function(result) {
		console.log('updateStatusCallback: ', result);
		if(result.status === 'connected') {

			// get Facebook pages
			window.FB.api('/me/accounts', function(response) {
				this.setState({
					pages: response.data,
					userAccessToken: result.authResponse.accessToken,
					init: true
				});

				this._selectPage(this.props.properties.id || (response.data.length ? response.data[0].id : null));

			}.bind(this));
		} else {
			this.setState({
				init: true
			});
		}
	},

	_login: function() {
		window.FB.login(function(response) {
			console.log('window.FB.login: ', response);
			updateStatusCallback(response);
		}, {scope: 'email, manage_pages, read_page_mailboxes, pages_messaging'});
	},

	_selectPage: function(value) {
		
		var selectedPage = {};

		this.state.pages.forEach(function(item) {
			if(item.id === value) selectedPage = item;
		});

		// send user access token instead of page token
		selectedPage.access_token = this.state.userAccessToken;

		this.setState({ selectedPage: selectedPage });
		this.props.onChange(selectedPage);
	},

	_onChange: function(e) {
		console.log('_selectwindow.FBPage: ', e);
		var value = e.target.value;
		this._selectPage(value);
	},

	render: function() {
		var pages = this.state.pages;
		var frases = this.props.frases;
		
		console.log('FacebookTrunkComponent: ', pages);

		return (
			<div>
				{
					!this.state.init ? (

						<h3 className="text-center"><i className="fa fa-fw fa-spinner fa-spin"></i></h3>

					) : !pages ? (

						<div className="text-center">
							<p>{frases.CHAT_TRUNK.FACEBOOK.LOGIN_MSG}</p>
							<button className="btn btn-lg btn-primary" onClick={this._login}><i className="fa fa-fw fa-facebook"></i> Login with Facebook</button>
						</div>

					) : !pages.length ? (

						<div className="text-center">{frases.CHAT_TRUNK.FACEBOOK.NO_PAGES_MSG} <a href="#">{frases.CHAT_TRUNK.FACEBOOK.LEARN_MORE}</a> </div>

					) : (
						
						<form className="form-horizontal">
							<div className="form-group">
							    <label htmlFor="ctc-select-1" className="col-sm-4 control-label">{frases.CHAT_TRUNK.FACEBOOK.SELECT_PAGE}</label>
							    <div className="col-sm-4">
							    	{
							    		this.props.disabled ? (
									    	<p className="form-control-static">{this.state.selectedPage.name}</p>
							    		) : (
							    			<select 
							    				className="form-control" 
							    				id="ctc-select-1" 
							    				value={this.state.selectedPage.id} 
							    				onChange={this._onChange}
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

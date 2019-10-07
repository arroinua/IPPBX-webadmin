var FacebookTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		// onTokenReceived: React.PropTypes.func,
		// addSteps: React.PropTypes.func,
		// nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		validationError: React.PropTypes.bool
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
		var serviceParams = this.props.serviceParams;

		this.setState({
			userAccessToken: serviceParams.params.userAccessToken
		});

	},

	componentDidMount: function() {
		var frases = this.props.frases;

		// if(this.props.isNew && this.props.addSteps) {


		// 	this.props.addSteps([{
		// 		element: '.fb-button',
		// 		popover: {
		// 			title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].TITLE,
		// 			showButtons: false,
		// 			description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].DESC,
		// 			position: 'bottom'
		// 		}
		// 	}, {
		// 		element: '#ctc-select-1',
		// 		popover: {
		// 			title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].TITLE,
		// 			description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].DESC,
		// 			position: 'top'
		// 		}
		// 	}]);

		// }

		this._initService();

	},

	// shouldComponentUpdate: function(nextProps, nextState){
	//     // return a boolean value
	//     return !this.state.init && nextProps.isNew;
	// },

	_initService: function() {
		var props = this.props.properties;

		if(props && props.id) {
			this.setState({ init: true });

		} else if(this.state.userAccessToken) {
			this._getPages();

		// else if(window.FB) {
		// 	window.FB.getLoginStatus(this._updateStatusCallback);

		// } 

		} else {
			this.setState({
				init: true
			});
			// this._getFacebookSDK(function() {
			// 	window.FB.init({
			// 		appId: this.props.serviceParams.params.appId,
			// 		autoLogAppEvents: true,
			// 		// status: true,
			// 		version: 'v3.0'
			// 	});     
			// 	window.FB.getLoginStatus(this._updateStatusCallback);
			// }.bind(this));
		}
	},

	_getPages: function() {
		this._apiCall('/me/accounts', null, function(err, response) {
			this._setPages(response.data);
		}.bind(this));
	},

	_setPages: function(pages) {
		this.setState({
			pages: pages,
			init: true
		});

		this._selectPage(this.props.properties.id || (pages.length ? pages[0].id : null));

		// setTimeout(function() {
		// 	this.props.nextStep();
		// }.bind(this), 500);
	},

	_getFacebookSDK: function(cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	},

	_updateStatusCallback: function(result) {
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

	_apiCall: function(path, data, callback) {
		request('GET', 'https://graph.facebook.com/v3.1/'+path+'?access_token='+this.state.userAccessToken, data, null, callback);
	},

	_getSubscriptions: function() {
		var appId = this.props.serviceParams.params.appId;
		window.FB.api('/'+appId+'/subscriptions', function(response) {
			return true;

		}.bind(this));
	},

	_openAuthWindow: function(link) {
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
    	var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
		var windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	    var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
	    var poupHeight = 750;
	    var popupWidth = 650;
	    var left = ((windowWidth / 2) - (popupWidth / 2)) + dualScreenLeft;
	    var top = ((windowHeight / 2) - (popupWidth / 2)) + dualScreenTop;

		return window.open(
			link,
			"ServiceAuth",
			('height='+poupHeight+',width='+popupWidth+',top='+top+',left='+left)
		);
	},

	_login: function() {
		var params = this.props.serviceParams.params;
		var href = window.location.href;
		var search = href.indexOf('?');
		var state = search !== -1 ? btoa(href.substr(0, search)) : btoa(href);
		var fbscope = 'email, manage_pages, publish_pages, read_page_mailboxes, pages_messaging, pages_messaging_subscriptions, public_profile';
		var link = ("https://www.facebook.com/dialog/oauth?client_id="+params.appId+"&redirect_uri="+params.redirectUri+"&state="+state+'&scope='+fbscope);
		var authWindow = this._openAuthWindow(link);

		var scope = this;

		window.onTokenReceived = function(token) {
			authWindow.close();

			scope.setState({
				userAccessToken: token
			});

			scope._getPages();
			// scope.props.onTokenReceived(token);
		}

		// authWindow.onTokenReceived = function(token) {
		// 	authWindow.close();

		// 	scope.setState({
		// 		userAccessToken: token
		// 	});

		// 	scope._getPages();
		// 	scope.props.onTokenReceived(token);
		// }

		// window.location = "https://www.facebook.com/dialog/oauth?client_id=1920629758202993&redirect_uri=https://main.ringotel.net/chatbot/FacebookMessenger&state="+btoa(window.location.href);
		
		// window.FB.login(function(response) {
		// 	this._updateStatusCallback(response);
		// }.bind(this), {scope: 'email, manage_pages, publish_pages, read_page_mailboxes, pages_messaging, pages_messaging_subscriptions, public_profile'});
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
		var value = e.target.value;
		this._selectPage(value);
	},

	render: function() {
		var pages = this.state.pages;
		var frases = this.props.frases;
		var display = (pages && pages.length && this.props.isNew) ? 'block' : 'none';
		
		return (
			<div>
				{
					!this.state.init ? (

						<h3 className="text-center"><i className="fa fa-fw fa-spinner fa-spin"></i></h3>

					) : (this.props.properties && !this.props.isNew) ? (

						<form className="form-horizontal">
							<div className="form-group">
							    <label htmlFor="ctc-select-1" className="col-sm-4 control-label">{frases.CHAT_TRUNK.FACEBOOK.SELECTED_PAGE}</label>
							    <div className="col-sm-4">
									<p className="form-control-static">{this.props.properties.name}</p>
								</div>
							</div>
						</form>

					) : !pages ? (

						<div className="text-center">
							<p>{frases.CHAT_TRUNK.FACEBOOK.LOGIN_MSG}</p>
							<button className="btn btn-lg btn-primary fb-button" onClick={this._login}><i className="fa fa-fw fa-facebook"></i> Login with Facebook</button>
						</div>

					) : !pages.length ? (

						<div className="text-center">{frases.CHAT_TRUNK.FACEBOOK.NO_PAGES_MSG} <a href="#">{frases.CHAT_TRUNK.FACEBOOK.LEARN_MORE}</a> </div>

					) : null

				}

				<form className="form-horizontal" style={{ display: display }}>
					<div className={"form-group " + ((this.props.validationError && !this.state.selectedPage.id) ? 'has-error' : '')}>
					    <label htmlFor="ctc-select-1" className="col-sm-4 control-label">{frases.CHAT_TRUNK.FACEBOOK.SELECT_PAGE}</label>
					    <div className="col-sm-4">
					    	{
				    			<select 
				    				className="form-control" 
				    				id="ctc-select-1" 
				    				value={this.state.selectedPage.id} 
				    				onChange={this._onChange}
				    			>
				    				{
				    					pages && (
				    						pages.map(function(item) {

					    						return (

					    							<option key={item.id} value={item.id}>{item.name + " ("+item.category+")"}</option>

					    						);

					    					})
				    					)
					    					
				    				}
				    			</select>
					    	}
					    </div>
					</div>
				</form>

			</div>
		);
	}
});

FacebookTrunkComponent = React.createFactory(FacebookTrunkComponent);

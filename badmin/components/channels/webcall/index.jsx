var WebcallTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			data: {
				themeColor: '#33C3F0',
				title: (window.PbxObject.profile ? window.PbxObject.profile.company : this.props.frases.CHAT_TRUNK.WEBCALL.DEFAULT_TITLE_VALUE),
				chat: false,
				position: 'right',
				offer: false,
				channels: {
					webcall: {
						hotline: ""
					}
				}
			},
			// initFeatureValues: {
			// 	chat: true,
			// 	intro: [],
			// 	offer: {},
			// 	channels: {
			// 		callback: {},
			// 		webrtc: {}
			// 	}
			// },
			showSnippet: false
		};
	},

	componentWillMount: function() {
		var state = extend({}, this.state.data);
		var properties = this.props.properties || {};
		var allowedParams = 'themeColor|title|chat|position|offer|channels';
		var params = Object.keys(properties).reduce(function(result, key) { if(allowedParams.match(key)) result[key] = properties[key]; return result; }, {})
		
		data = extend(state, params);
		data.pageid = this.props.pageid;
		data.channels.webcall.hotline = this.props.pageid || "";
		this.setState({ data: data });
	},

	componentWillReceiveProps: function(props) {
		var state = extend({}, this.state.data);
		var properties = props.properties || {};
		var allowedParams = 'themeColor|title|chat|position|offer|channels';
		var params = Object.keys(properties).reduce(function(result, key) { if(allowedParams.match(key)) result[key] = properties[key]; return result; }, {})
		
		data = extend(state, params);
		data.pageid = props.pageid;
		data.channels.webcall.hotline = props.pageid || "";
		this.setState({ data: data });
	},

	_onChange: function(e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		if(target.name === 'callerid') {
			data.channels.webcall = data.channels.webcall || {};
			data.channels.webcall.callerid = value;
		} else {
			data[target.name] = value;
		}

		this.setState({
			data: data
		});

		this.props.onChange(data);

	},

	_getScriptBody: function() {
		return <WebchatScriptComponent frases={this.props.frases} params={this.state.data} />
	},

	_showCodeSnippet: function(e) {

		this.setState({ showSnippet: true });
	},

	_closeCodeSnippet: function() {
		this.setState({ showSnippet: false });	
	},

	_setFeature: function(feature, params) {
		var data = extend({}, this.state.data);
		if(feature.match('callback|webrtc')) data.channels[feature] = params;
		else data.offer = params;
		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_toggleFeature: function(feature, checked, initValue) {
		var data = extend({}, this.state.data);
		if(feature.match('callback|webrtc')) {
			if(checked) data.channels[feature] = initValue;
			else delete data.channels[feature]
		} else {
			data[feature] = initValue;
		}

		this.setState({ data: data });
		this.props.onChange(data);
	},

	render: function() {
		var data = this.state.data;
		var frases = this.props.frases;
		
		return (
			<div>
				<ModalComponent 
					title={frases.CHAT_TRUNK.WEBCALL.CODE_SNIPPET_MODAL_TITLE}
					open={this.state.showSnippet}
					onClose={this._closeCodeSnippet}
					body={this._getScriptBody()} 
				/>
				<form className="form-horizontal" autoComplete='off'>
					<div className="form-group">
						<label htmlFor="themeColor" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCALL.CODE_SNIPPET}</label>
						<div className="col-sm-8">
						  	<button type="button" className="btn btn-primary" disabled={!this.props.pageid} onClick={this._showCodeSnippet}>{frases.CHAT_TRUNK.WEBCALL.SHOW_CODE_BTN}</button>
						  	{
						  		!this.props.pageid && (
						  			<span className="text-mute"> {frases.CHAT_TRUNK.WEBCALL.SHOW_CODE_BTN_WARNING}</span>
						  		)	
						  	}
						</div>
					</div>
					<hr/>
					<div className="form-group">
					    <label htmlFor="title" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCALL.TITLE}</label>
					    <div className="col-sm-4">
					    	<input type="text" className="form-control" name="title" value={data.title} onChange={this._onChange} autoComplete='off' required />
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="position" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCALL.POSITION}</label>
					    <div className="col-sm-2">
					    	<select type="text" className="form-control" name="position" value={data.position} onChange={this._onChange}>
					    		<option value="right">{frases.CHAT_TRUNK.WEBCALL.RIGHT_POSITION}</option>
					    		<option value="left">{frases.CHAT_TRUNK.WEBCALL.LEFT_POSITION}</option>
					    	</select>
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="themeColor" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCALL.COLOR_THEME}</label>
					    <div className="col-sm-2">
					    	<input type="color" className="form-control" name="themeColor" value={data.themeColor} onChange={this._onChange} />
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="lang" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCALL.LANG}</label>
					    <div className="col-sm-4">
					    	<select type="text" className="form-control" name="lang" value={data.lang} onChange={this._onChange}>
					    		<option value="">{frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.AUTO}</option>
					    		<option value="en">{frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.EN}</option>
					    		<option value="uk">{frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.UK}</option>
					    		<option value="ru">{frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.RU}</option>
					    	</select>
					    </div>
					</div>
				</form>
				<hr/>
				<WebchatTrunkOfferSettsComponent frases={frases} params={data.offer} onChange={this._setFeature} toggleFeature={this._toggleFeature} />
			</div>
		);
	}
});

WebcallTrunkComponent = React.createFactory(WebcallTrunkComponent);

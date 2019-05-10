var WebchatTrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		pageid: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			data: {
				themeColor: '#33C3F0',
				title: (window.PbxObject.profile ? window.PbxObject.profile.company : this.props.frases.CHAT_TRUNK.WEBCHAT.DEFAULT_TITLE_VALUE),
				widget: true,
				chat: true,
				intro: [],
				introMessage: "",
				position: 'right',
				offer: false,
				channels: {}
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
			stepsShown: false,
			showSnippet: false
		};
	},

	componentWillMount: function() {
		var data = extend({}, this.state.data);
		data = extend(data, this.props.properties || {});
		data.pageid = this.props.pageid;
		data.introMessage = data.introMessage || this.props.frases.CHAT_TRUNK.WEBCHAT.INTRO_MESSAGE;
		this.setState({ data: data });
	},

	componentWillReceiveProps: function(props) {
		var data = extend({}, this.state.data);
		data = extend(data, props.properties || {});
		data.pageid = props.pageid;
		this.setState({ data: data });
	},

	_onChange: function(e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		data[target.name] = value;

		this.setState({
			data: data
		});

		this.props.onChange(data);

	},

	_getScriptBody: function() {
		return <WebchatScriptComponent frases={this.props.frases} params={{ pageid: this.props.pageid }} />
	},

	_showCodeSnippet: function(e) {

		this.setState({ showSnippet: true });
	},

	_closeCodeSnippet: function() {
		this.setState({ showSnippet: false });	
	},

	_setIntro: function(params) {
		var data = extend({}, this.state.data);
		data.intro = params;
		this.setState({
			data: data
		});

		this.props.onChange(data);
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
					title={frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_TITLE}
					open={this.state.showSnippet}
					onClose={this._closeCodeSnippet}
					body={this._getScriptBody()} 
				/>
				<form className="form-horizontal" autoComplete='off'>
					<div className="form-group">
						<label htmlFor="themeColor" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET}</label>
						<div className="col-sm-8">
						  	<button type="button" className="btn btn-primary" disabled={!this.props.pageid} onClick={this._showCodeSnippet}>{frases.CHAT_TRUNK.WEBCHAT.SHOW_CODE_BTN}</button>
						  	{
						  		!this.props.pageid && (
						  			<span className="text-mute"> {frases.CHAT_TRUNK.WEBCHAT.SHOW_CODE_BTN_WARNING}</span>
						  		)	
						  	}
						</div>
					</div>
					<div className="form-group">
					    <label htmlFor="origin" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.DOMAIN}</label>
					    <div className="col-sm-4">
					    	<input type="text" className="form-control" name="origin" value={data.origin} onChange={this._onChange} placeholder="example.com" autoComplete='off' required />
					    </div>
					</div>
					<hr/>
					<div className="form-group">
					    <label htmlFor="title" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.TITLE}</label>
					    <div className="col-sm-4">
					    	<input type="text" className="form-control" name="title" value={data.title} onChange={this._onChange} autoComplete='off' />
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="position" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.POSITION}</label>
					    <div className="col-sm-2">
					    	<select type="text" className="form-control" name="position" value={data.position} onChange={this._onChange} required>
					    		<option value="right">{frases.CHAT_TRUNK.WEBCHAT.RIGHT_POSITION}</option>
					    		<option value="left">{frases.CHAT_TRUNK.WEBCHAT.LEFT_POSITION}</option>
					    	</select>
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="themeColor" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.COLOR_THEME}</label>
					    <div className="col-sm-2">
					    	<input type="color" className="form-control" name="themeColor" value={data.themeColor} onChange={this._onChange} />
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="lang" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.LANG}</label>
					    <div className="col-sm-4">
					    	<select type="text" className="form-control" name="lang" value={data.lang} onChange={this._onChange} required>
					    		<option value="">{frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.AUTO}</option>
					    		<option value="en">{frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.EN}</option>
					    		<option value="uk">{frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.UK}</option>
					    		<option value="ru">{frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.RU}</option>
					    	</select>
					    </div>
					</div>
				</form>
				<hr/>
				<WebchatTrunkChatSettsComponent frases={frases} params={data.chat} onChange={this._setFeature} toggleFeature={this._toggleFeature} />
				<WebchatTrunkCallbackSettsComponent frases={frases} params={data.channels.callback} onChange={this._setFeature} toggleFeature={this._toggleFeature} />
				{
					data.chat ? (
						<WebchatTrunkIntroSettsComponent frases={frases} message={data.introMessage} consentText={data.consentText} fields={data.intro} onChange={this._onChange} setIntro={this._setIntro} />
					) : null
				}
				<WebchatTrunkOfferSettsComponent frases={frases} params={data.offer} onChange={this._setFeature} toggleFeature={this._toggleFeature} />
			</div>
		);
	}
});

WebchatTrunkComponent = React.createFactory(WebchatTrunkComponent);

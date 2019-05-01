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
				title: (window.PbxObject.profile ? window.PbxObject.profile.company : this.frases.CHAT_TRUNK.WEBCALL.DEFAULT_TITLE_VALUE),
				widget: true,
				chat: false,
				intro: [],
				introMessage: "",
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
		var data = extend({}, this.state.data);
		data = extend(data, this.props.properties || {});
		data.pageid = this.props.pageid;
		data.channels.webcall.hotline = this.props.pageid;
		this.setState({ data: data });
	},

	componentWillReceiveProps: function(props) {
		var data = extend({}, this.state.data);
		data = extend(data, props.properties || {});
		data.pageid = props.pageid;
		data.channels.webcall.hotline = props.pageid;
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
		return <WebchatScriptComponent frases={this.props.frases} params={this.state.data} />
	},

	_showCodeSnippet: function(e) {

		this.setState({ showSnippet: true });
	},

	_closeCodeSnippet: function() {
		this.setState({ showSnippet: false });	
	},

	render: function() {
		var data = this.state.data;
		var frases = this.props.frases;
		
		console.log('WebcallTrunkComponent data: ', data);

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
					    <label htmlFor="title" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.TITLE}</label>
					    <div className="col-sm-4">
					    	<input type="text" className="form-control" name="title" value={data.title} onChange={this._onChange} autoComplete='off' required />
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
			</div>
		);
	}
});

WebcallTrunkComponent = React.createFactory(WebcallTrunkComponent);

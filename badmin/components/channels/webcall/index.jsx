var WebcallTrunkComponent = React.createClass({

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
				widget: true,
				chat: false,
				position: 'right',
				channels: {
					webrtc: {}
				},
				offer: false
			},
			showSnippet: false
		};
	},

	componentWillMount: function() {
		var data = extend({}, this.state.data);
		data = extend(data, this.props.properties || {});
		data.pageid = this.props.pageid;
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
		console.log('_toggleFeature: ', feature, checked, initValue);
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
					    	<input type="text" className="form-control" name="origin" value={data.origin} onChange={this._onChange} autoComplete='off' required />
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
					    <div className="col-sm-4">
					    	<select type="text" className="form-control" name="position" value={data.position} onChange={this._onChange} required>
					    		<option value="right">{frases.CHAT_TRUNK.WEBCHAT.RIGHT_POSITION}</option>
					    		<option value="left">{frases.CHAT_TRUNK.WEBCHAT.LEFT_POSITION}</option>
					    	</select>
					    </div>
					</div>
					<div className="form-group">
					    <label htmlFor="themeColor" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.COLOR_THEME}</label>
					    <div className="col-sm-4">
					    	<input type="color" className="form-control" name="themeColor" value={data.themeColor} onChange={this._onChange} />
					    </div>
					</div>
				</form>
				<hr/>
				<WebchatTrunkOfferSettsComponent frases={frases} params={data.offer} onChange={this._setFeature} toggleFeature={this._toggleFeature} />
			</div>
		);
	}
});

WebchatTrunkComponent = React.createFactory(WebchatTrunkComponent);

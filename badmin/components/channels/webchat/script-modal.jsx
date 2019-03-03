var WebchatScriptComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			inBuffer: false
		}
	},

	_paramsToString: function(params) {
		return Object
		.keys(params)
		.reduce(function(result, key) {
			result[result.length] = (key+': '+(typeof params[key]==='string' ? '"'+params[key]+'"' : params[key]));
			return result;
		}, [])
		.join(',\n')
	},

	_getScriptString: function(params) {
		var paramsStr = [
			"<script>\n",
				"window.WchatSettings = {\n",
					(this._paramsToString(params)),
				"\n}",
			"\n</script>",
			"\n<script>\n",
				"(function(w,d,s,l,g,a,b,o){",
	    			"w[a]=w[a]||{};w[a].clientPath=w[a].clientPath||l;",
       				"if(w[g]){w[g](w[a]||{})}else{b=d.createElement(s),o=d.getElementsByTagName(s)[0];",
       				"b.async=1;b.src=l+'wchat.min.js';o.parentNode.insertBefore(b,o)}",
   				"})(window,document,'script','https://static.ringotel.co/wchat/v1/','Wchat','WchatSettings');",
   			"\n</script>"
		].join('');
		return paramsStr;
	},

	_copyToClipboard: function() {
		this.el.focus();
		this.el.select();

		var copied = document.execCommand('copy');
		if(copied && !this.state.inBuffer) {
			setTimeout(function() {
				this.setState({ inBuffer: false });
			}.bind(this), 5000);
			this._copied();
		}
	},

	_copied: function() {
		console.log('copied: ');
		this.setState({ inBuffer: !this.state.inBuffer });
	},

	_onRef: function(el) {
		this.el = el;
	},

	render: function() {
		var params = this.props.params;
		var frases = this.props.frases;
		var copyToClipboard = this._copyToClipboard;
		
		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<p>{frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_TEXT}</p>
						<button type="button" className="btn btn-default" onClick={copyToClipboard}>{this.state.inBuffer ? frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_COPIED_BTN : frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_COPY_BTN}</button>
						<p></p>
						<textarea ref={this._onRef} className="form-control" rows="15" value={this._getScriptString(this.props.params)} readOnly="true"></textarea>
					</div>
					
				</div>
			</div>
		);
	}
});

WebchatScriptComponent = React.createFactory(WebchatScriptComponent);

var SecuritySettings = React.createClass({

	propTypes: {
		params: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			ipcheck: false,
			iptable: []
		};
	},

	componentDidMount: function() {
		this.setState({ ipcheck: this.props.params.ipcheck, iptable: this.props.params.iptable });
	},

	_enableIpCheck: function(enabled, event) {
		var target = event.target;
		this.setState({ ipcheck: enabled });

		this.props.onChange({ ipcheck: enabled, iptable: this.state.iptable});
	},

	_addRule: function() {
		var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({iptable: iptable});
	},

	_updateRules: function(iptable) {
		this.setState({ iptable: iptable });

		this.props.onChange(this.state);
	},

	_deleteRule: function(index) {
		var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this.setState({ iptable: iptable });
	},

	render: function() {

		return (
			<form>
			    <div className="radio">
			        <label data-toggle="tooltip" title={this.props.frases.OPTS__IPCHECK}>
			            <input type="radio" checked={!this.state.ipcheck} onChange={this._enableIpCheck.bind(this, false)} /> {this.props.frases.SETTINGS.SECURITY.IPCHECK_DISABLE}
			        </label>
			    </div>
			    <div className="radio">
			        <label data-toggle="tooltip" title={this.props.frases.OPTS__IPCHECK}>
			            <input type="radio" checked={this.state.ipcheck} onChange={this._enableIpCheck.bind(this, true)} /> {this.props.frases.SETTINGS.SECURITY.IPCHECK_ENABLE}
			        </label>
			    </div>
			    <div className="form-group">
			        <IpTable frases={this.props.frases} iptable={this.state.iptable} deleteRuleHandler={this._deleteRule} addRuleHandler={this._addRule} updateRules={this._updateRules} />
			    </div>
			</form>
		);
	}
});

SecuritySettings = React.createFactory(SecuritySettings);

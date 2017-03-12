
var SecuritySettings = React.createClass({

	propTypes: {
		params: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			ipcheck: false,
			iptable: [],
			adminipcheck: false,
			adminiptable: []
		};
	},

	componentDidMount: function() {

		this._addRule(this.props.params.iptable);
		this._addRule(this.props.params.adminiptable);

		this.setState({
			ipcheck: this.props.params.ipcheck,
			iptable: this.props.params.iptable,
			adminipcheck: this.props.params.adminipcheck,
			adminiptable: this.props.params.adminiptable
		});
	},

	_enableIpCheck: function(enabled, event) {
		this.setState({ ipcheck: enabled });
		this.props.onChange({ 
			ipcheck: enabled, 
			iptable: this.state.iptable,
			adminipcheck: this.state.adminipcheck,
			adminiptable: this.state.adminiptable
		});
	},

	_enableAdminIpCheck: function(enabled, event) {
		this.setState({ adminipcheck: enabled });
		this.props.onChange({
			adminipcheck: enabled,
			adminiptable: this.state.adminiptable,
			ipcheck: this.state.ipcheck, 
			iptable: this.state.iptable
		});
	},

	_addRule: function(iptable) {
		// var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({iptable: iptable});
	},

	_updateRules: function(iptable) {
		this.setState({ iptable: iptable });
		this.props.onChange(this.state);
	},

	_deleteRule: function(iptable, index) {
		// var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this._updateRules(iptable);
		// this.setState({ iptable: iptable });
	},

	_addAdminRule: function(iptable) {
		// var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({adminiptable: iptable});
	},

	_updateAdminRules: function(iptable) {
		this.setState({ adminiptable: iptable });
		this.props.onChange(this.state);
	},

	_deleteAdminRule: function(iptable, index) {
		// var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this._updateAdminRules(iptable);
		// this.setState({ adminiptable: iptable });
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

			    { this.state.ipcheck ?
				    <div className="form-group">
				        <IpTable frases={this.props.frases} iptable={this.state.iptable} deleteRuleHandler={this._deleteRule} addRuleHandler={this._addRule} updateRules={this._updateRules} />
				    </div>
				: null }

				<hr/>

				<div className="radio">
			        <label>
			            <input type="radio" checked={!this.state.adminipcheck} onChange={this._enableAdminIpCheck.bind(this, false)} /> {this.props.frases.SETTINGS.SECURITY.ADMIN_IPCHECK_DISABLE}
			        </label>
			    </div>
			    <div className="radio">
			        <label>
			            <input type="radio" checked={this.state.adminipcheck} onChange={this._enableAdminIpCheck.bind(this, true)} /> {this.props.frases.SETTINGS.SECURITY.ADMIN_IPCHECK_ENABLE}
			        </label>
			    </div>

			    { this.state.adminipcheck ?
				    <div className="form-group">
				        <IpTable frases={this.props.frases} iptable={this.state.adminiptable} deleteRuleHandler={this._deleteAdminRule} addRuleHandler={this._addAdminRule} updateRules={this._updateAdminRules} />
				    </div>
				: null }
			</form>
		);
	}
});

SecuritySettings = React.createFactory(SecuritySettings);

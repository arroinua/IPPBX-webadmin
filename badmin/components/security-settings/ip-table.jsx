
var IpTable = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		iptable: React.PropTypes.array,
		addRuleHandler: React.PropTypes.func,
		deleteRuleHandler: React.PropTypes.func
	},

	_validateIp: function(string) {
		var value;
		var validIp = true;
		var bytes = string.split('.');

		value = bytes.map(function(str, index, array) {
			if(isNaN(str) || array.length > 4) {
				validIp = false;
			} else if(str.length > 3) {
				if(array.length === 4) validIp = false;
				else str = str.substring(0, 3) + '.' + str.substring(3);
			}
			
			return str;

		}).join('.');

		if(!validIp) return false;

		return value;
	},

	_handleRuleChange: function(ruleIndex, event) {
		var target = event.target;
		var name = target.name;
		var value = this._validateIp(target.value);
		var iptable = this.props.iptable;
		var rule = iptable[ruleIndex];

		if(value === false) return;

		rule[name] = value;

		this.props.updateRules(iptable);

	},

	_deleteRule: function(index) {
		this.props.deleteRuleHandler(index);
	},

	render: function() {

		return (
			<div>
				<table className="table table-condensed">
					<thead>
						<tr>
							<th>{this.props.frases.SETTINGS.SECURITY.NETWORK}</th>
							<th>{this.props.frases.SETTINGS.SECURITY.NETMASK}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{ this.props.iptable.map(function(rule, index) {
							return <IpTableRowComponent key={index} rule={rule} onClick={this._deleteRule.bind(this, index)} onChange={this._handleRuleChange.bind(this, index)} />
						
						}.bind(this)) }
					</tbody>
				</table>
				<button type="button" className="btn btn-default btn-block" onClick={this.props.addRuleHandler}>{this.props.frases.SETTINGS.SECURITY.ADD_RULE}</button>
			</div>
		);
	}
});

IpTable = React.createFactory(IpTable);

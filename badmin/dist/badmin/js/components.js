function ExportButtons(props) {

	function excelHandler() {
		console.log('excelHandler', document.getElementById(props.id));
		return ExcellentExport.excel(this, props.id, 'report');
	}
	function csvHandler() {
		return ExcellentExport.csv(this, props.id);
	}

	return React.createElement(
		'div',
		null,
		React.createElement(
			'span',
			null,
			props.frases.EXPORT,
			':'
		),
		React.createElement(
			'a',
			{ href: '#', style: { margin: '7px' }, className: 'btn btn-default btn-sm', download: props.frases.REPORT + '.xls', onClick: excelHandler },
			'.xls'
		),
		React.createElement(
			'a',
			{ href: '#', style: { margin: '7px' }, className: 'btn btn-default btn-sm', download: props.frases.REPORT + '.csv', onClick: csvHandler },
			'.csv'
		)
	);
}

var ModalComponent = React.createClass({
	displayName: 'ModalComponent',


	submitModal: function () {
		$('#' + this.props.id).modal('close');
		this.props.submit(this.props.id);
	},

	render: function () {

		console.log('ModalComponent: ', this.props.children);

		return React.createElement(
			'div',
			{ className: 'modal fade', id: this.props.id, tabIndex: '-1', role: 'dialog', 'aria-labelledby': this.props.title },
			React.createElement(
				'div',
				{ className: "modal-dialog " + (this.props.size ? "modal-" + this.props.size : ""), role: 'document' },
				React.createElement(
					'div',
					{ className: 'modal-content' },
					this.props.title ? React.createElement(
						'div',
						{ className: 'modal-header' },
						React.createElement(
							'button',
							{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-label': 'Close' },
							React.createElement(
								'span',
								{ 'aria-hidden': 'true' },
								'\xD7'
							)
						),
						React.createElement(
							'h4',
							{ className: 'modal-title' },
							this.props.title
						)
					) : React.createElement(
						'div',
						{ className: 'modal-header standalone' },
						React.createElement(
							'button',
							{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-label': 'Close' },
							React.createElement(
								'span',
								{ 'aria-hidden': 'true' },
								'\xD7'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'modal-body' },
						this.props.body || this.props.children
					),
					this.props.submit ? React.createElement(
						'div',
						{ className: 'modal-footer' },
						React.createElement(
							'button',
							{ className: 'btn btn-primary', onClick: this.submitModal },
							'Submit & Close'
						)
					) : null
				)
			)
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);

var ObjectRoute = React.createClass({
	displayName: "ObjectRoute",


	propTypes: {
		getOptions: React.PropTypes.func,
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		// clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			route: {},
			routeId: "",
			options: []
		};
	},

	componentDidMount: function () {
		var options = [],
		    route = this.props.routes.length ? this.props.routes[0] : null;

		this.props.getOptions(function (result) {
			options = result.sort().map(function (item) {
				return { value: item, label: item };
			});

			options.unshift({ value: 0, label: this.props.frases.SELECT_ROUTE });

			// set route options
			this.setState({ options: options });

			// select route and set current route oid
			if (route && route.id) {
				this.setState({ routeId: route.id });
				this._onChange({ value: route.ext, label: route.ext });
			} else {
				this._onChange(options[0]);
			}
		}.bind(this));
	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getRouteObj: function (ext) {
		var currRouteObj = {
			ext: ext
		};

		if (this.state.routeId) currRouteObj.oid = this.state.routeId;

		return currRouteObj;

		// var routeObj = this.props.routes.map(function(item) {
		// 	if(item.ext === ext) return item;
		// });

		// console.log('_getRouteObj: ', routeObj);

		// return (routeObj.length ? routeObj[0] : { ext: ext })
	},

	_onChange: function (val) {
		console.log('Select: ', val);
		if (!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function () {

		return (
			// <PanelComponent>
			// <label htmlFor="form-field-name">Route</label>
			React.createElement(Select, {
				name: "form-field-name",
				className: "obj-route-select",
				clearable: false,
				value: this.state.route,
				options: this.state.options,
				onChange: this._onChange
			})
			// </PanelComponent>

		);
	}
});

ObjectRoute = React.createFactory(ObjectRoute);
function PanelComponent(props) {

	return React.createElement(
		"div",
		{ className: "panel" },
		props.header && React.createElement(
			"div",
			{ className: "panel-header" },
			" ",
			props.header,
			React.createElement("i", { className: "fa fa-chevron-down" })
		),
		React.createElement(
			"div",
			{ className: "panel-body" },
			props.children
		)
	);
}
function IpTableRowComponent(props) {

	return React.createElement(
		"tr",
		null,
		React.createElement(
			"td",
			null,
			React.createElement("input", { className: "form-control", name: "net", value: props.rule.net, onBlur: props.onBlur, onChange: props.onChange })
		),
		React.createElement(
			"td",
			null,
			React.createElement("input", { className: "form-control", name: "mask", value: props.rule.mask, onBlur: props.onBlur, onChange: props.onChange })
		),
		React.createElement(
			"td",
			null,
			React.createElement(
				"button",
				{ type: "button", className: "btn btn-default btn-link", onClick: props.onClick },
				React.createElement("i", { className: "fa fa-remove text-muted" })
			)
		)
	);
}

var IpTable = React.createClass({
	displayName: 'IpTable',


	propTypes: {
		frases: React.PropTypes.object,
		iptable: React.PropTypes.array,
		addRuleHandler: React.PropTypes.func,
		deleteRuleHandler: React.PropTypes.func
	},

	_validateIp: function (string) {
		var value;
		var validIp = true;
		var bytes = string.split('.');

		value = bytes.map(function (str, index, array) {
			if (isNaN(str) || array.length > 4) {
				validIp = false;
			} else if (str.length > 3) {
				if (array.length === 4) validIp = false;else {
					str = str.substring(0, 3) + '.' + str.substring(3);
				}
			}

			return str;
		}).join('.');

		if (!validIp) return false;

		return value;
	},

	_handleOnBlur: function (ruleIndex, event) {
		var target = event.target;
		var name = target.name;
		var value = target.value;
		var iptable = this.props.iptable;
		var rule = iptable[ruleIndex];
		var bytes = value ? value.split('.') : [];
		var emptyBytes = 4 - bytes.length;

		if (emptyBytes) {
			for (var i = 0; i < emptyBytes; i++) {
				bytes.push('0');
			}
		}

		rule[name] = bytes.join('.');
		this.props.updateRules(iptable);
	},

	_addRule: function () {
		this.props.addRuleHandler(this.props.iptable);
	},

	_handleRuleChange: function (ruleIndex, event) {
		var target = event.target;
		var name = target.name;
		var value = this._validateIp(target.value);
		var iptable = this.props.iptable;
		var rule = iptable[ruleIndex];

		if (value === false) return;

		rule[name] = value;

		this.props.updateRules(iptable);
	},

	_deleteRule: function (index) {
		this.props.deleteRuleHandler(this.props.iptable, index);
	},

	render: function () {

		return React.createElement(
			'div',
			null,
			React.createElement(
				'table',
				{ className: 'table table-condensed' },
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'th',
							null,
							this.props.frases.SETTINGS.SECURITY.NETWORK
						),
						React.createElement(
							'th',
							null,
							this.props.frases.SETTINGS.SECURITY.NETMASK
						),
						React.createElement('th', null)
					)
				),
				React.createElement(
					'tbody',
					null,
					this.props.iptable.map(function (rule, index) {
						return React.createElement(IpTableRowComponent, { key: index, rule: rule, onBlur: this._handleOnBlur.bind(this, index), onClick: this._deleteRule.bind(this, index), onChange: this._handleRuleChange.bind(this, index) });
					}.bind(this))
				)
			),
			React.createElement(
				'button',
				{ type: 'button', className: 'btn btn-default btn-block', onClick: this._addRule },
				this.props.frases.SETTINGS.SECURITY.ADD_RULE
			)
		);
	}
});

IpTable = React.createFactory(IpTable);

var SecuritySettings = React.createClass({
	displayName: 'SecuritySettings',


	propTypes: {
		params: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			ipcheck: false,
			iptable: [],
			adminipcheck: false,
			adminiptable: []
		};
	},

	componentDidMount: function () {

		this._addRule(this.props.params.iptable);
		this._addRule(this.props.params.adminiptable);

		this.setState({
			ipcheck: this.props.params.ipcheck,
			iptable: this.props.params.iptable,
			adminipcheck: this.props.params.adminipcheck,
			adminiptable: this.props.params.adminiptable
		});
	},

	_enableIpCheck: function (enabled, event) {
		this.setState({ ipcheck: enabled });
		this.props.onChange({
			ipcheck: enabled,
			iptable: this.state.iptable,
			adminipcheck: this.state.adminipcheck,
			adminiptable: this.state.adminiptable
		});
	},

	_enableAdminIpCheck: function (enabled, event) {
		this.setState({ adminipcheck: enabled });
		this.props.onChange({
			adminipcheck: enabled,
			adminiptable: this.state.adminiptable,
			ipcheck: this.state.ipcheck,
			iptable: this.state.iptable
		});
	},

	_addRule: function (iptable) {
		// var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({ iptable: iptable });
	},

	_updateRules: function (iptable) {
		this.setState({ iptable: iptable });
		this.props.onChange(this.state);
	},

	_deleteRule: function (iptable, index) {
		// var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this._updateRules(iptable);
		// this.setState({ iptable: iptable });
	},

	_addAdminRule: function (iptable) {
		// var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({ adminiptable: iptable });
	},

	_updateAdminRules: function (iptable) {
		this.setState({ adminiptable: iptable });
		this.props.onChange(this.state);
	},

	_deleteAdminRule: function (iptable, index) {
		// var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this._updateAdminRules(iptable);
		// this.setState({ adminiptable: iptable });
	},

	render: function () {

		return React.createElement(
			'form',
			null,
			React.createElement(
				'div',
				{ className: 'radio' },
				React.createElement(
					'label',
					{ 'data-toggle': 'tooltip', title: this.props.frases.OPTS__IPCHECK },
					React.createElement('input', { type: 'radio', checked: !this.state.ipcheck, onChange: this._enableIpCheck.bind(this, false) }),
					' ',
					this.props.frases.SETTINGS.SECURITY.IPCHECK_DISABLE
				)
			),
			React.createElement(
				'div',
				{ className: 'radio' },
				React.createElement(
					'label',
					{ 'data-toggle': 'tooltip', title: this.props.frases.OPTS__IPCHECK },
					React.createElement('input', { type: 'radio', checked: this.state.ipcheck, onChange: this._enableIpCheck.bind(this, true) }),
					' ',
					this.props.frases.SETTINGS.SECURITY.IPCHECK_ENABLE
				)
			),
			this.state.ipcheck ? React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(IpTable, { frases: this.props.frases, iptable: this.state.iptable, deleteRuleHandler: this._deleteRule, addRuleHandler: this._addRule, updateRules: this._updateRules })
			) : null,
			React.createElement('hr', null),
			React.createElement(
				'div',
				{ className: 'radio' },
				React.createElement(
					'label',
					null,
					React.createElement('input', { type: 'radio', checked: !this.state.adminipcheck, onChange: this._enableAdminIpCheck.bind(this, false) }),
					' ',
					this.props.frases.SETTINGS.SECURITY.ADMIN_IPCHECK_DISABLE
				)
			),
			React.createElement(
				'div',
				{ className: 'radio' },
				React.createElement(
					'label',
					null,
					React.createElement('input', { type: 'radio', checked: this.state.adminipcheck, onChange: this._enableAdminIpCheck.bind(this, true) }),
					' ',
					this.props.frases.SETTINGS.SECURITY.ADMIN_IPCHECK_ENABLE
				)
			),
			this.state.adminipcheck ? React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(IpTable, { frases: this.props.frases, iptable: this.state.adminiptable, deleteRuleHandler: this._deleteAdminRule, addRuleHandler: this._addAdminRule, updateRules: this._updateAdminRules })
			) : null
		);
	}
});

SecuritySettings = React.createFactory(SecuritySettings);

var TrunkIncRoute = React.createClass({
	displayName: 'TrunkIncRoute',


	propTypes: {
		options: React.PropTypes.array,
		route: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			route: {},
			options: []
		};
	},

	componentDidMount: function () {

		options = this.props.options.sort().map(this._toRouteObj);

		options.unshift({ value: 0, label: this.props.frases.TRUNK.INC_ROUTE_DEFAULT_OPTION });

		this.setState({ options: options });

		// select route and set current route oid
		if (this.props.route) {
			this._onChange(this._toRouteObj(this.props.route));
		} else {
			this._onChange(options[0]);
		}
	},

	_toRouteObj: function (item) {
		return { value: item.ext, label: item.name ? item.ext + ' - ' + item.name : item.ext };
	},

	_getRouteObj: function (ext) {
		var currRouteObj = {
			ext: ext
		};

		return currRouteObj;
	},

	_onChange: function (val) {
		console.log('Select: ', val);
		if (!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function () {

		return (
			// <PanelComponent>
			// <label htmlFor="form-field-name">Route</label>
			React.createElement(Select, {
				name: 't-inc-route',
				clearable: false,
				value: this.state.route,
				options: this.state.options,
				onChange: this._onChange
			})
			// </PanelComponent>

		);
	}

});

TrunkIncRoute = React.createFactory(TrunkIncRoute);

var TrunkOutRoute = React.createClass({
	displayName: 'TrunkOutRoute',


	propTypes: {
		rule: React.PropTypes.object,
		ruleIndex: React.PropTypes.number,
		deleteRule: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			rule: {},
			options: []
		};
	},

	componentDidMount: function () {

		var options = [{
			value: 1,
			label: 'starting with prefix'
		}, {
			value: 2,
			label: 'with a number length of'
		}];

		this.setState({ options: options });
		this.setState({ rule: this.props.rule });
	},

	_onChange: function (val) {
		console.log('on rule change: ', val);
		this.setState({ rule: val });
	},

	render: function () {

		return React.createElement(
			'div',
			{ className: 'input-group' },
			React.createElement(
				'span',
				{ className: 'input-group-addon tout-route-row' },
				React.createElement(Select, {
					name: 't-out-route',
					clearable: false,
					value: this.state.rule,
					options: this.state.options,
					onChange: this._onChange
				})
			),
			this.state.rule.value === 1 && React.createElement('input', { name: 'oroute-prefix', className: 'form-control' }),
			this.state.rule.value === 2 && React.createElement('input', { type: 'number', name: 'oroute-numlength', className: 'form-control' }),
			this.state.rule.value && React.createElement(
				'span',
				{ className: 'input-group-addon' },
				React.createElement(
					'button',
					{ type: 'button', className: 'btn btn-default', onClick: this.props._deleteRule(this.props.ruleIndex) },
					React.createElement('span', { className: 'fa fa-remove' })
				)
			)
		);
	}

});

TrunkOutRoute = React.createFactory(TrunkOutRoute);

var TrunkOutRoutes = React.createClass({
	displayName: 'TrunkOutRoutes',


	propTypes: {
		// options: React.PropTypes.array,
		// route: React.PropTypes.object,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			rules: []
		};
	},

	// componentDidMount: function() {

	// },

	_addRule: function () {
		console.log('_addRule');

		var rules = this.state.rules;
		var route = {
			rule: 0,
			value: ''
		};

		rules.push(route);

		this.setState({ rules: rules });
	},

	_deleteRule: function (index) {
		if (index === undefined) return;
		this.state.rules.splice(index, 1);
	},

	render: function () {

		return React.createElement(
			'div',
			{ className: 'tout-routes-cont' },
			this.state.rules.map(function (rule, index) {
				console.log('rules: ', rule);
				return React.createElement(TrunkOutRoute, { rule: rule, ruleIndex: index, deleteRule: this._deleteRule });
			}.bind(this)),
			React.createElement(
				'button',
				{ type: 'button', className: 'btn btn-link', onClick: this._addRule },
				'+ ',
				this.props.frases.TRUNK.ADD_RULE
			)
		);
	}

});

TrunkOutRoutes = React.createFactory(TrunkOutRoutes);

var TrunksQosTable = React.createClass({
	displayName: "TrunksQosTable",


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		utils: React.PropTypes.object
	},

	_setDefaultValue: function (item) {
		item.in = Object.keys(item.in).forEach(function (key, index) {
			item.in[key] = item.in[key] || 0;
		});
		item.out = Object.keys(item.out).forEach(function (key, index) {
			item.out[key] = item.out[key] || 0;
		});

		return item;
	},

	_formatTimeString: function (value, format) {
		return this.props.utils.formatTimeString(value, format);
	},

	render: function () {
		var frases = this.props.frases.STATISTICS;
		var data = this.props.data;

		return React.createElement(
			"div",
			{ className: "table-responsive" },
			React.createElement(
				"table",
				{ className: "table table-hover", id: "trunks-qos-statistics" },
				React.createElement(
					"thead",
					null,
					React.createElement(
						"tr",
						null,
						React.createElement(
							"th",
							{ rowSpan: "2", style: { verticalAlign: 'middle' } },
							this.props.frases.TRUNK.TRUNK
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.TC, className: "initialism" },
								"TC"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.CC, className: "initialism" },
								"CC"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.ACD, className: "initialism" },
								"ACD"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.JFE, className: "initialism" },
								"JFE"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.JNE, className: "initialism" },
								"JNE"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.LAT, className: "initialism" },
								"LAT"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.LFE, className: "initialism" },
								"LFE,%"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.LNE, className: "initialism" },
								"LNE,%"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.MFE, className: "initialism" },
								"MFE"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.MNE, className: "initialism" },
								"MNE"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.RFE, className: "initialism" },
								"RFE"
							)
						),
						React.createElement(
							"th",
							null,
							React.createElement(
								"abbr",
								{ title: frases.TRNUK_QOS.RNE, className: "initialism" },
								"RNE"
							)
						)
					),
					React.createElement(
						"tr",
						null,
						React.createElement(
							"th",
							{ className: "text-center", colSpan: "12" },
							frases.INCOMING_CALLS,
							"/",
							frases.OUTGOING_CALLS
						)
					)
				),
				React.createElement(
					"tbody",
					null,
					data.map(function (item, index) {
						return React.createElement(
							"tr",
							{ key: index },
							React.createElement(
								"td",
								null,
								item.trunk
							),
							React.createElement(
								"td",
								null,
								item.in.tc || 0,
								"/",
								item.out.tc || 0
							),
							React.createElement(
								"td",
								null,
								item.in.cc || 0,
								"/",
								item.out.cc || 0
							),
							React.createElement(
								"td",
								null,
								this._formatTimeString(item.in.acd || 0, 'hh:mm:ss'),
								"/",
								this._formatTimeString(item.out.acd || 0, 'hh:mm:ss')
							),
							React.createElement(
								"td",
								null,
								item.in.lat !== undefined ? item.in.lat : '-',
								"/",
								item.out.lat !== undefined ? item.out.lat : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.jfe !== undefined ? item.in.jfe : '-',
								"/",
								item.out.jfe !== undefined ? item.out.jfe : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.jne !== undefined ? item.in.jne : '-',
								"/",
								item.out.jne !== undefined ? item.out.jne : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.lfe !== undefined ? item.in.lfe : '-',
								"/",
								item.out.lfe !== undefined ? item.out.lfe : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.lne !== undefined ? item.in.lne : '-',
								"/",
								item.out.lne !== undefined ? item.out.lne : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.mfe !== undefined ? item.in.mfe.toFixed(1) : '-',
								"/",
								item.out.mfe !== undefined ? item.out.mfe.toFixed(1) : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.mne !== undefined ? item.in.mne.toFixed(1) : '-',
								"/",
								item.out.mne !== undefined ? item.out.mne.toFixed(1) : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.rfe !== undefined ? item.in.rfe.toFixed(1) : '-',
								"/",
								item.out.rfe !== undefined ? item.out.rfe.toFixed(1) : '-'
							),
							React.createElement(
								"td",
								null,
								item.in.rne !== undefined ? item.in.rne.toFixed(1) : '-',
								"/",
								item.out.rne !== undefined ? item.out.rne.toFixed(1) : '-'
							)
						);
					}, this)
				)
			)
		);
	}
});

TrunksQosTable = React.createFactory(TrunksQosTable);

var AddCallGroup = React.createClass({
	displayName: 'AddCallGroup',


	propTypes: {
		step: React.PropTypes.object,
		frases: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			step: {}
		};
	},

	getInitialState: function () {
		return {};
	},

	_chooseGroup: function (type) {
		window.location.hash = '#' + type + '?' + type;
		console.log('close Modal: ', this.props.step.name, $('#' + this.props.step.name));
		$('#' + this.props.step.name).modal('hide');
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'div',
						{ className: 'gs-item', onClick: this._chooseGroup.bind(this, 'hunting') },
						React.createElement(
							'h3',
							null,
							React.createElement('i', { className: 'icon-find_replace' })
						),
						React.createElement(
							'h3',
							null,
							frases.GET_STARTED.STEPS.B.MODAL.OPTION_1.TITLE
						),
						React.createElement(
							'p',
							null,
							frases.GET_STARTED.STEPS.B.MODAL.OPTION_1.DESC
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'div',
						{ className: 'gs-item', onClick: this._chooseGroup.bind(this, 'icd') },
						React.createElement(
							'h3',
							null,
							React.createElement('i', { className: 'icon-headset_mic' })
						),
						React.createElement(
							'h3',
							null,
							frases.GET_STARTED.STEPS.B.MODAL.OPTION_2.TITLE
						),
						React.createElement(
							'p',
							null,
							frases.GET_STARTED.STEPS.B.MODAL.OPTION_2.DESC
						)
					)
				)
			)
		);
	}
});

AddCallGroup = React.createFactory(AddCallGroup);

var AddExtGroup = React.createClass({
	displayName: "AddExtGroup",

	render: function () {
		return React.createElement(
			"div",
			{ className: "text-center" },
			React.createElement(
				"h1",
				null,
				React.createElement("i", { className: "fa fa-user" })
			),
			React.createElement(
				"h4",
				null,
				"Add extensions for company employees. Users could be registered with Ringotel's apps. Create Equipment group, in order to connect third-party SIP softphones, IP phones, etc."
			)
		);
	}
});

AddExtGroup = React.createFactory(AddExtGroup);

var AddExtensions = React.createClass({
	displayName: 'AddExtensions',


	propTypes: {
		step: React.PropTypes.object,
		frases: React.PropTypes.object
	},

	getDefaultProps: function () {
		step: {}
	},

	getInitialState: function () {
		return {
			extensions: []
		};
	},

	_chooseGroup: function (type) {
		window.location.hash = '#' + type + '?' + type;
		console.log('close Modal: ', this.props.step.name, $('#' + this.props.step.name));
		$('#' + this.props.step.name).modal('hide');
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row ' },
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'div',
						{ className: 'gs-item', onClick: this._chooseGroup.bind(this, 'users') },
						React.createElement(
							'h3',
							null,
							React.createElement('i', { className: 'fa fa-user' })
						),
						React.createElement(
							'h3',
							null,
							frases.GET_STARTED.STEPS.A.MODAL.OPTION_1.TITLE
						),
						React.createElement(
							'p',
							null,
							frases.GET_STARTED.STEPS.A.MODAL.OPTION_1.DESC
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'div',
						{ className: 'gs-item', onClick: this._chooseGroup.bind(this, 'equipment') },
						React.createElement(
							'h3',
							null,
							React.createElement('i', { className: 'fa fa-fax' })
						),
						React.createElement(
							'h3',
							null,
							frases.GET_STARTED.STEPS.A.MODAL.OPTION_2.TITLE
						),
						React.createElement(
							'p',
							null,
							frases.GET_STARTED.STEPS.A.MODAL.OPTION_2.DESC
						)
					)
				)
			)
		);
	}
});

AddExtensions = React.createFactory(AddExtensions);

var AddTrunk = React.createClass({
	displayName: 'AddTrunk',


	propTypes: {
		step: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			step: {}
		};
	},

	getInitialState: function () {
		return {};
	},

	_addNewTrunk: function () {
		window.location.hash = '#trunk?trunk';
		$('#' + this.props.step.name).modal('hide');
	},

	render: function () {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12 text-center' },
					React.createElement(
						'h4',
						null,
						this.props.step.title
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12 text-center' },
					React.createElement(
						'button',
						{ onClick: this._addNewTrunk, className: 'btn btn-primary btn-xl' },
						React.createElement('i', { className: 'fa fa-cloud' }),
						' Add Trunk'
					),
					React.createElement('br', null),
					React.createElement('br', null)
				)
			)
		);
	}
});

AddTrunk = React.createFactory(AddTrunk);

var NewExtensions = React.createClass({
	displayName: "NewExtensions",


	propTypes: {},

	getDefaultProps: function () {},

	getInitialState: function () {
		return {
			extensions: {}
		};
	},

	_getAvailableExtensions: function () {},

	_addExtension: function () {
		console.log('addExtension: ');
	},

	render: function () {
		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"div",
						{ className: "text-center" },
						React.createElement(
							"h1",
							null,
							React.createElement("i", { className: "fa fa-user" })
						),
						React.createElement(
							"h4",
							null,
							"Add extensions for company employees. Users could be registered with Ringotel's apps. Create Equipment group, in order to connect third-party SIP softphones, IP phones, etc."
						)
					),
					React.createElement("hr", null)
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-sm-6" },
					React.createElement(
						"div",
						{ className: "form-group" },
						React.createElement(
							"label",
							{ htmlFor: "available-users", className: "col-lg-4 control-label", "data-toggle": "tooltip", title: "{{EXT_SETTS__EXTENSION}}" },
							"NUMBER"
						),
						React.createElement(
							"div",
							{ className: "col-lg-4" },
							React.createElement("select", { id: "available-users", className: "form-control select2" })
						)
					)
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "user-name", className: "col-lg-4 control-label", "data-toggle": "tooltip", title: "{{EXT_SETTS__NAME}}" },
						"NAME"
					),
					React.createElement(
						"div",
						{ className: "col-lg-8" },
						React.createElement("input", { type: "text", className: "form-control", id: "user-name", placeholder: "{{NAME}}" })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "user-dname", className: "col-lg-4 control-label", "data-toggle": "tooltip", title: "{{EXT_SETTS__DISPLAY_NAME}}" },
						"DISPLAY"
					),
					React.createElement(
						"div",
						{ className: "col-lg-8" },
						React.createElement(
							"div",
							{ className: "input-group" },
							React.createElement("input", { type: "text", className: "form-control", id: "user-alias", placeholder: "{{ DISPLAY}}" }),
							React.createElement(
								"span",
								{ className: "input-group-btn" },
								React.createElement(
									"button",
									{ type: "button", className: "btn btn-default" },
									React.createElement("i", { className: "fa fa-exchange", "data-toggle": "tooltip", title: "{{COPY}}" })
								)
							)
						)
					)
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "user-pass", className: "col-lg-4 control-label", "data-toggle": "tooltip", title: "{{EXT_SETTS__PASSWORD}}" },
						"PASSWORD"
					),
					React.createElement(
						"div",
						{ className: "col-lg-8" },
						React.createElement(
							"div",
							{ className: "input-group" },
							React.createElement("input", { type: "password", name: "trunk", className: "form-control", id: "user-pass", placeholder: "{{PASSWORD}}" }),
							React.createElement(
								"span",
								{ className: "input-group-btn" },
								React.createElement(
									"button",
									{ type: "button", className: "btn btn-default" },
									React.createElement("i", { className: "fa fa-eye", "data-toggle": "tooltip", title: "{{REVEAL_PWD}}" })
								),
								React.createElement(
									"button",
									{ type: "button", className: "btn btn-default" },
									React.createElement("i", { className: "fa fa-refresh", "data-toggle": "tooltip", title: "{{GENERATE_PWD}}" })
								)
							)
						)
					)
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"button",
						{ className: "btn btn-primary", onClick: this._addExtension },
						"Add extensiosn"
					)
				)
			)
		);
	}
});

NewExtensions = React.createFactory(NewExtensions);

var GsStep = React.createClass({
	displayName: 'GsStep',


	propTypes: {
		step: React.PropTypes.object,
		frases: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			step: {}
		};
	},

	getInitialState: function () {
		return {
			done: false
		};
	},

	_loadStep: function () {
		var step = this.props.step;
		var frases = this.props.frases;
		var stepCont = document.createElement('div');
		var Step = function () {
			var comp;
			switch (step.component) {
				case 'AddExtensions':
					comp = React.createElement(AddExtensions, { step: step, frases: frases });
					break;
				case 'AddCallGroup':
					comp = React.createElement(AddCallGroup, { step: step, frases: frases });
					break;
				// case 'AddTrunk':
				// 	comp = <AddTrunk step={step} />;
				// 	break;
			};

			console.log('loadStep: ', step, comp);

			if (!comp) return null;else {
				return React.createElement(ModalComponent, {
					id: step.name,
					title: step.title,
					size: 'lg',
					body: comp
					// submit={ this._stepDone }
				});
			}
		};

		document.body.appendChild(stepCont);

		ReactDOM.render(React.createFactory(Step)({
			step: step
		}), stepCont);

		$('#' + step.name).modal();
	},

	_stepDone: function () {
		this.setState({
			done: true
		});
	},

	render: function () {
		var stepDone = this.props.step.done;
		return React.createElement(
			'li',
			{ className: "gs-item " + (stepDone ? "gs-done" : ""), onClick: this.props.step.onClick ? this.props.step.onClick : this._loadStep },
			React.createElement(
				'div',
				{ className: 'gs-item-header' },
				React.createElement('i', { className: this.props.step.icon }),
				' ',
				this.props.step.title,
				React.createElement(
					'span',
					{ className: stepDone ? "fa-stack" : "hidden", style: { position: 'absolute', top: '5px', right: '5px' } },
					React.createElement('i', { className: 'fa fa-circle fa-stack-2x text-success' }),
					React.createElement('i', { className: 'fa fa-check fa-stack-1x text-white' })
				)
			),
			React.createElement(
				'div',
				{ className: 'gs-item-body' },
				React.createElement(
					'p',
					null,
					this.props.step.desc
				)
			)
		);
	}
});

GsStep = React.createFactory(GsStep);

var WelcomeModal = React.createClass({
	displayName: 'WelcomeModal',


	propTypes: {
		startTour: React.PropTypes.func,
		modalId: React.PropTypes.string,
		frases: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			modalId: 'welcome-modal'
		};
	},

	// getInitialState: function() {
	// 	return {};
	// },

	_startTour: function () {
		console.log('_startTour: ', this.props.startTour);
		this.props.startTour();
		this._dismissModal();
	},

	_dismissModal: function () {
		$('#' + this.props.modalId).modal('hide');
	},

	_getModalBody: function () {
		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12 text-center' },
				React.createElement(
					'h1',
					null,
					React.createElement(
						'span',
						{ className: 'fa-stack' },
						React.createElement('i', { className: 'fa fa-circle fa-stack-2x text-success' }),
						React.createElement('i', { className: 'fa fa-check fa-stack-1x text-white' })
					)
				),
				React.createElement(
					'h1',
					null,
					this.props.frases.GET_STARTED.WELCOME_MSG
				),
				React.createElement(
					'h4',
					null,
					this.props.frases.GET_STARTED.TOUR_OFFER
				),
				React.createElement('hr', null),
				React.createElement(
					'div',
					null,
					React.createElement(
						'button',
						{ className: 'btn btn-primary', onClick: this._startTour },
						this.props.frases.GET_STARTED.START_TOUR
					),
					React.createElement(
						'span',
						null,
						' '
					),
					React.createElement(
						'button',
						{ className: 'btn btn-default', onClick: this._dismissModal },
						this.props.frases.GET_STARTED.DISMISS_TOUR
					)
				)
			)
		);
	},

	render: function () {
		var body = this._getModalBody();

		return React.createElement(ModalComponent, { id: this.props.modalId, size: 'lg', body: body });
	}
});

WelcomeModal = React.createFactory(WelcomeModal);
var GsWidget = React.createClass({
	displayName: "GsWidget",


	propTypes: {
		steps: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			steps: []
		};
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "gs-items-cont" },
			React.createElement(
				"ul",
				{ className: "gs-items" },
				this.props.steps.map(function (item) {
					return React.createElement(GsStep, { step: item, frases: frases, key: item.name });
				}, this)
			)
		);
	}
});

GsWidget = React.createFactory(GsWidget);
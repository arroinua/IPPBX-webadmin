
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
					) : null,
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
			React.createElement("input", { className: "form-control", name: "net", value: props.rule.net, onChange: props.onChange })
		),
		React.createElement(
			"td",
			null,
			React.createElement("input", { className: "form-control", name: "mask", value: props.rule.mask, onChange: props.onChange })
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
				if (array.length === 4) validIp = false;else str = str.substring(0, 3) + '.' + str.substring(3);
			}

			return str;
		}).join('.');

		if (!validIp) return false;

		return value;
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
		this.props.deleteRuleHandler(index);
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
						return React.createElement(IpTableRowComponent, { key: index, rule: rule, onClick: this._deleteRule.bind(this, index), onChange: this._handleRuleChange.bind(this, index) });
					}.bind(this))
				)
			),
			React.createElement(
				'button',
				{ type: 'button', className: 'btn btn-default btn-block', onClick: this.props.addRuleHandler },
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
			iptable: []
		};
	},

	componentDidMount: function () {
		this.setState({ ipcheck: this.props.params.ipcheck, iptable: this.props.params.iptable });
	},

	_enableIpCheck: function (enabled, event) {
		var target = event.target;
		this.setState({ ipcheck: enabled });

		this.props.onChange({ ipcheck: enabled, iptable: this.state.iptable });
	},

	_addRule: function () {
		var iptable = this.state.iptable;
		iptable.push({ net: '', mask: '' });
		this.setState({ iptable: iptable });
	},

	_updateRules: function (iptable) {
		this.setState({ iptable: iptable });

		this.props.onChange(this.state);
	},

	_deleteRule: function (index) {
		var iptable = this.state.iptable;
		iptable.splice(index, 1);
		this.setState({ iptable: iptable });
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
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(IpTable, { frases: this.props.frases, iptable: this.state.iptable, deleteRuleHandler: this._deleteRule, addRuleHandler: this._addRule, updateRules: this._updateRules })
			)
		);
	}
});

SecuritySettings = React.createFactory(SecuritySettings);

var AddCallGroup = React.createClass({
	displayName: 'AddCallGroup',


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

	_chooseGroup: function (type) {
		window.location.hash = '#' + type + '?' + type;
		console.log('close Modal: ', this.props.step.name, $('#' + this.props.step.name));
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
						'h3',
						null,
						'Call groups, like hunting groups and hotlines, defines how incomming calls would be handled and by whom. In order to create call group, extensions should be created.'
					),
					React.createElement('br', null),
					React.createElement('br', null)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'button',
						{ onClick: this._chooseGroup.bind(this, 'hunting'), className: 'btn btn-primary btn-xl' },
						React.createElement('i', { className: 'icon-find_replace' }),
						' Create Hunting group'
					),
					React.createElement('br', null),
					React.createElement('br', null),
					React.createElement(
						'p',
						null,
						'Within a Hunting group call would be allocated to the available extension, either circular, or simultaneous.'
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'button',
						{ onClick: this._chooseGroup.bind(this, 'icd'), className: 'btn btn-primary btn-xl' },
						React.createElement('i', { className: 'icon-headset_mic' }),
						' Create Hotline'
					),
					React.createElement('br', null),
					React.createElement('br', null),
					React.createElement('p', null)
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
		step: React.PropTypes.object
	},

	getDefaultProps: function () {
		step: {}
	},

	getInitialState: function () {
		return {
			extensions: []
		};
	},

	// componentDidMount() {
	// this._getUserGroups(function(result) {
	// 	this.setState({
	// 		userGroups: result 
	// 	});
	// }.bind(this));

	// this._getPhoneGroups(function(result) {
	// 	this.setState({
	// 		phoneGroups: result 
	// 	});
	// }.bind(this));
	// },

	// _getUserGroups: function(cb) {
	// 	json_rpc_async('getObjects', { kind: "users" }, function(result) {
	// 		console.log('getObjects users: ', result);
	// 		if(cb) cb(result);
	// 	});
	// },

	// _getPhoneGroups: function(cb) {
	// 	json_rpc_async('getObjects', { kind: "equipment" }, function(result) {
	// 		console.log('getObjects phones: ', result);
	// 		if(cb) cb(result);
	// 	});
	// },

	// _getAvailableExtensions: function() {

	// },

	// _addExtension: function() {
	// 	console.log('addExtension: ');
	// },

	_chooseGroup: function (type) {
		window.location.hash = '#' + type + '?' + type;
		console.log('close Modal: ', this.props.step.name, $('#' + this.props.step.name));
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
						'h3',
						null,
						'Add extensions for company employees.'
					),
					React.createElement('br', null),
					React.createElement('br', null)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'button',
						{ onClick: this._chooseGroup.bind(this, 'users'), className: 'btn btn-primary btn-xl' },
						React.createElement('i', { className: 'fa fa-user' }),
						' Create user group'
					),
					React.createElement('br', null),
					React.createElement('br', null),
					React.createElement(
						'p',
						null,
						'Users could be registered with Ringotel\'s apps.'
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-6 text-center' },
					React.createElement(
						'button',
						{ onClick: this._chooseGroup.bind(this, 'equipment'), className: 'btn btn-primary btn-xl' },
						React.createElement('i', { className: 'fa fa-fax' }),
						' Create equipment group'
					),
					React.createElement('br', null),
					React.createElement('br', null),
					React.createElement(
						'p',
						null,
						'Create Equipment group, in order to connect third-party SIP softphones, IP phones, etc.'
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
						'h3',
						null,
						'In order to make and receive calls from the outside world, connect an external telephone number from your SIP trunking provider.'
					),
					React.createElement('br', null),
					React.createElement('br', null)
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
		step: React.PropTypes.object
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
		console.log('step: ', step);

		var stepCont = document.createElement('div');
		var Step = function () {
			var comp = {};
			switch (step.component) {
				case 'AddExtensions':
					comp = React.createElement(AddExtensions, { step: step });
					break;
				case 'AddCallGroup':
					comp = React.createElement(AddCallGroup, { step: step });
					break;
				case 'AddTrunk':
					comp = React.createElement(AddTrunk, { step: step });
					break;
			};

			console.log('loadStep: ', step, comp);

			return React.createElement(ModalComponent, {
				id: step.name,
				title: step.title,
				size: 'lg',
				body: comp
				// submit={ this._stepDone }
			});
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
			{ className: "gs-item " + (stepDone ? "gs-done" : ""), onClick: this._loadStep },
			React.createElement(
				'div',
				{ className: 'gs-item-header' },
				React.createElement('i', { className: this.props.step.icon }),
				' ',
				this.props.step.title
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
		modalId: React.PropTypes.string
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
					'Welcome to the Ringotel administrative panel'
				),
				React.createElement(
					'h4',
					null,
					'Here you can setup your Ringotel instance in lots of different ways. Would you like to have a starting tour of how to get started?'
				),
				React.createElement('hr', null),
				React.createElement(
					'div',
					null,
					React.createElement(
						'button',
						{ className: 'btn btn-primary', onClick: this._startTour },
						'Start a tour'
					),
					React.createElement(
						'span',
						null,
						' '
					),
					React.createElement(
						'button',
						{ className: 'btn btn-default', onClick: this._dismissModal },
						'No, dismiss'
					)
				)
			)
		);
	},

	render: function () {
		var body = this._getModalBody();

		return React.createElement(ModalComponent, { id: this.props.modalId, body: body });
	}
});

WelcomeModal = React.createFactory(WelcomeModal);
var GsWidget = React.createClass({
	displayName: "GsWidget",


	propTypes: {
		steps: React.PropTypes.array
	},

	getDefaultProps: function () {
		return {
			steps: []
		};
	},

	render: function () {
		return React.createElement(
			"div",
			{ className: "gs-items-cont" },
			React.createElement(
				"ul",
				{ className: "gs-items" },
				this.props.steps.map(function (item) {
					return React.createElement(GsStep, { step: item, key: item.name });
				}, this)
			)
		);
	}
});

GsWidget = React.createFactory(GsWidget);

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
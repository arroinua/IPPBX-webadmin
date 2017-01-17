
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
	displayName: 'ObjectRoute',


	propTypes: {
		getOptions: React.PropTypes.func,
		currentRoute: React.PropTypes.string,
		clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			route: {},
			options: []
		};
	},

	componentDidMount: function () {
		var options = [],
		    route;

		this.props.getOptions(function (result) {
			options = result.sort().map(function (item) {
				return { value: item, label: item };
			});

			options.unshift({ value: 0, label: 'Not selected' });

			route = this.props.currentRoute ? { value: this.props.currentRoute, label: this.props.currentRoute } : options[0];

			this.setState({ options: options });
			this._onChange(route);
		}.bind(this));
	},

	componentWillUnmount: function () {
		this.props.clearCurrObjRoute();
	},

	_onChange: function (val) {
		console.log('Select: ', val);
		this.setState({ route: val });
		this.props.onChange(val ? val.value : '');
	},

	render: function () {

		return React.createElement(
			PanelComponent,
			null,
			React.createElement(
				'label',
				{ htmlFor: 'form-field-name' },
				'Route'
			),
			React.createElement(Select, {
				name: 'form-field-name',
				value: this.state.route,
				options: this.state.options,
				onChange: this._onChange
			})
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
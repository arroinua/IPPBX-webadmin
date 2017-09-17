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
var FilterInputComponent = React.createClass({
	displayName: "FilterInputComponent",


	propTypes: {
		items: React.PropTypes.array,
		onChange: React.PropTypes.func
	},

	_filter: function (e) {
		var query = e.target.value.toLowerCase(),
		    items = this.props.items,
		    match = null,
		    value = null,
		    filteredItems = [];

		filteredItems = items.filter(function (item) {
			match = false;
			Object.keys(item).forEach(function (key) {
				value = item[key] ? item[key].toString() : null;
				if (value && value.toLowerCase().indexOf(query) !== -1) match = true;
			});
			return match;
		});

		this.props.onChange(filteredItems);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "form-group has-feedback pull-right" },
			React.createElement("input", { type: "text", className: "form-control", placeholder: "Search", onChange: this._filter }),
			React.createElement("i", { className: "fa fa-search fa-fw form-control-feedback" })
		);
	}
});

FilterInputComponent = React.createFactory(FilterInputComponent);

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
							{ className: 'btn btn-default', 'data-dismiss': 'modal' },
							this.props.cancelText
						),
						React.createElement(
							'button',
							{ className: 'btn btn-primary', onClick: this.props.submit },
							this.props.submitText
						)
					) : null
				)
			)
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);

var ObjectName = React.createClass({
	displayName: 'ObjectName',


	propTypes: {
		name: React.PropTypes.string,
		frases: React.PropTypes.object,
		enabled: React.PropTypes.bool,
		submitDisabled: React.PropTypes.bool,
		onStateChange: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		onCancel: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			name: '',
			submitDisabled: false,
			enabled: false
		};
	},

	componentWillMount: function () {
		this.setState({
			name: this.props.name || '',
			enabled: this.props.enabled,
			submitDisabled: !this.props.name || this.props.submitDisabled
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			name: props.name || '',
			submitDisabled: !props.name || props.submitDisabled
		});
	},

	_onSubmit: function () {
		this.props.onSubmit();
	},

	_onCancel: function () {
		this.props.onCancel();
	},

	_onChange: function (e) {
		var target = e.target;
		var disabled = !target.value;

		console.log('disabled: ', disabled);

		this.setState({ name: target.value, submitDisabled: disabled || this.props.submitDisabled });
		this.props.onChange(target.value);
	},

	_toggleState: function (e) {
		var state = !this.state.enabled;
		this.setState({ enabled: state });
		this.props.onStateChange(state);
	},

	render: function () {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;
		var Footer = function () {

			return React.createElement(
				'div',
				null,
				props.onSubmit ? React.createElement(
					'button',
					{ type: 'button', style: { marginRight: "5px" }, className: 'btn btn-success btn-md', onClick: props.onSubmit, disabled: state.submitDisabled },
					React.createElement('i', { className: 'fa fa-check fa-fw' }),
					' ',
					frases.SAVE
				) : "",
				props.onCancel ? React.createElement(
					'button',
					{ type: 'button', className: 'btn btn-danger btn-md', onClick: props.onCancel },
					React.createElement('i', { className: 'fa fa-trash fa-fw' }),
					' ',
					frases.DELETE
				) : ""
			);
		};

		Footer();

		return React.createElement(
			PanelComponent,
			{ footer: React.createElement(Footer, null) },
			React.createElement(
				'div',
				{ className: 'input-group object-name' },
				React.createElement('input', {
					id: 'objname',
					type: 'text',
					className: 'form-control',
					placeholder: frases.GROUPSNAME,
					value: state.name,
					onChange: this._onChange,
					required: true,
					autoFocus: true
				}),
				props.routes && React.createElement('span', { className: 'input-group-addon object-route view-1' }),
				React.createElement(
					'span',
					{ className: 'input-group-addon' },
					React.createElement(
						'div',
						{ className: 'switch switch-lg' },
						React.createElement('input', {
							className: 'cmn-toggle cmn-toggle-round',
							type: 'checkbox',
							checked: state.enabled
						}),
						React.createElement('label', { htmlFor: 'enabled', 'data-toggle': 'tooltip', title: frases.OBJECT__STATE, onClick: this._toggleState })
					)
				)
			)
		);
	}
});

ObjectName = React.createFactory(ObjectName);

var ObjectRoute = React.createClass({
	displayName: 'ObjectRoute',


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

	componentWillMount: function () {
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
				this.setState({
					routeId: route.id,
					value: route.ext,
					label: route.ext
				});
				this._onChange({ value: route.ext, label: route.ext });
			} else {
				this.setState({ route: options[0] });
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
		console.log('ObjectRoute value: ', this.state.route);
		return React.createElement(Select3, { value: this.state.route, options: this.state.options, onChange: this._onChange })

		//<Select
		//    name="form-field-name"
		//    className="obj-route-select"
		//    clearable={false}
		//    value={this.state.route}
		//    options={this.state.options}
		//    onChange={this._onChange}
		//    arrowRenderer={function() { return false; }}
		///>

		;
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
		),
		props.footer && React.createElement(
			"div",
			{ className: "panel-footer" },
			props.footer
		)
	);
}
var AddLicensesComponent = React.createClass({
	displayName: 'AddLicensesComponent',


	propTypes: {
		frases: React.PropTypes.object,
		sub: React.PropTypes.object,
		addLicenses: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			users: '',
			lines: '',
			storage: '',
			amount: 0
		};
	},

	_currState: {
		users: 0,
		lines: 0,
		storage: 0
	},

	_addLicenses: function () {
		this.props.addLicenses(this._currState);
	},

	_setAmount: function () {},

	_setTo: function (event) {
		var targ = event.target;
		var value = parseFloat(targ.value);
		if (!targ.value || targ.value < 0) value = 0;
		this._currState[targ.name] = value;
		this.setAmount();
		this.setState(this._currState);
	},

	_addTo: function (item, step) {
		this._currState[item] += parseInt(step, 10);
		this.setState(this._currState);
	},

	_removeFrom: function (item, step) {
		if (this._currState[item] <= 0) return;
		this._currState[item] -= parseInt(step, 10);
		this.setState(this._currState);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			{ style: { padding: '20px 0' } },
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button' },
								React.createElement('i', { className: 'fa fa-minus', onClick: this._removeFrom.bind(this, 'users', 1) })
							)
						),
						React.createElement('input', { type: 'number', className: 'form-control', name: 'users', value: this.state.users, onChange: this._setTo, placeholder: 'Number of users to add' }),
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button', onClick: this._addTo.bind(this, 'users', 1) },
								React.createElement('i', { className: 'fa fa-plus' })
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button', onClick: this._removeFrom.bind(this, 'storage', 5) },
								React.createElement('i', { className: 'fa fa-minus' })
							)
						),
						React.createElement('input', { type: 'number', className: 'form-control', name: 'storage', value: this.state.storage, onChange: this._setTo, placeholder: 'Storage size to add' }),
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button', onClick: this._addTo.bind(this, 'storage', 5) },
								React.createElement('i', { className: 'fa fa-plus' })
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button', onClick: this._removeFrom.bind(this, 'lines', 2) },
								React.createElement('i', { className: 'fa fa-minus' })
							)
						),
						React.createElement('input', { type: 'number', className: 'form-control', name: 'lines', value: this.state.lines, onChange: this._setTo, placeholder: 'Number of lines to add' }),
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', type: 'button', onClick: this._addTo.bind(this, 'lines', 2) },
								React.createElement('i', { className: 'fa fa-plus' })
							)
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement('hr', { className: 'col-xs-12' }),
				React.createElement(
					'div',
					{ className: 'col-xs-12 text-center' },
					React.createElement(
						'button',
						{ className: 'btn btn-primary btn-lg', onClick: this._addLicenses },
						'Buy licenses'
					)
				)
			)
		);
	}
});

AddLicensesComponent = React.createFactory(AddLicensesComponent);

var BillingComponent = React.createClass({
	displayName: 'BillingComponent',


	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		frases: React.PropTypes.object,
		plans: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		extend: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			changePlanOpened: false,
			addLicenseOpened: false
		};
	},

	componentDidMount: function () {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));

		// Convert subscription addOns from array to object
		// if(sub.addOns.length) {
		// 	addOns = sub.addOns.reduce(function(result, item) {
		// 		result[item.name] = item;
		// 		return result;
		// 	}, {});
		// }

		this.setState({
			sub: sub,
			minUsers: options.users,
			minStorage: options.storesize
		});
	},

	_convertBytes: function (value, fromUnits, toUnits) {
		var coefficients = {
			'Byte': 1,
			'KB': 1000,
			'MB': 1000000,
			'GB': 1000000000
		};
		return value * coefficients[fromUnits] / coefficients[toUnits];
	},

	_setUsersQuantity: function (params) {
		console.log('_setUsers:', params);
		var sub = this.state.sub;
		var total = sub.quantity + params.quantity;
		if (total < this.state.minUsers) return;
		sub.quantity = total;

		sub.amount = this._countSubAmount(sub);
		this.setState({ sub: sub });
	},

	_setAddonQuantity: function (params) {
		console.log('_setAddonQuantity:', params);
		var sub = this.state.sub;
		var addon = sub.addOns[params.index];
		var newQuantity = addon.quantity + params.quantity;

		if (newQuantity < 0) return;
		if (addon.name === 'storage' && newQuantity < this.state.minStorage) return;

		addon.quantity = newQuantity;
		sub.addOns[params.index] = addon;
		sub.amount = this._countSubAmount(sub);
		this.setState({ sub: sub });
	},

	_countSubAmount: function (sub) {
		var amount = sub.quantity * sub.plan.price;
		if (sub.addOns && sub.addOns.length) {
			sub.addOns.forEach(function (item) {
				if (item.quantity) amount += item.price * item.quantity;
			});
		}

		return amount.toFixed(2);
	},

	_countNewPlanAmount: function (currsub, newsub) {
		var currAmount = currsub.amount;
		var newAmount = newsub.amount;
		var chargeAmount = 0;
		var prorationRatio = 1;
		var proratedAmount = 0;

		console.log('_countPayAmount: ', currsub, newsub);

		// if new plan with different billing period
		if (currsub.plan.trialPeriod || newsub.plan.billingPeriod !== currsub.plan.billingPeriod || newsub.plan.billingPeriodUnit !== currsub.plan.billingPeriodUnit) {
			newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
			newsub.prevBillingDate = Date.now();
		} else {
			var cycleDays = moment(newsub.nextBillingDate).diff(moment(newsub.prevBillingDate), 'days');
			var proratedDays = moment(newsub.nextBillingDate).diff(moment(), 'days');
			prorationRatio = proratedDays / cycleDays;

			console.log('_countPayAmount: ', cycleDays, proratedDays);
		}

		currAmount = currAmount * prorationRatio;
		chargeAmount = newAmount * prorationRatio;

		if (chargeAmount >= currAmount) {
			chargeAmount = chargeAmount - currAmount;
		} else {
			proratedAmount = currAmount - chargeAmount;
			chargeAmount = 0;
		}

		console.log('_countPayAmount: ', currAmount, newAmount, chargeAmount, proratedAmount);
		return { totalAmount: newAmount, chargeAmount: chargeAmount };
	},

	_setUpdate: function (item) {
		console.log('_setUpdate:', item);
		var params = this.state;
		if (item.min !== undefined && item.value < item.min) return;
		if (item.max !== undefined && item.value > item.max) return;
		params[item.key] = item.value;
		this._checkUpdate(params);
	},

	_addCard: function (e) {
		if (e) e.preventDefault();
		this.props.addCard();
	},

	_editCard: function (e) {
		e.preventDefault();
		this.props.editCard();
	},

	_getPaymentMethod: function (sources) {
		if (!sources || !sources.length) return null;
		return sources.reduce(function (prev, next) {
			if (next.default) return prev = next;
		}, null);
	},

	_openPlans: function (e) {
		if (e) e.preventDefault();
		this.setState({ changePlanOpened: !this.state.changePlanOpened });

		// this.props.getPlans(this.props.sub.currency, function(result) {
		// 	console.log('BillingComponent getPlans: ', result);
		// 	this.setState({ plans: result });
		// }.bind(this));
	},

	_openLicenses: function () {
		this.setState({ addLicenseOpened: !this.state.addLicenseOpened });
	},

	_onPlanSelect: function (plan) {
		console.log('_onPlanSelect: ', plan);
		var profile = this.props.profile;
		var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		if (!paymentMethod) return this._addCard();

		var sub = this.state.sub;
		sub.plan = plan;
		sub.amount = this._countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		var confirm = window.confirm('Your new monthly rate would be ' + amounts.totalAmount + '. Today you will be charged ' + amounts.chargeAmount.toFixed(2) + '.');
		if (confirm) {
			console.log('confirm change plan');
			this.props.onPlanSelect(plan);
		} else {
			sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
			sub.amount = this._countSubAmount(sub);
		}
	},

	_updateLicenses: function () {
		var sub = this.state.sub;
		var chargeAmount = sub.amount - this.props.sub.amount;
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		console.log('updateLicenses: ', cycleDays, proratedDays, chargeAmount);

		if (chargeAmount < 0) chargeAmount = 0;else chargeAmount = chargeAmount * (proratedDays / cycleDays);

		console.log('updateLicenses2: ', sub.amount, chargeAmount);

		var confirm = window.confirm('Your new monthly rate would be ' + sub.amount + '. Today you will be charged ' + chargeAmount.toFixed(2) + '.');
		if (confirm) {
			console.log('confirm update');
			this.props.updateLicenses(sub);
		}
	},

	_cancelEditLicenses: function () {
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		this.setState({
			sub: sub
		});
	},

	render: function () {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var sub = this.props.sub;
		var currSub = this.state.sub;
		var options = this.props.options;
		var plans = this.props.plans;
		var column = plans.length ? 12 / plans.length : 12;
		var onPlanSelect = this._onPlanSelect;
		var trial = sub.plan.planId === 'trial' ? true : false;

		console.log('billing render component: ', sub, currSub);

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'h2',
						{ className: 'pull-left' },
						React.createElement(
							'small',
							null,
							'Current plan '
						),
						React.createElement(
							'span',
							null,
							sub.plan.name,
							' '
						),
						React.createElement(
							'small',
							{ className: "label " + (sub.state === 'active' ? 'label-success' : 'label-warning'), style: { fontSize: "14px" } },
							sub.state
						)
					),
					React.createElement(
						'h2',
						{ className: 'pull-right' },
						React.createElement(
							'a',
							{ href: '#', className: 'text-uppercase', style: { fontSize: "14px" }, onClick: this._openPlans },
							'Upgrade plan'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					paymentMethod ? React.createElement(
						'p',
						{ className: 'text-muted', style: { userSelect: 'none' } },
						React.createElement(
							'b',
							null,
							paymentMethod.params.brand
						),
						' \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ',
						paymentMethod.params.last4,
						React.createElement(
							'span',
							null,
							' '
						),
						React.createElement(
							'a',
							{ href: '#', onClick: this._editCard, className: 'text-uppercase' },
							'Edit'
						),
						React.createElement('br', null),
						paymentMethod.params.exp_month,
						'/',
						paymentMethod.params.exp_year
					) : React.createElement(
						'div',
						{ className: 'alert alert-info', role: 'alert' },
						'To upgrade plan and add licenses, please ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._addCard, className: 'alert-link' },
							'add credit card'
						),
						' to your account'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'h2',
						null,
						React.createElement(
							'small',
							null,
							'Monthly total'
						),
						' ',
						sub.plan.currency,
						' ',
						sub.amount
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12 col-custom' },
					React.createElement(
						'div',
						{ className: "panel " + (this.state.changePlanOpened ? "" : " minimized") },
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'row' },
								plans.map(function (plan, index) {

									return React.createElement(
										'div',
										{ className: "col-xs-12 col-sm-" + column, key: plan.planId },
										React.createElement(PlanComponent, { plan: plan, onSelect: onPlanSelect, currentPlan: sub.plan.planId, maxusers: options.maxusers })
									);
								})
							)
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'div',
						{ className: 'panel' },
						React.createElement(
							'div',
							{ className: 'panel-header' },
							React.createElement(
								'span',
								null,
								'Available licenses'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'row', style: { textAlign: "center" } },
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement(
										'div',
										{ className: 'input-group' },
										React.createElement(
											'span',
											{ className: 'input-group-btn' },
											React.createElement(
												'button',
												{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setUsersQuantity.bind(this, { quantity: -1 }) },
												React.createElement('i', { className: 'fa fa-minus' })
											)
										),
										React.createElement(
											'h3',
											{ className: 'data-model' },
											currSub.quantity
										),
										React.createElement(
											'span',
											{ className: 'input-group-btn' },
											React.createElement(
												'button',
												{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setUsersQuantity.bind(this, { quantity: +1 }) },
												React.createElement('i', { className: 'fa fa-plus' })
											)
										)
									),
									React.createElement(
										'p',
										null,
										'Users'
									)
								),
								currSub.addOns.map(function (item, index) {

									return React.createElement(
										'div',
										{ className: 'col-sm-4', key: item.name },
										React.createElement(
											'div',
											{ className: 'input-group' },
											React.createElement(
												'span',
												{ className: 'input-group-btn' },
												React.createElement(
													'button',
													{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setAddonQuantity.bind(this, { index: index, quantity: -1 }) },
													React.createElement('i', { className: 'fa fa-minus' })
												)
											),
											React.createElement(
												'h3',
												{ className: 'data-model' },
												item.quantity
											),
											React.createElement(
												'span',
												{ className: 'input-group-btn' },
												React.createElement(
													'button',
													{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setAddonQuantity.bind(this, { index: index, quantity: +1 }) },
													React.createElement('i', { className: 'fa fa-plus' })
												)
											)
										),
										React.createElement(
											'p',
											null,
											item.name
										)
									);
								}.bind(this))
							),
							React.createElement(
								'div',
								{ className: 'row' },
								React.createElement(
									'div',
									{ className: 'col-xs-12' },
									React.createElement(
										'div',
										{ className: "alert alert-info " + (paymentMethod && trial ? '' : 'hidden'), role: 'alert' },
										'To add more licenses, please ',
										React.createElement(
											'a',
											{ href: '#', onClick: this._openPlans, className: 'alert-link' },
											'upgrade your plan'
										)
									),
									React.createElement(
										'div',
										{ className: "text-center " + (sub.amount !== currSub.amount ? '' : 'hidden') },
										React.createElement('hr', null),
										React.createElement(
											'button',
											{ className: 'btn btn-default btn-lg', style: { marginRight: "5px" }, onClick: this._cancelEditLicenses },
											'Cancel'
										),
										React.createElement(
											'span',
											null,
											'  '
										),
										React.createElement(
											'button',
											{ className: 'btn btn-primary btn-lg', onClick: this._updateLicenses },
											'Update licenses '
										)
									)
								)
							)
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'div',
						{ className: 'panel' },
						React.createElement(
							'div',
							{ className: 'panel-header' },
							React.createElement(
								'span',
								null,
								'Invoices'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'p',
								null,
								'No invoices for period'
							)
						)
					)
				)
			)
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);

var PlanComponent = React.createClass({
	displayName: 'PlanComponent',


	propTypes: {
		plan: React.PropTypes.object,
		frases: React.PropTypes.object,
		maxusers: React.PropTypes.number,
		currentPlan: React.PropTypes.string,
		onSelect: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			plan: {}
		};
	},

	_selectPlan: function () {
		this.props.onSelect(this.props.plan);
	},

	render: function () {
		var frases = this.props.frases;
		var plan = this.props.plan;

		return React.createElement(
			'div',
			{ className: 'panel', style: { border: 'none', boxShadow: 'none', textAlign: 'center' } },
			React.createElement(
				'div',
				{ className: 'panel-header' },
				plan.name
			),
			React.createElement(
				'div',
				{ className: 'panel-body' },
				React.createElement(
					'ul',
					{ style: { padding: '0', listStyle: 'none' } },
					React.createElement(
						'li',
						null,
						plan.customData.storageperuser,
						'GB Storage per user'
					),
					React.createElement(
						'li',
						null,
						'\u2022'
					),
					React.createElement(
						'li',
						null,
						plan.maxlines ? plan.maxlines : 'Unlimited',
						' number of lines'
					),
					React.createElement(
						'li',
						null,
						'\u2022'
					),
					React.createElement(
						'li',
						null,
						plan.price,
						plan.currency,
						' per user'
					),
					React.createElement(
						'li',
						null,
						'\u2022'
					),
					React.createElement(
						'li',
						null,
						plan.price * this.props.maxusers,
						plan.currency,
						' per ',
						this.props.maxusers,
						' users/month'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-footer' },
				this.props.currentPlan === plan.planId ? "Your plan" : React.createElement(
					'button',
					{ className: 'btn btn-link text-uppercase', onClick: this._selectPlan },
					'Select'
				)
			)
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);

var PlansComponent = React.createClass({
	displayName: "PlansComponent",


	propTypes: {
		plans: React.PropTypes.array,
		frases: React.PropTypes.object,
		maxusers: React.PropTypes.number,
		sub: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			plans: []
		};
	},

	render: function () {
		var frases = this.props.frases;
		var plans = this.props.plans;
		var column = plans.length ? 12 / plans.length : 12;
		var maxusers = this.props.maxusers;
		var currentSub = this.props.sub;

		return React.createElement(
			"div",
			{ className: "row" },
			this.props.plans.map(function (plan, index) {

				return React.createElement(
					"div",
					{ className: "col-xs-" + column },
					React.createElement(PlanComponent, { plan: plan, planIndex: index, currentPlan: currentSub.planId, maxusers: maxusers, key: plan.planId })
				);
			})
		);
	}
});

PlansComponent = React.createFactory(PlansComponent);
var Select3 = React.createClass({
  displayName: 'Select3',


  propTypes: {
    name: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    value: React.PropTypes.object,
    options: React.PropTypes.array,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      value: {},
      options: []
    };
  },

  getInitialState: function () {
    return {
      menuOpened: false,
      value: {},
      highlightedIndex: 0,
      selectedIndex: 0,
      options: []
    };
  },

  componentWillMount: function () {
    this.setState({
      value: this.props.value,
      options: this.props.options
    });
  },

  componentWillReceiveProps: function (newProps) {
    console.log('componentWillReceiveProps: ', newProps);
    this.setState({
      value: newProps.value
    });
  },

  openMenu: function () {
    this.setState({
      menuOpened: true,
      options: this.props.options,
      highlightedIndex: this.state.selectedIndex
    });

    window.setTimeout(function () {
      this.focusOnSelected(this.state.selectedIndex);
    }.bind(this), 10);
  },

  closeMenu: function () {
    window.setTimeout(function () {
      this.setState({
        menuOpened: false
      });
    }.bind(this), 10);
  },

  onKeyDown: function (e) {
    var code = e.key;

    if (code === 'Enter') {
      this.selectValue(this.state.options[this.state.highlightedIndex], this.state.highlightedIndex);
      this.closeMenu();
    } else if (code === 'Escape') {
      this.closeMenu();
    } else if (code === 'Tab') {
      return false;
    } else {
      if (!this.state.menuOpened && this.state.options.length) {
        this.openMenu();
        this.selectIndex(this.state.highlightedIndex);
      } else {
        if (code === 'ArrowDown') this.selectIndex(this.state.highlightedIndex + 1);else if (code === 'ArrowUp') this.selectIndex(this.state.highlightedIndex - 1);
      }
    }
  },

  onSelected: function (el) {
    if (el) {
      this.selectedOptionEl = el;
    }
  },

  getMenuRef: function (el) {
    if (el) {
      this.menuEl = el;
    }
  },

  focusOnSelected: function (index) {

    var menuDOM = ReactDOM.findDOMNode(this.menuEl);
    var focusedDOM = menuDOM.firstChild;
    var offset;

    if (!focusedDOM) return;

    offset = focusedDOM.clientHeight * (index + 1);

    if (offset > menuDOM.offsetHeight) {
      menuDOM.scrollTop = offset + focusedDOM.clientHeight - menuDOM.offsetHeight;
    } else {
      menuDOM.scrollTop = 0;
    }
  },

  filterList: function (value) {
    if (value === '') return this.setState({ options: this.props.options });

    var list = this.props.options;
    var filtered = list.filter(function (item) {
      return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });

    return this.setState({ options: filtered });
  },

  selectIndex: function (index) {
    if (index < 0) index = this.state.options.length - 1;else if (index > this.state.options.length - 1) index = 0;

    this.setState({ highlightedIndex: index });
    this.focusOnSelected(index);
  },

  setValue: function (value) {
    console.log('the value is: ', value);
    this.setState({ value: value });
    if (this.props.onChange) this.props.onChange(value);
  },

  selectValue: function (item, index) {
    var item = item || { value: this.state.value.value, label: this.state.value.label };
    this.setValue(item);
    this.setState({
      selectedIndex: item ? index : 0,
      menuOpened: false
    });
  },

  changeValue: function (e) {
    var tvalue = e.target.value;

    this.filterList(tvalue);
    this.setValue({ value: tvalue, label: tvalue });
  },

  render: function () {
    var className = "Select3 Select3-cont";
    className += this.state.menuOpened ? " is-opened" : "";
    className += this.props.className ? " " + this.props.className : "";

    // console.log('Select3 render: ', this.props, this.state);

    return React.createElement(
      'div',
      { className: className },
      React.createElement('input', {
        type: 'text',
        name: this.props.name ? this.props.name : '',
        placeholder: this.props.placeholder ? this.props.placeholder : '',
        className: 'Select3-input',
        value: this.state.value.label,
        onFocus: this.openMenu,
        onBlur: this.closeMenu,
        onChange: this.changeValue,
        onKeyDown: this.onKeyDown
      }),
      this.state.menuOpened ? React.createElement(
        'div',
        { className: 'Select3-menu-list' },
        React.createElement(Select3Menu, {
          getMenuRef: this.getMenuRef,
          onClick: this.selectValue,
          onSelected: this.onSelected,
          selectedIndex: this.state.highlightedIndex,
          options: this.state.options
        })
      ) : null
    );
  }
});

Select3 = React.createFactory(Select3);
var Select3Menu = React.createClass({
	displayName: "Select3Menu",


	render: function () {
		return React.createElement(
			"ul",
			{ ref: this.props.getMenuRef },
			this.props.options.map(function (item, index) {
				return React.createElement(Select3MenuOption, {
					key: "option-" + index + "-" + item.value,
					onClick: this.props.onClick,
					value: item.value,
					label: item.label,
					index: index,
					selected: this.props.selectedIndex === index
				});
			}.bind(this))
		);
	}
});

Select3Menu = React.createFactory(Select3Menu);
var Select3MenuOption = React.createClass({
  displayName: 'Select3MenuOption',


  selectValue: function (e) {
    e.preventDefault();
    this.props.onClick({ value: this.props.value, label: this.props.label }, this.props.index);
  },

  render: function () {
    return React.createElement(
      'li',
      null,
      React.createElement(
        'a',
        {
          href: '#',
          className: this.props.selected ? 'is-selected' : '',
          onClick: this.selectValue },
        this.props.label
      )
    );
  }

});

Select3MenuOption = React.createFactory(Select3MenuOption);

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
var AvailableUsersComponent = React.createClass({
	displayName: 'AvailableUsersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		onSubmit: React.PropTypes.func,
		modalId: React.PropTypes.string
	},

	getInitialState: function () {
		return {
			data: []
		};
	},

	componentDidMount: function () {
		this.setState({ data: this.props.data || [] });
	},

	componentWillReceiveProps: function (props) {
		console.log('componentWillReceiveProps: ', props);
		this.setState({ data: props.data || [] });
	},

	_saveChanges: function () {
		console.log('_saveChanges: ', this.state.data);
		var selectedMembers = this.state.data.filter(function (item) {
			return item.selected;
		});

		this.props.onSubmit(selectedMembers);
	},

	_selectMember: function (item) {
		var data = this.state.data;
		data[item].selected = !data[item].selected;
		this.setState({ data: data });
	},

	_selectAllMembers: function (e) {
		e.preventDefault();
		var data = this.state.data;
		data.map(function (item) {
			item.selected = !item.selected;
			return item;
		});
		this.setState({ data: data });
	},

	_getModalBody: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				React.createElement(
					'ul',
					{ style: { minHeight: "200px", maxHeight: "400px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 } },
					React.createElement(
						'li',
						null,
						React.createElement(
							'a',
							{ href: '#', style: { display: "block", padding: "8px 10px" }, onClick: this._selectAllMembers },
							frases.CHAT_CHANNEL.SELECT_ALL
						)
					),
					this.state.data.map(function (item, index) {
						console.log('_getModalBody: ', item);

						return React.createElement(
							'li',
							{ key: item.ext, style: { padding: "8px 10px", color: "#333", cursor: "pointer", background: item.selected ? '#c2f0ff' : 'none' }, onClick: this._selectMember.bind(this, index) },
							React.createElement(
								'span',
								null,
								item.ext
							),
							React.createElement(
								'span',
								null,
								' - '
							),
							React.createElement(
								'span',
								null,
								item.name
							)
						);
					}.bind(this))
				)
			)
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getModalBody();

		return React.createElement(ModalComponent, {
			id: this.props.modalId,
			size: 'sm',
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.ADD,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			body: body
		});
	}

});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);
var ChatchannelComponent = React.createClass({
	displayName: 'ChatchannelComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		getAvailableUsers: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		getInfoFromState: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	// getDefaultProps: function() {
	// 	return {
	// 		sub: {}
	// 	};
	// },

	getInitialState: function () {
		return {
			params: {},
			filteredMembers: []
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {},
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			removeObject: props.removeObject,
			filteredMembers: props.params.members
		});
	},

	_setObject: function () {
		var params = this.state.params;
		this.props.setObject(params);
	},

	_onStateChange: function (state) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function (value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onFilter: function (items) {
		console.log('_onFilter: ', items);
		this.setState({
			filteredMembers: items
		});
	},

	_getAvailableUsers: function () {
		this.props.getAvailableUsers();
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];
		var itemState = {};

		console.log('remder: ', params.name);

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled || false,
				onStateChange: this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.state.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'button',
						{ type: 'button', role: 'button', className: 'btn btn-default padding-lg', onClick: this._getAvailableUsers },
						React.createElement('i', { className: 'fa fa-user-plus' }),
						' ',
						frases.CHAT_CHANNEL.ADD_MEMBERS
					),
					React.createElement(FilterInputComponent, { items: members, onChange: this._onFilter })
				)
			),
			React.createElement(
				PanelComponent,
				{ header: filteredMembers.length + " " + frases.CHAT_CHANNEL.MEMBERS },
				React.createElement(
					'div',
					{ className: 'table-responsive' },
					React.createElement(
						'table',
						{ className: 'table table-hover sortable', id: 'group-extensions' },
						React.createElement(
							'tbody',
							null,
							members.length ? filteredMembers.map(function (item) {

								itemState = this.props.getInfoFromState(item.state);
								console.log('itemState: ', itemState);

								return React.createElement(
									'tr',
									{ id: item.oid, className: itemState.rclass, key: item.number || item.ext },
									React.createElement(
										'td',
										null,
										React.createElement(
											'a',
											{ href: '', onClick: this.props.getExtension },
											item.number || item.ext
										)
									),
									React.createElement(
										'td',
										{ 'data-cell': 'name' },
										item.name
									),
									React.createElement(
										'td',
										{ 'data-cell': 'reg' },
										item.reg
									),
									React.createElement(
										'td',
										{ 'data-cell': 'status', style: { "textAlign": "right" } },
										itemState.rstatus
									),
									React.createElement(
										'td',
										{ style: { "textAlign": "right" } },
										React.createElement(
											'button',
											{ className: 'btn btn-danger btn-sm', onClick: this.props.deleteMember.bind(this, item.oid) },
											React.createElement('i', { className: 'fa fa-trash' })
										)
									)
								);
							}.bind(this)) : React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									{ colSpan: '3' },
									frases.CHAT_CHANNEL.NO_MEMBERS,
									'. ',
									React.createElement(
										'a',
										{ href: '#', onClick: this._getAvailableUsers },
										frases.CHAT_CHANNEL.ADD_MEMBERS
									)
								)
							)
						)
					)
				)
			)
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);

var RecQosTable = React.createClass({
	displayName: "RecQosTable",


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		utils: React.PropTypes.object
	},

	// _setDefaultValue: function(item) {
	// 	item.in = Object.keys(item.in).forEach(function(key, index) {
	// 		item.in[key] = item.in[key] || 0;
	// 	});
	// 	item.out = Object.keys(item.out).forEach(function(key, index) {
	// 		item.out[key] = item.out[key] || 0;
	// 	});

	// 	return item;
	// },

	// _formatTimeString: function(value, format) {
	// 	return this.props.utils.formatTimeString(value, format);
	// },

	render: function () {
		var frases = this.props.frases;
		var data = this.props.data;
		console.log('render: ', data);

		return React.createElement(
			"div",
			{ className: "rec-qos-cont" },
			React.createElement(
				"div",
				{ className: "rec-qos-head" },
				React.createElement(
					"div",
					{ className: "pull-left" },
					React.createElement("span", { className: "fa fa-user" }),
					React.createElement("br", null),
					React.createElement(
						"span",
						null,
						data.na
					)
				),
				React.createElement(
					"div",
					{ className: "pull-right" },
					React.createElement("span", { className: "fa fa-user" }),
					React.createElement("br", null),
					React.createElement(
						"span",
						null,
						data.nb
					)
				),
				React.createElement(
					"div",
					null,
					React.createElement("span", { className: "fa fa-server" })
				),
				React.createElement("div", { className: "direction-arrows" })
			),
			React.createElement(
				"div",
				{ className: "rec-qos-body" },
				React.createElement(
					"div",
					{ className: "col-xs-6" },
					React.createElement(
						"div",
						{ className: "table-responsive" },
						React.createElement(
							"table",
							{ className: "table" },
							React.createElement(
								"thead",
								null,
								React.createElement(
									"tr",
									null,
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.JFE, className: "initialism" },
											"JFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.JNE, className: "initialism" },
											"JNE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LAT, className: "initialism" },
											"LAT"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LFE, className: "initialism" },
											"LFE,%"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LNE, className: "initialism" },
											"LNE,%"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.MFE, className: "initialism" },
											"MFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.MNE, className: "initialism" },
											"MNE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.RFE, className: "initialism" },
											"RFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.RNE, className: "initialism" },
											"RNE"
										)
									)
								)
							),
							React.createElement(
								"tbody",
								null,
								React.createElement(
									"tr",
									null,
									React.createElement(
										"td",
										null,
										data.lat1
									),
									React.createElement(
										"td",
										null,
										data.jfe1
									),
									React.createElement(
										"td",
										null,
										data.jne1
									),
									React.createElement(
										"td",
										null,
										data.lfe1
									),
									React.createElement(
										"td",
										null,
										data.lne1
									),
									React.createElement(
										"td",
										null,
										data.mfe1
									),
									React.createElement(
										"td",
										null,
										data.mne1
									),
									React.createElement(
										"td",
										null,
										data.rfe1
									),
									React.createElement(
										"td",
										null,
										data.rne1
									)
								)
							)
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-xs-6" },
					React.createElement(
						"div",
						{ className: "table-responsive" },
						React.createElement(
							"table",
							{ className: "table" },
							React.createElement(
								"thead",
								null,
								React.createElement(
									"tr",
									null,
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.JFE, className: "initialism" },
											"JFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.JNE, className: "initialism" },
											"JNE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LAT, className: "initialism" },
											"LAT"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LFE, className: "initialism" },
											"LFE,%"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.LNE, className: "initialism" },
											"LNE,%"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.MFE, className: "initialism" },
											"MFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.MNE, className: "initialism" },
											"MNE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.RFE, className: "initialism" },
											"RFE"
										)
									),
									React.createElement(
										"th",
										null,
										React.createElement(
											"abbr",
											{ title: frases.STATISTICS.TRNUK_QOS.RNE, className: "initialism" },
											"RNE"
										)
									)
								)
							),
							React.createElement(
								"tbody",
								null,
								React.createElement(
									"tr",
									null,
									React.createElement(
										"td",
										null,
										data.lat2
									),
									React.createElement(
										"td",
										null,
										data.jfe2
									),
									React.createElement(
										"td",
										null,
										data.jne2
									),
									React.createElement(
										"td",
										null,
										data.lfe2
									),
									React.createElement(
										"td",
										null,
										data.lne2
									),
									React.createElement(
										"td",
										null,
										data.mfe2
									),
									React.createElement(
										"td",
										null,
										data.mne2
									),
									React.createElement(
										"td",
										null,
										data.rfe2
									),
									React.createElement(
										"td",
										null,
										data.rne2
									)
								)
							)
						)
					)
				)
			)
		);
	}
});

RecQosTable = React.createFactory(RecQosTable);

var UsageComponent = React.createClass({
	displayName: 'UsageComponent',


	propTypes: {
		options: React.PropTypes.object,
		frases: React.PropTypes.object,
		storageInfo: React.PropTypes.array,
		fileStorage: React.PropTypes.array,
		getTotalStorage: React.PropTypes.func,
		utils: React.PropTypes.object,
		openStorageSettings: React.PropTypes.func
	},

	_convertBytes: function (value, fromUnits, toUnits) {
		var coefficients = {
			'Byte': 1,
			'KB': 1000,
			'MB': 1000000,
			'GB': 1000000000
		};
		return value * coefficients[fromUnits] / coefficients[toUnits];
	},

	render: function () {
		var frases = this.props.frases;
		var options = this.props.options;

		console.log('storages component: ', this.props.storageInfo, this.props.fileStorage);

		return React.createElement(
			'div',
			null,
			this.props.fileStorage ? React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(StoragesComponent, { openSettings: this.props.openStorageSettings, frases: this.props.frases, storages: this.props.fileStorage, utils: this.props.utils })
				)
			) : '',
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(StorageUsageComponent, { frases: this.props.frases, data: this.props.options, utils: this.props.utils })
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(UsersStorageComponent, { frases: frases, data: this.props.storageInfo })
				)
			)
		);
	}
});

UsageComponent = React.createFactory(UsageComponent);
var StorageComponent = React.createClass({
	displayName: 'StorageComponent',


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			data: {},
			modalId: 'storage-settings'
		};
	},

	componentDidMount: function () {
		this.setState({ data: this.props.data || {} });
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data || {} });
	},

	_onChange: function (e) {
		var target = e.target;
		var data = this.state.data;
		data[target.name] = target.type === 'number' ? parseFloat(target.value) : target.value;
		this.setState(data);
	},

	_saveChanges: function () {
		var data = this.state.data;
		this.props.onSubmit({
			id: data.id,
			path: data.path,
			maxsize: data.maxsize,
			state: data.state
		});
	},

	_getModalBody: function () {

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				React.createElement(
					'form',
					{ role: 'form' },
					React.createElement('input', { type: 'text', name: 'id', value: this.state.data.id, className: 'hidden' }),
					React.createElement(
						'div',
						{ className: 'form-group col-xs-12' },
						React.createElement(
							'label',
							{ htmlFor: 'storage-path' },
							this.props.frases.PATH
						),
						React.createElement('input', { type: 'text', name: 'path', value: this.state.data.path, onChange: this._onChange, className: 'form-control' })
					),
					React.createElement(
						'div',
						{ className: 'form-group col-xs-12 col-sm-6' },
						React.createElement(
							'label',
							{ htmlFor: 'storage-maxsize' },
							this.props.frases.STORAGE.MAXSIZE
						),
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', name: 'maxsize', min: '0', value: this.state.data.maxsize, onChange: this._onChange, className: 'form-control' }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								'GB'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'form-group col-xs-12 col-sm-6' },
						React.createElement(
							'label',
							{ htmlFor: 'storage-state' },
							this.props.frases.STATE
						),
						React.createElement(
							'select',
							{ name: 'state', value: this.state.data.state, onChange: this._onChange, className: 'form-control' },
							React.createElement(
								'option',
								{ value: '1' },
								this.props.frases.STORAGE.STATES["1"]
							),
							React.createElement(
								'option',
								{ value: '0' },
								this.props.frases.STORAGE.STATES["0"]
							),
							React.createElement(
								'option',
								{ value: '2' },
								this.props.frases.STORAGE.STATES["2"]
							)
						)
					)
				)
			)
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getModalBody();

		return React.createElement(ModalComponent, {
			id: this.state.modalId,
			title: frases.STORAGE.STORAGE_SETTINGS,
			submitText: frases.SAVE,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			body: body
		});
	}

});

StorageComponent = React.createFactory(StorageComponent);

var StoragesComponent = React.createClass({
	displayName: "StoragesComponent",


	propTypes: {
		frases: React.PropTypes.object,
		storages: React.PropTypes.array,
		utils: React.PropTypes.object,
		openSettings: React.PropTypes.func
	},

	// getDefaultProps: function() {
	// 	return {
	// 		sub: {}
	// 	};
	// },

	// getInitialState: function() {
	// 	return {
	// 		storageData: {},
	// 		storageOpened: false
	// 	};
	// },

	// componentDidMount: function() {

	// },

	_openStorageSettings: function (index) {
		var storageOpts = this.props.storages[index] || {};
		this.props.openSettings(storageOpts);
	},

	render: function () {
		var frases = this.props.frases;
		var storages = this.props.storages;
		var utils = this.props.utils;

		return React.createElement(
			"div",
			{ className: "panel" },
			React.createElement(
				"div",
				{ className: "panel-header" },
				frases.STORAGE.AVAILABLE_STORAGES
			),
			React.createElement(
				"div",
				{ className: "panel-body" },
				React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"div",
						{ className: "col-xs-12 col-custom" },
						React.createElement(
							"div",
							{ className: "table-responsive" },
							React.createElement(
								"table",
								{ className: "table table-condensed" },
								React.createElement(
									"thead",
									null,
									React.createElement(
										"tr",
										null,
										React.createElement("th", { style: { width: "2px" } }),
										React.createElement(
											"th",
											null,
											frases.STATE
										),
										React.createElement(
											"th",
											null,
											frases.PATH
										),
										React.createElement(
											"th",
											null,
											frases.STORAGE.FREE_SPACE,
											" (GB)"
										),
										React.createElement(
											"th",
											null,
											frases.STORAGE.USED_SPACE,
											" (GB)"
										),
										React.createElement(
											"th",
											null,
											frases.STORAGE.TOTAL_SPACE,
											" (GB)"
										),
										React.createElement(
											"th",
											null,
											frases.STORAGE.CREATED
										),
										React.createElement(
											"th",
											null,
											frases.STORAGE.UPDATED
										),
										React.createElement(
											"th",
											{ className: "unsortable" },
											React.createElement(
												"button",
												{ type: "button", onClick: this._openStorageSettings.bind(this, null), className: "btn btn-primary" },
												React.createElement("i", { className: "fa fa-plus" })
											)
										)
									)
								),
								React.createElement(
									"tbody",
									null,
									storages.map(function (item, index) {

										return React.createElement(
											"tr",
											{ key: index.toString() },
											React.createElement("td", { className: item.state === 1 || item.state === 2 ? 'success' : 'danger' }),
											React.createElement(
												"td",
												null,
												utils.getFriendlyStorageState(item.state)
											),
											React.createElement(
												"td",
												null,
												item.path
											),
											React.createElement(
												"td",
												null,
												utils.convertBytes(item.freespace, 'Byte', 'GB').toFixed(2)
											),
											React.createElement(
												"td",
												null,
												utils.convertBytes(item.usedsize, 'Byte', 'GB').toFixed(2)
											),
											React.createElement(
												"td",
												null,
												utils.convertBytes(item.maxsize, 'Byte', 'GB').toFixed(2)
											),
											React.createElement(
												"td",
												null,
												utils.formatDateString(item.created)
											),
											React.createElement(
												"td",
												null,
												utils.formatDateString(item.updated)
											),
											React.createElement(
												"td",
												null,
												React.createElement(
													"button",
													{ className: "btn btn-default btn-sm", onClick: this._openStorageSettings.bind(this, index) },
													React.createElement("i", { className: "fa fa-edit" })
												)
											)
										);
									}.bind(this))
								)
							)
						)
					)
				)
			)
		);
	}
});

StoragesComponent = React.createFactory(StoragesComponent);
function StorageUsageComponent(props) {

	var frases = props.frases;
	var data = props.data;
	var storesize = props.utils.convertBytes(props.data.storesize, 'Byte', 'GB');
	var storelimit = props.utils.convertBytes(props.data.storelimit, 'Byte', 'GB');

	return React.createElement(
		'div',
		{ className: 'panel' },
		React.createElement(
			'div',
			{ className: 'panel-header' },
			React.createElement(
				'span',
				null,
				frases.USAGE.PANEL_TITLE
			)
		),
		React.createElement(
			'div',
			{ className: 'panel-body' },
			React.createElement(
				'div',
				{ className: 'row', style: { textAlign: "center" } },
				React.createElement(
					'div',
					{ className: 'col-xs-12 col-sm-4', style: { marginBottom: "20px" } },
					React.createElement(
						'h3',
						null,
						React.createElement(
							'small',
							null,
							frases.USAGE.USERS.CREATED
						),
						' ',
						data.users,
						' ',
						React.createElement(
							'small',
							null,
							frases.USAGE.USERS.FROM
						)
					),
					React.createElement(
						'h3',
						null,
						data.maxusers
					),
					React.createElement(
						'p',
						null,
						frases.USAGE.USERS.USAGE_ITEM
					)
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12 col-sm-4', style: { marginBottom: "20px" } },
					React.createElement(
						'h3',
						null,
						React.createElement(
							'small',
							null,
							frases.USAGE.STORAGE.USED
						),
						' ',
						parseFloat(storesize).toFixed(2),
						' ',
						React.createElement(
							'small',
							null,
							frases.USAGE.STORAGE.FROM
						)
					),
					React.createElement(
						'h3',
						null,
						parseFloat(storelimit).toFixed(2)
					),
					React.createElement(
						'p',
						null,
						frases.USAGE.STORAGE.USAGE_ITEM
					)
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12 col-sm-4', style: { marginBottom: "20px" } },
					React.createElement(
						'h3',
						null,
						React.createElement(
							'small',
							null,
							frases.USAGE.LINES.AVAILABLE
						)
					),
					React.createElement(
						'h3',
						null,
						data.maxlines
					),
					React.createElement(
						'p',
						null,
						frases.USAGE.LINES.USAGE_ITEM
					)
				)
			)
		)
	);
}
function UserStorageComponent(props) {

	return React.createElement(
		"tr",
		null,
		React.createElement(
			"td",
			null,
			props.user
		),
		React.createElement(
			"td",
			null,
			props.size
		),
		React.createElement(
			"td",
			null,
			props.limit
		)
	);
}

var UsersStorageComponent = React.createClass({
    displayName: 'UsersStorageComponent',


    propTypes: {
        data: React.PropTypes.array,
        frases: React.PropTypes.object
    },

    _convertBytes: function (value, fromUnits, toUnits) {
        var coefficients = {
            'Byte': 1,
            'KB': 1000,
            'MB': 1000000,
            'GB': 1000000000
        };
        return value * coefficients[fromUnits] / coefficients[toUnits];
    },

    render: function () {
        var frases = this.props.frases;
        var data = this.props.data;
        var size;
        var limit;

        return React.createElement(
            'div',
            { className: 'panel' },
            React.createElement(
                'div',
                { className: 'panel-header' },
                frases.STORAGE.STORAGE_ALLOCATION
            ),
            React.createElement(
                'div',
                { className: 'panel-body' },
                React.createElement(
                    'div',
                    { className: 'col-xs-12 col-custom' },
                    React.createElement(
                        'div',
                        { className: 'table-responsive' },
                        React.createElement(
                            'table',
                            { className: 'table table-condensed sortable' },
                            React.createElement(
                                'thead',
                                null,
                                React.createElement(
                                    'tr',
                                    null,
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.NUMBER
                                    ),
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.STORAGE.USED_SPACE,
                                        ' (GB)'
                                    ),
                                    React.createElement(
                                        'th',
                                        { style: { width: "180px" }, className: 'unsortable' },
                                        frases.STORAGE.TOTAL_SPACE,
                                        ' (GB)'
                                    )
                                )
                            ),
                            React.createElement(
                                'tbody',
                                null,
                                data.map(function (item, index) {

                                    size = item.size ? this._convertBytes(item.size, 'Byte', 'GB') : '0.00';
                                    limit = this._convertBytes(item.limit, 'Byte', 'GB');

                                    return React.createElement(UserStorageComponent, {
                                        key: index.toString(),
                                        user: item.user,
                                        size: item.size ? size.toFixed(2) : "0.00",
                                        limit: limit.toFixed(2)
                                    });
                                }.bind(this))
                            )
                        )
                    )
                )
            )
        );
    }
});

UsersStorageComponent = React.createFactory(UsersStorageComponent);
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
		var iptable = this.props.params.iptable;
		var adminiptable = this.props.params.adminiptable;

		if (!iptable.length) this._addRule(iptable);
		if (!adminiptable.length) this._addRule(adminiptable);

		this.setState({
			ipcheck: this.props.params.ipcheck,
			iptable: iptable,
			adminipcheck: this.props.params.adminipcheck,
			adminiptable: adminiptable
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
var NewTrunkComponent = React.createClass({
	displayName: "NewTrunkComponent",


	propTypes: {
		trunks: React.PropTypes.array
	},

	render: function () {
		return React.createElement(
			"div",
			{ className: "row" },
			this.props.trunks.map(function (item) {

				return React.createElement(
					"div",
					{ className: "col-xs-12 col-sm-4", key: item.type },
					React.createElement(TrunkTypeItemComponent, { params: item })
				);
			})
		);
	}
});

NewTrunkComponent = React.createFactory(NewTrunkComponent);
var TrunkTypeItemComponent = React.createClass({
	displayName: "TrunkTypeItemComponent",


	propTypes: {
		params: React.PropTypes.object
	},

	render: function () {
		var params = this.props.params,
		    contStyle = {
			borderRadius: 0,
			border: "1px solid #eee",
			marginBottom: "20px",
			backgroundColor: "#fff",
			boxShadow: "0 1px 1px rgba(0,0,0,0.05)"
		},
		    hrefStyle = {
			padding: "20px",
			display: "block",
			textDecoration: "none",
			color: "#555",
			fontSize: "16px"
		};

		return React.createElement(
			"div",
			{ style: contStyle },
			React.createElement(
				"a",
				{ href: params.href, style: hrefStyle },
				params.icon ? React.createElement("i", { className: params.icon }) : "",
				React.createElement(
					"span",
					null,
					" "
				),
				React.createElement(
					"span",
					null,
					params.name
				)
			)
		);
	}
});

TrunkTypeItemComponent = React.createFactory(TrunkTypeItemComponent);

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
var ChatTrunkComponent = React.createClass({
	displayName: 'ChatTrunkComponent',


	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		routes: React.PropTypes.array,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			routes: [],
			serviceParams: {}
		};
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {},
	// 		properties: {},
	// 		selectedRoute: {}
	// 	};
	// },

	componentWillMount: function () {
		var params = this.props.params;
		this.setState({
			type: this.props.type,
			params: params || {},
			serviceParams: this.props.serviceParams || null,
			submitDisabled: this._isSubmitDisabled(this.props),
			serivceInited: this._isServiceInited(this.props),
			selectedRoute: params.routes.length ? params.routes[0].target : this.props.routes.length ? this.props.routes[0] : null
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			type: props.type,
			serviceParams: props.serviceParams || null,
			submitDisabled: this._isSubmitDisabled(props),
			serivceInited: this._isServiceInited(props)
		});
	},

	_isServiceInited: function (props) {
		var inited = false;
		var type = props.type;
		var serviceParams = props.serviceParams;

		if (type === 'FacebookMessenger' || type === 'Facebook') {
			if (serviceParams.pages && serviceParams.pages.length) inited = true;
		}

		console.log('_isServiceInited: ', type, inited);

		return inited;
	},

	_isSubmitDisabled: function (props) {
		var disabled = false;
		var type = props.type;
		var serviceParams = props.serviceParams;

		if (type === 'FacebookMessenger' || type === 'Facebook') {
			if (!serviceParams.pages || !serviceParams.pages.length) disabled = true;
		}

		return disabled;
	},

	_onStateChange: function (state) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function (value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
	},

	_setObject: function () {
		var params = this.state.params;
		// var pages = this.state.pages;
		var selectedRoute = this.state.selectedRoute || this.props.routes[0];
		var properties = this.state.params.properties || {};

		console.log('setObject: ', properties, selectedRoute);

		// if(!pages || !pages.length) return console.error('page is not selected');;
		if (!selectedRoute) return console.error('route is not selected');

		params.pageid = properties.id;
		params.pagename = properties.name;
		params.properties = properties;
		params.routes = [];
		params.routes.push({
			target: {
				oid: selectedRoute.oid,
				name: selectedRoute.name
			},
			priority: 1,
			timeout: 86400
		});

		this.props.setObject(params, function (err, result) {
			this.setState({ params: params });
		}.bind(this));
	},

	_removeObject: function () {
		this.props.removeObject(this.state.params);
	},

	_onPropsChange: function (properties) {
		var params = this.state.params;
		params.properties = properties;
		this.setState({ params: params });
	},

	_onParamsChange: function (e) {
		var target = e.target;
		var params = this.state.params;

		params[target.name] = target.value;
		this.setState({ params: params });
	},

	_selectRoute: function (e) {
		console.log('_selectRoute: ', e);
		var value = e.target.value;
		var selectedRoute = {};
		this.props.routes.forEach(function (item) {
			if (item.oid === value) selectedRoute = item;
		});

		this.setState({ selectedRoute: selectedRoute });
	},

	_setService: function (type) {
		this.setState({ type: type });
	},

	_getComponentName: function (type) {
		var component = null;
		if (type === 'FacebookMessenger' || type === 'Facebook') {
			component = FacebookTrunkComponent;
		} else if (type === 'Twitter') {
			component = TwitterTrunkComponent;
		}

		return component;
	},

	render: function () {
		var params = this.state.params;
		var frases = this.props.frases;
		var ServiceComponent = this._getComponentName(this.state.type);

		console.log('ChatTrunkComponent: ', params, ServiceComponent);

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled || false,
				submitDisabled: this.state.submitDisabled,
				onStateChange: this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.state.params.pageid ? this._removeObject : null
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					this.props.services.map(function (item, index, array) {
						return React.createElement(TrunkServiceItemComponent, { key: item.id, params: item, className: 'col-sm-2 col-xs-4 text-center', onClick: this._setService });
					}.bind(this))
				)
			),
			React.createElement(
				PanelComponent,
				{ header: 'Trunk settings' },
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						!this.props.routes.length ? React.createElement(
							'p',
							null,
							'You need to',
							React.createElement(
								'a',
								{ href: '#chatchannel/chatchannel' },
								'Create a Chat channel'
							),
							' before connecting a Chat trnuk'
						) : React.createElement(
							'div',
							null,
							React.createElement(ServiceComponent, {
								frases: frases,
								properties: this.props.params.properties,
								serviceParams: this.state.serviceParams,
								loginHandler: this.props.serviceParams.loginHandler,
								onChange: this._onPropsChange,
								disabled: !!this.state.params.pageid
							}),
							this.state.serivceInited && React.createElement(
								'form',
								{ className: 'form-horizontal' },
								React.createElement('hr', null),
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										'Select Chat Channel'
									),
									React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement(
											'select',
											{ className: 'form-control', id: 'ctc-select-2', value: this.state.selectedRoute.oid, onChange: this._selectRoute },
											this.props.routes.map(function (item) {

												return React.createElement(
													'option',
													{ key: item.oid, value: item.oid },
													item.name
												);
											})
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										'Session timeout (min)'
									),
									React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement('input', { type: 'number', className: 'form-control', name: 'sessiontimeout', value: params.sessiontimeout, onChange: this._onParamsChange })
									)
								),
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										'Reply timeout (min)'
									),
									React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement('input', { type: 'number', className: 'form-control', name: 'replytimeout', value: params.replytimeout, onChange: this._onParamsChange })
									)
								)
							)
						)
					)
				)
			)
		);
	}
});

ChatTrunkComponent = React.createFactory(ChatTrunkComponent);
function TrunkServiceItemComponent(props) {

	function selectItem() {
		props.onClick(props.params.id);
		return;
	}

	return React.createElement(
		'div',
		{ className: props.className, style: { cursor: 'pointer' }, onClick: selectItem },
		React.createElement(
			'p',
			null,
			React.createElement('i', { className: props.params.icon })
		),
		React.createElement(
			'h5',
			null,
			props.params.name
		)
	);
}

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
var FacebookTrunkComponent = React.createClass({
	displayName: 'FacebookTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		loginHandler: React.PropTypes.func,
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	componentWillMount: function () {
		this.setState({
			selectedPage: this.props.properties || {}
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			selectedPage: props.properties || {}
		});
	},

	_selectPage: function (e) {
		console.log('_selectFbPage: ', e);
		var value = e.target.value;
		var selectedPage = {};
		var pages = this.props.serviceParams.pages;

		pages.forEach(function (item) {
			if (item.id === value) selectedPage = item;
		});

		selectedPage.access_token = this.props.serviceParams.userAccessToken;

		this.setState({ selectedPage: selectedPage });
		this.props.onChange(selectedPage);
	},

	render: function () {
		var pages = this.props.serviceParams.pages;
		var frases = this.props.frases;

		console.log('FacebookTrunkComponent: ', pages);

		return React.createElement(
			'div',
			null,
			!pages ? React.createElement(
				'div',
				{ className: 'text-center' },
				React.createElement(
					'p',
					null,
					'Connect your Facebook account. You need a Facebook account with permissions to manage a published Facebook page.'
				),
				React.createElement(
					'button',
					{ className: 'btn btn-lg btn-primary', onClick: this.props.loginHandler },
					React.createElement('i', { className: 'fa fa-fw fa-facebook' }),
					' Login with Facebook'
				)
			) : !pages.length ? React.createElement(
				'div',
				{ className: 'text-center' },
				'It seams that you haven\'t created or managed any Facebook Page yet. ',
				React.createElement(
					'a',
					{ href: '#' },
					'Learn how to create one'
				),
				' '
			) : React.createElement(
				'form',
				{ className: 'form-horizontal' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'ctc-select-1', className: 'col-sm-4 control-label' },
						'Select Facebook Page'
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						this.props.disabled ? React.createElement(
							'p',
							{ className: 'form-control-static' },
							this.state.selectedPage.name
						) : React.createElement(
							'select',
							{
								className: 'form-control',
								id: 'ctc-select-1',
								value: this.state.selectedPage.id,
								onChange: this._selectPage,
								disabled: this.props.disabled
							},
							pages.map(function (item) {

								return React.createElement(
									'option',
									{ key: item.id, value: item.id },
									item.name
								);
							})
						)
					)
				)
			)
		);
	}
});

FacebookTrunkComponent = React.createFactory(FacebookTrunkComponent);
var TwitterTrunkComponent = React.createClass({
	displayName: "TwitterTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		loginHandler: React.PropTypes.func,
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	// componentWillMount: function() {
	// 	this.setState({
	// 		selectedPage: this.props.properties || {}
	// 	});		
	// },

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_setToken: function () {},

	render: function () {
		var logedIn = this.props.serviceParams.pages;
		var frases = this.props.frases;

		console.log('TwitterTrunkComponent: ', logedIn);

		return React.createElement(
			"div",
			null,
			!logedIn ? React.createElement(
				"div",
				{ className: "text-center" },
				React.createElement(
					"button",
					{ className: "btn btn-lg btn-primary", onClick: this.props.loginHandler },
					React.createElement("i", { className: "fa fa-fw fa-twitter" }),
					" Login with Twitter"
				)
			) : React.createElement(
				"form",
				{ className: "form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "ctc-select-1", className: "col-sm-4 control-label" },
						"Select Facebook Page"
					),
					React.createElement("div", { className: "col-sm-4" })
				)
			)
		);
	}
});

TwitterTrunkComponent = React.createFactory(TwitterTrunkComponent);
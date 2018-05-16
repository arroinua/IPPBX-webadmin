var AvailableUsersComponent = React.createClass({
	displayName: 'AvailableUsersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		// data: React.PropTypes.array,
		onChange: React.PropTypes.func
		// modalId: React.PropTypes.string
	},

	getInitialState: function () {
		return {
			data: [],
			init: false
		};
	},

	componentWillMount: function () {
		var params = this.props.groupid ? { groupid: this.props.groupid } : null;
		this._getAvailableUsers(params, function (result) {
			var data = result.length ? this._sortItems(result, 'ext') : result;
			this.setState({ data: data, init: true });
		}.bind(this));
	},

	componentWillReceiveProps: function (props) {
		if (props.groupid !== this.props.groupid) {
			var params = props.groupid ? { groupid: props.groupid } : null;

			this.setState({ init: false });

			this._getAvailableUsers(params, function (result) {
				var data = result.length ? this._sortItems(result, 'ext') : result;
				this.setState({ data: data, init: true });
			}.bind(this));
		}
	},

	_getAvailableUsers: function (params, callback) {
		json_rpc_async('getAvailableUsers', params || null, function (result) {
			console.log('getAvailableUsers: ', result);
			callback(result);
		}.bind(this));
	},

	_sortItems: function (array, sortBy) {
		return array.sort(function (a, b) {
			return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
		});
	},

	_saveChanges: function () {
		var selectedMembers = this.state.data.filter(function (item) {
			return item.selected;
		});

		this.props.onChange(selectedMembers);
		// this.props.onSubmit(selectedMembers);
	},

	_selectMember: function (item) {
		var data = this.state.data;
		data[item].selected = !data[item].selected;
		this.setState({ data: data });

		this._saveChanges();
	},

	_selectAllMembers: function (e) {
		e.preventDefault();
		var data = this.state.data;
		data.map(function (item) {
			item.selected = !item.selected;
			return item;
		});
		this.setState({ data: data });

		this._saveChanges();
	},

	_filterItems: function (e) {
		// var value = e.target.value;
		// var data = this.state.data;

		// data = data.filter(function(item) {
		// 	if(item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
		// 		return item;
		// 	}
		// });

		// this.setState({
		// 	data: data
		// });
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				this.state.init ? React.createElement(
					'ul',
					{ style: { minHeight: "200px", maxHeight: "400px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 } },
					React.createElement(
						'li',
						null,
						React.createElement('input', { className: 'form-control', onChange: this._filterItems, placeholder: frases.SEARCH, autoFocus: true })
					),
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
				) : React.createElement(Spinner, null)
			)
		);
	}

});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);
function DeleteObjectModalComponent(props) {

	var frases = props.frases;

	function _getBody() {
		return React.createElement(
			"div",
			null,
			React.createElement(
				"h4",
				null,
				frases.DELETE,
				" ",
				React.createElement(
					"strong",
					null,
					props.name
				),
				"?"
			),
			props.warning && React.createElement(
				"div",
				{ className: "alert alert-warning", role: "alert" },
				React.createElement(
					"p",
					null,
					props.warning
				)
			)
		);
	}

	function _onSubmit() {
		props.onSubmit();
	}

	return React.createElement(ModalComponent, {
		size: "sm",
		type: "danger",
		closeOnSubmit: true,
		submitText: frases.DELETE,
		cancelText: frases.CANCEL,
		submit: _onSubmit,
		body: _getBody()
	});
}

DeleteObjectModalComponent = React.createFactory(DeleteObjectModalComponent);
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
var FileUpload = React.createClass({
	displayName: "FileUpload",


	propTypes: {
		frases: React.PropTypes.object,
		value: React.PropTypes.string,
		name: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	componentWillMount: function () {
		this.setState({
			value: this.props.value || ''
		});
	},

	_onClick: function (e) {
		var target = e.target;
		target.nextSibling.click();
	},

	_onClear: function () {
		this.setState({
			value: ""
		});

		this.props.onChange({
			name: this.props.name,
			filename: "",
			file: null
		});
	},

	_onFileSelect: function (e) {
		console.log('_onFileSelect: ', e);
		var filename;
		var files = e.target.files;
		var file = files[0];
		if (file) {
			filename = this._getFileName(file.name);
		} else {
			filename = '';
		}

		this.setState({
			value: filename
		});

		this.props.onChange({
			name: e.target.name,
			filename: filename,
			file: file
		});
		// this.props.onChange(e);
	},

	_getFileName: function (ArrayOrString) {
		if (ArrayOrString !== null) {
			var name = '';
			if (Array.isArray(ArrayOrString)) {
				ArrayOrString.forEach(function (file, index, array) {
					name += ' ' + file;
					if (index !== array.length - 1) name += ',';
				});
			} else {
				name = ' ' + ArrayOrString;
			}
			return name;
		}
		return '';
	},

	render: function () {
		return React.createElement(
			"div",
			{ className: "input-group" },
			React.createElement("input", { type: "text", className: "form-control", value: this.state.value, readOnly: true }),
			React.createElement(
				"span",
				{ className: "input-group-btn" },
				React.createElement(
					"button",
					{ className: "btn btn-default", type: "button", onClick: this._onClear },
					React.createElement("i", { className: "fa fa-trash" })
				),
				React.createElement(
					"button",
					{ className: "btn btn-default", type: "button", onClick: this._onClick },
					this.props.frases.UPLOAD
				),
				React.createElement("input", {
					type: "file",
					name: this.props.name,
					onChange: this._onFileSelect,
					style: { position: 'absolute', display: 'inline-block', opacity: 0, width: 0 }
				})
			)
		);
	}

});

FileUpload = React.createFactory(FileUpload);
var FilterInputComponent = React.createClass({
	displayName: "FilterInputComponent",


	propTypes: {
		frases: React.PropTypes.object,
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
			React.createElement("input", { type: "text", className: "form-control", placeholder: frases ? frases.SEARCH : "Search", onChange: this._filter }),
			React.createElement("i", { className: "fa fa-search fa-fw form-control-feedback" })
		);
	}
});

FilterInputComponent = React.createFactory(FilterInputComponent);
var GroupFeaturesComponent = React.createClass({
	displayName: 'GroupFeaturesComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupKind: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {}
		});
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		params: props.params
	// 	});
	// },

	_onChange: function (e) {
		var state = this.state;
		var target = e.target;
		// var type = target.getAttribute('data-type') || target.type;
		// var value = type === 'checkbox' ? target.checked : target.value;
		var value = target.checked;

		state.params[target.name] = value;

		console.log('_handleOnChange: ', target, !value);

		this.setState({
			state: state
		});

		this.props.onChange(state.params);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;

		console.log('GroupFeaturesComponent: ', params);

		return React.createElement(
			'form',
			{ className: 'form-horizontal' },
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6 col-xs-12' },
					React.createElement(
						'div',
						{ className: 'col-xs-12 pl-kind pl-users' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'recording', checked: params.recording, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.ALLOW_RECORDING
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'busyover', checked: params.busyover, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.BUSYOVER
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'callpickup', checked: params.callpickup, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.PICKUP
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'monitor', checked: params.monitor, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.CALLMONITOR
							)
						)
					),
					this.props.groupKind === 'equipment' && React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								'div',
								{ className: 'checkbox' },
								React.createElement(
									'label',
									null,
									React.createElement('input', { type: 'checkbox', name: 'dnd', checked: params.dnd, onChange: this._onChange }),
									' ',
									frases.USERS_GROUP.FUNCTIONS.DND
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								'div',
								{ className: 'checkbox' },
								React.createElement(
									'label',
									null,
									React.createElement('input', { type: 'checkbox', name: 'callwaiting', checked: params.callwaiting, onChange: this._onChange }),
									' ',
									frases.USERS_GROUP.FUNCTIONS.CALLWAITING
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'forwarding', checked: params.forwarding, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.FORWARDING
							)
						)
					),
					this.props.groupKind === 'users' && React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'voicemail', checked: params.voicemail, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.VOICEMAIL
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-6 col-xs-12' },
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'dndover', checked: params.dndover, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.DNDOVER
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'busyoverdeny', checked: params.busyoverdeny, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.BUSYOVERDENY
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'pickupdeny', checked: params.pickupdeny, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.PICKUPDENY
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'monitordeny', checked: params.monitordeny, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.MONITORDENY
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'outcallbarring', checked: params.outcallbarring, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.OUTBARGING
							),
							React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': '{GRP_OUTBARGING}' })
						)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'costroutebarring', checked: params.costroutebarring, onChange: this._onChange }),
								' ',
								frases.USERS_GROUP.FUNCTIONS.COSTBARGING
							),
							React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': '{GRP_COSTBARGING}' })
						)
					)
				)
			)
		);
	}
});

GroupFeaturesComponent = React.createFactory(GroupFeaturesComponent);

var ModalComponent = React.createClass({
	displayName: 'ModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		size: React.PropTypes.string,
		type: React.PropTypes.string,
		title: React.PropTypes.string,
		submitText: React.PropTypes.string,
		cancelText: React.PropTypes.string,
		closeOnSubmit: React.PropTypes.bool,
		submit: React.PropTypes.func,
		onClose: React.PropTypes.func,
		body: React.PropTypes.element,
		children: React.PropTypes.array
	},

	el: null,

	componentDidMount: function () {
		if (this.props.open === true || this.props.open === undefined) {
			this._openModal();
		}

		if (this.props.onClose) $(this.el).on('hidden.bs.modal', this.props.onClose);
	},

	componentDidUpdate: function () {
		if (this.props.open === true || this.props.open === undefined) {
			this._openModal();
		}
	},

	componentWillReceiveProps: function (props) {
		if (props.open === false) {
			this._closeModal();
		} else if (props.open === true) {
			this._openModal();
		}
	},

	_openModal: function () {
		if (this.el) $(this.el).modal();
	},

	_closeModal: function () {
		console.log('_closeModal: ', this.el);
		$(this.el).modal('hide');
	},

	_submitModal: function (e) {
		this.props.submit();
		if (this.props.closeOnSubmit) this._closeModal();
	},

	_onRef: function (el) {
		console.log('_onRef:', el);
		this.el = el;
	},

	render: function () {
		return React.createElement(
			'div',
			{ className: 'modal fade', ref: this._onRef, tabIndex: '-1', role: 'dialog', 'aria-labelledby': this.props.title },
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
							{ className: 'btn btn-link', 'data-dismiss': 'modal' },
							this.props.cancelText
						),
						React.createElement(
							'button',
							{ className: "btn btn-" + (this.props.type || "primary"), onClick: this._submitModal },
							this.props.submitText
						)
					) : null
				)
			)
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);
var NumberTransformsComponent = React.createClass({
	displayName: "NumberTransformsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		transforms: React.PropTypes.array,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			transforms: []
		};
	},

	componentWillMount: function () {
		this.setState({
			transforms: this.props.transforms || []
		});
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		params: props.params
	// 	});
	// },

	_addRule: function (e) {
		var transforms = this.state.transforms;
		transforms.push({
			number: "",
			strip: false,
			prefix: ""
		});
		this.setState({ transforms: transforms });
	},

	_removeRule: function (index) {
		console.log("_removeRule: ,", index);
		var transforms = this.state.transforms;
		transforms.splice(index, 1);
		this.setState({
			transforms: transforms
		});
	},

	_onChange: function (index, e) {
		var transforms = this.state.transforms;
		var transform = transforms[index];
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		// if(target.name === 'strip') {
		// 	if(value === 'P') {
		// 		if(this.props.type === 'inbounda') transform.prefix = 'P';
		// 		else transform.prefix = '';
		// 	} else {
		// 		transform.prefix = '';
		// 	}
		// }

		transform[target.name] = type === 'number' ? parseFloat(value) : value;

		console.log('_handleOnChange: ', transforms, value);

		this.setState({
			transforms: transforms
		});

		this.props.onChange(this._parseTransforms(transforms));
	},

	_parseTransforms: function (array) {
		return array.reduce(function (result, item) {
			if (item.number) {
				result.push({
					number: item.number,
					strip: item.strip,
					prefix: item.prefix
				});

				return result;
			}
		}, []);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-12" },
				React.createElement(
					"div",
					{ className: "alert alert-info", role: "alert" },
					React.createElement(
						"button",
						{ type: "button", className: "close", "data-dismiss": "alert", "aria-label": "Close" },
						React.createElement(
							"span",
							{ "aria-hidden": "true" },
							"\xD7"
						)
					),
					React.createElement(
						"p",
						null,
						React.createElement(
							"strong",
							null,
							frases.NUMBER_TRANSFORMS.NUMBER_TRANSFORMS
						)
					),
					React.createElement(
						"p",
						null,
						frases.NUMBER_TRANSFORMS.HELPERS.NUMBER
					),
					React.createElement(
						"p",
						null,
						frases.NUMBER_TRANSFORMS.HELPERS.STRIP
					),
					React.createElement(
						"p",
						null,
						frases.NUMBER_TRANSFORMS.HELPERS.PREFIX
					),
					React.createElement(
						"p",
						null,
						frases.NUMBER_TRANSFORMS.HELPERS.DOLLAR
					),
					React.createElement(
						"a",
						{ href: "#", className: "alert-link" },
						frases.NUMBER_TRANSFORMS.HELPERS.LEARN_MORE_LINK
					)
				)
			),
			React.createElement(
				"div",
				{ className: "col-sm-12" },
				React.createElement(
					"div",
					{ style: { marginBottom: "10px" } },
					React.createElement(
						"strong",
						null,
						frases.NUMBER_TRANSFORMS[this.props.type.toUpperCase()]
					),
					React.createElement(
						"button",
						{ type: "button", className: "btn btn-primary", style: { marginLeft: "5px" }, onClick: this._addRule },
						frases.NUMBER_TRANSFORMS.ADD_RULE
					)
				),
				React.createElement(
					"div",
					{ className: "table-responsive n-transforms-cont" },
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
									frases.NUMBER
								),
								React.createElement(
									"th",
									null,
									React.createElement("i", { className: "fa fa-cut fa-rotate-90 fa-fw", title: "Strip" })
								),
								React.createElement(
									"th",
									null,
									frases.PREFIX
								)
							)
						),
						React.createElement(
							"tbody",
							null,
							this.state.transforms.map(function (item, index) {
								return React.createElement(
									"tr",
									{ key: index },
									React.createElement(
										"td",
										null,
										React.createElement("input", { type: "text", className: "form-control", name: "number", value: item.number, placeholder: "Original number/prefix", onChange: this._onChange.bind(this, index) })
									),
									React.createElement(
										"td",
										{ className: "text-center" },
										React.createElement("input", { type: "checkbox", name: "strip", autoComplete: "none", checked: item.strip, onChange: this._onChange.bind(this, index) })
									),
									React.createElement(
										"td",
										null,
										item.strip !== 'P' ? React.createElement("input", { type: "text", className: "form-control", name: "prefix", value: item.prefix, placeholder: "Number/prefix to substitute", onChange: this._onChange.bind(this, index) }) : this.props.type === 'inbounda' ? React.createElement("input", { type: "text", className: "form-control", name: "prefix", value: item.prefix, placeholder: "Exit code in format %NN (e.g. %63)", onChange: this._onChange.bind(this, index) }) : null
									),
									React.createElement(
										"td",
										null,
										React.createElement(
											"button",
											{
												type: "button",
												className: "btn btn-link btn-default",
												onClick: this._removeRule.bind(this, index),
												style: { padding: "0" }
											},
											React.createElement("i", { className: "fa fa-remove fa-fw" })
										)
									)
								);
							}.bind(this))
						)
					)
				)
			)
		);
	}
});

NumberTransformsComponent = React.createFactory(NumberTransformsComponent);

var ObjectName = React.createClass({
	displayName: 'ObjectName',


	propTypes: {
		name: React.PropTypes.string,
		frases: React.PropTypes.object,
		placeholder: React.PropTypes.string,
		enabled: React.PropTypes.bool,
		submitDisabled: React.PropTypes.bool,
		onStateChange: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		onCancel: React.PropTypes.func,
		addSteps: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			name: '',
			submitDisabled: false,
			enabled: false,
			pending: false
		};
	},

	componentWillMount: function () {
		this.setState({
			name: this.props.name || '',
			enabled: this.props.enabled,
			submitDisabled: !this.props.name || this.props.submitDisabled
		});
	},

	componentDidMount: function () {
		if (this.props.addSteps) {
			this.props.addSteps([{
				element: '#objname',
				popover: {
					title: this.props.frases.GET_STARTED.STEPS.OBJECT_NAME["1"].TITLE,
					description: '',
					position: 'bottom'
				}
			}]);
		}
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

		this.setState({ name: target.value, submitDisabled: disabled || this.props.submitDisabled });
		this.props.onChange(target.value);
	},

	_toggleState: function (e) {
		var state = !this.state.enabled;
		this.setState({ enabled: state, pending: true });
		this.props.onStateChange(state, function (err, result) {
			console.log('ObjectName _toggleState: ', err, result);
			this.setState({ pending: false });
			if (err) this.setState({ enabled: !state });
		}.bind(this));
	},

	_getFooter: function () {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;

		return React.createElement(
			'div',
			{ className: 'clearfix' },
			props.onSubmit ? React.createElement(
				'div',
				{ className: 'pull-left' },
				React.createElement(
					'button',
					{ type: 'button', style: { marginRight: "5px" }, className: 'btn btn-success', onClick: props.onSubmit, disabled: state.submitDisabled },
					React.createElement('i', { className: 'fa fa-check fa-fw' }),
					' ',
					frases.SAVE
				),
				React.createElement(
					'span',
					{ className: 'text-muted', style: { display: state.submitDisabled ? 'inline-block' : 'none' } },
					frases.GROUPSNAME_SUBMIT_LABEL.toLowerCase()
				)
			) : "",
			props.onCancel ? React.createElement(
				'button',
				{ type: 'button', className: 'btn btn-link btn-danger pull-right', onClick: props.onCancel },
				React.createElement('i', { className: 'fa fa-trash fa-fw' }),
				' ',
				frases.DELETE
			) : ""
		);
	},

	render: function () {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;
		var Footer = this._getFooter();

		return React.createElement(
			PanelComponent,
			{ classname: 'object-name-cont', footer: Footer },
			React.createElement(
				'div',
				{ className: 'input-group object-name' },
				React.createElement('input', {
					id: 'objname',
					type: 'text',
					className: 'form-control',
					placeholder: props.placeholder || frases.GROUPSNAME,
					value: state.name,
					onChange: this._onChange,
					required: true,
					autoFocus: true
				}),
				props.enabled !== undefined && React.createElement(
					'span',
					{ className: 'input-group-addon' },
					React.createElement(
						'div',
						{ className: 'switch switch-md' },
						React.createElement('input', {
							className: 'cmn-toggle cmn-toggle-round',
							type: 'checkbox',
							checked: state.enabled
						}),
						React.createElement('label', {
							htmlFor: 'enabled',
							'data-toggle': 'tooltip',
							title: frases.OBJECT__STATE,
							onClick: this._toggleState,
							style: {
								opacity: state.pending ? 0.2 : 1,
								pointerEvents: state.pending ? 'none' : 'auto'
							}
						})
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
		// getOptions: React.PropTypes.func,
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		extOnly: React.PropTypes.bool,
		// clearCurrObjRoute: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			route: {},
			routeId: "",
			options: null
		};
	},

	componentWillMount: function () {
		var options = [],
		    route = this.props.routes.length ? this.props.routes[0] : null;

		this._getAvailablePool(function (result) {
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
				this.setState({ route: options[1] });
				this._onChange(options[1]);
			}
		}.bind(this));
	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getAvailablePool: function (cb) {
		window.json_rpc_async('getObject', { oid: 'user' }, function (result) {
			console.log('getAvailablePool: ', result);
			cb(result.available.sort());
		});
	},

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
		return this.state.options ? React.createElement(Select3, { value: this.state.route, readonly: this.props.extOnly, options: this.state.options, onChange: this._onChange }) : React.createElement('h4', { className: 'fa fa-fw fa-spinner fa-spin' });
	}
});

ObjectRoute = React.createFactory(ObjectRoute);
function OptGroupComponent(props) {

	function _createOptionsGroups(routes) {
		var optgroups = {},
		    optgroup,
		    option;
		var list = routes.map(function (item) {
			if (optgroups[item.kind]) {
				optgroup = optgroups[item.kind];
			} else {
				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
				optgroups[kind] = optgroup;
				objects.appendChild(optgroup);
			}
			oid = result[i].oid;
			option = document.createElement('option');
			option.value = oid;
			option.innerHTML = result[i].name;
			optgroup.appendChild(option);
		});
		kind = result[i].kind;
	}

	return null;
}

OptGroupComponent = React.createFactory(OptGroupComponent);
function PanelComponent(props) {

	return React.createElement(
		"div",
		{ className: "panel " + (props.classname || "") },
		props.header && React.createElement(
			"div",
			{ className: "panel-header" },
			props.header
		),
		React.createElement(
			"div",
			{ className: "panel-body" },
			props.children || props.body
		),
		props.footer && React.createElement(
			"div",
			{ className: "panel-footer" },
			props.footer
		)
	);
}
function Spinner(props) {
	return React.createElement(
		"h3",
		{ className: "text-center" },
		React.createElement("i", { className: "fa fa-fw fa-spinner fa-spin" })
	);
}
var Select3 = React.createClass({
  displayName: 'Select3',


  propTypes: {
    name: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    value: React.PropTypes.object,
    readonly: React.PropTypes.bool,
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
      options: this.props.options,
      readonly: this.props.readonly || false
    });
  },

  componentWillReceiveProps: function (newProps) {
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
    }.bind(this), 100);
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

  // onSelected: function(el) {
  //   if(el) {
  //     this.selectedOptionEl = el;
  //   }
  // },

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

    return React.createElement(
      'div',
      { className: className },
      React.createElement('input', {
        type: 'text',
        name: this.props.name ? this.props.name : '',
        placeholder: this.props.placeholder ? this.props.placeholder : '',
        className: 'Select3-input',
        readOnly: this.props.readonly,
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
          onSelect: this.selectValue,
          selectedIndex: this.state.highlightedIndex,
          options: this.state.options
        })
      ) : null
    );
  }
});

Select3 = React.createFactory(Select3);
function Select3Menu(props) {

	// function selectItem(params) {
	function selectItem(item, index, e) {
		e.preventDefault();
		props.onSelect({ value: item.value, label: item.label }, index);
		// props.onClick(params);
	}

	return React.createElement(
		"ul",
		{ ref: props.getMenuRef },
		props.options.map(function (item, index) {
			return React.createElement(
				"li",
				{ key: "option-" + index + "-" + item.value },
				React.createElement(
					"a",
					{
						href: "#",
						className: props.selectedIndex === index ? 'is-selected' : '',
						onClick: selectItem.bind(this, item, index)
					},
					item.label
				)
			);
		})
	);
};
var ChatchannelComponent = React.createClass({
	displayName: 'ChatchannelComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
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

	_onAddMembers: function () {
		this.props.onAddMembers();
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
				enabled: params.enabled,
				onStateChange: this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.state.removeObject
			}),
			React.createElement(GroupMembersComponent, { frases: frases, members: members, getExtension: this.props.getExtension, onAddMembers: this._onAddMembers, deleteMember: this.props.deleteMember })
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);
var ChannelRouteComponent = React.createClass({
	displayName: "ChannelRouteComponent",


	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		routes: React.PropTypes.array,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			options: {},
			routes: null,
			selectedRoute: {}
		};
	},

	componentWillMount: function () {
		this._setRoutes(this.props);
	},

	componentDidMount: function () {
		var frases = this.props.frases;

		this.props.addSteps([{
			element: '.channel-routes',
			popover: {
				title: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].TITLE,
				description: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].DESC,
				position: 'bottom'
			}
		}, {
			element: '.create-group-links',
			popover: {
				title: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].TITLE,
				description: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].DESC,
				position: 'top'
			}
		}]);
	},

	componentWillReceiveProps: function (props) {
		if (props.type !== this.props.type) {
			this.setState({ routes: [] });
			this._setRoutes(props);
		}
	},

	_setRoutes: function (props) {
		// var props = this.props;
		var selectedRoute = {};

		this._getAvailableRoutes(props.type, function (result) {
			console.log('_getAvailableRoutes: ', result);

			selectedRoute = props.routes && props.routes.length ? props.routes[0].target : result && result.length ? result[0] : {};

			this.setState({
				routes: result || [],
				selectedRoute: selectedRoute
			});

			this.props.onChange(selectedRoute);
		}.bind(this));
	},

	_selectRoute: function (e) {
		var value = e.target.value;
		var selectedRoute = {};
		this.state.routes.forEach(function (item) {
			if (item.oid === value) selectedRoute = item;
		});

		console.log('_selectRoute: ', selectedRoute);

		this.setState({ selectedRoute: selectedRoute });
		this.props.onChange(selectedRoute);
	},

	_getAvailableRoutes: function (type, callback) {
		// var type = this.props.type;
		console.log('_getAvailableRoutes: ', type);
		var groupType = type === 'Telephony' ? ['hunting', 'icd', 'attendant'] : ['chatchannel'];
		var extensions = [];

		getExtensions(function (result) {
			extensions = filterObject(result, ['user', 'phone']);

			getObjects(groupType, function (result) {
				var routes = result.concat(extensions);

				callback(routes);
			});
		});
	},

	_handleOnChange: function (e) {
		var target = e.target;
		var params = this.state.params;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = value;
		this.setState({ options: params });
	},

	_groupObjects: function (array) {
		var frases = this.props.frases;
		var groups = {};
		var kind = null;
		var optgroup = null;

		array.map(function (item) {
			kind = item.kind;
			if (!groups[kind]) {
				groups[kind] = [];
			}

			groups[kind].push(item);

			return item;
		});

		return Object.keys(groups).map(function (key) {

			return React.createElement(
				"optgroup",
				{ label: frases.KINDS[key], key: key },
				groups[key].map(function (item) {

					return React.createElement(
						"option",
						{ key: item.oid, value: item.oid },
						item.name
					);
				})
			);
		});
	},

	render: function () {
		var frases = this.props.frases;
		var selectedRoute = this.state.selectedRoute;

		// this.state.routes.map(function(item) {
		// 	return <option key={item.oid} value={item.oid}>{item.name}</option>
		// }.bind(this))

		return this.state.routes ? React.createElement(
			"div",
			null,
			React.createElement(
				"label",
				{ htmlFor: "ctc-select-2", className: "col-sm-4 control-label" },
				frases.CHAT_TRUNK.SELECT_SERVICE_GROUP
			),
			this.state.routes.length ? React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"select",
					{ className: "form-control channel-routes", value: selectedRoute.oid, onChange: this._selectRoute },
					this._groupObjects(this.state.routes)
				)
			) : React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"p",
					null,
					frases.CHAT_TRUNK.NO_SERVICE_GROUP
				)
			),
			this.props.type === 'Telephony' ? React.createElement(
				"div",
				{ className: "col-sm-4 create-group-links" },
				React.createElement(
					"a",
					{ href: "#hunting/hunting", className: "btn btn-link", onClick: this._createGroup },
					React.createElement("i", { className: "fa fa-plus-circle" }),
					" ",
					frases.CHAT_TRUNK.CREATE_HUNTING_GROUP
				),
				React.createElement(
					"a",
					{ href: "#icd/icd", className: "btn btn-link", onClick: this._createGroup },
					React.createElement("i", { className: "fa fa-plus-circle" }),
					" ",
					frases.CHAT_TRUNK.CREATE_ICD_GROUP
				)
			) : React.createElement(
				"div",
				{ className: "col-sm-4 create-group-links" },
				React.createElement(
					"a",
					{ href: "#chatchannel/chatchannel", className: "btn btn-link", onClick: this._createGroup },
					React.createElement("i", { className: "fa fa-plus-circle" }),
					" ",
					frases.CHAT_TRUNK.CREATE_SERVICE_GROUP
				)
			)
		) : React.createElement(Spinner, null);
	}
});

ChannelRouteComponent = React.createFactory(ChannelRouteComponent);
var ChatTrunkComponent = React.createClass({
	displayName: 'ChatTrunkComponent',


	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		selected: React.PropTypes.string,
		getObjects: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		updateBalance: React.PropTypes.func,
		confirmRemoveObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		confirmPayment: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		highlightStep: React.PropTypes.func,
		onTokenReceived: React.PropTypes.func,
		initSteps: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			routes: null,
			serivceInited: false,
			selectedRoute: null
		};
	},

	componentWillMount: function () {
		var params = this.props.params;
		var type = this.props.type;

		this.setState({
			routes: [],
			type: type,
			params: params || {},
			serivceInited: true
		});

		this._setService(this.props.selected || type);
	},

	componentDidMount: function () {
		if (this.props.addSteps && !this.props.params.pageid) {
			// this.props.addSteps([{
			// 	element: '.sessiontimeout',
			// 	popover: {
			// 		title: 'Session timeout',
			// 		description: 'Set how long does the requests be allocated to the assigned user before it goes to the unified queue.',
			// 		position: 'top'
			// 	}
			// }]);

			this.props.initSteps();
		}
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			type: props.type || this.props.type,
			params: props.params || this.props.params
		});
	},

	_onStateChange: function (state, callback) {
		var params = this.state.params;
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state, function (err, result) {
			if (callback) callback(err, result);
		});
	},

	_onNameChange: function (value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
	},

	_setObject: function () {
		var params = {};
		var selectedRoute = this.state.selectedRoute;
		var properties = this.state.params.properties;

		console.log('setObject: ', properties, selectedRoute, this.state.params);

		if (!selectedRoute || !selectedRoute.oid || !selectedRoute.name) return notify_about('info', this.props.frases.CHAT_TRUNK.SERVICE_GROUP_NOT_SELECTED);

		Object.keys(this.state.params).forEach(function (key) {
			params[key] = this.state.params[key];
		}.bind(this));

		params.type = this.state.type;
		if (properties.id) params.pageid = properties.id;
		params.pagename = properties.name || '';
		params.routes = [{
			target: {
				oid: selectedRoute.oid,
				name: selectedRoute.name
			},
			priority: 1,
			timeout: 86400
		}];

		console.log('setObject params: ', params);

		if (!params.pageid && params.type === 'Telephony') {
			this._buyDidNumber(params.properties, function (err, result) {

				if (err) return notify_about('error', err.message);

				params.pageid = params.pagename = result;
				params.properties = { number: result, id: result };

				this.props.setObject(params);
			}.bind(this));
		} else {
			this.props.setObject(params);
		}
	},

	_buyDidNumber(params, callback) {
		console.log('_buyDidNumber: ', params);
		if (!params.dgid || !params.poid) return callback({ message: this.props.frases.CHAT_TRUNK.DID.NOTIFY_LOCATION_NOT_SELECTED });

		var thisObj = this;

		this.props.confirmPayment(params, function (result) {

			show_loading_panel();

			BillingApi.orderDid(params, function (err, response) {
				console.log('_buyDidNumber: ', err, response, params);

				remove_loading_panel();

				if (err) {
					if (err.name === 'NO_PAYMENT_SOURCE') {
						thisObj.props.updateBalance({ chargeAmount: params.chargeAmount, currency: params.currency }, function (err, result) {
							thisObj._buyDidNumber(params, callback);
						});
						return;
					} else {
						return callback(err);
					}
				}

				if (!response.success && response.error.name === 'ENOENT') {
					return callback(this.props.frases.CHAT_TRUNK.DID.NOTIFY_NO_AVAILABLE_NUMBERS);
				}

				callback(null, response.result.number);
			});
		});
	},

	// _buyDidNumber(params, callback) {
	// 	console.log('_buyDidNumber: ', params);

	//     if(!params.dgid || !params.poid) return callback({ message: this.props.frases.CHAT_TRUNK.DID.NOTIFY_LOCATION_NOT_SELECTED });

	//     var thisObj = this;

	//     show_loading_panel();

	// 	BillingApi.orderDid(params, function(err, response) {
	// 		console.log('_buyDidNumber: ', err, response, params);

	// 		remove_loading_panel();

	// 		if(err) {
	// 			if(err.name === 'NO_PAYMENT_SOURCE') {
	// 				thisObj.props.updateBalance({ chargeAmount: params.chargeAmount, currency: params.currency }, function(err, result) {
	// 					thisObj._buyDidNumber(params, callback);
	// 				});
	// 				return;
	// 			} else {
	// 				return callback(err);
	// 			}
	// 		}

	// 		if(!response.success && response.error.name === 'ENOENT') {
	// 			return callback(this.props.frases.CHAT_TRUNK.DID.NOTIFY_NO_AVAILABLE_NUMBERS);
	// 		}

	// 		callback(null, response.result.number);

	// 	});
	// },

	_removeObject: function () {
		var state = this.state;
		var type = state.type;
		var removeObject = this.props.removeObject;

		this.props.confirmRemoveObject(type, function () {
			show_loading_panel();

			if (type === 'Telephony') {
				if (!state.params.properties.number) return console.error('number is not defined');

				BillingApi.unassignDid({ number: state.params.properties.number }, function (err, response) {
					if (err) return notify_about('error', err.message);
					removeObject();
					remove_loading_panel();
				});
			} else {
				removeObject();
				remove_loading_panel();
			}
		});
	},

	_onPropsChange: function (properties) {
		// var params = this.state.params;
		// params.properties = properties;
		var params = this.state.params;
		params.properties = properties;
		this.setState({ params: params });
	},

	_onParamsChange: function (e) {
		var target = e.target;
		var params = this.state.params;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if (target.name === 'replytimeout' || target.name === 'sessiontimeout') value = parseInt(value, 10) * 60;

		params[target.name] = value;

		console.log('_onParamsChange: ', target.name, value);

		this.setState({ params: params });
	},

	// _selectRoute: function(e) {
	// 	var value = e.target.value;
	// 	var selectedRoute = {};
	// 	this.state.routes.forEach(function(item) {
	// 		if(item.oid === value) selectedRoute = item;
	// 	});

	// 	console.log('_selectRoute: ', selectedRoute);

	// 	this.setState({ selectedRoute: selectedRoute });
	// },

	_selectRoute: function (route) {
		console.log('_selectRoute: ', route);
		this.setState({ selectedRoute: route });
	},

	_setService: function (type) {
		if (this.state.type === type) return;

		var params = this.props.params;
		params.properties = params.pageid ? params.properties : {};
		// this._getAvailableRoutes(type, function(result) {
		this.setState({
			type: type,
			params: params
			// properties: 
			// routes: result,
			// selectedRoute: (params.routes && params.routes.length) ? params.routes[0].target : ((this.props.routes && this.props.routes.length) ? this.props.routes[0] : [])
		});
		// }.bind(this));
	},

	// _getAvailableRoutes: function(type, callback) {
	// 	console.log('_getAvailableRoutes: ', type);
	// 	var groupType = type === 'Telephony' ? ['hunting', 'icd'] : ['chatchannel'];
	// 	var routes = [];

	// 	getExtensions(function(result) {
	// 		routes = result;
	// 		this.props.getObjects(groupType, function(result) {
	// 			routes = routes.concat(result);
	// 			callback(routes);
	// 		});
	// 	}.bind(this));
	// },

	// _getComponentName: function(type) {
	// 	var component = null;
	// 	if(type === 'FacebookMessenger' || type === 'Facebook') {
	// 		component = FacebookTrunkComponent;
	// 	} else if(type === 'Twitter') {
	// 		component = TwitterTrunkComponent;
	// 	} else if(type === 'Viber') {
	// 		component = ViberTrunkComponent;
	// 	} else if(type === 'Email') {
	// 		component = EmailTrunkComponent;
	// 	}

	// 	return component;		
	// },

	_getServiceParams: function (type) {
		return this.props.services.reduce(function (prev, next) {
			if (next.id === type) prev = next;
			return prev;
		}, {});
	},

	_toMinutes: function (value) {
		return parseInt(value, 10) / 60;
	},

	// _createGroup: function(e) {
	// 	e.preventDefault();
	// 	this.props.createGroup(this.state.type);
	// },
	// {
	// 	this.state.routes ? (
	// 		this.state.routes.length ? (
	// 			<div className="form-group">
	// 				<label htmlFor="ctc-select-2" className="col-sm-4 control-label">{frases.CHAT_TRUNK.SELECT_CHANNEL}</label>
	// 				<div className="col-sm-4">
	// 					<select className="form-control" id="ctc-select-2" value={this.state.selectedRoute.oid} onChange={this._selectRoute}>
	// 						{
	// 							this.state.routes.map(function(item) {
	// 								return <option key={item.oid} value={item.oid}>{item.name}</option>
	// 							})
	// 						}
	// 					</select>
	// 				</div>
	// 			</div>
	// 		) : (
	// 			<div className="form-group">
	// 				<div className="col-sm-4 col-sm-offset-4">
	// 					<button className="btn btn-primary" onClick={this._createGroup}><i className="fa fa-plus-circle"></i> Create group</button>
	// 				</div>
	// 			</div>
	// 		)
	// 	) : (
	// 		<Spinner/>
	// 	)
	// }

	render: function () {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var serviceParams = this._getServiceParams(type);
		var ServiceComponent = serviceParams.component;

		console.log('ChatTrunkComponent: ', params, ServiceComponent);

		if (!params) return null;

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				placeholder: frases.CHAT_TRUNK.OBJ_NAME_PLACEHOLDER,
				enabled: params.enabled || false,
				submitDisabled: this.state.submitDisabled,
				onStateChange: this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.state.params.pageid ? this._removeObject : null,
				addSteps: this.props.addSteps
			}),
			React.createElement(
				PanelComponent,
				null,
				this.state.serivceInited ? React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'form',
							{ className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									frases.CHAT_TRUNK.SELECT_SERVICE
								),
								React.createElement(
									'div',
									{ className: 'col-sm-8' },
									this.props.services.map(function (item) {
										return React.createElement(
											'div',
											{ key: item.id, className: 'text-center col-sm-2 col-xs-3', style: { padding: "20px 0" } },
											React.createElement(TrunkServiceItemComponent, {
												selected: item.id === type,
												item: item,
												onClick: this._setService,
												disabled: params.pageid && item.id !== type
											})
										);
									}.bind(this))
								)
							)
						),
						React.createElement('hr', null)
					),
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							null,
							React.createElement(ServiceComponent, {
								frases: frases,
								properties: this.state.params.properties,
								serviceParams: serviceParams,
								onChange: this._onPropsChange,
								onTokenReceived: this.props.onTokenReceived,
								isNew: !this.state.params.pageid,
								addSteps: this.props.addSteps,
								nextStep: this.props.nextStep,
								highlightStep: this.props.highlightStep
							}),
							React.createElement('hr', { className: 'col-xs-12' }),
							React.createElement(
								'form',
								{ className: 'form-horizontal' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(ChannelRouteComponent, {
										frases: frases,
										type: type,
										routes: this.props.params.routes,
										onChange: this._selectRoute,
										addSteps: this.props.addSteps
									})
								),
								React.createElement('hr', null),
								type !== 'Telephony' && React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										frases.CHAT_TRUNK.REPLY_TIMEOUT
									),
									React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement('input', { type: 'number', className: 'form-control replytimeout', name: 'replytimeout', value: this._toMinutes(params.replytimeout), onChange: this._onParamsChange })
									)
								),
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										frases.CHAT_TRUNK.SESSION_TIMEOUT
									),
									React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement('input', { type: 'number', className: 'form-control sessiontimeout', name: 'sessiontimeout', value: this._toMinutes(params.sessiontimeout), onChange: this._onParamsChange })
									)
								)
							)
						)
					)
				) : React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(Spinner, null)
					)
				)
			)
		);
	}
});

ChatTrunkComponent = React.createFactory(ChatTrunkComponent);
function TrunkServiceItemComponent(props) {

	var itemStyles = {
		display: 'block',
		textDecoration: 'none',
		opacity: props.disabled ? 0.5 : 1,
		cursor: props.disabled ? 'default' : 'pointer'
	};

	function selectItem(e) {
		e.preventDefault();
		if (props.disabled) return;
		props.onClick(props.item.id);
	}

	return React.createElement(
		'a',
		{
			href: '#',
			style: itemStyles,
			onClick: selectItem,
			className: props.disabled ? "disabled" : ""
		},
		React.createElement('img', {
			src: props.item.icon,
			alt: props.item.name + ' icon',
			style: { width: "40px", height: "40px" }
		}),
		React.createElement(
			'h5',
			{ className: props.selected ? '' : 'hidden' },
			props.item.name
		)
	);
}
function AddLicenseItemComponent(props) {

	return React.createElement(
		"div",
		null,
		React.createElement(
			"div",
			{ className: "input-group" },
			React.createElement(
				"span",
				{ className: "input-group-btn" },
				React.createElement(
					"button",
					{ className: "btn btn-default", type: "button", onClick: props.onMinus },
					React.createElement("i", { className: "fa fa-minus" })
				)
			),
			React.createElement(
				"h3",
				{ className: "data-model" },
				props.quantity
			),
			React.createElement(
				"span",
				{ className: "input-group-btn" },
				React.createElement(
					"button",
					{ className: "btn btn-default", type: "button", onClick: props.onPlus },
					React.createElement("i", { className: "fa fa-plus" })
				)
			)
		),
		React.createElement(
			"p",
			null,
			props.label
		)
	);
}

AddLicenseItemComponent = React.createFactory(AddLicenseItemComponent);
var AddLicensesComponent = React.createClass({
	displayName: 'AddLicensesComponent',


	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		minUsers: React.PropTypes.number,
		minStorage: React.PropTypes.number,
		addLicenses: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			quantity: 0,
			addOns: {},
			minUsers: 0,
			minStorage: 0,
			quantityDiff: 0
		};
	},

	componentWillMount: function () {
		this._init();
	},

	_init: function () {
		var sub = this.props.subscription;
		var addOns = {};

		sub.addOns.forEach(function (item) {
			addOns[item.name] = this._extend({}, item);
		}.bind(this));

		this.setState({
			quantity: sub.quantity,
			addOns: addOns,
			minUsers: this.props.minUsers,
			minStorage: this.props.minStorage,
			quantityDiff: 0
		});
	},

	_setQuantity: function (params) {
		console.log('_setQuantity:', params);

		var state = this.state;
		var addonName = params.name;
		var quantity = params.quantity;
		var totalQuantity = 0;

		if (addonName === 'users') {
			totalQuantity = state.quantity;
			totalQuantity += quantity;
			if (totalQuantity < state.minUsers || totalQuantity < 0) return;
			state.quantity = totalQuantity;
		} else {
			if (!state.addOns[addonName]) return;
			totalQuantity = state.addOns[addonName].quantity;
			totalQuantity += quantity;
			if (totalQuantity < 0) return;
			if (addonName === 'storage' && totalQuantity < state.minStorage) return;
			state.addOns[addonName].quantity = totalQuantity;
		}

		this.setState(state);
		this._getQuantityDiff();
	},

	_getQuantityDiff: function () {
		var sub = this.props.subscription;
		var initQuantity = sub.quantity;
		var newQuantity = this.state.quantity;
		var state = this.state;
		var diff = 0;

		sub.addOns.forEach(function (item) {
			initQuantity += item.quantity;
		});

		Object.keys(state.addOns).forEach(function (key) {
			initQuantity += state.addOns[key].quantity;
		});

		diff = initQuantity - newQuantity;

		console.log('_getQuantityDiff: ', diff);

		this.setState({ quantityDiff: diff });
	},

	_updateLicenses: function () {
		var state = this.state;
		var addOns = Object.keys(state.addOns).map(function (key) {
			return state.addOns[key];
		});

		if (state.quantityDiff === 0) return;

		this.props.addLicenses({
			quantity: this.state.quantity,
			addOns: addOns
		});
	},

	_cancelEditLicenses: function () {
		this._init();
	},

	_extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	},

	render: function () {
		var frases = this.props.frases;
		var state = this.state;

		console.log('AddLicensesComponent render: ', this.state);

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row', style: { textAlign: "center" } },
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(AddLicenseItemComponent, {
						onMinus: this._setQuantity.bind(this, { name: 'users', quantity: -1 }),
						onPlus: this._setQuantity.bind(this, { name: 'users', quantity: 1 }),
						quantity: this.state.quantity,
						label: frases.BILLING.AVAILABLE_LICENSES.USERS
					})
				),
				this.props.subscription.addOns.map(function (item, index) {

					return React.createElement(
						'div',
						{ className: 'col-sm-4', key: item.name },
						React.createElement(AddLicenseItemComponent, {
							onMinus: this._setQuantity.bind(this, { name: item.name, quantity: item.name === 'storage' ? -5 : -2 }),
							onPlus: this._setQuantity.bind(this, { name: item.name, quantity: item.name === 'storage' ? 5 : 2 }),
							quantity: this.state.addOns[item.name].quantity,
							label: frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()]
						})
					);
				}.bind(this))
			),
			React.createElement(
				'div',
				{ className: 'row' },
				this.state.quantityDiff !== 0 && React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12 text-center' },
						React.createElement('hr', null),
						React.createElement(
							'button',
							{
								className: 'btn btn-default',
								style: { margin: "5px" },
								onClick: this._cancelEditLicenses },
							frases.BILLING.CANCEL_LICENSE_UPDATE
						),
						React.createElement(
							'button',
							{
								className: 'btn btn-primary',
								style: { margin: "5px" },
								onClick: this._updateLicenses },
							frases.BILLING.UPDATE_LICENSES
						)
					)
				)
			)
		);
	}
});

AddLicensesComponent = React.createFactory(AddLicensesComponent);

var CallCreditsComponent = React.createClass({
	displayName: "CallCreditsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		discounts: React.PropTypes.array,
		addCredits: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			credits: null,
			amount: 20,
			amounts: [10, 20, 50, 100]
		};
	},

	componentWillMount: function () {
		this._getCredits();
	},

	componentWillReceiveProps: function (props) {
		this.setState({ credits: null });
		this._getCredits();
	},

	_currencyNameToSymbol: function (name) {
		var symbol = "";

		switch (name.toLowerCase()) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = name;
				break;
		}

		return symbol;
	},

	_onAddCredits: function () {
		var currencySymbol = this._currencyNameToSymbol(this.props.subscription.plan.currency);
		this.props.addCredits({ chargeAmount: this.state.amount, currency: currencySymbol });
	},

	_getCredits: function () {
		BillingApi.getCredits(function (err, response) {
			if (err) return notify_about('error', err.message);
			this.setState({ credits: response.result.balance });
		}.bind(this));
	},

	_setAmount: function (e) {
		e.preventDefault();
		var amount = e.target.value;
		this.setState({ amount: amount });
	},

	render: function () {
		var frases = this.props.frases;
		var currencySymbol = this._currencyNameToSymbol(this.props.subscription.plan.currency);

		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "clearfix" },
				React.createElement(
					"div",
					{ className: "pull-left" },
					React.createElement(
						"h3",
						{ style: { margin: 0 } },
						React.createElement(
							"small",
							null,
							frases.BILLING.CALL_CREDITS
						),
						this.state.credits !== null ? React.createElement(
							"span",
							null,
							" ",
							currencySymbol,
							parseFloat(this.state.credits).toFixed(2),
							" "
						) : React.createElement(Spinner, null)
					)
				),
				React.createElement(
					"div",
					{ className: "pull-right" },
					React.createElement(
						"a",
						{
							href: "#",
							className: "text-uppercase",
							style: { fontSize: "14px" },
							role: "button",
							"data-toggle": "collapse",
							href: "#creditsCollapse",
							"aria-expanded": "false",
							"aria-controls": "creditsCollapse"
						},
						frases.BILLING.ADD_CALL_CREDITS_BTN
					)
				)
			),
			React.createElement(
				"div",
				{ className: "collapse", id: "creditsCollapse" },
				React.createElement(
					"form",
					{ style: { margin: "20px 0" } },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement(
							"select",
							{ name: "credits-amount", className: "form-control", value: this.state.amount, onChange: this._setAmount },
							this.state.amounts.map(function (item) {
								return React.createElement(
									"option",
									{ key: item, value: item },
									currencySymbol,
									item
								);
							})
						),
						React.createElement(
							"span",
							{ className: "input-group-btn" },
							React.createElement(
								"button",
								{ className: "btn btn-primary", type: "button", onClick: this._onAddCredits },
								frases.BILLING.BUY_CALL_CREDITS_BTN
							)
						)
					)
				)
			)
		);
	}
});

CallCreditsComponent = React.createFactory(CallCreditsComponent);

var BillingComponent = React.createClass({
	displayName: 'BillingComponent',


	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object,
		invoices: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		addCredits: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		extend: React.PropTypes.func,
		addCoupon: React.PropTypes.func,
		utils: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			plans: [],
			invoices: []
			// changePlanOpened: false,
			// addLicenseOpened: false
		};
	},

	componentWillMount: function () {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			profile: this.props.profile,
			sub: sub,
			options: this.props.options,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			minUsers: options.users,
			minStorage: options.storesize
		});
	},

	componentWillReceiveProps: function (props) {
		console.log('componentWillReceiveProps: ', props);

		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			sub: sub,
			options: props.options,
			profile: props.profile,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			invoices: props.invoices,
			discounts: props.discounts,
			stateChanged: true
		});
	},

	_extendAddons: function (addOns, array) {
		var newItem;
		return addOns.map(function (addon) {
			newItem = {};
			array.forEach(function (item) {
				if (addon.name === item.name) {
					newItem = deepExtend(newItem, addon);
					newItem.quantity = item.quantity;
				}
			});
			return newItem;
		});
	},

	_countSubAmount: function (sub) {
		var amount = sub.quantity * sub.plan.price;
		var priceProp = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';

		if (sub.addOns && sub.addOns.length) {
			sub.addOns.forEach(function (item) {
				if (item.quantity) amount += item.price * item.quantity;
			});
		}

		if (sub.hasDids) {
			this.props.dids.forEach(function (item) {
				amount += item.included ? 0 : parseFloat(item[priceProp]);
			});
		}

		return amount.toFixed(2);
	},

	_countNewPlanAmount: function (currsub, newsub) {
		var currAmount = currsub.amount;
		var newAmount = newsub.amount;
		var chargeAmount = 0;
		var totalAmount = 0;
		var prorationRatio = 1;
		var proratedAmount = 0;

		console.log('_countPayAmount: ', currsub, newsub);

		// if new plan with different billing period
		if (currsub.plan.trialPeriod || newsub.plan.billingPeriod !== currsub.plan.billingPeriod || newsub.plan.billingPeriodUnit !== currsub.plan.billingPeriodUnit) {
			newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
			newsub.prevBillingDate = Date.now();
		} else {
			prorationRatio = this.state.proratedDays / this.state.cycleDays;
		}

		currAmount = currAmount * prorationRatio;
		chargeAmount = newAmount * prorationRatio;

		if (chargeAmount >= currAmount) {
			chargeAmount = chargeAmount - currAmount;
		} else {
			proratedAmount = currAmount - chargeAmount;
			chargeAmount = 0;
		}

		totalAmount = newAmount - currAmount;

		console.log('_countPayAmount: ', currAmount, newAmount, chargeAmount, proratedAmount);
		return { newSubAmount: newAmount, totalAmount: totalAmount > 0 ? totalAmount : 0, chargeAmount: chargeAmount };
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

		var profile = this.state.profile;

		this.props.addCard(function (result) {
			if (!result) return;

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	_editCard: function (e) {
		e.preventDefault();

		var profile = this.state.profile;

		this.props.editCard(function (result) {
			if (!result) return;

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _openPlans: function(e) {
	// 	if(e) e.preventDefault();
	// 	// this.setState({ changePlanOpened: !this.state.changePlanOpened });

	// 	if(!this.state.plans.length) {
	// 		billingRequest('getPlans', { currency: this.props.sub.plan.currency }, function(err, response) {
	// 			if(err) return;
	// 			this.setState({ plans: response.result });
	// 		}.bind(this));
	// 	}
	// },

	// _openLicenses: function() {
	// 	this.setState({ addLicenseOpened: !this.state.addLicenseOpened });
	// },

	_onPlanSelect: function (plan) {
		console.log('_onPlanSelect 1: ', plan, this.state.sub);
		var profile = this.props.profile;
		var paymentMethod = profile.billingMethod;

		var sub = JSON.parse(JSON.stringify(this.props.sub));
		sub.plan = plan;
		sub.addOns = this._extendAddons(plan.addOns, sub.addOns);

		console.log('_onPlanSelect 2: ', plan, sub);

		sub.amount = this._countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		this.props.onPlanSelect({
			plan: plan,
			annually: plan.billingPeriodUnit === 'years',
			payment: {
				currency: plan.currency,
				newSubAmount: amounts.newSubAmount,
				discounts: this.props.discounts,
				chargeAmount: amounts.chargeAmount.toFixed(2),
				totalAmount: amounts.totalAmount.toFixed(2)
			}
		});

		// sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		// sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		// sub.amount = this._countSubAmount(sub);
	},

	_updateLicenses: function (params) {

		console.log('_updateLicenses: ', params);

		var sub = this.state.sub;
		sub.quantity = params.quantity;
		sub.addOns = params.addOns;
		sub.amount = this._countSubAmount(sub);

		var totalAmount = sub.amount - this.props.sub.amount;
		var chargeAmount = 0;

		if (totalAmount > 0) {
			chargeAmount = totalAmount * (this.state.proratedDays / this.state.cycleDays);
		}

		this.props.updateLicenses({
			addOns: sub.addOns,
			quantity: sub.quantity,
			annually: sub.plan.billingPeriodUnit === 'years',
			payment: {
				currency: this._currencyNameToSymbol(sub.plan.currency),
				newSubAmount: sub.amount,
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2),
				totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : 0
			}
		});

		sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		sub.quantity = this.props.sub.quantity;
		sub.amount = this._countSubAmount(sub);
	},

	_updateAndRenewSub: function (e) {
		if (e) e.preventDefault();
		this.props.editCard(function (result) {
			if (!result) return;

			var profile = this.state.profile;
			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });

			this.props.renewSub(function (err) {
				if (err) return;
				var sub = this.state.sub;
				sub.state = 'active';
				this.setState({ sub: sub });
			});
		}.bind(this));
	},

	_renewSub: function (e) {
		if (e) e.preventDefault();
		this.props.renewSub(function (err) {
			if (err) return;
			var sub = this.state.sub;
			sub.state = 'active';
			this.setState({ sub: sub });
		}.bind(this));
	},

	_addCoupon: function (coupon) {
		this.props.addCoupon(coupon);
	},

	_currencyNameToSymbol: function (name) {
		var symbol = "";

		switch (name.toLowerCase()) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	},

	render: function () {
		var frases = this.props.frases;
		var profile = this.props.profile;
		var paymentMethod = profile.billingMethod;
		var sub = this.state.sub;
		var discounts = this.props.discounts;
		var options = this.props.options;
		var plans = this.state.plans;
		var column = plans.length ? 12 / plans.length : 12;
		var trial = sub.plan.planId === 'trial' || sub.state === 'past_due';

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					sub.status === 'past_due' ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						frases.BILLING.ALERTS.PAST_DUE,
						' ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._renewSub, className: 'alert-link' },
							frases.BILLING.RENEW_SUB
						),
						' ',
						frases.OR,
						' ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._updateAndRenewSub, className: 'alert-link' },
							frases.BILLING.UPDATE_PAYMENT_METHOD
						),
						'.'
					) : sub.plan.planId === 'trial' && sub.status === 'expired' ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						frases.BILLING.ALERTS.TRIAL_EXPIRED,
						' ',
						React.createElement(
							'a',
							{ href: '#plansCollapse', 'data-toggle': 'collapse', 'aria-expanded': 'false', 'aria-controls': 'plansCollapse', onClick: this._openPlans, className: 'alert-link' },
							frases.BILLING.UPGRADE_PLAN_ALERT_MSG
						)
					) : ''
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						PanelComponent,
						null,
						React.createElement(SubscriptionPriceComponent, {
							frases: frases,
							subscription: sub,
							discounts: discounts,
							dids: this.props.dids
						})
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						PanelComponent,
						null,
						React.createElement(CallCreditsComponent, {
							frases: frases,
							subscription: sub,
							addCredits: this.props.addCredits,
							discounts: discounts
						})
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						PanelComponent,
						null,
						React.createElement(ManagePaymentMethodComponent, {
							frases: frases,
							paymentMethod: paymentMethod,
							onClick: paymentMethod ? this._editCard : this._addCard,
							buttonText: paymentMethod ? frases.BILLING.EDIT_PAYMENT_METHOD : frases.BILLING.ADD_CREDIT_CARD
						})
					)
				)
			),
			React.createElement(
				PanelComponent,
				null,
				React.createElement(SubscriptionPlanComponent, {
					frases: frases,
					subscription: sub,
					plans: plans,
					renewSub: this._renewSub,
					onPlanSelect: this._onPlanSelect
				})
			),
			React.createElement(
				PanelComponent,
				{ header: frases.USAGE.PANEL_TITLE },
				React.createElement(StorageUsageComponent, {
					frases: frases,
					stateChanged: this.state.stateChanged,
					subscription: sub,
					updateLicenses: this._updateLicenses,
					utils: this.props.utils
				})
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement(InvoicesComponent, { items: this.state.invoices, frases: frases })
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(DiscountsComponent, { items: discounts, addCoupon: this._addCoupon, frases: frases })
				)
			)
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);
function ManagePaymentMethodComponent(props) {

	function _isCardExpired(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		return expMonth < month && expYear <= year;
	}

	function _cardWillExpiredSoon(expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		return expMonth - month < 1 && expYear - year < 1;
	}

	var paymentMethod = props.paymentMethod;
	var frases = props.frases;

	return React.createElement(
		"div",
		{ className: "text-center" },
		React.createElement(
			"h3",
			null,
			React.createElement("i", { className: "fa fa-credit-card" })
		),
		React.createElement(
			"a",
			{ href: "#", onClick: props.onClick, className: "text-uppercase" },
			props.buttonText
		),
		paymentMethod && React.createElement(
			"div",
			null,
			React.createElement(
				"p",
				{ className: "text-muted", style: { userSelect: 'none' } },
				React.createElement(
					"b",
					null,
					paymentMethod.params.brand
				),
				" \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ",
				paymentMethod.params.last4,
				React.createElement("br", null),
				paymentMethod.params.exp_month,
				"/",
				paymentMethod.params.exp_year
			),
			_isCardExpired(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? React.createElement(
				"div",
				{ className: "alert alert-warning", role: "alert" },
				frases.BILLING.ALERTS.CARD_EXPIRED_P1,
				" ",
				React.createElement(
					"a",
					{ href: "#", onClick: props.onClick, className: "alert-link" },
					frases.BILLING.UPDATE_PAYMENT_METHOD
				),
				" ",
				frases.BILLING.ALERTS.CARD_EXPIRED_P2,
				"."
			) : _cardWillExpiredSoon(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? React.createElement(
				"div",
				{ className: "alert alert-warning", role: "alert" },
				frases.BILLING.ALERTS.CARD_WILL_EXPIRE_P1,
				" ",
				React.createElement(
					"a",
					{ href: "#", onClick: props.onClick, className: "alert-link" },
					frases.BILLING.UPDATE_PAYMENT_METHOD
				),
				" ",
				frases.BILLING.ALERTS.CARD_WILL_EXPIRE_P2,
				"."
			) : ''
		)
	);
}

ManagePaymentMethodComponent = React.createFactory(ManagePaymentMethodComponent);

var PlanComponent = React.createClass({
	displayName: 'PlanComponent',


	propTypes: {
		plan: React.PropTypes.object,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.bool,
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
		var period = plan.billingPeriodUnit;
		var attributes = plan.attributes || plan.customData;

		return React.createElement(
			'div',
			{ className: 'panel', style: { border: '1px solid #54c3f0', boxShadow: 'none', textAlign: 'center' } },
			React.createElement(
				'div',
				{ className: 'panel-header', style: { color: '#55c3f0' } },
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
						React.createElement(
							'strong',
							null,
							period === 'months' ? plan.price : plan.price / 12
						),
						plan.currency,
						' ',
						frases.BILLING.PLANS.PER_USER,
						'/',
						frases.BILLING.PLANS.PER_MONTH
					),
					React.createElement(
						'li',
						null,
						React.createElement(
							'strong',
							null,
							attributes.storageperuser
						),
						'GB ',
						frases.BILLING.PLANS.PER_USER
					),
					React.createElement(
						'li',
						null,
						React.createElement(
							'strong',
							null,
							attributes.linesperuser
						),
						' ',
						frases.BILLING.AVAILABLE_LICENSES.LINES,
						' ',
						frases.BILLING.PLANS.PER_USER
					)
				),
				React.createElement(
					'a',
					{ href: 'https://ringotel.co/pricing/', target: '_blanc' },
					frases.BILLING.PLANS.SHOW_ALL_FEATURES
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-footer', style: { padding: 0, background: 'none', borderTop: 'none' } },
				this.props.currentPlan ? React.createElement(
					'p',
					{ style: { padding: "15px 0" }, className: 'text-muted text-uppercase' },
					frases.BILLING.PLANS.CURRENT_PLAN
				) : React.createElement(
					'button',
					{ className: 'btn btn-link text-uppercase', style: { width: "100%", padding: "15px 0" }, onClick: this._selectPlan },
					frases.BILLING.PLANS.SELECT_PLAN
				)
			)
		);
	}
});

PlanComponent = React.createFactory(PlanComponent);

var PlansComponent = React.createClass({
	displayName: 'PlansComponent',


	propTypes: {
		plans: React.PropTypes.array,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.object,
		onPlanSelect: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			plans: []
		};
	},

	getInitialState: function () {
		return {
			showMonthlyPlans: false
		};
	},

	componentDidMount: function () {

		console.log('PlansComponent: ', this.props.currentPlan);

		this.setState({
			showMonthlyPlans: this.props.currentPlan.billingPeriodUnit === 'months'
		});
	},

	_togglePlans: function (annually) {
		console.log('_togglePlans: ', annually);
		this.setState({ showMonthlyPlans: !annually });
	},

	_filterPlans: function (plan) {
		var showMonthlyPlans = this.state.showMonthlyPlans;
		if (showMonthlyPlans && plan.billingPeriodUnit === 'months') {
			return plan;
		} else if (!showMonthlyPlans && plan.billingPeriodUnit === 'years') {
			return plan;
		} else if (this.props.currentPlan.planId === 'trial' && plan.planId === 'trial') {
			return plan;
		} else {
			return null;
		}
	},

	render: function () {
		var frases = this.props.frases;
		var plans = this.props.plans.filter(this._filterPlans);

		return React.createElement(
			'div',
			{ className: 'panel-body', style: { background: 'none' } },
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12 text-center', style: { marginBottom: "20px" } },
					React.createElement(
						'div',
						{ className: 'btn-group btn-group-custom', 'data-toggle': 'buttons' },
						React.createElement(
							'label',
							{ className: "btn btn-primary " + (!this.state.showMonthlyPlans ? 'active' : ''), onClick: this._togglePlans.bind(this, true) },
							React.createElement('input', { type: 'radio', name: 'billing-period', autoComplete: 'off', checked: !this.state.showMonthlyPlans }),
							' ',
							frases.BILLING.PLANS.ANNUAL_PLANS
						),
						React.createElement(
							'label',
							{ className: "btn btn-primary " + (this.state.showMonthlyPlans ? 'active' : ''), onClick: this._togglePlans.bind(this, false) },
							React.createElement('input', { type: 'radio', name: 'billing-period', autoComplete: 'off', checked: this.state.showMonthlyPlans }),
							' ',
							frases.BILLING.PLANS.MONTHLY_PLANS
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				plans.map(function (plan, index) {

					return React.createElement(
						'div',
						{ className: 'col-xs-12 col-sm-6 col-lg-4 text-center', key: plan.planId },
						React.createElement(PlanComponent, { plan: plan, frases: frases, onSelect: this.props.onPlanSelect, currentPlan: this.props.currentPlan.planId === plan.planId })
					);
				}.bind(this))
			)
		);
	}
});

PlansComponent = React.createFactory(PlansComponent);
var SubscriptionPlanComponent = React.createClass({
	displayName: "SubscriptionPlanComponent",


	propTypes: {
		subscription: React.PropTypes.object,
		frases: React.PropTypes.object,
		openPlans: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			plans: []
		};
	},

	_openPlans: function (e) {
		if (e) e.preventDefault();
		// this.setState({ changePlanOpened: !this.state.changePlanOpened });

		if (!this.state.plans.length) {
			BillingApi.getPlans({ currency: this.props.subscription.plan.currency }, function (err, response) {
				if (err) return;
				this.setState({ plans: response.result });
			}.bind(this));
		}
	},

	render: function () {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var plans = this.state.plans;

		return React.createElement(
			"div",
			{ className: "clearfix" },
			React.createElement(
				"div",
				{ className: "pull-left" },
				React.createElement(
					"h3",
					{ style: { margin: 0 } },
					React.createElement(
						"small",
						null,
						frases.BILLING.CURRENT_PLAN,
						" "
					),
					React.createElement(
						"span",
						null,
						sub.plan.name,
						" "
					)
				),
				sub.plan.trialPeriod && React.createElement(
					"p",
					{ className: "text-muted" },
					frases.BILLING.TRIAL_EXPIRES,
					" ",
					React.createElement(
						"b",
						null,
						window.moment(sub.trialExpires).format('DD MMMM YYYY')
					)
				)
			),
			React.createElement(
				"div",
				{ className: "pull-right" },
				sub.state === 'past_due' ? React.createElement(
					"a",
					{ href: "#", className: "text-uppercase", style: { fontSize: "14px" }, onClick: this.props.renewSub },
					frases.BILLING.RENEW_SUB
				) : React.createElement(
					"a",
					{
						href: "#",
						className: "text-uppercase",
						style: { fontSize: "14px" },
						role: "button",
						onClick: this._openPlans,
						"data-toggle": "collapse",
						href: "#plansCollapse",
						"aria-expanded": "false",
						"aria-controls": "plansCollapse"
					},
					frases.BILLING.UPGRADE_PLAN
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"div",
						{ className: "collapse", id: "plansCollapse" },
						plans.length ? React.createElement(PlansComponent, { plans: plans, frases: frases, onPlanSelect: this.props.onPlanSelect, currentPlan: sub.plan }) : React.createElement(Spinner, null)
					),
					React.createElement("p", null)
				)
			)
		);
	}
});

SubscriptionPlanComponent = React.createFactory(SubscriptionPlanComponent);

var SubscriptionPriceComponent = React.createClass({
	displayName: "SubscriptionPriceComponent",


	propTypes: {
		subscription: React.PropTypes.object,
		discounts: React.PropTypes.array,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	_currencyNameToSymbol: function (name) {
		var symbol = "";

		switch (name) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	},

	render: function () {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var discounts = this.props.discounts;
		var subAmount = sub.amount;
		var propString = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';
		var currencySymbol = this._currencyNameToSymbol(sub.plan.currency);
		var addonsPrice = sub.addOns.reduce(function (amount, item) {
			amount += parseFloat(item.price) * item.quantity;
			return amount;
		}, 0);
		var didsPrice = this.props.dids.reduce(function (amount, item) {
			amount += item.included ? 0 : parseFloat(item[propString]);
			return amount;
		}, 0);

		// apply discounts
		if (discounts.length) {
			subAmount = subAmount * discounts[0].coupon.percent / 100;
		}

		return React.createElement(
			"div",
			null,
			React.createElement(
				"h5",
				null,
				React.createElement(
					"span",
					null,
					sub.quantity,
					" x ",
					frases.USERS
				),
				React.createElement(
					"strong",
					null,
					" ",
					currencySymbol,
					(parseFloat(sub.plan.price) * sub.quantity).toFixed(2),
					" "
				)
			),
			this.props.dids.length ? React.createElement(
				"h5",
				null,
				React.createElement(
					"span",
					null,
					this.props.dids.length,
					" x ",
					frases.NUMBERS
				),
				React.createElement(
					"strong",
					null,
					" ",
					currencySymbol,
					didsPrice.toFixed(2),
					" "
				)
			) : null,
			addonsPrice !== 0 ? React.createElement(
				"h5",
				null,
				React.createElement(
					"span",
					null,
					frases.BILLING.ADDONS
				),
				React.createElement(
					"strong",
					null,
					" ",
					currencySymbol,
					addonsPrice.toFixed(2),
					" "
				)
			) : null,
			React.createElement(
				"h3",
				{ style: { margin: 0 } },
				React.createElement(
					"small",
					null,
					sub.plan.billingPeriodUnit === 'years' ? frases.BILLING.ANNUALLY_TOTAL : frases.BILLING.MONTHLY_TOTAL
				),
				React.createElement(
					"span",
					null,
					" ",
					currencySymbol,
					parseFloat(subAmount).toFixed(2),
					" "
				)
			),
			!sub.plan.trialPeriod && React.createElement(
				"p",
				{ className: "text-muted" },
				frases.BILLING.NEXT_CHARGE,
				" ",
				React.createElement(
					"b",
					null,
					window.moment(sub.nextBillingDate).format('DD MMMM YYYY')
				)
			)
		);
	}
});

SubscriptionPriceComponent = React.createFactory(SubscriptionPriceComponent);
var ActivityAnalyticsComponent = React.createClass({
	displayName: "ActivityAnalyticsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		onLoad: React.PropTypes.func
	},

	componentDidMount: function () {
		this.props.onLoad();
	},

	componentDidUpdate: function (props) {
		this.props.onUpdate();
	},

	render: function () {
		var frases = this.props.frases;
		var data = this.props.data;
		// var chartData = {};
		// var chartAttributes = {};

		// if(data) {
		// 	chartData = {
		// 		columns: [
		// 			['Assigned', (data.ar || 0)],
		// 			['Unassigned', (data.ur || 0)]
		// 		]
		// 	};

		// 	chartAttributes = {
		// 		donut: {
		// 			label: {
		// 	            format: function (value, ratio, id) {
		// 	                return value;
		// 	            }
		// 	        }
		// 		}
		// 	};
		// }

		return data && React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.tnc, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.tr, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.ar, desc: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.rr, desc: frases.CHANNEL_STATISTICS.INDEXES.TOTAL_REPLIES } })
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atfr, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY, format: "ms" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.art, desc: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME, format: "ms" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atrm, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_REPLY, format: "ms" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atta, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_ASSIGN, format: "ms" } })
				)
			)
		);
	}
});

ActivityAnalyticsComponent = React.createFactory(ActivityAnalyticsComponent);
var ChannelTypeAnalyticsComponent = React.createClass({
	displayName: 'ChannelTypeAnalyticsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		fetching: React.PropTypes.bool
	},

	_getColumns: function (data, colname, match, params) {
		var columns = [];
		var col = [];
		var value = null;
		var convert = params ? params.convert : null;

		data.map(function (item) {
			col = [item[colname]];
			for (var key in item) {
				if (key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
					value = item[key];

					if (convert === 'minutes') {
						value = parseFloat((value / 1000 / 60).toFixed(2));
					}

					col.push(value);
				}
			}

			columns.push(col);
		}.bind(this));

		return columns;
	},

	render: function () {
		var frases = this.props.frases;
		var data = this.props.data;

		console.log('ChannelTypeAnalyticsComponent render:', data);

		return data && !this.props.fetching ? React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS },
					React.createElement(ChartComponent, {
						type: 'donut',
						data: {
							columns: this._getColumns(data, 'name', ['tnc'])
						},
						options: {
							donut: {
								label: {
									format: function (value, ratio, id) {
										console.log('chart label: ', value, ratio, id);
										return value;
									}
								}
							}
						}
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS },
					React.createElement(ChartComponent, {
						type: 'donut',
						data: {
							columns: this._getColumns(data, 'name', ['tr'])
						},
						options: {
							donut: {
								label: {
									format: function (value, ratio, id) {
										return value;
									}
								}
							}
						}
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS },
					React.createElement(ChartComponent, {
						type: 'donut',
						data: {
							columns: this._getColumns(data, 'name', ['ar'])
						},
						options: {
							donut: {
								label: {
									format: function (value, ratio, id) {
										return value;
									}
								}
							}
						}
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'col-sm-6' },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY + " (" + frases.MINUTES + ")" },
					React.createElement(ChartComponent, {
						type: 'bar',
						data: {
							columns: this._getColumns(data, 'name', ['atfr'], { convert: 'minutes' })
						},
						options: {
							bar: {
								width: {
									ratio: 0.5
								}
							}
						}
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'col-sm-6' },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME + " (" + frases.MINUTES + ")" },
					React.createElement(ChartComponent, {
						type: 'bar',
						data: {
							columns: this._getColumns(data, 'name', ['art'], { convert: 'minutes' })
						},
						options: {
							bar: {
								width: {
									ratio: 0.5
								}
							}
						}
					})
				)
			)
		) : React.createElement(Spinner, null);
	}
});

ChannelTypeAnalyticsComponent = React.createFactory(ChannelTypeAnalyticsComponent);
var GetAndRenderAnalyticsDataComponent = React.createClass({
	displayName: "GetAndRenderAnalyticsDataComponent",


	propTypes: {
		frases: React.PropTypes.object,
		fetch: React.PropTypes.object,
		method: React.PropTypes.string,
		component: React.PropTypes.func,
		onComponentLoad: React.PropTypes.func,
		onComponentUpdate: React.PropTypes.func
	},

	getDefaultProps: function () {
		return { fetch: {} };
	},

	getInitialState: function () {
		return { data: null, fetching: false };
	},

	componentWillMount: function () {
		this._getData(this.props.method, this.props.fetch);
	},

	componentWillReceiveProps: function (props) {
		this.setState({ fetching: true });

		this._getData(props.method, props.fetch, function (result) {
			this.setState({ fetching: false });
			this._setData(result);
		}.bind(this));
	},

	shouldComponentUpdate: function () {
		return !this.state.fetching;
	},

	_getData: function (method, params, callback) {
		if (!method || !params.date) return;

		json_rpc_async(method, {
			begin: params.date.start,
			end: params.date.end
		}, callback);
	},

	_setData: function (data) {

		this.setState({
			data: data
		});
	},

	render: function () {
		var frases = this.props.frases;
		var data = this.state.data;
		var Component = this.props.component;

		return data ? React.createElement(Component, { frases: frases, fetching: this.state.fetching, data: data, onLoad: this.props.onComponentLoad, onUpdate: this.props.onComponentUpdate }) : null;
	}
});

GetAndRenderAnalyticsDataComponent = React.createFactory(GetAndRenderAnalyticsDataComponent);
var AnalyticsComponent = React.createClass({
	displayName: 'AnalyticsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		utils: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			picker: {},
			fetch: {},
			showChartType: 'chatGroup'
		};
	},

	componentDidMount: function () {
		var picker = new Picker('chatstat-date-picker', { submitFunction: this._getData, buttonSize: 'md' });
		this._getData({
			date: picker.date
		});
	},

	_getData: function (params) {
		show_loading_panel();
		this.setState({ fetch: params });
	},

	_onChartTypeSelect: function (e) {
		var value = e.target.value;
		this.setState({ showChartType: value });
	},

	_onComponentLoad: function () {
		console.log('_onComponentLoad');
		show_content();
	},

	_onComponentUpdate: function () {
		console.log('_onComponentUpdate');
		show_content();
	},

	render: function () {
		var frases = this.props.frases;
		var showChartType = this.state.showChartType;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row', style: { margin: "20px 0" } },
				React.createElement('div', { id: 'chatstat-date-picker', className: 'col-sm-4 cdropdown custom-dropdown' })
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GetAndRenderAnalyticsDataComponent, {
						component: ActivityAnalyticsComponent,
						frases: this.props.frases,
						fetch: this.state.fetch,
						method: 'getActivityStatistics',
						onComponentLoad: this._onComponentLoad,
						onComponentUpdate: this._onComponentUpdate
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'row', style: { margin: "20px 0" } },
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'select',
						{ className: 'form-control', onChange: this._onChartTypeSelect },
						React.createElement(
							'option',
							{ value: 'chatGroup' },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHAT_GROUP
						),
						React.createElement(
							'option',
							{ value: 'channelName' },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_NAME
						),
						React.createElement(
							'option',
							{ value: 'channelType' },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_TYPE
						)
					)
				)
			),
			showChartType === 'chatGroup' ? React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: 'getChatGroupStatistics'
			}) : showChartType === 'channelName' ? React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: 'getChannelStatistics'
			}) : React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: 'getChannelTypeStatistics'
			})
		);
	}
});

AnalyticsComponent = React.createFactory(AnalyticsComponent);
var SingleIndexAnalyticsComponent = React.createClass({
	displayName: 'SingleIndexAnalyticsComponent',


	propTypes: {
		params: React.PropTypes.object
	},

	getDefaultProps: function () {
		return {
			params: {}
		};
	},

	// componentWillMount: function() {
	// 	var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
	// 	this._getData({
	// 		date: picker.date
	// 	});
	// },

	_formatTimeString: function (time, format) {
		var h, m, s, newtime;
		h = Math.floor(time / 3600);
		time = time - h * 3600;
		m = Math.floor(time / 60);
		s = Math.floor(time - m * 60);

		newtime = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
		if (!format || format == 'hh:mm:ss') {
			newtime += ':' + (s < 10 ? '0' + s : s);
		}
		return newtime;
	},

	_formatIndex: function (value, format) {
		var result = value;
		if (format === 'ms') result = this._formatTimeString(result / 1000);

		return result;
	},

	render: function () {
		var params = this.props.params;
		return React.createElement(
			'div',
			{ className: 'panel' },
			React.createElement(
				'div',
				{ className: 'panel-body text-center' },
				React.createElement(
					'h3',
					{ style: { margin: "5px 0" } },
					this._formatIndex(params.index, params.format)
				),
				React.createElement('span', { style: { display: "inline-block", width: "50px", height: "1px", background: "#eee" } }),
				React.createElement(
					'h5',
					null,
					params.desc
				)
			)
		);
	}
});

SingleIndexAnalyticsComponent = React.createFactory(SingleIndexAnalyticsComponent);
function CustomerInfoItemComponent(props) {

	return React.createElement(
		"dl",
		{ className: "dl-horizontal" },
		React.createElement(
			"dt",
			null,
			props.label
		),
		React.createElement(
			"dd",
			null,
			props.value
		)
	);
}
var CustomerInfoModalComponent = React.createClass({
	displayName: "CustomerInfoModalComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onDelete: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			open: true
		};
	},

	componentWillReceiveProps: function (props) {
		var open = props.open === false ? false : true;

		this.setState({
			open: open
		});
	},

	_onDelete: function () {
		var props = this.props;
		setTimeout(function () {
			props.onDelete(props.params.id);
		}, 500);
		this.setState({ open: false });
	},

	_getBody: function () {
		var frases = this.props.frases;
		var exportLink = window.location.protocol + "//" + window.location.host;
		exportLink += '/exportCustomerData?customerid=' + this.props.params.id;

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(CustomerInfoComponent, { frases: this.props.frases, params: this.props.params, onDelete: this.props.onDelete })
			),
			React.createElement(
				"div",
				{ className: "col-xs-12 text-right" },
				React.createElement(
					"a",
					{ href: exportLink, className: "btn btn-link", target: "_blank", onClick: this._onExport },
					frases.CUSTOMERS.EXPORT_BTN
				),
				React.createElement(
					"button",
					{ type: "button", className: "btn btn-link btn-danger", onClick: this._onDelete },
					frases.CUSTOMERS.DELETE_BTN
				)
			)
		);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var cname = params.name ? params.name : params.usinfo.email || params.usinfo.phone;

		return React.createElement(ModalComponent, {
			title: cname,
			open: this.state.open,
			body: this._getBody()
		});
	}
});

CustomerInfoModalComponent = React.createFactory(CustomerInfoModalComponent);
function CustomerInfoComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var cname = params.name ? params.name : params.usinfo.email || params.usinfo.phone;

	params.usinfo = params.usinfo || {};

	return React.createElement(
		'div',
		null,
		React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.name, value: cname }),
		React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.created, value: moment(params.created).format('DD/MM/YY HH:mm:ss') }),
		React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.createdby, value: params.createdby }),
		React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.consent, value: params.consent ? frases.CUSTOMERS.HAS_CONSENT_MSG : frases.CUSTOMERS.NO_CONSENT_MSG }),
		React.createElement('hr', null),
		Object.keys(params.usinfo).map(function (key) {
			return React.createElement(CustomerInfoItemComponent, { key: key, label: frases.CUSTOMERS.FIELDS[key], value: params.usinfo[key] });
		})
	);
}
function CustomerItemComponent(props) {

	function onClick(e) {
		e.preventDefault();
		props.onClick(props.item);
	}

	return React.createElement(
		"tr",
		null,
		React.createElement(
			"td",
			null,
			props.item.name ? props.item.name : props.item.usinfo.email || props.item.usinfo.phone
		),
		React.createElement(
			"td",
			null,
			moment(props.item.created).format('DD/MM/YY HH:mm:ss')
		),
		React.createElement(
			"td",
			null,
			props.item.createdby
		),
		React.createElement(
			"td",
			{ className: props.item.consent ? "text-success" : "" },
			React.createElement("span", { className: "fa fa-fw " + (props.item.consent ? "fa-check" : "fa-minus") })
		),
		React.createElement(
			"td",
			null,
			React.createElement(
				"a",
				{ href: "#", onClick: onClick },
				props.frases.CUSTOMERS.DETAILS_BTN
			)
		)
	);
}
var CustomersListComponent = React.createClass({
	displayName: "CustomersListComponent",


	propTypes: {
		frases: React.PropTypes.object,
		list: React.PropTypes.array,
		openCustomerInfo: React.PropTypes.func
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
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
						frases.CUSTOMERS.CUSTOMER
					),
					React.createElement(
						"th",
						null,
						frases.CUSTOMERS.FIELDS.created
					),
					React.createElement(
						"th",
						null,
						frases.CUSTOMERS.FIELDS.createdby
					),
					React.createElement(
						"th",
						null,
						frases.CUSTOMERS.FIELDS.consent
					),
					React.createElement("th", null)
				)
			),
			React.createElement(
				"tbody",
				null,
				this.props.list.map(function (item, index) {
					return React.createElement(CustomerItemComponent, { key: item.id, frases: this.props.frases, item: item, onClick: this.props.openCustomerInfo });
				}.bind(this))
			)
		);
	}
});

CustomersListComponent = React.createFactory(CustomersListComponent);
var CustomersComponent = React.createClass({
	displayName: "CustomersComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.array,
		openCustomerInfo: React.PropTypes.func
	},

	componentWillMount: function () {
		this.setState({
			filteredMembers: this.props.params || []
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			filteredMembers: props.params || []
		});
	},

	_onFilter: function (items) {
		this.setState({
			filteredMembers: items
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var customers = this.state.filteredMembers;

		return React.createElement(
			PanelComponent,
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(FilterInputComponent, { frases: frases, items: params, onChange: this._onFilter })
				)
			),
			React.createElement(
				"div",
				{ className: "table-responsive" },
				React.createElement(CustomersListComponent, { frases: frases, list: customers, openCustomerInfo: this.props.openCustomerInfo })
			)
		);
	}
});

CustomersComponent = React.createFactory(CustomersComponent);

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
		window.location.hash = '#' + type + '/' + type;
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
		window.location.hash = '#' + type + '/' + type;
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
		window.location.hash = '#trunk/trunk';
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
var ExtensionsComponent = React.createClass({
	displayName: "ExtensionsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		getExtension: React.PropTypes.func,
		deleteExtension: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			data: []
		};
	},

	// getInitialState: function() {
	// 	return {
	// 		data: []
	// 	};
	// },

	// componentWillMount: function() {
	// 	this.setState({ data: this.props.data });
	// },

	// _getData: function(params, callback) {
	// 	json_rpc_async('getExtensions', null, callback);
	// },

	render: function () {
		var frases = this.props.frases;
		var data = this.props.data;
		console.log('ExtensionsComponent: ', data);

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(GroupMembersComponent, { frases: frases, members: data, withGroups: true, getExtension: this.props.getExtension, deleteMember: this.props.deleteExtension })
			)
		);
	}
});

ExtensionsComponent = React.createFactory(ExtensionsComponent);
function GSCreateChannelContComponent(props) {

	return React.createElement(
		"div",
		{ className: "gs-links-cont" },
		props.children
	);
}
function GSCreateChannelItemComponent(props) {

	return React.createElement(
		"div",
		{ className: "gs-link-item" },
		React.createElement(
			"div",
			{ className: "gs-link-header" },
			React.createElement(
				"a",
				{ href: "", onClick: props.onClick },
				props.title
			)
		),
		React.createElement(
			"div",
			{ className: "gs-link-desc" },
			props.desc
		)
	);
}
var GSCreateChannelsComponent = React.createClass({
	displayName: 'GSCreateChannelsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			users: []
		};
	},

	componentWillMount: function () {},

	_nextStep: function () {
		console.log('_nextStep >>>');
		this.props._nextStep();
	},

	_onServiceSelect: function (channelName, e) {
		e.preventDefault();
		this.props.closeGS(true);
		window.location.hash = '#chattrunk/chattrunk?channel=' + channelName;
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			'div',
			{ className: 'gs-step' },
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'div',
						{ className: 'gs-step-head' },
						React.createElement('img', { src: '/badmin/images/omnichannel.png' })
					),
					React.createElement(
						'div',
						{ className: 'gs-step-body' },
						React.createElement(
							'h3',
							null,
							frases.GET_STARTED.CONNECT_CHANNELS.TITLE
						),
						React.createElement(
							GSCreateChannelContComponent,
							null,
							React.createElement(GSCreateChannelItemComponent, {
								title: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.MESSENGER.TITLE,
								desc: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.MESSENGER.DESC,
								onClick: this._onServiceSelect.bind(this, 'FacebookMessenger')
							}),
							React.createElement(GSCreateChannelItemComponent, {
								title: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.DID.TITLE,
								desc: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.DID.DESC,
								onClick: this._onServiceSelect.bind(this, 'Telephony')
							}),
							React.createElement(GSCreateChannelItemComponent, {
								title: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.EMAIL.TITLE,
								desc: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.EMAIL.DESC,
								onClick: this._onServiceSelect.bind(this, 'Email')
							}),
							React.createElement(GSCreateChannelItemComponent, {
								title: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.VIBER.TITLE,
								desc: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.VIBER.DESC,
								onClick: this._onServiceSelect.bind(this, 'Viber')
							}),
							React.createElement(GSCreateChannelItemComponent, {
								title: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.TELEGRAM.TITLE,
								desc: frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.TELEGRAM.DESC,
								onClick: this._onServiceSelect.bind(this, 'Telegram')
							})
						)
					)
				)
			)
		);
	}
});

GSCreateChannelsComponent = React.createFactory(GSCreateChannelsComponent);
var GSCreateUsersComponent = React.createClass({
	displayName: "GSCreateUsersComponent",


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func
	},

	_onAction: function () {
		this.props.closeGS(true);
		window.location.hash = "#users/users";
	},

	_nextStep: function () {
		this.props.nextStep();
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "gs-step" },
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"div",
						{ className: "gs-step-head" },
						React.createElement("img", { src: "/badmin/images/mainImage.png" })
					),
					React.createElement(
						"div",
						{ className: "gs-step-body" },
						React.createElement(
							"h3",
							null,
							frases.GET_STARTED.CREATE_USERS.TITLE
						),
						React.createElement(
							"p",
							null,
							frases.GET_STARTED.CREATE_USERS.DESC
						)
					),
					React.createElement(
						"div",
						{ className: "gs-step-footer" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-primary btn-lg", onClick: this._onAction },
							frases.GET_STARTED.CREATE_USERS.START_TOUR
						),
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-link", onClick: this._nextStep },
							frases.GET_STARTED.CREATE_USERS.SKIP_TOUR
						)
					)
				)
			)
		);
	}
});

GSCreateUsersComponent = React.createFactory(GSCreateUsersComponent);
var GSDownloadAppsComponent = React.createClass({
	displayName: "GSDownloadAppsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func
	},

	// _onAction: function() {
	// 	this.props.closeGS(true);
	// 	window.location.hash = "#users/users";
	// },

	_nextStep: function () {
		this.props.nextStep();
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "gs-step" },
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"div",
						{ className: "gs-step-head" },
						React.createElement("img", { src: "/badmin/images/apps.png" })
					),
					React.createElement(
						"div",
						{ className: "gs-step-body" },
						React.createElement(
							"h3",
							null,
							frases.GET_STARTED.DOWNLOAD_APPS.TITLE
						),
						React.createElement(
							"p",
							null,
							frases.GET_STARTED.DOWNLOAD_APPS.DESC
						)
					),
					React.createElement(
						"div",
						{ className: "gs-step-footer" },
						React.createElement(
							"a",
							{ href: "#", target: "_blanc", className: "btn btn-primary btn-lg", onClick: this._onAction },
							frases.GET_STARTED.DOWNLOAD_APPS.START_TOUR
						),
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-link", onClick: this._nextStep },
							frases.GET_STARTED.DOWNLOAD_APPS.SKIP_TOUR
						)
					)
				)
			)
		);
	}
});

GSDownloadAppsComponent = React.createFactory(GSDownloadAppsComponent);
var GSModalComponent = React.createClass({
	displayName: 'GSModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		initialStep: React.PropTypes.number,
		options: React.PropTypes.object,
		onClose: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			step: 0,
			components: [],
			profile: {},
			open: true,
			init: false
		};
	},

	componentWillMount: function () {
		this.setState({
			components: [GSCreateUsersComponent, GSDownloadAppsComponent, GSCreateChannelsComponent]
		});

		this.setState({
			init: true,
			step: this.props.initialStep
		});
	},

	componentWillReceiveProps: function (props) {
		var open = props.open === false ? false : true;

		this.setState({
			open: open,
			step: this.props.initialStep
		});
	},

	_nextStep: function (num) {
		var step = this.state.step;
		var next = step + 1;
		console.log('nextStep >>>', next);
		if (!this.state.components[next]) return;
		this.setState({
			step: num || next
		});
	},

	_prevStep: function () {
		var step = this.state.step;
		var next = step - 1;
		console.log('<<< prevStep', next);
		if (!this.state.components[next]) return;
		this.setState({
			step: next
		});
	},

	_closeModal: function (init) {
		this.setState({
			open: false
		});

		this.props.onClose(init);
	},

	_onClose: function () {
		this.props.onClose();
	},

	_getBody: function () {
		var Component = this.state.components[this.state.step];
		console.log('_getBody: ', this.state.step);
		return React.createElement(
			GSStepComponent,
			null,
			this.state.init ? React.createElement(Component, {
				frases: this.props.frases,
				profile: this.state.profile,
				group: this.state.group,
				nextStep: this._nextStep,
				prevStep: this._prevStep,
				closeGS: this._closeModal
				// options={this.state.options} 
			}) : React.createElement(Spinner, null)
		);
	},

	render: function () {
		var body = this._getBody();

		console.log('GSModalComponent render: ', body, this.state.open);

		return React.createElement(ModalComponent, {
			title: this.props.frases.GET_STARTED.TITLE,
			open: this.state.open,
			onClose: this._onClose,
			body: body
		});
	}
});

GSModalComponent = React.createFactory(GSModalComponent);
function InitGSButtonComponent(props) {

	function onClick(e) {
		e.preventDefault();
		props.onClick();
	}

	return React.createElement(
		"a",
		{ href: "#", className: "init-gs-btn", onClick: onClick },
		React.createElement("i", { className: "fa fa-play-circle fa-fw" }),
		React.createElement(
			"span",
			null,
			props.frases.GET_STARTED.TITLE
		)
	);
}
function GSStepComponent(props) {

	return React.createElement(
		"div",
		null,
		props.children
	);
}
function GSStepFooterComponent(props) {

	return React.createElement(
		"div",
		{ style: { padding: "10px 20px" } },
		React.createElement(
			"button",
			{ className: "btn btn-primary btn-lg pull-right", onClick: props.onSubmit },
			"Done"
		)
	);
}
var IcdGroupComponent = React.createClass({
	displayName: 'IcdGroupComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		getInfoFromState: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			files: [],
			filteredMembers: []
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {},
			options: this.props.params.options,
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			options: this.props.params.options,
			removeObject: props.removeObject,
			filteredMembers: props.params.members
		});
	},

	_setObject: function () {
		var params = this.state.params;
		params.options = this.state.options;
		params.files = this.state.files.reduce(function (array, item) {
			array.push(item.file);return array;
		}, []);
		params.route = this.state.route;
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

	_onAddMembers: function () {
		this.props.onAddMembers();
	},

	_handleOnChange: function (e) {
		var state = this.state;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.options[target.name] = type === 'number' ? parseFloat(value) : value;

		console.log('_handleOnChange: ', target, value);

		this.setState({
			state: state
		});
	},

	_onFileUpload: function (params) {
		var state = this.state;
		var found = false;

		var files = state.files.map(function (item) {
			if (item.name === params.name) {
				item = params;
				found = true;
			}
			return item;
		});

		if (!found) {
			files.push(params);
		}

		state.options[params.name] = params.filename;
		state.files = files;

		console.log('_onFileUpload: ', params, files);

		this.setState({
			state: state
		});
	},

	// _onFileUpload: function(e) {
	// 	var state = this.state;
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;

	// 	state.options[target.name] = value;
	// 	state.files.push(file);

	// 	console.log('_onFileUpload: ', target, value, file);

	// 	this.setState({
	// 		state: state
	// 	});	
	// },

	_onRouteChange: function (route) {
		console.log('_onRouteChange: ', route);
		this.setState({
			route: route
		});
	},

	_onSortMember: function (array) {
		var params = this.state.params;
		params.members = array;
		this.setState({
			params: params
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];

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
					React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, onAddMembers: this._onAddMembers, deleteMember: this.props.deleteMember })
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS },
						React.createElement(
							'ul',
							{ className: 'nav nav-tabs', role: 'tablist' },
							React.createElement(
								'li',
								{ role: 'presentation', className: 'active' },
								React.createElement(
									'a',
									{ href: '#tab-icd-general', 'aria-controls': 'general', role: 'tab', 'data-toggle': 'tab' },
									frases.ICD_GROUP.GENERAL_SETTINGS_TAB
								)
							),
							React.createElement(
								'li',
								{ role: 'presentation' },
								React.createElement(
									'a',
									{ href: '#tab-icd-queue', 'aria-controls': 'queue', role: 'tab', 'data-toggle': 'tab' },
									frases.ICD_GROUP.QUEUE_SETTINGS_TAB
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'tab-content', style: { padding: "20px 0" } },
							React.createElement(
								'div',
								{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-icd-general' },
								React.createElement(
									'form',
									{ className: 'form-horizontal' },
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.EXTENSION,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.EXTENSION })
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
											React.createElement(ObjectRoute, { frases: frases, routes: params.routes, onChange: this._onRouteChange })
										)
									),
									React.createElement('hr', null),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.PRIORITY,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__PRIORITY })
										),
										React.createElement(
											'div',
											{ className: 'col-md-4 col-sm-2' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'priority', value: this.state.options.priority, onChange: this._handleOnChange })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.SETTINGS.MAXCONN,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__CONN_NUM })
										),
										React.createElement(
											'div',
											{ className: 'col-md-4 col-sm-2' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'maxlines', value: this.state.options.maxlines, onChange: this._handleOnChange })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.NOANSTOUT,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__NA_TOUT })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(
												'div',
												{ className: 'input-group' },
												React.createElement('input', { type: 'text', className: 'form-control', name: 'natimeout', value: this.state.options.natimeout, onChange: this._handleOnChange }),
												React.createElement(
													'span',
													{ className: 'input-group-addon' },
													frases.SECONDS
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.RESUMETIME,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__RESUME_TIME })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(
												'div',
												{ className: 'input-group' },
												React.createElement('input', { type: 'text', className: 'form-control', name: 'resumetime', value: this.state.options.resumetime, onChange: this._handleOnChange }),
												React.createElement(
													'span',
													{ className: 'input-group-addon' },
													frases.SECONDS
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.ROUTEMETH.ROUTEMETH,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__METHOD })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(
												'select',
												{ name: 'method', className: 'form-control', value: this.state.options.method, onChange: this._handleOnChange },
												React.createElement(
													'option',
													{ value: '0' },
													frases.ROUTEMETH.UNIFORM
												),
												React.createElement(
													'option',
													{ value: '1' },
													frases.ROUTEMETH.PRIORITY
												),
												React.createElement(
													'option',
													{ value: '2' },
													frases.ROUTEMETH.RANDOM
												),
												React.createElement(
													'option',
													{ value: '3' },
													frases.ROUTEMETH.CALLER_ID
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.GREETNAME,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__GREETINGS })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(FileUpload, { frases: frases, name: 'greeting', value: this.state.options.greeting, onChange: this._onFileUpload })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.QUEUEPROMPT,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__QUEUEPROMPT })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(FileUpload, { frases: frases, name: 'queueprompt', value: this.state.options.queueprompt, onChange: this._onFileUpload })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.QUEUEMUSIC,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__QUEUEMUSIC })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement(FileUpload, { frases: frases, name: 'queuemusic', value: this.state.options.queuemusic, onChange: this._onFileUpload })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'div',
											{ className: 'col-sm-offset-4 col-sm-8' },
											React.createElement(
												'div',
												{ className: 'input-group' },
												React.createElement(
													'div',
													{ className: 'checkbox' },
													React.createElement(
														'label',
														null,
														React.createElement('input', { type: 'checkbox', name: 'autologin', checked: this.state.options.autologin, onChange: this._handleOnChange }),
														React.createElement(
															'span',
															null,
															frases.AUTOREG,
															' '
														)
													),
													React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__AUTO_REG })
												),
												React.createElement(
													'span',
													{ className: 'input-group-btn' },
													React.createElement(
														'button',
														{ type: 'button', className: 'btn btn-default', name: 'open-autologin-options', style: { display: "none" } },
														React.createElement('i', { className: 'fa fa-cog fa-fw' })
													)
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'div',
											{ className: 'col-sm-offset-4 col-sm-8' },
											React.createElement(
												'div',
												{ className: 'checkbox' },
												React.createElement(
													'label',
													null,
													React.createElement('input', { type: 'checkbox', name: 'canpickup', checked: this.state.options.canpickup, onChange: this._handleOnChange }),
													React.createElement(
														'span',
														null,
														frases.ALLOW_PICKUP,
														' '
													)
												),
												React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__ALLOW_PICKUP })
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.GROUPNUM,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.GRP__GRP_NUMBER })
										),
										React.createElement(
											'div',
											{ className: 'col-md-4 col-sm-2' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'groupno', value: this.state.options.groupno, onChange: this._handleOnChange })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.APPLICATION,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__APPLICATION })
										),
										React.createElement(
											'div',
											{ className: 'col-sm-6' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'application', value: this.state.options.application, onChange: this._handleOnChange })
										)
									)
								)
							),
							React.createElement(
								'div',
								{ role: 'tabpanel', className: 'tab-pane fade', id: 'tab-icd-queue' },
								React.createElement(
									'form',
									{ className: 'form-horizontal' },
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.QUEUELEN,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__Q_LENGTH })
										),
										React.createElement(
											'div',
											{ className: 'col-md-4 col-sm-2' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'queuelen', value: this.state.options.queuelen, onChange: this._handleOnChange })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.OVERFLOWREDIR,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__Q_OVERFLOW_FWD })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'overflowredirect', value: this.state.options.overflowredirect, onChange: this._handleOnChange })
										)
									),
									React.createElement('hr', null),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.MAXQWAIT,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__Q_WAIT })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-3' },
											React.createElement(
												'div',
												{ className: 'input-group' },
												React.createElement('input', { type: 'text', className: 'form-control', name: 'maxqwait', value: this.state.options.maxqwait, onChange: this._handleOnChange }),
												React.createElement(
													'span',
													{ className: 'input-group-addon' },
													frases.SECONDS
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.OVERTIMEREDIR,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__Q_OVERTIME_FWD })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-4' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'overtimeredirect', value: this.state.options.overtimeredirect, onChange: this._handleOnChange })
										)
									),
									React.createElement('hr', null),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.INDICMODE,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__INDICATION })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-2' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'indicationmode', value: this.state.options.indicationmode, onChange: this._handleOnChange })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												frases.INDICTIME,
												' '
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__INDICATION_TIME })
										),
										React.createElement(
											'div',
											{ className: 'col-md-8 col-sm-3' },
											React.createElement(
												'div',
												{ className: 'input-group' },
												React.createElement('input', { type: 'text', className: 'form-control', name: 'indicationtime', value: this.state.options.indicationtime, onChange: this._handleOnChange }),
												React.createElement(
													'span',
													{ className: 'input-group-addon' },
													frases.SECONDS
												)
											)
										)
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

IcdGroupComponent = React.createFactory(IcdGroupComponent);
function ImportUsersButtonsComponent(props) {

	function onClick(service, e) {
		e.preventDefault();
		props.onClick(service);
	}

	return React.createElement(
		"div",
		{ className: "btn-group", style: { margin: "10px 5px" } },
		React.createElement(
			"button",
			{ type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
			React.createElement("i", { className: "fa fa-cloud-download fa-fw" }),
			" ",
			props.frases.IMPORT_USERS,
			" ",
			React.createElement("span", { className: "caret" })
		),
		React.createElement(
			"ul",
			{ className: "dropdown-menu" },
			props.services.map(function (item) {
				return React.createElement(
					"li",
					{ key: item.id },
					React.createElement(
						"a",
						{ href: "#", onClick: onClick.bind(this, item) },
						React.createElement(
							"span",
							null,
							props.frases.IMPORT_USERS_FROM
						),
						React.createElement(
							"strong",
							null,
							" ",
							item.name
						)
					)
				);
			}.bind(this))
		)
	);
}
var GroupMembersComponent = React.createClass({
	displayName: 'GroupMembersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		withGroups: React.PropTypes.bool,
		getExtension: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		activeServices: React.PropTypes.array,
		onImportUsers: React.PropTypes.func,
		onSort: React.PropTypes.func,
		addSteps: React.PropTypes.func
	},

	componentWillMount: function () {
		this.setState({
			filteredMembers: this.props.members || []
		});
	},

	componentDidMount: function () {
		console.log('GroupMembersComponent componentDidMount');
		var frases = this.props.frases;

		if (this.props.addSteps) {
			this.props.addSteps([{
				element: '#new-users-btns .btn-primary',
				popover: {
					title: frases.GET_STARTED.CREATE_USERS.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CREATE_USERS.STEPS["1"].DESC,
					position: 'bottom',
					showButtons: false
				}
			}]);
		}
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			filteredMembers: props.members || []
		});
	},

	_getInfoFromState: function (state, group) {
		var status, className;

		if (state == 1) {
			className = 'success';
		} else if (state == 8) {
			className = 'connected';
		} else if (state == 2 || state == 5) {
			className = 'warning';
		} else if (state == 0 || state == -1 && group) {
			// state = '';
			className = 'default';
		} else if (state == 3) {
			className = 'danger';
		} else if (state == 6 || state == 7) {
			className = 'info';
		} else {
			className = 'active';
		}
		status = PbxObject.frases.STATES[state] || '';

		return {
			rstatus: status,
			rclass: 'bg-' + className,
			className: className
		};
	},

	_getKindIcon: function (kind) {
		var icon = '';

		if (kind === 'user') icon = 'fa-user';else if (kind === 'phone') icon = 'fa-fax';else if (kind === 'chatchannel') icon = 'fa-comments-o';else if (kind === 'hunting') icon = 'icon-find_replace';else if (kind === 'icd') icon = 'icon-headset_mic';else if (kind === 'selector') icon = 'fa-line-chart';else if (kind === 'attendant') icon = 'icon-room_service';else if (kind === 'trunk') icon = 'fa-cloud';else if (kind === 'chattrunk') icon = 'fa-whatsapp';else if (kind === 'timer') icon = 'fa-calendar';else if (kind === 'routes') icon = 'fa-arrows';else if (kind === 'channel') icon = 'fa-rss';else if (kind === 'conference') icon = 'icon-call_split';else if (kind === 'pickup') icon = 'icon-phone_missed';else if (kind === 'cli') icon = 'icon-fingerprint';

		return icon;
	},

	_onFilter: function (items) {
		this.setState({
			filteredMembers: items
		});
	},

	_tableRef: function (el) {
		console.log('_tableRef: ', el);
		if (this.props.sortable) return new Sortable(el);
	},

	_reorderMembers: function (members, order) {
		var newArray = [];
		newArray.length = members.length;

		members.forEach(function (item, index, array) {
			newArray[order.indexOf(item.oid)] = item;
			// newArray.splice(order.indexOf(item.oid), 0, newArray.splice(index, 1)[0]);
		});

		return newArray;
	},

	_onSortEnd: function (e) {
		var target = e.currentTarget;
		var order = [].slice.call(target.children).map(function (el, index) {
			el = el.id;
			return el;
		});

		this.props.onSort(this._reorderMembers(this.props.members, order));
	},

	_onImportFromService: function (params) {
		this.props.onImportUsers(params);
	},

	render: function () {
		var frases = this.props.frases;
		var members = this.props.members;
		var filteredMembers = this.state.filteredMembers || [];

		// <FilterInputComponent items={members} onChange={this._onFilter} />

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12', id: 'new-users-btns' },
				this.props.onAddMembers && React.createElement(
					'button',
					{ type: 'button', role: 'button', className: 'btn btn-primary', style: { margin: "10px 5px" }, onClick: this.props.onAddMembers },
					React.createElement('i', { className: 'fa fa-user-plus' }),
					' ',
					frases.ADD_USER
				),
				this.props.activeServices && this.props.activeServices.length ? React.createElement(ImportUsersButtonsComponent, { frases: frases, services: this.props.activeServices, onClick: this._onImportFromService }) : null
			),
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				React.createElement(
					'div',
					{ className: 'panel' },
					React.createElement(
						'div',
						{ className: 'panel-body', style: { padding: "0" } },
						React.createElement(
							'div',
							{ className: 'table-responsive' },
							React.createElement(
								'table',
								{ className: "table table-hover" + (filteredMembers.length && this.props.sortable ? "sortable" : ""), id: 'group-extensions', style: { marginBottom: "0" } },
								React.createElement(
									'tbody',
									{ ref: this._tableRef, onTouchEnd: this._onSortEnd, onDragEnd: this._onSortEnd },
									filteredMembers.length ? filteredMembers.map(function (item, index) {

										item.icon = this._getKindIcon(item.kind);

										return React.createElement(GroupMemberComponent, {
											key: item.oid,
											sortable: this.props.sortable,
											item: item,
											withGroup: this.props.withGroups,
											itemState: this._getInfoFromState(item.state),
											getExtension: this.props.getExtension,
											deleteMember: this.props.deleteMember
										});
									}.bind(this)) : React.createElement(
										'tr',
										null,
										React.createElement(
											'td',
											{ colSpan: '5' },
											frases.CHAT_CHANNEL.NO_MEMBERS
										)
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

GroupMembersComponent = React.createFactory(GroupMembersComponent);
function GroupMemberComponent(props) {

	var item = props.item;
	var itemState = props.itemState;

	function getExtension() {
		if (!item.kind || item.kind === 'user' || item.kind === 'phone') {
			props.getExtension(item.oid);
		} else {
			window.location.hash = '#' + item.kind + '/' + item.oid;
		}
	}

	function deleteMember(e) {
		e.stopPropagation();
		props.deleteMember(item);
	}

	return React.createElement(
		'tr',
		{ id: item.oid, onClick: getExtension, style: { cursor: "pointer" } },
		props.sortable && React.createElement(
			'td',
			{ className: 'draggable', style: { textAlign: "center" } },
			React.createElement('i', { className: 'fa fa-ellipsis-v' })
		),
		React.createElement(
			'td',
			{ style: { textAlign: "center" } },
			React.createElement('span', { className: "fa " + item.icon })
		),
		React.createElement(
			'td',
			{ 'data-cell': 'status', style: { "textAlign": "left" } },
			React.createElement(
				'span',
				{ className: "label label-" + itemState.className },
				itemState.rstatus
			)
		),
		React.createElement(
			'td',
			{ 'data-cell': 'ext' },
			item.number || item.ext
		),
		React.createElement(
			'td',
			{ 'data-cell': 'name' },
			item.name
		),
		props.withGroup && React.createElement(
			'td',
			{ 'data-cell': 'group' },
			item.group
		),
		React.createElement(
			'td',
			{ 'data-cell': 'reg' },
			item.reg
		),
		React.createElement(
			'td',
			{ style: { "textAlign": "right" } },
			React.createElement(
				'button',
				{ className: 'btn btn-link btn-danger btn-md', onClick: deleteMember },
				React.createElement('i', { className: 'fa fa-trash' })
			)
		)
	);
}
var HuntingGroupComponent = React.createClass({
	displayName: 'HuntingGroupComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func,
		getInfoFromState: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			files: []
			// filteredMembers: []
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {},
			options: this.props.params.options,
			removeObject: this.props.removeObject
			// filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			options: this.props.params.options,
			removeObject: props.removeObject
			// filteredMembers: props.params.members
		});
	},

	_setObject: function () {
		var params = this.state.params;
		params.options = this.state.options;
		params.files = this.state.files.reduce(function (array, item) {
			array.push(item.file);return array;
		}, []);
		params.route = this.state.route;
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

	_onAddMembers: function () {
		this.props.onAddMembers();
	},

	_handleOnChange: function (e) {
		var options = this.state.options;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		options[target.name] = type === 'number' ? parseFloat(value) : value;

		console.log('_handleOnChange: ', target, value);

		this.setState({
			options: options
		});
	},

	_onFileUpload: function (params) {
		var state = this.state;
		var found = false;

		var files = state.files.map(function (item) {
			if (item.name === params.name) {
				item = params;
				found = true;
			}
			return item;
		});

		if (!found) {
			files.push(params);
		}

		state.options[params.name] = params.filename;
		state.files = files;

		console.log('_onFileUpload: ', params, files);

		this.setState({
			state: state
		});
	},

	// _onFileUpload: function(e) {
	// 	var options = this.state.options;
	// 	var files = this.state.files;
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;

	// 	options[target.name] = value;
	// 	files.push(file);

	// 	console.log('_onFileUpload: ', target, value, file);

	// 	this.setState({
	// 		options: options,
	// 		files: files
	// 	});	
	// },

	_onRouteChange: function (route) {
		console.log('_onRouteChange: ', route);
		this.setState({
			route: route
		});
	},

	_onSortMember: function (array) {
		var params = this.state.params;
		params.members = array;
		this.setState({
			params: params
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		// var filteredMembers = this.state.filteredMembers || [];

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
					React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, onAddMembers: this._onAddMembers, deleteMember: this.props.deleteMember })
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS },
						React.createElement(
							'form',
							{ className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									React.createElement(
										'span',
										null,
										frases.EXTENSION,
										' '
									),
									React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.EXTENSION })
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement(ObjectRoute, { frases: frases, routes: params.routes, onChange: this._onRouteChange })
								)
							),
							React.createElement('hr', null),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									React.createElement(
										'span',
										null,
										frases.HUNTINGTYPE.HUNTINGTYPE,
										' '
									),
									React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.GRP__HUNT_MODE })
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement(
										'select',
										{ 'data-type': 'number', name: 'huntmode', value: this.state.options.huntmode, onChange: this._handleOnChange, className: 'form-control' },
										React.createElement(
											'option',
											{ value: '1' },
											frases.HUNTINGTYPE.SERIAL
										),
										React.createElement(
											'option',
											{ value: '3' },
											frases.HUNTINGTYPE.PARALLEL
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									React.createElement(
										'span',
										null,
										frases.HUNT_TOUT,
										' '
									),
									React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.GRP__CALL_TOUT })
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement('input', { type: 'number', className: 'form-control', value: this.state.options.timeout, name: 'timeout', onChange: this._handleOnChange })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'div',
									{ className: 'col-sm-offset-4 col-sm-8' },
									React.createElement(
										'div',
										{ className: 'checkbox' },
										React.createElement(
											'label',
											null,
											React.createElement('input', { type: 'checkbox', name: 'huntfwd', checked: this.state.options.huntfwd, onChange: this._handleOnChange }),
											' ',
											frases.FORWFROMHUNT
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									React.createElement(
										'span',
										null,
										frases.GREETNAME,
										' '
									),
									React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.UNIT__GREETINGS })
								),
								React.createElement(
									'div',
									{ className: 'col-md-8 col-sm-4' },
									React.createElement(FileUpload, { frases: frases, name: 'greeting', value: this.state.options.greeting, onChange: this._onFileUpload })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-4 control-label' },
									React.createElement(
										'span',
										null,
										frases.WAIT_MUSIC,
										' '
									),
									React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.UNIT__WAITMUSIC })
								),
								React.createElement(
									'div',
									{ className: 'col-md-8 col-sm-4' },
									React.createElement(FileUpload, { frases: frases, name: 'waitmusic', value: this.state.options.waitmusic, onChange: this._onFileUpload })
								)
							)
						)
					)
				)
			)
		);
	}
});

HuntingGroupComponent = React.createFactory(HuntingGroupComponent);
var AvailableUsersModalComponent = React.createClass({
	displayName: "AvailableUsersModalComponent",


	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		onSubmit: React.PropTypes.func,
		modalId: React.PropTypes.string
	},

	getInitialState: function () {
		return {
			selectedUsers: []
		};
	},

	_saveChanges: function () {
		this.props.onSubmit(this.state.selectedUsers);
	},

	_onUsersSelected: function (users) {
		this.setState({ selectedUsers: users });
	},

	_getBody: function () {
		var frases = this.props.frases;
		return React.createElement(AvailableUsersComponent, { frases: frases, onChange: this._onUsersSelected, groupid: this.props.groupid });
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: "sm",
			type: "success",
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.CHAT_CHANNEL.ADD_SELECTED,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			closeOnSubmit: true,
			body: body
		});
	}

});

AvailableUsersModalComponent = React.createFactory(AvailableUsersModalComponent);
var CreateGroupModalComponent = React.createClass({
	displayName: 'CreateGroupModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			selectedUsers: []
		};
	},

	_onUsersSelected: function (users) {
		console.log('_onUsersSelected: ', users);
		this.setState({ selectedUsers: users });
	},

	_onSubmit: function () {
		console.log('_onSubmit');
	},

	_getBody: function () {
		var frases = this.props.frases;
		return React.createElement(AvailableUsersComponent, { frases: frases, onChange: this._onUsersSelected });
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: 'sm',
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.ADD,
			cancelText: frases.CANCEL,
			submit: this._onSubmit,
			body: body
		});
	}

});

CreateGroupModalComponent = React.createFactory(CreateGroupModalComponent);

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
var ServicesComponent = React.createClass({
	displayName: "ServicesComponent",


	propTypes: {
		frases: React.PropTypes.object,
		services: React.PropTypes.array,
		ldap: React.PropTypes.object,
		saveOptions: React.PropTypes.func,
		saveLdapOptions: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			services: [],
			ldap: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			services: this.props.services || [],
			ldap: this.props.ldap || {}
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			services: props.services || [],
			ldap: props.ldap || {}
		});
	},

	_saveOptions: function (index, props) {
		this.props.saveOptions(props);
	},

	_saveLdapOptions: function (props) {
		this.props.saveLdapOptions(props);
	},

	render: function () {
		var frases = this.props.frases;
		var services = this.state.services;
		var ldap = this.state.ldap;

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					PanelComponent,
					null,
					React.createElement(
						"div",
						{ className: "panel-group", id: "services-acc", role: "tablist", "aria-multiselectable": "true", style: { marginBottom: '10px', borderRadius: 0, cursor: 'pointer' } },
						React.createElement(LdapOptionsComponent, { params: ldap, frases: frases, onSave: this._saveLdapOptions }),
						services.map(function (item, index) {
							return React.createElement(ServiceItemComponent, {
								key: item.id,
								index: index,
								params: item,
								frases: frases,
								onSave: this._saveOptions.bind(this, index)
							});
						}.bind(this))
					)
				)
			)
		);
	}
});

ServicesComponent = React.createFactory(ServicesComponent);
var LdapOptionsComponent = React.createClass({
	displayName: 'LdapOptionsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSave: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params
		});
	},

	_saveServiceProps: function () {
		var params = this.state.params;
		var customPhoneAtt = this._isCustomPhoneAttr(params.props.directoryAttributePhone);

		if (customPhoneAtt) {
			params.props.directoryAttributePhone = params.props.customDirectoryAttributePhone;
		}

		delete params.props.customDirectoryAttributePhone;

		this.props.onSave(params);
	},

	_onChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
		var update = this.state.params;

		update.props[target.name] = value !== null ? value : "";;

		console.log('ServiceItemComponent _onChange', update);

		this.setState({
			params: update
		});
	},

	_isCustomPhoneAttr: function (val) {
		var regex = new RegExp('telephoneNumber|mobile|ipPhone');
		return !regex.test(val);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var customPhoneAtt = this._isCustomPhoneAttr(params.props.directoryAttributePhone);

		if (customPhoneAtt && !params.props.customDirectoryAttributePhone) {
			params.props.customDirectoryAttributePhone = params.props.directoryAttributePhone !== '0' ? params.props['directoryAttributePhone'] : '';
		}

		return React.createElement(
			'div',
			{ className: 'panel panel-default', style: { borderRadius: 0 } },
			React.createElement(
				'div',
				{
					className: 'panel-heading',
					role: 'tab',
					style: { backgroundColor: 'white' },
					'data-parent': '#services-acc',
					'data-toggle': 'collapse',
					'data-target': "#acc-" + params.id,
					'aria-expanded': 'true',
					'aria-controls': 'collapseOne'
				},
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-sm-2 text-center' },
						React.createElement('img', {
							src: "/badmin/images/services/" + params.id + '.png',
							alt: params.name,
							style: { maxWidth: '100%', maxHeight: '65px' }
						})
					),
					React.createElement(
						'div',
						{ className: 'col-sm-10' },
						React.createElement(
							'h4',
							null,
							params.name
						)
					)
				)
			),
			React.createElement(
				'div',
				{
					id: "acc-" + params.id,
					className: 'panel-collapse collapse',
					role: 'tabpanel',
					'aria-labelledby': 'headingOne'
				},
				React.createElement(
					'div',
					{ className: 'panel-body' },
					React.createElement(
						'form',
						{ className: 'form-horizontal', autoComplete: 'off' },
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'directoryServer', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_SERVER },
								frases.LDAP.DIR_SERVER
							),
							React.createElement(
								'div',
								{ className: 'col-sm-4' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'directoryServer', value: params.props.directoryServer, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement(
									'div',
									{ className: 'checkbox' },
									React.createElement(
										'label',
										null,
										React.createElement('input', { type: 'checkbox', name: 'directorySSL', checked: params.props.directorySSL, onChange: this._onChange }),
										' ',
										frases.LDAP.DIR_SSL
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'directoryAttributeUID', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_ATTR_UID },
								frases.LDAP.DIR_ATTR_UID
							),
							React.createElement(
								'div',
								{ className: 'col-sm-4' },
								React.createElement(
									'select',
									{ className: 'form-control', name: 'directoryAttributeUID', value: params.props.directoryAttributeUID, onChange: this._onChange },
									React.createElement(
										'option',
										{ value: 'userPrincipalName' },
										'userPrincipalName'
									),
									React.createElement(
										'option',
										{ value: 'sAMAccountName' },
										'sAMAccountName'
									),
									React.createElement(
										'option',
										{ value: 'uid' },
										'uid'
									),
									React.createElement(
										'option',
										{ value: 'name' },
										'name'
									),
									React.createElement(
										'option',
										{ value: 'mail' },
										'mail'
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'directoryAttributePhone', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_ATTR_PHONE },
								frases.LDAP.DIR_ATTR_PHONE
							),
							React.createElement(
								'div',
								{ className: 'col-sm-4' },
								React.createElement(
									'select',
									{ className: 'form-control', name: 'directoryAttributePhone', value: customPhoneAtt ? '0' : params.props.directoryAttributePhone, onChange: this._onChange },
									React.createElement(
										'option',
										{ value: 'telephoneNumber' },
										'telephoneNumber'
									),
									React.createElement(
										'option',
										{ value: 'mobile' },
										'mobile'
									),
									React.createElement(
										'option',
										{ value: 'ipPhone' },
										'ipPhone'
									),
									React.createElement(
										'option',
										{ value: '0' },
										frases.OTHER
									)
								)
							)
						),
						customPhoneAtt && React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'customDirectoryAttributePhone', value: params.props.customDirectoryAttributePhone, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'directoryAuth', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_AUTH },
								frases.LDAP.DIR_AUTH
							),
							React.createElement(
								'div',
								{ className: 'col-sm-4' },
								React.createElement(
									'select',
									{ className: 'form-control', name: 'directoryAuth', value: params.props.directoryAuth, onChange: this._onChange },
									React.createElement(
										'option',
										{ value: 'simple' },
										'simple'
									),
									React.createElement(
										'option',
										{ value: 'DIGEST-MD5' },
										'DIGEST-MD5'
									),
									React.createElement(
										'option',
										{ value: 'GSSAPI' },
										'GSSAPI (Kerberos 5)'
									)
								)
							)
						),
						params.props.directoryAuth === 'GSSAPI' && React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ htmlFor: 'directoryKDC', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_KDC },
									frases.LDAP.GSSAPI.DIR_KDC
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement('input', { type: 'text', className: 'form-control', name: 'directoryKDC', value: params.props.directoryKDC, onChange: this._onChange })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ htmlFor: 'directoryAdminServer', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_ADMIN_SERVER },
									frases.LDAP.GSSAPI.DIR_ADMIN_SERVER
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement('input', { type: 'text', className: 'form-control', name: 'directoryAdminServer', value: params.props.directoryAdminServer, onChange: this._onChange })
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'directoryDomains', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.LDAP__DIR_DOMAINS },
								frases.LDAP.GSSAPI.DIR_DOMAINS
							),
							React.createElement(
								'div',
								{ className: 'col-sm-4' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'directoryDomains', value: params.props.directoryDomains, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-success btn-md', onClick: this._saveServiceProps },
									React.createElement('i', { className: 'fa fa-check fa-fw' }),
									' ',
									this.props.frases.SAVE
								)
							)
						)
					)
				)
			)
		);
	}

});

LdapOptionsComponent = React.createFactory(LdapOptionsComponent);
var ServiceItemComponent = React.createClass({
	displayName: 'ServiceItemComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSave: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {}
		};
	},

	componentWillMount: function () {
		var params = this.props.params;
		var state = {};

		Object.keys(params).map(function (key) {
			state[key] = params[key];
			return key;
		});

		this.setState({
			params: state
		});
	},

	componentWillReceiveProps: function (props) {
		var params = props.params;
		var state = {};

		Object.keys(params).map(function (key) {
			state[key] = params[key];
			return key;
		});

		this.setState({
			params: state
		});
	},

	_saveServiceProps: function () {
		console.log('ServiceItemComponent _saveServiceProps', this.state.params);
		this.props.onSave(this.state.params);
	},

	_onChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
		var update = this.state.params;

		update[target.name] = value !== null ? value : "";;

		console.log('ServiceItemComponent _onChange', update);

		this.setState({
			params: update
		});
	},

	_onPropsChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
		var update = this.state.params;

		update.props[target.name] = value !== null ? value : "";;

		this.setState({
			params: update
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var props = Object.keys(params.props).map(function (key) {
			return {
				key: key,
				value: params.props[key]
			};
		});

		console.log('ServiceItemComponent render: ', this.state.params);

		return React.createElement(
			'div',
			{ className: 'panel panel-default', style: { borderRadius: 0 } },
			React.createElement(
				'div',
				{
					className: 'panel-heading',
					role: 'tab',
					style: { backgroundColor: 'white' },
					'data-parent': '#services-acc',
					'data-toggle': 'collapse',
					'data-target': "#acc-" + params.id,
					'aria-expanded': 'true',
					'aria-controls': 'collapseOne'
				},
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-sm-2 text-center' },
						React.createElement('img', {
							src: "/badmin/images/services/" + params.id + '.png',
							alt: params.name,
							style: { maxWidth: '100%', maxHeight: '65px' }
						})
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement(
							'h4',
							null,
							params.name
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-2' },
						React.createElement(
							'span',
							{
								style: { fontSize: '12px' },
								className: "label label-" + (this.props.params.state ? 'success' : 'default')
							},
							this.props.params.state ? 'enabled' : 'disabled'
						)
					)
				)
			),
			React.createElement(
				'div',
				{
					id: "acc-" + params.id,
					className: 'panel-collapse collapse',
					role: 'tabpanel',
					'aria-labelledby': 'headingOne'
				},
				React.createElement(
					'div',
					{ className: 'panel-body' },
					React.createElement(
						'form',
						{ className: 'form-horizontal' },
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement(
									'div',
									{ className: 'checkbox' },
									React.createElement(
										'label',
										{ 'data-toggle': 'tooltip', title: frases.ENABLE },
										React.createElement('input', { type: 'checkbox', checked: params.state, name: 'state', onChange: this._onChange }),
										' ',
										frases.ENABLE
									)
								)
							)
						),
						props.map(function (item) {
							return React.createElement(ServicePropComponent, { key: item.key, params: item, onChange: this._onPropsChange });
						}.bind(this)),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-success btn-md', onClick: this._saveServiceProps },
									React.createElement('i', { className: 'fa fa-check fa-fw' }),
									' ',
									this.props.frases.SAVE
								)
							)
						)
					)
				)
			)
		);
	}

});

ServiceItemComponent = React.createFactory(ServiceItemComponent);
var ServicePropComponent = React.createClass({
	displayName: 'ServicePropComponent',


	propTypes: {
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {}
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params || {}
		});
	},

	_onChange: function (e) {
		this.props.onChange(e);
	},

	render: function () {
		var params = this.state.params;
		var type = typeof this.props.params.value;
		var label = params.key.replace('_', ' ').replace('directory', '');

		return React.createElement(
			'div',
			null,
			type === 'boolean' ? React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'div',
					{ className: 'col-sm-4 col-sm-offset-4' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', checked: params.value, name: params.key, onChange: this._onChange }),
							' ',
							params.key
						)
					)
				)
			) : type === 'number' ? React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: params.key, className: 'col-sm-4 control-label' },
					label
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'number', name: params.key, className: 'form-control', value: params.value, onChange: this._onChange })
				)
			) : React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: params.key, className: 'col-sm-4 control-label' },
					label
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', name: params.key, className: 'form-control', value: params.value, onChange: this._onChange })
				)
			)
		);
	}
});

ServicePropComponent = React.createFactory(ServicePropComponent);
var BranchOptionsComponent = React.createClass({
    displayName: 'BranchOptionsComponent',


    propTypes: {
        frases: React.PropTypes.object,
        params: React.PropTypes.object,
        onChange: React.PropTypes.func
    },

    _onChange: function (e) {
        var target = e.target;
        var type = target.getAttribute('data-type') || target.type;
        var dataModel = target.getAttribute('data-model');
        var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
        var update = this.props.params;

        update[dataModel] = update[dataModel] || {};
        update[dataModel][target.name] = value !== null ? value : "";

        this.props.onChange(update);
    },

    _onCodecsTableChange: function (params) {
        if (!params.model) return;
        var update = this.props.params;

        update[params.model].codecs = params.codecs.filter(this._filterEnabled).map(this._removeEnabledProp);
        this.props.onChange(update);
    },

    _removeEnabledProp: function (item) {
        delete item.enabled;
        return item;
    },

    _filterEnabled: function (item) {
        return item.enabled;
    },

    render: function () {
        var frases = this.props.frases;
        var params = this.props.params;

        return React.createElement(
            'form',
            { className: 'form-horizontal acc-cont' },
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-sip-opts' },
                frases.SETTINGS.SIP,
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-sip-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(
                            'div',
                            { className: 'checkbox' },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: 'enabled', 'data-model': 'sip', checked: params.sip ? params.sip.enabled : '', onChange: this._onChange }),
                                ' ',
                                frases.ENABLE
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'sip-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', name: 'port', className: 'form-control', 'data-model': 'sip', value: params.sip ? params.sip.port : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'sip-log', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.LOG_LEVEL
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { className: 'form-control', 'data-type': 'number', name: 'log', value: params.sip ? params.sip.log : '', 'data-model': 'sip', onChange: this._onChange },
                            React.createElement(
                                'option',
                                { value: '0' },
                                '0'
                            ),
                            React.createElement(
                                'option',
                                { value: '1' },
                                '1'
                            ),
                            React.createElement(
                                'option',
                                { value: '2' },
                                '2'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(AvCodecsTableComponent, { model: 'sip', availableCodecs: params.avcodecs, enabledCodecs: params.sip.codecs, frases: frases, onChange: this._onCodecsTableChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-sips-opts' },
                frases.SETTINGS.SIPS,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-sips-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(
                            'div',
                            { className: 'checkbox' },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: 'enabled', 'data-model': 'sips', checked: params.sips ? params.sips.enabled : '', onChange: this._onChange }),
                                ' ',
                                frases.ENABLE
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'sips-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'port', 'data-model': 'sips', value: params.sips ? params.sips.port : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'sips-log', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.LOG_LEVEL
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { name: 'log', 'data-type': 'number', 'data-model': 'sips', value: params.sips ? params.sips.log : '', className: 'form-control', onChange: this._onChange },
                            React.createElement(
                                'option',
                                { value: '0' },
                                '0'
                            ),
                            React.createElement(
                                'option',
                                { value: '1' },
                                '1'
                            ),
                            React.createElement(
                                'option',
                                { value: '2' },
                                '2'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(AvCodecsTableComponent, { model: 'sips', availableCodecs: params.avcodecs, enabledCodecs: params.sips.codecs, frases: frases, onChange: this._onCodecsTableChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-wss-opts' },
                frases.SETTINGS.WSS,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-wss-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(
                            'div',
                            { className: 'checkbox' },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: 'enabled', 'data-model': 'wss', value: params.wss ? params.wss.enabled : '', onChange: this._onChange }),
                                ' ',
                                frases.ENABLE
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'wss-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'port', 'data-model': 'wss', value: params.wss ? params.wss.port : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'wss-log', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.LOG_LEVEL
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { name: 'log', 'data-type': 'number', 'data-model': 'wss', value: params.wss ? params.wss.log : '', className: 'form-control', onChange: this._onChange },
                            React.createElement(
                                'option',
                                { value: '0' },
                                '0'
                            ),
                            React.createElement(
                                'option',
                                { value: '1' },
                                '1'
                            ),
                            React.createElement(
                                'option',
                                { value: '2' },
                                '2'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(AvCodecsTableComponent, { model: 'wss', availableCodecs: params.avcodecs, enabledCodecs: params.wss.codecs, frases: frases, onChange: this._onCodecsTableChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-http-opts' },
                frases.SETTINGS.HTTP,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-http-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'http-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'port', 'data-model': 'http', value: params.http ? params.http.port : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'http-log', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.LOG_LEVEL
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { name: 'log', 'data-type': 'number', 'data-model': 'http', value: params.http ? params.http.log : '', className: 'form-control', onChange: this._onChange },
                            React.createElement(
                                'option',
                                { value: '0' },
                                '0'
                            ),
                            React.createElement(
                                'option',
                                { value: '1' },
                                '1'
                            ),
                            React.createElement(
                                'option',
                                { value: '2' },
                                '2'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(
                            'div',
                            { className: 'checkbox' },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: 'ssl', 'data-model': 'http', checked: params.http ? params.http.ssl : '', onChange: this._onChange }),
                                ' SSL'
                            )
                        )
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-nat-opts' },
                frases.SETTINGS.NAT.NAT,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-nat-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'stun', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NAT.STUN_SERVER
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'stun', 'data-model': 'nat', value: params.nat ? params.nat.stun : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'router', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NAT.ROUTER
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'router', 'data-model': 'nat', value: params.nat ? params.nat.router : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'rtpfirst', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NAT.RTP_RANGE
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'div',
                            { className: 'col-xs-5' },
                            React.createElement('input', { type: 'number', className: 'form-control', name: 'rtpfirst', 'data-model': 'nat', value: params.nat ? params.nat.rtpfirst : '', onChange: this._onChange })
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-xs-1' },
                            ' - '
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-xs-5' },
                            React.createElement('input', { type: 'number', className: 'form-control', name: 'rtplast', 'data-model': 'nat', value: params.nat ? params.nat.rtplast : '', onChange: this._onChange })
                        )
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-registrar-opts' },
                frases.SETTINGS.REGISTRAR.REGISTRAR,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-registrar-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'minexpires', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.REGISTRAR.MIN_EXPIRES
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'minexpires', 'data-model': 'registrar', value: params.registrar ? params.registrar.minexpires : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'maxexpires', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.REGISTRAR.MAX_EXPIRES
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'maxexpires', 'data-model': 'registrar', value: params.registrar ? params.registrar.maxexpires : '', onChange: this._onChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-net-opts' },
                frases.SETTINGS.NET.NET,
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-net-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'tcptimeout', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NET.TCP_TIMEOUT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'tcptimeout', 'data-model': 'net', value: params.net ? params.net.tcptimeout : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'rtptimeout', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NET.RTP_TIMEOUT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'rtptimeout', 'data-model': 'net', value: params.net ? params.net.rtptimeout : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'iptos', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.NET.IP_TOS
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'iptos', 'data-model': 'net', value: params.net ? params.net.iptos : '', onChange: this._onChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-system-opts' },
                frases.SETTINGS.SYSTEM.SYSTEM,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-system-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'config-name', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.SYSTEM.CONFIG_FILE_NAME
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'config', 'data-model': 'system', value: params.system ? params.system.config : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'backup-path', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.SYSTEM.BACKUP_FILE
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'backup', 'data-model': 'system', value: params.system ? params.system.backup : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'rec-path', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.SYSTEM.CALL_RECORDS_PATH
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'store', 'data-model': 'system', value: params.system ? params.system.store : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'rec-format', className: 'col-sm-4 control-label' },
                        frases.SETTINGS.SYSTEM.CALL_RECORDS_FORMAT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { className: 'form-control', name: 'recformat', 'data-model': 'system', value: params.system ? params.system.recformat : '', onChange: this._onChange },
                            React.createElement(
                                'option',
                                { value: 'PCM 8 Khz 16 bit' },
                                'PCM 8 Khz 16 bit'
                            ),
                            React.createElement(
                                'option',
                                { value: 'CCITT U-law' },
                                'CCITT U-law'
                            ),
                            React.createElement(
                                'option',
                                { value: 'CCITT A-law' },
                                'CCITT A-law'
                            ),
                            React.createElement(
                                'option',
                                { value: 'GSM 6.10' },
                                'GSM 6.10'
                            ),
                            React.createElement(
                                'option',
                                { value: 'Microsoft GSM' },
                                'Microsoft GSM'
                            )
                        )
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-smtp-opts' },
                frases.SETTINGS.SMTP,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-smtp-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smtp-host', className: 'col-sm-4 control-label' },
                        frases.HOSTNAME
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'host', 'data-model': 'smtp', value: params.smtp ? params.smtp.host : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smtp-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'port', 'data-model': 'smtp', value: params.smtp ? params.smtp.port : '', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smtp-username', className: 'col-sm-4 control-label' },
                        frases.USERNAME
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'username', 'data-model': 'smtp', value: params.smtp ? params.smtp.username : '', autoComplete: 'off', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smtp-password', className: 'col-sm-4 control-label' },
                        frases.PASSWORD
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'password', className: 'form-control', name: 'password', 'data-model': 'smtp', value: params.smtp ? params.smtp.password : '', autoComplete: 'off', onChange: this._onChange })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smtp-from', className: 'col-sm-4 control-label' },
                        frases.FROM3
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'text', className: 'form-control', name: 'from', 'data-model': 'smtp', value: params.smtp ? params.smtp.from : '', onChange: this._onChange })
                    )
                )
            ),
            React.createElement(
                'h5',
                { className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-smdr-opts' },
                frases.SETTINGS.SMDR,
                ' ',
                React.createElement('span', { className: 'caret pull-right' })
            ),
            React.createElement(
                'div',
                { className: 'acc-pane collapse', id: 'acc-smdr-opts' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-4 col-sm-offset-4' },
                        React.createElement(
                            'div',
                            { className: 'checkbox' },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: 'enabled', 'data-model': 'smdr', checked: params.smdr ? params.smdr.enabled : '', onChange: this._onChange }),
                                ' ',
                                frases.ENABLE
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'smdr-host', className: 'col-sm-4 control-label' },
                        frases.HOSTNAME
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement(
                            'select',
                            { className: 'form-control', name: 'host', 'data-model': 'smdr', value: params.smdr ? params.smdr.host : '', onChange: this._onChange },
                            (params.system ? params.system.interfaces : []).map(function (item) {
                                return React.createElement(
                                    'option',
                                    { key: item, value: item },
                                    item
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
                        { htmlFor: 'smdr-port', className: 'col-sm-4 control-label' },
                        frases.PORT
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-4' },
                        React.createElement('input', { type: 'number', className: 'form-control', name: 'port', 'data-model': 'smdr', value: params.smdr ? params.smdr.port : '', onChange: this._onChange })
                    )
                )
            )
        );
    }
});

BranchOptionsComponent = React.createFactory(BranchOptionsComponent);
var FunctionsOptionsComponent = React.createClass({
	displayName: 'FunctionsOptionsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	_onChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
		var update = {};

		update[target.name] = value !== null ? value : "";;

		this.props.onChange(update);
	},

	_onFileUpload: function (params) {
		var update = {};
		var files = [];

		files.push(params);
		update.files = files;
		update[params.name] = params.filename;

		console.log('_onFileUpload: ', files, params);

		this.props.onChange(update);
	},

	// _onFileUpload: function(e) {
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;
	// 	var update = {
	// 		files: this.props.files || []
	// 	};

	// 	update[target.name] = value !== null ? value : "";;
	// 	update.files.push(file);

	// 	console.log('_onFileUpload: ', target, value, update, file);

	// 	this.props.onChange(update);
	// },

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;

		return React.createElement(
			'form',
			{ className: 'form-horizontal acc-cont' },
			React.createElement(
				'h5',
				{ className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-callhold-opts' },
				frases.FUNCTIONS.CALLHOLD,
				React.createElement('span', { className: 'caret pull-right' })
			),
			React.createElement(
				'div',
				{ className: 'acc-pane collapse', id: 'acc-callhold-opts' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'holdmusicfile', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__WAV_ONHOLD },
						frases.MUSICONHOLD,
						':'
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(FileUpload, { frases: frases, name: 'holdmusicfile', value: params.holdmusicfile, onChange: this._onFileUpload })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'holdremindtime', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__HOLD_REMIND_INT },
						frases.SETTINGS.REMINTERVAL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', className: 'form-control', value: params.holdremindtime, name: 'holdremindtime', onChange: this._onChange }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								frases.SECONDS
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'holdrecalltime', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__HOLD_RECALL_INT },
						frases.SETTINGS.RETINTERVAL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', className: 'form-control', value: params.holdrecalltime, name: 'holdrecalltime', onChange: this._onChange }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								frases.SECONDS
							)
						)
					)
				)
			),
			React.createElement(
				'h5',
				{ className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-calltransfer-opts' },
				frases.FUNCTIONS.CALLTRANSFER,
				React.createElement('span', { className: 'caret pull-right' })
			),
			React.createElement(
				'div',
				{ className: 'acc-pane collapse', id: 'acc-calltransfer-opts' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'transferrecalltime', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__TRANSF_WAIT_INT },
						frases.SETTINGS.WAITINTERVAL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', className: 'form-control', value: params.transferrecalltime, name: 'transferrecalltime', onChange: this._onChange }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								frases.SECONDS
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'transferrecallnumber', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__TRANSF_RECALL_NUM },
						frases.SETTINGS.RETNUMBER
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'text', className: 'form-control', value: params.transferrecallnumber, name: 'transferrecallnumber', onChange: this._onChange })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'div',
						{ className: 'col-sm-4 col-sm-offset-4' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								{ 'data-toggle': 'tooltip', title: frases.OPTS__AUTO_RETRIEVE },
								React.createElement('input', { type: 'checkbox', checked: params.autoretrive, name: 'autoretrive', onChange: this._onChange }),
								' ',
								frases.SETTINGS.AUTORETURN
							)
						)
					)
				)
			),
			React.createElement(
				'h5',
				{ className: 'text-mute acc-header', 'data-toggle': 'collapse', 'data-target': '#acc-callpark-opts' },
				frases.FUNCTIONS.CALLPARK,
				React.createElement('span', { className: 'caret pull-right' })
			),
			React.createElement(
				'div',
				{ className: 'acc-pane collapse', id: 'acc-callpark-opts' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'parkrecalltime', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__PARK_RECALL_INT },
						frases.SETTINGS.RETINTERVAL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', className: 'form-control', value: params.parkrecalltime, name: 'parkrecalltime', onChange: this._onChange }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								frases.SECONDS
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'parkrecallnumber', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__PARK_RECALL_NUM },
						frases.SETTINGS.RETNUMBER
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'text', className: 'form-control', value: params.parkrecallnumber, name: 'parkrecallnumber', onChange: this._onChange })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'parkdroptimeout', className: 'col-sm-4 col-xs-12 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__PARK_DISC_TOUT },
						frases.SETTINGS.ENDTOUT
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'number', className: 'form-control', value: params.parkdroptimeout, name: 'parkdroptimeout', onChange: this._onChange }),
							React.createElement(
								'span',
								{ className: 'input-group-addon' },
								frases.SECONDS
							)
						)
					)
				)
			)
		);
	}
});

FunctionsOptionsComponent = React.createFactory(FunctionsOptionsComponent);
var GeneralOptionsComponent = React.createClass({
	displayName: 'GeneralOptionsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		singleBranch: React.PropTypes.bool,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params
		});
	},

	_onChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;
		var update = this.state.params;

		update[target.name] = value !== null ? value : "";;

		this.setState({
			params: update
		});

		this.props.onChange(update);
	},

	_numPoolEl: function (el) {
		var numpool = this._arrayToNumPool(this.state.params.extensions || []);
		el.value = numpool;
		this.props.setPoolEl(el);
	},

	_onPoolKeyDown: function (e) {
		var target = e.target;
		var value = target.value;

		if (!this._validateNumPool(e)) e.preventDefault();
	},

	_validateNumPool: function (e) {
		// Allow: backspace, tab, delete, escape, enter
		if ([46, 9, 8, 27, 13].indexOf(e.keyCode) !== -1 ||
		// Allow: Ctrl+A
		e.keyCode == 65 && e.ctrlKey === true ||
		// Allow: home, end, left, right, down, up
		e.keyCode >= 35 && e.keyCode <= 40 ||
		// Allow: comma and dash 
		e.keyCode == 188 && e.shiftKey === false || e.keyCode == 189 && e.shiftKey === false) {
			// let it happen, don't do anything
			return true;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
			return false;
		}

		return true;
	},

	_arrayToNumPool: function (array) {
		if (!array) return '';
		var str = '';
		array.forEach(function (obj, indx, array) {
			if (indx > 0) str += ',';
			str += obj.firstnumber;
			if (obj.poolsize > 1) str += '-' + (obj.firstnumber + obj.poolsize - 1);
		});
		return str;
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'interfacelang', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__LANGUAGE },
					frases.LANGUAGE
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'select',
						{ name: 'lang', className: 'form-control', value: params.lang, onChange: this._onChange },
						React.createElement(
							'option',
							{ value: 'en' },
							'English'
						),
						React.createElement(
							'option',
							{ value: 'uk' },
							'\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430'
						),
						React.createElement(
							'option',
							{ value: 'ru' },
							'\u0420\u0443\u0441\u0441\u043A\u0438\u0439'
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'branch_timezone', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__TIMEZONE },
					frases.SETTINGS.TIMEZONE
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(TimeZonesComponent, { timezone: this.state.params.timezone, onChange: this._onChange })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'numpool', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__POOL_TOOLTIP },
					frases.NUMBERING_POOL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', className: 'form-control', 'data-validate-pool': 'true', ref: this._numPoolEl, onKeyDown: this._onPoolKeyDown, name: 'extensions', autoComplete: 'off' })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'email', className: 'col-sm-4 control-label' },
					frases.SETTINGS.ADMIN_EMAIL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'email', className: 'form-control', name: 'email', value: params.email, onChange: this._onChange, placeholder: frases.SETTINGS.ADMIN_EMAIL, autoComplete: 'off' })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'adminname', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__LOGIN },
					frases.LOGIN
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', className: 'form-control', name: 'adminname', value: params.adminname, placeholder: frases.LOGIN, readOnly: !this.props.singleBranch, autoComplete: 'off', onChange: this._onChange })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'div',
					{ className: 'col-sm-4 col-sm-offset-4' },
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-default btn-block', role: 'button', 'data-toggle': 'collapse', 'data-target': '#change-pass-cont', 'aria-expanded': 'false', 'aria-controls': 'change-pass-cont' },
						frases.SETTINGS.CHANGE_PASSWORD
					)
				)
			),
			React.createElement(
				'div',
				{ id: 'change-pass-cont', className: 'collapse' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'adminpass', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__PWD },
						frases.PASSWORD
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'password', className: 'form-control', name: 'adminpass', value: params.adminpass, placeholder: frases.PASSWORD, autoComplete: 'off', onChange: this._onChange })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'confirmpass', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__CONFIRM_PWD },
						frases.CONFIRM,
						' ',
						frases.PASSWORD
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'password', className: 'form-control', name: 'confirmpass', value: params.confirmpass, placeholder: frases.SETTINGS.CONFIRM_PASSWORD, autoComplete: 'off', onChange: this._onChange })
					)
				)
			)
		);
	}

});

GeneralOptionsComponent = React.createFactory(GeneralOptionsComponent);

var OptionsComponent = React.createClass({
	displayName: 'OptionsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		branchParams: React.PropTypes.object,
		saveOptions: React.PropTypes.func,
		saveBranchOptions: React.PropTypes.func,
		singleBranch: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			params: {},
			options: {},
			branchParams: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			// params: this.props.params,
			branchParams: this.props.branchParams,
			options: this.props.params.options
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			// params: props.params,
			branchParams: props.branchParams,
			options: props.params.options
		});
	},

	_saveOptions: function () {
		var params = this.state.params || {};
		var branchParams = this.state.branchParams;
		var options = this.state.options;

		console.log('_saveOptions: ', params);

		if (params.adminpass && params.adminpass !== params.confirmpass) {
			return alert(this.props.frases.OPTS__PWD_UNMATCH);
		} else {
			delete params.confirmpass;
		}

		params.extensions = this._poolToArray(this.poolEl.value);

		if (options) params.options = options;

		this.props.saveOptions(params, function () {
			delete this.state.params.adminpass;
			delete this.state.params.confirmpass;
			this.setState({ params: params });
		}.bind(this));

		if (this.props.singleBranch) {
			this.props.saveBranchOptions(branchParams);
		}
	},

	_handleOnChange: function (params) {
		var keys = Object.keys(params);

		if (!keys || !keys.length) return;

		// var state = this.state.params;
		// var newState = this.state.newParams || {};

		// keys.forEach(function(key) {
		// state[key] = params[key];
		// newState[key] = params[key];
		// });

		// this.setState(state);

		this.setState({
			params: params
		});
	},

	_handleOnFuncOptionsChange: function (params) {
		var keys = Object.keys(params);
		if (!keys || !keys.length) return;
		var state = this.state.options;
		// var newState = this.state.newOptions || {};

		params.files = params.files.reduce(function (array, item) {
			array.push(item.file);return array;
		}, []);

		keys.forEach(function (key) {
			state[key] = params[key];
			// newState[key] = params[key];
		});
		// newState[keys[0]] = params[keys[0]];

		this.setState(state);
	},

	_handleOnBranchOptionsChange: function (params) {
		this.setState({ branchParams: params });
	},

	_poolToArray: function (string) {

		var extensions = [];
		var firstnumber;
		var lastnumber;
		var poolsize;

		string.split(',').map(function (str) {
			return str.split('-');
		}).forEach(function (array) {
			firstnumber = parseInt(array[0]);
			lastnumber = array[1] ? parseInt(array[1]) : 0;

			if (lastnumber > firstnumber) {
				poolsize = lastnumber ? lastnumber - firstnumber : 0;
			} else if (!lastnumber) {
				poolsize = 0;
			} else {
				poolsize = firstnumber - lastnumber;
				firstnumber = lastnumber;
			}

			extensions.push({
				firstnumber: firstnumber,
				poolsize: poolsize + 1
			});
		});
		return extensions;
	},

	_panelHead: function () {
		return React.createElement(
			'button',
			{ type: 'button', className: 'btn btn-success btn-md', onClick: this._saveOptions },
			React.createElement('i', { className: 'fa fa-check fa-fw' }),
			' ',
			this.props.frases.SAVE
		);
	},

	_setPoolEl: function (el) {
		this.poolEl = el;
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var panelHead = this._panelHead();

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				React.createElement(
					PanelComponent,
					{ header: panelHead },
					React.createElement(
						'ul',
						{ className: 'nav nav-tabs', role: 'tablist' },
						React.createElement(
							'li',
							{ role: 'presentation', className: 'active' },
							React.createElement(
								'a',
								{ href: '#tab-general-options', 'aria-controls': 'general', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.GENERAL_SETTS
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-security-options', 'aria-controls': 'queue', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.SECURITY.SECURITY_SETTS
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-functions-options', 'aria-controls': 'queue', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.FUNCSETTINGS
							)
						),
						this.props.singleBranch && React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-branch-options', 'aria-controls': 'queue', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.BRANCH_SETTS
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'tab-content', style: { padding: "20px 0" } },
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-general-options' },
							React.createElement(GeneralOptionsComponent, { frases: this.props.frases, singleBranch: this.props.singleBranch, params: params, onChange: this._handleOnChange, setPoolEl: this._setPoolEl })
						),
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-security-options' },
							React.createElement(SecurityOptionsComponent, { frases: this.props.frases, params: params, onChange: this._handleOnChange })
						),
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-functions-options' },
							React.createElement(FunctionsOptionsComponent, { frases: this.props.frases, params: this.state.options, onChange: this._handleOnFuncOptionsChange })
						),
						this.props.singleBranch && React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-branch-options' },
							React.createElement(BranchOptionsComponent, { frases: this.props.frases, params: this.state.branchParams, onChange: this._handleOnBranchOptionsChange })
						)
					)
				)
			)
		);
	}
});

OptionsComponent = React.createFactory(OptionsComponent);
var TimeZonesComponent = React.createClass({
	displayName: "TimeZonesComponent",


	propTypes: {
		timezone: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		return this.props.timezone !== nextProps.timezone;
	},

	render: function () {
		var tzones = moment.tz.names() || [];

		return React.createElement(
			"select",
			{ name: "timezone", className: "form-control", value: this.props.timezone, onChange: this.props.onChange },
			tzones.map(function (item) {
				return React.createElement(
					"option",
					{ key: item, value: item },
					item
				);
			})
		);
	}
});

TimeZonesComponent = React.createFactory(TimeZonesComponent);

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
var StorageUsageComponent = React.createClass({
	displayName: 'StorageUsageComponent',


	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		utils: React.PropTypes.object,
		updateLicenses: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			data: null
		};
	},

	componentWillMount: function () {
		getPbxOptions(function (result) {
			this.setState({ data: result });
		}.bind(this));
	},

	componentWillReceiveProps: function () {
		this.setState({ data: null });

		getPbxOptions(function (result) {
			this.setState({ data: result });
		}.bind(this));
	},

	render: function () {
		var frases = this.props.frases;
		var data = this.state.data;
		var plan = this.props.subscription.plan;
		var isTrial = plan.planId === 'trial' || plan.numId === 0;
		var storesize;
		var storelimit;

		if (data) {
			storesize = this.props.utils.convertBytes(this.state.data.storesize, 'Byte', 'GB');
			storelimit = this.props.utils.convertBytes(this.state.data.storelimit, 'Byte', 'GB');
		}

		return React.createElement(
			'div',
			null,
			this.state.data ? React.createElement(
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
				),
				!isTrial && React.createElement(
					'div',
					{ className: 'text-center col-xs-12' },
					React.createElement('hr', null),
					React.createElement(
						'a',
						{
							href: '#',
							className: 'text-uppercase',
							style: { fontSize: "14px" },
							role: 'button',
							'data-toggle': 'collapse',
							href: '#licensesCollapse',
							'aria-expanded': 'false',
							'aria-controls': 'licensesCollapse'
						},
						'Add/Remove Licenses'
					),
					React.createElement('br', null),
					React.createElement(
						'div',
						{ className: 'collapse', id: 'licensesCollapse' },
						React.createElement(AddLicensesComponent, {
							frases: frases,
							subscription: this.props.subscription,
							minUsers: data.users,
							minStorage: data.storesize,
							addLicenses: this.props.updateLicenses
						})
					)
				)
			) : React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(Spinner, null)
			)
		);
	}
});

StorageUsageComponent = React.createFactory(StorageUsageComponent);
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
var UsersGroupComponent = React.createClass({
	displayName: 'UsersGroupComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		onImportUsers: React.PropTypes.func,
		getExtension: React.PropTypes.func,
		activeServices: React.PropTypes.array,
		deleteMember: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		initSteps: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			files: [],
			filteredMembers: []
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {},
			// options: this.props.params.options,
			removeObject: this.props.removeObject,
			filteredMembers: this.props.params.members
		});
	},

	componentDidMount: function () {
		if (!this.props.params.name) this.props.initSteps(); // start tour if the group is new
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			// options: this.props.params.options,
			removeObject: props.removeObject,
			filteredMembers: props.params.members
		});
	},

	_setObject: function () {
		var params = this.state.params;
		// params.options = this.state.options;
		// params.files = this.state.files.reduce(function(array, item) { array.push(item.file); return array; }, []);
		// params.route = this.state.route;
		this.props.setObject(params);
	},

	_onNameChange: function (value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onFeatureChange: function (params) {
		var state = this.state;
		state.params.profile = params;

		this.setState({
			state: state
		});
	},

	_onTransformsChange: function (params) {
		var state = this.state;
		var profile = state.params.profile;

		profile.transforms = params;

		console.log('_onTransformsChange: ', profile.transforms);

		this.setState({
			state: state
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];

		console.log('remder: ', params.name);

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases
				// enabled={params.enabled || false}
				, onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.state.removeObject,
				addSteps: this.props.addSteps
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GroupMembersComponent, {
						frases: frases,
						onSort: this._onSortMember,
						members: members,
						getExtension: this.props.getExtension,
						onAddMembers: this.props.onAddMembers,
						onImportUsers: this.props.onImportUsers,
						activeServices: this.props.activeServices,
						deleteMember: this.props.deleteMember,
						addSteps: this.props.addSteps
					})
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS },
						React.createElement(
							'ul',
							{ className: 'nav nav-tabs', role: 'tablist' },
							React.createElement(
								'li',
								{ role: 'presentation', className: 'active' },
								React.createElement(
									'a',
									{ href: '#tab-group-features', 'aria-controls': 'features', role: 'tab', 'data-toggle': 'tab' },
									frases.USERS_GROUP.EXT_FEATURES_SETTS
								)
							),
							React.createElement(
								'li',
								{ role: 'presentation' },
								React.createElement(
									'a',
									{ href: '#tab-group-outrules', 'aria-controls': 'outrules', role: 'tab', 'data-toggle': 'tab' },
									frases.USERS_GROUP.OUTCALLS_SETTS
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'tab-content', style: { padding: "20px 0" } },
							React.createElement(
								'div',
								{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-group-features' },
								React.createElement(GroupFeaturesComponent, { frases: frases, groupKind: params.kind, params: params.profile, onChange: this._onFeatureChange })
							),
							React.createElement(
								'div',
								{ role: 'tabpanel', className: 'tab-pane fade', id: 'tab-group-outrules' },
								React.createElement(NumberTransformsComponent, { frases: frases, type: 'outboundb', transforms: params.profile.bnumbertransforms, onChange: this._onTransformsChange })
							)
						)
					)
				)
			)
		);
	}
});

UsersGroupComponent = React.createFactory(UsersGroupComponent);
var NewUsersModalComponent = React.createClass({
	displayName: 'NewUsersModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupid: React.PropTypes.string,
		generatePassword: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			userParams: {},
			validationError: false,
			init: false
		};
	},

	componentWillMount: function () {
		var params = this.props.groupid ? { groupid: this.props.groupid } : null;
	},

	_getBody: function () {
		console.log('_getBody');
		var frases = this.props.frases;
		return React.createElement(NewUsersComponent, {
			frases: frases,
			params: this.props.params,
			validationError: this.state.validationError,
			validateEmail: this._validateEmail,
			onChange: this._onChange,
			generatePassword: this.props.generatePassword,
			groupid: this.props.groupid,
			convertBytes: this.props.convertBytes
		});
	},

	_onChange: function (params) {
		this.setState({
			userParams: params
		});
	},

	_saveChanges: function () {
		var userParams = this.state.userParams;
		var errors = {};

		if (!userParams.name || !userParams.login || !userParams.info.email || !this._validateEmail(userParams.info.email)) {
			this.setState({
				validationError: true
			});

			return;
		}

		this.setState({
			validationError: false
		});

		this.props.onSubmit(this.state.userParams);
	},

	_validateEmail: function (string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(string);
	},

	render: function () {
		var frases = this.props.frases;
		console.log('NewUsersModalComponent');

		return React.createElement(ModalComponent, {
			size: 'sm',
			title: frases.USERS_GROUP.NEW_USER_MODAL_TITLE,
			type: 'success',
			submitText: frases.ADD,
			cancelText: frases.CLOSE,
			submit: this._saveChanges,
			body: this._getBody()
		});
	}

});

NewUsersModalComponent = React.createFactory(NewUsersModalComponent);
var NewUsersComponent = React.createClass({
	displayName: 'NewUsersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupid: React.PropTypes.string,
		validationError: React.PropTypes.bool,
		generatePassword: React.PropTypes.func,
		validateEmail: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			userParams: {},
			focused: false,
			validationError: false,
			passwordRevealed: false
		};
	},

	componentWillMount: function () {
		this.setState({
			userParams: {
				info: {},
				storelimit: this.props.params.storelimit || this.props.convertBytes(1, 'GB', 'Byte'),
				password: this.props.generatePassword()
			}
		});
	},

	componentWillReceiveProps: function (props) {
		if (props.validationError !== undefined) {
			this.setState({
				validationError: props.validationError
			});
		}
	},

	_revealPassword: function () {
		this.setState({
			passwordRevealed: !this.state.passwordRevealed
		});
	},

	_generatePassword: function () {
		this.state.userParams.password = this.props.generatePassword();
		this.setState({
			userParams: this.state.userParams
		});
	},

	_onExtChange: function (params) {
		console.log('_onExtChange: ', params);
		this.state.userParams.number = params.ext;
		this.setState({
			userParams: this.state.userParams
		});
	},

	_onChange: function (e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var userParams = this.state.userParams;
		var tname = target.name;

		console.log('_onChange: ', tname, value, this.state.focused);

		if (tname === 'email') {
			userParams.info = userParams.info || {};
			userParams.info.email = value;
		} else {
			userParams[target.name] = type === 'number' ? parseFloat(value) : value;
		}

		if (tname === 'name') userParams.display = value;
		if (tname === 'storelimit') userParams.storelimit = this.props.convertBytes(value, 'GB', 'Byte');

		this.setState({
			userParams: userParams
		});

		this.props.onChange(userParams);
	},

	_onFocus: function (e) {
		var userParams = this.state.userParams;
		var email = userParams.info.email;
		if (email) userParams.login = email.substr(0, email.indexOf('@'));

		console.log('_onFocus: ', email, email.substr(0, email.indexOf('@')));

		this.setState({
			userParams: userParams
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var userParams = this.state.userParams;
		var validationError = this.state.validationError;

		console.log('NewUsersComponent: ', params);

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'form',
				{ className: 'col-xs-12', name: 'new-user-form', autoComplete: 'nope' },
				React.createElement(
					'div',
					{ className: "form-group " + (validationError && !userParams.name ? 'has-error' : '') },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.NAME
					),
					React.createElement('input', { type: 'text', className: 'form-control', name: 'name', value: userParams.name, onChange: this._onChange, placeholder: frases.USERS_GROUP.PLACEHOLDERS.NAME, autoComplete: 'none', required: true })
				),
				params.kind === 'users' && React.createElement(
					'div',
					{ className: "form-group " + (validationError && (!userParams.info.email || !this.props.validateEmail(userParams.info.email)) ? 'has-error' : '') },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.EMAIL
					),
					React.createElement('input', { type: 'email', className: 'form-control', name: 'email', value: userParams.info.email, onChange: this._onChange, placeholder: frases.USERS_GROUP.PLACEHOLDERS.EMAIL, autoComplete: 'none', required: true })
				),
				React.createElement('input', { autoComplete: 'none', name: 'hidden', type: 'hidden', value: 'stopautofill', style: { display: "none" } }),
				React.createElement(
					'div',
					{ className: "form-group " + (validationError && !userParams.login ? 'has-error' : '') },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.LOGIN
					),
					React.createElement('input', { type: 'text', className: 'form-control', name: 'login', value: userParams.login, placeholder: frases.USERS_GROUP.PLACEHOLDERS.LOGIN, onFocus: this._onFocus, onChange: this._onChange, required: true, autoComplete: 'none' })
				),
				React.createElement('input', { autoComplete: 'none', name: 'hidden', type: 'hidden', value: 'stopautofill', style: { display: "none" } }),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.PASSWORD
					),
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement('input', { type: this.state.passwordRevealed ? 'text' : 'password', name: 'password', value: userParams.password, className: 'form-control', placeholder: frases.USERS_GROUP.PLACEHOLDERS.PASSWORD, onChange: this._onChange, required: true, autoComplete: 'none' }),
						React.createElement(
							'span',
							{ className: 'input-group-btn' },
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-default', onClick: this._revealPassword },
								React.createElement('i', { className: 'fa fa-eye', 'data-toggle': 'tooltip', title: frases.USERS_GROUP.PLACEHOLDERS.REVEAL_PWD })
							),
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-default', onClick: this._generatePassword },
								React.createElement('i', { className: 'fa fa-refresh', 'data-toggle': 'tooltip', title: frases.USERS_GROUP.PLACEHOLDERS.GENERATE_PWD })
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.EXTENSION
					),
					React.createElement(ObjectRoute, { frases: frases, extOnly: true, routes: params.available, onChange: this._onExtChange })
				),
				params.kind === 'users' && React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ className: 'control-label' },
						frases.USERS_GROUP.MAXSTORAGE
					),
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement('input', { type: 'number', className: 'form-control', name: 'storelimit', value: Math.ceil(this.props.convertBytes(userParams.storelimit, 'Byte', 'GB')), min: '1', step: '1', onChange: this._onChange }),
						React.createElement(
							'span',
							{ className: 'input-group-addon' },
							'GB'
						)
					)
				),
				validationError && React.createElement(
					'div',
					{ className: 'alert alert-warning', role: 'alert' },
					'Please, fill in all required fields'
				)
			)
		);
	}

});

NewUsersComponent = React.createFactory(NewUsersComponent);

var TrunkIncRoutes = React.createClass({
	displayName: 'TrunkIncRoutes',


	propTypes: {
		routes: React.PropTypes.array,
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			routes: [],
			routeId: "",
			options: []
		};
	},

	componentWillMount: function () {
		var routes = this.props.routes;

		this._getOptions(function (result) {

			if (routes) {
				routes = options.filter(function (item) {
					return item.ext === params.route.prefix;
				})[0];
			}

			this.setState({ options: result });
		});
	},

	// componentWillUnmount: function() {
	// 	this.props.clearCurrObjRoute();
	// },

	_getOptions: function (callback) {
		if (PbxObject.extensions.length) {
			callback(PbxObject.extensions);
		} else {
			getExtensions(function (result) {
				callback(result);
			});
		}
	},

	_getAvailablePool: function (cb) {
		json_rpc_async('getObject', { oid: 'user' }, function (result) {
			console.log('getAvailablePool: ', result);
			cb(result.available.sort());
		});
	},

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
		console.log('TrunkIncRoutes value: ', this.state.route);
		return this.state.options ? React.createElement(Select3, { value: this.state.route, options: this.state.options, onChange: this._onChange }) : React.createElement('h4', { className: 'fa fa-fw fa-spinner fa-spin' });
	}
});

TrunkIncRoutes = React.createFactory(TrunkIncRoutes);
function DidRestrictionsComponent(props) {

	return React.createElement(
		"div",
		{ className: "alert alert-warning", role: "alert" },
		React.createElement(
			"p",
			null,
			props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG1,
			":"
		),
		React.createElement(
			"ol",
			null,
			props.list.map(function (item, index) {
				return React.createElement(
					"li",
					{ key: index },
					props.frases.CHAT_TRUNK.DID.RESTRICTIONS[item]
				);
			})
		),
		React.createElement(
			"p",
			null,
			props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG2
		),
		React.createElement(
			"p",
			null,
			props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG3
		),
		React.createElement(
			"p",
			null,
			props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG4
		)
	);
}

DidRestrictionsComponent = React.createFactory(DidRestrictionsComponent);
var DidTrunkComponent = React.createClass({
	displayName: 'DidTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		buyDidNumber: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			init: false,
			fetch: true,
			sub: null,
			isTrial: null,
			cycleDays: 0,
			proratedDays: 0,
			totalAmount: 0,
			chargeAmount: 0,
			numbers: null,
			countries: [],
			locations: null,
			didTypes: ['Local'],
			selectedCountry: {},
			selectedLocation: {},
			selectedPriceObject: {},
			selectedType: 'Local',
			selectedNumber: {},
			limitReached: false,
			showNewDidSettings: false,
			fetchingCountries: false
		};
	},

	componentWillMount: function () {
		BillingApi.getSubscription(function (err, response) {
			console.log('getSubscription response: ', err, response.result);
			if (err) return notify_about('error', err.message);

			var sub = response.result;
			var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
			var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

			this.setState({
				init: true,
				isTrial: sub.plan.planId === 'trial' || sub.plan.numId === 0,
				sub: response.result,
				cycleDays: cycleDays,
				proratedDays: proratedDays
			});

			if (this.props.properties && this.props.properties.number) {
				this.setState({ fetch: false });

				this._getDid(this.props.properties.number, function (err, response) {
					if (err) return notify_about('error', err);
					this.setState({
						selectedNumber: response.result
					});
				}.bind(this));
			}
		}.bind(this));
	},

	componentWillReceiveProps: function (props) {

		console.log('DidTrunkComponent componentWillReceiveProps', props);

		if (this.state.fetch && props.properties && props.properties.number) {
			this.setState({ fetch: false });

			this._getDid(props.properties.number, function (err, response) {
				if (err) return notify_about('error', err);
				this.setState({ selectedNumber: response.result });
			}.bind(this));
		}
	},

	_onChange: function () {
		var params = {
			poid: this.state.selectedPriceObject ? this.state.selectedPriceObject._id : null,
			dgid: this.state.selectedLocation ? this.state.selectedLocation._id : null,
			totalAmount: this.state.totalAmount,
			chargeAmount: this.state.chargeAmount,
			newSubAmount: this.state.newSubAmount,
			currency: this._currencyNameToSymbol(this.state.sub.plan.currency)
		};

		this.props.onChange(params);
	},

	_currencyNameToSymbol: function (name) {
		var symbol = "";

		switch (name.toLowerCase()) {
			case "eur":
				symbol = "€";
				break;
			case "usd":
				symbol = "$";
				break;
			default:
				symbol = "€";
				break;
		}

		return symbol;
	},

	// _setSelectedNumber: function(number) {
	// 	// var data = this.state.data;
	// 	var selectedNumber = this.state.numbers.filter(function(item) { return item.number === number })[0];
	// 	// data.number = data.id = number;

	// 	// this.setState({ data: data, selectedNumber: selectedNumber });
	// 	this.setState({ selectedNumber: selectedNumber });
	// 	// this.props.onChange(data);
	// },

	_onCountrySelect: function (e) {
		var value = e.target.value;
		var state = this.state;
		var country = this.state.countries.filter(function (item) {
			return item.id === value;
		})[0] || {};

		state.selectedCountry = country;
		state.selectedLocation = {};
		state.locations = null;

		this.setState(state);

		if (!value) return;

		this._getDidLocations({ country: country.id, type: state.selectedType }, function (err, response) {
			if (err) return notify_about('error', err);
			this.setState({ locations: response.result || [] });
		}.bind(this));
	},

	_onLocationSelect: function (e) {
		var value = e.target.value;
		var state = this.state;

		var selectedLocation = {};
		var selectedPriceObject = {};

		if (value) {
			selectedLocation = state.locations.filter(function (item) {
				return item._id === value;
			})[0];
		}

		state.selectedLocation = selectedLocation;
		state.selectedPriceObject = selectedPriceObject;

		this.setState(state);

		BillingApi.getDidPrice({ iso: state.selectedCountry.attributes.iso, areaCode: state.selectedLocation.areaCode }, function (err, response) {
			if (err) return notify_about('error', err);
			this._setDidPrice(response.result);
		}.bind(this));
	},

	_setDidPrice: function (priceObj) {
		var sub = this.state.sub;
		var amount = this.state.isTrial ? 0 : this._getDidAmount(sub.plan.billingPeriodUnit, priceObj);
		var proratedAmount = (amount * (this.state.proratedDays / this.state.cycleDays)).toFixed(2);

		this.setState({
			selectedPriceObject: priceObj,
			totalAmount: amount,
			chargeAmount: proratedAmount,
			newSubAmount: parseFloat(sub.amount) + amount
		});

		this._onChange();
	},

	// _getAssignedDids: function(callback) {
	// 	BillingApi.('getAssignedDids', null, callback);
	// },

	_getDid: function (number, callback) {
		BillingApi.getDid({ number: number }, callback);
	},

	_getDidCountries: function (callback) {
		BillingApi.getDidCountries(callback);
	},

	_getDidLocations: function (params, callback) {
		BillingApi.getDidLocations(params, callback);
	},

	_getDidAmount: function (billingPeriodUnit, priceObj) {
		var state = this.state;
		var amount = 0;
		if (!billingPeriodUnit || !priceObj) return amount;
		amount = billingPeriodUnit === 'years' ? priceObj.annualPrice : priceObj.monthlyPrice;
		return amount ? parseFloat(amount) : 0;
	},

	_showNewDidSettings: function (e) {
		e.preventDefault();
		this.setState({ showNewDidSettings: !this.state.showNewDidSettings, fetchingCountries: true });

		var sub = this.state.sub;
		var maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;

		BillingApi.hasDids(function (err, count) {
			if (err) return notify_about('error', err);

			if (count.result >= maxdids) {
				this.setState({ limitReached: true, countries: [], fetchingCountries: false });
				return;
			}

			if (!this.state.countries.length) {
				this._getDidCountries(function (err, response) {
					if (err) return notify_about('error', err);
					this.setState({ countries: response.result, fetchingCountries: false });
				}.bind(this));
			}
		}.bind(this));
	},

	// function getBody() {
	// 	return (
	// 		<div className="col-sm-8 col-sm-offset-4">
	// 			<p>{frases.BILLING.CONFIRM_PAYMENT.ADD_NUMBER_NEW_AMOUNT} <strong>€{ amount }</strong>. {frases.BILLING.CONFIRM_PAYMENT.TODAY_CHARGE_MSG} <strong>€{ proratedAmount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
	// 			<p>{frases.BILLING.CONFIRM_PAYMENT.NEW_SUB_AMOUNT} <strong>€{ parseFloat(sub.amount) + amount }</strong> {frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES}.</p>
	// 			{
	// 				selectedPriceObject.restrictions && (
	// 					<DidRestrictionsComponent frases={frases} list={selectedPriceObject.restrictions.split(',')} />
	// 				) 
	// 			}
	// 			<p><button className="btn btn-primary" onClick={this._buyDidNumber}>{frases.CHAT_TRUNK.DID.BUY_NUMBER_BTN}</button></p>
	// 		</div>
	// 	)
	// },

	render: function () {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedLocation = state.selectedLocation;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;

		// if(sub && selectedPriceObject) {
		// 	amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
		// 	proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
		// 	maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		// }

		console.log('DidTrunkComponent render: ', this.state);

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			this.state.init ? React.createElement(
				'div',
				null,
				this.props.isNew ? React.createElement(
					'div',
					null,
					!this.state.showNewDidSettings ? React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'div',
							{ className: 'col-sm-4 col-sm-offset-4' },
							React.createElement(
								'button',
								{ className: 'btn btn-primary', onClick: this._showNewDidSettings },
								React.createElement('i', { className: 'fa fa-plus-circle' }),
								' ',
								frases.CHAT_TRUNK.DID.ADD_NUMBER_BTN
							)
						)
					) : React.createElement(
						'div',
						null,
						this.state.fetchingCountries ? React.createElement(Spinner, null) : React.createElement(
							'div',
							null,
							this.state.limitReached ? React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'div',
									{ className: 'col-sm-8 col-sm-offset-4' },
									React.createElement(
										'p',
										null,
										frases.CHAT_TRUNK.DID.LIMIT_REACHED.MAIN_MSG
									),
									React.createElement(
										'p',
										null,
										React.createElement(
											'a',
											{ href: '#billing' },
											frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_LINK
										),
										' ',
										frases.CHAT_TRUNK.DID.LIMIT_REACHED.CHANGE_PLAN_MSG
									)
								)
							) : React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ htmlFor: 'country', className: 'col-sm-4 control-label' },
									frases.CHAT_TRUNK.DID.SELECT_COUNTRY
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement(
										'select',
										{ className: 'form-control', name: 'country', value: selectedCountry.id || "", onChange: this._onCountrySelect },
										React.createElement(
											'option',
											{ value: '' },
											'----------'
										),
										this.state.countries.map(function (item) {
											return React.createElement(
												'option',
												{ key: item.id, value: item.id },
												item.attributes.name + " (" + item.attributes.prefix + ")"
											);
										})
									)
								)
							)
						),
						selectedCountry.id && React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ htmlFor: 'location', className: 'col-sm-4 control-label' },
									frases.CHAT_TRUNK.DID.SELECT_LOCATION
								),
								this.state.locations ? React.createElement(
									'div',
									null,
									this.state.locations.length ? React.createElement(
										'div',
										{ className: 'col-sm-4' },
										React.createElement(
											'select',
											{ className: 'form-control', name: 'location', value: selectedLocation._id, onChange: this._onLocationSelect, autoComplete: 'off', required: true },
											React.createElement(
												'option',
												{ value: '' },
												'----------'
											),
											this.state.locations.map(function (item) {
												return React.createElement(
													'option',
													{ key: item._id, value: item._id },
													item.areaName + " (" + item.areaCode + ")"
												);
											})
										)
									) : React.createElement(
										'div',
										{ className: 'col-sm-8' },
										React.createElement(
											'p',
											null,
											frases.CHAT_TRUNK.DID.CHECK_COUNTRY_AVAILABILITY_MSG
										)
									)
								) : React.createElement(Spinner, null)
							),
							selectedLocation._id && React.createElement(
								'div',
								{ className: 'form-group' },
								selectedPriceObject && selectedPriceObject._id ? React.createElement(
									'div',
									{ className: 'col-sm-8 col-sm-offset-4' },
									React.createElement(
										'p',
										null,
										frases.BILLING.CONFIRM_PAYMENT.ADD_NUMBER_NEW_AMOUNT,
										' ',
										React.createElement(
											'strong',
											null,
											this._currencyNameToSymbol(sub.plan.currency),
											amount
										),
										', ',
										frases.BILLING.CONFIRM_PAYMENT.PLUS_TAXES,
										'.'
									),
									selectedPriceObject.restrictions && React.createElement(DidRestrictionsComponent, { frases: frases, list: selectedPriceObject.restrictions.split(',') })
								) : !selectedPriceObject ? React.createElement(
									'div',
									{ className: 'col-sm-8 col-sm-offset-4' },
									React.createElement(
										'p',
										null,
										frases.CHAT_TRUNK.DID.CHECK_LOCATION_AVAILABILITY_MSG
									)
								) : React.createElement(Spinner, null)
							)
						)
					)
				) : this.state.selectedNumber && this.state.selectedNumber._id ? React.createElement(SelectedDidNumberComponent, { frases: frases, number: this.state.selectedNumber }) : React.createElement(Spinner, null)
			) : React.createElement(Spinner, null)
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);
var SelectedDidNumberComponent = React.createClass({
	displayName: 'SelectedDidNumberComponent',


	propTypes: {
		frases: React.PropTypes.object,
		number: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			number: {},
			fetchingStatus: false,
			fetchingRegistration: false
		};
	},

	componentWillMount: function () {
		var state = {
			number: this.props.number
		};

		if (this.props.number.status !== 'active') {
			BillingApi.updateDidStatus({ number: this.props.number.number }, function (err, response) {
				if (err) return notify_about('error', err);
				this._updateStatus(response.result.status);
			}.bind(this));
			state.fetchingStatus = true;
		}

		if (this.props.number.awaitingRegistration) {
			BillingApi.updateDidRegistration({ number: this.props.number.number }, function (err, response) {
				if (err) return notify_about('error', err);
				this._updateRegistration(response.result.awaitingRegistration);
			}.bind(this));
			state.fetchingRegistration = true;
		}

		this.setState(state);
	},

	_updateStatus: function (status) {
		var state = this.state;
		state.number.status = status;
		state.fetchingStatus = false;
		this.setState(state);
	},

	_updateRegistration: function (awaitingRegistration) {
		var state = this.state;
		state.number.awaitingRegistration = awaitingRegistration;
		state.fetchingRegistration = false;
		this.setState(state);
	},

	render: function () {
		var frases = this.props.frases;
		var selectedNumber = this.state.number;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.DID.LOCATION
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'p',
						{ className: 'form-control-static' },
						selectedNumber.country + ", " + selectedNumber.areaName
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.DID.NUMBER
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'p',
						{ className: 'form-control-static' },
						selectedNumber.formatted
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.DID.STATUS
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					!this.state.fetchingStatus ? React.createElement(
						'span',
						{
							className: "label label-" + (selectedNumber.status === 'active' && !selectedNumber.awaitingRegistration ? 'success' : 'warning')
						},
						selectedNumber.awaitingRegistration ? 'awaiting registration' : selectedNumber.status
					) : React.createElement(Spinner, null)
				)
			),
			selectedNumber.awaitingRegistration && React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'div',
					{ className: 'col-sm-8 col-sm-offset-4' },
					React.createElement(DidRestrictionsComponent, { frases: frases, list: selectedNumber.restrictions.split(',') })
				)
			)
		);
	}
});
var EmailTrunkComponent = React.createClass({
	displayName: "EmailTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		highlightStep: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			data: {},
			provider: "",
			stepsShown: false
		};
	},

	componentWillMount: function () {
		this.setState({
			data: this.props.properties || {}
		});
	},

	componentDidMount: function () {
		var frases = this.props.frases;

		if (this.props.isNew && this.props.addSteps) {

			this.props.addSteps([{
				element: '.email-provider',
				popover: {
					title: frases.GET_STARTED.CONNECT_EMAIL.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CONNECT_EMAIL.STEPS["1"].DESC,
					position: 'top',
					showButtons: false
				}
			}, {
				element: '.email-account-setts',
				popover: {
					title: frases.GET_STARTED.CONNECT_EMAIL.STEPS["2"].TITLE,
					description: frases.GET_STARTED.CONNECT_EMAIL.STEPS["2"].DESC,
					position: 'top'
				}
			}]);
		}
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			data: props.properties || {}
		});
	},

	_onChange: function (e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		console.log('EmailTrunkComponent onChange: ', value);

		data[target.name] = value;

		if (target.name === 'username') data.id = value;

		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_onProviderSelect: function (e) {
		var provider = e.target.value;
		var props = this.props.serviceParams.providers[provider];
		var state = this.state;

		state.provider = provider;

		if (provider && provider !== 'other') {
			state.data = this._extendProps(state.data, props);
		} else {
			state.data.hostname = "";
			state.data.port = "";
		}

		this.setState(state);

		if (!this.state.stepsShown) {
			setTimeout(function () {
				this.props.nextStep();
				this.setState({ stepsShown: true });
			}.bind(this), 200);
		}
	},

	_extendProps: function (toObj, fromObj) {
		for (var key in fromObj) {
			toObj[key] = fromObj[key];
		}

		return toObj;
	},

	render: function () {
		var data = this.state.data;
		var frases = this.props.frases;

		console.log('EmailTrunkComponent render: ', this.state.data, this.props.serviceParams);
		// <option value="pop3">POP3</option>

		return React.createElement(
			"div",
			null,
			this.props.isNew && React.createElement(
				"form",
				{ className: "form-horizontal", autoComplete: "off" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "provider", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.SELECT_ACCOUNT_PROVIDER
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement(
							"select",
							{ type: "text", className: "form-control email-provider", name: "provider", value: this.state.provider, onChange: this._onProviderSelect },
							React.createElement(
								"option",
								{ value: "" },
								frases.CHAT_TRUNK.EMAIL.NOT_SELECTED
							),
							React.createElement(
								"option",
								{ value: "gmail" },
								"Gmail"
							),
							React.createElement(
								"option",
								{ value: "outlook" },
								"Outlook"
							),
							React.createElement(
								"option",
								{ value: "office365" },
								"Office 365"
							),
							React.createElement(
								"option",
								{ value: "icloud" },
								"iCloud"
							),
							React.createElement(
								"option",
								{ value: "yahoo" },
								"Yahoo"
							),
							React.createElement(
								"option",
								{ value: "aol" },
								"AOL"
							),
							React.createElement(
								"option",
								{ value: "other" },
								frases.CHAT_TRUNK.EMAIL.OTHER_PROVIDER
							)
						)
					)
				)
			),
			React.createElement(
				"form",
				{ className: "form-horizontal email-account-setts", style: { display: this.state.provider || !this.props.isNew ? 'block' : 'none' }, autoComplete: "off" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "protocol", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.PROTOCOL
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement(
							"select",
							{ type: "text", className: "form-control", name: "protocol", value: data.protocol, onChange: this._onChange, autoComplete: "off", required: true },
							React.createElement(
								"option",
								{ value: "imap" },
								"IMAP"
							),
							React.createElement(
								"option",
								{ value: "pop3" },
								"POP3"
							)
						)
					)
				),
				this.state.provider === 'other' && React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "usermail", className: "col-sm-4 control-label" },
						frases.EMAIL
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement("input", { type: "text", className: "form-control", name: "usermail", value: data.usermail, onChange: this._onChange, autoComplete: "off", required: true })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "username", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.USERNAME
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement("input", { type: "text", className: "form-control", name: "username", value: data.username, onChange: this._onChange, autoComplete: "off", required: true })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "password", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.PASSWORD
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement("input", { type: "password", className: "form-control", name: "password", value: data.password, onChange: this._onChange, autoComplete: "off", required: true })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "hostname", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.HOSTNAME
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement("input", { type: "text", className: "form-control", name: "hostname", value: data.hostname, onChange: this._onChange, autoComplete: "off", required: true })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "port", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.EMAIL.PORT
					),
					React.createElement(
						"div",
						{ className: "col-sm-2" },
						React.createElement("input", { type: "number", className: "form-control", name: "port", value: data.port, onChange: this._onChange, autoComplete: "off", required: true })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"div",
						{ className: "col-sm-4 col-sm-offset-4" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", checked: data.usessl, name: "usessl", onChange: this._onChange }),
								" ",
								frases.CHAT_TRUNK.EMAIL.SSL
							)
						)
					)
				)
			)
		);
	}
});

EmailTrunkComponent = React.createFactory(EmailTrunkComponent);
var TelegramTrunkComponent = React.createClass({
	displayName: "TelegramTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			init: true
		};
	},

	componentWillMount: function () {
		this._initService();
	},

	componentDidMount: function () {
		var frases = this.props.frases;

		if (this.props.isNew && this.props.addSteps) {

			this.props.addSteps([{
				element: '#ctc-select-2',
				popover: {
					title: frases.GET_STARTED.CONNECT_TELEGRAM.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CONNECT_TELEGRAM.STEPS["1"].DESC,
					position: 'top'
				}
			}]);
		}
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_initService: function () {
		this.setState({
			access_token: this.props.properties.access_token || ''
		});
	},

	_onChange: function (e) {
		var value = e.target.value;
		var props = {
			access_token: value
		};

		this.setState(props);
		this.props.onChange(props);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"form",
				{ className: "form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "ctc-select-2", className: "col-sm-4 control-label" },
						"Token"
					),
					React.createElement(
						"div",
						{ className: "col-sm-6" },
						React.createElement("input", {
							id: "ctc-select-2",
							className: "form-control",
							value: this.state.access_token,
							onChange: this._onChange,
							placeholder: "e.g. 110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
						})
					)
				)
			)
		);
	}
});

TelegramTrunkComponent = React.createFactory(TelegramTrunkComponent);
var FacebookTrunkComponent = React.createClass({
	displayName: 'FacebookTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onTokenReceived: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			selectedPage: {},
			pages: null,
			userAccessToken: null,
			init: false
		};
	},

	componentWillMount: function () {
		var serviceParams = this.props.serviceParams;

		this.setState({
			userAccessToken: serviceParams.params.userAccessToken
		});
	},

	componentDidMount: function () {
		console.log('FacebookTrunkComponent props: ', this.props);
		var frases = this.props.frases;

		if (this.props.isNew && this.props.addSteps) {

			console.log('FacebookTrunkComponent componentDidMount: ', this.state.pages);

			this.props.addSteps([{
				element: '.fb-button',
				popover: {
					title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].TITLE,
					showButtons: false,
					description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].DESC,
					position: 'bottom'
				}
			}, {
				element: '#ctc-select-1',
				popover: {
					title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].TITLE,
					description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].DESC,
					position: 'top'
				}
			}]);
		}

		this._initService();
	},

	// shouldComponentUpdate: function(nextProps, nextState){
	// 	console.log('FacebookTrunkComponent shouldComponentUpdate: ', nextProps);
	//     // return a boolean value
	//     return !this.state.init && nextProps.isNew;
	// },

	_initService: function () {
		var props = this.props.properties;

		if (props && props.id) {
			this.setState({ init: true });
		} else if (this.state.userAccessToken) {
			this._getPages();

			// else if(window.FB) {
			// 	window.FB.getLoginStatus(this._updateStatusCallback);

			// } 
		} else {
			this.setState({
				init: true
			});
			// this._getFacebookSDK(function() {
			// 	window.FB.init({
			// 		appId: this.props.serviceParams.params.appId,
			// 		autoLogAppEvents: true,
			// 		// status: true,
			// 		version: 'v3.0'
			// 	});     
			// 	window.FB.getLoginStatus(this._updateStatusCallback);
			// }.bind(this));
		}
	},

	_getPages: function () {
		this._apiCall('/me/accounts', null, function (err, response) {
			this._setPages(response.data);
		}.bind(this));
	},

	_setPages: function (pages) {
		this.setState({
			pages: pages,
			init: true
		});

		this._selectPage(this.props.properties.id || (pages.length ? pages[0].id : null));

		setTimeout(function () {
			this.props.nextStep();
		}.bind(this), 500);
	},

	// _getFacebookSDK: function(cb) {
	// 	$.ajaxSetup({ cache: true });
	// 	$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	// },

	_updateStatusCallback: function (result) {
		console.log('updateStatusCallback: ', result);
		if (result.status === 'connected') {

			// get Facebook pages
			window.FB.api('/me/accounts', function (response) {
				this.setState({
					pages: response.data,
					userAccessToken: result.authResponse.accessToken,
					init: true
				});

				this._selectPage(this.props.properties.id || (response.data.length ? response.data[0].id : null));
			}.bind(this));
		} else {
			this.setState({
				init: true
			});
		}
	},

	_apiCall: function (path, data, callback) {
		request('GET', 'https://graph.facebook.com/v3.0/' + path + '?access_token=' + this.state.userAccessToken, data, null, callback);
	},

	_getSubscriptions: function () {
		var appId = this.props.serviceParams.params.appId;
		window.FB.api('/' + appId + '/subscriptions', function (response) {
			console.log('_getSubscriptions: ', response);
		}.bind(this));
	},

	_login: function () {
		var href = window.location.href;
		var search = href.indexOf('?');
		var state = search !== -1 ? btoa(href.substr(0, search)) : btoa(href);
		console.log('_login: ', href, search, state);
		var authWindow = window.open("https://www.facebook.com/dialog/oauth?client_id=1920629758202993&redirect_uri=https://main.ringotel.net/chatbot/FacebookMessenger&state=" + state, "ServiceAuth");

		var scope = this;

		authWindow.onTokenReceived = function (token) {
			console.log('authWindow onTokenReceived: ', token);
			authWindow.close();

			scope.setState({
				userAccessToken: token
			});

			scope._getPages();
			scope.props.onTokenReceived(token);
		};

		// window.location = "https://www.facebook.com/dialog/oauth?client_id=1920629758202993&redirect_uri=https://main.ringotel.net/chatbot/FacebookMessenger&state="+btoa(window.location.href);

		// window.FB.login(function(response) {
		// 	console.log('window.FB.login: ', response);
		// 	this._updateStatusCallback(response);
		// }.bind(this), {scope: 'email, manage_pages, read_page_mailboxes, pages_messaging'});
	},

	_selectPage: function (value) {
		var selectedPage = {};

		this.state.pages.forEach(function (item) {
			if (item.id === value) selectedPage = item;
		});

		// send user access token instead of page token
		selectedPage.access_token = this.state.userAccessToken;

		this.setState({ selectedPage: selectedPage });
		this.props.onChange(selectedPage);
	},

	_onChange: function (e) {
		console.log('_selectwindow.FBPage: ', e);
		var value = e.target.value;
		this._selectPage(value);
	},

	render: function () {
		var pages = this.state.pages;
		var frases = this.props.frases;
		var display = pages && pages.length && this.props.isNew ? 'block' : 'none';

		console.log('FacebookTrunkComponent render: ', this.props.properties, this.props.serviceParams, pages);

		return React.createElement(
			'div',
			null,
			!this.state.init ? React.createElement(
				'h3',
				{ className: 'text-center' },
				React.createElement('i', { className: 'fa fa-fw fa-spinner fa-spin' })
			) : this.props.properties && !this.props.isNew ? React.createElement(
				'form',
				{ className: 'form-horizontal' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'ctc-select-1', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.FACEBOOK.SELECT_PAGE
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'p',
							{ className: 'form-control-static' },
							this.props.properties.name
						)
					)
				)
			) : !pages ? React.createElement(
				'div',
				{ className: 'text-center' },
				React.createElement(
					'p',
					null,
					frases.CHAT_TRUNK.FACEBOOK.LOGIN_MSG
				),
				React.createElement(
					'button',
					{ className: 'btn btn-lg btn-primary fb-button', onClick: this._login },
					React.createElement('i', { className: 'fa fa-fw fa-facebook' }),
					' Login with Facebook'
				)
			) : !pages.length ? React.createElement(
				'div',
				{ className: 'text-center' },
				frases.CHAT_TRUNK.FACEBOOK.NO_PAGES_MSG,
				' ',
				React.createElement(
					'a',
					{ href: '#' },
					frases.CHAT_TRUNK.FACEBOOK.LEARN_MORE
				),
				' '
			) : null,
			React.createElement(
				'form',
				{ className: 'form-horizontal', style: { display: display } },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'ctc-select-1', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.FACEBOOK.SELECT_PAGE
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'select',
							{
								className: 'form-control',
								id: 'ctc-select-1',
								value: this.state.selectedPage.id,
								onChange: this._onChange
							},
							pages && pages.map(function (item) {

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
var ViberTrunkComponent = React.createClass({
	displayName: "ViberTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			init: true
		};
	},

	componentWillMount: function () {
		this._initService();
	},

	componentDidMount: function () {
		var frases = this.props.frases;
		if (this.props.isNew && this.props.addSteps) {

			this.props.addSteps([{
				element: '#ctc-select-3',
				popover: {
					title: frases.GET_STARTED.CONNECT_VIBER.STEPS["1"].TITLE,
					description: frases.GET_STARTED.CONNECT_VIBER.STEPS["1"].DESC,
					position: 'top'
				}
			}]);
		}
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_initService: function () {
		this.setState({
			access_token: this.props.properties.access_token || ''
		});
	},

	_onChange: function (e) {
		var value = e.target.value;
		var props = {
			access_token: value
		};

		console.log('Viber _onChange: ', value);

		this.setState(props);
		this.props.onChange(props);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"form",
				{ className: "form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "ctc-select-3", className: "col-sm-4 control-label" },
						"App Key"
					),
					React.createElement(
						"div",
						{ className: "col-sm-6" },
						React.createElement("input", {
							id: "ctc-select-3",
							className: "form-control",
							value: this.state.access_token,
							onChange: this._onChange,
							placeholder: "e.g. 445da6az1s345z78-dazcczb2542zv51a-e0vc5fva17480im9"
						})
					)
				)
			)
		);
	}
});

ViberTrunkComponent = React.createFactory(ViberTrunkComponent);
var TwitterTrunkComponent = React.createClass({
	displayName: 'TwitterTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object
	},

	// getInitialState: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	componentWillMount: function () {
		this.setState({
			logedIn: false
		});
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		selectedPage: props.properties || {}
	// 	});		
	// },

	_login: function () {
		console.log('Login');
	},

	render: function () {
		var frases = this.props.frases;

		console.log('TwitterTrunkComponent: ');

		return React.createElement(
			'div',
			null,
			!this.state.logedIn ? React.createElement(
				'div',
				{ className: 'text-center' },
				React.createElement(
					'button',
					{ className: 'btn btn-lg btn-primary', onClick: this._login },
					React.createElement('i', { className: 'fa fa-fw fa-twitter' }),
					' Login with Twitter'
				)
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
					React.createElement('div', { className: 'col-sm-4' })
				)
			)
		);
	}
});

TwitterTrunkComponent = React.createFactory(TwitterTrunkComponent);

var InvoicesComponent = React.createClass({
	displayName: "InvoicesComponent",


	propTypes: {
		items: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			items: [],
			hideRows: true
		};
	},

	componentDidMount: function () {
		this.setState({
			items: this.props.items
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			items: props.items
		});
	},

	_showMore: function () {
		this.setState({
			hideRows: !this.state.hideRows
		});
	},

	render: function () {
		var items = this.state.items;
		var frases = this.props.frases;
		var hideRows = this.state.hideRows;

		console.log('InvoicesComponent: ', this.state.items);

		return React.createElement(
			"div",
			{ className: "panel" },
			React.createElement(
				"div",
				{ className: "panel-header" },
				React.createElement(
					"span",
					null,
					frases.BILLING.INVOICES.INVOICES
				)
			),
			React.createElement(
				"div",
				{ className: "panel-body" },
				!this.state.items.length ? React.createElement(
					"p",
					null,
					frases.BILLING.INVOICES.NO_INVOICES
				) : React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"table",
							{ className: "table" },
							React.createElement(
								"tbody",
								null,
								this.state.items.map(function (item, index) {
									if (hideRows && index > 2) {
										return null;
									}

									return React.createElement(InvoiceComponent, { invoice: item, key: index });
								})
							)
						),
						React.createElement(
							"button",
							{
								type: "button",
								className: "btn btn-link btn-block",
								onClick: this._showMore
							},
							hideRows ? 'Show more' : 'Show less'
						)
					)
				)
			)
		);
	}
});

InvoicesComponent = React.createFactory(InvoicesComponent);
function InvoiceComponent(props) {

	var invoice = props.invoice;
	var item = props.invoice.items[0];
	var cellStyle = {
		borderTop: 'none'
	};

	return React.createElement(
		'tr',
		null,
		React.createElement(
			'td',
			{ style: cellStyle },
			React.createElement(
				'small',
				{ className: "label " + (invoice.status === 'paid' ? 'label-success' : 'label-warning') },
				invoice.status
			)
		),
		React.createElement(
			'td',
			{ style: cellStyle },
			React.createElement(
				'b',
				null,
				invoice.currency,
				' ',
				invoice.paidAmount || item.amount,
				' '
			)
		),
		React.createElement(
			'td',
			{ style: cellStyle },
			React.createElement(
				'span',
				null,
				item.description,
				' '
			)
		),
		React.createElement(
			'td',
			{ style: cellStyle },
			React.createElement(
				'span',
				{ className: 'text-muted' },
				' ',
				new Date(invoice.createdAt).toLocaleDateString(),
				' '
			)
		)
	);
}

var DiscountsComponent = React.createClass({
	displayName: 'DiscountsComponent',


	propTypes: {
		items: React.PropTypes.array,
		frases: React.PropTypes.object,
		addCoupon: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			items: [],
			coupon: ''
		};
	},

	componentDidMount: function () {
		this.setState({
			items: this.props.items
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			items: props.items
		});
	},

	_addCoupon: function () {
		var coupon = this.state.coupon;
		if (!coupon) return;
		this.props.addCoupon(coupon);
	},

	_handleOnChange: function (e) {
		var value = e.target.value;
		this.setState({
			coupon: value
		});
	},

	render: function () {
		var frases = this.props.frases;

		console.log('DiscountsComponent: ', this.state.items);

		return React.createElement(
			'div',
			{ className: 'panel' },
			React.createElement(
				'div',
				{ className: 'panel-header' },
				React.createElement(
					'span',
					null,
					frases.BILLING.DISCOUNTS.DISCOUNTS
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-body' },
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-xs-12' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'text', className: 'form-control', placeholder: 'Promo code', value: this.state.coupon, onChange: this._handleOnChange }),
							React.createElement(
								'span',
								{ className: 'input-group-btn' },
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-success', onClick: this._addCoupon },
									frases.BILLING.DISCOUNTS.ACTIVATE_BTN
								)
							)
						),
						React.createElement('br', null),
						React.createElement(
							'h5',
							{ className: this.state.items.length ? '' : 'hidden' },
							frases.BILLING.DISCOUNTS.ACTIVE_DISCOUNTS
						),
						this.state.items.map(function (item) {
							return React.createElement(
								'h3',
								{ key: item._id },
								React.createElement(
									'b',
									null,
									item.name
								),
								' ',
								React.createElement(
									'small',
									null,
									item.coupon.description
								)
							);
						})
					)
				)
			)
		);
	}
});

DiscountsComponent = React.createFactory(DiscountsComponent);
var ChartComponent = React.createClass({
	displayName: 'ChartComponent',


	propTypes: {
		type: React.PropTypes.string,
		data: React.PropTypes.object,
		options: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			chart: {}
		};
	},

	componentDidMount: function () {
		this._setChart(this.props.data);
		// var el = ReactDOM.findDOMNode(this);
		// var options = this.props.options;
		// var data = this.props.data;
		// var chartOptions = {
		// 	bindto: el,
		// 	data: this.props.data
		// };
		// var chart = {};

		// if(options) {
		// 	for(var key in options) {
		// 		chartOptions[key] = options[key];
		// 	}
		// }

		// data.type = this.props.type;
		// chart = c3.generate(chartOptions);

		// this.setState({ chart: chart });
	},

	componentWillReceiveProps: function (props) {
		console.log('ChartsComponent componentWillReceiveProps: ', props);
		this._setChart(props.data);
		// this._updateChart(props.data);
	},

	componentWillUnmount: function () {
		console.log('ChartsComponent componentWillUnmount');
	},

	shouldComponentUpdate: function () {
		return false;
	},

	_getIds: function () {
		var chart = this.state.chart;
		return chart.data().reduce(function (init, next) {
			init.push(next.id);
			return init;
		}, []);
	},

	_excludeIds: function (fromArray, indexArray) {
		return fromArray.reduce(function (init, next) {
			if (indexArray.indexOf(next) < 0) init.push(next);
			return init;
		}, []);
	},

	_setChart: function (data) {
		var el = ReactDOM.findDOMNode(this);
		var options = this.props.options;
		// var data = this.props.data;
		var chartOptions = {
			bindto: el,
			data: data
		};
		var chart = {};

		if (options) {
			for (var key in options) {
				chartOptions[key] = options[key];
			}
		}

		data.type = this.props.type;
		chart = c3.generate(chartOptions);

		this.setState({ chart: chart });
	},

	_updateChart: function (data) {
		var chart = this.state.chart;
		// var chartIds = this._getIds();
		// var dataIds = data.columns.reduce(function(init, next) {
		// 	init.push(next[0]);
		// 	return init;
		// }, []);
		// var unloadIds = this._excludeIds(chartIds, dataIds);

		// data.done = function() {
		// 	chart.unload(unloadIds);
		// };

		chart.unload();

		setTimeout(function () {
			chart.load(data);
		}, 500);
	},

	render: function () {
		console.log('ChartsComponent render: ', this.state);
		return React.createElement('div');
	}
});

ChartComponent = React.createFactory(ChartComponent);
var AvCodecRowComponent = React.createClass({
	displayName: 'AvCodecRowComponent',


	propTypes: {
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	_onChange: function (e) {
		var target = e.target;
		var params = this.props.params;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		params[target.name] = value;
		this.props.onChange(params);
	},

	render: function () {
		var params = this.props.params;

		return React.createElement(
			'tr',
			null,
			React.createElement(
				'td',
				{ className: 'draggable' },
				React.createElement('i', { className: 'fa fa-ellipsis-v' })
			),
			React.createElement(
				'td',
				{ className: 'codec-name', 'data-codec': params.codec },
				params.codec
			),
			React.createElement(
				'td',
				null,
				React.createElement('input', { type: 'number', name: 'frame', className: 'form-control codec-frames', value: params.frame, onChange: this._onChange })
			),
			React.createElement(
				'td',
				null,
				React.createElement('input', { type: 'checkbox', name: 'enabled', checked: params.enabled, className: 'codec-enabled', onChange: this._onChange })
			)
		);
	}

});

AvCodecRowComponent = React.createFactory(AvCodecRowComponent);
var AvCodecsTableComponent = React.createClass({
	displayName: 'AvCodecsTableComponent',


	propTypes: {
		frases: React.PropTypes.object,
		model: React.PropTypes.string,
		availableCodecs: React.PropTypes.array,
		enabledCodecs: React.PropTypes.array,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			codecs: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			codecs: this._getCodecsArray(this.props)
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			codecs: this._getCodecsArray(props)
		});
	},

	_onChange: function (index, update) {
		var codecs = this.state.codecs;
		codecs[index] = update;

		this.props.onChange({
			model: this.props.model,
			codecs: codecs
		});
	},

	_getCodecsArray: function (props) {
		var codecs = [];
		var availableCodecs = [].concat(props.availableCodecs);
		var enabledCodecs = props.enabledCodecs ? [].concat(props.enabledCodecs) : [];
		var codec = {};

		codecs = enabledCodecs.map(function (item) {
			availableCodecs.splice(availableCodecs.indexOf(item.codec), 1);

			codec = {
				codec: item.codec,
				frame: item.frame,
				enabled: true
			};
			return codec;
		});

		availableCodecs.forEach(function (item) {
			codecs.push({ codec: item, frame: 30 });
		});

		// codecs = codecs.map(function(codec) {
		// 	codec = { codec: codec, frame: 30 };

		// 	enabledCodecs.map(function(item) {
		// 		if(codec.codec === item.codec) {
		// 			codec.frame = item.frame;
		// 			codec.enabled = true;
		// 		}

		// 		return item;
		// 	})

		// 	return codec;
		// });

		return codecs;
	},

	_tableRef: function (el) {
		console.log('_tableRef: ', el);
		return new Sortable(el);
	},

	_onSortEnd: function (e) {
		var target = e.currentTarget;
		var codecsLength = this.props.availableCodecs.length;
		var codecsOrder = [].slice.call(target.children).map(function (el, index) {
			el = el.children[1].getAttribute('data-codec');
			return el;
		});

		codecsOrder.length = codecsLength;
		this._reorderCodecs(codecsOrder);
	},

	_reorderCodecs: function (order) {
		var codecs = this.state.codecs;
		var newOrder = [].concat(order);
		var newIndex;

		codecs = codecs.map(function (item, index, array) {
			newIndex = order.indexOf(item.codec);
			newOrder[newIndex] = item;
			return item;
		});

		this.props.onChange({
			model: this.props.model,
			codecs: newOrder
		});
	},

	render: function () {
		var frases = this.props.frases;
		var codecs = this.state.codecs;

		return React.createElement(
			'table',
			{ className: 'table' },
			React.createElement(
				'thead',
				null,
				React.createElement(
					'tr',
					null,
					React.createElement('th', null),
					React.createElement(
						'th',
						null,
						frases.AUDIOCODECS
					),
					React.createElement(
						'th',
						null,
						frases.FRAMES,
						'(ms)'
					),
					React.createElement(
						'th',
						null,
						React.createElement('i', { className: 'fa fa-check' })
					)
				)
			),
			React.createElement(
				'tbody',
				{ ref: this._tableRef, onTouchEnd: this._onSortEnd, onDragEnd: this._onSortEnd },
				codecs.map(function (item, index) {
					return React.createElement(AvCodecRowComponent, { key: item.codec, params: item, onChange: this._onChange.bind(this, index) });
				}.bind(this))
			)
		);
	}

});

AvCodecsTableComponent = React.createFactory(AvCodecsTableComponent);
var SecurityOptionsComponent = React.createClass({
	displayName: 'SecurityOptionsComponent',


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
		var iptable = this.props.params.iptable || [];
		var adminiptable = this.props.params.adminiptable || [];

		if (!iptable.length) this._addRule(iptable);
		if (adminiptable && !adminiptable.length) this._addRule(adminiptable);

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
			{ className: 'col-sm-5 col-sm-offset-4' },
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

SecurityOptionsComponent = React.createFactory(SecurityOptionsComponent);
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
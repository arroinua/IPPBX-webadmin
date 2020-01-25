var AvailableUsersComponent = React.createClass({
	displayName: 'AvailableUsersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		kind: React.PropTypes.string,
		availableList: React.PropTypes.array,
		excludeList: React.PropTypes.array,
		selected: React.PropTypes.array,
		groupid: React.PropTypes.string,
		onChange: React.PropTypes.func,
		styles: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			data: [],
			filteredData: [],
			selected: [],
			init: false
		};
	},

	componentWillMount: function () {
		var data = [];
		var params = null;

		if (this.props.availableList) {
			data = this.props.excludeList ? this._exclude(this.props.availableList, this.props.excludeList) : this.props.availableList;
			return this.setState({ data: data, filteredData: data, init: true });
		}

		params = this.props.groupid ? { groupid: this.props.groupid } : null;
		this._getAvailableUsers(params, function (result) {
			data = this._exclude(result, this.props.excludeList);
			data = this._sortItems(data, 'ext');

			this.setState({ data: data, filteredData: data, init: true });
		}.bind(this));
	},

	componentWillReceiveProps: function (props) {
		if (props.groupid !== this.props.groupid) {
			var params = props.groupid ? { groupid: props.groupid } : null;

			this.setState({ init: false });

			this._getAvailableUsers(params, function (result) {
				var data = result.length ? this._sortItems(result, 'ext') : result;
				this.setState({ data: data, init: true });
				this._selectMembers(props.selected || []);
			}.bind(this));
		}
	},

	_getAvailableUsers: function (params, callback) {
		var usersOnly = this.props.kind === 'chatchannel';
		var users = [];
		json_rpc_async(usersOnly ? 'getExtensions' : 'getAvailableUsers', params, function (result) {
			users = usersOnly ? result.filter(function (item) {
				return item.kind === 'user';
			}) : result;
			callback(users);
		}.bind(this));
	},

	_sortItems: function (array, sortBy) {
		return array.sort(function (a, b) {
			return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
		});
	},

	_exclude: function (array, excludeList) {
		if (!excludeList || !excludeList.length) return array;
		var elist = excludeList.reduce(function (array, item) {
			array = array.concat([item.ext]);return array;
		}, []);
		return array.filter(function (item) {
			return elist.indexOf(item.ext) === -1;
		});
	},

	_saveChanges: function (selected) {
		// var selected = this.state.selected;
		// var selectedMembers = this.state.filteredData
		// .filter(function(item) { return selected.indexOf(item.ext) > -1; });

		this.props.onChange(selected);
		// this.props.onSubmit(selectedMembers);
	},

	_selectMembers: function (selected) {
		// var list = selected.reduce(function(array, item) { array.push(item.ext || item.number); return array; }, []);
		// items = items.map(function(item) { if(list.indexOf(item.ext) !== -1) item.selected = true; return item; });
		var items = selected.map(function (item) {
			if (!item.ext) item.ext = item.number;return { ext: item.ext, name: item.name, oid: item.oid };
		});
		this.setState({ selected: items });
	},

	_selectMember: function (index) {
		var members = [].concat(this.state.filteredData);
		var selected = [].concat(this.state.selected);
		var item = members[index];
		// var indexOf = selected.indexOf(item.ext);

		selected = sortByKey(selected.concat([item]), 'ext');

		this.setState({ selected: selected });

		this._saveChanges(selected);
	},

	_deSelectMember: function (id) {
		var selected = [].concat(this.state.selected);

		selected = selected.filter(function (item) {
			return item.ext !== id;
		});

		this.setState({ selected: selected });

		this._saveChanges(selected);
	},

	_selectAllMembers: function (e) {
		e.preventDefault();
		// var data = this.state.filteredData;
		// var selected = data.filter(function(item) { return item.selected; });
		// var allSelected = selected.length === data.length;

		// data = data.map(function(item) {
		// 	item.selected = !allSelected;
		// 	return item;
		// });

		// this.setState({ data: data });

		var selected = this.state.selected;
		var allSelected = selected.length === this.state.data.length;

		this._selectMembers(allSelected ? [] : this.state.data);

		this._saveChanges(selected);
	},

	_reduceByKey: function (array, key) {
		return array.reduce(function (result, item) {
			result = result.concat(item[key]);return result;
		}, []);
	},

	_filterItems: function (e) {
		var value = e.target.value;
		var data = [].concat(this.state.data);
		var filteredData = [];

		if (!value) {
			filteredData = data;
		} else {
			filteredData = data.filter(function (item) {
				if (item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
					return item;
				}
			});
		}

		this.setState({
			filteredData: filteredData
		});
	},

	render: function () {
		var frases = this.props.frases;
		var styles = { maxHeight: "300px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 };
		var selected = this._reduceByKey(this.state.selected, 'ext');

		if (this.props.styles) {
			styles = extend(styles, this.props.styles);
		}

		// <p><a href="#" style={{ display: "block", padding: "8px 10px" }} onClick={this._selectAllMembers}>{ frases.CHAT_CHANNEL.SELECT_ALL }</a></p>
		return React.createElement(
			'div',
			{ style: { margin: "20px 0" } },
			React.createElement('input', { className: 'form-control', onChange: this._filterItems, placeholder: frases.SEARCH, autoFocus: true }),
			this.state.init ? React.createElement(
				'ul',
				{ style: styles },
				this.state.filteredData.map(function (item, index) {

					return React.createElement(
						'li',
						{
							key: item.ext,
							style: { padding: "8px 10px", margin: "5px", borderRadius: "20px", color: "#333", background: selected.indexOf(item.ext) !== -1 ? "#eee" : "transparent", cursor: "pointer" },
							onClick: selected.indexOf(item.ext) !== -1 ? this._deSelectMember.bind(this, item.ext) : this._selectMember.bind(this, index)
						},
						React.createElement(
							'span',
							null,
							item.ext,
							' - ',
							item.name
						)
					);
				}.bind(this))
			) : React.createElement(Spinner, null)
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
function DividerComponent(props) {
	return React.createElement(
		"strong",
		{ className: "text-divider " + (props.size ? props.size : '') },
		props.children
	);
}
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
var FetchMethod = React.createClass({
	displayName: "FetchMethod",


	propTypes: {
		componentProps: React.PropTypes.object,
		method: React.PropTypes.string,
		params: React.PropTypes.object,
		component: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			fetch: false,
			result: null
		};
	},

	componentWillMount: function () {
		this._doFetch(this.props.method, this.props.params, function (result) {
			this.setState({
				result: result
			});
		});
	},

	_doFetch: function (method, params, callback) {
		this.setState({ fetch: true });
		json_rpc_async(method, params, function (result) {
			this.setState({ fetch: false });
			callback(result);
		});
	},

	render: function () {
		var frases = this.props.frases;
		var Component = this.props.component;

		return React.createElement(
			"div",
			null,
			this.state.fetch ? React.createElement(Spinner, null) : React.createElement(Component, { componentProps: this.props.componentProps, result: this.state.result })
		);
	}
});

FetchMethod = React.createFactory(FetchMethod);
var FileUpload = React.createClass({
	displayName: "FileUpload",


	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		value: React.PropTypes.string,
		name: React.PropTypes.string,
		accept: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			options: {}
		};
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
			el: e.target,
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
			return name.trim();
		}
		return '';
	},

	_getButtonEl: function () {
		var props = this.props;
		return React.createElement(
			"div",
			null,
			React.createElement(
				"button",
				{ className: "btn btn-" + (props.options.buttonType ? props.options.buttonType : 'default'), role: "button", onClick: this._onClick },
				props.options.text || props.frases.UPLOAD
			),
			React.createElement("input", {
				type: "file",
				name: this.props.name,
				className: "hidden",
				onChange: this._onFileSelect,
				accept: this.props.accept || ''
			})
		);
	},

	render: function () {
		if (this.props.options.noInput) return this._getButtonEl();
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
					accept: this.props.accept || '',
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
	displayName: "GroupFeaturesComponent",


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

		this.setState({
			state: state
		});

		this.props.onChange(state.params);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;

		return React.createElement(
			"form",
			{ className: "form-horizontal" },
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-sm-6 col-xs-12" },
					React.createElement(
						"div",
						{ className: "col-xs-12 pl-kind pl-users" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "recording", checked: params.recording, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.ALLOW_RECORDING
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "busyover", checked: params.busyover, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.BUSYOVER
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "callpickup", checked: params.callpickup, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.PICKUP
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "monitor", checked: params.monitor, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.CALLMONITOR
							)
						)
					),
					this.props.groupKind === 'equipment' && React.createElement(
						"div",
						null,
						React.createElement(
							"div",
							{ className: "col-xs-12" },
							React.createElement(
								"div",
								{ className: "checkbox" },
								React.createElement(
									"label",
									null,
									React.createElement("input", { type: "checkbox", name: "dnd", checked: params.dnd, onChange: this._onChange }),
									" ",
									frases.USERS_GROUP.FUNCTIONS.DND
								)
							)
						),
						React.createElement(
							"div",
							{ className: "col-xs-12" },
							React.createElement(
								"div",
								{ className: "checkbox" },
								React.createElement(
									"label",
									null,
									React.createElement("input", { type: "checkbox", name: "callwaiting", checked: params.callwaiting, onChange: this._onChange }),
									" ",
									frases.USERS_GROUP.FUNCTIONS.CALLWAITING
								)
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "forwarding", checked: params.forwarding, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.FORWARDING
							)
						)
					),
					this.props.groupKind === 'users' && React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "voicemail", checked: params.voicemail, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.VOICEMAIL
							)
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-6 col-xs-12" },
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "dndover", checked: params.dndover, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.DNDOVER
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "busyoverdeny", checked: params.busyoverdeny, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.BUSYOVERDENY
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "pickupdeny", checked: params.pickupdeny, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.PICKUPDENY
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "monitordeny", checked: params.monitordeny, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.MONITORDENY
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "outcallbarring", checked: params.outcallbarring, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.OUTBARGING
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(
							"div",
							{ className: "checkbox" },
							React.createElement(
								"label",
								null,
								React.createElement("input", { type: "checkbox", name: "costroutebarring", checked: params.costroutebarring, onChange: this._onChange }),
								" ",
								frases.USERS_GROUP.FUNCTIONS.COSTBARGING
							)
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
		open: React.PropTypes.bool,
		size: React.PropTypes.string,
		type: React.PropTypes.string,
		title: React.PropTypes.string,
		titleObj: React.PropTypes.object,
		submitText: React.PropTypes.string,
		cancelText: React.PropTypes.string,
		closeOnSubmit: React.PropTypes.bool,
		submit: React.PropTypes.func,
		disabled: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		onOpen: React.PropTypes.func,
		body: React.PropTypes.element,
		footer: React.PropTypes.element,
		children: React.PropTypes.array,
		cont: React.PropTypes.bool,
		fetching: React.PropTypes.bool
	},

	el: null,

	componentDidMount: function () {
		if (this.props.open === true || this.props.open === undefined) {
			this._openModal();
			if (this.props.onOpen) this.props.onOpen;
		}

		if (this.props.onClose) $(this.el).on('hidden.bs.modal', this.props.onClose);
	},

	// componentDidUpdate: function() {
	// 	if(this.props.open === true || this.props.open === undefined) {
	// 		this._openModal();
	// 	}
	// },

	componentWillReceiveProps: function (props) {
		if (props.open === false) {
			this._closeModal();
		} else if (props.open === true) {
			this._openModal();
		}
	},

	componentWillUnmount: function () {
		var cont = document.getElementById('modal-container');
		if (cont) cont.parentNode.removeChild(cont);
	},

	_openModal: function () {
		if (this.el) $(this.el).modal();
	},

	_closeModal: function () {
		$(this.el).modal('hide');
	},

	_submitModal: function (e) {
		this.props.submit();
		if (this.props.closeOnSubmit) this._closeModal();
	},

	_onRef: function (el) {
		if (!el) return;

		this.el = el;

		var cont = document.getElementById('modal-container');
		if (cont) {
			cont.removeChild(cont.firstChild);
		} else {
			cont = document.createElement('div');
			cont.id = 'modal-container';
			document.body.insertBefore(cont, document.body.firstChild);
		}
		// var clone = el.cloneNode(true);
		cont.appendChild(el);
		// el.parentNode.removeChild(el);
		// this.el = clone;
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
					) : this.props.titleObj ? React.createElement(
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
							this.props.titleObj
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
					this.props.footer ? this.props.footer : this.props.submit ? React.createElement(
						'div',
						{ className: 'modal-footer' },
						React.createElement(
							'button',
							{ className: "btn btn-" + (this.props.type || "primary"), onClick: this._submitModal, disabled: this.props.fetching || this.props.disabled ? true : false },
							this.props.fetching ? React.createElement('span', { className: 'fa fa-spinner fa-spin fa-fw' }) : this.props.submitText
						),
						React.createElement(
							'button',
							{ className: 'btn btn-link', 'data-dismiss': 'modal' },
							this.props.cancelText
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
				props.enabled !== undefined && props.onStateChange && React.createElement(
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


		// return (routeObj.length ? routeObj[0] : { ext: ext })
	},

	_onChange: function (val) {
		if (!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function () {
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
		props.header ? React.createElement(
			"div",
			{ className: "panel-header " + (props.static ? "panel-static" : "") },
			props.header,
			React.createElement("i", { className: "fa fa-chevron-down" })
		) : null,
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
var PasswordComponent = React.createClass({
	displayName: "PasswordComponent",


	propTypes: {
		frases: React.PropTypes.object,
		name: React.PropTypes.string,
		value: React.PropTypes.string,
		generatePassword: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			revealed: false
		};
	},

	_reveal: function () {
		this.setState({ revealed: !this.state.revealed });
	},

	_generatePassword: function () {
		var props = this.props;
		this.props.onChange({
			target: {
				name: props.name,
				value: props.generatePassword()
			}
		});
	},

	render: function () {
		return React.createElement(
			"div",
			{ className: "input-group" },
			React.createElement("input", { type: this.state.revealed ? "text" : "password", className: "form-control", name: this.props.name, value: this.props.value, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", onChange: this.props.onChange, autoComplete: "off" }),
			React.createElement(
				"span",
				{ className: "input-group-btn" },
				React.createElement(
					"button",
					{ type: "button", className: "btn btn-default", title: this.props.frases.REVEAL_PWD, onClick: this._reveal },
					React.createElement("i", { className: "fa fa-eye" })
				),
				this.props.generatePassword && React.createElement(
					"button",
					{ type: "button", className: "btn btn-default", onClick: this._generatePassword },
					React.createElement("i", { className: "fa fa-refresh", title: this.props.frases.GENERATE_PWD })
				)
			)
		);
	}

});

PasswordComponent = React.createFactory(PasswordComponent);
var DatePickerComponent = React.createClass({
	displayName: 'DatePickerComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onClick: React.PropTypes.func,
		actionButton: React.PropTypes.bool
	},

	dropdown: null,
	cfrom: null,
	cto: null,
	cfromRome: null,
	ctoRome: null,

	getInitialState: function () {
		return {
			open: false,
			currRange: 'today',
			currInterval: 'hour',
			interval: false,
			actionButton: true,
			buttonSize: 'sm',
			buttonColor: 'default',
			date: {},
			ranges: [],
			intervals: []
		};
	},

	componentWillMount: function () {
		var frases = this.props.frases;
		var ranges = [{
			label: frases.DATE_PICKER.TODAY,
			value: "today"
		}, {
			label: frases.DATE_PICKER.YESTERDAY,
			value: "yesterday"
		}, {
			label: frases.DATE_PICKER.LAST_7_DAYS,
			value: "week"
		}, {
			label: frases.DATE_PICKER.LAST_30_DAYS,
			value: "30_days"
		}, {
			label: frases.DATE_PICKER.LAST_60_DAYS,
			value: "60_days"
		}, {
			label: frases.DATE_PICKER.CUSTOM_RANGE,
			value: "custom"
		}];
		var intervals = [{
			label: 15 + frases.MIN,
			value: "1/4_hour"
		}, {
			label: 30 + frases.MIN,
			value: "1/2_hour"
		}, {
			label: frases.HOUR,
			value: "hour"
		}, {
			label: frases.DAY,
			value: "day"
		}];

		this.setState({ ranges: ranges, intervals: intervals });
		this._setCurrentRange(this.state.currRange, true);
	},

	componentDidMount: function () {
		// document.body.addEventListener('click', this._onWindowClick);
		var cfrom = this.cfrom;
		var cto = this.cto;

		this.cfromRome = rome(cfrom, {
			time: false,
			inputFormat: 'DD/MM/YY',
			dateValidator: rome.val.beforeEq(cto)
		}).setValue(Date(this.state.date.end));

		this.ctoRome = rome(cto, {
			time: false,
			inputFormat: 'DD/MM/YY',
			dateValidator: rome.val.afterEq(cfrom)
		}).setValue(Date(this.state.date.from));

		cfrom.value = moment(this.state.date.from).format('DD/MM/YY');
		cto.value = moment(this.state.date.to).format('DD/MM/YY');
	},

	// componentWillUnmount: function() {
	// 	document.body.removeEventListener('click', this._onWindowClick);
	// },

	// _onWindowClick: function(e) {
	// 	if(e.target === this.dropdown || this.dropdown.contains(e.target)) return;
	// 	this.setState({ open: false });

	// },

	_setCurrentRange: function (option, trigger) {
		var date = {};
		if (option === 'today') {
			date.begin = today().toStartOf().valueOf();
			date.end = today().toEndOf().valueOf();
		} else if (option === 'yesterday') {
			date.end = today().toEndOf().minus(1).valueOf();
			date.begin = today().toStartOf().minus(1).valueOf();
		} else if (option === 'week') {
			date.end = today().toEndOf().valueOf();
			date.begin = today().toStartOf().minus(7).valueOf();
		} else if (option === '30_days') {
			date.end = today().toEndOf().valueOf();
			date.begin = today().toStartOf().minus(30).valueOf();
		} else if (option === '60_days') {
			date.end = today().toEndOf().valueOf();
			date.begin = today().toStartOf().minus(60).valueOf();
		} else if (option === 'custom') {
			date.end = today().toStartOf().dateOf();
			date.begin = today().toEndOf().dateOf();
		}

		this.setState({ currRange: option, date: date });

		if ((this.props.actionButton === false || trigger) && option !== 'custom') setTimeout(this._onClick, 0);
	},

	_setCurrentInterval: function (interval) {
		var newInterval;

		if (interval === 'hour') newInterval = 60 * 60 * 1000;else if (interval === '1/2_hour') newInterval = 30 * 60 * 1000;else if (interval === '1/4_hour') newInterval = 15 * 60 * 1000;else if (interval === 'day') newInterval = 24 * 60 * 60 * 1000;

		this.setState({ currInterval: newInterval });
	},

	_onDropdownToggle: function () {
		this.setState({
			open: !this.state.open
		});
	},

	_onClick: function () {
		var date = {};
		if (this.state.currRange === 'custom') {
			date.begin = today(this.cfromRome.getDate()).toStartOf().valueOf();
			date.end = today(this.ctoRome.getDate()).toEndOf().valueOf();
		} else {
			date.begin = this.state.date.begin;
			date.end = this.state.date.end;
		}

		this.props.onClick({ date: date });
		this.setState({ date: date, open: false });
	},

	_onRef: function (el) {
		if (el.name === "custom-range-from") this.cfrom = el;else if (el.name === "custom-range-to") this.cto = el;else this.dropdown = el;
	},

	render: function () {

		var frases = this.props.frases;
		var date = this.state.date;

		return React.createElement(
			'div',
			{ ref: this._onRef, className: "dropdown custom-dropdown " + (this.state.open ? "open" : ""), style: { display: "inline-block" } },
			React.createElement(
				'button',
				{ type: 'button', className: 'btn btn-default btn-md btn-block dropdown-button', 'aria-expanded': 'true', onClick: this._onDropdownToggle },
				React.createElement(
					'span',
					{ className: 'btn-text', style: { marginRight: "5px" } },
					moment(date.begin).format('DD/MM/YYYY') + ' - ' + moment(date.end).format('DD/MM/YYYY')
				),
				React.createElement('span', { className: 'caret' })
			),
			React.createElement(
				'div',
				{ className: 'dropdown-menu' },
				React.createElement(
					'div',
					{ className: 'col-xs-12 btn-group btn-group-vertical', 'data-toggle': 'buttons' },
					this.state.ranges.map(function (item) {
						return React.createElement(
							'label',
							{ key: item.value, className: "btn btn-default " + (this.state.currRange === item.value ? "active" : ""), onClick: function () {
									this._setCurrentRange(item.value);
								}.bind(this) },
							React.createElement('input', { type: 'radio', name: 'options', checked: this.state.currRange === item.value }),
							item.label
						);
					}.bind(this))
				),
				React.createElement(
					'div',
					{ className: "col-xs-12 custom-range " + (this.state.currRange === 'custom' ? '' : 'hidden') },
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement('input', { ref: this._onRef, type: 'text', className: 'form-control', name: 'custom-range-from' }),
						React.createElement(
							'span',
							{ className: 'input-group-addon' },
							React.createElement('i', { className: 'fa fa-calendar' })
						),
						React.createElement('input', { ref: this._onRef, type: 'text', className: 'form-control', name: 'custom-range-to' })
					),
					React.createElement('br', null),
					this.props.actionButton === false ? React.createElement(
						'button',
						{ type: 'button', name: 'selectButton', className: 'btn btn-primary btn-md btn-block', onClick: this._onClick },
						frases.SELECT
					) : null
				),
				this.props.interval ? React.createElement(
					'div',
					{ className: 'col-xs-12 custom-interval' },
					React.createElement('hr', null),
					React.createElement(
						'p',
						null,
						frases.DATE_PICKER.INTERVAL
					),
					React.createElement(
						'div',
						{ className: 'btn-group btn-group-justified', 'data-toggle': 'buttons' },
						this.state.intervals.map(function (item) {
							React.createElement(
								'label',
								{ key: item.value, className: 'btn btn-default' },
								React.createElement('input', { type: 'radio', name: 'options', 'data-interval': item.value }),
								item.label
							);
						})
					)
				) : null,
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement('hr', null),
					this.props.actionButton !== false ? React.createElement(
						'button',
						{ type: 'button', name: 'selectButton', className: 'btn btn-primary btn-md btn-block', onClick: this._onClick },
						frases.SELECT
					) : null
				)
			)
		);
	}
});

DatePickerComponent = React.createFactory(DatePickerComponent);
function Spinner(props) {
	return React.createElement(
		"div",
		{ className: props.classname || "text-center", style: { fontSize: "1.6em" } },
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
    inputStyles: React.PropTypes.object,
    onChange: React.PropTypes.func,
    onMenuClose: React.PropTypes.func
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

      if (this.props.onMenuClose) this.props.onMenuClose();
    }.bind(this), 1000);
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
        style: this.props.inputStyles || {},
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
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atfr / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY, format: "hh:mm:ss" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.art / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME, format: "hh:mm:ss" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atrm / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_REPLY, format: "hh:mm:ss" } })
				),
				React.createElement(
					"div",
					{ className: "col-sm-3 col-xs-6" },
					React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.atta / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_ASSIGN, format: "hh:mm:ss" } })
				)
			)
		);
	}
});

ActivityAnalyticsComponent = React.createFactory(ActivityAnalyticsComponent);
var ChannelTypeAnalyticsComponent = React.createClass({
	displayName: "ChannelTypeAnalyticsComponent",


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

		return data && !this.props.fetching ? React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS },
					React.createElement(ChartComponent, {
						type: "donut",
						data: {
							columns: this._getColumns(data, 'name', ['tnc'])
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
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS },
					React.createElement(ChartComponent, {
						type: "donut",
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
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS },
					React.createElement(ChartComponent, {
						type: "donut",
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
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY + " (" + frases.MINUTES + ")" },
					React.createElement(ChartComponent, {
						type: "bar",
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
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					PanelComponent,
					{ header: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME + " (" + frases.MINUTES + ")" },
					React.createElement(ChartComponent, {
						type: "bar",
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
		this._getData(this.props.method, this.props.fetch, function (result) {
			this.setState({ fetching: false });
			this._setData(result);
		}.bind(this));
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
			begin: params.date.start || params.date.begin,
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
	displayName: "AnalyticsComponent",


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

	// componentDidMount: function() {
	// var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
	// },

	_getData: function (params) {
		show_loading_panel();
		this.setState({ fetch: params });
	},

	_onChartTypeSelect: function (e) {
		var value = e.target.value;
		this.setState({ showChartType: value });
	},

	_onComponentLoad: function () {
		show_content();
	},

	_onComponentUpdate: function () {
		show_content();
	},

	render: function () {
		var frases = this.props.frases;
		var showChartType = this.state.showChartType;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row", style: { margin: "20px 0" } },
				React.createElement(
					"div",
					{ className: "col-sm-3" },
					React.createElement(DatePickerComponent, { frases: this.props.frases, onClick: this._getData })
				)
			),
			React.createElement(
				PanelComponent,
				null,
				React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"div",
						{ className: "col-xs-12" },
						React.createElement(GetAndRenderAnalyticsDataComponent, {
							component: ActivityAnalyticsComponent,
							frases: this.props.frases,
							fetch: this.state.fetch,
							method: "getActivityStatistics",
							onComponentLoad: this._onComponentLoad,
							onComponentUpdate: this._onComponentUpdate
						})
					)
				)
			),
			React.createElement(
				"div",
				{ className: "row", style: { margin: "20px 0" } },
				React.createElement(
					"div",
					{ style: { display: "inline-block" } },
					React.createElement(
						"select",
						{ className: "form-control", onChange: this._onChartTypeSelect },
						React.createElement(
							"option",
							{ value: "chatGroup" },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHAT_GROUP
						),
						React.createElement(
							"option",
							{ value: "channelName" },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_NAME
						),
						React.createElement(
							"option",
							{ value: "channelType" },
							frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_TYPE
						)
					)
				)
			),
			showChartType === 'chatGroup' ? React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: "getChatGroupStatistics"
			}) : showChartType === 'channelName' ? React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: "getChannelStatistics"
			}) : React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: this.props.frases,
				fetch: this.state.fetch,
				method: "getChannelTypeStatistics"
			})
		);
	}
});

AnalyticsComponent = React.createFactory(AnalyticsComponent);
function SingleIndexAnalyticsComponent(props) {

	var params = props.params || { index: props.index, desc: props.desc, format: props.format, iconClass: props.iconClass, sec: props.sec };

	// getDefaultProps: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	// componentWillMount: function() {
	// 	var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
	// 	this._getData({
	// 		date: picker.date
	// 	});
	// },

	function _formatTimeString(time, format) {
		return window.formatTimeString(time, format);
	}

	function _formatIndex(value, format) {
		// var result = value;
		if (format === 'ms') format = 'hh:mm:ss';

		return format ? _formatTimeString(value, format) : value;
	}
	// <span style={{ display: "inline-block", width: "50px", height: "1px", background: "#eee" }}></span>

	return React.createElement(
		'div',
		{ className: "stat-index-cont " + (props.inverseStyles ? "inverse" : "") },
		props.iconClass ? React.createElement(
			'div',
			{ className: 'stat-index-head' },
			React.createElement(
				'div',
				{ className: 'stat-index-icon' },
				React.createElement('span', { className: props.iconClass })
			)
		) : null,
		React.createElement(
			'div',
			{ className: 'stat-index-body' },
			React.createElement(
				'span',
				{ className: 'stat-index-index' },
				_formatIndex(params.index, params.format)
			),
			React.createElement(
				'span',
				{ className: 'stat-index-desc' },
				params.desc
			)
		)
	);
}
var ApplicationComponent = React.createClass({
	displayName: 'ApplicationComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			file: null
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {}
		});
	},

	componentWillReceiveProps: function (props) {
		var stateUpdate = { params: props.params };
		if (props.params.name && !this.props.params.name) {
			stateUpdate.file = null;
		}

		this.setState(stateUpdate);
	},

	_setObject: function () {
		var frases = this.props.frases;
		if (!this.props.params.name && !this.state.file) return alert(frases.APPLICATIONS.NO_APP_ERROR);
		this.props.setObject(this.state.params, this.state.file);
	},

	_onStateChange: function (state) {
		var params = extend({}, this.state.params);
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function (value) {
		var params = extend({}, this.state.params);
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_handleOnChange: function (e) {
		var state = extend({}, this.state);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.setState({
			state: state
		});
	},

	_handleOnParametersChange: function (e) {
		var params = extend({}, this.state.params);
		var parameters = [].concat(params.parameters);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		parameters = parameters.map(function (item) {
			if (item.key === target.name) return { key: item.key, value: target.value };return item;
		});
		params.parameters = parameters;

		this.setState({ params: params });
	},

	_onFileUpload: function (file) {

		this.setState({
			file: file
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled || false,
				onStateChange: this._onStateChange,
				placeholder: frases.NAME,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.props.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS },
						React.createElement(
							'div',
							null,
							React.createElement('p', { dangerouslySetInnerHTML: { __html: Utils.htmlDecode(frases.APPLICATIONS.UPLOAD_APP_DESC) } }),
							React.createElement(DragAndDropComponent, { frases: frases, onChange: this._onFileUpload, params: { filename: params.filename, allowedTypes: ['.application'] } })
						),
						React.createElement(
							'form',
							{ className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'div',
									{ className: 'col-sm-12' },
									React.createElement(
										'div',
										{ className: 'checkbox' },
										React.createElement(
											'label',
											null,
											React.createElement('input', { type: 'checkbox', name: 'debug', checked: this.state.params.debug, onChange: this._handleOnChange }),
											React.createElement(
												'span',
												null,
												frases.APPLICATIONS.DEBUG,
												' '
											)
										)
									)
								)
							)
						)
					),
					this.props.params.name && React.createElement(
						PanelComponent,
						{ header: frases.APPLICATIONS.APP_PARAMETERS_HEADER },
						React.createElement(
							'form',
							{ className: 'form-horizontal', onChange: this._handleOnParametersChange },
							React.createElement(
								'div',
								null,
								params.parameters.map(function (item) {
									return React.createElement(
										'div',
										{ key: item.key, className: 'form-group' },
										React.createElement(
											'label',
											{ className: 'col-sm-4 control-label' },
											React.createElement(
												'span',
												null,
												item.key
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-8' },
											React.createElement('input', { type: 'text', className: 'form-control', name: item.key, value: item.value })
										)
									);
								})
							)
						)
					)
				)
			)
		);
	}
});

ApplicationComponent = React.createFactory(ApplicationComponent);
var BillingComponent = React.createClass({
	displayName: "BillingComponent",


	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		frases: React.PropTypes.object,
		extend: React.PropTypes.func,
		onAddPaymentMethod: React.PropTypes.func,
		setPrimaryPaymentMethod: React.PropTypes.func,
		removePaymentMethod: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			invoices: [],
			openNewCardForm: false
		};
	},

	componentWillMount: function () {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));

		this.setState({
			profile: this.props.profile,
			sub: sub,
			options: this.props.options
		});
	},

	componentWillReceiveProps: function (props) {
		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};

		this.setState({
			sub: sub,
			options: props.options,
			profile: props.profile,
			invoices: props.invoices
		});
	},

	_addPaymentMethod: function (e) {
		if (e) e.preventDefault();

		var profile = this.state.profile;

		this.props.onAddPaymentMethod(function (result) {
			if (!result) return;

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _editPaymentMethod: function(e) {
	// 	e.preventDefault();

	// 	var profile = this.state.profile;

	// 	this.props.onEditPaymentMethod(function(result) {
	// 		if(!result) return;

	// 		profile.billingMethod = {
	// 			params: result.card
	// 		};

	// 		this.setState({ profile: profile });
	// 	}.bind(this));
	// },

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
		var sub = this.state.sub;
		var options = this.props.options;
		var openNewCardForm = this.state.openNewCardForm;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					sub.status === 'past_due' ? React.createElement(
						"div",
						{ className: "alert alert-warning", role: "alert" },
						frases.BILLING.ALERTS.PAST_DUE,
						" ",
						React.createElement(
							"a",
							{ href: "#", onClick: this._renewSub, className: "alert-link" },
							frases.BILLING.RENEW_SUB
						),
						" ",
						frases.OR,
						" ",
						React.createElement(
							"a",
							{ href: "#", onClick: this._updateAndRenewSub, className: "alert-link" },
							frases.BILLING.UPDATE_PAYMENT_METHOD
						),
						"."
					) : sub.plan.planId === 'trial' && sub.status === 'expired' ? React.createElement(
						"div",
						{ className: "alert alert-warning", role: "alert" },
						frases.BILLING.ALERTS.TRIAL_EXPIRED,
						" ",
						React.createElement(
							"a",
							{ href: "#plansCollapse", "data-toggle": "collapse", "aria-expanded": "false", "aria-controls": "plansCollapse", onClick: this._openPlans, className: "alert-link" },
							frases.BILLING.UPGRADE_PLAN_ALERT_MSG
						)
					) : ''
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						PanelComponent,
						{ header: frases.BILLING.PAYMENT_METHOD_TITLE },
						React.createElement(ManagePaymentMethodComponent, {
							frases: frases,
							profile: profile,
							onClick: this._addPaymentMethod,
							setPrimaryPaymentMethod: this.props.setPrimaryPaymentMethod,
							removePaymentMethod: this.props.removePaymentMethod
						})
					)
				),
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						PanelComponent,
						{ header: frases.BILLING.INVOICES.INVOICES },
						React.createElement(InvoicesComponent, { items: this.state.invoices, frases: frases })
					)
				)
			)
		);
	}
});

BillingComponent = React.createFactory(BillingComponent);
var NewPaymentComponent = React.createClass({
	displayName: 'NewPaymentComponent',


	propTypes: {
		frases: React.PropTypes.object,
		payment: React.PropTypes.object,
		profile: React.PropTypes.object,
		renderCardElement: React.PropTypes.func,
		onCallback: React.PropTypes.func,
		getCountries: React.PropTypes.func,
		onClose: React.PropTypes.func,
		onSubmit: React.PropTypes.func
	},

	componentWillMount: function () {
		var details = {
			name: this.props.profile.name,
			email: this.props.profile.email
		};
		var canSubmit = details.name && details.email;

		this.setState({
			details: details,
			address: {},
			modalOpened: true,
			canSubmit: canSubmit,
			errors: [],
			countries: []
		});

		// this._init();
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			modalOpened: true
		});
	},

	// _init: function() {
	// this.props.getCountries(function(err, result) {
	// 	this.setState({ countries: result })
	// }.bind(this))
	// },

	_onModalClosed: function () {
		this.setState({ modalOpened: false });
		this.props.onClose();
	},

	_onChange: function (e) {
		var target = e.target;
		var address = null;
		var details = null;
		var canSubmit = this.state.canSubmit;

		if (target.name === 'name' || target.name === 'email') {
			details = extend({}, this.state.details);
			details[target.name] = target.value;
		} else {
			address = extend({}, this.state.address);
			address[target.name] = target.value;
		}

		canSubmit = address ? address.line1 && address.city && address.postal_code && address.country : details.name && details.email;
		this.setState({ address: address, details: details, canSubmit: canSubmit });
	},

	_onRef: function (el) {
		if (el) {
			var card = this.props.renderCardElement(el);
			card.addEventListener('change', function (event) {
				if (event.error) {
					this.setState({ errors: [event.error] });
				} else {
					this.setState({ errors: [] });
				}
			}.bind(this));
		}
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

	_submitForm: function (e) {
		e.preventDefault();
		this.setState({ canSubmit: false });
		this.props.onSubmit({ address: this.state.address, details: this.state.details, payment: this.props.payment }, function (err, result) {
			if (err) return this.setState({ errors: [err], canSubmit: true });
			this.setState({ modalOpened: false });
			this.props.onCallback(null, result);
		}.bind(this));
	},

	// <div className="form-group">
	//     <label htmlFor="line1">Address</label>
	//     <input className="form-control" name="line1" placeholder={"Calls road, 1"} required />
	// </div>
	// <div className="row form-group">
	//     <div className="col-sm-8">
	//     	<label htmlFor="city">City</label>
	//     	<input className="form-control" name="city" placeholder={"Callsville"} required />
	//     </div>
	//     <div className="col-sm-4">
	//     	<label htmlFor="postal_code">ZIP</label>
	//     	<input className="form-control" name="postal_code" placeholder={"12345"} required />
	//     </div>
	// </div>
	// <div className="form-group">
	//     <label htmlFor="country">Country</label>
	//     <select className="form-control" name="country" required>
	//     	<option>Select country</option>
	//     	{
	//     		this.state.countries.map(function(item) {
	//     			return (
	//     				<option key={item.alpha2Code} value={item.alpha2Code}>{item.name}</option>
	//     			)
	//     		})
	//     	}
	//     </select>
	// </div>

	_getBody: function () {

		var frases = this.props.frases;

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'div',
				{ className: 'col-xs-12' },
				React.createElement(
					'form',
					{ onSubmit: this._submitForm, onChange: this._onChange },
					React.createElement(
						'fieldset',
						{ style: { marginBottom: "10px" } },
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'email' },
								frases.CHECKOUT.FORM_LABELS.EMAIL
							),
							React.createElement('input', { className: 'form-control', name: 'email', placeholder: frases.CHECKOUT.PLACEHOLDERS.EMAIL, value: this.state.details.email, required: true })
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'name' },
								frases.CHECKOUT.FORM_LABELS.NAME
							),
							React.createElement('input', { className: 'form-control', name: 'name', placeholder: frases.CHECKOUT.PLACEHOLDERS.NAME, value: this.state.details.name, required: true })
						)
					),
					React.createElement('hr', null),
					React.createElement(
						'fieldset',
						null,
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ htmlFor: 'card-element' },
								frases.CHECKOUT.FORM_LABELS.CARD
							),
							React.createElement('div', {
								id: 'card-element',
								ref: this._onRef,
								style: {
									padding: "9px 12px",
									border: "1px solid #ddd",
									borderRadius: "4px"
								}
							})
						),
						this.state.errors.length ? React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'div',
								{ id: 'card-errors', className: 'alert alert-danger', role: 'alert' },
								this.state.errors.map(function (item) {
									return React.createElement(
										'p',
										{ key: item.code },
										frases.CHECKOUT.ERROR[item.code] || frases.CHECKOUT.ERROR['generic_decline']
									);
								})
							)
						) : null
					),
					React.createElement(
						'div',
						{ className: 'form-group text-center' },
						React.createElement(
							'button',
							{ disabled: !this.state.canSubmit, type: 'submit', className: 'btn btn-lg btn-primary' },
							this.props.payment ? frases.CHECKOUT.PAY_BTN + " " + this._currencyNameToSymbol(this.props.payment.currency) + this.props.payment.amount : frases.CHECKOUT.ADD_METHOD_BTN
						)
					),
					!this.props.payment ? React.createElement(
						'p',
						{ className: 'text-center' },
						frases.CHECKOUT.ADD_METHOD_NOTICE
					) : null
				)
			)
		);
	},

	render: function () {
		var paymentMethod = this.props.paymentMethod;
		var profile = this.props.profile;
		var frases = this.props.frases;

		return React.createElement(ModalComponent, { size: 'sm', title: this.props.payment ? frases.CHECKOUT.NEW_PAYMENT : frases.CHECKOUT.NEW_PAYMENT_METHOD_TITLE, open: this.state.modalOpened, body: this._getBody(), onClose: this._onModalClosed, onSubmit: this.props.onSubmit });
	}
});

NewPaymentComponent = React.createFactory(NewPaymentComponent);
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

	var profile = props.profile;
	var billingDetails = profile.billingDetails;
	var frases = props.frases;

	return React.createElement(
		"div",
		null,
		React.createElement(
			"div",
			{ className: "table-responsive" },
			React.createElement(
				"table",
				{ className: "table" },
				billingDetails && billingDetails.length ? React.createElement(
					"tbody",
					null,
					billingDetails.map(function (item) {
						return React.createElement(
							"tr",
							{ key: item.id },
							React.createElement(
								"td",
								null,
								React.createElement(
									"span",
									{ className: "text-uppercase" },
									item.params.brand
								)
							),
							React.createElement(
								"td",
								{ className: "text-muted", style: { userSelect: 'none' } },
								"\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ",
								item.params.last4
							),
							React.createElement(
								"td",
								null,
								React.createElement(
									"span",
									null,
									item.params.exp_month,
									"/",
									item.params.exp_year
								)
							),
							React.createElement(
								"td",
								{ className: "text-right" },
								item.id === profile.billingMethod.id ? React.createElement(
									"button",
									{ className: "btn btn-success btn-link" },
									React.createElement("span", { className: "fa fa-check" }),
									" ",
									frases.BILLING.PAYMENT_METHODS.PRIMARY_BTN
								) : React.createElement(
									"button",
									{ className: "btn btn-link", onClick: function (e) {
											props.setPrimaryPaymentMethod(item.id);
										} },
									frases.BILLING.PAYMENT_METHODS.SET_PRIMARY_BTN
								)
							),
							React.createElement(
								"td",
								{ className: "text-right" },
								React.createElement(
									"button",
									{ className: "btn btn-danger btn-link", onClick: function (e) {
											props.removePaymentMethod(item.id);
										} },
									React.createElement("span", { className: "fa fa-fw fa-trash" }),
									" ",
									frases.BILLING.PAYMENT_METHODS.REMOVE_BTN
								)
							)
						);
					})
				) : React.createElement(
					"tbody",
					null,
					React.createElement(
						"tr",
						null,
						React.createElement(
							"td",
							{ colSpan: "5" },
							frases.BILLING.PAYMENT_METHODS.NO_METHODS_MSG
						)
					)
				)
			)
		),
		React.createElement(
			"div",
			null,
			React.createElement(
				"button",
				{ className: "btn btn-primary", onClick: props.onClick },
				React.createElement("i", { className: "fa fa-plus" }),
				" ",
				frases.BILLING.PAYMENT_METHODS.ADD_NEW_METHOD_BTN
			)
		)
	);
}

ManagePaymentMethodComponent = React.createFactory(ManagePaymentMethodComponent);
var ChannelRouteComponent = React.createClass({
	displayName: 'ChannelRouteComponent',


	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		routes: React.PropTypes.array,
		onChange: React.PropTypes.func
		// addSteps: React.PropTypes.func
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

		// this.props.addSteps([{
		// 	element: '.channel-routes',
		// 	popover: {
		// 		title: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].TITLE,
		// 		description: frases.GET_STARTED.STEPS.ALLOCATE_TO["1"].DESC,
		// 		position: 'bottom'
		// 	}
		// }, {
		// 	element: '.create-group-links',
		// 	popover: {
		// 		title: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].TITLE,
		// 		description: frases.GET_STARTED.STEPS.ALLOCATE_TO["2"].DESC,
		// 		position: 'top'
		// 	}
		// }]);
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

		this.setState({ selectedRoute: selectedRoute });
		this.props.onChange(selectedRoute);
	},

	_getAvailableRoutes: function (type, callback) {
		// var type = this.props.type;
		var isTelephonyChannel = type === 'Telephony' || type === 'Webcall';
		var groupType = isTelephonyChannel ? ['hunting', 'icd', 'attendant', 'application'] : ['chatchannel', 'application'];
		var routes = [];

		getObjects(groupType, function (result) {
			routes = routes.concat(result);

			if (isTelephonyChannel) {
				getExtensions(function (extensions) {
					routes = routes.concat(filterObject(extensions, ['user', 'phone']));
					callback(routes);
				});
			} else {
				callback(routes);
			}
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
				'optgroup',
				{ label: frases.KINDS[key], key: key },
				groups[key].map(function (item) {

					return React.createElement(
						'option',
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
			'div',
			null,
			React.createElement(
				'label',
				{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
				frases.CHAT_TRUNK.SELECT_SERVICE_GROUP
			),
			this.state.routes.length ? React.createElement(
				'div',
				{ className: 'col-sm-3' },
				React.createElement(
					'select',
					{ className: 'form-control channel-routes', value: selectedRoute.oid, onChange: this._selectRoute },
					this._groupObjects(this.state.routes)
				)
			) : React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					'p',
					null,
					frases.CHAT_TRUNK.NO_SERVICE_GROUP
				)
			),
			React.createElement(
				'div',
				{ className: 'col-sm-1 text-center' },
				React.createElement(
					'strong',
					null,
					frases.OR
				)
			),
			this.props.type === 'Telephony' || this.props.type === 'Webcall' ? React.createElement(
				'div',
				{ className: 'col-sm-4 create-group-links' },
				React.createElement(
					'a',
					{ href: '#hunting/hunting', className: 'btn btn-link', onClick: this._createGroup },
					React.createElement('i', { className: 'fa fa-plus-circle' }),
					' ',
					frases.CHAT_TRUNK.CREATE_HUNTING_GROUP
				),
				React.createElement(
					'a',
					{ href: '#icd/icd', className: 'btn btn-link', onClick: this._createGroup },
					React.createElement('i', { className: 'fa fa-plus-circle' }),
					' ',
					frases.CHAT_TRUNK.CREATE_ICD_GROUP
				),
				React.createElement(
					'a',
					{ href: '#attendant/attendant', className: 'btn btn-link', onClick: this._createGroup },
					React.createElement('i', { className: 'fa fa-plus-circle' }),
					' ',
					frases.CHAT_TRUNK.CREATE_ATTENDANT
				)
			) : React.createElement(
				'div',
				{ className: 'col-sm-4 create-group-links' },
				React.createElement(
					'a',
					{ href: '#chatchannel/chatchannel', className: 'btn btn-link', onClick: this._createGroup },
					React.createElement('i', { className: 'fa fa-plus-circle' }),
					' ',
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
		onTokenReceived: React.PropTypes.func
		// addSteps: React.PropTypes.func,
		// nextStep: React.PropTypes.func,
		// highlightStep: React.PropTypes.func,
		// initSteps: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			routes: null,
			serivceInited: false,
			selectedRoute: null,
			validationError: false
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

	// componentDidMount: function() {
	// if(this.props.addSteps && !this.props.params.pageid) {
	// this.props.addSteps([{
	// 	element: '.sessiontimeout',
	// 	popover: {
	// 		title: 'Session timeout',
	// 		description: 'Set how long does the requests be allocated to the assigned user before it goes to the unified queue.',
	// 		position: 'top'
	// 	}
	// }]);

	// this.props.initSteps();
	// }
	// },

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

		if (!this._validateSettings(params)) {
			notify_about('error', this.props.frases.MISSEDFILED);
			return this.setState({ validationError: true });
		} else {
			this.setState({ validationError: false });
		}

		if (!params.pageid && params.type === 'Telephony') {
			this._buyDidNumber(params.properties, false, function (err, result) {

				if (err) return notify_about('error', err.message);

				params.pageid = params.pagename = result;
				params.properties = { number: result, id: result };

				this.props.setObject(params);
			}.bind(this));
		} else {
			this.props.setObject(params);
		}
	},

	_buyDidNumber(params, noConfirm, callback) {
		if (!params.area || !params.poid) return callback({ message: this.props.frases.CHAT_TRUNK.DID.NOTIFY_LOCATION_NOT_SELECTED });

		var thisObj = this;

		this.props.confirmPayment(params, noConfirm, function (result) {

			show_loading_panel();

			BillingApi.orderDid(params, function (err, response) {

				remove_loading_panel();

				if (err) {
					if (err.name === 'NO_PAYMENT_SOURCE' || err.name === 'authentication_required') {
						thisObj.props.updateBalance({ chargeAmount: params.chargeAmount, currency: params.currency }, function (err, result) {
							thisObj._buyDidNumber(params, true, callback);
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

	_removeObject: function () {
		var state = this.state;
		var type = state.type;
		var removeObject = this.props.removeObject;

		this.props.confirmRemoveObject(type, function () {
			show_loading_panel();

			if (type === 'Telephony' && state.params.properties.number) {
				// if(!state.params.properties.number) return console.error('number is not defined');

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

		this.setState({ params: params });
	},

	_selectRoute: function (route) {
		this.setState({ selectedRoute: route });
	},

	_setService: function (type) {
		if (this.state.type === type) return;

		var params = this.props.params;
		params.properties = params.pageid ? params.properties : {};
		this.setState({
			type: type,
			params: params
		});
	},

	_getServiceParams: function (type) {
		return this.props.services.reduce(function (prev, next) {
			if (next.id === type) prev = next;
			return prev;
		}, {});
	},

	_toMinutes: function (value) {
		return parseInt(value, 10) / 60;
	},

	_validateSettings: function (params) {
		var valid = true;
		switch (params.type) {
			case 'Telephony':
				valid = params.properties.number || params.properties.id || params.properties.poid !== undefined && params.properties.area !== undefined;
				break;
			case 'FacebookMessenger':
			case 'Viber':
			case 'Telegram':
				valid = !!params.properties.access_token;
				break;
			case 'WebChat':
				valid = params.properties.origin !== undefined;
				break;
			case 'Email':
				valid = params.properties.username && params.properties.hostname && params.properties.port;
				break;
			default:
				valid = true;
		}

		return valid;
	},

	render: function () {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var serviceParams = this._getServiceParams(type);
		var ServiceComponent = serviceParams.component;

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
				onStateChange: this.props.onStateChange && this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this.props.setObject && this._setObject,
				onCancel: this.state.params.pageid && this.props.removeObject ? this._removeObject : null
				// addSteps={this.props.addSteps}
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
									params.pageid ? frases.CHAT_TRUNK.SELECTED_SERVICE : frases.CHAT_TRUNK.SELECT_SERVICE
								),
								React.createElement(
									'div',
									{ className: 'col-sm-8' },
									this.props.services.map(function (item) {
										return React.createElement(TrunkServiceItemComponent, {
											key: item.id,
											selected: item.id === type,
											item: item,
											onClick: this._setService,
											disabled: params.pageid && item.id !== type
										});
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
								properties: params.properties,
								serviceParams: serviceParams,
								onChange: this._onPropsChange,
								onTokenReceived: this.props.onTokenReceived,
								isNew: !params.pageid,
								pageid: params.pageid
								// addSteps={this.props.addSteps}
								// nextStep={this.props.nextStep}
								// highlightStep={this.props.highlightStep}
								, getObjects: this.props.getObjects,
								validationError: this.state.validationError
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
										onChange: this._selectRoute
										// addSteps={this.props.addSteps} 
									})
								),
								React.createElement('hr', null),
								type !== 'Telephony' && type !== 'Webcall' && React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
										frases.CHAT_TRUNK.REPLY_TIMEOUT
									),
									React.createElement(
										'div',
										{ className: 'col-sm-3' },
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
										{ className: 'col-sm-3' },
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
		display: props.disabled ? "none" : "block",
		cursor: props.disabled ? 'default' : 'pointer'
	};

	function selectItem(e) {
		e.preventDefault();
		if (props.disabled) return;
		props.onClick(props.item.id);
	}

	return React.createElement(
		'div',
		{ className: 'chattrunk-service-cont' },
		React.createElement(
			'a',
			{
				href: '#',
				style: itemStyles,
				onClick: selectItem,
				className: "chattrunk-service-item " + (props.selected ? "selected" : ""),
				title: props.item.name
			},
			props.item.iconClass ? React.createElement('span', {
				className: props.item.iconClass,
				style: { width: "40px", height: "40px", color: "#333", padding: "5px 0" }
			}) : React.createElement('img', {
				src: props.item.icon,
				alt: props.item.name + ' icon',
				style: { width: "40px", height: "40px" }
			}),
			React.createElement(
				'h5',
				null,
				props.item.name
			)
		)
	);
}
function CustomerInfoItemComponent(props) {

	return React.createElement(
		'dl',
		{ className: 'dl-horizontal' },
		React.createElement(
			'dt',
			null,
			props.label
		),
		React.createElement(
			'dd',
			null,
			typeof props.value === 'object' ? props.value.join(', ') : props.value
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
				React.createElement(CustomerInfoComponent, { frases: this.props.frases, params: this.props.params, getPrivacyPrefs: this.props.getPrivacyPrefs, onDelete: this.props.onDelete })
			),
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					"a",
					{ href: exportLink, className: "btn btn-link", target: "_blank", onClick: this._onExport },
					frases.CUSTOMERS.EXPORT_BTN
				),
				this.props.onDelete && React.createElement(
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
		var cname = params.name ? params.name : params.usinfo && (params.usinfo.email || params.usinfo.phone);

		return React.createElement(ModalComponent, {
			title: cname,
			open: this.state.open,
			body: this._getBody()
		});
	}
});

CustomerInfoModalComponent = React.createFactory(CustomerInfoModalComponent);
var CustomerInfoComponent = React.createClass({
	displayName: "CustomerInfoComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		getPrivacyPrefs: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			prefsOpen: false,
			privacyPrefs: null
		};
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			prefsOpen: false,
			privacyPrefs: null
		});
	},

	_getPrivacyPrefs: function () {
		var state = this.state;
		if (state.prefsOpen) {
			this.setState({ prefsOpen: false });
			return;
		}

		if (!state.privacyPrefs) {
			this.props.getPrivacyPrefs(this.props.params.id, function (result) {
				this.setState({
					prefsOpen: true,
					privacyPrefs: result
				});
			}.bind(this));
		} else {
			this.setState({ prefsOpen: true });
		}
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var cname = params.name ? params.name : params.usinfo.email || params.usinfo.phone;

		params.usinfo = params.usinfo || {};

		return React.createElement(
			"div",
			null,
			React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.name, value: cname }),
			React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.created, value: moment(params.created).format('DD/MM/YY HH:mm:ss') }),
			React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.createdby, value: params.createdby }),
			React.createElement(CustomerInfoItemComponent, { label: frases.CUSTOMERS.FIELDS.consent, value: params.consent ? frases.CUSTOMERS.HAS_CONSENT_MSG : frases.CUSTOMERS.NO_CONSENT_MSG }),
			React.createElement(
				"div",
				{ className: "text-center" },
				React.createElement(
					"button",
					{ type: "button", className: "btn btn-link", onClick: this._getPrivacyPrefs },
					"Privacy Preferences"
				)
			),
			React.createElement("br", null),
			this.state.privacyPrefs && React.createElement(
				"div",
				{ className: "collapse" + (this.state.prefsOpen ? " in" : ""), id: "cus-priv-prefs" },
				React.createElement(CustomerPrivacyPrefs, { frases: frases, params: this.state.privacyPrefs })
			),
			React.createElement("hr", null),
			Object.keys(params.usinfo).map(function (key) {
				return React.createElement(CustomerInfoItemComponent, { key: key, label: frases.CUSTOMERS.FIELDS[key], value: params.usinfo[key] });
			})
		);
	}
});

CustomerInfoComponent = React.createFactory(CustomerInfoComponent);
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
			props.item.name ? props.item.name : props.item.usinfo && (props.item.usinfo.email || props.item.usinfo.phone)
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
			{ className: props.item.consent ? "text-success" : "text-muted" },
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
function CustomerPrivacyPrefs(props) {

	var frases = props.frases;
	var params = props.params;

	return React.createElement(
		"div",
		null,
		React.createElement(
			"dl",
			{ className: "dl-horizontal" },
			React.createElement(
				"dt",
				null,
				frases.CUSTOMERS.PRIVACY_PREFS.LAWFUL_BASIS
			),
			React.createElement(
				"dd",
				null,
				frases.CUSTOMERS.PRIVACY_PREFS.LAWFUL_BASES[params.basis ? params.basis.toString() : ""]
			)
		),
		React.createElement(
			"dl",
			{ className: "dl-horizontal" },
			React.createElement(
				"dt",
				null,
				frases.CUSTOMERS.PRIVACY_PREFS.CREATED_BY
			),
			React.createElement(
				"dd",
				null,
				params.userid
			)
		),
		React.createElement(
			"dl",
			{ className: "dl-horizontal" },
			React.createElement(
				"dt",
				null,
				frases.CUSTOMERS.PRIVACY_PREFS.FILE
			),
			React.createElement(
				"dd",
				null,
				React.createElement(
					"a",
					{ href: "/" + params.fileid, target: "_blanc" },
					params.fileid
				)
			)
		),
		React.createElement(
			"dl",
			{ className: "dl-horizontal" },
			React.createElement(
				"dt",
				null,
				frases.CUSTOMERS.PRIVACY_PREFS.CREATED
			),
			React.createElement(
				"dd",
				null,
				params.created ? new Date(params.created).toLocaleString() : ""
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
		importServices: React.PropTypes.array,
		openCustomerInfo: React.PropTypes.func,
		import: React.PropTypes.func
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
					React.createElement(FilterInputComponent, { frases: frases, items: params, onChange: this._onFilter }),
					this.props.import && this.props.importServices && this.props.importServices.length ? React.createElement(ImportUsersButtonsComponent, { frases: frases, services: this.props.importServices, onClick: this.props.import }) : null
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
var ChatchannelComponent = React.createClass({
	displayName: "ChatchannelComponent",


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
			filteredMembers: this.props.params.members
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
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
		this.setState({
			filteredMembers: items
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];
		var itemState = {};

		return React.createElement(
			"div",
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled,
				onStateChange: this.props.onStateChange && this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this.props.setObject && this._setObject,
				onCancel: this.props.removeObject
			}),
			React.createElement(GroupMembersComponent, { frases: frases, members: members, getExtension: this.props.getExtension, onAddMembers: this.props.onAddMembers, deleteMember: this.props.deleteMember })
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);
function CallsOverviewComponent(props) {

	// var data = props.data.graph;
	var data = props.data.stat;
	var frases = props.frases;

	console.log('CallsOverviewComponent: ', props.data);

	return React.createElement(
		"div",
		{ className: "row" },
		React.createElement(
			"div",
			{ className: "col-xs-6 col-sm-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-arrow-down", params: { index: data.inbounds.total, desc: frases.STATISTICS.INCOMING_CALLS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-sm-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-clock-o", params: { index: data.inbounds.duration, desc: frases.STATISTICS.TOTALDURATION, format: 'mm:ss' } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-sm-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-times", params: { index: data.inbounds.lost + "/" + (data.inbounds.total ? (data.inbounds.lost / data.inbounds.total * 100).toFixed(1) : 0) + "%", desc: frases.STATISTICS.LOSTCALLS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-sm-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-arrow-up", params: { index: data.outbounds.total, desc: frases.STATISTICS.OUTGOING_CALLS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-sm-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-clock-o", params: { index: data.outbounds.duration, desc: frases.STATISTICS.TOTALDURATION, format: 'mm:ss' } })
		)
	);
}
var DashboardComponent = React.createClass({
	displayName: 'DashboardComponent',

	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		fetchData: React.PropTypes.func,
		fetchSubscription: React.PropTypes.func,
		fetchCallingCredits: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			sub: null,
			credits: null,
			graphType: 'incoming',
			callsData: null,
			channelsData: null,
			callsFetchParams: {
				begin: moment().startOf('day').valueOf(),
				end: moment().endOf('day').valueOf(),
				interval: 3600 * 24 * 1000
			},
			channelsFetchParams: {
				begin: moment().startOf('day').valueOf(),
				end: moment().endOf('day').valueOf()
			}
		};
	},

	componentWillMount: function (props) {

		this._getCallsData(this.state.callsFetchParams, function (result) {
			this.setState({ callsData: result });
		}.bind(this));

		this._getChannelsData(this.state.channelsFetchParams, function (result) {
			this.setState({ channelsData: result });
		}.bind(this));

		if (this.props.options.mode === 0 && this.props.profile) {
			this.props.fetchSubscription(function (err, response) {
				if (err) return console.error(err);
				this.setState({ sub: extend({}, this.props.options, response.result) });
			}.bind(this));

			this.props.fetchCallingCredits(function (err, response) {
				if (err) return console.error(err);
				this.setState({ credits: response.result });
			}.bind(this));
		}
	},

	_getCallsData: function (params, callback) {
		var data = {};
		var fetchData = this.props.fetchData;

		// fetchData('getCallStatisticsGraph', params, function(result) {
		// data.graph = result;

		fetchData('getCallStatistics', { begin: params.begin, end: params.end }, function (result) {
			data.stat = result;

			callback(data);
		});
		// });	
	},

	_getChannelsData: function (params, callback) {
		this.props.fetchData('getActivityStatistics', params, function (result) {
			callback({ stat: result });
		});
	},

	_getPrevRange: function (range) {
		return {
			start: range.start - (range.end - range.start),
			end: range.start
		};
	},

	_getColumns: function (colname, data, match, params) {
		var col = [colname];
		var value = null;
		var convert = params ? params.convert : null;

		data.map(function (item) {
			for (var key in item) {
				if (key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
					value = item[key];

					if (convert === 'minutes') {
						value = parseFloat((value / 1000 / 60).toFixed(2));
					}

					col.push(value);
				}
			}

			// columns.push(col);
		});

		return col;
	},

	_onGraphTypeSelect: function (type) {
		this.setState({ graphType: type });
	},

	_getSubHeader: function (title, btnText, btnLink, btnAction) {
		return btnText ? React.createElement(
			'div',
			null,
			React.createElement(
				'span',
				null,
				title
			),
			' ',
			React.createElement(
				'a',
				{ href: btnLink, className: "btn btn-sm " + (btnAction ? "btn-default btn-action" : "btn-link") },
				btnText
			)
		) : React.createElement(
			'div',
			null,
			title
		);
	},

	render: function () {
		var frases = this.props.frases;
		var planId = this.state.sub && this.state.sub.plan ? this.state.sub.plan.planId : null;
		var showUpgradeBtn = planId && (planId === 'free' || planId === 'trial') ? true : false;

		return React.createElement(
			'div',
			null,
			this.props.profile && !this.props.profile.partnerid && planId ? React.createElement(
				PanelComponent,
				{
					'static': true,
					header: this._getSubHeader(frases.DASHBOARD.SUBSCRIPTION_PANEL.TITLE, showUpgradeBtn ? frases.DASHBOARD.SUBSCRIPTION_PANEL.ACTION_BTN : frases.BILLING.BILLING, '#billing', showUpgradeBtn ? true : false)
				},
				this.state.sub ? React.createElement(SubscriptionOverviewComponent, {
					frases: frases,
					data: this.state.sub,
					credits: this.state.credits
				}) : React.createElement(Spinner, null)
			) : null,
			React.createElement(
				PanelComponent,
				{
					'static': true,
					header: this._getSubHeader(frases.DASHBOARD.CHANNELS_PANEL.TITLE, frases.DASHBOARD.CHANNELS_PANEL.ACTION_BTN, '#channel_statistics')
				},
				this.state.channelsData ? React.createElement(ChannelsTotalsComponent, {
					frases: frases,
					data: this.state.channelsData }) : React.createElement(Spinner, null)
			),
			React.createElement(
				PanelComponent,
				{
					'static': true,
					header: this._getSubHeader(frases.DASHBOARD.CALLS_PANEL.TITLE, frases.DASHBOARD.CALLS_PANEL.ACTION_BTN, '#statistics')
				},
				this.state.callsData ? React.createElement(CallsOverviewComponent, {
					frases: frases,
					onGraphTypeSelect: this._onGraphTypeSelect,
					getColumns: this._getColumns,
					graphType: this.state.graphType,
					data: this.state.callsData
				}) : React.createElement(Spinner, null)
			)
		);
	}
});

DashboardComponent = React.createFactory(DashboardComponent);
function SubscriptionOverviewComponent(props) {
	var data = props.data;
	var plan = data.plan;
	var frases = props.frases;
	var nextBillingDate = plan.planId === 'trial' ? data.trialExpires : data.nextBillingDate;

	console.log('SubscriptionOverviewComponent: ', props, data);

	return React.createElement(
		'div',
		{ className: 'row' },
		React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: plan.name, desc: frases.BILLING.CURRENT_PLAN } })
		),
		plan.planId !== 'free' ? React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: moment(nextBillingDate).format('DD/MM/YY'), desc: plan.planId === 'trial' ? frases.BILLING.TRIAL_EXPIRES.toUpperCase() : frases.BILLING.NEXT_CHARGE } })
		) : null,
		React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.users + "/" + data.maxusers, desc: frases.BILLING.AVAILABLE_LICENSES.USERS } })
		),
		React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: convertBytes(data.storesize, 'Byte', 'GB').toFixed(1) + "/" + convertBytes(data.storelimit, 'Byte', 'GB').toFixed(1), desc: frases.BILLING.AVAILABLE_LICENSES.STORAGE } })
		),
		React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: data.maxlines, desc: frases.BILLING.AVAILABLE_LICENSES.LINES } })
		),
		React.createElement(
			'div',
			{ className: 'col-xs-6 col-md-2' },
			React.createElement(SingleIndexAnalyticsComponent, { params: { index: (props.credits ? props.credits.balance : 0).toFixed(1), desc: frases.BILLING.CALL_CREDITS + ', ' + plan.currency } })
		)
	);
}
var DeveloperComponent = React.createClass({
	displayName: "DeveloperComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			json: "",
			messages: [],
			apikey: ""
		};
	},

	// componentWillMount: function() {

	// },

	// componentWillReceiveProps: function(props) {

	// },

	_onChange: function (e) {
		var target = e.target;
		var state = extend({}, this.state);
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		state[target.name] = value;

		this.setState(state);
	},

	_onSubmit: function (e) {},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			PanelComponent,
			null,
			React.createElement(
				"form",
				{ className: "form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ className: "control-label col-sm-4" },
						"Select API Key"
					),
					React.createElement(
						"div",
						{ className: "col-sm-4" },
						React.createElement(
							"select",
							{ name: "apikey", className: "form-control col-sm-4", value: this.state.apikey, onChange: this._onChange },
							this.props.params.apikeys.map(function (item) {
								return React.createElement(
									"option",
									{ key: item.name, value: item.name },
									item.name
								);
							})
						)
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"div",
						{ className: "col-sm-6" },
						React.createElement("textarea", { className: "form-control", style: { width: "100%", height: "400px" }, placeholder: "Enter a JSON string..." }),
						React.createElement("br", null),
						React.createElement(
							"button",
							{ type: "submit", className: "btn btn-success" },
							"Send a message"
						)
					),
					React.createElement(
						"div",
						{ className: "col-sm-6" },
						React.createElement("textarea", { className: "form-control", style: { width: "100%", height: "400px" }, placeholder: "Response from the server..." })
					)
				)
			)
		);
	}
});

DeveloperComponent = React.createFactory(DeveloperComponent);
var DragAndDropComponent = React.createClass({
	displayName: 'DragAndDropComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onErrorState: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			errors: [],
			fileDragged: false,
			file: null,
			filename: null,
			fileStr: null,
			allowedTypes: [],
			maxSize: 5000000
		};
	},

	componentWillMount: function () {
		var state = extend({}, this.state);

		if (this.props.params) {
			state = extend(state, this.props.params);
			this.setState(state);
		}
	},

	_setErrorState: function (errors) {
		this.setState({ errors: errors, file: null, fileStr: null });
		if (this.props.onErrorState) this.props.onErrorState(errors);
	},

	_checkErrorState: function (file) {
		var errors = [];
		var fileExt = this._getFileExtension(file.name);

		if (file && this.state.allowedTypes.length && this.state.allowedTypes.indexOf(file.type) === -1 && this.state.allowedTypes.indexOf(fileExt) === -1) errors.push('wrongFormat');
		if (file && file.size > this.state.maxSize) errors.push('wrongSize');
		return errors;
	},

	_onFileDragOver: function (e) {

		this.setState({ fileDragged: true });
		e.preventDefault();
	},

	_onFileDragEnter: function (e) {

		this.setState({ fileDragged: true });
	},

	_onFileDragLeave: function () {
		this.setState({ fileDragged: false });
	},

	_onFileDrop: function (e) {
		e.preventDefault();
		var file = null;
		var errors = [];

		if (e.dataTransfer.items) {
			file = e.dataTransfer.items[0];
			file = file.kind === 'file' ? file.getAsFile() : null;
		} else {
			file = e.dataTransfer.files[0];
		}

		if (file) {
			errors = this._checkErrorState(file);
			if (errors.length) this._setErrorState(errors);else {
				this.setState({ file: file, filename: file.name, errors: [] });
				this.props.onChange(file);
			}
		}

		this._removeDragData(e);
		this._onFileDragLeave();
	},

	_onFileSelect: function (params) {
		// var input = e.target;
		// var filelist = input.files;
		// var file = filelist[0];
		var file = params.file;

		this.props.onChange(file);
		this.setState({ file: file, filename: file.name });
	},

	_removeDragData: function (e) {
		if (e.dataTransfer.items) {
			e.dataTransfer.items.clear();
		} else {
			e.dataTransfer.clearData();
		}
	},

	_getFileExtension: function (fileName) {
		return '.' + fileName.split('.')[1];
	},

	render: function () {
		var frases = this.props.frases;
		var touchDevice = isTouchDevice();

		return React.createElement(
			'div',
			null,
			touchDevice ? React.createElement(FileUpload, { frases: frases, onChange: this._onFileSelect, accept: this.state.allowedTypes.join(',') }) : React.createElement(
				'div',
				{
					className: "dragndrop-area " + (this.state.fileDragged ? 'dragged' : ''),
					onDrop: this._onFileDrop,
					onDragOver: this._onFileDragOver,
					onDragEnter: this._onFileDragEnter,
					onDragLeave: this._onFileDragLeave
				},
				React.createElement(
					'p',
					null,
					this.state.filename ? this.state.filename : this.state.fileDragged ? frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_1 : frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_2
				),
				React.createElement(
					'p',
					null,
					React.createElement(
						'strong',
						null,
						'---'
					)
				),
				React.createElement(FileUpload, { frases: frases, accept: this.state.allowedTypes.join(','), onChange: this._onFileSelect, options: { noInput: true } })
			),
			this.state.errors.length ? React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12', style: { margin: "10px 0" } },
					this.state.errors.map(function (item) {
						return React.createElement(
							'p',
							{ key: item, className: 'text-danger' },
							frases.IMPORT_DATA.ERRORS[item]
						);
					})
				)
			) : null
		);
	}

});

DragAndDropComponent = React.createFactory(DragAndDropComponent);
function ExtensionAuthorizationComponent(props) {

	var frases = props.frases;

	return React.createElement(
		"div",
		{ className: "col-xs-12" },
		React.createElement(
			"form",
			{ className: "form-horizontal", onChange: props.onChange },
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "control-label col-sm-4" },
					frases.DOMAIN
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"p",
						{ className: "form-control-static" },
						window.location.host
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "control-label col-sm-4" },
					frases.USERNAME
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"p",
						{ className: "form-control-static" },
						props.params.login
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "control-label col-sm-4" },
					frases.PASSWORD
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(PasswordComponent, { frases: frases, name: "password", value: props.params.password, onChange: props.onChange, generatePassword: props.generatePassword })
				)
			),
			React.createElement(
				"div",
				{ className: "form-group " + (props.params.kind === 'user' ? 'hidden' : '') },
				React.createElement(
					"label",
					{ className: "control-label col-sm-4" },
					frases.PIN
				),
				React.createElement(
					"div",
					{ className: "col-sm-4" },
					React.createElement("input", { type: "text", className: "form-control", name: "pin", value: props.params.pin, onChange: props.onChange })
				)
			),
			React.createElement(
				"div",
				{ className: "form-group " + (props.params.kind !== 'user' ? 'hidden' : '') },
				React.createElement(
					"div",
					{ className: "alert alert-info", role: "alert" },
					React.createElement(
						"p",
						{ className: "text-center" },
						frases.LIGHTBOX.USER_AUTH_DATA.BODY,
						" ",
						React.createElement(
							"a",
							{ href: "https://ringotel.co/download", target: "_blank", className: "alert-link" },
							frases.LIGHTBOX.USER_AUTH_DATA.ACTION_BTN_TEXT
						)
					)
				)
			)
		)
	);
}
var ExtensionComponent = React.createClass({
	displayName: 'ExtensionComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groups: React.PropTypes.array,
		generatePassword: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		isUserAccount: React.PropTypes.bool,
		onAvatarChange: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			groups: []
		};
	},

	getInitialState: function () {
		return {
			params: {},
			file: null,
			avatarUrl: "",
			activeTab: this.props.isUserAccount ? 'features' : 'auth',
			defaultPermissions: [{ name: 'statistics', grant: 0 }, { name: 'records', grant: 0 }, { name: 'customers', grant: 0 }, { name: 'users', grant: 0 }, { name: 'equipment', grant: 0 }, { name: 'channels', grant: 0 }]
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params
		});

		this._loadAvatar(window.location.protocol + '//' + window.location.host + "/$AVATAR$?userid=" + this.props.params.userid);
	},

	_onSubmit: function () {
		this.props.onSubmit({ params: this.state.params, file: this.state.file });
	},

	_onPermsChange: function (perms) {
		var params = extend({}, this.state.params);
		params.permissions = perms;
		this.setState({ params: params });
		this.props.onChange(params);
	},

	_onFeaturesChange: function (e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if (target.name === 'huntingnumbers') value = value.split(',');
		params.features[target.name] = type === 'number' && typeof value !== 'number' ? parseFloat(value) : value;

		this.setState({ params: params });
		this.props.onChange(params);
	},

	_onChange: function (e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if (target.name === 'storelimit') value = this.props.convertBytes(value, 'GB', 'Byte');

		params[target.name] = type === 'number' && typeof value !== 'number' ? parseFloat(value) : value;

		this.setState({ params: params });
		this.props.onChange(params);
	},

	_switchTab: function (e) {
		e.preventDefault();
		var tab = e.target.dataset.tab;
		this.setState({ activeTab: tab });
	},

	// _onImgError: function() {
	// 	Utils.debug('_onImgError: ');
	// 	this.setState({ avatarUrl: "/badmin/images/avatar.png" });
	// },

	_onUpload: function (params) {
		var input = params.el;

		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				this.setState({ avatarUrl: e.target.result, file: input.files[0] });
				this.props.onAvatarChange({ file: input.files[0] });
			}.bind(this);

			reader.readAsDataURL(input.files[0]);
		}
	},

	_loadAvatar: function (url) {
		var xhr = new XMLHttpRequest();

		xhr.open("GET", url, true);

		xhr.responseType = "arraybuffer";

		xhr.onload = function (e) {
			Utils.debug('onload', e);
			if (e.target.status >= 300) return false;
			// Obtain a blob: URL for the image data.
			var arrayBufferView = new Uint8Array(e.target.response);
			var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
			var urlCreator = window.URL || window.webkitURL;
			var imageUrl = urlCreator.createObjectURL(blob);
			this.setState({ avatarUrl: imageUrl });
		}.bind(this);

		xhr.send();
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var permissions = params.permissions || this.state.defaultPermissions;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row', style: { padding: "20px 0" } },
				React.createElement(
					'div',
					{ className: 'col-sm-4 text-center' },
					React.createElement('div', { className: 'avatar-cont', style: this.state.avatarUrl ? { backgroundImage: "url(" + this.state.avatarUrl + ")" } : {} }),
					React.createElement(
						'div',
						{ style: { padding: "10px 0" } },
						React.createElement(FileUpload, { frases: frases, options: { noInput: true }, onChange: this._onUpload, accept: 'image/*' })
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement(
						'form',
						{ className: 'form', onChange: this._onChange },
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								null,
								frases.NAME
							),
							React.createElement('input', { type: 'text', name: 'name', className: 'form-control', placeholder: 'James Douton', value: params.name })
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								null,
								frases.DISPLAY
							),
							React.createElement('input', { type: 'text', name: 'display', className: 'form-control', placeholder: 'James Douton - IT Department', value: params.display })
						),
						React.createElement(
							'div',
							{ className: "form-group " + (params.kind !== 'user' ? 'hidden' : '') },
							React.createElement(
								'label',
								null,
								frases.GROUP
							),
							React.createElement(
								'select',
								{ name: 'groupid', className: 'form-control', value: params.groupid, disabled: this.props.isUserAccount },
								this.props.groups.map(function (item) {
									return React.createElement(
										'option',
										{ key: item.oid, value: item.oid },
										item.name
									);
								})
							)
						),
						React.createElement(
							'div',
							{ className: "row " + (params.kind !== 'user' ? 'hidden' : '') },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-xs-12' },
									frases.STORAGE.MAXSIZE
								),
								React.createElement(
									'div',
									{ className: 'col-sm-8' },
									React.createElement(
										'div',
										{ className: 'input-group' },
										React.createElement(
											'span',
											{ className: 'input-group-addon', style: { backgroundColor: "transparent" } },
											this.props.convertBytes(params.storesize, 'Byte', 'GB').toFixed(2),
											' ',
											React.createElement(
												'strong',
												{ style: { margin: "0 10px" } },
												'/'
											)
										),
										React.createElement('input', { type: 'number', name: 'storelimit', className: 'form-control', min: '0', step: '1', value: this.props.convertBytes(params.storelimit, 'Byte', 'GB').toFixed(2), disabled: this.props.isUserAccount }),
										React.createElement(
											'span',
											{ className: 'input-group-addon', style: { backgroundColor: "transparent" } },
											'GB'
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
					'ul',
					{ id: 'ext-tabs', className: 'nav nav-tabs nav-justified custom-nav-tabs', role: 'tablist' },
					!this.props.isUserAccount && React.createElement(
						'li',
						{ role: 'presentation', className: this.state.activeTab === "auth" ? "active" : "" },
						React.createElement(
							'a',
							{ href: '#', role: 'tab', 'data-tab': 'auth', onClick: this._switchTab },
							frases.AUTHORIZATION
						)
					),
					React.createElement(
						'li',
						{ role: 'presentation', className: this.state.activeTab === "features" ? "active" : "" },
						React.createElement(
							'a',
							{ href: '#', role: 'tab', 'data-tab': 'features', onClick: this._switchTab },
							frases.SETTINGS.SETTINGS
						)
					),
					params.kind === 'user' && params.permissions && React.createElement(
						'li',
						{ role: 'presentation', className: this.state.activeTab === "permissions" ? "active" : "" },
						React.createElement(
							'a',
							{ href: '#', role: 'tab', 'data-tab': 'permissions', onClick: this._switchTab },
							frases.PERMISSIONS.PERMISSIONS
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'tab-content clearfix', style: { padding: "20px 0" } },
					!this.props.isUserAccount && React.createElement(
						'div',
						{ className: "tab-pane " + (this.state.activeTab === "auth" ? "active" : ""), role: 'tabpanel' },
						React.createElement(ExtensionAuthorizationComponent, { frases: frases, params: params, onChange: this._onChange, generatePassword: this.props.generatePassword })
					),
					React.createElement(
						'div',
						{ className: "tab-pane " + (this.state.activeTab === "features" ? "active" : ""), role: 'tabpanel' },
						React.createElement(ExtensionSettingsComponent, { frases: frases, features: params.features, onChange: this._onFeaturesChange })
					),
					params.kind === 'user' && params.permissions && React.createElement(
						'div',
						{ className: "tab-pane " + (this.state.activeTab === "permissions" ? "active" : ""), role: 'tabpanel' },
						React.createElement(ExtensionPermissionsComponent, { frases: frases, permissions: permissions, onChange: this._onPermsChange })
					)
				)
			),
			this.props.onSubmit && React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'button',
						{ className: 'btn btn-success', role: 'button', onClick: this._onSubmit },
						frases.SUBMIT
					)
				)
			)
		);
	}
});

ExtensionComponent = React.createFactory(ExtensionComponent);
function ExtensionPermissionsComponent(props) {

	var frases = props.frases;
	// var defaultPerms = [
	// 	{ name: 'statistics', grant: 0 },
	// 	{ name: 'records', grant: 0 },
	// 	{ name: 'customers', grant: 0 },
	// 	{ name: 'users', grant: 0 },
	// 	{ name: 'equipment', grant: 0 },
	// 	{ name: 'channels', grant: 0 }
	// ];
	var permsList = [{ name: 'none', grant: 0 }, { name: 'read', grant: 1 }, { name: 'read_write', grant: 3 }, { name: 'read_write_create', grant: 7 }, { name: 'all_operations', grant: 15 }];
	var perms = props.permissions;
	// var perms = (props.permissions && props.permissions.length) ? props.permissions : defaultPerms;
	// var permOptions = permsList.map(function(item) { return <option key={item.name} value={item.grant}>{frases.PERMISSIONS.LEVELS[item.name] || item.name}</option> });

	function changePermission(e) {
		var name = e.target.name;
		var value = e.target.value;
		var newPerms = perms.map(function (item) {
			if (item.name === name) item.grant = parseInt(value, 10);
			return item;
		});

		props.onChange(newPerms);
	}

	return React.createElement(
		'div',
		{ className: 'col-xs-12' },
		React.createElement(
			'table',
			{ className: 'table' },
			React.createElement(
				'tbody',
				null,
				perms.map(function (perm) {
					if (perm.name.match('^(chatchannel|chattrunk|icd|unit|hunting|phone|user)$')) return null;
					return React.createElement(
						'tr',
						{ key: perm.name },
						React.createElement(
							'td',
							null,
							frases.PERMISSIONS.TYPES[perm.name] || perm.name
						),
						React.createElement(
							'td',
							{ className: 'col-sm-4' },
							React.createElement(
								'select',
								{ className: 'form-control', value: perm.grant, name: perm.name, onChange: changePermission },
								permsList.map(function (item) {
									if (perm.name.match('statistics|records') && item.name.match('read_write|read_write_create|all_operations')) return null;else return React.createElement(
										'option',
										{ key: item.name, value: item.grant },
										frases.PERMISSIONS.LEVELS[item.name] || item.name
									);
								})
							)
						)
					);
				})
			)
		)
	);
}
function ExtensionSettingsComponent(props) {

	var frases = props.frases;
	// var isHuntingEnabled = (!props.features.huntnreg && !props.features.huntbusy && !props.features.huntnans);

	return React.createElement(
		"div",
		{ className: "col-xs-12" },
		React.createElement(
			"form",
			{ className: "form-horizontal " + (props.features.fwdall === undefined ? 'hidden' : ''), onChange: props.onChange },
			React.createElement(
				"fieldset",
				{ style: { marginTop: "15px" } },
				React.createElement(
					"legend",
					null,
					frases.FORWARDING.FORWARDING
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.FORWARDING.UNCONDITIONAL
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement(
							"span",
							{ className: "input-group-addon" },
							React.createElement("input", { type: "checkbox", name: "fwdall", checked: props.features.fwdall })
						),
						React.createElement("input", { type: "text", name: "fwdallnumber", className: "form-control", value: props.features.fwdallnumber })
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.FORWARDING.UNREGISTERED
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement(
							"span",
							{ className: "input-group-addon" },
							React.createElement("input", { type: "checkbox", name: "fwdnreg", checked: props.features.fwdnreg })
						),
						React.createElement("input", { type: "text", name: "fwdnregnumber", className: "form-control", value: props.features.fwdnregnumber })
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.FORWARDING.BUSY
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement(
							"span",
							{ className: "input-group-addon" },
							React.createElement("input", { type: "checkbox", name: "fwdbusy", checked: props.features.fwdbusy })
						),
						React.createElement("input", { type: "text", name: "fwdbusynumber", className: "form-control", value: props.features.fwdbusynumber })
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.FORWARDING.NOANSWER
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement(
							"span",
							{ className: "input-group-addon" },
							React.createElement("input", { type: "checkbox", name: "fwdnans", checked: props.features.fwdnans })
						),
						React.createElement("input", { type: "text", name: "fwdnansnumber", className: "form-control", value: props.features.fwdnansnumber })
					)
				)
			),
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.FORWARDING.NOANSWERTOUT
				),
				React.createElement(
					"div",
					{ className: "col-sm-4" },
					React.createElement(
						"div",
						{ className: "input-group" },
						React.createElement("input", { type: "text", name: "fwdtimeout", className: "form-control", value: props.features.fwdtimeout, disabled: !props.features.fwdnans }),
						React.createElement(
							"span",
							{ className: "input-group-addon" },
							frases.SECONDS
						)
					)
				)
			)
		),
		React.createElement(
			"form",
			{ className: "form-horizontal", onChange: props.onChange },
			React.createElement(
				"fieldset",
				{ style: { marginTop: "15px" } },
				React.createElement(
					"legend",
					null,
					frases.FUNCTIONS.FUNCTIONS
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.callwaiting === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "callwaiting", checked: props.features.callwaiting }),
							" ",
							frases.FUNCTIONS.CALLWAITING
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.recording === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "recording", checked: props.features.recording }),
							" ",
							frases.FUNCTIONS.RECORD_CALLS
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.voicemail === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "voicemail", checked: props.features.voicemail }),
							" ",
							frases.FUNCTIONS.VOICEMAIL
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.monitordeny === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "monitordeny", checked: props.features.monitordeny }),
							" ",
							frases.FUNCTIONS.MONITORDENY
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.busyoverdeny === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "busyoverdeny", checked: props.features.busyoverdeny }),
							" ",
							frases.FUNCTIONS.BUSYOVERDENY
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.pickupdeny === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "pickupdeny", checked: props.features.pickupdeny }),
							" ",
							frases.FUNCTIONS.PICKUPDENY
						)
					)
				),
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8 " + (props.features.lock === undefined ? 'hidden' : '') },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "lock", checked: props.features.lock }),
							" ",
							frases.FUNCTIONS.LOCK
						)
					)
				)
			)
		)
	);
}
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
function ImportUsersButtonsComponent(props) {

	function onClick(service, e) {
		e.preventDefault();
		props.onClick(service);
	}

	return React.createElement(
		"div",
		{ className: "btn-group", style: { marginBottom: "10px" } },
		React.createElement(
			"button",
			{ type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
			React.createElement("i", { className: "fa fa-cloud-download fa-fw" }),
			" ",
			props.frases.IMPORT,
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
		kind: React.PropTypes.string,
		withGroups: React.PropTypes.bool,
		getExtension: React.PropTypes.func,
		onAddMembers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		doSort: React.PropTypes.bool,
		activeServices: React.PropTypes.array,
		onImportUsers: React.PropTypes.func,
		onSort: React.PropTypes.func
		// addSteps: React.PropTypes.func
	},

	componentWillMount: function () {
		this.setState({
			filteredMembers: this.props.members ? [].concat(this.props.members) : []
		});
	},

	// componentDidMount: function() {
	// 	var frases = this.props.frases;

	// 	if(this.props.addSteps) {
	// 		this.props.addSteps([{
	// 			element: '#new-users-btns .btn-primary',
	// 			popover: {
	// 				title: frases.GET_STARTED.CREATE_USERS.STEPS["1"].TITLE,
	// 				description: frases.GET_STARTED.CREATE_USERS.STEPS["1"].DESC,
	// 				position: 'bottom',
	// 				showButtons: false
	// 			}
	// 		}]);
	// 	}
	// },

	componentWillReceiveProps: function (props) {
		this.setState({
			filteredMembers: props.members ? [].concat(props.members) : []
		});
	},

	_getInfoFromState: function (state, group) {
		var status, className;

		if (state == 1) {
			// Idle
			// className = 'success';
			className = 'info';
		} else if (state == 8) {
			// Connected
			// className = 'connected';
			className = 'danger';
		} else if (state == 2 || state == 5) {
			// Away
			className = 'warning';
		} else if (state == 0 || state == -1 && group) {
			// Offline
			// state = '';
			className = 'default';
		} else if (state == 3) {
			// DND
			className = 'danger';
		} else if (state == 6 || state == 7) {
			// Calling
			className = 'danger';
		} else {
			// 
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

		if (kind === 'user') icon = 'icon-contact';else if (kind === 'phone') icon = 'icon-landline';else if (kind === 'chatchannel') icon = 'icon-headset_mic';else if (kind === 'hunting') icon = 'icon-headset_mic';else if (kind === 'icd') icon = 'icon-headset_mic';else if (kind === 'selector') icon = 'icon-headset_mic';else if (kind === 'attendant') icon = 'fa fa-fw fa-sitemap';else if (kind === 'trunk') icon = 'icon-dialer_sip';else if (kind === 'chattrunk') icon = 'icon-perm_phone_msg';else if (kind === 'timer') icon = 'fa fa-fw fa-clock-o';else if (kind === 'routes') icon = 'fa-arrows';else if (kind === 'channel') icon = 'fa-rss';else if (kind === 'conference') icon = 'icon-call_split';else if (kind === 'pickup') icon = 'icon-phone_missed';else if (kind === 'cli') icon = 'icon-fingerprint';

		return icon;
	},

	_onFilter: function (items) {
		this.setState({
			filteredMembers: [].concat(items)
		});
	},

	_tableRef: function (el) {
		if (this.props.sortable) return new Sortable(el);
	},

	_reorderMembers: function (members, order) {
		var newArray = [];
		newArray.length = members.length;

		members.forEach(function (item, index, array) {
			newArray[order.indexOf(item.oid)] = window.extend({}, item);
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
		var filteredMembers = this.props.doSort ? sortByKey(this.state.filteredMembers, 'number') : this.state.filteredMembers;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6', id: 'new-users-btns' },
					this.props.onAddMembers && React.createElement(
						'button',
						{ type: 'button', role: 'button', className: 'btn btn-primary', style: { margin: "0 10px 10px 0" }, onClick: this.props.onAddMembers },
						React.createElement('i', { className: 'fa fa-user-plus' }),
						' ',
						this.props.kind === 'users' ? frases.CREATE_NEW_USER : frases.ADD_USER
					),
					this.props.activeServices && this.props.activeServices.length ? React.createElement(ImportUsersButtonsComponent, { frases: frases, services: this.props.activeServices, onClick: this._onImportFromService }) : null
				),
				this.props.doSort ? React.createElement(
					'div',
					{ className: 'col-sm-6' },
					React.createElement(FilterInputComponent, { items: members, onChange: this._onFilter })
				) : null
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
							{ className: 'panel-body', style: { padding: "0" } },
							React.createElement(
								'div',
								{ className: 'table-responsive' },
								React.createElement(
									'table',
									{ className: "table table-hover" + (filteredMembers.length && this.props.sortable ? "" : ""), id: 'group-extensions', style: { marginBottom: "0" } },
									React.createElement(
										'tbody',
										{ ref: this._tableRef, onTouchEnd: this._onSortEnd, onDragEnd: this._onSortEnd },
										filteredMembers.length ? filteredMembers.map(function (item, index) {

											return React.createElement(GroupMemberComponent, {
												key: item.oid,
												sortable: this.props.sortable,
												item: item,
												icon: this._getKindIcon(item.kind),
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
			React.createElement('span', { className: "fa " + props.icon })
		),
		React.createElement(
			'td',
			{ 'data-cell': 'status', style: { "textAlign": "left" } },
			React.createElement(
				'span',
				{ className: "label label-" + itemState.className },
				itemState.rstatus
			),
			' ',
			item.logged ? React.createElement(
				'span',
				{ className: 'label label-success' },
				React.createElement('i', { className: 'fa fa-fw fa-phone' })
			) : ''
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
			props.deleteMember && React.createElement(
				'button',
				{ className: 'btn btn-link btn-danger btn-md', onClick: deleteMember },
				React.createElement('i', { className: 'fa fa-trash' })
			)
		)
	);
}
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
	displayName: "GSCreateChannelsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		// group: React.PropTypes.object,
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
						React.createElement("img", { src: "/badmin/images/omnichannel.png" })
					),
					React.createElement(GSStepNavComponent, { onPrev: this.props.prevStep, prevText: frases.GET_STARTED.DOWNLOAD_APPS.TITLE }),
					React.createElement(
						"div",
						{ className: "gs-step-body" },
						React.createElement(
							"h3",
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
		// group: React.PropTypes.object,
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
		// group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func,
		sendLinks: React.PropTypes.func
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
					React.createElement(GSStepNavComponent, { onPrev: this.props.prevStep, onNext: this._nextStep, prevText: frases.GET_STARTED.CREATE_USERS.TITLE, nextText: frases.GET_STARTED.CONNECT_CHANNELS.TITLE }),
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
						),
						React.createElement(
							"div",
							{ className: "text-center" },
							React.createElement(GSDownloadLinksComponent, null)
						)
					),
					React.createElement(
						"div",
						{ className: "gs-step-footer" },
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
function GSDownloadLinksComponent(props) {

	return React.createElement(
		"div",
		{ className: "gs-download-links" },
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"a",
					{ href: "https://play.google.com/store/apps/details?id=smile.ringotel", target: "_blanc" },
					React.createElement("img", { src: "/badmin/images/links/google-play.png", alt: "Android app" })
				)
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"a",
					{ href: "https://itunes.apple.com/ie/app/ringotel/id1176246999?mt=8", target: "_blanc" },
					React.createElement("img", { src: "/badmin/images/links/app-store.png", alt: "iOS app" })
				)
			)
		),
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"a",
					{ href: "https://ringotel.co/downloads/ringotel.exe", target: "_blanc" },
					React.createElement("img", { src: "/badmin/images/links/windows.png", alt: "Windows app" })
				)
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"a",
					{ href: "https://ringotel.co/downloads/ringotel.dmg", target: "_blanc" },
					React.createElement("img", { src: "/badmin/images/links/mac-os.png", alt: "macOS app" })
				)
			)
		)
	);
}
var GSModalComponent = React.createClass({
	displayName: "GSModalComponent",


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		initialStep: React.PropTypes.number,
		options: React.PropTypes.object,
		onClose: React.PropTypes.func,
		sendLinks: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			// step: 0,
			// components: [],
			// profile: {},
			open: true
			// init: false
		};
	},

	// componentWillMount: function() {
	// 	this.setState({
	// 		components: [
	// 			GSCreateUsersComponent,
	// 			GSDownloadAppsComponent,
	// 			GSCreateChannelsComponent
	// 		]
	// 	});

	// 	this.setState({ 
	// 		init: true,
	// 		step: this.props.initialStep
	// 	});

	// },

	componentWillReceiveProps: function (props) {
		var open = props.open === false ? false : true;

		this.setState({
			open: open
			// step: this.props.initialStep
		});
	},

	// _nextStep: function(num) {
	// 	var step = this.state.step;
	// 	var next = step+1;
	// 	console.log('nextStep >>>', next);
	// 	if(!this.state.components[next]) return;
	// 	this.setState({
	// 		step: num || next
	// 	});
	// },

	// _prevStep: function() {
	// 	var step = this.state.step;
	// 	var next = step-1;
	// 	console.log('<<< prevStep', next);
	// 	if(!this.state.components[next]) return;
	// 	this.setState({
	// 		step: next
	// 	});
	// },

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
		return React.createElement(GSStepsComponent, {
			frases: this.props.frases,
			profile: this.props.profile,
			initialStep: this.props.initialStep,
			options: this.props.options,
			onClose: this._closeModal,
			sendLinks: this.props.sendLinks
		});
	},

	render: function () {
		var body = this._getBody();

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
		{ href: "#", className: "btn btn-action init-gs-btn", onClick: onClick },
		React.createElement("i", { className: "fa fa-play-circle fa-fw" }),
		React.createElement(
			"span",
			null,
			props.frases.GET_STARTED.TITLE
		)
	);
}
var GSSendDownloadLinksComponent = React.createClass({
	displayName: "GSSendDownloadLinksComponent",


	propTypes: {
		frases: React.PropTypes.object,
		onClick: React.PropTypes.func
	},

	getInitialState: function () {
		email: "";
	},

	_onChange: function (e) {
		this.setState({
			email: e.target.value
		});
	},

	_onClick: function () {
		this.props.onClick(this.state.email);
		this.setState({
			email: ""
		});
	},

	render: function () {
		return React.createElement(
			"div",
			{ className: "input-group", style: { maxWidth: "80%", margin: "auto" } },
			React.createElement("input", { type: "text", className: "form-control input-lg", onChange: this._onChange, placeholder: "Enter email", "aria-label": "Enter email" }),
			React.createElement(
				"div",
				{ className: "input-group-btn" },
				React.createElement(
					"button",
					{ className: "btn btn-lg btn-primary", onClick: this._onClick },
					"Send links"
				)
			)
		);
	}

});

GSSendDownloadLinksComponent = React.createFactory(GSSendDownloadLinksComponent);
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
function GSStepNavComponent(props) {

	return React.createElement(
		"div",
		{ className: "gs-step-nav clearfix" },
		props.onPrev && props.prevText && React.createElement(
			"a",
			{ href: "#", className: "pull-left", onClick: props.onPrev },
			React.createElement("span", { className: "fa fa-arrow-left" }),
			" ",
			props.prevText
		),
		props.onNext && props.nextText && React.createElement(
			"a",
			{ href: "#", className: "pull-right", onClick: props.onNext },
			props.nextText,
			" ",
			React.createElement("span", { className: "fa fa-arrow-right" })
		)
	);
}
var GSStepsComponent = React.createClass({
	displayName: "GSStepsComponent",


	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		initialStep: React.PropTypes.number,
		options: React.PropTypes.object,
		onClose: React.PropTypes.func,
		sendLinks: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			step: 0,
			components: [GSCreateUsersComponent, GSDownloadAppsComponent, GSCreateChannelsComponent],
			profile: {},
			open: true,
			init: false
		};
	},

	componentWillMount: function () {
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
		if (!this.state.components[next]) return;
		this.setState({
			step: num || next
		});
	},

	_prevStep: function () {
		var step = this.state.step;
		var next = step - 1;
		if (!this.state.components[next]) return;
		this.setState({
			step: next
		});
	},

	render: function () {
		var Component = this.state.components[this.state.step];

		return React.createElement(
			GSStepComponent,
			null,
			this.state.init ? React.createElement(Component, {
				frases: this.props.frases,
				profile: this.state.profile
				// group={this.state.group} 
				, nextStep: this._nextStep,
				prevStep: this._prevStep,
				closeGS: this.props.onClose,
				sendLinks: this.props.sendLinks
				// options={this.state.options} 
			}) : React.createElement(Spinner, null)
		);
	}
});

GSModalComponent = React.createFactory(GSModalComponent);
var GuideComponent = React.createClass({
	displayName: "GuideComponent",


	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		extensions: React.PropTypes.array,
		channels: React.PropTypes.array
	},

	_getHeader: function () {
		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					"h1",
					null,
					this.props.frases.GUIDE.HEADER.HEADER + (this.props.profile && this.props.profile.name ? ", " + this.props.profile.name.split(' ')[0] : "") + "!"
				),
				React.createElement(
					"h4",
					null,
					this.props.frases.GUIDE.HEADER.BODY
				)
			)
		);
	},

	_isExtension: function (item) {
		return item.kind === 'user' || item.kind === 'phone';
	},

	_getSteps: function (frases) {
		var list = [{
			name: frases.STEPS["2"].NAME,
			desk: frases.STEPS["2"].DESC,
			actions: [{ name: frases.STEPS["2"].ACTIONS[0], link: "#users/users" }, { name: frases.STEPS["2"].ACTIONS[1], link: "#equipment/equipment" }],
			done: this.props.extensions.filter(this._isExtension).length
		}, {
			name: frases.STEPS["3"].NAME,
			desk: frases.STEPS["3"].DESC,
			actions: [{ name: frases.STEPS["3"].ACTIONS[0], link: "#chattrunk/chattrunk" }],
			done: this.props.channels.length
		}];

		if (this.props.profile) {
			list = [{
				name: frases.STEPS["1"].NAME,
				desk: frases.STEPS["1"].DESC,
				actions: [{ name: frases.STEPS["1"].ACTIONS[0], link: "#licenses" }],
				done: this.props.options.maxusers > 0 || this.props.options.maxlines > 0
			}].concat(list);
		}

		return list;
	},

	render: function () {
		var frases = this.props.frases.GUIDE;
		var steps = this._getSteps(frases);
		return React.createElement(
			PanelComponent,
			null,
			React.createElement(StepGuide, {
				frases: frases,
				header: this._getHeader(),
				steps: steps
			})
		);
	}

});

GuideComponent = React.createFactory(GuideComponent);
function StepGuideStep(props) {

	return React.createElement(
		"div",
		{ className: "row" },
		React.createElement("hr", null),
		React.createElement(
			"div",
			{ className: "col-sm-2" },
			props.params.done ? React.createElement(
				"h4",
				null,
				React.createElement("span", { className: "fa fa-fw fa-check text-success" }),
				React.createElement(
					"small",
					null,
					" ",
					props.frases.DONE
				)
			) : React.createElement(
				"h4",
				null,
				React.createElement(
					"span",
					{ style: { padding: "3px 9px", borderRadius: "50%", border: "1px solid #333" } },
					props.stepIndex
				)
			)
		),
		React.createElement(
			"div",
			{ className: "col-sm-6" },
			React.createElement(
				"h4",
				null,
				props.params.name
			),
			React.createElement(
				"p",
				null,
				props.params.desk
			)
		),
		React.createElement(
			"div",
			{ className: "col-sm-4", style: { textAlign: 'right' } },
			props.params.actions.map(function (item, index) {
				return React.createElement(
					"h4",
					{ key: index },
					React.createElement(
						"a",
						{ key: index, href: item.link, className: "btn btn-action" },
						item.name
					),
					React.createElement("br", null),
					React.createElement("br", null)
				);
			})
		)
	);
}

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
		return true;
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
function HelpSidebarButtonComponent(props) {

	var buttonStyle = {
		textAlign: "left",
		fontSize: "16px",
		border: "transparent",
		boxShadow: "0 0 4px 2px rgba(0,0,0,0.05)"
	};

	var iconStyle = {
		color: props.iconColor,
		display: "inline-block",
		height: "40px",
		verticalAlign: "top",
		padding: "7px",
		marginRight: "10px",
		fontSize: "1.5em"
	};

	return React.createElement(
		"a",
		{ href: props.link, target: "_blank", className: "btn btn-default btn-lg btn-block", style: buttonStyle },
		React.createElement("span", { className: props.iconClass, style: iconStyle }),
		React.createElement(
			"span",
			{ style: { display: "inline-block" } },
			React.createElement(
				"span",
				null,
				props.text
			),
			React.createElement("br", null),
			React.createElement(
				"small",
				null,
				props.desc
			)
		)
	);
}
function HelpSidebarComponent(props) {

	var frases = props.frases;

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
					"h4",
					null,
					frases.HELP_SIDEBAR.TITLE
				)
			)
		),
		React.createElement("br", null),
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(HelpSidebarButtonComponent, {
					link: "https://ringotel.zendesk.com/hc/en-us",
					text: frases.HELP_SIDEBAR.HELP_CENTER_BTN.TEXT,
					desc: frases.HELP_SIDEBAR.HELP_CENTER_BTN.DESC,
					iconColor: "#54c3f0",
					iconClass: "fa fa-book"
				})
			)
		),
		React.createElement("br", null),
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(HelpSidebarButtonComponent, {
					link: "https://calendly.com/ringotel/demo",
					text: frases.HELP_SIDEBAR.BOOK_TRAINING_BTN.TEXT,
					desc: frases.HELP_SIDEBAR.BOOK_TRAINING_BTN.DESC,
					iconColor: "#5cb85c",
					iconClass: "fa fa-calendar"
				})
			)
		),
		React.createElement("br", null),
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(HelpSidebarButtonComponent, {
					link: "mailto:support@ringotel.co",
					text: frases.HELP_SIDEBAR.EMAIL_US_BTN.TEXT,
					desc: frases.HELP_SIDEBAR.EMAIL_US_BTN.DESC,
					iconClass: "fa fa-envelope"
				})
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
			options: this.props.params.options
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			options: this.props.params.options
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

	_handleOnChange: function (e) {
		var options = extend({}, this.state.options);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		options[target.name] = type === 'number' ? parseFloat(value) : value;

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


	// 	this.setState({
	// 		options: options,
	// 		files: files
	// 	});	
	// },

	_onRouteChange: function (route) {
		this.setState({
			route: route
		});
	},

	_onSortMember: function (array) {
		var newParams = extend({}, this.state.params);
		newParams.members = array;

		this.setState({
			params: newParams
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		// var filteredMembers = this.state.filteredMembers || [];


		//<div className="form-group">
		//    <label className="col-sm-4 control-label">
		//      <span>{frases.EXTENSION} </span>
		//</label>
		//<div className="col-sm-8">
		//	<ObjectRoute frases={frases} routes={params.routes} removeRoute={this._onRouteRemove} onChange={this._onRouteChange} />
		//</div>
		//</div>
		//<hr/>

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled || false,
				onStateChange: this.props.onStateChange && this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this.props.setObject && this._setObject,
				onCancel: this.props.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, onAddMembers: this.props.onAddMembers, deleteMember: this.props.deleteMember })
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
										frases.HUNTINGTYPE.HUNTINGTYPE,
										' '
									)
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
									)
								),
								React.createElement(
									'div',
									{ className: 'col-sm-4' },
									React.createElement(
										'div',
										{ className: 'input-group' },
										React.createElement('input', { type: 'number', className: 'form-control', value: this.state.options.timeout, name: 'timeout', onChange: this._handleOnChange }),
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
										frases.GREETNAME,
										' '
									)
								),
								React.createElement(
									'div',
									{ className: 'col-sm-6' },
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
									)
								),
								React.createElement(
									'div',
									{ className: 'col-sm-6' },
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
		getExtension: React.PropTypes.func,
		deleteMember: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			files: []
		};
	},

	componentWillMount: function () {
		this.setState({
			params: this.props.params || {},
			options: this.props.params.options
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			options: this.props.params.options
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

	_handleOnChange: function (e) {
		var state = extend({}, this.state);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.options[target.name] = type === 'number' ? parseFloat(value) : value;

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


	// 	this.setState({
	// 		state: state
	// 	});	
	// },

	// _onRouteChange: function(route) {
	// 	this.setState({
	// 		route: route
	// 	});
	// },

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

		// <div className="form-group">
		// <label className="col-sm-4 control-label">
		// <span>{frases.EXTENSION} </span>
		// </label>
		// <div className="col-sm-4">
		// <ObjectRoute frases={frases} routes={params.routes} onChange={this._onRouteChange} />
		// </div>
		// </div>
		// <hr/>

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				enabled: params.enabled || false,
				onStateChange: this.props.onStateChange && this._onStateChange,
				onChange: this._onNameChange,
				onSubmit: this.props.setObject && this._setObject,
				onCancel: this.props.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, onAddMembers: this.props.onAddMembers, deleteMember: this.props.deleteMember })
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
											'div',
											{ className: 'col-sm-offset-4 col-sm-8' },
											React.createElement(
												'div',
												{ className: 'checkbox pull-left' },
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
												)
											),
											React.createElement(
												'span',
												{ style: { float: "left", width: "20px", height: "10px" } },
												' '
											),
											React.createElement(
												'div',
												{ className: 'checkbox pull-left' },
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
												)
											)
										)
									),
									this.state.options.autologin && !this.state.options.canpickup ? null : React.createElement(
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-md-2 col-sm-2' },
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
												frases.SETTINGS.MAXCONN,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-md-2 col-sm-4' },
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
												frases.PRIORITY,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-md-2 col-sm-4' },
											React.createElement('input', { type: 'text', className: 'form-control', name: 'priority', value: this.state.options.priority, onChange: this._handleOnChange })
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
												frases.ROUTEMETH.ROUTEMETH,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-6' },
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
												frases.NOANSTOUT,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
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
												frases.APPLICATION,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-8' },
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
												frases.QUEUEPROMPT,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-6' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-6' },
											React.createElement(FileUpload, { frases: frases, name: 'queuemusic', value: this.state.options.queuemusic, onChange: this._onFileUpload })
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
												frases.QUEUELEN,
												' '
											)
										),
										React.createElement(
											'div',
											{ className: 'col-md-2 col-sm-4' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-8' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-8' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-md-2 col-sm-4' },
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
											)
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
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
var ImportUsersListModalComponent = React.createClass({
	displayName: 'ImportUsersListModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		service: React.PropTypes.object,
		available: React.PropTypes.array,
		members: React.PropTypes.array,
		externalUsers: React.PropTypes.array,
		onSubmit: React.PropTypes.func,
		deleteAssociation: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			available: [],
			members: [],
			currentIndex: null,
			externalUsers: [],
			deAssociationList: []
		};
	},

	componentWillMount: function () {
		var available = this.props.available.sort().map(function (item, index) {
			return {
				value: item,
				label: item
			};
		});

		var members = this.props.members.map(function (item) {
			return {
				value: item.number || item.ext,
				label: (item.number || item.ext) + " - " + item.name
			};
		});

		this.setState({
			externalUsers: [].concat(this.props.externalUsers),
			available: available,
			members: sortByKey(members, 'value')
		});
	},

	_saveChanges: function () {
		this.props.onSubmit({ selectedUsers: this.state.externalUsers.filter(this._filterNew), deAssociationList: this.state.deAssociationList });
	},

	_onSelect: function (ext, index) {
		var externalUsers = [].concat(this.state.externalUsers);
		externalUsers[index].ext = ext;
		externalUsers[index].new = true;
		this.setState({ externalUsers: externalUsers });
	},

	_onDeleteAssociation: function (index) {
		var externalUsers = [].concat(this.state.externalUsers);
		var externalUser = externalUsers[index];

		var user = this.props.members.filter(function (item) {
			return item.number === externalUser.ext || item.ext === externalUser.ext;
		})[0];
		var deAssociationList = this.state.deAssociationList.concat([{ service_id: this.props.service.id, userid: user.userid }]);

		// this.props.deleteAssociation({ service_id: this.props.service.id, userid: user.userid }, function() {
		delete externalUser.ext;
		this.setState({ externalUsers: externalUsers, deAssociationList: deAssociationList });
		// }.bind(this));
	},

	_onDeselect: function (index) {
		var externalUsers = [].concat(this.state.externalUsers);
		delete externalUsers[index].ext;
		delete externalUsers[index].new;
		this.setState({ externalUsers: externalUsers });
	},

	_clearList: function () {
		this.setState({ currentIndex: null });
	},

	_setList: function (index, create) {
		var list = create ? this.state.available : this.state.members;
		var user = this.props.externalUsers[index];
		var strict = user.ext && !(user.services && user.services.length);
		var notAvailable = [];

		if (!create && strict) {
			list = list.filter(function (item) {
				return item.value === user.ext;
			});
		} else {
			notAvailable = this.state.externalUsers.reduce(function (array, next) {
				array.push(next.ext);return array;
			}, []);
			list = list.filter(function (item) {
				return notAvailable.indexOf(item.value) === -1;
			});
		}

		this.setState({ users: list, currentIndex: index });
	},

	_filterNew: function (item) {
		return item.hasOwnProperty('ext') && item.new;
	},

	_getBody: function () {
		return React.createElement(ImportUsersListComponent, {
			frases: this.props.frases,
			usersList: this.state.users,
			externalUsers: this.props.externalUsers,
			hasMembers: this.state.members.length,
			hasAvailable: this.state.available.length,
			onSelect: this._onSelect,
			onDeselect: this._onDeselect,
			onDeleteAssociation: this._onDeleteAssociation,
			setList: this._setList,
			clearList: this._clearList,
			currentIndex: this.state.currentIndex
		});
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();
		var hasChanges = this.state.externalUsers.filter(this._filterNew).length || this.state.deAssociationList.length;

		return React.createElement(ModalComponent, {
			size: 'lg',
			type: 'success',
			disabled: !hasChanges,
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.CHAT_CHANNEL.ADD_SELECTED,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			closeOnSubmit: true,
			body: body
		});
	}

});

ImportUsersListModalComponent = React.createFactory(ImportUsersListModalComponent);
function ImportUsersListComponent(props) {

    var frases = props.frases;

    function onSelect(item, user) {
        props.onSelect(item.value, user);
    }

    function onDeselect(e, index) {
        e.preventDefault();
        props.onDeselect(index);
    }

    function onDeleteAssociation(e, index) {
        e.preventDefault();
        props.onDeleteAssociation(index);
    }

    return React.createElement(
        "div",
        { className: "table-responsive", style: { overflow: "visible" } },
        React.createElement(
            "table",
            { className: "table table-hover sortable" },
            React.createElement(
                "thead",
                null,
                React.createElement(
                    "tr",
                    null,
                    React.createElement("th", { style: { minWidth: "100px" } }),
                    React.createElement(
                        "th",
                        null,
                        frases.NAME
                    ),
                    React.createElement(
                        "th",
                        null,
                        frases.USERNAME
                    ),
                    React.createElement(
                        "th",
                        { style: { minWidth: "100px" } },
                        frases.DESCRIPTION
                    )
                )
            ),
            React.createElement(
                "tbody",
                null,
                props.externalUsers ? props.externalUsers.map(function (user, index) {
                    return React.createElement(
                        "tr",
                        { key: index },
                        user.ext ? React.createElement(
                            "td",
                            null,
                            React.createElement(
                                "span",
                                null,
                                user.ext
                            ),
                            React.createElement("br", null),
                            user.new ? React.createElement(
                                "a",
                                { href: "#", onClick: function (e) {
                                        return onDeselect(e, index);
                                    } },
                                frases.CANCEL
                            ) : React.createElement(
                                "a",
                                { href: "#", className: "text-danger", onClick: function (e) {
                                        return onDeleteAssociation(e, index);
                                    } },
                                frases.DELETE
                            )
                        ) : props.usersList && props.currentIndex === index ? React.createElement(
                            "td",
                            null,
                            React.createElement(Select3, {
                                options: props.usersList,
                                onChange: function (item) {
                                    return onSelect(item, index);
                                },
                                placeholder: "Select user or extension",
                                onMenuClose: props.clearList
                            })
                        ) : React.createElement(
                            "td",
                            { style: { verticalAlign: "top" } },
                            React.createElement(
                                "div",
                                { className: "btn-group", style: { position: "absolute" } },
                                React.createElement(
                                    "a",
                                    { href: "#", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                                    React.createElement("i", { className: "fa fa-plus-circle fa-fw fa-lg" }),
                                    " ",
                                    frases.ADD
                                ),
                                React.createElement(
                                    "ul",
                                    { className: "dropdown-menu" },
                                    user.ext && !(user.services && user.services.length) || !props.hasAvailable ? null : React.createElement(
                                        "li",
                                        null,
                                        React.createElement(
                                            "a",
                                            { href: "#", onClick: function () {
                                                    props.setList(index, 1);
                                                } },
                                            frases.CREATE_NEW_USER
                                        )
                                    ),
                                    props.hasMembers ? React.createElement(
                                        "li",
                                        null,
                                        React.createElement(
                                            "a",
                                            { href: "#", onClick: function () {
                                                    props.setList(index, 0);
                                                } },
                                            frases.ASSOCIATE_WITH_USER
                                        )
                                    ) : null
                                )
                            )
                        ),
                        React.createElement(
                            "td",
                            null,
                            React.createElement(
                                "span",
                                { className: "ellipsis", title: (user.cn || user.name) + (user.uid ? " (" + user.uid + ") " : "") },
                                (user.cn || user.name) + (user.uid ? " (" + user.uid + ") " : "")
                            )
                        ),
                        React.createElement(
                            "td",
                            null,
                            user.login
                        ),
                        React.createElement(
                            "td",
                            null,
                            user.attributes.description
                        )
                    );
                }) : null
            )
        )
    );
}
var ImportCsvDataComponent = React.createClass({
	displayName: 'ImportCsvDataComponent',


	propTypes: {
		frases: React.PropTypes.object,
		onErrorState: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			errors: [],
			selectedService: null,
			fileDragged: false,
			file: null,
			fileStr: null,
			parseResult: null,
			issues: [],
			showIssues: false,
			columnsList: ['name', 'email', 'phone', 'organization', 'position', 'address'],
			columns: [],
			options: {
				encoding: 'UTF-8',
				delimiter: ',',
				hasHeader: true
			},
			encodings: ['UTF-8', 'Windows-1251'],
			delimiters: [{ value: ',', label: ',' }, { value: ';', label: ';' }, { value: ' ', label: 'space' }, { value: '\t', label: 'tab' }],
			maxRows: 20
		};
	},

	_setParmas: function (params) {
		// var data = [].concat(this.state.parseResult);
		// if(this.state.hasHeader) data.splice(0, 1);
		this.props.onChange(params);
	},

	_setErrorState: function (errors) {
		this.setState({ errors: errors, file: null, fileStr: null, parseResult: null });
		this.props.onErrorState(errors);
	},

	_checkErrorState: function (file) {
		var errors = [];
		if (file && file.type !== 'text/csv') errors.push('wrongFormat');
		if (file && file.size > 2000000) errors.push('wrongSize');
		return errors;
	},

	_onFileDragOver: function (e) {
		this.setState({ fileDragged: true });
		e.preventDefault();
	},

	_onFileDragEnter: function () {
		this.setState({ fileDragged: true });
	},

	_onFileDragLeave: function () {
		this.setState({ fileDragged: false });
	},

	_onFileDrop: function (e) {
		e.preventDefault();
		var file = null;
		var parsedCsv = [];
		var delimiter = this.state.options.delimiter;

		if (e.dataTransfer.items) {
			file = e.dataTransfer.items[0];
			file = file.kind === 'file' ? file.getAsFile() : null;
		} else {
			file = e.dataTransfer.files[0];
		}

		if (file) {
			this.setState({ file: file });
			this._readFile(file, { encoding: this.state.options.encoding });
		}

		this._removeDragData(e);
		this._onFileDragLeave();
	},

	_onFileSelect: function (e) {
		var input = e.target;
		var filelist = input.files;
		var file = filelist[0];

		this.setState({ file: file });
		if (!file) return;
		this._readFile(file, { encoding: this.state.options.encoding });
	},

	_readFile: function (file, params) {
		var options = extend({}, this.state.options);
		var rows = [];
		var errors = this._checkErrorState(file);

		if (errors.length) return this._setErrorState(errors);

		readFile(file, params, function (err, result) {
			if (err) console.error('readFiles error', err);

			rows = result.split(/\r\n|\n/);
			options.delimiter = this._guessDelimiter(rows[0], this.state.delimiters.map(function (item) {
				return item.value;
			}));

			this.setState({ fileStr: result, options: options });
			this._parseString(result, options.delimiter);

			// importCustomers(['name', 'email', 'phone'], parseAsCsv(result, ';', 3));
		}.bind(this));
	},

	_parseString: function (str, delimiter) {
		var parsed = parseAsCsv(str, delimiter);
		this.setState({ parseResult: parsed, issues: this._getIssues(parsed) });
		this._setParmas({ data: parsed });
	},

	_guessDelimiter: function (str, options) {
		var results = [];
		var max;
		var maxIndex;

		options.forEach(function (delimiter, index) {
			results[index] = str.split(delimiter).length;
		});

		max = Math.max.apply(null, results);
		maxIndex = results.indexOf(max);

		return options[maxIndex];
	},

	_getIssues(result) {
		var numColumns = (result ? result[0] : []).length;
		return result.filter(function (item) {
			return item.length !== numColumns;
		});
	},

	_removeDragData: function (e) {
		if (e.dataTransfer.items) {
			e.dataTransfer.items.clear();
		} else {
			e.dataTransfer.clearData();
		}
	},

	_onOptionsChange: function (e) {
		var options = extend({}, this.state.options);
		var target = e.target;
		var name = target.name;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var data = [];

		options[name] = type === 'number' ? parseFloat(value) : value;

		this.setState({ options: options });

		if (this.state.fileStr) {
			if (name === 'encoding') {
				setTimeout(function () {
					this._readFile(this.state.file, { encoding: value });
				}.bind(this), 100);
			} else if (name === 'hasHeader') {
				data = [].concat(this.state.parseResult);
				if (value) data.splice(0, 1);
				this._setParmas({ data: data });
			}
		}
	},

	_onDelimiterClick: function (value) {
		var options = extend({}, this.state.options);
		this.setState({ options: options });
		this._parseString(this.state.fileStr, value);
	},

	_onColumnsSelect: function (e, index) {
		var value = e.target.value;
		var columns = [].concat(this.state.columns);
		if (index > columns.length) columns.length = index + 1;
		columns[index] = value;

		this.setState({ columns: columns });
		this._setParmas({ columns: columns });
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
					{ className: 'col-xs-12' },
					React.createElement(
						'p',
						{ style: { margin: "10px 0" } },
						React.createElement(
							'strong',
							null,
							frases.IMPORT_DATA.STEP_1
						)
					),
					React.createElement(
						'div',
						{
							className: "dragndrop-area " + (this.state.fileDragged ? 'dragged' : ''),
							onDrop: this._onFileDrop,
							onDragOver: this._onFileDragOver,
							onDragEnter: this._onFileDragEnter,
							onDragLeave: this._onFileDragLeave
						},
						React.createElement(
							'p',
							null,
							this.state.file ? this.state.file.name : this.state.fileDragged ? frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_1 : frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_2
						),
						React.createElement(
							'p',
							null,
							React.createElement(
								'strong',
								null,
								frases.IMPORT_DATA.DRAG_AND_DROP_SUBTITLE
							)
						),
						React.createElement(
							'p',
							null,
							React.createElement('input', { type: 'file', accept: 'text/csv', onChange: this._onFileSelect })
						),
						React.createElement(
							'p',
							{ className: 'text-muted' },
							React.createElement(
								'em',
								null,
								frases.IMPORT_DATA.DRAG_AND_DROP_INFO
							)
						)
					)
				)
			),
			this.state.errors ? React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12', style: { margin: "10px 0" } },
					this.state.errors.map(function (item) {
						return React.createElement(
							'p',
							{ key: item, className: 'text-danger' },
							frases.IMPORT_DATA.ERRORS[item]
						);
					})
				)
			) : null,
			this.state.file && this.state.parseResult ? React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'p',
						{ style: { margin: "10px 0" } },
						React.createElement(
							'strong',
							null,
							frases.IMPORT_DATA.STEP_2
						)
					),
					React.createElement(ImportCsvOptionsComponent, {
						frases: frases,
						options: this.state.options,
						encodings: this.state.encodings,
						delimiters: this.state.delimiters,
						onOptionsChange: this._onOptionsChange,
						onDelimiterClick: this._onDelimiterClick
					})
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'p',
						{ style: { margin: "10px 0" } },
						React.createElement(
							'strong',
							null,
							frases.IMPORT_DATA.STEP_3
						)
					),
					React.createElement(
						'p',
						null,
						React.createElement(
							'span',
							null,
							frases.IMPORT_DATA.RECORDS,
							':'
						),
						' ',
						React.createElement(
							'strong',
							null,
							this.state.parseResult.length
						),
						this.state.issues.length && React.createElement(
							'button',
							{ type: 'button', className: 'btn btn-link', onClick: function () {
									this.setState({ showIssues: !this.state.showIssues });
								}.bind(this) },
							this.state.showIssues ? frases.IMPORT_DATA.SHOW_SAMPLE_BTN : frases.IMPORT_DATA.SHOW_ISSUES_BTN + " (" + this.state.issues.length + ")"
						)
					),
					this.state.showIssues ? React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'alert alert-warning', role: 'alert' },
							React.createElement(
								'span',
								null,
								frases.IMPORT_DATA.ISSUES_WARNING
							)
						),
						React.createElement(ImportCsvSelectColumnsTable, {
							frases: frases,
							rows: this.state.issues,
							showHeader: false
						})
					) : React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'alert alert-info', role: 'alert' },
							React.createElement(
								'span',
								null,
								frases.IMPORT_DATA.STEP_3_DESC
							)
						),
						React.createElement(ImportCsvSelectColumnsTable, {
							frases: frases,
							rows: this.state.parseResult,
							showHeader: this.state.options.hasHeader,
							columnsList: this.state.columnsList,
							selectedColumns: this.state.columns,
							onColumnsSelect: this._onColumnsSelect,
							maxRows: this.state.maxRows
						})
					)
				)
			) : null
		);
	}

});

ImportCsvDataComponent = React.createFactory(ImportCsvDataComponent);
function ImportCsvOptionsComponent(props) {

	var frases = props.frases;
	var options = props.options;

	return React.createElement(
		"form",
		{ className: "form-horizontal" },
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.IMPORT_DATA.OPTIONS.ENCODING
			),
			React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"select",
					{ name: "encoding", value: options.encoding, onChange: props.onOptionsChange, className: "form-control" },
					props.encodings.map(function (item, index) {
						return React.createElement(
							"option",
							{ key: index.toString(), value: item },
							item
						);
					})
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.IMPORT_DATA.OPTIONS.DELIMITER
			),
			React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"div",
					{ className: "btn-group", "data-toggle": "buttons" },
					props.delimiters.map(function (item) {
						return React.createElement(
							"label",
							{ key: item.label, className: "btn btn-default " + (options.delimiter === item.value ? 'active' : ''), onClick: function () {
									props.onDelimiterClick(item.value);
								} },
							React.createElement("input", { type: "radio", name: "delimiter", autoComplete: "off", checked: options.delimiter === item.value }),
							" ",
							item.label
						);
					})
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"div",
				{ className: "col-sm-offset-4 col-sm-8" },
				React.createElement(
					"div",
					{ className: "checkbox" },
					React.createElement(
						"label",
						null,
						React.createElement("input", { type: "checkbox", name: "hasHeader", checked: options.hasHeader, onChange: props.onOptionsChange }),
						" ",
						frases.IMPORT_DATA.OPTIONS.HAS_HEADER
					)
				)
			)
		)
	);
}
var ImportDataModalComponent = React.createClass({
	displayName: 'ImportDataModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		services: React.PropTypes.string,
		selectedService: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			selectedService: null,
			params: {
				columns: [],
				data: []
			},
			errorState: true
		};
	},

	componentWillMount: function () {
		this.setState({ errorState: this.props.selectedService.id === 'csv' ? true : false });
	},

	componentWillReceiveProps: function (props) {
		this.setState({ errorState: props.selectedService.id === 'csv' ? true : false });
	},

	_submitImport: function () {
		if (this.state.errorState) return;

		var params = {};

		if (this.props.selectedService === 'csv') {
			params = {
				columns: this.state.params.columns,
				data: this.state.params.data.filter(function (item) {
					return item.length === this.state.params.columns.length;
				}.bind(this))
			};
		} else {
			params = {
				service_id: this.props.selectedService.id
			};
		}

		this.props.onSubmit(params);
	},

	_setParams: function (params) {
		var newParams = extend({}, this.state.params, params);
		var errorState = !newParams.columns || !newParams.columns.length || !newParams.data || !newParams.data.length || newParams.columns.length !== newParams.data[0].length;
		this.setState({ params: newParams, errorState: errorState });
	},

	_getBody: function () {
		var frases = this.props.frases;
		var service = this.state.selectedService || this.props.selectedService;
		if (service.id === 'csv') {
			return React.createElement(ImportCsvDataComponent, { frases: frases, onChange: this._setParams, onSubmit: this._submitImport, onErrorState: function (errors) {
					this.setState({ errorState: errors && errors.length ? true : false });
				}.bind(this) });
		} else {
			return React.createElement(ImportServiceDataComponent, { frases: frases, service: this.props.selectedService, onChange: this._setParams, onSubmit: this._submitImport, onErrorState: function (errors) {
					this.setState({ errorState: errors && errors.length ? true : false });
				}.bind(this) });
		}
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: 'md',
			type: 'success',
			title: frases.IMPORT_DATA.TITLE,
			submitText: frases.IMPORT,
			cancelText: frases.CANCEL,
			submit: this._submitImport,
			disabled: this.state.errorState,
			closeOnSubmit: true,
			body: body
		});
	}

});

ImportDataModalComponent = React.createFactory(ImportDataModalComponent);
function ImportCsvSelectColumnsTable(props) {

	function _getItemRow(items) {
		return items.map(function (item) {
			return React.createElement(
				"td",
				{ key: item },
				item
			);
		});
	}

	function _getColumnsListOptions(list) {
		return list.map(function (item) {
			return React.createElement(
				"option",
				{ key: item, value: item },
				item
			);
		});
	}

	return React.createElement(
		"div",
		{ className: "table-responsive", style: { maxHeight: "200px", overflow: "auto" } },
		React.createElement(
			"table",
			{ className: "table table-bordered" },
			React.createElement(
				"thead",
				null,
				React.createElement(
					"tr",
					null,
					props.columnsList ? (props.rows[0] || []).map(function (item, index) {
						return React.createElement(
							"th",
							{ key: item },
							React.createElement(
								"select",
								{ className: "form-control", value: props.selectedColumns[index], onChange: function (e) {
										props.onColumnsSelect(e, index);
									} },
								React.createElement(
									"option",
									{ value: "" },
									props.frases.IMPORT_DATA.SELECT_PARAMETER_OPTION
								),
								_getColumnsListOptions(props.columnsList)
							)
						);
					}) : null
				),
				React.createElement(
					"tr",
					null,
					props.showHeader !== false ? (props.rows[0] || []).map(function (item) {
						return React.createElement(
							"th",
							{ key: item },
							item
						);
					}) : null
				)
			),
			React.createElement(
				"tbody",
				{ style: { fontSize: "12px" } },
				props.rows.map(function (item, index) {
					if (props.showHeader !== false && index === 0 || index > props.maxRows) return null;
					return React.createElement(
						"tr",
						{ key: index.toString() },
						_getItemRow(item)
					);
				}.bind(this))
			)
		)
	);
}
var ImportServiceDataComponent = React.createClass({
	displayName: "ImportServiceDataComponent",


	propTypes: {
		frases: React.PropTypes.object,
		service: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			errors: []
			// selectedService: null,
			// parseResult: null,
			// issues: [],
			// showIssues: false
		};
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row", style: { textAlign: 'center' } },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement("img", {
						src: "/badmin/images/services/" + this.props.service.id + '.png',
						alt: this.props.service.name,
						style: { maxWidth: '100%', maxHeight: '65px', margin: '40px 0' }
					})
				),
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"p",
						null,
						this.props.frases.CUSTOMERS.SERVICE_AUTH.CONFIRM_IMPORT_FROM,
						" ",
						React.createElement(
							"strong",
							null,
							this.props.service.name
						),
						"?"
					)
				)
			)
		);
	}

});

ImportServiceDataComponent = React.createFactory(ImportServiceDataComponent);
function DownloadAppsLightbox(props) {

	function _onRef(el) {
		if (el) el.innerHTML = props.frases.LIGHTBOX.DOWNLOAD_APPS.BODY;
	}

	return React.createElement(
		PanelComponent,
		null,
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-8" },
				React.createElement("h5", { ref: _onRef })
			),
			React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"div",
					{ className: "text-center" },
					React.createElement(
						"h5",
						null,
						React.createElement(
							"a",
							{ href: "https://ringotel.co/download", target: "_blank", className: "btn btn-action btn-lg" },
							props.frases.LIGHTBOX.DOWNLOAD_APPS.ACTION_BTN_TEXT
						)
					)
				)
			)
		)
	);
}
var LocationGroupComponent = React.createClass({
	displayName: 'LocationGroupComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onNameChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		getExtension: React.PropTypes.func
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
			params: props.params
		});
	},

	_setObject: function () {
		var params = this.state.params;
		this.props.setObject(params);
	},

	_onNameChange: function (value) {
		var params = this.state.params;
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_onTransformsChange: function (type, params) {
		var state = this.state;
		var profile = state.params.profile;

		profile[type] = params;

		this.setState({
			state: state
		});
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

	_handleOnBlur: function (event) {
		var state = extend({}, this.state.params);
		var target = event.target;
		var name = target.name;
		var value = target.value;
		var bytes = value ? value.split('.') : [];
		var emptyBytes = 4 - bytes.length;

		if (emptyBytes) {
			for (var i = 0; i < emptyBytes; i++) {
				bytes.push('0');
			}
		}

		state[name] = bytes.join('.');
		this.setState({ params: state });
	},

	_handleRuleChange: function (event) {
		var state = extend({}, this.state.params);
		var target = event.target;
		var name = target.name;
		var value = this._validateIp(target.value);

		if (value === false) return;

		state[name] = value;
		this.setState({ params: state });
	},

	// _onFeatureChange: function(params) {
	// 	var state = this.state;
	// 	state.params.profile = params;

	// 	this.setState({
	// 		state: state
	// 	});
	// },

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];

		return React.createElement(
			'div',
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases,
				placeholder: frases.NAME,
				onChange: this._onNameChange,
				onSubmit: this._setObject,
				onCancel: this.props.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GroupMembersComponent, {
						frases: frases,
						members: members,
						kind: params.kind,
						getExtension: this.props.getExtension
					})
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
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
									frases.SETTINGS.SECURITY.NETWORK,
									' / ',
									frases.SETTINGS.SECURITY.NETMASK
								),
								React.createElement(
									'div',
									{ className: 'col-sm-3' },
									React.createElement('input', { type: 'text', className: 'form-control', name: 'network', value: params.network, onBlur: this._handleOnBlur, onChange: this._handleRuleChange })
								),
								React.createElement(
									'span',
									{ className: 'col-sm-1 text-center', style: { fontSize: "1.5em" } },
									' / '
								),
								React.createElement(
									'div',
									{ className: 'col-sm-3' },
									React.createElement('input', { type: 'text', className: 'form-control', name: 'netmask', value: params.netmask, onBlur: this._handleOnBlur, onChange: this._handleRuleChange })
								)
							)
						),
						React.createElement('br', null),
						React.createElement('br', null),
						React.createElement(
							'div',
							{ className: 'col-sm-12' },
							React.createElement(
								'div',
								{ className: 'alert alert-info', role: 'alert' },
								React.createElement(
									'button',
									{ type: 'button', className: 'close', 'data-dismiss': 'alert', 'aria-label': 'Close' },
									React.createElement(
										'span',
										{ 'aria-hidden': 'true' },
										'\xD7'
									)
								),
								React.createElement(
									'p',
									null,
									React.createElement(
										'strong',
										null,
										frases.NUMBER_TRANSFORMS.NUMBER_TRANSFORMS
									)
								),
								React.createElement(
									'p',
									null,
									frases.NUMBER_TRANSFORMS.HELPERS.NUMBER
								),
								React.createElement(
									'p',
									null,
									frases.NUMBER_TRANSFORMS.HELPERS.STRIP
								),
								React.createElement(
									'p',
									null,
									frases.NUMBER_TRANSFORMS.HELPERS.PREFIX
								),
								React.createElement(
									'p',
									null,
									frases.NUMBER_TRANSFORMS.HELPERS.DOLLAR
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'col-sm-6' },
							React.createElement(NumberTransformsComponent, { frases: frases, type: 'outbounda', transforms: params.profile.anumbertransforms, onChange: this._onTransformsChange.bind(this, 'anumbertransforms') })
						),
						React.createElement(
							'div',
							{ className: 'col-sm-6' },
							React.createElement(NumberTransformsComponent, { frases: frases, type: 'outboundb', transforms: params.profile.bnumbertransforms, onChange: this._onTransformsChange.bind(this, 'bnumbertransforms') })
						)
					)
				)
			)
		);
	}
});

LocationGroupComponent = React.createFactory(LocationGroupComponent);
function AddLicenseItemComponent(props) {

	function onChange(value) {
		props.onChange(value);
	}

	return React.createElement(
		"div",
		null,
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-5" },
				React.createElement(
					"h5",
					null,
					props.label
				)
			),
			React.createElement(
				"div",
				{ className: "col-xs-7" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"span",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ className: "btn btn-link", disabled: props.readOnly, type: "button", onClick: function () {
									onChange(props.quantity - (props.step || 1));
								} },
							React.createElement("i", { className: "fa fa-chevron-left" })
						)
					),
					React.createElement("input", { type: "number", value: props.quantity, onChange: function (e) {
							onChange(e.target.value);
						}, className: "form-control text-right", readOnly: props.readOnly }),
					React.createElement(
						"span",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ className: "btn btn-link", disabled: props.readOnly, type: "button", disabled: props.readOnly, onClick: function () {
									onChange(props.quantity + (props.step || 1));
								} },
							React.createElement("i", { className: "fa fa-chevron-right" })
						)
					)
				)
			)
		)
	);
}
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
					if (!item.name) return null;
					return React.createElement(
						'div',
						{ className: 'col-sm-4', key: item.name },
						React.createElement(AddLicenseItemComponent, {
							onMinus: this._setQuantity.bind(this, { name: item.name, quantity: item.name === 'storage' ? -5 : -2 }),
							onPlus: this._setQuantity.bind(this, { name: item.name, quantity: item.name === 'storage' ? 5 : 2 }),
							quantity: this.state.addOns[item.name].quantity,
							label: frases.BILLING.AVAILABLE_LICENSES[item.name] ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description
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
		// var currencySymbol = this._currencyNameToSymbol(this.props.subscription.plan.currency);
		this.props.addCredits({ amount: this.state.amount });
	},

	_getCredits: function () {
		BillingApi.getCredits(function (err, response) {
			if (err) {
				this.setState({ credits: 0 });
				return notify_about('error', err.message);
			}
			this.setState({ credits: response.result ? response.result.balance : 0 });
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
var LicensesComponent = React.createClass({
	displayName: 'LicensesComponent',


	propTypes: {
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		sub: React.PropTypes.object,
		dids: React.PropTypes.array,
		frases: React.PropTypes.object,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		addCredits: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		editCard: React.PropTypes.func,
		extend: React.PropTypes.func,
		addCoupon: React.PropTypes.func,
		countSubAmount: React.PropTypes.func,
		currencyNameToSymbol: React.PropTypes.func,
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

	// _countSubAmount: function(sub) {
	// 	var amount = sub.quantity * sub.plan.price;
	// 	var priceProp = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';

	// 	if(sub.addOns && sub.addOns.length){
	// 	    sub.addOns.forEach(function (item){
	// 	        if(item.quantity) amount += (item.price * item.quantity);
	// 	    });
	// 	}

	// 	if(sub.hasDids) {
	// 		this.props.dids.forEach(function(item) {
	// 			amount += item.included ? 0 : parseFloat(item[priceProp]);
	// 		});
	// 	}

	// 	return amount.toFixed(2);
	// },

	_countNewPlanAmount: function (currsub, newsub) {
		var currAmount = currsub.amount;
		var newAmount = newsub.amount;
		var chargeAmount = 0;
		var totalAmount = 0;
		var proratedAmount = null;
		var currentSubProration = null;
		var newSubProration = null;
		var getProration = this.props.utils.getProration;

		if (parseFloat(currAmount) <= 0 || currsub.plan.trialPeriod || currsub.plan.billingPeriod !== newsub.plan.billingPeriod || currsub.plan.billingPeriodUnit !== newsub.plan.billingPeriodUnit) {
			newsub.nextBillingDate = moment().add(newsub.plan.billingPeriod, newsub.plan.billingPeriodUnit).valueOf();
			newsub.prevBillingDate = Date.now();
			chargeAmount = parseFloat(newAmount);
		} else {
			currentSubProration = getProration(currsub, currAmount);
			newSubProration = getProration(newsub, newAmount);

			if (newSubProration >= currentSubProration) {
				chargeAmount = newSubProration - currentSubProration;
			} else {
				proratedAmount = currentSubProration - newSubProration;
				chargeAmount = 0;
			}
		}

		return { newSubAmount: newAmount, totalAmount: totalAmount > 0 ? totalAmount : 0, chargeAmount: chargeAmount };
	},

	_setUpdate: function (item) {
		var params = this.state;
		if (item.min !== undefined && item.value < item.min) return;
		if (item.max !== undefined && item.value > item.max) return;
		params[item.key] = item.value;
		this._checkUpdate(params);
	},

	_onPlanSelect: function (plan) {
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var nextBillingDate = sub.nextBillingDate;
		var isTrial = plan.planId === 'trial';

		sub.plan = plan;
		sub.addOns = this._extendAddons(plan.addOns, sub.addOns);
		sub.amount = this.props.countSubAmount(sub);

		var amounts = this._countNewPlanAmount(this.props.sub, sub);

		this.props.onPlanSelect({
			plan: plan,
			annually: plan.billingPeriodUnit === 'years',
			payment: {
				currencySymbol: this.props.currencyNameToSymbol(plan.currency),
				currency: plan.currency,
				newSubAmount: amounts.newSubAmount,
				discounts: this.props.discounts,
				nextBillingDate: nextBillingDate && !isTrial ? moment(nextBillingDate).format('DD/MM/YY') : null,
				chargeAmount: amounts.chargeAmount.toFixed(2),
				totalAmount: amounts.totalAmount.toFixed(2)
			}
		});

		// sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		// sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		// sub.amount = this._countSubAmount(sub);
	},

	// _updateLicenses: function(params) {

	// 	var getProration = this.props.utils.getProration;
	// 	var sub = this.state.sub;
	// 	sub.quantity = params.quantity;
	// 	sub.addOns = params.addOns;
	// 	sub.amount = this._countSubAmount(sub);

	// 	var chargeAmount = 0;
	// 	var totalAmount = parseFloat(sub.amount) - parseFloat(this.props.sub.amount);
	// 	var proration = getProration(sub, totalAmount);

	// 	if(totalAmount > 0) {
	// 		chargeAmount = proration > 1 ? proration : 1;
	// 	}

	// 	this.props.updateLicenses({
	// 		addOns: sub.addOns,
	// 		quantity: sub.quantity,
	// 		annually: (sub.plan.billingPeriodUnit === 'years'),
	// 		payment: {
	// 			currency: sub.plan.currency,
	// 			newSubAmount: sub.amount,
	// 			nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY'),
	// 			discounts: this.props.discounts,
	// 			chargeAmount: chargeAmount.toFixed(2),
	// 			totalAmount: totalAmount.toFixed(2)
	// 		}
	// 	});

	// 	sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
	// 	sub.quantity = this.props.sub.quantity;
	// 	sub.amount = this._countSubAmount(sub);

	// },

	_updateAndRenewSub: function (e) {
		if (e) e.preventDefault();
		this.props.editCard(function (result) {
			if (!result) return;

			// var profile = this.state.profile;
			// profile.billingMethod = {
			// 	params: result.card
			// };

			// this.setState({ profile: profile });

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
						frases.BILLING.UPGRADE_PLAN_ALERT_MSG
					) : ''
				)
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						null,
						React.createElement(SubscriptionPlanComponent, {
							frases: frases,
							subscription: sub,
							plans: plans,
							renewSub: this._renewSub,
							onPlanSelect: this._onPlanSelect,
							currencyNameToSymbol: this.props.currencyNameToSymbol
						}),
						React.createElement(SubscriptionPriceComponent, {
							frases: frases,
							subscription: sub,
							discounts: discounts,
							dids: this.props.dids,
							updateLicenses: this.props.updateLicenses
						})
					)
				)
			),
			React.createElement(
				PanelComponent,
				{ header: frases.USAGE.PANEL_TITLE },
				React.createElement(StorageUsageComponent, {
					frases: frases,
					utils: this.props.utils
				})
			),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-sm-6' },
					React.createElement(
						PanelComponent,
						{ header: frases.BILLING.CALL_CREDITS },
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
					{ className: 'col-sm-6' },
					React.createElement(
						PanelComponent,
						{ header: frases.BILLING.DISCOUNTS.DISCOUNTS },
						React.createElement(DiscountsComponent, { items: discounts, addCoupon: this._addCoupon, frases: frases })
					)
				)
			)
		);
	}
});

LicensesComponent = React.createFactory(LicensesComponent);

var PlanComponent = React.createClass({
	displayName: "PlanComponent",


	propTypes: {
		plan: React.PropTypes.object,
		plansLength: React.PropTypes.number,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.bool,
		onSelect: React.PropTypes.func,
		currencySymbol: React.PropTypes.string
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
		var addOns = plan.addOns.reduce(function (obj, item) {
			obj[item.name] = item;return obj;
		}, {});
		var symbol = this.props.currencySymbol;

		return React.createElement(
			"div",
			{ className: "pricing-item", style: { width: isSmallScreen() ? "100%" : Math.floor(100 / this.props.plansLength) + "%" } },
			plan.trialPeriod ? React.createElement(
				"div",
				{ className: "pricing-head" },
				React.createElement(
					"h4",
					{ className: "pricing-plan-name" },
					plan.name
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"strong",
						null,
						addOns.lines.quantity
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.LINES
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"strong",
						null,
						attributes.maxusers
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.USERS
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"strong",
						null,
						attributes.storageperuser,
						"GB"
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.PER_USER
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.UNLIMITED,
						" ",
						frases.BILLING.PLANS.SIP_EXTENSIONS
					)
				)
			) : React.createElement(
				"div",
				{ className: "pricing-head" },
				React.createElement(
					"h4",
					{ className: "pricing-plan-name" },
					plan.name
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"span",
						null,
						symbol,
						addOns.lines.price
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.PER_LINE,
						"/",
						frases.BILLING.PLANS.PER_MONTH
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"span",
						null,
						symbol,
						period === 'months' ? plan.price : plan.price / 12
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.PER_USER,
						"/",
						frases.BILLING.PLANS.PER_MONTH
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"strong",
						null,
						attributes.storageperuser,
						"GB"
					),
					" ",
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.PER_USER
					)
				),
				React.createElement(
					"h4",
					null,
					React.createElement(
						"small",
						null,
						frases.BILLING.PLANS.UNLIMITED,
						" ",
						frases.BILLING.PLANS.SIP_EXTENSIONS
					)
				)
			),
			React.createElement(
				"div",
				{ className: "pricing-body" },
				React.createElement(
					"p",
					null,
					React.createElement(
						"a",
						{ href: "https://ringotel.co/pricing/", target: "_blank" },
						frases.BILLING.PLANS.SHOW_ALL_FEATURES
					)
				),
				this.props.currentPlan ? React.createElement(
					"p",
					{ className: "text-muted text-uppercase", style: { padding: "6px 0", margin: "0" } },
					frases.BILLING.PLANS.CURRENT_PLAN
				) : plan.trialPeriod ? React.createElement(
					"button",
					{ className: "btn btn-default", disabled: true },
					frases.BILLING.PLANS.SELECT_PLAN
				) : React.createElement(
					"button",
					{ className: "btn btn-action", onClick: this._selectPlan },
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
		onPlanSelect: React.PropTypes.func,
		currencySymbol: React.PropTypes.string
	},

	getDefaultProps: function () {
		return {
			plans: []
		};
	},

	getInitialState: function () {
		return {
			showMonthlyPlans: true
		};
	},

	componentDidMount: function () {

		this.setState({
			showMonthlyPlans: this.props.currentPlan.billingPeriodUnit === 'months'
		});
	},

	_togglePlans: function (annually) {
		this.setState({ showMonthlyPlans: !annually });
	},

	_filterPlans: function (plan) {
		var currentPlan = this.props.currentPlan.planId;
		var showMonthlyPlans = this.state.showMonthlyPlans;

		return plan;

		if (currentPlan !== 'free' && plan.planId === 'free') {
			return null;
		} else if (plan.planId === 'free' || plan.planId === 'trial' && currentPlan !== 'trial' && currentPlan !== 'free') {
			return null;
		} else if (showMonthlyPlans && plan.billingPeriodUnit === 'months') {
			return plan;
		} else if (!showMonthlyPlans && plan.billingPeriodUnit === 'years') {
			return plan;
		} else if (currentPlan === 'trial' && plan.planId === 'trial') {
			return plan;
		} else {
			return null;
		}
	},

	// render: function() {
	// 	var frases = this.props.frases;
	// 	var plans = this.props.plans.filter(this._filterPlans);

	// 	return (
	// 	    <div className="panel-body" style={{ background: 'none' }}>
	// 	    	<div className="row">
	// 	    		<div className="col-xs-12 text-center" style={{ marginBottom: "20px" }}>
	// 		    		<div className="btn-group btn-group-custom" data-toggle="buttons">
	// 		    		  	<label className={"btn btn-primary " + (!this.state.showMonthlyPlans ? 'active' : '')} onClick={this._togglePlans.bind(this, true)}>
	// 		    		    	<input type="radio" name="billing-period" autoComplete="off" checked={!this.state.showMonthlyPlans} /> { frases.BILLING.PLANS.ANNUAL_PLANS }
	// 		    		  	</label>
	// 		    		  	<label className={"btn btn-primary " + (this.state.showMonthlyPlans ? 'active' : '')} onClick={this._togglePlans.bind(this, false)}>
	// 		    		    	<input type="radio" name="billing-period" autoComplete="off" checked={this.state.showMonthlyPlans} /> { frases.BILLING.PLANS.MONTHLY_PLANS }
	// 		    		  	</label>
	// 		    		</div>
	// 				</div>
	// 	    	</div>
	// 	    	<div className="row">
	// 		    	{ plans.map(function(plan, index) {

	// 		    		return (
	// 		    			<div className="col-xs-12 col-sm-6 col-lg-4 text-center" key={plan.planId}>
	// 		    				<PlanComponent plan={plan} frases={frases} onSelect={this.props.onPlanSelect} currentPlan={this.props.currentPlan.planId === plan.planId} />
	// 		    			</div>
	// 		    		);

	// 		    	}.bind(this)) }
	// 		    </div>
	// 	    </div>
	// 	);
	// }
	// 
	render: function () {
		var frases = this.props.frases;
		var plans = sortByKey(this.props.plans.filter(this._filterPlans), 'numId');
		var column = plans.length ? 12 / plans.length : 12;

		return React.createElement(
			'div',
			{ className: 'panel-body', style: { background: 'none' } },
			React.createElement(
				'div',
				{ className: 'row pricing-container' },
				plans.map(function (plan, index) {

					return React.createElement(PlanComponent, {
						key: index,
						plansLength: plans.length,
						plan: plan,
						frases: frases,
						onSelect: this.props.onPlanSelect,
						currentPlan: this.props.currentPlan.planId === plan.planId,
						currencySymbol: this.props.currencySymbol
					});
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
		onPlanSelect: React.PropTypes.func,
		currencyNameToSymbol: React.PropTypes.func
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
		var currencySymbol = this.props.currencyNameToSymbol(sub.plan.currency);

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
				)
			),
			React.createElement(
				"div",
				{ className: "pull-right" },
				sub.status === 'past_due' ? React.createElement(
					"a",
					{ href: "#", className: "btn btn-action", style: { fontSize: "14px" }, onClick: this.props.renewSub },
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
						plans.length ? React.createElement(PlansComponent, { plans: plans, frases: frases, onPlanSelect: this.props.onPlanSelect, currentPlan: sub.plan, currencySymbol: currencySymbol }) : React.createElement(Spinner, null)
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
		frases: React.PropTypes.object,
		updateLicenses: React.PropTypes.func
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

	_updateLicenses: function (e) {
		e.preventDefault();
		this.props.updateLicenses();
	},

	render: function () {
		var frases = this.props.frases;
		var sub = this.props.subscription;
		var attributes = sub.plan.attributes || sub.plan.customData;
		var discounts = this.props.discounts;
		var subAmount = sub.amount;
		var propString = sub.plan.billingPeriodUnit === 'years' ? 'annualPrice' : 'monthlyPrice';
		var currencySymbol = this._currencyNameToSymbol(sub.plan.currency);
		// var addonsPrice = sub.addOns.reduce(function(amount, item) {
		// 	amount += parseFloat(item.price) * item.quantity;
		// 	return amount;
		// }, 0);
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
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					"div",
					{ className: "table-responsive" },
					React.createElement(
						"table",
						{ className: "table table-bordered" },
						React.createElement(
							"thead",
							null,
							React.createElement(
								"tr",
								null,
								React.createElement(
									"th",
									null,
									frases.BILLING.LICENSE
								),
								React.createElement(
									"th",
									null,
									frases.BILLING.QUANTITY
								),
								React.createElement(
									"th",
									null,
									frases.BILLING.PRICE
								),
								React.createElement(
									"th",
									null,
									frases.BILLING.AMOUNT
								)
							)
						),
						React.createElement(
							"tbody",
							null,
							sub.addOns.map(function (item) {
								if (!item.name) return null;
								return React.createElement(
									"tr",
									{ key: item.name },
									React.createElement(
										"td",
										null,
										frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description
									),
									React.createElement(
										"td",
										null,
										item.quantity
									),
									React.createElement(
										"td",
										null,
										currencySymbol,
										item.price
									),
									React.createElement(
										"td",
										null,
										currencySymbol,
										(item.quantity * item.price).toFixed(2),
										" "
									)
								);
							}),
							sub.quantity ? React.createElement(
								"tr",
								null,
								React.createElement(
									"td",
									null,
									frases.USERS
								),
								React.createElement(
									"td",
									null,
									sub.quantity
								),
								React.createElement(
									"td",
									null,
									currencySymbol,
									sub.plan.price
								),
								React.createElement(
									"td",
									null,
									currencySymbol,
									(parseFloat(sub.plan.price) * sub.quantity).toFixed(2)
								)
							) : null,
							this.props.dids.length ? React.createElement(
								"tr",
								null,
								React.createElement(
									"td",
									null,
									frases.NUMBERS
								),
								React.createElement(
									"td",
									null,
									this.props.dids.length
								),
								React.createElement(
									"td",
									{ colSpan: "2" },
									" ",
									currencySymbol,
									didsPrice.toFixed(2),
									" "
								)
							) : null,
							React.createElement(
								"tr",
								{ className: "active" },
								React.createElement(
									"td",
									{ colSpan: "3" },
									sub.plan.billingPeriodUnit === 'years' ? frases.BILLING.ANNUALLY_TOTAL : frases.BILLING.MONTHLY_TOTAL
								),
								React.createElement(
									"td",
									null,
									currencySymbol,
									parseFloat(subAmount).toFixed(2)
								)
							),
							sub.plan.trialPeriod ? React.createElement(
								"tr",
								null,
								React.createElement(
									"td",
									{ colSpan: "4" },
									frases.BILLING.TRIAL_EXPIRES,
									" ",
									React.createElement(
										"b",
										null,
										window.moment(sub.trialExpires).format('DD MMMM YYYY')
									)
								)
							) : !sub.plan.trialPeriod && parseFloat(subAmount) > 0 ? React.createElement(
								"tr",
								{ className: "active" },
								React.createElement(
									"td",
									{ colSpan: "4" },
									frases.BILLING.NEXT_CHARGE,
									" ",
									React.createElement(
										"b",
										null,
										window.moment(sub.nextBillingDate).format('DD MMMM YYYY')
									)
								)
							) : null
						)
					)
				)
			),
			React.createElement(
				"div",
				{ className: "col-xs-12 text-center" },
				React.createElement(
					"a",
					{
						href: "#",
						className: "text-uppercase btn btn-link",
						onClick: sub.status === 'active' && this._updateLicenses,
						disabled: sub.status !== 'active'
					},
					frases.BILLING.MANAGE_LICENSES_BTN
				)
			)
		);
	}
});

SubscriptionPriceComponent = React.createFactory(SubscriptionPriceComponent);
var AvailableUsersModalComponent = React.createClass({
	displayName: "AvailableUsersModalComponent",


	propTypes: {
		frases: React.PropTypes.object,
		groupid: React.PropTypes.string,
		availableList: React.PropTypes.array,
		excludeList: React.PropTypes.array,
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
		return React.createElement(AvailableUsersComponent, { frases: frases, onChange: this._onUsersSelected, availableList: this.props.availableList, excludeList: this.props.excludeList, groupid: this.props.groupid });
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
var ChangePasswordComponent = React.createClass({
	displayName: 'ChangePasswordComponent',


	propTypes: {
		frases: React.PropTypes.object,
		open: React.PropTypes.bool,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			errors: [],
			fetching: false,
			validationError: false,
			open: false
		};
	},

	componentWillMount: function () {
		this.setState({ open: true });
	},

	_saveChanges: function () {
		var params = extend({}, this.state.params);
		var errors = [];

		if (params.adminpass !== params.confirmadminpass) return this.setState({ errors: errors.concat({ code: 'password_mismatch' }) });

		this.setState({ fetching: true, validationError: false });

		this.props.onSubmit({ oldadminpass: params.oldadminpass || '', adminpass: params.adminpass }, function (err, result) {
			if (err) {
				if (err.message === 'Invalid parameter') {
					this.setState({ errors: errors.concat({ code: 'invalid_parameter' }), fetching: false });
				} else {
					this.setState({ errors: errors.concat({ code: 'generic_decline' }), fetching: false });
				}
				return false;
			}

			this.setState({ errors: [], open: false });
		}.bind(this));
	},

	_onChange: function (e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute && target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: params });
	},

	_getBody: function () {
		var frases = this.props.frases;

		return React.createElement(
			'form',
			{ className: 'form' },
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'control-label' },
					frases.SETTINGS.OLD_PASSWORD
				),
				React.createElement(PasswordComponent, { frases: frases, value: this.state.params.oldadminpass, name: 'oldadminpass', onChange: this._onChange })
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'control-label' },
					frases.SETTINGS.NEW_PASSWORD
				),
				React.createElement(PasswordComponent, { frases: frases, value: this.state.params.adminpass, name: 'adminpass', onChange: this._onChange })
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'control-label' },
					frases.SETTINGS.CONFIRM_NEW_PASSWORD
				),
				React.createElement(PasswordComponent, { frases: frases, value: this.state.params.confirmadminpass, name: 'confirmadminpass', onChange: this._onChange })
			),
			this.state.errors.length ? React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'div',
					{ className: 'alert alert-danger', role: 'alert' },
					this.state.errors.map(function (item, index) {
						return React.createElement(
							'p',
							{ key: item.code },
							frases.SETTINGS.CHANGE_PASSWORD_ERROR[item.code] || frases.SETTINGS.CHANGE_PASSWORD_ERROR['generic_decline']
						);
					})
				)
			) : null
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();
		var params = this.state.params;

		return React.createElement(ModalComponent, {
			size: 'sm',
			type: 'success',
			title: frases.SETTINGS.CHANGE_PASSWORD,
			disabled: !params.adminpass || !params.confirmadminpass,
			submitText: frases.SUBMIT,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			onClose: this.props.onClose,
			closeOnSubmit: false,
			fetching: this.state.fetching,
			open: this.state.open,
			body: body
		});
	}

});

ChangePasswordComponent = React.createFactory(ChangePasswordComponent);
function ConfirmActionModalComponent(props) {

	var frases = props.frases;

	function _getBody() {
		return React.createElement(
			"div",
			null,
			props.warning ? React.createElement(
				"div",
				{ className: "alert alert-warning", role: "alert" },
				React.createElement(
					"p",
					null,
					props.warning
				)
			) : React.createElement(
				"div",
				null,
				React.createElement(
					"p",
					null,
					props.text
				)
			)
		);
	}

	function _onSubmit() {
		props.onSubmit();
	}

	return React.createElement(ModalComponent, {
		size: "sm",
		title: props.title,
		type: props.type || 'primary',
		closeOnSubmit: true,
		submitText: props.submitTet || frases.CONFIRM,
		cancelText: props.cancelText || frases.CANCEL,
		submit: _onSubmit,
		body: _getBody()
	});
}

DeleteObjectModalComponent = React.createFactory(DeleteObjectModalComponent);
var CreateGroupModalComponent = React.createClass({
	displayName: "CreateGroupModalComponent",


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
		this.setState({ selectedUsers: users });
	},

	_onSubmit: function () {
		return true;
	},

	_getBody: function () {
		var frases = this.props.frases;
		return React.createElement(AvailableUsersComponent, { frases: frases, onChange: this._onUsersSelected });
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: "sm",
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.ADD,
			cancelText: frases.CANCEL,
			submit: this._onSubmit,
			body: body
		});
	}

});

CreateGroupModalComponent = React.createFactory(CreateGroupModalComponent);
var ExtensionModalComponent = React.createClass({
	displayName: 'ExtensionModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func,
		generatePassword: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		getObjects: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			groups: [],
			imageFile: null,
			opened: false
		};
	},

	componentWillMount: function () {
		var kind = this.props.params.kind == 'user' ? 'users' : 'unit';
		this.props.getObjects(kind, function (result) {
			this.setState({ params: this.props.params, groups: result, opened: true });
		}.bind(this));
	},

	_onSubmit: function () {
		this.props.onSubmit({ params: this.state.params, file: this.state.imageFile }, function () {
			this.setState({ opened: false });
		}.bind(this));
	},

	_onChange: function (params) {
		this.setState({ params: params });
	},

	_onAvatarChange: function (params) {
		this.setState({ imageFile: params.file });
	},

	_getBody: function () {
		var frases = this.props.frases;
		return React.createElement(ExtensionComponent, {
			frases: frases,
			open: this.state.opened,
			params: this.props.params,
			groups: this.state.groups,
			onChange: this._onChange,
			generatePassword: this.props.generatePassword,
			convertBytes: this.props.convertBytes,
			onAvatarChange: this._onAvatarChange
		});
	},

	_getTitle: function () {
		return React.createElement(
			'span',
			null,
			React.createElement('span', { className: this.props.params.kind === 'user' ? 'icon-contact' : 'icon-landline' }),
			React.createElement(
				'span',
				{ style: { margin: "0 10px" } },
				this.props.params.name + " - " + this.props.params.ext
			)
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			titleObj: this._getTitle(),
			open: this.state.opened,
			type: 'success',
			submitText: frases.SUBMIT,
			cancelText: frases.CANCEL,
			submit: this.props.onSubmit && this._onSubmit,
			body: body
		});
	}

});

ExtensionModalComponent = React.createFactory(ExtensionModalComponent);
var TrunkSettingsModalComponent = React.createClass({
	displayName: 'TrunkSettingsModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		open: React.PropTypes.bool,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: null,
			lastFetchedOid: null,
			fetching: false,
			validationError: false
		};
	},

	componentWillMount: function () {
		var oid = this.props.params ? this.props.params.oid : 'trunk';
		var trunk = {};
		getObject(oid, function (result) {
			trunk = oid !== 'trunk' ? result : this._setDefaultParams(result);
			this.setState({ lastFetchedOid: oid, params: trunk, validationError: false });
		}.bind(this));
	},

	componentWillReceiveProps: function (props) {
		var oid = props.params ? props.params.oid : 'trunk';
		var trunk = {};
		if (oid !== this.state.lastFetchedOid) {
			getObject(oid, function (result) {
				trunk = oid !== 'trunk' ? result : this._setDefaultParams(result);
				this.setState({ lastFetchedOid: oid, params: trunk, validationError: false });
			}.bind(this));
		}
	},

	// shouldComponentUpdate: function(nextProps, nextState) {
	// 	console.log('TrunkSettingsModalComponent shouldComponentUpdate: ', nextProps, nextState);
	// 	if(nextProps.open !== this.props.open) return true;
	// 	else return false;
	// },

	_setDefaultParams: function (params) {
		var defaults = extend({}, params);
		defaults.type = 'external';
		defaults.register = true;
		defaults.protocol = 'sip';

		// var defaults = {
		// 	kind: "trunk",
		// 	oid: params.oid,
		// 	enabled: true,
		// 	name: "",
		// 	domain: "",
		// 	protocol: "sip",
		// 	protocols: ["sip", "sips", "wss"],
		// 	type: "external",
		// 	register: false,
		// 	proxy: false,
		// 	maxinbounds: params.maxinbounds,
		// 	maxoutbounds: params.maxoutbounds,
		// 	parameters: params.parameters,
		// 	inboundanumbertransforms: [],
		// 	inboundbnumbertransforms: [],
		// 	outboundanumbertransforms: [],
		// 	outboundbnumbertransforms: []
		// };
		return defaults;
	},

	_saveChanges: function () {
		var params = extend({}, this.state.params);
		if (!params.name || params.type === 'external' && !params.domain) {
			this.setState({ validationError: true });
			return notify_about('error', this.props.frases.USERS_GROUP.REQUIRED_FIELDS_MSG);
		}

		params.parameters.codecs = params.parameters.codecs.map(function (item) {
			delete item.enabled;return item;
		});

		this.setState({ fetching: true, validationError: false });

		setObject(this.state.params, { changeUrl: false }, function (err, result) {
			if (err) {
				this.setState({ fetching: false });
				return notify_about('error', err.message);
			}

			this.setState({ fetching: false });
			this.props.onSubmit(params);
		}.bind(this));
	},

	_isInnerParameter: function (param) {
		return param.split('.').length > 1;
	},

	_setInnerParameter: function (obj, str, value) {
		var keys = str.split('.');
		var scope = obj;
		keys.forEach(function (key, index) {
			scope = scope[key] || {};
			if (index === keys.length - 1) scope = value;
		});
	},

	_onChange: function (e) {
		var state = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute && target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		Utils.debug('_onChange: ', target.name, value);

		if (this._isInnerParameter(target.name)) this._setInnerParameter(state, target.name, type === 'number' ? parseFloat(value) : value);else state[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: state });
	},

	_onProtocolParamsChange: function (e) {
		var state = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.parameters[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: state });
	},

	_onCodecsParamsChange: function (list) {
		var state = extend({}, this.state.params);
		state.parameters.codecs = list;
		this.setState({ params: state });
	},

	_getBody: function () {
		if (this.state.params) {
			return React.createElement(TrunkConnectionComponent, {
				frases: this.props.frases,
				params: this.state.params,
				externalOnly: true,
				onChange: this._onChange,
				onProtocolParamsChange: this._onProtocolParamsChange,
				onCodecsParamsChange: this._onCodecsParamsChange,
				validationError: this.state.validationError
			});
		} else {
			return React.createElement(
				'div',
				{ className: 'text-center' },
				React.createElement(Spinner, null)
			);
		}
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: 'lg',
			type: 'success',
			title: frases.TRUNK.CREATE_NEW_TRUNK_MODAL_HEADER,
			submitText: frases.SUBMIT,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			onClose: this.props.onClose,
			closeOnSubmit: false,
			fetching: this.state.fetching,
			open: this.props.open,
			body: body
		});
	}

});

TrunkSettingsModalComponent = React.createFactory(TrunkSettingsModalComponent);
var UpdateLicenseModalComponent = React.createClass({
	displayName: 'UpdateLicenseModalComponent',


	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		sub: React.PropTypes.object,
		utils: React.PropTypes.object,
		onSubmit: React.PropTypes.func,
		countSubAmount: React.PropTypes.func,
		currencyNameToSymbol: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			quantity: 0,
			addOns: [],
			quantityChanged: false
		};
	},

	componentWillMount: function () {
		var addOns = this.props.sub.addOns.map(function (item) {
			item = extend({}, item);
			return item;
		});
		this.setState({
			quantity: this.props.sub.quantity,
			addOns: addOns
		});
	},

	_updateLicenses: function (params) {

		var getProration = this.props.utils.getProration;
		var sub = deepExtend({}, this.props.sub);

		sub.quantity = this.state.quantity;
		sub.addOns = this.state.addOns;
		sub.amount = this.props.countSubAmount(sub);

		Utils.debug('_updateLicenses', sub);

		var chargeAmount = 0;
		var totalAmount = parseFloat(sub.amount) - parseFloat(this.props.sub.amount);
		var proration = getProration(sub, totalAmount);

		if (totalAmount > 0) {
			chargeAmount = proration > 1 ? proration : 1;
		}

		Utils.debug('_updateLicenses2', chargeAmount, totalAmount, proration);

		this.props.onSubmit({
			addOns: sub.addOns,
			quantity: sub.quantity,
			annually: sub.plan.billingPeriodUnit === 'years',
			payment: {
				noCharge: chargeAmount <= 0,
				currencySymbol: this.props.currencyNameToSymbol(sub.plan.currency),
				currency: sub.plan.currency,
				newSubAmount: sub.amount,
				nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY'),
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2),
				totalAmount: totalAmount.toFixed(2)
			}
		});
	},

	_onQuantityChange: function (value) {
		if (value < 0 || value < this.props.options.users || value > this.props.sub.plan.attributes.maxusers) return;
		this.setState({ quantity: value, quantityChanged: true });
	},

	_onAddOnQuantityChange: function (addOnName, value) {
		if (value < 0 || addOnName === 'storage' && this.props.utils.convertBytes(value, 'GB', "Byte") < this.props.options.storesize) return;
		var addOns = this.state.addOns.map(function (item) {
			if (item.name === addOnName) item.quantity = value;return item;
		});

		this.setState({ addOns: addOns, quantityChanged: true });
	},

	_getBody: function () {
		var frases = this.props.frases;
		var readOnly = this.props.sub.plan.trialPeriod;
		return React.createElement(
			'div',
			null,
			React.createElement(AddLicenseItemComponent, { label: frases.USERS, quantity: this.state.quantity, onChange: this._onQuantityChange }),
			this.state.addOns.map(function (item) {
				return React.createElement(AddLicenseItemComponent, { key: item.name, label: item.name && frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description, quantity: item.quantity, onChange: this._onAddOnQuantityChange.bind(this, item.name), readOnly: readOnly });
			}.bind(this))
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getBody();

		return React.createElement(ModalComponent, {
			size: 'sm',
			title: frases.BILLING.UPDATE_LICENSES,
			submitText: frases.SUBMIT,
			cancelText: frases.CANCEL,
			submit: this._updateLicenses,
			closeOnSubmit: true,
			disabled: !this.state.quantityChanged,
			body: body
		});
	}

});

UpdateLicenseModalComponent = React.createFactory(UpdateLicenseModalComponent);
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
                                React.createElement('input', { type: 'checkbox', name: 'enabled', 'data-model': 'wss', checked: params.wss ? params.wss.enabled : '', onChange: this._onChange }),
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
function FunctionsOptionsComponent(props) {

	var frases = props.frases;
	var params = props.params;

	function _onChange(e) {
		var update = extend({}, params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : type === 'number' ? parseFloat(target.value) : target.value;

		update[target.name] = value !== null ? value : "";

		props.onChange(update);
	}

	function _onFileUpload(params) {
		// var update = extend({}, params);
		// var update = {};
		// var files = [];

		// files.push(params);
		// update.files = files;
		// update[params.name] = params.filename;

		props.onChange(params);
	}

	return React.createElement(
		'form',
		{ className: 'form-horizontal acc-cont' },
		React.createElement(
			'div',
			{ className: 'form-group' },
			React.createElement(
				'label',
				{ htmlFor: 'dialtimeout', className: 'col-sm-4 control-label', 'data-toggle': 'tooltip', title: frases.OPTS__DIAL_TIMEOUT },
				frases.SETTINGS.DIAL_TIMEOUT
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					'div',
					{ className: 'input-group' },
					React.createElement('input', { type: 'number', className: 'form-control', value: params.dialtimeout, name: 'dialtimeout', onChange: _onChange }),
					React.createElement(
						'span',
						{ className: 'input-group-addon' },
						frases.SECONDS
					)
				)
			)
		),
		React.createElement(
			'fieldset',
			{ style: { marginTop: "15px" } },
			React.createElement(
				'legend',
				null,
				frases.FUNCTIONS.CALLHOLD
			)
		),
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
				React.createElement(FileUpload, { frases: frases, name: 'holdmusicfile', value: params.holdmusicfile, onChange: _onFileUpload })
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
					React.createElement('input', { type: 'number', className: 'form-control', value: params.holdremindtime, name: 'holdremindtime', onChange: _onChange }),
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
					React.createElement('input', { type: 'number', className: 'form-control', value: params.holdrecalltime, name: 'holdrecalltime', onChange: _onChange }),
					React.createElement(
						'span',
						{ className: 'input-group-addon' },
						frases.SECONDS
					)
				)
			)
		),
		React.createElement(
			'fieldset',
			{ style: { marginTop: "15px" } },
			React.createElement(
				'legend',
				null,
				frases.FUNCTIONS.CALLTRANSFER
			)
		),
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
					React.createElement('input', { type: 'number', className: 'form-control', value: params.transferrecalltime, name: 'transferrecalltime', onChange: _onChange }),
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
				React.createElement('input', { type: 'text', className: 'form-control', value: params.transferrecallnumber, name: 'transferrecallnumber', onChange: _onChange })
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
						React.createElement('input', { type: 'checkbox', checked: params.autoretrive, name: 'autoretrive', onChange: _onChange }),
						' ',
						frases.SETTINGS.AUTORETURN
					)
				)
			)
		),
		React.createElement(
			'fieldset',
			{ style: { marginTop: "15px" } },
			React.createElement(
				'legend',
				null,
				frases.FUNCTIONS.CALLPARK
			)
		),
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
					React.createElement('input', { type: 'number', className: 'form-control', value: params.parkrecalltime, name: 'parkrecalltime', onChange: _onChange }),
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
				React.createElement('input', { type: 'text', className: 'form-control', value: params.parkrecallnumber, name: 'parkrecallnumber', onChange: _onChange })
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
					React.createElement('input', { type: 'number', className: 'form-control', value: params.parkdroptimeout, name: 'parkdroptimeout', onChange: _onChange }),
					React.createElement(
						'span',
						{ className: 'input-group-addon' },
						frases.SECONDS
					)
				)
			)
		)
	);
}
var GeneralOptionsComponent = React.createClass({
	displayName: 'GeneralOptionsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		singleBranch: React.PropTypes.bool,
		onChange: React.PropTypes.func,
		showChangePassSettings: React.PropTypes.func
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
						{ type: 'button', className: 'btn btn-default btn-block', role: 'button', onClick: this.props.showChangePassSettings },
						frases.SETTINGS.CHANGE_PASSWORD
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
		generateApiKey: React.PropTypes.func,
		deleteApiKey: React.PropTypes.func,
		showChangePassSettings: React.PropTypes.func,
		singleBranch: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			files: [],
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
		var params = this.state.params ? extend({}, this.state.params) : {};
		var branchParams = this.state.branchParams;
		var options = this.state.options;
		var files = [].concat(this.state.files);

		if (params.adminpass && params.adminpass !== params.confirmpass) {
			return alert(this.props.frases.OPTS__PWD_UNMATCH);
		} else {
			delete params.confirmpass;
		}

		params.extensions = this._poolToArray(this.poolEl.value);

		if (options) params.options = options;
		if (files) params.files = files;

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

		this.setState({
			params: params
		});
	},

	_handleOnFuncOptionsChange: function (params) {
		var keys = Object.keys(params);
		var state = extend({}, this.state.options);
		var files = [].concat(this.state.files);

		if (!keys || !keys.length) return;
		// var state = extend({}, this.state.options, params);
		// var newState = this.state.newOptions || {};

		// if(params.file) params.files = params.files.reduce(function(array, item) { array.push(item.file); return array; }, []);
		if (params.file !== undefined) {
			if (params.file) files = files.concat([params.file]);
			state[params.name] = params.filename;
		} else {
			state = extend(state, params);
		}

		// keys.forEach(function(key) {
		// 	state[key] = params[key];
		// newState[key] = params[key];
		// });
		// newState[keys[0]] = params[keys[0]];

		this.setState({ options: state, files: files });
	},

	_handleOnGdprSettsChange: function (gdprParams) {
		var params = this.state.params;
		params.gdpr = gdprParams;
		this.setState({
			params: params
		});
	},

	_handleOnTemplatesSettsChange: function (newParams) {
		var params = this.state.params;
		params.properties = newParams;
		this.setState({
			params: params
		});
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
								{ href: '#tab-security-options', 'aria-controls': 'security-tab', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.SECURITY.SECURITY_SETTS
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-functions-options', 'aria-controls': 'functions-tab', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.FUNCSETTINGS
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-api-keys', 'aria-controls': 'api-keys-queue', role: 'tab', 'data-toggle': 'tab' },
								'API Keys'
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-gdpr-setts', 'aria-controls': 'gdpr-settings', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.GDPR_SETTS
							)
						),
						React.createElement(
							'li',
							{ role: 'presentation' },
							React.createElement(
								'a',
								{ href: '#tab-templates', 'aria-controls': 'templates-settings', role: 'tab', 'data-toggle': 'tab' },
								frases.SETTINGS.TEMPLATES_SETTS
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
							React.createElement(GeneralOptionsComponent, { frases: this.props.frases, singleBranch: this.props.singleBranch, params: params, onChange: this._handleOnChange, setPoolEl: this._setPoolEl, showChangePassSettings: this.props.showChangePassSettings })
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
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-api-keys' },
							React.createElement(ApiKeysComponent, { frases: this.props.frases, params: params, generateApiKey: this.props.generateApiKey, deleteApiKey: this.props.deleteApiKey })
						),
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-gdpr-setts' },
							React.createElement(GdprSettingsComponent, { frases: this.props.frases, params: params, onChange: this._handleOnGdprSettsChange })
						),
						React.createElement(
							'div',
							{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-templates' },
							React.createElement(TemplatesSettingsComponent, { frases: this.props.frases, params: params.properties, onChange: this._handleOnTemplatesSettsChange })
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
function RealtimeCallsComponent(props) {

	var frases = props.frases;
	var data = props.data;

	return React.createElement(
		"div",
		{ className: "table-responsive" },
		data.length ? React.createElement(
			"table",
			{ className: "table" },
			React.createElement(
				"tbody",
				null,
				data.map(function (call) {
					return React.createElement(
						"tr",
						{ key: call.called + '_' + call.caller + '_' + call.time },
						React.createElement(
							"td",
							null,
							call.caller
						),
						React.createElement(
							"td",
							{ className: "text-primary" },
							React.createElement("i", { className: "fa fa-fw fa-arrow-right" })
						),
						React.createElement(
							"td",
							null,
							call.called
						),
						React.createElement(
							"td",
							null,
							formatTimeString(call.time, 'hh:mm:ss')
						)
					);
				})
			)
		) : React.createElement(
			"span",
			null,
			frases.REALTIME.NO_DATA
		)
	);
}
function RealtimeDashboardComponent(props) {

	var frases = props.frases;
	var state = props.data.state;
	var load = (state.load ? parseFloat(state.load) : 0).toFixed(1);

	return React.createElement(
		"div",
		null,
		React.createElement(
			PanelComponent,
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-6 col-sm-3" },
					React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-arrow-down", desc: frases.STATISTICS.INCOMING_CALLS, index: state.in || 0 })
				),
				React.createElement(
					"div",
					{ className: "col-xs-6 col-sm-3" },
					React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-arrow-up", desc: frases.STATISTICS.OUTGOING_CALLS, index: state.out || 0 })
				),
				React.createElement(
					"div",
					{ className: "col-xs-6 col-sm-3" },
					React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-link", desc: frases.STATISTICS.CONNECTEDCALLS, index: state.conn || 0 })
				),
				React.createElement(
					"div",
					{ className: "col-xs-6 col-sm-3" },
					React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-dashboard", desc: frases.STATISTICS.LINES_PAYLOAD, index: load })
				)
			)
		),
		React.createElement(
			PanelComponent,
			{ header: frases.REALTIME.TRUNKS_PANEL.TITLE },
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(RealtimeTrunksComponent, { frases: frases, data: props.data.trunks })
				)
			)
		),
		React.createElement(
			PanelComponent,
			{ header: frases.REALTIME.CALLS_PANEL.TITLE },
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(RealtimeCallsComponent, { frases: frases, extensions: props.data.extensions, data: props.data.calls })
				)
			)
		)
	);
}
function RealtimeTrunksComponent(props) {

	var frases = props.frases;
	var data = props.data;
	var indexStyle = {
		fontSize: "1.2em"
	};

	return React.createElement(
		"div",
		{ className: "table-responsive" },
		data.length ? React.createElement(
			"table",
			{ className: "table" },
			React.createElement(
				"thead",
				null,
				React.createElement(
					"tr",
					null,
					React.createElement("th", null),
					React.createElement("th", null),
					React.createElement(
						"th",
						null,
						React.createElement("span", { className: "fa fa-arrow-down text-primary" })
					),
					React.createElement(
						"th",
						null,
						React.createElement("span", { className: "fa fa-arrow-up text-danger" })
					),
					React.createElement(
						"th",
						null,
						React.createElement("span", { className: "fa fa-dashboard text-primary" })
					),
					React.createElement("th", null)
				)
			),
			React.createElement(
				"tbody",
				null,
				data.map(function (trunk) {
					return React.createElement(
						"tr",
						{ key: trunk.oid },
						React.createElement(
							"td",
							null,
							React.createElement("span", { className: "fa fa-circle text-" + (trunk.enabled ? 'active' : 'muted') })
						),
						React.createElement(
							"td",
							null,
							trunk.type === 'system' ? React.createElement(
								"span",
								null,
								trunk.name
							) : React.createElement(
								"a",
								{ href: "#trunk/" + trunk.oid },
								trunk.name
							)
						),
						React.createElement(
							"td",
							{ style: indexStyle },
							React.createElement(
								"span",
								null,
								trunk.in
							)
						),
						React.createElement(
							"td",
							{ style: indexStyle },
							React.createElement(
								"span",
								null,
								trunk.out
							)
						),
						React.createElement(
							"td",
							{ style: indexStyle },
							React.createElement(
								"span",
								null,
								parseFloat(trunk.load).toFixed(1) + '%'
							)
						),
						React.createElement(
							"td",
							null,
							trunk.address
						)
					);
				})
			)
		) : React.createElement(
			"span",
			null,
			frases.REALTIME.NO_DATA
		)
	);
}
function UserProfileCOmponent(props) {

	function _getFooter() {
		return React.createElement(
			"div",
			null,
			React.createElement(
				"button",
				{ className: "btn btn-success", role: "button", onClick: props.onSubmit },
				props.frases.SUBMIT
			)
		);
	}

	return React.createElement(
		PanelComponent,
		null,
		React.createElement(ExtensionComponent, {
			frases: props.frases,
			params: props.params,
			groups: props.groups,
			generatePassword: props.generatePassword,
			convertBytes: props.convertBytes,
			onChange: props.onChange,
			onAvatarChange: props.onAvatarChange
		}),
		props.onSubmit && _getFooter()
	);
}

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
										data.lat1
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
										data.lat2
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
var UsersRegHistoryBarComponent = React.createClass({
	displayName: 'UsersRegHistoryBarComponent',


	propTypes: {
		frases: React.PropTypes.object,
		users: React.PropTypes.array,
		selectedUser: React.PropTypes.object,
		onUserSelect: React.PropTypes.func,
		onDateSelect: React.PropTypes.func,
		onFilterSet: React.PropTypes.func,
		filterByIp: React.PropTypes.string,
		getData: React.PropTypes.func
	},

	_onUserSelect: function (option) {
		var user = this.props.users.filter(function (item) {
			return item.userid === option.value;
		});
		this.props.onUserSelect(user[0] || {});
	},

	render: function () {
		var users = this.props.users.map(function (item) {
			item.value = item.userid;
			item.label = (item.ext ? item.ext + ' - ' : '') + item.name + (item.info && item.info.email ? " (" + item.info.email + ")" : "");
			return item;
		});

		return React.createElement(
			PanelComponent,
			null,
			React.createElement(
				'form',
				{ className: 'form-inline' },
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-sm-3' },
						React.createElement(Select3, { placeholder: this.props.frases.REG_HISTORY.SELECT_USER_PLACEHOLDER, inputStyles: { width: "100%" }, value: this.props.selectedUser, options: users, onChange: this._onUserSelect }),
						React.createElement('br', null)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-3' },
						React.createElement('input', { type: 'text', placeholder: this.props.frases.REG_HISTORY.IP_FILTER_PLACEHOLDER, style: { width: "100%" }, className: 'form-control', value: this.props.filterByIp, onChange: this.props.onFilterSet }),
						React.createElement('br', null)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-3' },
						React.createElement(DatePickerComponent, { frases: this.props.frases, onClick: this.props.onDateSelect, actionButton: false }),
						React.createElement('br', null)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-3' },
						React.createElement(
							'button',
							{ type: 'button', className: 'btn btn-block btn-primary', onClick: this.props.getData },
							this.props.frases.REG_HISTORY.SEARCH_BTN
						)
					)
				)
			)
		);
	}
});

UsersRegHistoryBarComponent = React.createFactory(UsersRegHistoryBarComponent);
var UsersRegHistoryComponent = React.createClass({
	displayName: 'UsersRegHistoryComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			users: [],
			selectedUser: {},
			date: {},
			data: [],
			fetching: false,
			filterByIp: ""
		};
	},

	componentWillMount: function () {
		this._getUsers();
	},

	_getUsers: function () {
		var users = [];
		getExtensions(function (result) {
			users = filterObject(result, ['user', 'phone']);
			users = sortByKey(users, 'name');
			this.setState({ users: users });
		}.bind(this));
	},

	_getRegHistory: function () {
		var params = {
			userid: this.state.selectedUser.userid,
			begin: this.state.date.begin,
			end: this.state.date.end
		};

		this.setState({ fetching: true });

		json_rpc_async('getUserRegistrationsHistory', params, this._setRegHistory);
	},

	_setRegHistory: function (data) {
		var filterByIp = this.state.filterByIp;
		if (filterByIp) data = data.filter(function (item) {
			return item.iaddr === filterByIp;
		});
		this.setState({ data: data, fetching: false });
	},

	_onUserSelect: function (user) {
		this.setState({ selectedUser: user });
	},

	_onFilterSet: function (e) {
		this.setState({ filterByIp: e.target.value.trim() });
	},

	_onDateSelect: function (params) {
		this.setState({ date: params.date });
	},

	render: function () {

		return React.createElement(
			'div',
			null,
			React.createElement(UsersRegHistoryBarComponent, {
				frases: this.props.frases,
				users: this.state.users,
				selectedUser: this.state.selectedUser,
				onUserSelect: this._onUserSelect,
				onDateSelect: this._onDateSelect,
				onFilterSet: this._onFilterSet,
				filterByIp: this.state.filterByIp,
				getData: this._getRegHistory
			}),
			React.createElement(UsersRegHistoryMainComponent, { frases: this.props.frases, data: this.state.data, fetching: this.state.fetching })
		);
	}
});

UsersRegHistoryComponent = React.createFactory(UsersRegHistoryComponent);
function UsersRegHistoryMainComponent(props) {

	return React.createElement(
		"div",
		null,
		props.fetching ? React.createElement(Spinner, null) : props.data.length ? React.createElement(
			"div",
			null,
			React.createElement(UsersRegHistoryTotalsComponent, { frases: props.frases, data: props.data }),
			React.createElement(UsersRegHistoryTableComponent, { frases: props.frases, data: props.data })
		) : React.createElement(
			PanelComponent,
			null,
			React.createElement(
				"h5",
				null,
				props.frases.REG_HISTORY.NO_DATA
			)
		)
	);
}
function UsersRegHistoryTableComponent(props) {

	var frases = props.frases;

	return React.createElement(
		"div",
		null,
		props.data && props.data.length ? React.createElement(
			PanelComponent,
			null,
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
								frases.REG_HISTORY.REG_TIME
							),
							React.createElement(
								"th",
								null,
								frases.REG_HISTORY.UNREG_TIME
							),
							React.createElement(
								"th",
								null,
								frases.REG_HISTORY.REG_DURATION
							),
							React.createElement(
								"th",
								null,
								frases.REG_HISTORY.DEV_INFO
							)
						)
					),
					React.createElement(
						"tbody",
						null,
						props.data.map(function (item) {
							return React.createElement(
								"tr",
								{ key: item.rid + "_" + item.treg },
								React.createElement(
									"td",
									null,
									item.treg ? moment(item.treg).format('DD/MM/YY HH:mm') : "N/A"
								),
								React.createElement(
									"td",
									null,
									item.tunreg ? moment(item.tunreg).format('DD/MM/YY HH:mm') : "N/A"
								),
								React.createElement(
									"td",
									null,
									item.tunreg ? formatTimeString((item.tunreg - item.treg) / 1000) : "N/A"
								),
								React.createElement(
									"td",
									null,
									item.devinfo
								)
							);
						})
					)
				)
			)
		) : null
	);
}
function UsersRegHistoryTotalsComponent(props) {

	var lastReg = props.data[0];
	var firstReg = props.data[props.data.length - 1];
	var totalDuration = props.data.reduce(function (total, next) {
		total += next.tunreg ? next.tunreg - next.treg : 0;return total;
	}, 0);

	return React.createElement(
		PanelComponent,
		null,
		React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-sm-4 text-center" },
				React.createElement(
					"h5",
					null,
					props.frases.REG_HISTORY.FIRST_REG
				),
				React.createElement(
					"h4",
					null,
					firstReg.treg ? moment(firstReg.treg).format('DD/MM/YY HH:mm') : "N/A"
				)
			),
			React.createElement(
				"div",
				{ className: "col-sm-4 text-center" },
				React.createElement(
					"h5",
					null,
					props.frases.REG_HISTORY.LAST_REG
				),
				React.createElement(
					"h4",
					null,
					lastReg.tunreg ? moment(lastReg.tunreg).format('DD/MM/YY HH:mm') : "N/A"
				)
			),
			React.createElement(
				"div",
				{ className: "col-sm-4 text-center" },
				React.createElement(
					"h5",
					null,
					props.frases.REG_HISTORY.TOTAL_DURATION
				),
				React.createElement(
					"h4",
					null,
					totalDuration ? formatTimeString(totalDuration / 1000) : "N/A"
				)
			)
		)
	);
}
var ServicesComponent = React.createClass({
	displayName: "ServicesComponent",


	propTypes: {
		frases: React.PropTypes.object,
		services: React.PropTypes.array,
		ldap: React.PropTypes.object,
		saveOptions: React.PropTypes.func,
		saveLdapOptions: React.PropTypes.func,
		onImportUsers: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			services: [],
			ldap: null
		};
	},

	componentWillMount: function () {
		this.setState({
			services: this.props.services || [],
			ldap: this.props.ldap || null
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			services: props.services || [],
			ldap: props.ldap || null
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
						ldap ? React.createElement(LdapOptionsComponent, { params: ldap, frases: frases, onSave: this._saveLdapOptions }) : null,
						services.map(function (item, index) {
							return React.createElement(ServiceItemComponent, {
								key: item.id,
								index: index,
								params: item,
								frases: frases,
								onSave: this._saveOptions.bind(this, index),
								onImport: this.props.onImportUsers
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
			{ className: 'panel panel-default', style: { borderRadius: 0, boxShadow: "none", border: "none", borderBottom: "1px solid #eee" } },
			React.createElement(
				'div',
				{
					className: 'panel-heading',
					role: 'tab',
					style: { backgroundColor: 'white', padding: "20px 15px" },
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
		onSave: React.PropTypes.func,
		onImport: React.PropTypes.func
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
		this.props.onSave(this.state.params);
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

	_importUsers: function () {
		this.props.onImport(this.state.params);
	},

	_isActiveDirectory: function (types) {
		return types & 1 !== 0;
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

		return React.createElement(
			'div',
			{ className: 'panel panel-default', style: { borderRadius: 0, boxShadow: "none", border: "none", borderBottom: "1px solid #eee" } },
			React.createElement(
				'div',
				{
					className: 'panel-heading',
					role: 'tab',
					style: { backgroundColor: 'white', padding: "20px 15px" },
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
									{ type: 'button', className: 'btn btn-block btn-success btn-md', onClick: this._saveServiceProps },
									React.createElement('i', { className: 'fa fa-check fa-fw' }),
									' ',
									this.props.frases.SAVE
								)
							),
							this.props.params.state && !this._isActiveDirectory(this.props.params.types) ? React.createElement(
								'div',
								{ className: 'col-sm-4 col-sm-offset-4' },
								React.createElement('br', null),
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-block btn-default btn-md', onClick: this._importUsers },
									React.createElement('i', { className: 'fa fa-cloud-download fa-fw' }),
									' ',
									this.props.frases.IMPORT
								)
							) : null
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
var SideBarComponent = React.createClass({
	displayName: 'SideBarComponent',


	propTypes: {
		menuItems: React.PropTypes.array,
		selectedMenu: React.PropTypes.object,
		activeKind: React.PropTypes.string,
		activeItem: React.PropTypes.string,
		selectKind: React.PropTypes.func,
		objects: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	componentWillMount: function () {
		this.setState({ availableItems: this.props.menuItems.map(function (item) {
				return item.name;
			}) });
	},

	componentDidMount: function () {
		$('.side-panel [data-toggle="tooltip"]').tooltip({
			delay: { "show": 200 },
			trigger: 'hover'
		});
	},

	getInitialState: function () {
		return {
			availableItems: []
		};
	},

	_logOut: function () {
		window.logout();
	},

	_selectMenu: function (name) {
		this.props.selectKind(name);
	},

	_sortObjects: function (array) {
		return array.reduce(function (result, item) {
			result[item.kind] = result[item.kind] || [];
			result[item.kind].push(item);
			return result;
		}, {});
	},

	_channelTypeToIconName: function (type) {
		var types = {
			'Telephony': 'did.png',
			'FacebookMessenger': 'facebook.png',
			'Email': 'email.png',
			'Viber': 'viber.ico',
			'Telegram': 'telegram.png',
			'WebChat': 'webchat.png',
			'Webcall': 'webchat.png'
		};

		return types[type];
	},

	_buildItemsMenu: function (objects, activeItem) {
		var channelTypeToIconName = this._channelTypeToIconName;

		// {
		// 	item.type ? (
		// 		<img 
		// 			style={{
		// 				width: "1.2em",
		// 				verticalAlign: "top",
		// 				marginRight: "6px"
		// 			}}
		// 			src={"/badmin/images/channels/" + channelTypeToIconName(item.type)} 
		// 		/>
		// 	) : null	
		// }

		function getItemClass(item) {
			var className = "ellipsis nav-link ";
			className += activeItem === item.oid ? "active " : " ";
			// if(item.enabled !== undefined) className += (item.enabled === false ? "disabled" : "");
			if (item.up !== undefined) className += item.up ? "" : "unregistered";
			return className;
		}

		return objects.map(function (item) {
			return React.createElement(
				'li',
				{ key: item.oid },
				React.createElement(
					'a',
					{
						href: "#" + item.kind + (item.oid ? "/" + item.oid : ""),
						className: getItemClass(item),
						title: item.name
					},
					React.createElement(
						'span',
						null,
						item.name
					)
				),
				React.createElement('span', null)
			);
		});
	},

	render: function () {
		var frases = this.props.frases;
		var activeKind = this.props.activeKind;
		var activeItem = this.props.activeItem;
		var selectedMenu = this.props.selectedMenu;
		var objects = this.props.objects;
		var sortedObjects = this._sortObjects(objects);

		if (!this.state.availableItems.length) return null;
		return React.createElement(
			'div',
			{ className: 'sidebar-wrapper' },
			React.createElement(
				'div',
				{ className: 'side-panel' },
				React.createElement(
					'div',
					{ className: 'nav-top' },
					React.createElement(
						'a',
						{ href: '#realtime', className: 'small-logo' },
						React.createElement('img', { src: '/badmin/images/small-logo.png', alt: 'logo' })
					)
				),
				React.createElement(
					'div',
					{ className: 'nav-menu' },
					React.createElement(SideMenuComponent, { frases: frases, menuItems: this.props.menuItems, selectMenu: this._selectMenu, activeKind: activeKind })
				),
				React.createElement(
					'div',
					{ className: 'nav-bottom' },
					this.state.availableItems.indexOf('settings') !== -1 && React.createElement(
						'a',
						{
							href: '#',
							className: "nav-link " + (activeKind === 'settings' ? 'active' : ''),
							onClick: function (e) {
								e.preventDefault();this._selectMenu('settings');
							}.bind(this),
							'data-toggle': 'tooltip', 'data-placement': 'right',
							title: frases.KINDS['settings']
						},
						React.createElement('i', { className: 'fa fa-fw fa-cog' })
					),
					React.createElement(
						'a',
						{
							href: '#',
							className: 'nav-link',
							onClick: function (e) {
								e.preventDefault();this._logOut();
							}.bind(this),
							'data-toggle': 'tooltip', 'data-placement': 'right',
							title: frases.LOGOUT
						},
						React.createElement('i', { className: 'fa fa-fw fa-sign-out' })
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'nav-list' },
				selectedMenu.objects ? React.createElement(
					'ul',
					null,
					selectedMenu.objects.map(function (item) {
						if (item.kind) {
							return React.createElement(
								'li',
								{ key: item.kind },
								React.createElement(
									'a',
									{ href: "#" + item.kind, className: "nav-link " + (activeItem === item.kind ? "active" : "") + (item.standout ? " standout" : "") },
									item.iconClass ? React.createElement('i', { className: item.iconClass, style: { marginRight: '10px' } }) : null,
									frases.KINDS[item.kind]
								)
							);
						} else {
							return null;
						}
					})
				) : null,
				selectedMenu.fetchKinds ? selectedMenu.fetchKinds.map(function (kind) {
					if (!kind) return null;

					return React.createElement(
						'ul',
						{ key: kind },
						React.createElement(
							'li',
							null,
							React.createElement(
								'span',
								{ className: 'nav-header' },
								frases.KINDS[kind]
							)
						),
						PbxObject.permissionsObject && PbxObject.permissionsObject[kind] < 7 ? null : React.createElement(
							'li',
							null,
							React.createElement(
								'a',
								{ href: "#" + kind + "/" + kind, className: 'nav-link' },
								React.createElement('i', { className: 'fa fa-fw fa-plus-circle' }),
								' ',
								selectedMenu.type === 'group' ? frases.CREATE_GROUP : frases.CREATE
							)
						),
						sortedObjects[kind] ? this._buildItemsMenu(sortedObjects[kind], activeItem) : null
					);
				}.bind(this)) : null
			)
		);
	}
});

SideBarComponent = React.createFactory(SideBarComponent);
function SideMenuComponent(props) {

	function getItemClass(item) {
		var className = "nav-link ";
		className += props.activeKind === item.name ? "active " : " ";
		if (item.enabled !== undefined) className += item.enabled ? "enabled" : "disabled";
		if (item.up !== undefined) className += item.up ? "" : "unregistered";
		return className;
	}

	return React.createElement(
		"ul",
		null,
		props.menuItems.map(function (item) {
			if (item.shouldRender === false) return null;
			return React.createElement(
				"li",
				{ key: item.name },
				React.createElement(
					"a",
					{
						href: item.link ? item.link : "#",
						className: getItemClass(item),
						"data-toggle": "tooltip", "data-placement": "right",
						title: props.frases.KINDS[item.name],
						onClick: function (e) {
							if (!item.link) e.preventDefault();props.selectMenu(item.name);
						} },
					React.createElement("i", { className: item.iconClass })
				)
			);
		})
	);
}
var SelectorComponent = React.createClass({
	displayName: 'SelectorComponent',


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
			files: null,
			validationError: false
			// filteredMembers: []
		};
	},

	componentWillMount: function () {
		// var params = extend({}, this.props.params);
		// var members = [].concat(params.members);

		this.setState({ params: this.props.params });
	},

	componentWillReceiveProps: function (props) {
		this.setState({ params: props.params });
	},

	_setObject: function () {
		var params = extend({}, this.state.params);

		if (!params.owner) {
			if (!params.members.length) {
				this.setState({ validationError: true });
				return notify_about('error', this.props.frases.MISSEDFILED);
			} else {
				params.owner = params.members[0].ext;
			}
		} else {
			this.setState({ validationError: false });
		}

		// params.options = this.state.params.options;
		if (this.state.files) params.files = [].concat(this.state.files);
		// params.route = this.state.route;

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
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if (target.name === 'owner') {
			params[target.name] = value;
		} else {
			params.options[target.name] = type === 'number' ? parseFloat(value) : value;
		}

		this.setState({
			params: params
		});
	},

	_onFileUpload: function (params) {
		var state = extend({}, this.state);
		var found = false;

		state.files = state.files || [];

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

		state.params.options[params.name] = params.filename;
		state.files = files;

		this.setState(state);
	},

	_onRouteChange: function (route) {
		this.setState({
			route: route
		});
	},

	_onSortMember: function (array) {
		var newParams = extend({}, this.state.params);
		newParams.members = array;

		this.setState({
			params: newParams
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];

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
				onCancel: this.props.removeObject
			}),
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(GroupMembersComponent, { frases: frases, members: members, getExtension: this.props.getExtension, onAddMembers: this._onAddMembers, deleteMember: this.props.deleteMember })
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS },
						React.createElement(SelectorSettingsComponent, { frases: frases, validationError: this.state.validationError, params: params, onChange: this._handleOnChange, onFileUpload: this._onFileUpload })
					)
				)
			)
		);
	}
});

SelectorComponent = React.createFactory(SelectorComponent);
function SelectorSettingsComponent(props) {

	var frases = props.frases;
	var params = props.params.options;
	var formats = ["OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080"];
	var onChange = props.onChange;
	var members = props.params.members;

	function getOwnerOptions() {
		if (!members.length) {
			return React.createElement(
				"p",
				{ className: "form-control-static" },
				frases.SELECTOR.NO_MEMBERS_FOR_OWNER_MESSAGE
			);
		} else {
			return React.createElement(
				"select",
				{ name: "owner", className: "form-control", value: props.params.owner, onChange: onChange, required: true },
				members.map(function (item) {
					return React.createElement(
						"option",
						{ key: item.ext, value: item.ext },
						item.ext,
						" - ",
						item.name
					);
				})
			);
		}
	}

	return React.createElement(
		"form",
		{ className: "form-horizontal", autoComplete: "off" },
		React.createElement(
			"div",
			{ className: "form-group " + (props.validationError && !props.params.owner ? 'has-error' : '') },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.INITIATOR
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				getOwnerOptions()
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.CONFINIT.CONFINIT
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"select",
					{ name: "initmode", value: params.initmode, className: "form-control", onChange: onChange },
					React.createElement(
						"option",
						{ value: "0" },
						frases.CONFINIT.LISTENONLY
					),
					React.createElement(
						"option",
						{ value: "1" },
						frases.CONFINIT.TALKANDLISTEN
					),
					React.createElement(
						"option",
						{ value: "2" },
						frases.CONFINIT.PLAYGREET
					),
					React.createElement(
						"option",
						{ value: "3" },
						frases.CONFINIT.MULTINODE
					)
				)
			)
		),
		params.initmode === "2" || params.initmode === 2 ? React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.CONFINIT.GREETFILE,
				":"
			),
			React.createElement(
				"div",
				{ className: "col-sm-8" },
				React.createElement(FileUpload, { frases: frases, name: "onholdfile", value: params.onholdfile, onChange: props.onFileUpload })
			)
		) : null,
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.VIDEOFORMAT
			),
			React.createElement(
				"div",
				{ className: "col-sm-4" },
				React.createElement(
					"select",
					{ className: "form-control", name: "videomode", value: params.videomode, onChange: onChange },
					formats.map(function (item) {
						return React.createElement(
							"option",
							{ key: item, value: item },
							item
						);
					})
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.CALLTOUT
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement("input", { type: "number", className: "form-control", name: "dialtimeout", value: params.dialtimeout, onChange: onChange }),
					React.createElement(
						"span",
						{ className: "input-group-addon" },
						frases.SECONDS
					)
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"div",
				{ className: "col-sm-offset-4 col-sm-8" },
				React.createElement(
					"div",
					{ className: "checkbox" },
					React.createElement(
						"label",
						null,
						React.createElement("input", { type: "checkbox", name: "initcalls", checked: params.initcalls, onChange: onChange }),
						" ",
						frases.INITCONFCALL
					)
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"div",
				{ className: "col-sm-offset-4 col-sm-8" },
				React.createElement(
					"div",
					{ className: "checkbox" },
					React.createElement(
						"label",
						null,
						React.createElement("input", { type: "checkbox", name: "autoredial", checked: params.autoredial, onChange: onChange }),
						" ",
						frases.AUTOREDIAL
					)
				)
			)
		),
		React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"div",
				{ className: "col-sm-offset-4 col-sm-8" },
				React.createElement(
					"div",
					{ className: "checkbox" },
					React.createElement(
						"label",
						null,
						React.createElement("input", { type: "checkbox", name: "recording", checked: params.recording, onChange: onChange }),
						" ",
						frases.FUNCTIONS.RECORDING
					)
				)
			)
		),
		params.recording ? React.createElement(
			"div",
			{ className: "form-group" },
			React.createElement(
				"label",
				{ className: "col-sm-4 control-label" },
				frases.REC_TIME
			),
			React.createElement(
				"div",
				{ className: "col-sm-6" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement("input", { type: "number", className: "form-control", name: "rectime", value: params.rectime, onChange: onChange }),
					React.createElement(
						"span",
						{ className: "input-group-addon" },
						frases.SECONDS
					)
				)
			)
		) : null,
		React.createElement(
			"div",
			{ className: "object-type local" },
			React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"div",
					{ className: "col-sm-offset-4 col-sm-8" },
					React.createElement(
						"div",
						{ className: "checkbox" },
						React.createElement(
							"label",
							null,
							React.createElement("input", { type: "checkbox", name: "greeting", checked: params.greeting, onChange: onChange }),
							" ",
							frases.PLAYGREET
						)
					)
				)
			),
			params.greeting ? React.createElement(
				"div",
				{ className: "form-group" },
				React.createElement(
					"label",
					{ className: "col-sm-4 control-label" },
					frases.GREETNAME,
					":"
				),
				React.createElement(
					"div",
					{ className: "col-sm-8" },
					React.createElement(FileUpload, { frases: frases, name: "greetingfile", value: params.greetingfile, onChange: props.onFileUpload })
				)
			) : null
		)
	);
}
function StepGuideFooter() {
	return React.createElement(
		"div",
		null,
		"Footer"
	);
}
function StepGuideHead() {
	return React.createElement(
		"div",
		null,
		"Head"
	);
}
var StepGuide = React.createClass({
	displayName: "StepGuide",


	propTypes: {
		frases: React.PropTypes.object,
		header: React.PropTypes.element,
		steps: React.PropTypes.array,
		footer: React.PropTypes.element
	},

	// getInitialState: function() {
	// 	return {
	// 		stepIndex: 0
	// 	}
	// },

	// _onStepSelect: function(index) {
	// 	this._setStepIndex(index);
	// },

	// _toNext: function() {
	// 	this._setStepIndex(this.state.stepIndex++);
	// },

	// _toPrev: function() {
	// 	this._setStepIndex(this.state.stepIndex--);
	// },

	// _setStepIndex: function(index) {
	// 	this.setState({ stepIndex: (index < 0 ? 0 : (index > this.props.steps.length ? this.props.steps.length-1 : index)) });
	// },

	render: function () {
		// var currStep = this.props.steps[this.state.stepIndex];

		var frases = this.props.frases;

		return React.createElement(
			"div",
			null,
			this.props.header,
			this.props.steps.map(function (item, index) {
				return React.createElement(StepGuideStep, { frases: frases, key: index, params: item, stepIndex: index + 1 });
			}),
			this.props.footer
		);
	}

});

StepGuide = React.createFactory(StepGuide);

var UsageComponent = React.createClass({
	displayName: 'UsageComponent',


	propTypes: {
		options: React.PropTypes.object,
		frases: React.PropTypes.object,
		storageInfo: React.PropTypes.array,
		fileStorage: React.PropTypes.array,
		extensions: React.PropTypes.array,
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

	_normalize: function (list, key) {
		return list.reduce(function (result, item) {
			result[item[key]] = item;
			return result;
		}, {});
	},

	render: function () {
		var frases = this.props.frases;
		var options = this.props.options;
		var storesize = this._convertBytes(options.storesize, 'Byte', 'GB');
		var storelimit = this._convertBytes(options.storelimit, 'Byte', 'GB');
		var extensions = this._normalize(this.props.extensions || [], 'ext');

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
				PanelComponent,
				null,
				React.createElement(
					'div',
					{ className: 'row text-center' },
					React.createElement(
						'div',
						{ className: 'col-sm-4', style: { marginBottom: "10px" } },
						React.createElement(
							'h3',
							null,
							React.createElement(
								'small',
								null,
								frases.STORAGE.USED_SPACE
							)
						),
						React.createElement(
							'h3',
							null,
							parseFloat(storesize).toFixed(2)
						),
						React.createElement(
							'p',
							null,
							'GB'
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4', style: { marginBottom: "10px" } },
						React.createElement(
							'h3',
							null,
							React.createElement(
								'small',
								null,
								frases.STORAGE.TOTAL_SPACE
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
							'GB'
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4', style: { marginBottom: "10px" } },
						React.createElement(
							'h3',
							null,
							React.createElement(
								'small',
								null,
								frases.STORAGE.FREE_SPACE
							)
						),
						React.createElement(
							'h3',
							null,
							parseFloat(storelimit - storesize).toFixed(2)
						),
						React.createElement(
							'p',
							null,
							'GB'
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
					React.createElement(UsersStorageComponent, { frases: frases, data: this.props.storageInfo, extensions: extensions })
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
			fetch: false,
			data: {},
			modalId: 'storage-settings',
			validationError: false
		};
	},

	componentDidMount: function () {
		this.setState({ data: this.props.data || {}, open: this.props.open });
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data || {}, open: nextProps.open });
	},

	_onChange: function (e) {
		var target = e.target;
		var data = this.state.data;
		data[target.name] = target.type === 'number' ? parseFloat(target.value) : target.value;
		this.setState(data);
	},

	_saveChanges: function () {
		var data = this.state.data;

		if (!data.path || !data.maxsize) return this.setState({ validationError: true });

		this.setState({ fetch: true, validationError: false });

		this.props.onSubmit({
			id: data.id,
			path: data.path,
			maxsize: data.maxsize,
			state: data.state
		}, function (err) {
			if (err) {
				this.setState({ fetch: false });
				return notify_about('error', err.message);
			}
			this.setState({ fetch: false, open: false });
		}.bind(this));
	},

	_getModalBody: function () {

		return React.createElement(
			'div',
			{ className: 'row' },
			React.createElement(
				'form',
				{ role: 'form' },
				React.createElement('input', { type: 'text', name: 'id', value: this.state.data.id, className: 'hidden' }),
				React.createElement(
					'div',
					{ className: "col-xs-12 form-group " + (this.state.validationError && !this.state.data.path ? 'has-error' : '') },
					React.createElement(
						'label',
						{ htmlFor: 'storage-path' },
						this.props.frases.PATH
					),
					React.createElement('input', { type: 'text', name: 'path', value: this.state.data.path, onChange: this._onChange, className: 'form-control', required: true })
				),
				React.createElement(
					'div',
					{ className: "col-xs-12 col-sm-6 form-group " + (this.state.validationError && !this.state.data.maxsize ? 'has-error' : '') },
					React.createElement(
						'label',
						{ htmlFor: 'storage-maxsize' },
						this.props.frases.STORAGE.MAXSIZE
					),
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement('input', { type: 'number', name: 'maxsize', min: '0', value: this.state.data.maxsize, onChange: this._onChange, className: 'form-control', required: true }),
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
		);
	},

	render: function () {
		var frases = this.props.frases;
		var body = this._getModalBody();

		return React.createElement(ModalComponent, {
			type: 'success',
			id: this.state.modalId,
			title: frases.STORAGE.STORAGE_SETTINGS,
			submitText: frases.SAVE,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			open: this.state.open,
			fetching: this.state.fetch,
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
		// subscription: React.PropTypes.object,
		utils: React.PropTypes.object
		// updateLicenses: React.PropTypes.func
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
		// var plan = this.props.subscription.plan;
		// var canUpdate = plan.planId !== 'free';
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

	function getExtension(e) {
		e.preventDefault();
		props.getExtension(props.user.oid);
	}

	return React.createElement(
		"tr",
		null,
		React.createElement(
			"td",
			null,
			React.createElement(
				"a",
				{ href: "#", onClick: getExtension },
				props.user ? props.user.ext + ' - ' + props.user.name : null
			)
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
		),
		React.createElement(
			"td",
			null,
			props.free
		)
	);
}

var UsersStorageComponent = React.createClass({
    displayName: 'UsersStorageComponent',


    propTypes: {
        data: React.PropTypes.array,
        extensions: React.PropTypes.object,
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

    _getExtension: function (oid) {
        return getExtension(oid);
    },

    _onRef: function (el) {
        if (el) new Sortable(el);
    },

    render: function () {
        var frases = this.props.frases;
        var data = this.props.data;
        var extensions = this.props.extensions;
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
                            { className: 'table table-condensed sortable', ref: this._onRef },
                            React.createElement(
                                'thead',
                                null,
                                React.createElement(
                                    'tr',
                                    null,
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.USER
                                    ),
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.STORAGE.USED_SPACE,
                                        ' (GB)'
                                    ),
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.STORAGE.TOTAL_SPACE,
                                        ' (GB)'
                                    ),
                                    React.createElement(
                                        'th',
                                        null,
                                        frases.STORAGE.FREE_SPACE,
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
                                        user: extensions[item.user],
                                        size: item.size ? size.toFixed(2) : "0.00",
                                        free: item.size ? (limit - size).toFixed(2) : limit.toFixed(2),
                                        limit: limit.toFixed(2),
                                        getExtension: this._getExtension
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
function CodecsSettingsComponent(props) {

	var match = null;
	var frases = props.frases;
	var availableCodecs = ['Opus', 'G.711 Alaw', 'G.711 Ulaw', 'G.729', 'G.723'];
	var codecs = props.codecs.map(function (item) {
		item.enabled = true;
		availableCodecs.splice(availableCodecs.indexOf(item.codec), 1);

		return item;
	});

	availableCodecs.forEach(function (item) {
		codecs = codecs.concat([{ codec: item, frame: 20, enabled: false }]);
	});

	function onChange(e, index) {
		var target = e.target;
		var list = [].concat(codecs);
		var item = list[index];
		if (target.name === 'frame') item.frame = target.type === 'number' ? parseInt(target.value, 10) : target.value;else if (target.name === 'enabled') item.enabled = !item.enabled;
		list[index] = item;
		props.onChange(list.filter(function (item) {
			return item.enabled;
		}));
	}

	function onSort(e) {
		var target = e.currentTarget;
		var order = [].slice.call(target.children).map(function (el, index) {
			return el.getAttribute("data-id");
		});
		var newList = new Array(codecs.length);

		codecs.forEach(function (item) {
			newList[order.indexOf(item.codec)] = item;
		});

		props.onChange(newList.filter(function (item) {
			return item.enabled;
		}));
	}

	function tableRef(el) {
		if (el) new Sortable(el);
	}

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
			{ ref: tableRef, onTouchEnd: onSort, onDragEnd: onSort },
			codecs.map(function (item, index) {
				return React.createElement(
					'tr',
					{ key: item.codec, 'data-id': item.codec },
					React.createElement(
						'td',
						{ className: 'draggable', style: { textAlign: "center" } },
						React.createElement('i', { className: 'fa fa-ellipsis-v' })
					),
					React.createElement(
						'td',
						null,
						item.codec
					),
					React.createElement(
						'td',
						null,
						React.createElement('input', { type: 'number', className: 'form-control', name: 'frame', value: item.frame, onChange: function (e) {
								onChange(e, index);
							} })
					),
					React.createElement(
						'td',
						null,
						React.createElement('input', { type: 'checkbox', checked: item.enabled, name: 'enabled', onChange: function (e) {
								onChange(e, index);
							} })
					)
				);
			})
		)
	);
}
function TrunkConnectionComponent(props) {

    var frases = props.frases;
    var params = props.params;
    var protocols = params.protocols;

    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            { className: "form-horizontal", autoComplete: "off", onChange: props.onChange },
            React.createElement(
                "div",
                { className: "form-group" + (props.validationError && !params.name ? ' has-error' : '') },
                React.createElement(
                    "label",
                    { className: "col-sm-4 control-label" },
                    frases.TRUNKSNAME
                ),
                React.createElement(
                    "div",
                    { className: "col-sm-6" },
                    React.createElement("input", { type: "text", className: "form-control", name: "name", value: params.name, placeholder: "My SIP Provider", required: true })
                )
            ),
            React.createElement("br", null),
            React.createElement(
                "div",
                { className: "form-group" },
                React.createElement(
                    "label",
                    { className: "col-sm-4 control-label" },
                    frases.PROTOCOL
                ),
                React.createElement(
                    "div",
                    { className: "col-sm-4" },
                    protocols && protocols.length ? React.createElement(
                        "select",
                        { className: "form-control", name: "protocol", value: params.protocol },
                        protocols.map(function (item) {
                            return React.createElement(
                                "option",
                                { key: item, value: item },
                                item.toUpperCase()
                            );
                        })
                    ) : React.createElement(
                        "p",
                        null,
                        params.protocol
                    )
                )
            ),
            !props.externalOnly && React.createElement(
                "div",
                { className: "form-group" },
                React.createElement(
                    "label",
                    { className: "col-sm-4 control-label" },
                    frases.TRUNK_TYPE
                ),
                React.createElement(
                    "div",
                    { className: "col-sm-8" },
                    React.createElement(
                        "div",
                        { className: "btn-group", "data-toggle": "buttons" },
                        React.createElement(
                            "label",
                            { className: "btn btn-default " + (params.type === 'external' ? 'active' : ''), onClick: function () {
                                    props.onChange({ target: { name: 'type', type: 'radio', value: 'external' } });
                                }.bind(this) },
                            React.createElement("input", { type: "radio", name: "type", value: "external", checked: params.type === 'external' }),
                            " ",
                            frases.EXTERNAL
                        ),
                        React.createElement(
                            "label",
                            { className: "btn btn-default " + (params.type === 'internal' ? 'active' : ''), onClick: function () {
                                    props.onChange({ target: { name: 'type', type: 'radio', value: 'internal' } });
                                }.bind(this) },
                            React.createElement("input", { type: "radio", name: "type", value: "internal", checked: params.type === 'internal' }),
                            " ",
                            frases.INTERNAL
                        )
                    )
                ),
                React.createElement("hr", { className: "col-sm-12" })
            ),
            params.type === 'external' ? React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "form-group" + (props.validationError && !params.domain ? ' has-error' : '') },
                    React.createElement(
                        "label",
                        { className: "col-sm-4 control-label" },
                        frases.DOMAIN_OR_IP_ADDRESS
                    ),
                    React.createElement(
                        "div",
                        { className: "col-sm-6" },
                        React.createElement("input", { type: "text", className: "form-control", name: "domain", value: params.domain, placeholder: "sip.myprovider.com", required: true })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement(
                        "div",
                        { className: "col-sm-offset-4 col-sm-6" },
                        React.createElement(
                            "div",
                            { className: "checkbox" },
                            React.createElement(
                                "label",
                                null,
                                React.createElement("input", { type: "checkbox", name: "register", checked: params.register }),
                                " ",
                                frases.REGISTRATION
                            )
                        )
                    )
                ),
                params.register ? React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.NAME
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement("input", { type: "text", className: "form-control", name: "user", value: params.user, placeholder: frases.NAME })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.AUTHNAME
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement("input", { type: "text", className: "form-control", name: "auth", value: params.auth, placeholder: frases.AUTHNAME })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.PASSWORD
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement(PasswordComponent, { frases: frases, name: "pass", value: params.pass })
                        )
                    )
                ) : null,
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement(
                        "div",
                        { className: "col-sm-offset-4 col-sm-6" },
                        React.createElement(
                            "div",
                            { className: "checkbox" },
                            React.createElement(
                                "label",
                                null,
                                React.createElement("input", { type: "checkbox", name: "proxy", checked: params.proxy }),
                                " ",
                                frases.PROXY
                            )
                        )
                    )
                ),
                params.proxy ? React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.PROXYADDRESS
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement("input", { type: "text", className: "form-control", name: "paddr", value: params.paddr, placeholder: frases.PROXYADDRESS })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.AUTHNAME
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement("input", { type: "text", className: "form-control", name: "pauth", value: params.pauth, placeholder: frases.AUTHNAME })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement(
                            "label",
                            { className: "col-sm-4 control-label" },
                            frases.PASSWORD
                        ),
                        React.createElement(
                            "div",
                            { className: "col-sm-6" },
                            React.createElement(PasswordComponent, { frases: frases, name: "ppass", value: params.ppass })
                        )
                    )
                ) : null
            ) : React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement(
                        "label",
                        { className: "col-sm-4 control-label" },
                        frases.AUTHNAME
                    ),
                    React.createElement(
                        "div",
                        { className: "col-sm-6" },
                        React.createElement("input", { type: "text", className: "form-control", name: "gateway.regname", value: params.gateway.regname, placeholder: frases.AUTHNAME, readOnly: true })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement(
                        "label",
                        { className: "col-sm-4 control-label" },
                        frases.PASSWORD
                    ),
                    React.createElement(
                        "div",
                        { className: "col-sm-6" },
                        React.createElement(PasswordComponent, { frases: frases, name: "gateway.regpass", value: params.gateway.regpass })
                    )
                )
            )
        ),
        React.createElement(
            "p",
            { className: "text-center", style: { padding: "20px 0" } },
            React.createElement(
                "a",
                { "data-toggle": "collapse", href: "#trunkAdvanceSetts", "aria-expanded": "false", "aria-controls": "collapseAdvancedSettings" },
                frases.TRUNK.ADVANCED_SETTINGS_BTN
            )
        ),
        React.createElement(
            "div",
            { className: "collapse", id: "trunkAdvanceSetts" },
            React.createElement(TrunkProtocolOptionsComponent, { frases: frases, params: params, onChange: props.onProtocolParamsChange, onCodecsParamsChange: props.onCodecsParamsChange })
        )
    );
}
var TrunkComponent = React.createClass({
	displayName: "TrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {};
	},

	// componentWillMount: function() {

	// },

	_onChange: function (val) {
		console.log('Select: ', val);
		if (!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function () {
		return React.createElement(
			"div",
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
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						PanelComponent,
						{ header: frases.REGSETTINGS },
						React.createElement(TrunkSettingsComponent, { frases: frases, params: this.state.params })
					)
				),
				React.createElement("div", { className: "col-xs-12" })
			)
		);
	}
});

TrunkComponent = React.createFactory(TrunkComponent);
function TrunkProtocolOptionsComponent(props) {

	var frases = props.frases;
	var params = props.params.parameters;
	var sipModes = ['sip info', 'rfc2833', 'inband'];
	var h323Modes = ['h245alpha', 'h245signal', 'rfc2833', 'inband'];
	var dtmfmodes = params.protocol === 'h323' ? h323Modes : sipModes;

	return React.createElement(
		'div',
		null,
		React.createElement(
			'form',
			{ className: 'form-horizontal', onChange: props.onChange },
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					frases.REGEXPIRES
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'number', className: 'form-control', name: 'regexpires', value: params.regexpires, placeholder: frases.REGEXPIRES })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					'DTMF ',
					frases.MODE
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'select',
						{ name: 'dtmfmode', value: params.dtmfmode, className: 'form-control' },
						dtmfmodes.map(function (mode) {
							return React.createElement(
								'option',
								{ key: mode, value: mode },
								mode
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
					{ className: 'col-sm-4 control-label' },
					'Features'
				),
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 't38fax', checked: params.t38fax }),
							' T.38 Fax'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'video', checked: params.video }),
							' Video'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'earlymedia', checked: params.earlymedia }),
							' Early Media Connection'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'dtmfrelay', checked: params.dtmfrelay }),
							' DTMF Relay'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'nosymnat', checked: params.nosymnat }),
							' Disable Symmetric RTP'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'buffering', checked: params.buffering }),
							' Buffering'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'noprogress', checked: params.noprogress }),
							' Send Ringing instead of Progress'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'noredirectinfo', checked: params.noredirectinfo }),
							' Omit Redirection Info'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						props.params.type === 'internal' ? React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'passanumber', checked: params.passanumber }),
							' Always send username in the INVITE "To" header'
						) : React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'passanumber', checked: params.passanumber }),
							' Pass Caller ID in the From header'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-offset-4 col-sm-8' },
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement(
							'label',
							null,
							React.createElement('input', { type: 'checkbox', name: 'directrtp', checked: params.directrtp }),
							' Direct RTP'
						)
					)
				),
				props.params.protocol === 'h323' ? React.createElement(
					'div',
					null,
					React.createElement(
						'div',
						{ className: 'col-sm-offset-4 col-sm-8' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'faststart', checked: params.faststart }),
								' Fast Start'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-offset-4 col-sm-8' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'h245tunneling', checked: params.h245tunneling }),
								' H.245 Tunneling'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-offset-4 col-sm-8' },
						React.createElement(
							'div',
							{ className: 'checkbox' },
							React.createElement(
								'label',
								null,
								React.createElement('input', { type: 'checkbox', name: 'playringback', checked: params.playringback }),
								' Play Ringback on Alerting'
							)
						)
					)
				) : null
			),
			React.createElement('hr', null),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					'T1'
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'number', className: 'form-control', name: 't1', value: params.t1 })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					'T2'
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'number', className: 'form-control', name: 't2', value: params.t2 })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ className: 'col-sm-4 control-label' },
					'T3'
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'number', className: 'form-control', name: 't3', value: params.t3 })
				)
			)
		),
		React.createElement('hr', null),
		React.createElement(CodecsSettingsComponent, { frases: frases, codecs: params.codecs, onChange: props.onCodecsParamsChange })
	);
}
function TrunkSettingsComponent(props) {

	var frases = props.frases;
	var params = props.params;

	function onChange(e) {
		var params = {};
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : valuel;
		props.onChange(params);
	}

	function onTransformChange(type, transforms) {
		var params = {};
		params[type] = transforms;
		props.onChange(params);
	}

	return React.createElement(
		'div',
		null,
		React.createElement(
			'ul',
			{ className: 'nav nav-tabs', role: 'tablist' },
			React.createElement(
				'li',
				{ role: 'presentation', className: 'active' },
				React.createElement(
					'a',
					{ href: '#tab-trunk-general', 'aria-controls': 'general', role: 'tab', 'data-toggle': 'tab' },
					frases.SETTINGS.GENERAL_SETTS
				)
			),
			React.createElement(
				'li',
				{ role: 'presentation' },
				React.createElement(
					'a',
					{ href: '#tab-trunk-incoming', 'aria-controls': 'tab-trunk-incoming', role: 'tab', 'data-toggle': 'tab' },
					frases.SETTINGS.INCALLS
				)
			),
			React.createElement(
				'li',
				{ role: 'presentation' },
				React.createElement(
					'a',
					{ href: '#tab-trunk-outgoing', 'aria-controls': 'tab-trunk-outgoing', role: 'tab', 'data-toggle': 'tab' },
					frases.SETTINGS.OUTCALLS
				)
			)
		),
		React.createElement(
			'div',
			{ className: 'tab-content', style: { padding: "20px 0" } },
			React.createElement(
				'div',
				{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-trunk-general' },
				React.createElement(TrunkConnectionComponent, { frases: frases, params: onChange })
			),
			React.createElement(
				'div',
				{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-trunk-incoming' },
				React.createElement(
					'form',
					{ className: 'form-horizontal', autoComplete: 'off', style: { padding: "20px 0" } },
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ className: 'col-sm-4 control-label' },
							frases.SETTINGS.MAXCONN
						),
						React.createElement(
							'div',
							{ className: 'col-sm-4' },
							React.createElement('input', { type: 'text', className: 'form-control', name: 'maxinbounds', value: params.maxinbounds, onChange: onChange, placeholder: frases.SETTINGS.MAXCONN })
						)
					)
				),
				React.createElement(NumberTransformsComponent, { frases: frases, type: 'inbounda', transforms: params.inboundanumbertransforms, onChange: function (params) {
						onTransformChange('inboundanumbertransforms', params);
					} }),
				React.createElement('hr', null),
				React.createElement(NumberTransformsComponent, { frases: frases, type: 'inboundb', transforms: params.inboundbnumbertransforms, onChange: function (params) {
						onTransformChange('inboundbnumbertransforms', params);
					} })
			),
			React.createElement(
				'div',
				{ role: 'tabpanel', className: 'tab-pane fade', id: 'tab-trunk-outgoing' },
				React.createElement(
					'form',
					{ className: 'form-horizontal', autoComplete: 'off', style: { padding: "20px 0" } },
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ className: 'col-sm-4 control-label' },
							frases.SETTINGS.MAXCONN
						),
						React.createElement(
							'div',
							{ className: 'col-sm-4' },
							React.createElement('input', { type: 'text', className: 'form-control', name: 'maxoutbounds', value: params.maxoutbounds, onChange: onChange, placeholder: frases.SETTINGS.MAXCONN })
						)
					)
				),
				React.createElement(NumberTransformsComponent, { frases: frases, type: 'outbounda', transforms: params.outboundanumbertransforms, onChange: function (params) {
						onTransformChange('outboundanumbertransforms', params);
					} }),
				React.createElement('hr', null),
				React.createElement(NumberTransformsComponent, { frases: frases, type: 'outboundb', transforms: params.outboundbnumbertransforms, onChange: function (params) {
						onTransformChange('outboundbnumbertransforms', params);
					} })
			)
		)
	);
}

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
var UsersGroupComponent = React.createClass({
	displayName: "UsersGroupComponent",


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
		deleteMember: React.PropTypes.func
		// addSteps: React.PropTypes.func
		// initSteps: React.PropTypes.func
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
			filteredMembers: this.props.params.members
		});
	},

	// componentDidMount: function() {
	// 	if(!this.props.params.name) this.props.initSteps(); // start tour if the group is new
	// },

	componentWillReceiveProps: function (props) {
		this.setState({
			params: props.params,
			// options: this.props.params.options,
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

		this.setState({
			state: state
		});
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;
		var members = params.members || [];
		var filteredMembers = this.state.filteredMembers || [];

		return React.createElement(
			"div",
			null,
			React.createElement(ObjectName, {
				name: params.name,
				frases: frases
				// enabled={params.enabled || false}
				, onChange: this._onNameChange,
				onSubmit: this.props.setObject ? this._setObject : null,
				onCancel: this.props.removeObject || null
				// addSteps={this.props.addSteps}
			}),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(GroupMembersComponent, {
						frases: frases,
						doSort: true,
						onSort: this._onSortMember,
						members: members,
						kind: params.kind,
						getExtension: this.props.getExtension,
						onAddMembers: this.props.setObject ? this.props.onAddMembers : null,
						onImportUsers: this.props.onImportUsers,
						activeServices: this.props.activeServices,
						deleteMember: this.props.deleteMember
						// addSteps={this.props.addSteps}
					})
				)
			),
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						PanelComponent,
						{ header: frases.SETTINGS.SETTINGS, classname: 'minimized' },
						React.createElement(
							"ul",
							{ className: "nav nav-tabs", role: "tablist" },
							React.createElement(
								"li",
								{ role: "presentation", className: "active" },
								React.createElement(
									"a",
									{ href: "#tab-group-features", "aria-controls": "features", role: "tab", "data-toggle": "tab" },
									frases.USERS_GROUP.EXT_FEATURES_SETTS
								)
							),
							React.createElement(
								"li",
								{ role: "presentation" },
								React.createElement(
									"a",
									{ href: "#tab-group-outrules", "aria-controls": "outrules", role: "tab", "data-toggle": "tab" },
									frases.USERS_GROUP.OUTCALLS_SETTS
								)
							)
						),
						React.createElement(
							"div",
							{ className: "tab-content", style: { padding: "20px 0" } },
							React.createElement(
								"div",
								{ role: "tabpanel", className: "tab-pane fade in active", id: "tab-group-features" },
								React.createElement(GroupFeaturesComponent, { frases: frases, groupKind: params.kind, params: params.profile, onChange: this._onFeatureChange })
							),
							React.createElement(
								"div",
								{ role: "tabpanel", className: "tab-pane fade", id: "tab-group-outrules" },
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
										)
									)
								),
								React.createElement(NumberTransformsComponent, { frases: frases, type: "outboundb", transforms: params.profile.bnumbertransforms, onChange: this._onTransformsChange })
							)
						)
					)
				)
			),
			members.length ? React.createElement(DownloadAppsLightbox, { frases: frases }) : null
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
			init: false,
			fetching: false,
			closeOnSave: false,
			passwordRevealed: false,
			tkn: Date.now()
		};
	},

	componentWillMount: function () {
		this.setState({
			userParams: window.extend({}, this._getDefaultUserParams(this.props))
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			userParams: window.extend({}, this._getDefaultUserParams(props))
		});
	},

	_onChange: function (userParams) {
		this.setState({ userParams: userParams });
	},

	_saveChanges: function () {
		var userParams = this.state.userParams;
		var errors = {};
		var closeOnSave = this.state.closeOnSave;

		if (!userParams.number || !userParams.name || !userParams.login || !userParams.info.email || !this._validateEmail(userParams.info.email)) {
			this.setState({
				validationError: true
			});

			return notify_about('error', this.props.frases.MISSEDFILED);
		}

		this.setState({
			validationError: false,
			fetching: true
		});

		this.props.onSubmit(this.state.userParams, function (error, result) {
			if (error) return this.setState({ fetching: false, closeOnSave: false });
			this.setState({ opened: closeOnSave ? false : true, fetching: false, closeOnSave: false, userParams: window.extend({}, this._getDefaultUserParams(this.props)) });
		}.bind(this));
	},

	_saveChangesAndClose: function () {
		var saveChanges = this._saveChanges;
		this.setState({ closeOnSave: true });
		setTimeout(saveChanges, 100);
	},

	_validateEmail: function (string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(string);
	},

	_revealPassword: function () {
		this.setState({ passwordRevealed: !this.state.passwordRevealed });
	},

	_getDefaultUserParams: function (props) {
		return {
			info: {},
			storelimit: props.params.storelimit || props.convertBytes(1, 'GB', 'Byte'),
			password: props.generatePassword(),
			number: props.params.available && props.params.available.length ? props.params.available[0] : ""
		};
	},

	_getBody: function () {
		return React.createElement(NewUsersComponent, {
			frases: this.props.frases,
			params: this.props.params,
			userParams: this.state.userParams,
			validationError: this.state.validationError,
			validateEmail: this._validateEmail,
			onChange: this._onChange,
			generatePassword: this.props.generatePassword,
			revealPassword: this._revealPassword,
			passwordRevealed: this.state.passwordRevealed,
			groupid: this.props.groupid,
			convertBytes: this.props.convertBytes,
			tkn: this.state.tkn
		});
	},

	_getFooter: function () {
		var frases = this.props.frases;
		return React.createElement(
			'div',
			{ className: 'modal-footer' },
			React.createElement(
				'button',
				{ className: 'btn btn-success', onClick: this._saveChangesAndClose, disabled: this.props.fetching ? true : false },
				this.props.fetching ? React.createElement('span', { className: 'fa fa-spinner fa-spin fa-fw' }) : frases.ADD_AND_CLOSE
			),
			React.createElement(
				'button',
				{ className: 'btn btn-success', onClick: this._saveChanges, disabled: this.props.fetching ? true : false },
				this.props.fetching ? React.createElement('span', { className: 'fa fa-spinner fa-spin fa-fw' }) : frases.ADD
			),
			React.createElement(
				'button',
				{ className: 'btn btn-link pull-right', 'data-dismiss': 'modal' },
				frases.CLOSE
			)
		);
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(ModalComponent, {
			size: 'md',
			title: frases.USERS_GROUP.NEW_USER_MODAL_TITLE,
			type: 'success',
			fetching: this.state.fetching,
			submitText: frases.ADD,
			cancelText: frases.CLOSE,
			submit: this._saveChanges,
			body: this._getBody(),
			footer: this._getFooter(),
			open: this.state.opened
		});
	}

});

NewUsersModalComponent = React.createFactory(NewUsersModalComponent);
function NewUsersComponent(props) {

	var frases = props.frases;
	var userParams = window.deepExtend({}, props.userParams);
	var validationError = props.validationError;
	var hasDomain = !!window.PbxObject.options.domain;
	var tkn = props.tkn;
	var kind = props.params.kind;
	var available = props.params.available;
	var passwordRevealed = props.passwordRevealed;

	function _generatePassword() {
		userParams.password = props.generatePassword();
		props.onChange(userParams);
	}

	// function _onExtChange(params) {
	// 	userParams.number = params.ext;
	// 	props.onChange(userParams);
	// }

	function _parseInput(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var tname = target.name.split('_')[0];

		return {
			name: tname,
			value: type === 'number' ? parseFloat(value) : value
		};
	}

	function _onChange(e) {
		var input = _parseInput(e);
		if (input.name === 'storelimit') input.value = props.convertBytes(input.value, 'GB', 'Byte');

		if (input.name.match('name|login|password|storelimit|number')) {
			userParams[input.name] = input.value;
			if (input.name === 'name') userParams.display = input.value;
		} else {
			userParams.info = userParams.info || {};
			userParams.info[input.name] = input.value;
		}

		props.onChange(userParams);
	}

	function _onFocus(e) {
		var email = userParams.info.email;
		if (email) {
			userParams.login = email.substr(0, email.indexOf('@'));
			props.onChange(userParams);
		}
	}

	return React.createElement(
		'div',
		{ className: 'row' },
		React.createElement(
			'div',
			{ className: 'col-xs-12' },
			React.createElement(
				'ul',
				{ className: 'nav nav-tabs', role: 'tablist' },
				React.createElement(
					'li',
					{ role: 'presentation', className: 'active' },
					React.createElement(
						'a',
						{ href: '#tab-general', 'aria-controls': 'general', role: 'tab', 'data-toggle': 'tab' },
						frases.USERS_GROUP.GENERAL_SETTINGS_TAB
					)
				),
				React.createElement(
					'li',
					{ role: 'presentation' },
					React.createElement(
						'a',
						{ href: '#tab-info', 'aria-controls': 'info', role: 'tab', 'data-toggle': 'tab' },
						frases.USERS_GROUP.INFO_TAB
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'tab-content', style: { padding: "20px 0" } },
				React.createElement(
					'div',
					{ role: 'tabpanel', className: 'tab-pane fade in active', id: 'tab-general' },
					React.createElement(
						'div',
						{ autoComplete: 'nope' },
						React.createElement(
							'div',
							{ className: 'row' },
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement(
									'div',
									{ className: "form-group " + (validationError && !userParams.name ? 'has-error' : '') },
									React.createElement(
										'label',
										{ className: 'control-label' },
										frases.USERS_GROUP.NAME
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: "name_" + tkn, value: userParams.name || "", onChange: _onChange, placeholder: '', autoComplete: 'none', required: true })
								)
							),
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								kind === 'users' && React.createElement(
									'div',
									{ className: "form-group " + (validationError && (!userParams.info.email || !props.validateEmail(userParams.info.email)) ? 'has-error' : '') },
									React.createElement(
										'label',
										{ className: 'control-label' },
										frases.USERS_GROUP.EMAIL
									),
									React.createElement('input', { type: 'email', className: 'form-control', name: "email_" + tkn, value: userParams.info.email || "", onChange: _onChange, placeholder: '', autoComplete: 'none', required: true })
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'row' },
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement('input', { autoComplete: 'none', name: 'hidden', type: 'hidden', value: 'stopautofill', style: { display: "none" } }),
								React.createElement(
									'div',
									{ className: "form-group " + (validationError && !userParams.login ? 'has-error' : '') },
									React.createElement(
										'label',
										{ className: 'control-label' },
										frases.USERS_GROUP.LOGIN
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: "login_" + tkn, value: userParams.login || "", placeholder: '', onFocus: _onFocus, onChange: _onChange, required: true, autoComplete: 'none' })
								)
							),
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
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
										React.createElement('input', { type: passwordRevealed ? 'text' : 'password', name: "password_" + tkn, value: userParams.password, className: 'form-control', placeholder: '', onChange: _onChange, required: true, autoComplete: 'none' }),
										React.createElement(
											'span',
											{ className: 'input-group-btn' },
											React.createElement(
												'button',
												{ type: 'button', className: 'btn btn-default', onClick: props.revealPassword },
												React.createElement('i', { className: 'fa fa-eye', 'data-toggle': 'tooltip', title: frases.USERS_GROUP.PLACEHOLDERS.REVEAL_PWD })
											),
											React.createElement(
												'button',
												{ type: 'button', className: 'btn btn-default', onClick: _generatePassword },
												React.createElement('i', { className: 'fa fa-refresh', 'data-toggle': 'tooltip', title: frases.USERS_GROUP.PLACEHOLDERS.GENERATE_PWD })
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
								{ className: 'col-sm-4' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ className: 'control-label' },
										frases.USERS_GROUP.EXTENSION
									),
									React.createElement(
										'select',
										{ className: 'form-control', name: 'number', value: userParams.number, onChange: _onChange, required: true },
										available.map(function (item) {
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
								{ className: 'col-sm-offset-2 col-sm-4' },
								kind === 'users' && React.createElement(
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
										React.createElement('input', { type: 'number', className: 'form-control', name: 'storelimit', value: Math.ceil(props.convertBytes(userParams.storelimit, 'Byte', 'GB')), min: '1', step: '1', onChange: _onChange }),
										React.createElement(
											'span',
											{ className: 'input-group-addon' },
											'GB'
										)
									)
								)
							)
						)
					)
				),
				React.createElement(
					'div',
					{ role: 'tabpanel', className: 'tab-pane fade in', id: 'tab-info' },
					React.createElement(
						'form',
						{ autoComplete: 'nope' },
						React.createElement(
							'div',
							{ className: 'row' },
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'company' },
										frases.USERS_GROUP.INFO.COMPANY
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: 'company', placeholder: '', value: userParams.info.company || "", onChange: _onChange })
								)
							),
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'position' },
										frases.USERS_GROUP.INFO.POSITION
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: 'title', placeholder: '', value: userParams.info.title || "", onChange: _onChange })
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'row' },
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'department' },
										frases.USERS_GROUP.INFO.DEPARTMENT
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: 'department', placeholder: '', value: userParams.info.department || "", onChange: _onChange })
								)
							),
							React.createElement(
								'div',
								{ className: 'col-sm-6' },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'mobile' },
										frases.USERS_GROUP.INFO.MOBILE
									),
									React.createElement('input', { type: 'text', className: 'form-control', name: 'mobile', placeholder: '', value: userParams.info.mobile || "", onChange: _onChange })
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
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ htmlFor: 'description' },
										frases.USERS_GROUP.INFO.ABOUT
									),
									React.createElement('textarea', { type: 'text', className: 'form-control', name: 'description', value: userParams.info.description || "", placeholder: '', onChange: _onChange })
								)
							)
						)
					)
				)
			)
		),
		React.createElement(
			'div',
			{ className: 'col-xs-12' },
			validationError && React.createElement(
				'div',
				{ className: 'alert alert-warning', role: 'alert' },
				frases.USERS_GROUP.REQUIRED_FIELDS_MSG
			)
		)
	);
}
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
		this._setChart(props.data);
		// this._updateChart(props.data);
	},

	componentWillUnmount: function () {},

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
		return React.createElement('div');
	}
});

ChartComponent = React.createFactory(ChartComponent);

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

		return React.createElement(
			"div",
			null,
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
						hideRows ? frases.BILLING.INVOICES.SHOW_MORE_BTN : frases.BILLING.INVOICES.SHOW_LESS_BTN
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
		"tr",
		null,
		React.createElement(
			"td",
			{ style: cellStyle },
			React.createElement(
				"span",
				{ className: "text-muted" },
				" ",
				new Date(invoice.createdAt).toLocaleDateString(),
				" "
			)
		),
		React.createElement(
			"td",
			{ style: cellStyle },
			React.createElement(
				"small",
				{ className: "label " + (invoice.status === 'paid' ? 'label-success' : 'label-warning') },
				invoice.status
			)
		),
		React.createElement(
			"td",
			{ style: cellStyle },
			React.createElement(
				"b",
				null,
				invoice.currency,
				" ",
				invoice.paidAmount || item.amount,
				" "
			)
		),
		React.createElement(
			"td",
			{ style: cellStyle },
			React.createElement(
				"span",
				null,
				item.description,
				" "
			)
		)
	);
}
var EmailTrunkComponent = React.createClass({
	displayName: "EmailTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		addSteps: React.PropTypes.func,
		// nextStep: React.PropTypes.func,
		highlightStep: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		validationError: React.PropTypes.bool
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

		data[target.name] = value;

		if (target.name === 'username') {
			data.id = value;
			if (this.state.provider !== 'other') data.usermail = value;
		}

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
		state.data = this._extendProps(state.data, props);

		if (provider && provider === 'other') {
			// state.data = this._extendProps(state.data, props);
			// } else {
			state.data.protocol = "imap";
			state.data.hostname = "";
			state.data.port = "";
			state.data.usermail = "";
		}

		this.setState(state);

		// if(!this.state.stepsShown) {
		// 	setTimeout(function() {
		// 		this.props.nextStep();
		// 		this.setState({ stepsShown: true });
		// 	}.bind(this), 200);
		// }
	},

	_extendProps: function (toObj, fromObj) {
		for (var key in fromObj) {
			toObj[key] = fromObj[key];
		}

		return toObj;
	},

	_validateField: function (value) {
		return this.props.validationError && !value ? 'has-error' : '';
	},

	render: function () {
		var data = this.state.data;
		var frases = this.props.frases;

		// <option value="pop3">POP3</option>

		return React.createElement(
			"div",
			null,
			this.props.isNew && React.createElement(
				"form",
				{ className: "form-horizontal", autoComplete: "off" },
				React.createElement(
					"div",
					{ className: "form-group " + this._validateField(this.state.provider) },
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
					{ className: "form-group " + this._validateField(data.username) },
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
					{ className: "form-group " + this._validateField(data.hostname) },
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
					{ className: "form-group " + this._validateField(data.port) },
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
var ConnectTrunkSettings = React.createClass({
	displayName: "ConnectTrunkSettings",


	propTypes: {
		frases: React.PropTypes.object,
		getObjects: React.PropTypes.func,
		onChange: React.PropTypes.func,
		pageid: React.PropTypes.string,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			number: "",
			trunks: [],
			selectedTrunk: {},
			phoneNumber: "",
			fetching: false,
			trunkModalLoaded: false,
			showNewTrunkModal: false
		};
	},

	componentWillMount: function () {
		var state = { fetching: true };
		var selectedTrunk = null;

		this.setState(state);

		this._getTrunks(function (result) {

			state.trunks = result;

			if (this.props.pageid) {
				state.phoneNumber = this._parsePageId(this.props.pageid)[0];
				selectedTrunk = this._parsePageId(this.props.pageid)[1];
			} else {
				if (result.length) selectedTrunk = result[0].oid;else state.showNewTrunkModal = true;
			}

			state.fetching = false;

			this.setState(state);

			setTimeout(function () {
				this._selectTrunk(selectedTrunk);
			}.bind(this), 200);
		}.bind(this));
	},

	componentWillReceiveProps: function (props) {
		if (props.pageid) this._parsePageId(props.pageid);
	},

	_getTrunks: function (callback) {
		this.props.getObjects('trunk', function (result) {
			callback(result.filter(function (item) {
				return item.name !== 'LOCAL TRUNK';
			}));
		}.bind(this));
	},

	_selectTrunk: function (oid) {
		var trunk = this.state.trunks.filter(function (item) {
			return item.oid === oid;
		});
		this.setState({ selectedTrunk: trunk[0] });
		this.props.onChange({
			id: this.state.phoneNumber + "@" + trunk[0].oid
		});
	},

	_onTrunkSelect: function (e) {
		var oid = e.target.value;
		this._selectTrunk(oid);
	},

	_parsePageId: function (str) {
		var params = str.split('@');
		return params;
	},

	_onNumberChange: function (e) {
		var number = e.target.value.trim();
		this.setState({ phoneNumber: number });
		this.props.onChange({
			id: number + "@" + this.state.selectedTrunk.oid
		});
	},

	_showNewTrunkSettings: function (e) {
		e.preventDefault();
		var state = { showNewTrunkModal: true };
		if (!this.state.trunkModalLoaded) state.trunkModalLoaded = true;
		this.setState(state);
	},

	_onTrunkAdd: function (params) {
		var trunks = [].concat(this.state.trunks, [params]);
		this.setState({ trunks: trunks, selectedTrunk: params, showNewTrunkModal: false });
	},

	render: function () {
		var frases = this.props.frases;

		if (this.state.fetching) return React.createElement(Spinner, null);

		return React.createElement(
			"div",
			null,
			!this.state.trunks || !this.state.trunks.length ? React.createElement(
				"div",
				{ className: "col-sm-12 text-center" },
				React.createElement(
					"p",
					null,
					frases.CHAT_TRUNK.DID.NO_CREATED_TRUNKS_MSG
				),
				React.createElement(
					"p",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "btn btn-lg btn-primary", onClick: this._showNewTrunkSettings },
						React.createElement("i", { className: "fa fa-plus-circle" }),
						" ",
						frases.CHAT_TRUNK.DID.NEW_SIP_CONNECTION_BTN
					)
				)
			) : React.createElement(
				"form",
				{ className: "form-horizontal", autoComplete: "off" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "phoneNumber", className: "col-sm-4 control-label" },
						frases.CHAT_TRUNK.DID.TRUNK_NUMBER_LABEL
					),
					React.createElement(
						"div",
						{ className: "col-sm-3" },
						React.createElement("input", { type: "tel", className: "form-control", name: "phoneNumber", value: this.state.phoneNumber, onChange: this._onNumberChange })
					)
				),
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"label",
						{ htmlFor: "selectedTrunk", className: "col-sm-4 control-label" },
						this.props.isNew ? frases.CHAT_TRUNK.DID.SELECT_TRUNK_LABEL : frases.CHAT_TRUNK.DID.SELECTED_TRUNK_LABEL
					),
					!this.props.isNew && this.state.selectedTrunk ? React.createElement(
						"div",
						{ className: "col-sm-3" },
						React.createElement(
							"p",
							{ className: "form-control-static" },
							this.state.selectedTrunk.name
						)
					) : React.createElement(
						"div",
						null,
						React.createElement(
							"div",
							{ className: "col-sm-3" },
							React.createElement(
								"select",
								{ className: "form-control", name: "selectedTrunk", value: this.state.selectedTrunk.oid, onChange: this._onTrunkSelect, required: true },
								this.state.trunks.map(function (item) {
									return React.createElement(
										"option",
										{ key: item.oid, value: item.oid },
										item.name
									);
								})
							)
						),
						React.createElement(
							"div",
							{ className: "col-sm-1 text-center" },
							React.createElement(
								DividerComponent,
								null,
								frases.OR
							)
						),
						React.createElement(
							"div",
							{ className: "col-sm-4" },
							React.createElement(
								"a",
								{ href: "#", className: "btn btn-link", onClick: this._showNewTrunkSettings },
								React.createElement("i", { className: "fa fa-plus-circle" }),
								" ",
								frases.CHAT_TRUNK.DID.NEW_SIP_CONNECTION_BTN
							)
						)
					)
				)
			),
			this.state.trunkModalLoaded ? React.createElement(TrunkSettingsModalComponent, {
				frases: frases,
				open: this.state.showNewTrunkModal,
				onSubmit: this._onTrunkAdd,
				onClose: function () {
					this.setState({ showNewTrunkModal: false });
				}.bind(this)
			}) : null
		);
	}
});

ConnectTrunkSettings = React.createFactory(ConnectTrunkSettings);
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
		getObjects: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			init: false,
			fetch: false,
			sub: null,
			isTrial: null,
			totalAmount: 0,
			chargeAmount: 0,
			countries: [],
			selectedNumber: {},
			selectedTrunk: {},
			limitReached: false,
			showNewDidSettings: false,
			showConnectTrunkSettings: false
		};
	},

	componentWillMount: function () {
		var state = { fetch: true };

		this.setState(state);

		if (this.props.properties && this.props.properties.number) {

			this._getDid(this.props.properties.number, function (err, response) {
				if (err) return notify_about('error', err);
				state = {
					init: true,
					showNewDidSettings: true,
					selectedNumber: response.result
				};
				this.setState(state);
			}.bind(this));
		} else {
			state = {
				init: true,
				fetch: false
			};

			if (this._isTrunkChannel(this.props.properties.id) || getInstanceMode() === 1) {
				state.showConnectTrunkSettings = true;
				this.setState(state);
			} else {
				this.setState(state);
			}
		}
	},

	componentWillReceiveProps: function (props) {
		if (this.props.isNew && !props.isNew && props.properties && props.properties.number) {
			this.setState({ fetch: false });

			this._getDid(props.properties.number, function (err, response) {
				if (err) return notify_about('error', err);
				this.setState({ selectedNumber: response.result });
			}.bind(this));
		} else if (this._isTrunkChannel(props.properties.id) || getInstanceMode() === 1) {
			this.setState({
				fetch: false,
				showConnectTrunkSettings: true
			});
		}
	},

	_isTrunkChannel: function (str) {
		return str ? str.indexOf('@') !== -1 : false;
	},

	_getDid: function (number, callback) {
		BillingApi.getDid({ number: number }, callback);
	},

	// _getCreatedTrunks: function() {
	// 	this.props.getObjects('trunk', function(result) {
	// 		this.setState({
	// 			trunks: result || []
	// 		});
	// 	});
	// },

	_getSubscription: function (callback) {
		var sub = this.state.sub;
		if (sub) return callback(null, sub);
		BillingApi.getSubscription(function (err, response) {
			if (!err && response.result) {
				sub = response.result;
				this.setState({ sub: sub, isTrial: sub.plan.planId === 'trial' || sub.plan.numId === 0 });
				callback(null, sub);
			}
		}.bind(this));
	},

	_showNewDidSettings: function (e) {
		e.preventDefault();
		this.setState({ showNewDidSettings: !this.state.showNewDidSettings });

		this._getSubscription(function (err, response) {

			var sub = response;
			var maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;

			BillingApi.hasDids(function (err, count) {
				if (err) return notify_about('error', err);

				if (count.result >= maxdids) {
					this.setState({ limitReached: true });
					return;
				}
			}.bind(this));
		}.bind(this));
	},

	_showConnectTrunkSettings: function () {
		this.setState({ showNewDidSettings: false, showConnectTrunkSettings: true, fetchingTrunks: true });
	},

	// _onTrunkSelect: function(params) {
	// 	this.props.onChange(params);
	// },

	render: function () {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = state.sub;
		var selectedCountry = state.selectedCountry;
		var selectedRegion = state.selectedRegion;
		var selectedLocation = state.selectedLocation;
		var selectedAvailableNumber = state.selectedAvailableNumber;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;
		var properties = this.props.properties || {};

		// if(sub && selectedPriceObject) {
		// 	amount = this._getDidAmount(sub.plan.billingPeriodUnit, selectedPriceObject);
		// 	proratedAmount = (amount * (state.proratedDays / state.cycleDays)).toFixed(2);
		// 	maxdids = sub.plan.attributes ? sub.plan.attributes.maxdids : sub.plan.customData.maxdids;
		// }

		if (!this.state.init) return React.createElement(Spinner, null);

		if (this.state.selectedNumber && this.state.selectedNumber._id) return React.createElement(SelectedDidNumberComponent, { frases: frases, number: this.state.selectedNumber });

		if (this.state.showConnectTrunkSettings) {
			return React.createElement(ConnectTrunkSettings, {
				getObjects: this.props.getObjects,
				pageid: properties.id,
				frases: this.props.frases,
				onChange: this.props.onChange,
				isNew: this.props.isNew
			});
		}

		if (!this.state.showNewDidSettings && !this.state.showConnectTrunkSettings) {
			return React.createElement(
				'div',
				{ className: 'row', style: { position: 'relative' } },
				React.createElement(
					'div',
					{ className: "col-sm-6 " + (isSmallScreen() ? 'text-center' : 'text-right') },
					React.createElement(
						'a',
						{
							href: '#',
							className: 'chattrunk-service-cont',
							style: { textDecoration: "none", maxWidth: "300px", minHeight: "150px" },
							onClick: this._showNewDidSettings
						},
						React.createElement('span', {
							className: 'icon-add_call',
							style: { fontSize: "2em", color: "#333", padding: "5px 0" }
						}),
						React.createElement(
							'h4',
							null,
							frases.CHAT_TRUNK.DID.RENT_NUMBER_BTN_LABEL
						),
						React.createElement(
							'p',
							null,
							frases.CHAT_TRUNK.DID.RENT_NUMBER_BTN_DESC
						)
					)
				),
				React.createElement('div', { className: 'col-sm-1 text-center', style: { position: "absolute", display: "inline-block", width: "1px", height: "100%", backgroundColor: "#eee", padding: "0" } }),
				React.createElement(
					'div',
					{ className: "col-sm-5 " + (isSmallScreen() ? 'text-center' : 'text-left') },
					React.createElement(
						'a',
						{
							href: '#',
							className: 'chattrunk-service-cont',
							style: { textDecoration: "none", maxWidth: "300px", minHeight: "150px" },
							onClick: this._showConnectTrunkSettings
						},
						React.createElement(
							'div',
							null,
							React.createElement('span', {
								className: 'icon-dialer_sip',
								style: { fontSize: "2em", color: "#333", padding: "5px 0" }
							})
						),
						React.createElement(
							'h4',
							null,
							frases.CHAT_TRUNK.DID.CONNECT_NUMBER_BTN_LABEL
						),
						React.createElement(
							'p',
							null,
							frases.CHAT_TRUNK.DID.CONNECT_NUMBER_BTN_DESC
						)
					)
				)
			);
		}

		return React.createElement(
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
			) : React.createElement(RentDidComponent, { frases: frases, sub: sub, onChange: this.props.onChange })
		);
	}
});

DidTrunkComponent = React.createFactory(DidTrunkComponent);
var RentDidComponent = React.createClass({
	displayName: 'RentDidComponent',


	propTypes: {
		frases: React.PropTypes.object,
		sub: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			init: false,
			totalAmount: 0,
			chargeAmount: 0,
			countries: [],
			regions: null,
			locations: null,
			didTypes: ['Local'],
			availableNumbers: null,
			selectedCountry: {},
			selectedRegion: {},
			selectedLocation: {},
			selectedAvailableNumber: {},
			selectedPriceObject: {},
			selectedType: 'Local',
			fetchingCountries: false
		};
	},

	componentWillMount: function () {
		if (!this.state.countries.length) {
			this.setState({ fetchingCountries: true });
			this._getDidCountries(function (err, response) {
				if (err) return notify_about('error', err);
				this.setState({ countries: response.result, fetchingCountries: false, init: true });
			}.bind(this));
		}
	},

	// componentWillReceiveProps: function(props) {
	// },

	_onChange: function () {

		var params = {
			poid: this.state.selectedPriceObject ? this.state.selectedPriceObject._id : null,
			area: this.state.selectedLocation ? this.state.selectedLocation.id : null,
			anid: this.state.selectedAvailableNumber ? this.state.selectedAvailableNumber.id : null,
			totalAmount: this.state.totalAmount,
			chargeAmount: this.state.chargeAmount,
			newSubAmount: this.state.newSubAmount,
			nextBillingDate: this.state.nextBillingDate,
			currencySymbol: this._currencyNameToSymbol(this.props.sub.plan.currency)
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

	_onCountrySelect: function (e) {
		var value = e.target.value;
		var state = this.state;
		var country = this.state.countries.filter(function (item) {
			return item.id === value;
		})[0] || {};

		state.selectedCountry = country;
		state.selectedLocation = {};
		state.selectedRegion = {};
		state.selectedLocation = {};
		state.selectedAvailableNumber = {};
		state.regions = null;
		state.locations = null;
		state.needRegion = country.iso === 'US' || country.iso === 'CA';

		this.setState(state);

		if (!value) return;

		if (state.needRegion) {
			BillingApi.request('getDidRegions', { country: country.id }, function (err, response) {
				this.setState({ regions: response.result || [] });
			}.bind(this));
		} else {
			this._getDidLocations({ country: country.id, type: state.selectedType }, function (err, response) {
				if (err) return notify_about('error', err);
				this.setState({ locations: response.result || [] });
			}.bind(this));
		}
	},

	_onRegionSelect: function (e) {
		var value = e.target.value;
		var state = extent({}, this.state);
		var region = state.regions.filter(function (item) {
			return item.id === value;
		})[0] || {};

		state.selectedRegion = region;
		state.selectedLocation = {};
		state.selectedAvailableNumber = {};
		state.locations = null;

		this.setState(state);

		this._getDidLocations({ country: state.selectedCountry.id, region: region.id, type: state.selectedType }, function (err, response) {
			if (err) return notify_about('error', err);
			this.setState({ locations: response.result || [] });
		}.bind(this));
	},

	_onLocationSelect: function (e) {
		var value = e.target.value;
		var state = extend({}, this.state);

		var selectedLocation = {};
		var selectedPriceObject = {};

		if (value) {
			selectedLocation = state.locations.filter(function (item) {
				return item.id === value;
			})[0];
		}

		state.selectedLocation = selectedLocation;
		state.selectedPriceObject = selectedPriceObject;
		state.selectedAvailableNumber = {};
		state.availableNumbers = null;

		this.setState(state);

		this._getAvailableNumbers({ area: selectedLocation.id }, function (err, response) {
			if (err) return notify_about('error', err);

			this.setState({ availableNumbers: response.result });

			this._getDidPrice({ iso: state.selectedCountry.iso, areaCode: state.selectedLocation.areaCode }, function (err, response) {
				if (err) return notify_about('error', err);
				this._setDidPrice(response.result);
			}.bind(this));
		}.bind(this));
	},

	_onAvailableNumberSelect: function (e) {
		var value = e.target.value;
		var state = extend({}, this.state);

		if (value) {
			state.selectedAvailableNumber = state.availableNumbers.filter(function (item) {
				return item.id === value;
			})[0];
		}

		this.setState(state);

		this._getDidPrice({ iso: state.selectedCountry.iso, areaCode: state.selectedLocation.areaCode }, function (err, response) {
			if (err) return notify_about('error', err);
			this._setDidPrice(response.result);
		}.bind(this));
	},

	_setDidPrice: function (priceObj) {
		var sub = this.props.sub;
		var amount = this.state.isTrial ? 0 : this._getDidAmount(sub.plan.billingPeriodUnit, priceObj);
		// var proratedAmount = BillingApi.getProration(sub, amount);
		// var proratedAmount = (amount * (this.state.proratedDays / this.state.cycleDays)).toFixed(2);

		this.setState({
			selectedPriceObject: priceObj,
			totalAmount: amount,
			chargeAmount: amount,
			newSubAmount: parseFloat(sub.amount) + amount,
			nextBillingDate: moment(sub.nextBillingDate).format('DD/MM/YY')
		});

		this._onChange();
	},

	// _getAssignedDids: function(callback) {
	// 	BillingApi.('getAssignedDids', null, callback);
	// },

	_getDidCountries: function (callback) {
		BillingApi.getDidCountries(callback);
	},

	_getDidLocations: function (params, callback) {
		BillingApi.getDidLocations(params, callback);
	},

	_getAvailableNumbers: function (params, callback) {

		BillingApi.request('getAvailableNumbers', params, callback);
	},

	_getDidPrice: function (params, callback) {
		BillingApi.request('getDidPrice', params, callback);
	},

	_getDidAmount: function (billingPeriodUnit, priceObj) {
		var state = this.state;
		var amount = 0;
		if (!billingPeriodUnit || !priceObj) return amount;
		amount = billingPeriodUnit === 'years' ? priceObj.annualPrice : priceObj.monthlyPrice;
		return amount ? parseFloat(amount) : 0;
	},

	render: function () {
		var state = this.state;
		var frases = this.props.frases;
		// var data = state.data;
		var sub = this.props.sub;
		var selectedCountry = state.selectedCountry;
		var selectedRegion = state.selectedRegion;
		var selectedLocation = state.selectedLocation;
		var selectedAvailableNumber = state.selectedAvailableNumber;
		var selectedPriceObject = state.selectedPriceObject;
		var amount = this.state.totalAmount;
		var proratedAmount = this.state.chargeAmount;
		var properties = this.props.properties || {};

		if (!this.state.init || this.state.fetchingCountries) return React.createElement(Spinner, null);

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			React.createElement(
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
								item.name + " (" + item.prefix + ")"
							);
						})
					)
				)
			),
			selectedCountry.id && React.createElement(
				'div',
				null,
				state.needRegion && React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'location', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.DID.SELECT_REGION
					),
					state.regions ? React.createElement(
						'div',
						null,
						state.regions.length ? React.createElement(
							'div',
							{ className: 'col-sm-4' },
							React.createElement(
								'select',
								{ className: 'form-control', name: 'location', value: selectedRegion.id, onChange: this._onRegionSelect, autoComplete: 'off', required: true },
								React.createElement(
									'option',
									{ value: '' },
									'----------'
								),
								state.regions.map(function (item) {
									return React.createElement(
										'option',
										{ key: item.id, value: item.id },
										item.name
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
					) : React.createElement(Spinner, { classname: 'text-left' })
				),
				(!state.needRegion || selectedRegion.id) && React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'location', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.DID.SELECT_LOCATION
					),
					state.locations ? React.createElement(
						'div',
						null,
						state.locations.length ? React.createElement(
							'div',
							{ className: 'col-sm-4' },
							React.createElement(
								'select',
								{ className: 'form-control', name: 'location', value: selectedLocation.id, onChange: this._onLocationSelect, autoComplete: 'off', required: true },
								React.createElement(
									'option',
									{ value: '' },
									'----------'
								),
								state.locations.map(function (item) {
									return React.createElement(
										'option',
										{ key: item.id, value: item.id },
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
					) : React.createElement(Spinner, { classname: 'text-left' })
				),
				selectedLocation.id && React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'number', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.DID.SELECT_NUMBER
					),
					state.availableNumbers ? React.createElement(
						'div',
						null,
						state.availableNumbers.length ? React.createElement(
							'div',
							{ className: 'col-sm-4' },
							React.createElement(
								'select',
								{ className: 'form-control', name: 'number', value: selectedAvailableNumber.id, onChange: this._onAvailableNumberSelect, autoComplete: 'off', required: true },
								React.createElement(
									'option',
									{ value: '' },
									'----------'
								),
								state.availableNumbers.map(function (item) {
									return React.createElement(
										'option',
										{ key: item.id, value: item.id },
										item.number
									);
								})
							)
						) : React.createElement(
							'div',
							{ className: 'col-sm-8' },
							React.createElement(
								'p',
								null,
								frases.CHAT_TRUNK.DID.CHECK_LOCATION_AVAILABILITY_MSG
							)
						)
					) : React.createElement(Spinner, { classname: 'text-left' })
				),
				selectedAvailableNumber.id && React.createElement(
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
					) : React.createElement(Spinner, { classname: 'text-left' })
				)
			)
		);
	}
});

RentDidComponent = React.createFactory(RentDidComponent);
var SelectedDidNumberComponent = React.createClass({
	displayName: 'SelectedDidNumberComponent',


	propTypes: {
		frases: React.PropTypes.object,
		number: React.PropTypes.object
	},

	updateStatusInterval: null,

	updateRegInterval: null,

	getInitialState: function () {
		return {
			number: {},
			fetchingStatus: false,
			statusUpdates: 0,
			regUpdates: 0,
			maxStatusUpdates: 10,
			maxRegUpdates: 10
		};
	},

	componentWillMount: function () {
		var number = this.props.number;
		this.setState({ number: number });

		if (number.status !== 'active') {
			this._fetchUpdateStatus(number.number);
		}

		if (number.awaitingRegistration) {
			this._fetchUpdateRegistration(number.number);
		}
	},

	_fetchUpdateStatus: function (number) {
		BillingApi.updateDidStatus({ number: number }, function (err, response) {
			if (err) return notify_about('error', err);
			this._updateStatus(response.result.status);
		}.bind(this));

		this.setState({ fetchingStatus: true });
	},

	_fetchUpdateRegistration: function (number) {
		BillingApi.updateDidRegistration({ number: number }, function (err, response) {
			if (err) return notify_about('error', err);
			this._updateRegistration(response.result.awaitingRegistration);
		}.bind(this));
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
		this.setState(state);
	},

	render: function () {
		var frases = this.props.frases;
		var selectedNumber = this.state.number;

		return React.createElement(
			'form',
			{ className: 'form-horizontal' },
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
var FacebookTrunkComponent = React.createClass({
	displayName: 'FacebookTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		// onTokenReceived: React.PropTypes.func,
		// addSteps: React.PropTypes.func,
		// nextStep: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		validationError: React.PropTypes.bool
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
		var frases = this.props.frases;

		// if(this.props.isNew && this.props.addSteps) {


		// 	this.props.addSteps([{
		// 		element: '.fb-button',
		// 		popover: {
		// 			title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].TITLE,
		// 			showButtons: false,
		// 			description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["1"].DESC,
		// 			position: 'bottom'
		// 		}
		// 	}, {
		// 		element: '#ctc-select-1',
		// 		popover: {
		// 			title: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].TITLE,
		// 			description: frases.GET_STARTED.CONNECT_MESSENGER.STEPS["2"].DESC,
		// 			position: 'top'
		// 		}
		// 	}]);

		// }

		this._initService();
	},

	// shouldComponentUpdate: function(nextProps, nextState){
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

		// setTimeout(function() {
		// 	this.props.nextStep();
		// }.bind(this), 500);
	},

	_getFacebookSDK: function (cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	},

	_updateStatusCallback: function (result) {
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
		request('GET', 'https://graph.facebook.com/v3.2/' + path + '?access_token=' + this.state.userAccessToken, data, null, callback);
	},

	_getSubscriptions: function () {
		var appId = this.props.serviceParams.params.appId;
		window.FB.api('/' + appId + '/subscriptions', function (response) {
			return true;
		}.bind(this));
	},

	_openAuthWindow: function (link) {
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
		var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
		var windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var poupHeight = 750;
		var popupWidth = 650;
		var left = windowWidth / 2 - popupWidth / 2 + dualScreenLeft;
		var top = windowHeight / 2 - popupWidth / 2 + dualScreenTop;

		return window.open(link, "ServiceAuth", 'height=' + poupHeight + ',width=' + popupWidth + ',top=' + top + ',left=' + left);
	},

	_login: function () {
		var params = this.props.serviceParams.params;
		var href = window.location.href;
		var search = href.indexOf('?');
		var state = search !== -1 ? btoa(href.substr(0, search)) : btoa(href);
		var fbscope = 'email, manage_pages, publish_pages, read_page_mailboxes, pages_messaging, pages_messaging_subscriptions, public_profile';
		var link = "https://www.facebook.com/dialog/oauth?client_id=" + params.appId + "&redirect_uri=" + params.redirectUri + "&state=" + state + '&scope=' + fbscope;
		var authWindow = this._openAuthWindow(link);

		var scope = this;

		window.onTokenReceived = function (token) {
			authWindow.close();

			scope.setState({
				userAccessToken: token
			});

			scope._getPages();
			// scope.props.onTokenReceived(token);
		};

		// authWindow.onTokenReceived = function(token) {
		// 	authWindow.close();

		// 	scope.setState({
		// 		userAccessToken: token
		// 	});

		// 	scope._getPages();
		// 	scope.props.onTokenReceived(token);
		// }

		// window.location = "https://www.facebook.com/dialog/oauth?client_id=1920629758202993&redirect_uri=https://main.ringotel.net/chatbot/FacebookMessenger&state="+btoa(window.location.href);

		// window.FB.login(function(response) {
		// 	this._updateStatusCallback(response);
		// }.bind(this), {scope: 'email, manage_pages, publish_pages, read_page_mailboxes, pages_messaging, pages_messaging_subscriptions, public_profile'});
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
		var value = e.target.value;
		this._selectPage(value);
	},

	render: function () {
		var pages = this.state.pages;
		var frases = this.props.frases;
		var display = pages && pages.length && this.props.isNew ? 'block' : 'none';

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
						frases.CHAT_TRUNK.FACEBOOK.SELECTED_PAGE
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
					{ className: "form-group " + (this.props.validationError && !this.state.selectedPage.id ? 'has-error' : '') },
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
									item.name + " (" + item.category + ")"
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
var InstagramTrunkComponent = React.createClass({
	displayName: 'InstagramTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		// onTokenReceived: React.PropTypes.func,
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
		var frases = this.props.frases;

		this._initService();
	},

	// shouldComponentUpdate: function(nextProps, nextState){
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

	_getFacebookSDK: function (cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	},

	_updateStatusCallback: function (result) {
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
		request('GET', 'https://graph.facebook.com/v3.1/' + path + '?access_token=' + this.state.userAccessToken, data, null, callback);
	},

	_getSubscriptions: function () {
		var appId = this.props.serviceParams.params.appId;
		window.FB.api('/' + appId + '/subscriptions', function (response) {
			return true;
		}.bind(this));
	},

	_openAuthWindow: function (link) {
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
		var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
		var windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var poupHeight = 500;
		var popupWidth = 700;
		var left = windowWidth / 2 - popupWidth / 2 + dualScreenLeft;
		var top = windowHeight / 2 - popupWidth / 2 + dualScreenTop;

		return window.open(link, "ServiceAuth", 'height=' + poupHeight + ',width=' + popupWidth + ',top=' + top + ',left=' + left);
	},

	_login: function () {
		var params = this.props.serviceParams.params;
		var href = window.location.href;
		var search = href.indexOf('?');
		var state = search !== -1 ? btoa(href.substr(0, search)) : btoa(href);
		var fbscope = 'manage_pages, instagram_basic, instagram_manage_comments';
		var link = "https://www.facebook.com/dialog/oauth?client_id=" + params.appId + "&redirect_uri=" + params.redirectUri + "&state=" + state + '&scope=' + fbscope;
		var authWindow = this._openAuthWindow(link);

		var scope = this;

		window.onTokenReceived = function (token) {
			authWindow.close();

			scope.setState({
				userAccessToken: token
			});

			scope._getPages();
			// scope.props.onTokenReceived(token);
		};

		// authWindow.onTokenReceived = function(token) {
		// 	authWindow.close();

		// 	scope.setState({
		// 		userAccessToken: token
		// 	});

		// 	scope._getPages();
		// 	scope.props.onTokenReceived(token);
		// }

		// window.location = "https://www.facebook.com/dialog/oauth?client_id=1920629758202993&redirect_uri=https://main.ringotel.net/chatbot/FacebookMessenger&state="+btoa(window.location.href);

		// window.FB.login(function(response) {
		// 	this._updateStatusCallback(response);
		// }.bind(this), {scope: 'email, manage_pages, publish_pages, read_page_mailboxes, pages_messaging, pages_messaging_subscriptions, public_profile'});
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
		var value = e.target.value;
		this._selectPage(value);
	},

	render: function () {
		var pages = this.state.pages;
		var frases = this.props.frases;
		var display = pages && pages.length && this.props.isNew ? 'block' : 'none';

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
						frases.CHAT_TRUNK.FACEBOOK.SELECTED_PAGE
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
									item.name + " (" + item.category + ")"
								);
							})
						)
					)
				)
			)
		);
	}
});

InstagramTrunkComponent = React.createFactory(InstagramTrunkComponent);
var TelegramTrunkComponent = React.createClass({
	displayName: "TelegramTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		validationError: React.PropTypes.bool
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
					{ className: "form-group " + (this.props.validationError && !this.state.access_token ? 'has-error' : '') },
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
var TwitterTrunkComponent = React.createClass({
	displayName: "TwitterTrunkComponent",


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
		return true;
	},

	render: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			null,
			!this.state.logedIn ? React.createElement(
				"div",
				{ className: "text-center" },
				React.createElement(
					"button",
					{ className: "btn btn-lg btn-primary", onClick: this._login },
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
var ViberTrunkComponent = React.createClass({
	displayName: "ViberTrunkComponent",


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		validationError: React.PropTypes.bool
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
					{ className: "form-group " + (this.props.validationError && !this.state.access_token ? 'has-error' : '') },
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
var WebApiComponent = React.createClass({
	displayName: 'WebApiComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		pageid: React.PropTypes.string,
		validationError: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			inBuffer: null
		};
	},

	_copyToClipboard: function () {
		this.el.focus();
		this.el.select();

		var copied = document.execCommand('copy');
		if (copied && !this.state.inBuffer) {
			setTimeout(function () {
				this.setState({ inBuffer: false });
			}.bind(this), 5000);
			this._copied();
		}
	},

	_copied: function () {
		this.setState({ inBuffer: !this.state.inBuffer });
	},

	_onRef: function (el) {
		this.el = el;
	},

	render: function () {
		// var data = this.state.data;
		var frases = this.props.frases;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'form',
				{ className: 'form-horizontal', autoComplete: 'off' },
				this.props.pageid ? React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBAPI.PROFILEID_LABEL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement(
							'div',
							{ className: 'input-group' },
							React.createElement('input', { type: 'text', className: 'form-control', readOnly: true, ref: this._onRef, value: this.props.pageid }),
							React.createElement(
								'span',
								{ className: 'input-group-btn' },
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-default', onClick: this._copyToClipboard },
									React.createElement('i', { className: 'fa fa-clipboard', 'data-toggle': 'tooltip', title: frases.COPY })
								)
							)
						)
					)
				) : React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'title', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBAPI.PROFILEID_LABEL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement(
							'p',
							null,
							frases.CHAT_TRUNK.WEBAPI.NO_PROFILEID
						)
					)
				)
			)
		);
	}
});

WebApiComponent = React.createFactory(WebApiComponent);
var WebcallTrunkComponent = React.createClass({
	displayName: 'WebcallTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			data: {
				themeColor: '#33C3F0',
				title: window.PbxObject.profile ? window.PbxObject.profile.company : this.props.frases.CHAT_TRUNK.WEBCALL.DEFAULT_TITLE_VALUE,
				chat: false,
				position: 'right',
				offer: false,
				channels: {
					webcall: {
						hotline: ""
					}
				}
			},
			// initFeatureValues: {
			// 	chat: true,
			// 	intro: [],
			// 	offer: {},
			// 	channels: {
			// 		callback: {},
			// 		webrtc: {}
			// 	}
			// },
			showSnippet: false
		};
	},

	componentWillMount: function () {
		var state = extend({}, this.state.data);
		var properties = this.props.properties || {};
		var allowedParams = 'themeColor|title|chat|position|offer|channels';
		var params = Object.keys(properties).reduce(function (result, key) {
			if (allowedParams.match(key)) result[key] = properties[key];return result;
		}, {});

		data = extend(state, params);
		data.pageid = this.props.pageid;
		data.channels.webcall.hotline = this.props.pageid || "";
		this.setState({ data: data });
	},

	componentWillReceiveProps: function (props) {
		var state = extend({}, this.state.data);
		var properties = props.properties || {};
		var allowedParams = 'themeColor|title|chat|position|offer|channels';
		var params = Object.keys(properties).reduce(function (result, key) {
			if (allowedParams.match(key)) result[key] = properties[key];return result;
		}, {});

		data = extend(state, params);
		data.pageid = props.pageid;
		data.channels.webcall.hotline = props.pageid || "";
		this.setState({ data: data });
	},

	_onChange: function (e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		if (target.name === 'callerid') {
			data.channels.webcall = data.channels.webcall || {};
			data.channels.webcall.callerid = value;
		} else {
			data[target.name] = value;
		}

		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_getScriptBody: function () {
		return React.createElement(WebchatScriptComponent, { frases: this.props.frases, params: this.state.data });
	},

	_showCodeSnippet: function (e) {

		this.setState({ showSnippet: true });
	},

	_closeCodeSnippet: function () {
		this.setState({ showSnippet: false });
	},

	_setFeature: function (feature, params) {
		var data = extend({}, this.state.data);
		if (feature.match('callback|webrtc')) data.channels[feature] = params;else data.offer = params;
		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_toggleFeature: function (feature, checked, initValue) {
		var data = extend({}, this.state.data);
		if (feature.match('callback|webrtc')) {
			if (checked) data.channels[feature] = initValue;else delete data.channels[feature];
		} else {
			data[feature] = initValue;
		}

		this.setState({ data: data });
		this.props.onChange(data);
	},

	render: function () {
		var data = this.state.data;
		var frases = this.props.frases;

		return React.createElement(
			'div',
			null,
			React.createElement(ModalComponent, {
				title: frases.CHAT_TRUNK.WEBCALL.CODE_SNIPPET_MODAL_TITLE,
				open: this.state.showSnippet,
				onClose: this._closeCodeSnippet,
				body: this._getScriptBody()
			}),
			React.createElement(
				'form',
				{ className: 'form-horizontal', autoComplete: 'off' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'themeColor', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCALL.CODE_SNIPPET
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement(
							'button',
							{ type: 'button', className: 'btn btn-primary', disabled: !this.props.pageid, onClick: this._showCodeSnippet },
							frases.CHAT_TRUNK.WEBCALL.SHOW_CODE_BTN
						),
						!this.props.pageid && React.createElement(
							'span',
							{ className: 'text-mute' },
							' ',
							frases.CHAT_TRUNK.WEBCALL.SHOW_CODE_BTN_WARNING
						)
					)
				),
				React.createElement('hr', null),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'title', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCALL.TITLE
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'text', className: 'form-control', name: 'title', value: data.title, onChange: this._onChange, autoComplete: 'off', required: true })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'position', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCALL.POSITION
					),
					React.createElement(
						'div',
						{ className: 'col-sm-2' },
						React.createElement(
							'select',
							{ type: 'text', className: 'form-control', name: 'position', value: data.position, onChange: this._onChange },
							React.createElement(
								'option',
								{ value: 'right' },
								frases.CHAT_TRUNK.WEBCALL.RIGHT_POSITION
							),
							React.createElement(
								'option',
								{ value: 'left' },
								frases.CHAT_TRUNK.WEBCALL.LEFT_POSITION
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'themeColor', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCALL.COLOR_THEME
					),
					React.createElement(
						'div',
						{ className: 'col-sm-2' },
						React.createElement('input', { type: 'color', className: 'form-control', name: 'themeColor', value: data.themeColor, onChange: this._onChange })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'lang', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCALL.LANG
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'select',
							{ type: 'text', className: 'form-control', name: 'lang', value: data.lang, onChange: this._onChange },
							React.createElement(
								'option',
								{ value: '' },
								frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.AUTO
							),
							React.createElement(
								'option',
								{ value: 'en' },
								frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.EN
							),
							React.createElement(
								'option',
								{ value: 'uk' },
								frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.UK
							),
							React.createElement(
								'option',
								{ value: 'ru' },
								frases.CHAT_TRUNK.WEBCALL.LANG_OPTIONS.RU
							)
						)
					)
				)
			),
			React.createElement('hr', null),
			React.createElement(WebchatTrunkOfferSettsComponent, { frases: frases, params: data.offer, onChange: this._setFeature, toggleFeature: this._toggleFeature })
		);
	}
});

WebcallTrunkComponent = React.createFactory(WebcallTrunkComponent);
function WebchatTrunkCallbackSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = typeof params === 'object';

	// function onChange(e) {
	// 	var target = e.target;
	// 	var name = target.name;
	// 	var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);;
	// 	var params = extend({}, props.params);

	// 	params[name] = value;
	// 	props.onChange('callback', params);
	// }

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('callback', !checked, checked ? false : { task: 'callback', message: '', time: false });
	}

	// {
	// 	featureOn ? (
	// 		<div>
	// 			<div className="form-group">
	// 			    <label htmlFor="task" className="col-sm-4 control-label">{"Number"}</label>
	// 			    <div className="col-sm-4">
	// 			    	<input type="text" className="form-control" name="task" value={params.task} onChange={onChange} autoComplete='off' required />
	// 			    </div>
	// 			</div>
	// 		</div>
	// 	) : null
	// }

	return React.createElement(
		'form',
		{ className: 'form-horizontal', autoComplete: 'off' },
		React.createElement(
			'div',
			{ className: 'form-group' },
			React.createElement(
				'label',
				{ htmlFor: 'chat-feature', className: 'col-sm-4 control-label' },
				props.frases.CHAT_TRUNK.WEBCHAT.CHANNELS.CALLBACK
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					'div',
					{ className: 'switch switch-md' },
					React.createElement('input', {
						className: 'cmn-toggle cmn-toggle-round',
						type: 'checkbox',
						checked: featureOn
					}),
					React.createElement('label', {
						htmlFor: 'callback-channel-switch',
						'data-toggle': 'tooltip',
						onClick: toggleFeature
					})
				)
			)
		)
	);
}
function WebchatTrunkChatSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = params !== false;

	// function onChange(e) {
	// 	var target = e.target;
	// 	var name = target.name;
	// 	var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);;
	// 	var params = extend({}, props.params);

	// 	params[name] = value;
	// 	props.onChange('chat', params);
	// }

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('chat', !checked, checked ? false : true);
	}

	return React.createElement(
		'form',
		{ className: 'form-horizontal', autoComplete: 'off' },
		React.createElement(
			'div',
			{ className: 'form-group' },
			React.createElement(
				'label',
				{ htmlFor: 'chat-feature', className: 'col-sm-4 control-label' },
				props.frases.CHAT_TRUNK.WEBCHAT.CHANNELS.CHAT
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					'div',
					{ className: 'switch switch-md' },
					React.createElement('input', {
						className: 'cmn-toggle cmn-toggle-round',
						type: 'checkbox',
						checked: featureOn
					}),
					React.createElement('label', {
						htmlFor: 'chat-channel-switch',
						'data-toggle': 'tooltip',
						onClick: toggleFeature
					})
				)
			)
		)
	);
}
function WebchatTrunkOfferSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = !!params;

	function onChange(e) {
		var target = e.target;
		var name = target.name;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;;
		var params = extend({}, props.params);

		params[name] = value;
		props.onChange('offer', params);
	}

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('offer', !checked, checked ? false : {});
	}

	return React.createElement(
		'form',
		{ className: 'form-horizontal', autoComplete: 'off' },
		React.createElement(
			'div',
			{ className: 'form-group' },
			React.createElement(
				'label',
				{ htmlFor: 'greetings-feature', className: 'col-sm-4 control-label' },
				frases.CHAT_TRUNK.WEBCHAT.OFFER_CHECKBOX
			),
			React.createElement(
				'div',
				{ className: 'col-sm-4' },
				React.createElement(
					'div',
					{ className: 'switch switch-md' },
					React.createElement('input', {
						className: 'cmn-toggle cmn-toggle-round',
						type: 'checkbox',
						checked: featureOn
					}),
					React.createElement('label', {
						htmlFor: 'greetings-feature-switch',
						'data-toggle': 'tooltip',
						onClick: toggleFeature
					})
				)
			)
		),
		featureOn ? React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'from', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.WEBCHAT.OFFER_FROM_LABEL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', className: 'form-control', name: 'from', value: params.from, onChange: onChange, autoComplete: 'off', required: true })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'text', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.WEBCHAT.OFFER_MESSAGE_LABEL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('textarea', { rows: '2', className: 'form-control', name: 'text', value: params.text, onChange: onChange, autoComplete: 'off', required: true })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'inSeconds', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.WEBCHAT.OFFER_TIMEOUT_LABEL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-3' },
					React.createElement(
						'div',
						{ className: 'input-group' },
						React.createElement('input', { type: 'number', className: 'form-control', name: 'inSeconds', value: params.inSeconds, onChange: onChange, autoComplete: 'off', required: true }),
						React.createElement(
							'span',
							{ className: 'input-group-addon' },
							frases.SEC
						)
					)
				)
			)
		) : null
	);
}
var WebchatTrunkComponent = React.createClass({
	displayName: 'WebchatTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		pageid: React.PropTypes.string,
		validationError: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			data: {
				themeColor: '#33C3F0',
				title: window.PbxObject.profile ? window.PbxObject.profile.company : this.props.frases.CHAT_TRUNK.WEBCHAT.DEFAULT_TITLE_VALUE,
				widget: true,
				chat: true,
				intro: [],
				introMessage: "",
				position: 'right',
				offer: false,
				channels: {}
			},
			// initFeatureValues: {
			// 	chat: true,
			// 	intro: [],
			// 	offer: {},
			// 	channels: {
			// 		callback: {},
			// 		webrtc: {}
			// 	}
			// },
			stepsShown: false,
			showSnippet: false
		};
	},

	componentWillMount: function () {
		var data = extend({}, this.state.data);
		data = extend(data, this.props.properties || {});
		data.pageid = this.props.pageid;
		data.introMessage = data.introMessage || this.props.frases.CHAT_TRUNK.WEBCHAT.INTRO_MESSAGE;
		if (data.channels.length) data.channels = data.channels.reduce(function (result, item) {
			result[item.type] = item;return result;
		}, {});
		this.setState({ data: data });
	},

	componentWillReceiveProps: function (props) {
		var data = extend({}, this.state.data);
		data = extend(data, props.properties || {});
		data.pageid = props.pageid;
		this.setState({ data: data });
	},

	_onChange: function (e) {
		var target = e.target;
		var state = this.state;
		var data = this.state.data;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		data[target.name] = value;

		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_getScriptBody: function () {
		return React.createElement(WebchatScriptComponent, { frases: this.props.frases, params: { pageid: this.props.pageid } });
	},

	_showCodeSnippet: function (e) {

		this.setState({ showSnippet: true });
	},

	_closeCodeSnippet: function () {
		this.setState({ showSnippet: false });
	},

	_setIntro: function (params) {
		var data = extend({}, this.state.data);
		data.intro = params;
		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_setFeature: function (feature, params) {
		var data = extend({}, this.state.data);
		if (feature.match('callback|webrtc')) data.channels[feature] = params;else data.offer = params;
		this.setState({
			data: data
		});

		this.props.onChange(data);
	},

	_toggleFeature: function (feature, checked, initValue) {
		var data = extend({}, this.state.data);
		if (feature.match('callback|webrtc')) {
			if (checked) data.channels[feature] = initValue;else delete data.channels[feature];
		} else {
			data[feature] = initValue;
		}

		this.setState({ data: data });
		this.props.onChange(data);
	},

	render: function () {
		var data = this.state.data;
		var frases = this.props.frases;

		return React.createElement(
			'div',
			null,
			React.createElement(ModalComponent, {
				title: frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_TITLE,
				open: this.state.showSnippet,
				onClose: this._closeCodeSnippet,
				body: this._getScriptBody()
			}),
			React.createElement(
				'form',
				{ className: 'form-horizontal', autoComplete: 'off' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'themeColor', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement(
							'button',
							{ type: 'button', className: 'btn btn-primary', disabled: !this.props.pageid, onClick: this._showCodeSnippet },
							frases.CHAT_TRUNK.WEBCHAT.SHOW_CODE_BTN
						),
						!this.props.pageid && React.createElement(
							'span',
							{ className: 'text-mute' },
							' ',
							frases.CHAT_TRUNK.WEBCHAT.SHOW_CODE_BTN_WARNING
						)
					)
				),
				React.createElement(
					'div',
					{ className: "form-group " + (this.props.validationError && !data.origin ? 'has-error' : '') },
					React.createElement(
						'label',
						{ htmlFor: 'origin', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.DOMAIN
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'text', className: 'form-control', name: 'origin', value: data.origin, onChange: this._onChange, placeholder: 'example.com', autoComplete: 'off', required: true })
					)
				),
				React.createElement('hr', null),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'title', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.TITLE
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement('input', { type: 'text', className: 'form-control', name: 'title', value: data.title, onChange: this._onChange, autoComplete: 'off' })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'position', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.POSITION
					),
					React.createElement(
						'div',
						{ className: 'col-sm-2' },
						React.createElement(
							'select',
							{ type: 'text', className: 'form-control', name: 'position', value: data.position, onChange: this._onChange, required: true },
							React.createElement(
								'option',
								{ value: 'right' },
								frases.CHAT_TRUNK.WEBCHAT.RIGHT_POSITION
							),
							React.createElement(
								'option',
								{ value: 'left' },
								frases.CHAT_TRUNK.WEBCHAT.LEFT_POSITION
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'themeColor', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.COLOR_THEME
					),
					React.createElement(
						'div',
						{ className: 'col-sm-2' },
						React.createElement('input', { type: 'color', className: 'form-control', name: 'themeColor', value: data.themeColor, onChange: this._onChange })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'lang', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.LANG
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4' },
						React.createElement(
							'select',
							{ type: 'text', className: 'form-control', name: 'lang', value: data.lang, onChange: this._onChange, required: true },
							React.createElement(
								'option',
								{ value: '' },
								frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.AUTO
							),
							React.createElement(
								'option',
								{ value: 'en' },
								frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.EN
							),
							React.createElement(
								'option',
								{ value: 'uk' },
								frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.UK
							),
							React.createElement(
								'option',
								{ value: 'ru' },
								frases.CHAT_TRUNK.WEBCHAT.LANG_OPTIONS.RU
							)
						)
					)
				)
			),
			React.createElement('hr', null),
			React.createElement(WebchatTrunkChatSettsComponent, { frases: frases, params: data.chat, onChange: this._setFeature, toggleFeature: this._toggleFeature }),
			React.createElement(WebchatTrunkCallbackSettsComponent, { frases: frases, params: data.channels.callback, onChange: this._setFeature, toggleFeature: this._toggleFeature }),
			data.chat ? React.createElement(WebchatTrunkIntroSettsComponent, { frases: frases, message: data.introMessage, consentText: data.consentText, fields: data.intro, onChange: this._onChange, setIntro: this._setIntro }) : null,
			React.createElement(WebchatTrunkOfferSettsComponent, { frases: frases, params: data.offer, onChange: this._setFeature, toggleFeature: this._toggleFeature })
		);
	}
});

WebchatTrunkComponent = React.createFactory(WebchatTrunkComponent);
var WebchatTrunkIntroSettsComponent = React.createClass({
	displayName: 'WebchatTrunkIntroSettsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		fields: React.PropTypes.array,
		message: React.PropTypes.string,
		consentText: React.PropTypes.string,
		setIntro: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			intro: false,
			fields: [],
			selectedFields: []
			// fieldToAdd: "uname"
		};
	},

	componentWillMount: function () {
		var frases = this.props.frases;
		var fields = [{
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.uname,
			type: 'text',
			name: 'uname',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.uname,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.email,
			type: 'email',
			name: 'email',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.email,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.phone,
			type: 'tel',
			name: 'phone',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.phone,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.consent,
			type: 'checkbox',
			name: 'consent',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.consent,
			required: true
		}];
		var selectedFields = this.props.fields && this.props.fields.length ? this.props.fields.map(function (item) {
			return item.name;
		}) : [];

		this.setState({
			fields: fields,
			selectedFields: selectedFields,
			intro: selectedFields.length
		});
	},

	componentWillReceiveProps: function (props) {
		var selectedFields = props.fields && props.fields.length ? props.fields.map(function (item) {
			return item.name;
		}) : [];

		this.setState({
			selectedFields: selectedFields
		});
	},

	_onChange: function (e) {
		var checked = this.state.intro;
		this.setState({ intro: !checked });
		if (checked) this.props.setIntro([]);
	},

	_onFieldSelect: function (e) {
		var checked = e.target.checked;
		var name = e.target.name;
		var selected = [].concat(this.state.selectedFields);
		var newIntro = [];

		if (checked) {
			selected.push(name);
		} else {
			selected.splice(selected.indexOf(name), 1);
		}

		newIntro = this.state.fields.filter(function (item) {
			return selected.indexOf(item.name) !== -1;
		});

		this.props.setIntro(newIntro);
		this.setState({ selectedFields: selected });
	},

	// _onFieldSelect: function(e) {
	// 	this.setState({ fieldToAdd: e.target.value });
	// },

	// _addField: function(e) {
	// 	var fieldToAdd = this.state.fieldToAdd;
	// 	var obj = this.state.fields.filter(function(item) { return item.name === fieldToAdd })[0];
	// 	var selectedFields = this.state.selectedFields.concat([obj]);
	// 	this.props.setIntro(selectedFields);
	// 	// this.setState({
	// 	// 	selectedFields: selectedFields
	// 	// })
	// },

	_onFieldChange: function (e) {
		var selectedFields = this.state.selectedFields.map(function (item) {
			if (item.name === e.target.name) item.placeholder = e.target.value;return item;
		});
		this.props.setIntro(selectedFields);
		// this.setState({ selectedFields: selectedFields });
	},

	// _removeField: function(name, e) {
	// 	if(e) e.preventDefault();
	// 	var selectedFields = this.state.selectedFields.filter(function(item) { return item.name !== name });
	// 	this.props.setIntro(selectedFields);
	// 	// this.setState({
	// 	// 	selectedFields: selectedFields
	// 	// })
	// },

	render: function () {
		var intro = this.state.intro;
		var frases = this.props.frases;
		var selected = this.state.selectedFields;
		// var selected = this.state.selectedFields.map(function(item) { return item.name });

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'greetings-feature', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.WEBCHAT.INTRO_CHECKBOX
				),
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement(
						'div',
						{ className: 'switch switch-md' },
						React.createElement('input', {
							className: 'cmn-toggle cmn-toggle-round',
							type: 'checkbox',
							checked: intro
						}),
						React.createElement('label', {
							htmlFor: 'greetings-feature-switch',
							'data-toggle': 'tooltip',
							onClick: this._onChange
						})
					)
				)
			),
			intro ? React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'introMessage', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.INTRO_MESSAGE_LABEL
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement('textarea', { rows: '2', className: 'form-control', name: 'introMessage', value: this.props.message, onChange: this.props.onChange, autoComplete: 'off', required: true })
					)
				),
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'div',
						{ className: 'col-sm-8 col-sm-offset-4' },
						this.state.fields.map(function (item) {
							return React.createElement(
								'div',
								{ key: item.name, className: 'checkbox' },
								React.createElement(
									'label',
									null,
									React.createElement('input', { type: 'checkbox', name: item.name, checked: selected.indexOf(item.name) !== -1, onChange: this._onFieldSelect }),
									' ',
									item.label
								)
							);
						}.bind(this))
					)
				),
				this.state.selectedFields.indexOf('consent') !== -1 ? React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'consentText', className: 'col-sm-4 control-label' },
						frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.consent
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8' },
						React.createElement('textarea', { rows: '5', className: 'form-control', name: 'consentText', value: this.props.consentText, onChange: this.props.onChange, autoComplete: 'off', required: true })
					)
				) : null
			) : null
		);
	}
});

WebchatTrunkIntroSettsComponent = React.createFactory(WebchatTrunkIntroSettsComponent);
var WebchatScriptComponent = React.createClass({
	displayName: "WebchatScriptComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object
	},

	getInitialState: function () {
		return {
			inBuffer: false
		};
	},

	_paramsToString: function (params) {
		return JSON.stringify(params);
		// return Object
		// .keys(params)
		// .reduce(function(result, key) {
		// 	result[result.length] = (key+': '+(typeof params[key]==='string' ? '"'+params[key]+'"' : params[key]));
		// 	return result;
		// }, [])
		// .join(',\n')
	},

	_getScriptString: function (params) {
		var paramsStr = ["<script>\n", "window.WchatSettings = ", this._paramsToString(params), "\n</script>", "\n<script>\n", "(function(w,d,s,l,g,a,b,o){", "w[a]=w[a]||{};w[a].clientPath=w[a].clientPath||l;", "if(w[g]){w[g](w[a]||{})}else{b=d.createElement(s),o=d.getElementsByTagName(s)[0];", "b.async=1;b.src=l+'wchat.min.js';o.parentNode.insertBefore(b,o)}", "})(window,document,'script','https://static.ringotel.co/wchat/v1/','Wchat','WchatSettings');", "\n</script>"].join('');
		return paramsStr;
	},

	_copyToClipboard: function () {
		this.el.focus();
		this.el.select();

		var copied = document.execCommand('copy');
		if (copied && !this.state.inBuffer) {
			setTimeout(function () {
				this.setState({ inBuffer: false });
			}.bind(this), 5000);
			this._copied();
		}
	},

	_copied: function () {
		this.setState({ inBuffer: !this.state.inBuffer });
	},

	_onRef: function (el) {
		this.el = el;
	},

	render: function () {
		var params = this.props.params;
		var frases = this.props.frases;
		var copyToClipboard = this._copyToClipboard;

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
						"p",
						null,
						frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_TEXT
					),
					React.createElement(
						"button",
						{ type: "button", className: "btn btn-default", onClick: copyToClipboard },
						this.state.inBuffer ? frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_COPIED_BTN : frases.CHAT_TRUNK.WEBCHAT.CODE_SNIPPET_MODAL_COPY_BTN
					),
					React.createElement("p", null),
					React.createElement("textarea", { ref: this._onRef, className: "form-control", rows: "15", value: this._getScriptString(this.props.params), readOnly: "true" })
				)
			)
		);
	}
});

WebchatScriptComponent = React.createFactory(WebchatScriptComponent);
function ChannelsOverviewComponent(props) {
	var data = props.data;
	var frases = props.frases;

	return React.createElement(
		"div",
		null,
		React.createElement(
			"div",
			{ className: "panel-body" },
			React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelsTotalsComponent,
				frases: props.frases,
				fetch: props.fetch,
				method: "getActivityStatistics"
			})
		),
		React.createElement(
			"div",
			{ className: "panel-body" },
			React.createElement(GetAndRenderAnalyticsDataComponent, {
				component: ChannelTypeAnalyticsComponent,
				frases: props.frases,
				fetch: props.fetch,
				method: "getChannelStatistics"
			})
		),
		React.createElement(
			"ul",
			{ className: "nav nav-tabs", role: "tablist" },
			React.createElement(
				"li",
				{ role: "presentation", className: "active" },
				React.createElement(
					"a",
					{ href: "#home", "aria-controls": "home", role: "tab", "data-toggle": "tab" },
					"Home"
				)
			),
			React.createElement(
				"li",
				{ role: "presentation" },
				React.createElement(
					"a",
					{ href: "#profile", "aria-controls": "profile", role: "tab", "data-toggle": "tab" },
					"Profile"
				)
			),
			React.createElement(
				"li",
				{ role: "presentation" },
				React.createElement(
					"a",
					{ href: "#messages", "aria-controls": "messages", role: "tab", "data-toggle": "tab" },
					"Messages"
				)
			),
			React.createElement(
				"li",
				{ role: "presentation" },
				React.createElement(
					"a",
					{ href: "#settings", "aria-controls": "settings", role: "tab", "data-toggle": "tab" },
					"Settings"
				)
			)
		),
		React.createElement(
			"div",
			{ className: "tab-content" },
			React.createElement(
				"div",
				{ role: "tabpanel", className: "tab-pane active", id: "home" },
				"..."
			),
			React.createElement(
				"div",
				{ role: "tabpanel", className: "tab-pane", id: "profile" },
				"..."
			),
			React.createElement(
				"div",
				{ role: "tabpanel", className: "tab-pane", id: "messages" },
				"..."
			),
			React.createElement(
				"div",
				{ role: "tabpanel", className: "tab-pane", id: "settings" },
				"..."
			)
		)
	);
}
function ChannelsTotalsComponent(props) {
	var data = props.data.stat;
	var frases = props.frases;

	console.log('ChannelsTotalsComponent: ', data);

	// <div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent params={{ index: data.atrm, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_REPLY, format: "ms" }} /></div>
	// <div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent params={{ index: data.atta, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_ASSIGN, format: "ms" }} /></div>
	return React.createElement(
		"div",
		{ className: "row" },
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-users", params: { index: data.tnc, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-arrow-down", params: { index: data.tr, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-user-plus", params: { index: data.ar, desc: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-reply", params: { index: data.rr, desc: frases.CHANNEL_STATISTICS.INDEXES.TOTAL_REPLIES } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-calendar-plus-o", params: { index: data.atfr / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY, format: "mm:ss" } })
		),
		React.createElement(
			"div",
			{ className: "col-xs-6 col-md-2" },
			React.createElement(SingleIndexAnalyticsComponent, { iconClass: "fa fa-calendar-check-o", params: { index: data.art / 1000, desc: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME, format: "mm:ss" } })
		)
	);
}

var DiscountsComponent = React.createClass({
	displayName: "DiscountsComponent",


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

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement("input", { type: "text", className: "form-control", placeholder: "Promo code", value: this.state.coupon, onChange: this._handleOnChange }),
					React.createElement(
						"span",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-success", onClick: this._addCoupon },
							frases.BILLING.DISCOUNTS.ACTIVATE_BTN
						)
					)
				),
				React.createElement("br", null),
				React.createElement(
					"h5",
					{ className: this.state.items.length ? '' : 'hidden' },
					frases.BILLING.DISCOUNTS.ACTIVE_DISCOUNTS
				),
				this.state.items.map(function (item) {
					return React.createElement(
						"h3",
						{ key: item._id },
						React.createElement(
							"b",
							null,
							item.name
						),
						" ",
						React.createElement(
							"small",
							null,
							item.coupon.description
						)
					);
				})
			)
		);
	}
});

DiscountsComponent = React.createFactory(DiscountsComponent);
var ApiKeysComponent = React.createClass({
	displayName: "ApiKeysComponent",


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		generateApiKey: React.PropTypes.func,
		deleteApiKey: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			keyName: "",
			keys: [],
			scope: "admin"
		};
	},

	componentWillMount: function () {
		this.setState({
			keys: [].concat(this.props.params.apikeys) || []
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			keys: [].concat(props.params.apikeys) || []
		});
	},

	_onChange: function (e) {
		var target = e.target;
		var state = extend({}, this.state);
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		state[target.name] = value;

		this.setState(state);
	},

	_onSubmit: function (e) {
		e.preventDefault();
		if (!this.state.keyName) return notify_about('info', this.props.frases.SETTINGS.API_KEYS.EMPTY_NAME_WARNING);

		var state = this.state;

		this.props.generateApiKey({ name: this.state.keyName, scope: this.state.scope }, function (result) {
			if (result) {
				state.keys.push({ name: state.keyName, value: result, scope: this.state.scope, show: false });
				state.keyName = "";
				this.setState(state);
			}
		}.bind(this));
	},

	_revealValue: function (key, e) {
		e.preventDefault();
		var state = this.state;
		state.keys = state.keys.map(function (item) {
			if (item.name === key) item.show = !item.show;
			return item;
		});

		this.setState({
			keys: state.keys
		});
	},

	_deleteValue: function (key, e) {
		var keys = [].concat(this.state.keys);
		var frases = this.props.frases;
		var conf = confirm(Utils.interpolate(frases.SETTINGS.API_KEYS.DELETE_WARNING, { key: key }));

		if (conf) {
			this.props.deleteApiKey({ name: key }, function (result) {
				keys = keys.filter(function (item) {
					return item.name !== key;
				});

				this.setState({ keys: keys });
			}.bind(this));
		}
	},

	// _copyToClipboard: function(key, e) {
	// 	this.el.focus();
	// 	this.el.select();

	// 	var copied = document.execCommand('copy');
	// 	if(copied && !this.state.inBuffer) {
	// 		setTimeout(function() {
	// 			this.setState({ inBuffer: false });
	// 		}.bind(this), 5000);
	// 		this._copied();
	// 	}
	// },

	// _copied: function() {
	// 	this.setState({ inBuffer: !this.state.inBuffer });
	// },

	_onRef: function (el) {
		this.el = el;
	},

	render: function () {
		var frases = this.props.frases;
		var keys = this.state.keys;

		return React.createElement(
			"div",
			null,
			React.createElement(
				"div",
				{ className: "row" },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement("p", { dangerouslySetInnerHTML: { __html: Utils.htmlDecode(frases.SETTINGS.API_KEYS.DESC) } }),
					React.createElement("div", { className: "alert alert-warning", dangerouslySetInnerHTML: { __html: Utils.htmlDecode(frases.SETTINGS.API_KEYS.WARNING) } }),
					React.createElement(
						"form",
						{ className: "form-inline", onSubmit: this._onSubmit },
						React.createElement(
							"div",
							{ className: "form-group" },
							React.createElement("input", { type: "text", name: "keyName", className: "form-control", value: this.state.keyName, onChange: this._onChange, placeholder: frases.SETTINGS.API_KEYS.KEY_NAME_LABEL }),
							React.createElement(
								"span",
								null,
								" "
							),
							React.createElement(
								"select",
								{ name: "scope", className: "form-control", value: this.state.scope, onChange: this._onChange },
								this.props.params.apis.map(function (scope) {
									return React.createElement(
										"option",
										{ key: scope, value: scope },
										scope
									);
								})
							),
							React.createElement(
								"span",
								null,
								" "
							),
							React.createElement(
								"button",
								{ type: "submit", className: "btn btn-success" },
								frases.SETTINGS.API_KEYS.CREATE_KEY_BTN
							)
						)
					)
				)
			),
			React.createElement(
				"div",
				{ className: "row", style: { marginTop: "20px" } },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"form",
						{ className: "form-horizontal" },
						keys.map(function (item, index) {
							return React.createElement(
								"div",
								{ key: item.name, className: "form-group" },
								React.createElement("hr", null),
								React.createElement(
									"label",
									{ className: "col-sm-2 control-label" },
									item.name
								),
								React.createElement(
									"label",
									{ className: "col-sm-2 control-label text-muted" },
									item.scope
								),
								React.createElement(
									"div",
									{ className: "col-sm-8" },
									React.createElement(
										"div",
										{ className: "input-group" },
										React.createElement("input", { type: item.show ? "text" : "password", className: "form-control", value: item.value, "aria-label": "API key", readOnly: true }),
										React.createElement(
											"span",
											{ className: "input-group-btn" },
											React.createElement(
												"button",
												{ type: "button", className: "btn btn-default", onClick: this._revealValue.bind(this, item.name) },
												React.createElement("i", { className: "fa fa-eye", "data-toggle": "tooltip", title: frases.REVEAL_PWD })
											),
											React.createElement(
												"button",
												{ type: "button", className: "btn btn-default", onClick: this._deleteValue.bind(this, item.name) },
												React.createElement("i", { className: "fa fa-trash text-danger", "data-toggle": "tooltip", title: frases.DELETE })
											)
										)
									)
								)
							);
						}.bind(this))
					)
				)
			)
		);
	}
});

ApiKeysComponent = React.createFactory(ApiKeysComponent);
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
	displayName: "AvCodecsTableComponent",


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
			"table",
			{ className: "table" },
			React.createElement(
				"thead",
				null,
				React.createElement(
					"tr",
					null,
					React.createElement("th", null),
					React.createElement(
						"th",
						null,
						frases.AUDIOCODECS
					),
					React.createElement(
						"th",
						null,
						frases.FRAMES,
						"(ms)"
					),
					React.createElement(
						"th",
						null,
						React.createElement("i", { className: "fa fa-check" })
					)
				)
			),
			React.createElement(
				"tbody",
				{ ref: this._tableRef, onTouchEnd: this._onSortEnd, onDragEnd: this._onSortEnd },
				codecs.map(function (item, index) {
					return React.createElement(AvCodecRowComponent, { key: item.codec, params: item, onChange: this._onChange.bind(this, index) });
				}.bind(this))
			)
		);
	}

});

AvCodecsTableComponent = React.createFactory(AvCodecsTableComponent);
var GdprSettingsComponent = React.createClass({
	displayName: 'GdprSettingsComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			params: {},
			defaultProfile: {},
			profiles: [],
			activeProfileId: "1",
			reasons: []
		};
	},

	componentWillMount: function () {
		var profiles = this.props.params.gdpr || [];
		var frases = this.props.frases;
		if (!profiles.length) this._addProfile();

		this.setState({
			profiles: profiles,
			reasons: [{ text: frases.GDPR.PURPOSES.service, id: 'service' }, { text: frases.GDPR.PURPOSES.promotions, id: 'promotions' }, { text: frases.GDPR.PURPOSES.updates, id: 'updates' }, { text: frases.GDPR.PURPOSES.invitations, id: 'invitations' }, { text: frases.GDPR.PURPOSES.urgent, id: 'urgent' }, { text: frases.GDPR.PURPOSES.press, id: 'press' }],
			langs: ['en']
		});
	},

	_addProfile: function (e) {
		if (e) e.preventDefault();
		var params = this.props.params;
		var profiles = this.state.profiles;
		var id = (this.state.profiles.length + 1).toString();

		profiles.push({
			id: id,
			name: 'Profile ' + id,
			company: params.name,
			text: params.name + " " + this.props.frases.GDPR.DEFAULT_CONSENT_TEXT,
			reasons: [],
			lang: 'en'
		});

		this.setState({
			profiles: profiles,
			activeProfileId: id
		});
	},

	_selectProfile: function (id) {
		this.setState({
			activeProfileId: id
		});
	},

	_onChange: function (profile) {
		var profiles = this.state.profiles;
		profiles.splice(profile.id - 1, 1, profile);

		this.setState({
			profiles: profiles
		});

		this.props.onChange(profiles);
	},

	_deleteProfile: function (id) {

		var profiles = this.state.profiles;
		profiles = profiles.filter(function (item) {
			return item.id !== id;
		});

		this.setState({
			profiles: profiles,
			activeProfileId: profiles.length.toString()
		});

		this.props.onChange(profiles);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.props.params;
		var reasons = this.state.reasons;
		var langs = this.state.langs;
		var profiles = this.state.profiles;
		var activeProfileId = this.state.activeProfileId;
		var selectProfile = this._selectProfile;
		var deleteProfile = this._deleteProfile;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'ul',
				{ className: 'nav nav-pills' },
				this.state.profiles.map(function (item, index) {
					return React.createElement(
						'li',
						{ key: index, role: 'presentation', className: activeProfileId === (index + 1).toString() ? "active" : "" },
						React.createElement(
							'a',
							{ href: "#gdpr-profile-" + index, 'aria-controls': "GDPR profile " + index, role: 'tab', 'data-toggle': 'tab', onClick: selectProfile.bind(this, index + 1) },
							item.name
						)
					);
				}.bind(this)),
				React.createElement(
					'li',
					{ role: 'presentation' },
					React.createElement(
						'a',
						{ href: '#', onClick: this._addProfile },
						frases.GDPR.ADD_NEW_PROFILE_BTN
					)
				)
			),
			React.createElement('br', null),
			React.createElement(
				'div',
				{ className: 'tab-content' },
				this.state.profiles.map(function (item, index) {
					return React.createElement(
						'div',
						{ key: index, role: 'tabpanel', className: "tab-pane " + (activeProfileId === (index + 1).toString() ? "active" : ""), id: "gdpr-profile-" + index },
						React.createElement(GdprConsentProfileComponent, { frases: frases, params: params, profile: item, reasons: reasons, langs: langs, deleteProfile: deleteProfile, onChange: this._onChange })
					);
				}.bind(this))
			)
		);
	}
});

GdprSettingsComponent = React.createFactory(GdprSettingsComponent);
var GdprConsentProfileComponent = React.createClass({
	displayName: 'GdprConsentProfileComponent',


	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		profile: React.PropTypes.object,
		reasons: React.PropTypes.array,
		langs: React.PropTypes.array,
		onChange: React.PropTypes.func,
		deleteProfile: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			profile: {},
			reasons: []
		};
	},

	componentWillMount: function () {
		var profile = this.props.profile || {};
		var selectedReasons = profile.reasons.reduce(function (array, item) {
			array.push(item.id);return array;
		}, []);
		var obj = {};
		var reasons = this.props.reasons.map(function (item) {
			obj = {};
			obj.id = item.id;
			obj.text = item.text;
			if (selectedReasons.indexOf(item.id) !== -1) obj.checked = true;
			return obj;
		});

		this.setState({
			profile: profile,
			reasons: reasons
		});
	},

	_onChange: function (e) {
		var state = this.state;
		var params = state.profile;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.props.onChange(params);
	},

	_onReasonSelect: function (reason) {
		var profile = this.state.profile;
		var reasons = this.state.reasons.map(function (item) {
			if (item.id === reason.id) item.checked = item.checked ? false : true;
			return item;
		});

		profile.reasons = reasons.filter(function (item) {
			return item.checked;
		}).map(function (item) {
			return { id: item.id, text: item.text };
		});

		this.setState({
			profile: profile,
			reasons: reasons
		});

		this.props.onChange(profile);
	},

	_deleteProfile: function () {
		this.props.deleteProfile(this.props.profile.id);
	},

	render: function () {
		var frases = this.props.frases;
		var profile = this.state.profile;

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
						'form',
						{ className: 'form-horizontal' },
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.PROFILE_NAME_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-6 col-sm-6' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'name', value: profile.name, onChange: this._onChange })
							)
						),
						React.createElement('hr', null),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.PROFILE_LANGUAGE_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-6 col-sm-6' },
								React.createElement(
									'select',
									{ name: 'lang', className: 'form-control', value: profile.lang, onChange: this._onChange },
									this.props.langs.map(function (item) {
										return React.createElement(
											'option',
											{ key: item, value: item },
											item.toUpperCase()
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
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.COMPANY_NAME_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-6 col-sm-6' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'company', value: profile.company, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.POLICY_LINK_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-6 col-sm-6' },
								React.createElement('input', { type: 'text', className: 'form-control', name: 'policylink', value: profile.policylink, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.CONSENT_TEXT_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-8 col-sm-8' },
								React.createElement('textarea', { rows: '5', className: 'form-control', name: 'text', value: profile.text, onChange: this._onChange })
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement(
								'label',
								{ className: 'col-sm-4 control-label' },
								frases.GDPR.PURPOSES_LABEL
							),
							React.createElement(
								'div',
								{ className: 'col-md-6 col-sm-6' },
								this.state.reasons.map(function (item, index) {
									return React.createElement(
										'div',
										{ className: 'checkbox', key: index },
										React.createElement(
											'label',
											null,
											React.createElement('input', { type: 'checkbox', checked: item.checked, onChange: this._onReasonSelect.bind(this, item) }),
											' ',
											item.text
										)
									);
								}.bind(this))
							)
						),
						React.createElement(
							'div',
							{ className: 'form-group' },
							React.createElement('br', null),
							React.createElement(
								'div',
								{ className: 'col-sm-offset-4 col-md-6 col-sm-6' },
								React.createElement(
									'button',
									{ type: 'button', className: 'btn btn-link btn-danger', onClick: this._deleteProfile },
									frases.GDPR.DELETE_PROFILE_BTN,
									' ',
									React.createElement(
										'strong',
										null,
										profile.name
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

GdprConsentProfileComponent = React.createFactory(GdprConsentProfileComponent);
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
var TemplatesSettingsComponent = React.createClass({
	displayName: 'TemplatesSettingsComponent',


	propTypes: {
		frases: React.PropTypes.object,
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

	_onChange: function (e) {
		var state = this.state;
		var params = state.params;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.props.onChange(params);
	},

	render: function () {
		var frases = this.props.frases;
		var params = this.state.params;

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			React.createElement(
				'p',
				{ className: 'col-sm-offset-4 col-sm-8' },
				frases.TEMPLATES_SETTS.NEW_USER_DESC
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'service.email.subject', className: 'col-sm-4 control-label' },
					frases.TEMPLATES_SETTS.NEW_USER_SUBJECT_LABEL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement('input', { type: 'text', className: 'form-control', name: 'service.email.subject', value: params['service.email.subject'], onChange: this._onChange, placeholder: frases.TEMPLATES_SETTS.NEW_USER_SUBJECT_LABEL, autoComplete: 'off' })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'service.email.created', className: 'col-sm-4 control-label' },
					frases.TEMPLATES_SETTS.NEW_USER_BODY_LABEL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-8' },
					React.createElement('textarea', { type: 'text', rows: '5', className: 'form-control', name: 'service.email.created', value: params['service.email.created'], onChange: this._onChange, placeholder: frases.TEMPLATES_SETTS.NEW_USER_BODY_LABEL, 'aria-describedby': 'subjectHelper', autoComplete: 'off' }),
					React.createElement(
						'span',
						{ id: 'subjectHelper', className: 'help-block' },
						frases.TEMPLATES_SETTS.NEW_USER_BODY_HELPER
					)
				)
			)
		);
	}
});

TemplatesSettingsComponent = React.createFactory(TemplatesSettingsComponent);
function StepGuideLicenses() {

	return React.createElement(
		"h1",
		null,
		"Licenses"
	);
}

StepGuideLicenses = React.createFactory(StepGuideLicenses);
function StepGuideSettings() {

	return React.createElement(
		"h1",
		null,
		"Settings"
	);
}

StepGuideSettings = React.createFactory(StepGuideSettings);
function StepGuideWelcome() {

	return React.createElement(
		"h1",
		null,
		"Welcome"
	);
}

StepGuideWelcome = React.createFactory(StepGuideWelcome);
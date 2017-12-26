var AvailableUsersComponent = React.createClass({
	displayName: "AvailableUsersComponent",


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
		this.setState({ data: props.data || [] });
	},

	_saveChanges: function () {
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

	_filterItems: function (e) {
		var value = e.target.value;
		var data = this.props.data;

		data = data.filter(function (item) {
			if (item.ext.indexOf(value) !== -1 || item.name.indexOf(value) !== -1) {
				return item;
			}
		});

		this.setState({
			data: data
		});
	},

	_getModalBody: function () {
		var frases = this.props.frases;

		return React.createElement(
			"div",
			{ className: "row" },
			React.createElement(
				"div",
				{ className: "col-xs-12" },
				React.createElement(
					"ul",
					{ style: { minHeight: "200px", maxHeight: "400px", overflowY: "auto", listStyle: 'none', margin: 0, padding: 0 } },
					React.createElement(
						"li",
						null,
						React.createElement("input", { className: "form-control", onChange: this._filterItems, placeholder: frases.SEARCH, autoFocus: true })
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: "#", style: { display: "block", padding: "8px 10px" }, onClick: this._selectAllMembers },
							frases.CHAT_CHANNEL.SELECT_ALL
						)
					),
					this.state.data.map(function (item, index) {
						console.log('_getModalBody: ', item);

						return React.createElement(
							"li",
							{ key: item.ext, style: { padding: "8px 10px", color: "#333", cursor: "pointer", background: item.selected ? '#c2f0ff' : 'none' }, onClick: this._selectMember.bind(this, index) },
							React.createElement(
								"span",
								null,
								item.ext
							),
							React.createElement(
								"span",
								null,
								" - "
							),
							React.createElement(
								"span",
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
			size: "sm",
			title: frases.CHAT_CHANNEL.AVAILABLE_USERS,
			submitText: frases.ADD,
			cancelText: frases.CANCEL,
			submit: this._saveChanges,
			body: body
		});
	}

});

AvailableUsersComponent = React.createFactory(AvailableUsersComponent);
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
	displayName: 'FileUpload',


	propTypes: {
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

	_onFileSelect: function (e) {
		var filename;
		var files = e.target.files;
		if (files.length) {
			filename = this._getFileName(files[0].name);
		} else {
			filename = '';
		}

		this.setState({
			value: filename
		});

		this.props.onChange(e);
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
			'div',
			{ className: 'input-group' },
			React.createElement('input', { type: 'text', className: 'form-control', value: this.state.value, readOnly: true }),
			React.createElement(
				'span',
				{ className: 'input-group-btn' },
				React.createElement(
					'button',
					{ className: 'btn btn-default', type: 'button', onClick: this._onClick },
					'Upload'
				),
				React.createElement('input', {
					type: 'file',
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
	},

	render: function () {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;
		var Footer = this._getFooter();

		console.log('ObjectName render: ', state);

		return React.createElement(
			PanelComponent,
			{ footer: Footer },
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
				this.setState({ route: options[options.length - 1] });
				this._onChange(options[options.length - 1]);
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
		return this.state.options ? React.createElement(Select3, { value: this.state.route, options: this.state.options, onChange: this._onChange }) : React.createElement('h4', { className: 'fa fa-fw fa-spinner fa-spin' });
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
			props.header
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
			React.createElement(GroupMembersComponent, { frases: frases, members: members, getExtension: this.props.getExtension, getAvailableUsers: this._getAvailableUsers, deleteMember: this.props.deleteMember })
		);
	}
});

ChatchannelComponent = React.createFactory(ChatchannelComponent);

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
		invoices: React.PropTypes.array,
		addCard: React.PropTypes.func,
		editCard: React.PropTypes.func,
		onPlanSelect: React.PropTypes.func,
		updateLicenses: React.PropTypes.func,
		renewSub: React.PropTypes.func,
		extend: React.PropTypes.func,
		addCoupon: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			sub: {
				plan: {},
				addOns: []
			},
			invoices: [],
			changePlanOpened: false,
			addLicenseOpened: false
		};
	},

	componentWillReceiveProps: function (props) {
		console.log('componentWillReceiveProps: ', props);

		var sub = props.sub ? JSON.parse(JSON.stringify(props.sub)) : {};
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		this.setState({
			sub: sub,
			profile: props.profile,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
			invoices: props.invoices,
			discounts: props.discounts
		});
	},

	componentDidMount: function () {
		var options = this.props.options;
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		var cycleDays = moment(sub.nextBillingDate).diff(moment(sub.prevBillingDate), 'days');
		var proratedDays = moment(sub.nextBillingDate).diff(moment(), 'days');

		// Convert subscription addOns from array to object
		// if(sub.addOns.length) {
		// 	addOns = sub.addOns.reduce(function(result, item) {
		// 		result[item.name] = item;
		// 		return result;
		// 	}, {});
		// }

		this.setState({
			profile: this.props.profile,
			sub: sub,
			cycleDays: cycleDays,
			proratedDays: proratedDays,
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
		console.log('_setAddonQuantity:', params, this.state.sub.addOns);
		var sub = this.state.sub;
		var addon = sub.addOns[params.index];
		var newQuantity = addon.quantity + params.quantity;

		if (newQuantity < 0) return;
		if (addon.name === 'storage' && addon.quantity > this.state.minStorage && newQuantity < this.state.minStorage) return;

		addon.quantity = newQuantity;
		sub.addOns[params.index] = addon;
		sub.amount = this._countSubAmount(sub);
		this.setState({ sub: sub });
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

		var profile = this.state.profile;

		this.props.addCard(function (result) {
			if (!result) return;

			// profile.billingDetails = profile.billingDetails || [];
			// profile.billingDetails.push(result.card);
			// profile.defaultBillingMethod = {
			// 	params: result.card
			// };

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

			// profile.billingDetails = profile.billingDetails || [];
			// profile.billingDetails.push(result.card);
			// profile.defaultBillingMethod = {
			// 	params: result.card
			// };

			profile.billingMethod = {
				params: result.card
			};

			this.setState({ profile: profile });
		}.bind(this));
	},

	// _getPaymentMethod: function(sources) {
	// 	if(!sources || !sources.length) return null;
	// 	return sources.reduce(function(prev, next) {
	// 		if(next.default) return prev = next;
	// 	}, null);
	// },

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
		console.log('_onPlanSelect 1: ', plan, this.state.sub);
		var profile = this.props.profile;
		// var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var paymentMethod = profile.billingMethod;
		// if(!paymentMethod) return this._addCard();

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
				totalAmount: amounts.totalAmount,
				discounts: this.props.discounts,
				chargeAmount: amounts.chargeAmount.toFixed(2)
			}
		});

		sub.plan = JSON.parse(JSON.stringify(this.props.sub.plan));
		sub.addOns = JSON.parse(JSON.stringify(this.props.sub.addOns));
		sub.amount = this._countSubAmount(sub);
	},

	_updateLicenses: function () {
		var sub = this.state.sub;
		var chargeAmount = sub.amount - this.props.sub.amount;

		if (chargeAmount < 0) chargeAmount = 0;else chargeAmount = chargeAmount * (this.state.proratedDays / this.state.cycleDays);

		this.props.updateLicenses({
			addOns: sub.addOns,
			quantity: sub.quantity,
			payment: {
				currency: sub.plan.currency,
				totalAmount: sub.amount,
				discounts: this.props.discounts,
				chargeAmount: chargeAmount.toFixed(2)
			}
		});
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

	_cancelEditLicenses: function () {
		var sub = JSON.parse(JSON.stringify(this.props.sub));
		this.setState({
			sub: sub
		});
	},

	_isCardExpired: function (expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		return expMonth < month && expYear <= year;
	},

	_cardWillExpiredSoon: function (expMonth, expYear) {
		var date = new Date();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		return expMonth - month < 1 && expYear - year < 1;
	},

	_addCoupon: function (coupon) {
		this.props.addCoupon(coupon);
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
		var profile = this.props.profile;
		// var paymentMethod = profile.defaultBillingMethod || this._getPaymentMethod(profile.billingDetails);
		var paymentMethod = profile.billingMethod;
		var sub = this.props.sub;
		var discounts = this.props.discounts;
		var currSub = this.state.sub;
		var options = this.props.options;
		var plans = this.props.plans;
		var column = plans.length ? 12 / plans.length : 12;
		var onPlanSelect = this._onPlanSelect;
		var trial = sub.plan.planId === 'trial' || sub.state === 'past_due';
		var subAmount = sub.amount;

		// apply discounts
		if (discounts.length) {
			subAmount = subAmount * discounts[0].coupon.percent / 100;
		}

		console.log('billing render component: ', sub, currSub, discounts, subAmount);

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					!paymentMethod ? React.createElement(
						'div',
						{ className: 'alert alert-info', role: 'alert', style: { display: "none" } },
						frases.BILLING.PAYMENT_METHOD_WARNING_P1,
						' ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._addCard, className: 'alert-link' },
							frases.BILLING.ADD_CREDIT_CARD
						),
						' ',
						frases.BILLING.PAYMENT_METHOD_WARNING_P2
					) : this._isCardExpired(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						'Your payment method has been expired. Please ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._editCard, className: 'alert-link' },
							'add a valid payment method'
						),
						' to avoid service interruption.'
					) : this._cardWillExpiredSoon(paymentMethod.params.exp_month, paymentMethod.params.exp_year) ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						'Your payment method will expire soon. Please ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._editCard, className: 'alert-link' },
							'update your payment method'
						),
						' to avoid service interruption.'
					) : '',
					sub.state === 'past_due' ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						'We were not able to receive subscription payment. You may not use all available features on your subscription plan. Please, ensure that your payment method is valid and has sufficient funds and ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._renewSub, className: 'alert-link' },
							'renew subscription'
						),
						' or ',
						React.createElement(
							'a',
							{ href: '#', onClick: this._updateAndRenewSub, className: 'alert-link' },
							'update your payment method'
						),
						'.'
					) : sub.plan.planId === 'trial' && sub.state === 'expired' ? React.createElement(
						'div',
						{ className: 'alert alert-warning', role: 'alert' },
						'Your trial period has been expired. ',
						React.createElement(
							'a',
							{ href: '#plansCollapse', 'data-toggle': 'collapse', 'aria-expanded': 'false', 'aria-controls': 'plansCollapse', onClick: this._openPlans, className: 'alert-link' },
							'Upgrade your subscription plan'
						),
						' and use all available features.'
					) : ''
				),
				React.createElement(
					'div',
					{ className: 'col-sm-12' },
					React.createElement(
						'div',
						{ className: 'panel' },
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'pull-left' },
								React.createElement(
									'h2',
									{ style: { margin: 0 } },
									React.createElement(
										'small',
										null,
										sub.plan.billingPeriodUnit === 'years' ? frases.BILLING.ANNUALLY_TOTAL : frases.BILLING.MONTHLY_TOTAL,
										' '
									),
									React.createElement(
										'span',
										null,
										this._currencyNameToSymbol(sub.plan.currency),
										parseFloat(subAmount).toFixed(2),
										' '
									)
								),
								!sub.plan.trialPeriod && React.createElement(
									'p',
									{ className: 'text-muted' },
									frases.BILLING.NEXT_CHARGE,
									' ',
									React.createElement(
										'b',
										null,
										window.moment(this.state.sub.nextBillingDate).format('DD MMMM YYYY')
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'pull-right', style: { textAlign: "right" } },
								React.createElement(
									'p',
									null,
									paymentMethod ? React.createElement(
										'a',
										{ href: '#', onClick: sub.state === 'past_due' ? this._updateAndRenewSub : this._editCard, className: 'text-uppercase' },
										frases.BILLING.EDIT_PAYMENT_METHOD
									) : React.createElement(
										'a',
										{ href: '#', className: 'text-uppercase', onClick: this._addCard },
										frases.BILLING.ADD_CREDIT_CARD
									)
								),
								paymentMethod && React.createElement(
									'p',
									{ className: 'text-muted', style: { userSelect: 'none' } },
									React.createElement(
										'b',
										null,
										paymentMethod.params.brand
									),
									' \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ',
									paymentMethod.params.last4,
									React.createElement('br', null),
									paymentMethod.params.exp_month,
									'/',
									paymentMethod.params.exp_year
								)
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'col-sm-12' },
					React.createElement(
						'div',
						{ className: 'panel' },
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'pull-left' },
								React.createElement(
									'h2',
									{ style: { margin: 0 } },
									React.createElement(
										'small',
										null,
										frases.BILLING.CURRENT_PLAN,
										' '
									),
									React.createElement(
										'span',
										null,
										sub.plan.name,
										' '
									)
								),
								sub.plan.trialPeriod && React.createElement(
									'p',
									{ className: 'text-muted' },
									frases.BILLING.TRIAL_EXPIRES,
									' ',
									React.createElement(
										'b',
										null,
										window.moment(this.state.sub.trialExpires).format('DD MMMM YYYY')
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'pull-right' },
								sub.state === 'past_due' ? React.createElement(
									'a',
									{ href: '#', className: 'text-uppercase', style: { fontSize: "14px" }, onClick: this._renewSub },
									'Renew'
								) : React.createElement(
									'a',
									{
										href: '#',
										className: 'text-uppercase',
										style: { fontSize: "14px" },
										role: 'button',
										onClick: this._openPlans,
										'data-toggle': 'collapse',
										href: '#plansCollapse',
										'aria-expanded': 'false',
										'aria-controls': 'plansCollapse'
									},
									frases.BILLING.UPGRADE_PLAN
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
										{ className: 'collapse', id: 'plansCollapse' },
										React.createElement(PlansComponent, { plans: plans, frases: frases, onPlanSelect: onPlanSelect, currentPlan: sub.plan })
									),
									React.createElement('p', null)
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
								frases.BILLING.AVAILABLE_LICENSES.AVAILABLE_LICENSES
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
												{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setUsersQuantity.bind(this, { quantity: 1 }) },
												React.createElement('i', { className: 'fa fa-plus' })
											)
										)
									),
									React.createElement(
										'p',
										null,
										frases.BILLING.AVAILABLE_LICENSES.USERS
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
													{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setAddonQuantity.bind(this, { index: index, quantity: item.name === 'storage' ? -5 : -2 }) },
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
													{ className: 'btn btn-default', type: 'button', disabled: trial, onClick: this._setAddonQuantity.bind(this, { index: index, quantity: item.name === 'storage' ? 5 : 2 }) },
													React.createElement('i', { className: 'fa fa-plus' })
												)
											)
										),
										React.createElement(
											'p',
											null,
											frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()]
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
										{ className: "alert alert-info " + (paymentMethod && trial ? 'hidden' : 'hidden'), role: 'alert' },
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
											frases.BILLING.CANCEL_LICENSE_UPDATE
										),
										React.createElement(
											'span',
											null,
											'  '
										),
										React.createElement(
											'button',
											{ className: 'btn btn-primary btn-lg', onClick: this._updateLicenses },
											frases.BILLING.UPDATE_LICENSES,
											' '
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

var PlanComponent = React.createClass({
	displayName: 'PlanComponent',


	propTypes: {
		plan: React.PropTypes.object,
		frases: React.PropTypes.object,
		currentPlan: React.PropTypes.object,
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
							plan.customData.storageperuser
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
							plan.customData.linesperuser
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
				this.props.currentPlan.planId === plan.planId ? React.createElement(
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
		} else {
			return null;
		}
	},

	render: function () {
		var frases = this.props.frases;
		var plans = this.props.plans.filter(this._filterPlans);
		// var column = plans.length ? (12/plans.length) : 12;

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
						{ className: "col-xs-12 col-sm-4", key: plan.planId },
						React.createElement(PlanComponent, { plan: plan, frases: frases, onSelect: this.props.onPlanSelect, currentPlan: this.props.currentPlan })
					);
				}.bind(this))
			)
		);
	}
});

PlansComponent = React.createFactory(PlansComponent);
var GroupMembersComponent = React.createClass({
	displayName: 'GroupMembersComponent',


	propTypes: {
		frases: React.PropTypes.object,
		members: React.PropTypes.array,
		getExtension: React.PropTypes.func,
		getAvailableUsers: React.PropTypes.func,
		deleteMember: React.PropTypes.func,
		sortable: React.PropTypes.bool,
		onSort: React.PropTypes.func
	},

	componentWillMount: function () {
		this.setState({
			filteredMembers: this.props.members || []
		});
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

	render: function () {
		var frases = this.props.frases;
		var members = this.props.members;
		var filteredMembers = this.state.filteredMembers || [];

		return React.createElement(
			PanelComponent,
			{ header: filteredMembers.length + " " + frases.CHAT_CHANNEL.MEMBERS },
			React.createElement(
				'div',
				{ className: 'row' },
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'button',
						{ type: 'button', role: 'button', className: 'btn btn-default padding-lg', onClick: this.props.getAvailableUsers },
						React.createElement('i', { className: 'fa fa-user-plus' }),
						' ',
						frases.CHAT_CHANNEL.ADD_MEMBERS
					),
					React.createElement(FilterInputComponent, { items: members, onChange: this._onFilter })
				),
				React.createElement(
					'div',
					{ className: 'col-xs-12' },
					React.createElement(
						'div',
						{ className: 'table-responsive' },
						React.createElement(
							'table',
							{ className: 'table table-hover sortable', id: 'group-extensions' },
							React.createElement(
								'tbody',
								{ ref: this._tableRef, onTouchEnd: this._onSortEnd, onDragEnd: this._onSortEnd },
								filteredMembers.length ? filteredMembers.map(function (item, index) {

									return React.createElement(GroupMemberComponent, { key: item.oid, sortable: this.props.sortable, item: item, itemState: this._getInfoFromState(item.state), getExtension: this.props.getExtension, deleteMember: this.props.deleteMember });
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
		);
	}
});

GroupMembersComponent = React.createFactory(GroupMembersComponent);
function GroupMemberComponent(props) {

	var item = props.item;
	var itemState = props.itemState;

	return React.createElement(
		"tr",
		{ id: item.oid, key: item.number || item.ext },
		props.sortable && React.createElement(
			"td",
			{ className: "draggable" },
			React.createElement("i", { className: "fa fa-ellipsis-v" })
		),
		React.createElement(
			"td",
			null,
			React.createElement(
				"a",
				{ href: "", onClick: props.getExtension },
				item.number || item.ext
			)
		),
		React.createElement(
			"td",
			{ "data-cell": "name" },
			item.name
		),
		React.createElement(
			"td",
			{ "data-cell": "reg" },
			item.reg
		),
		React.createElement(
			"td",
			{ "data-cell": "status", style: { "textAlign": "right" } },
			React.createElement(
				"span",
				{ className: "label label-" + itemState.className },
				itemState.rstatus
			)
		),
		React.createElement(
			"td",
			{ style: { "textAlign": "right" } },
			React.createElement(
				"button",
				{ className: "btn btn-link btn-danger btn-md", onClick: props.deleteMember.bind(this, item.oid) },
				React.createElement("i", { className: "fa fa-trash" })
			)
		)
	);
}
var IcdGroupComponent = React.createClass({
	displayName: 'IcdGroupComponent',


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
		params.files = this.state.files;
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

	_getAvailableUsers: function () {
		this.props.getAvailableUsers();
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

	_onFileUpload: function (e) {
		var state = this.state;
		var target = e.target;
		var file = target.files[0];
		var value = file.name;

		state.options[target.name] = value;
		state.files.push(file);

		console.log('_onFileUpload: ', target, value, file);

		this.setState({
			state: state
		});
	},

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
			React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, getAvailableUsers: this._getAvailableUsers, deleteMember: this.props.deleteMember }),
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
											{ className: 'col-sm-2' },
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
											{ className: 'col-sm-2' },
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
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__RESUME_TIME })
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
											),
											React.createElement('a', { tabIndex: '0', role: 'button', className: 'popover-trigger info', 'data-toggle': 'popover', 'data-content': frases.ICD__GREETINGS })
										),
										React.createElement(
											'div',
											{ className: 'col-sm-4' },
											React.createElement(FileUpload, { name: 'greeting', value: this.state.options.greeting, onChange: this._onFileUpload })
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
											{ className: 'col-sm-4' },
											React.createElement(FileUpload, { name: 'queueprompt', value: this.state.options.queueprompt, onChange: this._onFileUpload })
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
											{ className: 'col-sm-4' },
											React.createElement(FileUpload, { name: 'queuemusic', value: this.state.options.queuemusic, onChange: this._onFileUpload })
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
											{ className: 'col-sm-2' },
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
											{ className: 'col-sm-2' },
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
											{ className: 'col-sm-4' },
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
											{ className: 'col-sm-3' },
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
											{ className: 'col-sm-4' },
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
											{ className: 'col-sm-2' },
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
											{ className: 'col-sm-3' },
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
var HuntingGroupComponent = React.createClass({
	displayName: 'HuntingGroupComponent',


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
		params.files = this.state.files;
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

	_getAvailableUsers: function () {
		this.props.getAvailableUsers();
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

	_onFileUpload: function (e) {
		var options = this.state.options;
		var files = this.state.files;
		var target = e.target;
		var file = target.files[0];
		var value = file.name;

		options[target.name] = value;
		files.push(file);

		console.log('_onFileUpload: ', target, value, file);

		this.setState({
			options: options,
			files: files
		});
	},

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
			React.createElement(GroupMembersComponent, { frases: frases, sortable: true, onSort: this._onSortMember, members: members, getExtension: this.props.getExtension, getAvailableUsers: this._getAvailableUsers, deleteMember: this.props.deleteMember }),
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
									{ className: 'col-sm-4' },
									React.createElement(FileUpload, { name: 'greeting', value: this.state.options.greeting, onChange: this._onFileUpload })
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
									{ className: 'col-sm-4' },
									React.createElement(FileUpload, { name: 'waitmusic', value: this.state.options.waitmusic, onChange: this._onFileUpload })
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

	_onFileUpload: function (e) {
		var target = e.target;
		var file = target.files[0];
		var value = file.name;
		var update = {
			files: this.props.files || []
		};

		update[target.name] = value !== null ? value : "";;
		update.files.push(file);

		console.log('_onFileUpload: ', target, value, update, file);

		this.props.onChange(update);
	},

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
						React.createElement(FileUpload, { name: 'holdmusicfile', value: params.holdmusicfile, onChange: this._onFileUpload })
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
						),
						React.createElement(
							'h5',
							null,
							'Description'
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
						),
						React.createElement(
							'h5',
							null,
							'Description'
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
var ChatTrunkComponent = React.createClass({
	displayName: 'ChatTrunkComponent',


	propTypes: {
		type: React.PropTypes.string,
		services: React.PropTypes.array,
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		routes: React.PropTypes.array,
		onStateChange: React.PropTypes.func,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			routes: []
		};
	},

	getInitialState: function () {
		return {
			serivceInited: true,
			properties: null
		};
	},

	componentWillMount: function () {
		var params = this.props.params;
		this.setState({
			type: this.props.type,
			params: params || {},
			properties: params.properties,
			selectedRoute: params.routes.length ? params.routes[0].target : this.props.routes.length ? this.props.routes[0] : null
		});
	},

	componentWillReceiveProps: function (props) {
		var params = props.params;
		this.setState({
			type: props.type,
			params: params || {},
			properties: params.properties
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
		var selectedRoute = this.state.selectedRoute || this.props.routes[0];
		var properties = this.state.properties || {};

		console.log('setObject: ', properties, selectedRoute);

		if (!selectedRoute) return console.error('route is not selected');

		Object.keys(this.state.params).forEach(function (key) {
			params[key] = this.state.params[key];
		}.bind(this));

		// if(!pages || !pages.length) return console.error('page is not selected');;

		params.type = this.state.type;
		if (properties.id) params.pageid = properties.id;
		params.pagename = properties.name || '';
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
			if (err) return;
			this.setState({ params: params });
		}.bind(this));
	},

	_removeObject: function () {
		this.props.removeObject(this.state.params);
	},

	_onPropsChange: function (properties) {
		// var params = this.state.params;
		// params.properties = properties;
		this.setState({ properties: properties });
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
		this.setState({
			type: type
		});
	},

	_getComponentName: function (type) {
		var component = null;
		if (type === 'FacebookMessenger' || type === 'Facebook') {
			component = FacebookTrunkComponent;
		} else if (type === 'Twitter') {
			component = TwitterTrunkComponent;
		} else if (type === 'Viber') {
			component = ViberTrunkComponent;
		} else if (type === 'Email') {
			component = EmailTrunkComponent;
		}

		return component;
	},

	_getServiceParams: function (type) {
		return this.props.services.reduce(function (prev, next) {
			if (next.id === type) prev = next;
			return prev;
		}, {});
	},

	render: function () {
		var params = this.state.params;
		var frases = this.props.frases;
		var type = this.state.type;
		var ServiceComponent = this._getComponentName(type);
		var serviceParams = this._getServiceParams(type);

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
				PanelComponent,
				null,
				!this.props.routes.length ? React.createElement(
					'h4',
					null,
					frases.CHAT_TRUNK.NO_CHANNELS_MSG_1,
					React.createElement(
						'a',
						{ href: '#chatchannel/chatchannel' },
						' ',
						frases.CHAT_TRUNK.CREATE_CHANNEL
					),
					' ',
					frases.CHAT_TRUNK.NO_CHANNELS_MSG_2
				) : React.createElement(
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
								isNew: !this.state.params.pageid
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
										frases.CHAT_TRUNK.SELECT_CHANNEL
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
										frases.CHAT_TRUNK.SESSION_TIMEOUT
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
										frases.CHAT_TRUNK.REPLY_TIMEOUT
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
var EmailTrunkComponent = React.createClass({
	displayName: 'EmailTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState: function () {
		return {
			props: {}
		};
	},

	componentWillMount: function () {
		this.setState({
			props: this.props.properties || {}
		});
	},

	componentWillReceiveProps: function (props) {
		this.setState({
			props: props.properties || {}
		});
	},

	_onChange: function (e) {
		var target = e.target;
		var props = this.state.props;
		var value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? parseFloat(target.value) : target.value;

		console.log('EmailTrunkComponent onChange: ', value);

		props[target.name] = value;

		if (target.name === 'username') props.id = value;

		this.setState({
			props: props
		});

		this.props.onChange(props);
	},

	render: function () {
		var props = this.state.props;
		var frases = this.props.frases;

		console.log('EmailTrunkComponent render: ', this.state.props, this.props.serviceParams);

		return React.createElement(
			'form',
			{ className: 'form-horizontal', autoComplete: 'off' },
			React.createElement('input', { type: 'text', style: { display: "none" } }),
			React.createElement('input', { type: 'password', style: { display: "none" } }),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'protocol', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.EMAIL.PROTOCOL
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement(
						'select',
						{ type: 'text', className: 'form-control', name: 'protocol', value: props.protocol, onChange: this._onChange, autoComplete: 'off', required: true },
						React.createElement(
							'option',
							{ value: 'pop3' },
							'POP3'
						),
						React.createElement(
							'option',
							{ value: 'imap' },
							'IMAP'
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'username', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.EMAIL.USERNAME
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', className: 'form-control', name: 'username', value: props.username, onChange: this._onChange, autoComplete: 'off', required: true })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'password', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.EMAIL.PASSWORD
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'password', className: 'form-control', name: 'password', value: props.password, onChange: this._onChange, autoComplete: 'off', required: true })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'hostname', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.EMAIL.HOSTNAME
				),
				React.createElement(
					'div',
					{ className: 'col-sm-4' },
					React.createElement('input', { type: 'text', className: 'form-control', name: 'hostname', value: props.hostname, onChange: this._onChange, autoComplete: 'off', required: true })
				)
			),
			React.createElement(
				'div',
				{ className: 'form-group' },
				React.createElement(
					'label',
					{ htmlFor: 'port', className: 'col-sm-4 control-label' },
					frases.CHAT_TRUNK.EMAIL.PORT
				),
				React.createElement(
					'div',
					{ className: 'col-sm-2' },
					React.createElement('input', { type: 'number', className: 'form-control', name: 'port', value: props.port, onChange: this._onChange, autoComplete: 'off', required: true })
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
							React.createElement('input', { type: 'checkbox', checked: props.usessl, name: 'usessl', onChange: this._onChange }),
							' ',
							frases.CHAT_TRUNK.EMAIL.SSL
						)
					)
				)
			)
		);
	}
});

EmailTrunkComponent = React.createFactory(EmailTrunkComponent);
var FacebookTrunkComponent = React.createClass({
	displayName: 'FacebookTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
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
		console.log('FacebookTrunkComponent props: ', this.props);

		this._initService();

		// this.setState({
		// 	selectedPage: this.props.properties || {}
		// });		
	},

	// shouldComponentUpdate: function(nextProps, nextState){
	// 	console.log('FacebookTrunkComponent shouldComponentUpdate: ', nextProps);
	//     // return a boolean value
	//     return !this.state.init && nextProps.isNew;
	// },

	_initService: function () {
		var props = this.props.properties;

		console.log('_initService: ', props);

		if (props && props.id) {
			this.setState({ init: true });
		} else if (window.FB) {
			window.FB.getLoginStatus(this._updateStatusCallback);
		} else {
			this._getFacebookSDK(function () {
				window.FB.init({
					appId: this.props.serviceParams.params.appId,
					autoLogAppEvents: true,
					status: true,
					version: 'v2.10'
				});
				window.FB.getLoginStatus(this._updateStatusCallback);
			}.bind(this));
		}
	},

	_getFacebookSDK: function (cb) {
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_US/sdk.js', cb);
	},

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

	_getSubscriptions: function () {
		var appId = this.props.serviceParams.params.appId;
		window.FB.api('/' + appId + '/subscriptions', function (response) {
			console.log('_getSubscriptions: ', response);
		}.bind(this));
	},

	_login: function () {
		window.FB.login(function (response) {
			console.log('window.FB.login: ', response);
			this._updateStatusCallback(response);
		}.bind(this), { scope: 'email, manage_pages, read_page_mailboxes, pages_messaging' });
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
					{ className: 'btn btn-lg btn-primary', onClick: this._login },
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
			) : React.createElement(
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
							'select',
							{
								className: 'form-control',
								id: 'ctc-select-1',
								value: this.state.selectedPage.id,
								onChange: this._onChange
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
var ViberTrunkComponent = React.createClass({
	displayName: 'ViberTrunkComponent',


	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function () {
		return {
			init: true
		};
	},

	componentWillMount: function () {
		this._initService();
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
			'div',
			null,
			React.createElement(
				'form',
				{ className: 'form-horizontal' },
				React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ htmlFor: 'ctc-select-2', className: 'col-sm-4 control-label' },
						'App Key'
					),
					React.createElement(
						'div',
						{ className: 'col-sm-6' },
						React.createElement('input', {
							id: 'ctc-select-2',
							className: 'form-control',
							value: this.state.access_token,
							onChange: this._onChange,
							placeholder: 'e.g. 445da6az1s345z78-dazcczb2542zv51a-e0vc5fva17480im9'
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
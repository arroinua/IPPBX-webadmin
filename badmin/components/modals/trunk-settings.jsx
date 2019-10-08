var TrunkSettingsModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		open: React.PropTypes.bool,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: null,
			lastFetchedOid: null,
			fetching: false,
			validationError: false
		};
	},

	componentWillMount: function() {
		var oid = this.props.params ? this.props.params.oid : 'trunk';
		var trunk = {};
		getObject(oid, function(result) {
			trunk = oid !== 'trunk' ? result : this._setDefaultParams(result);
			this.setState({ lastFetchedOid: oid, params: trunk, validationError: false });
		}.bind(this))
	},

	componentWillReceiveProps: function(props) {
		var oid = props.params ? props.params.oid : 'trunk';
		var trunk = {};
		if(oid !== this.state.lastFetchedOid) {
			getObject(oid, function(result) {
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

	_setDefaultParams: function(params) {
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

	_saveChanges: function() {
		var params = extend({}, this.state.params);
		if(!params.name || (params.type === 'external' && !params.domain)) {
			this.setState({ validationError: true });
			return notify_about('error', this.props.frases.USERS_GROUP.REQUIRED_FIELDS_MSG);
		}

		params.parameters.codecs = params.parameters.codecs.map(function(item) { delete item.enabled; return item; });

		this.setState({ fetching: true, validationError: false });

		setObject(this.state.params, { changeUrl: false }, function(err, result) {
			if(err) {
				this.setState({ fetching: false});
				return notify_about('error', err.message);
			}

			this.setState({ fetching: false });
			this.props.onSubmit(params);

		}.bind(this))
	},

	_isInnerParameter: function(param) {
		return param.split('.').length > 1;
	},

	_setInnerParameter: function(obj, str, value) {
		var keys = str.split('.');
		var scope = obj;
		keys.forEach(function(key, index) {
			scope = scope[key] || {};
			if(index === keys.length-1) scope = value;
		});
	},

	_onChange: function(e) {
		var state = extend({}, this.state.params);
		var target = e.target;
		var type = (target.getAttribute && target.getAttribute('data-type')) || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		Utils.debug('_onChange: ', target.name, value);

		if(this._isInnerParameter(target.name)) this._setInnerParameter(state, target.name, (type === 'number' ? parseFloat(value) : value));
		else state[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: state });
	},

	_onProtocolParamsChange: function(e) {
		var state = extend({}, this.state.params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.parameters[target.name] = type === 'number' ? parseFloat(value) : value;
		this.setState({ params: state });
	},

	_onCodecsParamsChange: function(list) {
		var state = extend({}, this.state.params);
		state.parameters.codecs = list;
		this.setState({ params: state });
	},

	_getBody: function() {
		if(this.state.params) {
			return <TrunkConnectionComponent 
				frases={this.props.frases} 
				params={this.state.params}
				externalOnly={true} 
				onChange={this._onChange} 
				onProtocolParamsChange={this._onProtocolParamsChange} 
				onCodecsParamsChange={this._onCodecsParamsChange}
				validationError={this.state.validationError}
			/>
		} else {
			return <div className="text-center"><Spinner /></div>
		}
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				size="lg"
				type="success"
				title={frases.TRUNK.CREATE_NEW_TRUNK_MODAL_HEADER}
				submitText={frases.SUBMIT} 
				cancelText={frases.CANCEL} 
				submit={this._saveChanges} 
				onClose={this.props.onClose}
				closeOnSubmit={false}
				fetching={this.state.fetching}
				open={this.props.open}
				body={body}
			>
			</ModalComponent>
		);
	}
	
});

TrunkSettingsModalComponent = React.createFactory(TrunkSettingsModalComponent);


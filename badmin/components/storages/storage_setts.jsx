var StorageComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			fetch: false,
			data: {},
			modalId: 'storage-settings',
			validationError: false
		};
	},

	componentDidMount: function() {
		this.setState({ data: this.props.data || {}, open: this.props.open });
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({ data: nextProps.data || {}, open: nextProps.open });
	},

	_onChange: function(e) {
		var target = e.target;
		var data = this.state.data;
		data[target.name] = target.type === 'number' ? parseFloat(target.value) : target.value;
		this.setState(data);
	},

	_saveChanges: function() {
		var data = this.state.data;
		
		if(!data.path || !data.maxsize) return this.setState({ validationError: true });

		this.setState({ fetch: true, validationError: false });

		this.props.onSubmit({
			id: data.id,
			path: data.path,
			maxsize: data.maxsize,
			state: data.state
		}, function(err) {
			if(err) {
				this.setState({ fetch: false });
				return notify_about('error', err.message);
			}
			this.setState({ fetch: false, open: false });
		}.bind(this));
	},

	_getModalBody: function() {

		return (
			<div className="row">
				<form role="form">
				    <input type="text" name="id" value={this.state.data.id} className="hidden" />
				    <div className={"col-xs-12 form-group "+((this.state.validationError && !this.state.data.path) ? 'has-error' : '')}>
				        <label htmlFor="storage-path">{this.props.frases.PATH}</label>
				        <input type="text" name="path" value={this.state.data.path} onChange={this._onChange} className="form-control" required />
				    </div>
				    <div className={"col-xs-12 col-sm-6 form-group "+((this.state.validationError && !this.state.data.maxsize) ? 'has-error' : '')}>
				        <label htmlFor="storage-maxsize">{this.props.frases.STORAGE.MAXSIZE}</label>
				        <div className="input-group">
				            <input type="number" name="maxsize" min="0" value={this.state.data.maxsize} onChange={this._onChange} className="form-control" required />
				            <span className="input-group-addon">GB</span>
				        </div>
				    </div>
				    <div className="form-group col-xs-12 col-sm-6">
				        <label htmlFor="storage-state">{this.props.frases.STATE}</label>
				        <select name="state" value={this.state.data.state} onChange={this._onChange} className="form-control">
				            <option value="1">{this.props.frases.STORAGE.STATES["1"]}</option>
				            <option value="0">{this.props.frases.STORAGE.STATES["0"]}</option>
				            <option value="2">{this.props.frases.STORAGE.STATES["2"]}</option>
				        </select>
				    </div>
				</form>
			</div>
		);
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getModalBody();

		return (
			<ModalComponent 
				type="success"
				id={this.state.modalId} 
				title={frases.STORAGE.STORAGE_SETTINGS} 
				submitText={frases.SAVE} 
				cancelText={frases.CANCEL} 
				submit={this._saveChanges}
				open={this.state.open} 
				fetching={this.state.fetch}
				body={body}
			></ModalComponent>
		);
	}
	
});

StorageComponent = React.createFactory(StorageComponent);
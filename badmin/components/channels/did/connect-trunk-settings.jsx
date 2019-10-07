var ConnectTrunkSettings = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		getObjects: React.PropTypes.func,
		onChange: React.PropTypes.func,
		pageid: React.PropTypes.string,
		isNew: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			number: "",
			trunks: [],
			selectedTrunk: {},
			phoneNumber: "",
			fetching: false,
			showNewTrunkModal: false
		};
	},

	componentWillMount: function() {
		var state = { fetching: true };
		var selectedTrunk = null;
		
		this.setState(state);

		this._getTrunks(function(result) {
			state.trunks = result;

			if(this.props.pageid) {
				state.phoneNumber = this._parsePageId(this.props.pageid)[0];
				selectedTrunk = this._parsePageId(this.props.pageid)[1];
			} else {
				if(result.length) selectedTrunk = result[0].oid;
				else state.showNewTrunkModal = true;
			}

			state.fetching = false;

			this.setState(state);

			setTimeout(function() {
				this._selectTrunk(selectedTrunk);
			}.bind(this), 200);

		}.bind(this));
	},

	componentWillReceiveProps: function(props) {
		if(props.pageid) this._parsePageId(props.pageid);
	},

	_getTrunks: function(callback) {
		this.props.getObjects('trunk', function(result) {
			callback(result.filter(function(item) { return item.name !== 'LOCAL TRUNK' }));
		}.bind(this));
	},

	_selectTrunk: function(oid) {
		var trunk = this.state.trunks.filter(function(item) { return item.oid === oid });
		this.setState({ selectedTrunk:  trunk[0] });
	},

	_onTrunkSelect: function(e) {
		var oid = e.target.value;
		this._selectTrunk(oid);
	},

	_parsePageId: function(str) {
		var params = str.split('@');
		return params;
	},

	_onNumberChange: function(e) {
		var number = e.target.value.trim();
		this.setState({ phoneNumber: number });
		this.props.onChange({
			id: (number+"@"+this.state.selectedTrunk.oid)
		});
	},

	_showNewTrunkSettings: function(e) {
		e.preventDefault();
		this.setState({ showNewTrunkModal: true });
	},

	_onTrunkAdd: function(params) {
		Utils.debug('ConnectTrunkSettings', params);
		var trunks = [].concat(this.state.trunks, [params]);
		this.setState({ trunks: trunks, selectedTrunk: params, showNewTrunkModal: false });
	},

	render: function() {
		var frases = this.props.frases;

		if(this.state.fetching) return <Spinner />

		return (
			<div>
				{
					(!this.state.trunks || !this.state.trunks.length) ? (
						<div className="col-sm-12 text-center">
							<p>{frases.CHAT_TRUNK.DID.NO_CREATED_TRUNKS_MSG}</p>
							<p><a href="#" className="btn btn-lg btn-primary" onClick={this._showNewTrunkSettings}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.DID.NEW_SIP_CONNECTION_BTN}</a></p>
						</div>
					) : (
						<form className="form-horizontal" autoComplete='off'>
							<div className="form-group">
							    <label htmlFor="phoneNumber" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.TRUNK_NUMBER_LABEL}</label>
								<div className="col-sm-3"><input type="tel" className="form-control" name="phoneNumber" value={this.state.phoneNumber} onChange={this._onNumberChange} /></div>
							</div>
							<div className="form-group">
							    <label htmlFor="selectedTrunk" className="col-sm-4 control-label">{this.props.isNew ? frases.CHAT_TRUNK.DID.SELECT_TRUNK_LABEL : frases.CHAT_TRUNK.DID.SELECTED_TRUNK_LABEL}</label>
						    	{
						    		!this.props.isNew && this.state.selectedTrunk ? (
						    			<div className="col-sm-3">
							    			<p className="form-control-static">{this.state.selectedTrunk.name}</p>
							    		</div>
						    		) : (
						    			<div>
				    						<div className="col-sm-3">
						    					<select className="form-control" name="selectedTrunk" value={this.state.selectedTrunk.oid} onChange={this._onTrunkSelect} required>
						    						{
						    							this.state.trunks.map(function(item) {
						    								return <option key={item.oid} value={item.oid}>{item.name}</option>
						    							})
						    						}
						    					</select>
						    				</div>
						    				<div className="col-sm-1 text-center"><DividerComponent>{frases.OR}</DividerComponent></div>
						    				<div className="col-sm-4">
						    					<a href="#" className="btn btn-link" onClick={this._showNewTrunkSettings}><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.DID.NEW_SIP_CONNECTION_BTN}</a>
						    				</div>
						    			</div>
							    	)
						    	}
							</div>
						</form>
					)
				}


				{
					<TrunkSettingsModalComponent 
						frases={frases} 
						open={this.state.showNewTrunkModal}
						onSubmit={this._onTrunkAdd} 
						onClose={ function() { this.setState({ showNewTrunkModal: false }) }.bind(this) } 
					/>
				}
			</div>
		);
		
	}
});

ConnectTrunkSettings = React.createFactory(ConnectTrunkSettings);

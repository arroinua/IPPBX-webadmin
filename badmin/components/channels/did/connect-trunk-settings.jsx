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
			fetching: false
		};
	},

	componentWillMount: function() {
		this._getTrunks(function(result) {
			console.log('ConnectTrunkSettings result: ', result);
			this.setState({
				trunks: result
			});

			if(this.props.pageid) {
				setTimeout(function() {
					this._parsePageId(this.props.pageid);
				}.bind(this), 100)
			} else {
				this.setState({ selectedTrunk: result.length ? result[0] : {} });
			}

		}.bind(this));
	},

	componentWillReceiveProps: function(props) {
		if(props.pageid) this._parsePageId(props.pageid);
	},

	_getTrunks: function(callback) {
		this.setState({ fetching: true });
		this.props.getObjects('trunk', function(result) {
			this.setState({ fetching: false });

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
		this.setState({ phoneNumber: params[0] })
		this._selectTrunk(params[1]);
	},

	_onNumberChange: function(e) {
		var number = e.target.value;
		this.setState({ phoneNumber: number });
		this.props.onChange({
			id: (number+"@"+this.state.selectedTrunk.oid)
		});
	},

	render: function() {
		var frases = this.props.frases;
		
		return (
			<div>
				{
					this.state.fetching ? (
						<Spinner />
					) : (
							<div>
								<div className="form-group">
								    <label htmlFor="selectedTrunk" className="col-sm-4 control-label">{this.props.isNew ? frases.CHAT_TRUNK.DID.SELECT_TRUNK_LABEL : frases.CHAT_TRUNK.DID.SELECTED_TRUNK_LABEL}</label>
							    	{
							    		!this.props.isNew && this.state.selectedTrunk ? (
							    			<div className="col-sm-3">
								    			<p className="form-control-static">{this.state.selectedTrunk.name}</p>
								    		</div>
							    		) : (
							    			this.state.trunks.length ? (
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
								    				<div className="col-sm-1 text-center"><strong>{frases.OR}</strong></div>
								    				<div className="col-sm-4">
								    					<a href="#trunk/trunk" className="btn btn-link"><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_TRUNK}</a>
								    				</div>
								    			</div>
								    		) : (
								    			<div className="col-sm-8">
								    				<p>
								    					<span>{frases.CHAT_TRUNK.DID.NO_CREATED_TRUNKS_MSG}</span>
								    					<a href="#trunk/trunk" className="btn btn-link"><i className="fa fa-plus-circle"></i> {frases.CHAT_TRUNK.CREATE_TRUNK}</a>
								    				</p>
								    			</div>
								    		)
								    	)
							    	}
								</div>
								{
									this.state.selectedTrunk ? (
										<div className="form-group">
										    <label htmlFor="phoneNumber" className="col-sm-4 control-label">{frases.CHAT_TRUNK.DID.TRUNK_NUMBER_LABEL}</label>
											<div className="col-sm-3"><input type="text" className="form-control" name="phoneNumber" value={this.state.phoneNumber} onChange={this._onNumberChange} /></div>
										</div>

									) : null
								}
							</div>
					)
				}
			</div>
		);
		
	}
});

ConnectTrunkSettings = React.createFactory(ConnectTrunkSettings);

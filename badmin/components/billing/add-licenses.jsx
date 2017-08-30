var AddLicensesComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		sub: React.PropTypes.object,
		addLicenses: React.PropTypes.func
	},

	getInitialState: function() {
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

	_addLicenses: function() {
		this.props.addLicenses(this._currState);
	},

	_setAmount: function() {
		
	},

	_setTo: function(event) {
		var targ = event.target;
		var value = parseFloat(targ.value);
		if(!targ.value || targ.value < 0) value = 0;
		this._currState[targ.name] = value;
		this.setAmount();
		this.setState(this._currState);
	},

	_addTo: function(item, step) {
		this._currState[item] += parseInt(step, 10);
		this.setState(this._currState);
	},

	_removeFrom: function(item, step) {
		if(this._currState[item] <= 0) return;
		this._currState[item] -= parseInt(step, 10);
		this.setState(this._currState);
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div style={{ padding: '20px 0' }}>
				<div className="row">
					<div className="col-sm-4">
						<div className="input-group">
							<span className="input-group-btn">
								<button className="btn btn-default" type="button"><i className="fa fa-minus" onClick={this._removeFrom.bind(this, 'users', 1)}></i></button>
							</span>
							<input type="number" className="form-control" name="users" value={this.state.users} onChange={this._setTo} placeholder="Number of users to add" />
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" onClick={this._addTo.bind(this, 'users', 1)}><i className="fa fa-plus"></i></button>
							</span>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="input-group">
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" onClick={this._removeFrom.bind(this, 'storage', 5)}><i className="fa fa-minus"></i></button>
							</span>
							<input type="number" className="form-control" name="storage" value={this.state.storage} onChange={this._setTo} placeholder="Storage size to add" />
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" onClick={this._addTo.bind(this, 'storage', 5)}><i className="fa fa-plus"></i></button>
							</span>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="input-group">
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" onClick={this._removeFrom.bind(this, 'lines', 2)}><i className="fa fa-minus"></i></button>
							</span>
							<input type="number" className="form-control" name="lines" value={this.state.lines} onChange={this._setTo} placeholder="Number of lines to add" />
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" onClick={this._addTo.bind(this, 'lines', 2)}><i className="fa fa-plus"></i></button>
							</span>
						</div>
					</div>
				</div>
				<div className="row">
					<hr className="col-xs-12" />
					<div className="col-xs-12 text-center">
						<button className="btn btn-primary btn-lg" onClick={this._addLicenses}>Buy licenses</button>
					</div>
				</div>
			</div>
		);
	}
});

AddLicensesComponent = React.createFactory(AddLicensesComponent);

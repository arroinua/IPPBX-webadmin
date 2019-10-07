 var GroupFeaturesComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groupKind: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {}
		});		
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		params: props.params
	// 	});
	// },

	_onChange: function(e) {
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

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;

		console.log('GroupFeaturesComponent: ', params);

		return (
			<form className="form-horizontal">
				<div className="row">
					<div className="col-sm-6 col-xs-12">
				        <div className="col-xs-12 pl-kind pl-users">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="recording" checked={params.recording} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.ALLOW_RECORDING}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="busyover" checked={params.busyover} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.BUSYOVER}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="callpickup" checked={params.callpickup} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.PICKUP}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="monitor" checked={params.monitor} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.CALLMONITOR}
				                </label>
				            </div>
				        </div>
				        {
				        	this.props.groupKind === 'equipment' && (
				        		<div>
				        			<div className="col-xs-12">
						        		<div className="checkbox">
							                <label>
							                    <input type="checkbox" name="dnd" checked={params.dnd} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.DND}
							                </label>
							            </div>
							        </div>
							        <div className="col-xs-12">
							            <div className="checkbox">
							                <label>
							                    <input type="checkbox" name="callwaiting" checked={params.callwaiting} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.CALLWAITING}
							                </label>
							            </div>
							        </div>
						        </div>
				        	)
				        }
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="forwarding" checked={params.forwarding} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.FORWARDING}
				                </label>
				            </div>
				        </div>
				        {
				        	this.props.groupKind === 'users' && (
				        		<div className="col-xs-12">
						            <div className="checkbox">
						                <label>
						                    <input type="checkbox" name="voicemail" checked={params.voicemail} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.VOICEMAIL}
						                </label>
						            </div>
						        </div>
				        	)	
				        }
						        
				    </div>
				    <div className="col-sm-6 col-xs-12">
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="dndover" checked={params.dndover} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.DNDOVER}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="busyoverdeny" checked={params.busyoverdeny} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.BUSYOVERDENY}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="pickupdeny" checked={params.pickupdeny} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.PICKUPDENY}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="monitordeny" checked={params.monitordeny} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.MONITORDENY}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="outcallbarring" checked={params.outcallbarring} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.OUTBARGING}
				                </label>
				            </div>
				        </div>
				        <div className="col-xs-12">
				            <div className="checkbox">
				                <label>
				                    <input type="checkbox" name="costroutebarring" checked={params.costroutebarring} onChange={this._onChange} /> {frases.USERS_GROUP.FUNCTIONS.COSTBARGING}
				                </label>
				            </div>
				        </div>
				    </div>
				</div>
			</form>			
		);
	}
});

GroupFeaturesComponent = React.createFactory(GroupFeaturesComponent);

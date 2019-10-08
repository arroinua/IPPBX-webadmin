var TrunkComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			
		};
	},

	// componentWillMount: function() {

	// },

	_onChange: function(val) {
		console.log('Select: ', val);
		if(!val) return;

		this.setState({ route: val });
		this.props.onChange(this._getRouteObj(val.value));
	},

	render: function() {
		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled || false}
			    	onStateChange={this._onStateChange}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.state.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.REGSETTINGS}>
					    	<TrunkSettingsComponent frases={frases} params={this.state.params} />
					    </PanelComponent>	
			    	</div>
			    	<div className="col-xs-12">
			    	
			    	</div>
			    </div>
			</div>	        
		);
	}
});

TrunkComponent = React.createFactory(TrunkComponent);

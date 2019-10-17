 var ApplicationComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		setObject: React.PropTypes.func,
		removeObject: React.PropTypes.func,
		onStateChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {},
			file: null
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params || {}
		});		
	},

	componentWillReceiveProps: function(props) {
		var stateUpdate = { params: props.params };
		if(props.params.name && !this.props.params.name) {
			stateUpdate.file = null;
		}

		this.setState(stateUpdate);
	},

	_setObject: function() {
		var frases = this.props.frases;
		if(!this.props.params.name && !this.state.file) return alert(frases.APPLICATIONS.NO_APP_ERROR);
		this.props.setObject(this.state.params, this.state.file);
	},

	_onStateChange: function(state) {
		var params = extend({}, this.state.params);
		params.enabled = state;
		this.setState({ params: params });
		this.props.onStateChange(state);
	},

	_onNameChange: function(value) {
		var params = extend({}, this.state.params);
		params.name = value;
		this.setState({ params: params });
		this.props.onNameChange(value);
	},

	_handleOnChange: function(e) {
		var state = extend({}, this.state);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		state.params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.setState({
			state: state
		});
	},

	_handleOnParametersChange: function(e) {
		var params = extend({}, this.state.params);
		var parameters = [].concat(params.parameters);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		parameters = parameters.map(function(item) { if(item.key === target.name) return { key: item.key, value: target.value }; return item; })
		params.parameters = parameters;

		this.setState({ params: params });
	},

	_onFileUpload: function(file) {

		this.setState({
			file: file
		});	
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;

		return (
			<div>
			    <ObjectName 
			    	name={params.name}
			    	frases={frases} 
			    	enabled={params.enabled || false}
			    	onStateChange={this._onStateChange}
			    	placeholder={frases.NAME}
			    	onChange={this._onNameChange}
			    	onSubmit={this._setObject}
			    	onCancel={this.props.removeObject}
			    />
			    <div className="row">
			    	<div className="col-xs-12">
			    		<PanelComponent header={frases.SETTINGS.SETTINGS}>
	    					<div>
				    			<p dangerouslySetInnerHTML={{ __html: Utils.htmlDecode(frases.APPLICATIONS.UPLOAD_APP_DESC) }}></p>
				    			<DragAndDropComponent frases={frases} onChange={this._onFileUpload} params={{ filename: params.filename, allowedTypes: ['.application'] }} />
		    				</div>
			    			<form className="form-horizontal">
			    				<div className="form-group">
			    				    <div className="col-sm-12">
			    				        <div className="checkbox">
			    				            <label>
			    				                <input type="checkbox" name="debug" checked={ this.state.params.debug } onChange={ this._handleOnChange } /> 
			    				                <span>{frases.APPLICATIONS.DEBUG} </span> 
			    				            </label>
			    				        </div>
			    				    </div>
			    				</div>
			    			</form>
			    		</PanelComponent>
			    		{
			    			this.props.params.name && (
			    				<PanelComponent header={frases.APPLICATIONS.APP_PARAMETERS_HEADER}>
									<form className="form-horizontal" onChange={ this._handleOnParametersChange }>
										{
											<div>
												{
													params.parameters.map(function(item) {
														return (

															<div key={item.key} className="form-group">
															    <label className="col-sm-4 control-label">
															        <span>{item.key}</span>
															    </label>
															    <div className="col-sm-8">
															        <input type="text" className="form-control" name={item.key} value={ item.value } />
															    </div>
															</div>				

														)
													})
												}
													
											</div>
										}
									</form>
					    		</PanelComponent>
			    			)
			    		}
			    	</div>
			    </div>
			</div>
		);
	}
});

ApplicationComponent = React.createFactory(ApplicationComponent);

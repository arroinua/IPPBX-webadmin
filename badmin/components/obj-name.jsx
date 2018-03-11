
var ObjectName = React.createClass({

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

	getInitialState: function() {
		return {
			name: '',
			submitDisabled: false,
			enabled: false,
			pending: false
		};
	},

	componentWillMount: function() {
		this.setState({ 
			name: this.props.name || '',
			enabled: this.props.enabled,
			submitDisabled: !this.props.name || this.props.submitDisabled
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			name: props.name || '',
			submitDisabled: !props.name || props.submitDisabled
		});		
	},

	_onSubmit: function() {
		this.props.onSubmit();
	},

	_onCancel: function() {
		this.props.onCancel();
	},

	_onChange: function(e) {
		var target = e.target;
		var disabled = !target.value;

		console.log('disabled: ', disabled);

		this.setState({ name: target.value, submitDisabled: disabled || this.props.submitDisabled });
		this.props.onChange(target.value);
	},

	_toggleState: function(e) {
		var state = !this.state.enabled;
		this.setState({ enabled: state, pending: true });
		this.props.onStateChange(state, function(err, result) {
			console.log('ObjectName _toggleState: ', err, result);
			this.setState({ pending: false });
			if(err) this.setState({ enabled: !state });
		}.bind(this))
	},

	_getFooter: function() {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;

		return (
			<div>
				{
					props.onSubmit ?
					<button type="button" style={{ marginRight: "5px" }} className="btn btn-success" onClick={props.onSubmit} disabled={state.submitDisabled}><i className="fa fa-check fa-fw"></i> {frases.SAVE}</button>
					: ""
				}
				{
					props.onCancel ?
					<button type="button" className="btn btn-link btn-danger pull-right" onClick={props.onCancel}><i className="fa fa-trash fa-fw"></i> {frases.DELETE}</button>
					: ""
				}
			</div>
		);
	},

	render: function() {
		var frases = this.props.frases;
		var state = this.state;
		var props = this.props;
		var Footer = this._getFooter();

		console.log('ObjectName render: ', state);

		return (
			<PanelComponent classname="object-name-cont" footer={Footer}>
				<div className="input-group object-name">
				    <input 
				    	id="objname"
				    	type="text" 
				    	className="form-control" 
				    	placeholder={props.placeholder || frases.GROUPSNAME} 
				    	value={state.name}
				    	onChange={this._onChange} 
				    	required
				    	autoFocus 
				    />
				    { props.routes && <span className="input-group-addon object-route view-1"></span> }
				    <span className="input-group-addon">
				        <div className="switch switch-md">
				            <input 
				            	className="cmn-toggle cmn-toggle-round" 
				            	type="checkbox" 
				            	checked={state.enabled} 
				            />
				            <label 
				            	htmlFor="enabled" 
				            	data-toggle="tooltip" 
				            	title={frases.OBJECT__STATE} 
				            	onClick={this._toggleState}
				            	style={{ 
				            		opacity: state.pending ? 0.2 : 1,
									pointerEvents: state.pending ? 'none' : 'auto' 
								}}
				            ></label>
				        </div>
				    </span>
				</div>
			</PanelComponent>	        
		);
	}
});

ObjectName = React.createFactory(ObjectName);

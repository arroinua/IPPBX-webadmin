var WebchatTrunkIntroSettsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		fields: React.PropTypes.array,
		message: React.PropTypes.string,
		consentText: React.PropTypes.string,
		setIntro: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			intro: false,
			fields: [],
			selectedFields: []
			// fieldToAdd: "uname"
		};
	},

	componentWillMount: function() {
		var frases = this.props.frases;
		var fields = [{
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.uname,
			type: 'text',
			name: 'uname',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.uname,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.email,
			type: 'email',
			name: 'email',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.email,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.phone,
			type: 'tel',
			name: 'phone',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.phone,
			required: true
		}, {
			label: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.consent,
			type: 'checkbox',
			name: 'consent',
			placeholder: frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_PLACEHOLDERS.consent,
			required: true	
		}];
		var selectedFields = (this.props.fields && this.props.fields.length) ? this.props.fields.map(function(item) { return item.name }) : [];

		this.setState({
			fields: fields,
			selectedFields: selectedFields,
			intro: selectedFields.length
		})
	},

	componentWillReceiveProps: function(props) {
		var selectedFields = (props.fields && props.fields.length) ? props.fields.map(function(item) { return item.name }) : [];
		
		this.setState({
			selectedFields: selectedFields
		})
	},

	_onChange: function(e) {
		var checked = this.state.intro;
		this.setState({ intro: !checked });
		if(checked) this.props.setIntro([]);
	},

	_onFieldSelect: function(e) {
		var checked = e.target.checked;
		var name = e.target.name;
		var selected = [].concat(this.state.selectedFields);
		var newIntro = [];

		if(checked) {
			selected.push(name);
		} else {
			selected.splice(selected.indexOf(name), 1);
		}

		newIntro = this.state.fields.filter(function(item) { return selected.indexOf(item.name) !== -1  });

		this.props.setIntro(newIntro);
		this.setState({ selectedFields: selected });
	},

	// _onFieldSelect: function(e) {
	// 	this.setState({ fieldToAdd: e.target.value });
	// },

	// _addField: function(e) {
	// 	var fieldToAdd = this.state.fieldToAdd;
	// 	var obj = this.state.fields.filter(function(item) { return item.name === fieldToAdd })[0];
	// 	var selectedFields = this.state.selectedFields.concat([obj]);
	// 	this.props.setIntro(selectedFields);
	// 	// this.setState({
	// 	// 	selectedFields: selectedFields
	// 	// })
	// },

	_onFieldChange: function(e) {
		var selectedFields = this.state.selectedFields.map(function(item) { if(item.name === e.target.name) item.placeholder = e.target.value; return item; });
		this.props.setIntro(selectedFields);
		// this.setState({ selectedFields: selectedFields });
	},

	// _removeField: function(name, e) {
	// 	if(e) e.preventDefault();
	// 	var selectedFields = this.state.selectedFields.filter(function(item) { return item.name !== name });
	// 	this.props.setIntro(selectedFields);
	// 	// this.setState({
	// 	// 	selectedFields: selectedFields
	// 	// })
	// },

	render: function() {
		var intro = this.state.intro;
		var frases = this.props.frases;
		var selected = this.state.selectedFields;
		// var selected = this.state.selectedFields.map(function(item) { return item.name });
		
		return (
			<form className="form-horizontal" autoComplete='off'>
				<div className="form-group">
					<label htmlFor="greetings-feature" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.INTRO_CHECKBOX}</label>
					<div className="col-sm-8">
						<div className="switch switch-md">
						    <input 
						    	className="cmn-toggle cmn-toggle-round" 
						    	type="checkbox" 
						    	checked={intro} 
						    />
						    <label 
						    	htmlFor="greetings-feature-switch" 
						    	data-toggle="tooltip" 
						    	onClick={this._onChange}
						    ></label>
						</div>
					</div>
				</div>
				{
					intro ? (
						<div>
							<div className="form-group">
							    <label htmlFor="introMessage" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.INTRO_MESSAGE_LABEL}</label>
							    <div className="col-sm-8">
							    	<textarea rows="2" className="form-control" name="introMessage" value={this.props.message} onChange={this.props.onChange} autoComplete='off' required></textarea>
							    </div>
							</div>
							<div className="form-group">
							    <div className="col-sm-8 col-sm-offset-4">
						    		{
						    			this.state.fields.map(function(item) {
						    				return (
						    					<div key={item.name} className="checkbox">
						    					    <label>
						    					        <input type="checkbox" name={item.name} checked={ selected.indexOf(item.name) !== -1 } onChange={ this._onFieldSelect } /> {item.label}
						    					    </label>
						    					</div>
						    				)
						    			}.bind(this))
						    		}
							    </div>
							</div>
							{
								this.state.selectedFields.indexOf('consent') !== -1 ? (
									<div className="form-group">
									    <label htmlFor="consentText" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.INTRO_FIELDS_LABELS.consent}</label>
									    <div className="col-sm-8">
									    	<textarea rows="5" className="form-control" name="consentText" value={this.props.consentText} onChange={this.props.onChange} autoComplete='off' required></textarea>
									    </div>
									</div>
								) : null
							}
						</div>
					) : null
				}
			</form>
		);
	}
});

WebchatTrunkIntroSettsComponent = React.createFactory(WebchatTrunkIntroSettsComponent);

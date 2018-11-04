var WebchatTrunkIntroSettsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		fields: React.PropTypes.array,
		message: React.PropTypes.string,
		setIntro: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			intro: false,
			fields: [],
			selectedFields: [],
			fieldToAdd: "uname"
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

		this.setState({
			fields: fields,
			selectedFields: this.props.fields || [],
			intro: (this.props.fields && this.props.fields.length)
		})
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			selectedFields: props.fields || []
		})
	},

	_onChange: function(e) {
		var checked = e.target.checked;
		this.setState({ intro: checked });
		if(!checked) this.props.setIntro([]);
	},

	_onFieldSelect: function(e) {
		this.setState({ fieldToAdd: e.target.value });
	},

	_addField: function(e) {
		var fieldToAdd = this.state.fieldToAdd;
		var obj = this.state.fields.filter(function(item) { return item.name === fieldToAdd })[0];
		var selectedFields = this.state.selectedFields.concat([obj]);
		this.props.setIntro(selectedFields);
		// this.setState({
		// 	selectedFields: selectedFields
		// })
	},

	_onFieldChange: function(e) {
		var selectedFields = this.state.selectedFields.map(function(item) { if(item.name === e.target.name) item.placeholder = e.target.value; return item; });
		this.props.setIntro(selectedFields);
		// this.setState({ selectedFields: selectedFields });
	},

	_removeField: function(name, e) {
		if(e) e.preventDefault();
		var selectedFields = this.state.selectedFields.filter(function(item) { return item.name !== name });
		this.props.setIntro(selectedFields);
		// this.setState({
		// 	selectedFields: selectedFields
		// })
	},

	render: function() {
		var intro = this.state.intro;
		var frases = this.props.frases;
		var selected = this.state.selectedFields.reduce(function(array, item) { return array.concat([item.name]) }, []);
		
		return (
			<form className="form-horizontal" autoComplete='off'>
				<div className="form-group">
					<div className="col-sm-4 col-sm-offset-4">
					  	<div className="checkbox">
					    	<label>
					      		<input type="checkbox" checked={intro} name="intro" onChange={this._onChange} /> {frases.CHAT_TRUNK.WEBCHAT.INTRO_CHECKBOX}
					    	</label>
					  	</div>
					</div>
				</div>
				{
					intro ? (
						<div>
							<div className="form-group">
							    <label htmlFor="introMessage" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.INTRO_MESSAGE_LABEL}</label>
							    <div className="col-sm-4">
							    	<textarea rows="2" className="form-control" name="introMessage" value={this.props.message} onChange={this.props.onChange} autoComplete='off' required></textarea>
							    </div>
							</div>
							<div className="form-group">
							    <div className="col-sm-4 col-sm-offset-4">
							    	<select type="text" className="form-control" name="fieldToAdd" value={this.state.fieldToAdd} onChange={this._onFieldSelect} required>
							    		{
							    			this.state.fields.map(function(item) {
							    				return <option key={item.name} value={item.name} disabled={selected.indexOf(item.name) !== -1}>{item.label}</option>
							    			})
							    		}
							    	</select>
							    </div>
							    <div className="col-sm-4"><button type="button" className="btn btn-default" onClick={this._addField} disabled={selected.indexOf(this.state.fieldToAdd) !== -1 }>{frases.CHAT_TRUNK.WEBCHAT.ADD_FIELD_BTN}</button></div>
							</div>
							{
								this.state.selectedFields.map(function(item) {
									return (
										<div key={item.name} className="form-group">
										    <label htmlFor={item.name} className="col-sm-4 control-label">{item.label}</label>
										    <div className="col-sm-4">
										    	{
										    		item.name === 'consent' ? (
										    			<textarea rows="5" className="form-control" name={item.name} value={item.placeholder} onChange={this._onFieldChange} autoComplete='off' required></textarea>
									    			) : (
									    				<input type="text" className="form-control" name={item.name} value={item.placeholder} onChange={this._onFieldChange} autoComplete='off' required />
									    			)
										    	}
										    </div>
										    <div className="col-sm-4">
										    	<a href="#" onClick={this._removeField.bind(this, item.name)}><span className="fa fa-close"></span></a>
										    </div>
										</div>
									)
										
								}.bind(this))
							}
						</div>
					) : null
				}
			</form>
		);
	}
});

WebchatTrunkIntroSettsComponent = React.createFactory(WebchatTrunkIntroSettsComponent);

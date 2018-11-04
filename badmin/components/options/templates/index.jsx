var TemplatesSettingsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
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

	_onChange: function(e) {
		var state = this.state;
		var params = state.params;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.props.onChange(params);
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;

		return (
			<form className="form-horizontal" autoComplete="off">
				<p className="col-sm-offset-4 col-sm-8">{frases.TEMPLATES_SETTS.NEW_USER_DESC}</p>
				<div className="form-group">
			        <label htmlFor="service.email.subject" className="col-sm-4 control-label">{frases.TEMPLATES_SETTS.NEW_USER_SUBJECT_LABEL}</label>
			        <div className="col-sm-8">
			            <input type="text" className="form-control" name="service.email.subject" value={params['service.email.subject']} onChange={this._onChange} placeholder={frases.TEMPLATES_SETTS.NEW_USER_SUBJECT_LABEL} autoComplete="off" />
			        </div>
			    </div>
			    <div className="form-group">
			        <label htmlFor="service.email.created" className="col-sm-4 control-label">{frases.TEMPLATES_SETTS.NEW_USER_BODY_LABEL}</label>
			        <div className="col-sm-8">
			            <textarea type="text" rows='5' className="form-control" name="service.email.created" value={params['service.email.created']} onChange={this._onChange} placeholder={frases.TEMPLATES_SETTS.NEW_USER_BODY_LABEL} aria-describedby="subjectHelper" autoComplete="off"></textarea>
			            <span id="subjectHelper" className="help-block">{frases.TEMPLATES_SETTS.NEW_USER_BODY_HELPER}</span>
			        </div>
			    </div>
			</form>
		);
	}
});

TemplatesSettingsComponent = React.createFactory(TemplatesSettingsComponent);

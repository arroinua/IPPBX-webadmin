var GdprConsentProfileComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		profile: React.PropTypes.object,
		reasons: React.PropTypes.array,
		langs: React.PropTypes.array,
		onChange: React.PropTypes.func,
		deleteProfile: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			profile: {},
			reasons: []
		};
	},

	componentWillMount: function() {
		var profile = (this.props.profile || {});
		var selectedReasons = profile.reasons.reduce(function(array, item) { array.push(item.id); return array; }, []);
		var obj = {};
		var reasons = this.props.reasons.map(function(item) {
			obj = {};
			obj.id = item.id;
			obj.text = item.text;
			if(selectedReasons.indexOf(item.id) !== -1) obj.checked = true;
			return obj;
		});

		this.setState({
			profile: profile,
			reasons: reasons
		});		
	},

	_onChange: function(e) {
		var state = this.state;
		var params = state.profile;
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		params[target.name] = type === 'number' ? parseFloat(value) : value;

		this.props.onChange(params);
	},

	_onReasonSelect: function(reason) {
		var profile = this.state.profile;
		var reasons = this.state.reasons.map(function(item) {
			if(item.id === reason.id) item.checked = item.checked ? false : true;
			return item;
		});
		
		profile.reasons = reasons
			.filter(function(item) { return item.checked })
			.map(function(item) { return { id: item.id, text: item.text } });

		this.setState({
			profile: profile,
			reasons: reasons
		});

		this.props.onChange(profile);
	},

	_deleteProfile: function() {
		this.props.deleteProfile(this.props.profile.id);
	},

	render: function() {
		var frases = this.props.frases;
		var profile = this.state.profile;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<form className="form-horizontal">
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.PROFILE_NAME_LABEL}</label>
								<div className="col-md-6 col-sm-6">
									<input type="text" className="form-control" name="name" value={profile.name} onChange={this._onChange} />
								</div>
							</div>
							<hr/>
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.PROFILE_LANGUAGE_LABEL}</label>
								<div className="col-md-6 col-sm-6">
									<select name="lang" className="form-control" value={profile.lang} onChange={this._onChange}>
										{
											this.props.langs.map(function(item) {
												return (
													<option key={item} value={item}>{item.toUpperCase()}</option>
												)
											})
										}
									</select>
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.COMPANY_NAME_LABEL}</label>
								<div className="col-md-6 col-sm-6">
									<input type="text" className="form-control" name="company" value={profile.company} onChange={this._onChange} />
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.POLICY_LINK_LABEL}</label>
								<div className="col-md-6 col-sm-6">
									<input type="text" className="form-control" name="policylink" value={profile.policylink} onChange={this._onChange} />
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.CONSENT_TEXT_LABEL}</label>
								<div className="col-md-8 col-sm-8">
									<textarea rows="5" className="form-control" name="text" value={profile.text} onChange={this._onChange}></textarea>
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-4 control-label">{frases.GDPR.PURPOSES_LABEL}</label>
								<div className="col-md-6 col-sm-6">
									{
										this.state.reasons.map(function(item, index) {
											return (
												<div className="checkbox" key={index}>
													<label>
														<input type="checkbox" checked={item.checked} onChange={this._onReasonSelect.bind(this, item)} /> {item.text} 
													</label>
												</div>
											)
										}.bind(this))
									}
								</div>
							</div>
							<div className="form-group">
								<br/>
								<div className="col-sm-offset-4 col-md-6 col-sm-6">
									<button type="button" className="btn btn-link btn-danger" onClick={this._deleteProfile}>{frases.GDPR.DELETE_PROFILE_BTN} <strong>{profile.name}</strong></button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
});

GdprConsentProfileComponent = React.createFactory(GdprConsentProfileComponent);

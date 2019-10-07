var GdprSettingsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {},
			defaultProfile: {},
			profiles: [],
			activeProfileId: "1",
			reasons: []
		};
	},

	componentWillMount: function() {
		var profiles = (this.props.params.gdpr || []);
		var frases = this.props.frases;
		if(!profiles.length) this._addProfile();

		this.setState({
			profiles: profiles,
			reasons: [
				{ text: frases.GDPR.PURPOSES.service, id: 'service'}, 
				{ text: frases.GDPR.PURPOSES.promotions, id: 'promotions'}, 
				{ text: frases.GDPR.PURPOSES.updates, id: 'updates'}, 
				{ text: frases.GDPR.PURPOSES.invitations, id: 'invitations'}, 
				{ text: frases.GDPR.PURPOSES.urgent, id: 'urgent'}, 
				{ text: frases.GDPR.PURPOSES.press, id: 'press'}
			],
			langs: ['en']
		});		
	},

	_addProfile: function(e) {
		if(e) e.preventDefault();
		var params = this.props.params;
		var profiles = this.state.profiles;
		var id = (this.state.profiles.length+1).toString();

		profiles.push({
			id: id,
			name: 'Profile '+id,
			company: params.name,
			text: (params.name + " " + this.props.frases.GDPR.DEFAULT_CONSENT_TEXT),
			reasons: [],
			lang: 'en'
		});

		this.setState({
			profiles: profiles,
			activeProfileId: id
		});
	},

	_selectProfile: function(id) {
		this.setState({
			activeProfileId: id
		});
	},

	_onChange: function(profile) {
		var profiles = this.state.profiles;
		profiles.splice(profile.id-1, 1, profile);

		this.setState({
			profiles: profiles
		});

		this.props.onChange(profiles);
	},

	_deleteProfile: function(id) {

		var profiles = this.state.profiles;
		profiles = profiles.filter(function(item) {
			return item.id !== id;
		});

		this.setState({
			profiles: profiles,
			activeProfileId: (profiles.length).toString()
		});

		this.props.onChange(profiles);
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var reasons = this.state.reasons;
		var langs = this.state.langs;
		var profiles = this.state.profiles;
		var activeProfileId = this.state.activeProfileId;
		var selectProfile = this._selectProfile;
		var deleteProfile = this._deleteProfile;

		return (
			<div>
				<ul className="nav nav-pills">
					{
						this.state.profiles.map(function(item, index) {
							return (
								<li key={index} role="presentation" className={activeProfileId === (index+1).toString() ? "active" : ""}>
									<a href={"#gdpr-profile-"+index} aria-controls={"GDPR profile "+index} role="tab" data-toggle="tab" onClick={selectProfile.bind(this, index+1)}>{item.name}</a>
								</li>
							)
						}.bind(this))
					}
					<li role="presentation">
						<a href="#" onClick={this._addProfile}>{frases.GDPR.ADD_NEW_PROFILE_BTN}</a>
					</li>
				</ul>
				<br/>
				<div className="tab-content">
				{
					this.state.profiles.map(function(item, index) {
						return (
							<div key={index} role="tabpanel" className={"tab-pane "+(activeProfileId === (index+1).toString() ? "active" : "")} id={"gdpr-profile-"+index}>
								<GdprConsentProfileComponent frases={frases} params={params} profile={item} reasons={reasons} langs={langs} deleteProfile={deleteProfile} onChange={this._onChange} />
							</div>
						)
					}.bind(this))
				}
				</div>
			</div>
		);
	}
});

GdprSettingsComponent = React.createFactory(GdprSettingsComponent);

var ServicesComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		services: React.PropTypes.array,
		ldap: React.PropTypes.object,
		saveOptions: React.PropTypes.func,
		saveLdapOptions: React.PropTypes.func,
		onImportUsers: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			services: [],
			ldap: null
		};
	},

	componentWillMount: function() {
		this.setState({
			services: this.props.services || [],
			ldap: this.props.ldap || null
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			services: props.services || [],
			ldap: props.ldap || null
		});
	},

	_saveOptions: function(index, props) {
		this.props.saveOptions(props);

	},

	_saveLdapOptions: function(props) {
		this.props.saveLdapOptions(props);	
	},

	render: function() {
		var frases = this.props.frases;
		var services = this.state.services;
		var ldap = this.state.ldap;

		return (
			<div className="row">
				<div className="col-xs-12">
					<PanelComponent>
						<div className="panel-group" id="services-acc" role="tablist" aria-multiselectable="true" style={{ marginBottom: '10px', borderRadius: 0, cursor: 'pointer' }}>
							{
								ldap ? (
									<LdapOptionsComponent params={ldap} frases={frases} onSave={this._saveLdapOptions} />
								) : null
							}
							{
								services.map(function(item, index){
									return (
										<ServiceItemComponent 
											key={item.id} 
											index={index} 
											params={item} 
											frases={frases} 
											onSave={this._saveOptions.bind(this, index)}
											onImport={this.props.onImportUsers}
										/>
									)
								}.bind(this))
							}
						</div>
					</PanelComponent>
				</div>
			</div>
		);
	}
});

ServicesComponent = React.createFactory(ServicesComponent);

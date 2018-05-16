var LdapOptionsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSave: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params
		});		
	},
	
	_saveServiceProps: function() {
		var params = this.state.params;
		var customPhoneAtt = this._isCustomPhoneAttr(params.props.directoryAttributePhone);

		if(customPhoneAtt) {
			params.props.directoryAttributePhone = params.props.customDirectoryAttributePhone;
		}

		delete params.props.customDirectoryAttributePhone;

		this.props.onSave(params);
	},

	_onChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
		var update = this.state.params;
		
		update.props[target.name] = value !== null ? value : "";;

		console.log('ServiceItemComponent _onChange', update);

		this.setState({
			params: update
		});

	},

	_isCustomPhoneAttr: function(val){
	    var regex = new RegExp('telephoneNumber|mobile|ipPhone');
	    return !regex.test(val);
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var customPhoneAtt = this._isCustomPhoneAttr(params.props.directoryAttributePhone);

		if(customPhoneAtt && !params.props.customDirectoryAttributePhone) {
			params.props.customDirectoryAttributePhone = params.props.directoryAttributePhone !== '0' ? params.props['directoryAttributePhone'] : '';
		}

		return (
			<div className="panel panel-default" style={{ borderRadius: 0 }}>
		    	<div 
		    		className="panel-heading" 
		    		role="tab"
		    		style={{ backgroundColor: 'white' }}
		    		data-parent="#services-acc"
		    		data-toggle="collapse"
		    		data-target={"#acc-"+params.id}
		    		aria-expanded="true" 
		    		aria-controls="collapseOne"
		    	>
		    		<div className="row">
			    		<div className="col-sm-2 text-center">
			    			<img 
			    				src={"/badmin/images/services/"+params.id+'.png'} 
			    				alt={params.name} 
			    				style={{ maxWidth: '100%', maxHeight: '65px' }}
			    			/>
			    		</div>
			    		<div className="col-sm-10">
			    			<h4>{params.name}</h4>
			    		</div>
			    	</div>
		    	</div>
			    <div 
			    	id={"acc-"+params.id}
			    	className="panel-collapse collapse" 
			    	role="tabpanel" 
			    	aria-labelledby="headingOne"
			    >
					<div className="panel-body">
						<form className="form-horizontal" autoComplete="off">
							<div className="form-group">
							    <label htmlFor="directoryServer" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_SERVER}>{frases.LDAP.DIR_SERVER}</label>
							    <div className="col-sm-4">
							    	<input type="text" className="form-control" name="directoryServer" value={params.props.directoryServer} onChange={this._onChange} />
							    </div>
							</div>
							<div className="form-group">
								<div className="col-sm-4 col-sm-offset-4">
								    <div className="checkbox">
								        <label>
								            <input type="checkbox" name="directorySSL" checked={params.props.directorySSL} onChange={this._onChange} /> {frases.LDAP.DIR_SSL}
								        </label>
								    </div>
								</div>
							</div>
							<div className="form-group">
							    <label htmlFor="directoryAttributeUID" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_ATTR_UID}>{frases.LDAP.DIR_ATTR_UID}</label>
							    <div className="col-sm-4">
								    <select className="form-control" name="directoryAttributeUID" value={params.props.directoryAttributeUID} onChange={this._onChange}>
								        <option value="userPrincipalName">userPrincipalName</option>
								        <option value="sAMAccountName">sAMAccountName</option>
								        <option value="uid">uid</option>
								        <option value="name">name</option>
								        <option value="mail">mail</option>
								    </select>
								</div>
							</div>
							<div className="form-group">
							    <label htmlFor="directoryAttributePhone" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_ATTR_PHONE}>{frases.LDAP.DIR_ATTR_PHONE}</label>
							    <div className="col-sm-4">
								    <select className="form-control" name="directoryAttributePhone" value={customPhoneAtt ? '0' : params.props.directoryAttributePhone} onChange={this._onChange}>
								        <option value="telephoneNumber">telephoneNumber</option>
								        <option value="mobile">mobile</option>
								        <option value="ipPhone">ipPhone</option>
								        <option value="0">{frases.OTHER}</option>
								    </select>
								</div>
							</div>
							{
								customPhoneAtt && (
									<div className="form-group">
										<div className="col-sm-4 col-sm-offset-4">
									    	<input type="text" className="form-control" name="customDirectoryAttributePhone" value={params.props.customDirectoryAttributePhone} onChange={this._onChange} />
									    </div>
									</div>
								)
							}
							<div className="form-group">
							    <label htmlFor="directoryAuth" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_AUTH}>{frases.LDAP.DIR_AUTH}</label>
							    <div className="col-sm-4">
								    <select className="form-control" name="directoryAuth" value={params.props.directoryAuth} onChange={this._onChange}>
								        <option value="simple">simple</option>
								        <option value="DIGEST-MD5">DIGEST-MD5</option>
								        <option value="GSSAPI">GSSAPI (Kerberos 5)</option>
								    </select>
								</div>
							</div>
							{
								params.props.directoryAuth === 'GSSAPI' && (
									<div>
									    <div className="form-group">
									        <label htmlFor="directoryKDC" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_KDC}>{frases.LDAP.GSSAPI.DIR_KDC}</label>
									        <div className="col-sm-4">
									        	<input type="text" className="form-control" name="directoryKDC" value={params.props.directoryKDC} onChange={this._onChange} />
									        </div>
									    </div>
									    <div className="form-group">
									        <label htmlFor="directoryAdminServer" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_ADMIN_SERVER}>{frases.LDAP.GSSAPI.DIR_ADMIN_SERVER}</label>
									        <div className="col-sm-4">
									        	<input type="text" className="form-control" name="directoryAdminServer" value={params.props.directoryAdminServer} onChange={this._onChange} />
									        </div>
									    </div>
									</div>
								)
							}
									
							<div className="form-group">
							    <label htmlFor="directoryDomains" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.LDAP__DIR_DOMAINS}>{frases.LDAP.GSSAPI.DIR_DOMAINS}</label>
							    <div className="col-sm-4">
							    	<input type="text" className="form-control" name="directoryDomains" value={params.props.directoryDomains} onChange={this._onChange} />
							    </div>
							</div>
							<div className="form-group">
								<div className="col-sm-4 col-sm-offset-4">
									<button type="button" className="btn btn-success btn-md" onClick={this._saveServiceProps}>
										<i className="fa fa-check fa-fw"></i> {this.props.frases.SAVE}
									</button>
								</div>
							</div>
						</form>
					</div>
			    </div>
			</div>
		);
	}
		
});

LdapOptionsComponent = React.createFactory(LdapOptionsComponent);

var ExtensionComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		groups: React.PropTypes.array,
		generatePassword: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		isUserAccount: React.PropTypes.boolean,
		onAvatarChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			groups: []			
		}
	},

	getInitialState: function() {
		return {
			params: {},
			file: null,
			avatarUrl: "",
			activeTab: (this.props.isUserAccount ? 'features' : 'auth'),
			defaultPermissions: [
				{ name: 'statistics', grant: 0 },
				{ name: 'records', grant: 0 },
				{ name: 'customers', grant: 0 },
				{ name: 'users', grant: 0 },
				{ name: 'equipment', grant: 0 },
				{ name: 'channels', grant: 0 }
			]
		};
	},

	componentWillMount: function() {
		this.setState({ 
			params: this.props.params
		});

		this._loadAvatar(window.location.protocol+'//'+window.location.host+"/$AVATAR$?userid="+this.props.params.userid);
	},

	_onSubmit: function() {
		this.props.onSubmit({ params: this.state.params, file: this.state.file });
	},

	_onPermsChange: function(perms) {
		var params = extend({}, this.state.params);
		params.permissions = perms;
		this.setState({ params: params });
		this.props.onChange(params);
	},

	_onFeaturesChange: function(e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if(target.name === 'huntingnumbers') value = value.split(',');
		params.features[target.name] = (type === 'number' && typeof value !== 'number') ? parseFloat(value) : value;

		this.setState({ params: params });
		this.props.onChange(params);
	},

	_onChange: function(e) {
		var params = extend({}, this.state.params);
		var target = e.target;
		var type = target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		if(target.name === 'storelimit') value = this.props.convertBytes(value, 'GB', 'Byte');

		params[target.name] = (type === 'number' && typeof value !== 'number') ? parseFloat(value) : value;

		this.setState({ params: params });
		this.props.onChange(params);
	},

	_switchTab: function(e) {
		e.preventDefault();
		var tab = e.target.dataset.tab;
		this.setState({ activeTab: tab });
	},

	// _onImgError: function() {
	// 	Utils.debug('_onImgError: ');
	// 	this.setState({ avatarUrl: "/badmin/images/avatar.png" });
	// },

	_onUpload: function(params) {
		var input = params.el;

		if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	        	this.setState({ avatarUrl: e.target.result, file: input.files[0] });
	        	this.props.onAvatarChange({ file: input.files[0] })
	        }.bind(this)

	        reader.readAsDataURL(input.files[0]);
	    }
	},

	_loadAvatar: function(url) {
		var xhr = new XMLHttpRequest();

		xhr.open( "GET", url, true );

		xhr.responseType = "arraybuffer";

		xhr.onload = function( e ) {
			Utils.debug('onload', e);
			if(e.target.status >= 300) return false;
		    // Obtain a blob: URL for the image data.
		    var arrayBufferView = new Uint8Array( e.target.response );
		    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
		    var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blob );
		    this.setState({ avatarUrl: imageUrl });
		}.bind(this);

		xhr.send();

	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var permissions = params.permissions || this.state.defaultPermissions;

		return (
			<div>
				<div className="row" style={{ padding: "20px 0" }}>
				    <div className="col-sm-4 text-center">
				    	<div className="avatar-cont" style={ this.state.avatarUrl ? { backgroundImage: "url("+this.state.avatarUrl+")" } : {} }>
				    	</div>
				    	<div style={{ padding: "10px 0" }}>
				    		<FileUpload frases={frases} options={{ noInput: true }} onChange={this._onUpload} accept="image/*" />
				    	</div>
				    </div>
				    <div className="col-sm-8">
				    	<form className="form" onChange={this._onChange}>
					    	<div className="form-group">
					    	    <label>{frases.NAME}</label>
					    	    <input type="text" name="name" className="form-control" placeholder="James Douton" value={params.name} />
					    	</div>
					    	<div className={"form-group " + (params.kind !== 'user' ? 'hidden' : '')}>
					    	    <label>{frases.GROUP}</label>
					    	    <select name="groupid" className="form-control" value={params.groupid} disabled={this.props.isUserAccount}>
					    	    	{
					    	    		this.props.groups.map(function(item) {
					    	    			return (
					    	    				<option key={item.oid} value={item.oid}>{item.name}</option>
					    	    			)
					    	    		})
					    	    	}
					    	    </select>
					    	</div>
					    	<div className={"row " + (params.kind !== 'user' ? 'hidden' : '')}>
						    	<div className="form-group">
						    	    <label className="col-xs-12">{frases.STORAGE.MAXSIZE}</label>
						    	    <div className="col-sm-8">
							    	    <div className="input-group">
							    	    	<span className="input-group-addon" style={{ backgroundColor: "transparent" }}>{this.props.convertBytes(params.storesize, 'Byte', 'GB').toFixed(2)} <strong style={{ margin: "0 10px" }}>/</strong></span>
							    	        <input type="number" name="storelimit" className="form-control" min="0" step="1" value={this.props.convertBytes(params.storelimit, 'Byte', 'GB').toFixed(2)} disabled={this.props.isUserAccount} />
							    	        <span className="input-group-addon" style={{ backgroundColor: "transparent" }}>GB</span>
							    	    </div>
							    	</div>
						    	</div>
						   	</div>
					    </form>
				    </div>
				</div>
				<div className="row">
			    	<ul id="ext-tabs" className="nav nav-tabs nav-justified custom-nav-tabs" role="tablist">
			    		{
			    			!this.props.isUserAccount && (
					    	    <li role="presentation" className={ this.state.activeTab === "auth" ? "active" : "" }><a href="#" role="tab" data-tab="auth" onClick={this._switchTab}>{frases.AUTHORIZATION}</a></li>
			    			)
			    		}
			    	    <li role="presentation" className={ this.state.activeTab === "features" ? "active" : "" }><a href="#" role="tab" data-tab="features" onClick={this._switchTab}>{frases.SETTINGS.SETTINGS}</a></li>
			    	    {
			    	    	(params.kind === 'user' && params.permissions) && (
					    	    <li role="presentation" className={ this.state.activeTab === "permissions" ? "active" : "" }><a href="#" role="tab" data-tab="permissions" onClick={this._switchTab}>{frases.PERMISSIONS.PERMISSIONS}</a></li>
			    	    	)
			    	    }
			    	</ul>
			    	<div className="tab-content clearfix" style={{ padding: "20px 0" }}>
			    		{
			    			!this.props.isUserAccount && (
			    				<div className={ "tab-pane " + (this.state.activeTab === "auth" ? "active" : "")} role="tabpanel">
			    					<ExtensionAuthorizationComponent frases={frases} params={params} onChange={this._onChange} generatePassword={this.props.generatePassword} />
			    				</div>
			    			)
			    		}
			    	    <div className={ "tab-pane "+ (this.state.activeTab === "features" ? "active" : "")} role="tabpanel">
			    	    	<ExtensionSettingsComponent frases={frases} features={params.features} onChange={this._onFeaturesChange} />
			    	    </div>
			    	    {
			    	    	(params.kind === 'user' && params.permissions) && (
			    	    		<div className={ "tab-pane "+ (this.state.activeTab === "permissions" ? "active" : "")} role="tabpanel">
					    	    	<ExtensionPermissionsComponent frases={frases} permissions={permissions} onChange={this._onPermsChange} />
					    	    </div>
			    	    	)
			    	    }
			    	</div>
				</div>
				{
					this.props.onSubmit && (
						<div className="row">
							<div className="col-xs-12">
								<button className="btn btn-success" role="button" onClick={this._onSubmit}>{frases.SUBMIT}</button>
							</div>
						</div>
					)
				}
			</div>
		);
	}
});

ExtensionComponent = React.createFactory(ExtensionComponent);

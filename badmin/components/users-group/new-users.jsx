function NewUsersComponent(props) {

	var frases = props.frases;
	var userParams = window.deepExtend({}, props.userParams);
	var validationError = props.validationError;
	var hasDomain = !!window.PbxObject.options.domain;
	var tkn = props.tkn;
	var kind = props.params.kind;
	var available = props.params.available;
	var passwordRevealed = props.passwordRevealed;

	function _generatePassword() {
		userParams.password = props.generatePassword();
		props.onChange(userParams); 
	}

	// function _onExtChange(params) {
	// 	console.log('_onExtChange: ', params);
	// 	userParams.number = params.ext;
	// 	props.onChange(userParams);
	// }

	function _parseInput(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var tname = target.name.split('_')[0];

		return {
			name: tname,
			value: (type === 'number' ? parseFloat(value) : value)
		}
	}

	function _onChange(e) {
		var input = _parseInput(e);
		if(input.name === 'storelimit') input.value = props.convertBytes(input.value, 'GB', 'Byte');

		if(input.name.match('name|login|password|storelimit|number')) {
			userParams[input.name] = input.value;
			if(input.name === 'name') userParams.display = input.value;

		} else {
			userParams.info = userParams.info || {};
			userParams.info[input.name] = input.value;
		}

		props.onChange(userParams);

	}

	function _onFocus(e) {
		var email = userParams.info.email;
		if(email && window.PbxObject.options.domain) {
			userParams.login = email.substr(0,email.indexOf('@'));
			props.onChange(userParams);
		}
	}

	return (
		<div className="row">
			<div className="col-xs-12">
				<ul className="nav nav-tabs" role="tablist">
					<li role="presentation" className="active"><a href="#tab-general" aria-controls="general" role="tab" data-toggle="tab">{frases.USERS_GROUP.GENERAL_SETTINGS_TAB}</a></li>
					<li role="presentation"><a href="#tab-info" aria-controls="info" role="tab" data-toggle="tab">{frases.USERS_GROUP.INFO_TAB}</a></li>
				</ul>

				<div className="tab-content" style={{ padding: "20px 0" }}>
					<div role="tabpanel" className="tab-pane fade in active" id="tab-general">
						<div autoComplete="nope">
							<div className="row">
								<div className="col-sm-6">
									<div className={"form-group "+((validationError && !userParams.name) ? 'has-error' : '')}>
						                <label className="control-label">{frases.USERS_GROUP.NAME}</label>
						                <input type="text" className="form-control" name={"name_"+tkn} value={userParams.name || ""} onChange={_onChange} placeholder="" autoComplete="none" required />
						            </div>
						        </div>
						        <div className="col-sm-6">
						            {
						            	kind === 'users' && (
						            		<div className={"form-group "+((validationError && (!userParams.info.email || !props.validateEmail(userParams.info.email))) ? 'has-error' : '')}>
								                <label className="control-label">{frases.USERS_GROUP.EMAIL}</label>
								                <input type="email" className="form-control" name={"email_"+tkn} value={userParams.info.email || ""} onChange={_onChange} placeholder="" autoComplete="none" required />
								            </div>
						            	)
						            }
								</div>
							</div>
						    <div className="row">
						    	<div className="col-sm-6">
						    		<input autoComplete="none" name="hidden" type="hidden" value="stopautofill" style={{display:"none"}} />
						            <div className={"form-group "+((validationError && !userParams.login) ? 'has-error' : '')}>
						                <label className="control-label">{frases.USERS_GROUP.LOGIN}</label>
						                <input type="text" className="form-control" name={"login_"+tkn} value={userParams.login || ""} placeholder="" onFocus={_onFocus} onChange={_onChange} required autoComplete="none" />
						            </div>
						    	</div>
						    	<div className="col-sm-6">
						    		<input autoComplete="none" name="hidden" type="hidden" value="stopautofill" style={{display:"none"}} />
						            <div className="form-group">
						                <label className="control-label">{frases.USERS_GROUP.PASSWORD}</label>
					                    <div className="input-group">
					                        <input type={passwordRevealed ? 'text' : 'password'} name={"password_"+tkn} value={userParams.password} className="form-control" placeholder="" onChange={_onChange} required autoComplete="none" />
					                        <span className="input-group-btn">
					                            <button type="button" className="btn btn-default" onClick={props.revealPassword}>
					                                <i className="fa fa-eye" data-toggle="tooltip" title={frases.USERS_GROUP.PLACEHOLDERS.REVEAL_PWD}></i>
					                            </button>
					                            <button type="button" className="btn btn-default" onClick={_generatePassword}>
					                                <i className="fa fa-refresh" data-toggle="tooltip" title={frases.USERS_GROUP.PLACEHOLDERS.GENERATE_PWD}></i>
					                            </button>
					                        </span>
					                    </div>
						            </div>
						    	</div>
						    </div>
						    <div className="row">
						    	<div className="col-sm-4">
						    		<div className="form-group">
						                <label className="control-label">{frases.USERS_GROUP.EXTENSION}</label>
						                <select className="form-control" name="number" value={userParams.number} onChange={_onChange} required>
						                	{
						                		available.map(function(item) {
						                			return <option key={item} value={item}>{item}</option>
						                		})
						                	}
						                </select>
						            </div>
						    	</div>
						    	<div className="col-sm-offset-2 col-sm-4">
						    		{
						            	kind === 'users' && (
						            		<div className="form-group">
							                    <label className="control-label">{frases.USERS_GROUP.MAXSTORAGE}</label>
						                        <div className="input-group">
						                            <input type="number" className="form-control" name="storelimit" value={Math.ceil(props.convertBytes(userParams.storelimit, 'Byte', 'GB'))} min="1" step="1" onChange={_onChange} />
						                            <span className="input-group-addon">GB</span>
						                        </div>
							                </div>
						            	)
						            }
						    	</div>
						    </div>
					    </div>
					</div>
					<div role="tabpanel" className="tab-pane fade in" id="tab-info">
						<form autoComplete="nope">
							<div className="row">
							    <div className="col-sm-6">
							        <div className="form-group">
							            <label htmlFor="company">{frases.USERS_GROUP.INFO.COMPANY}</label>
							            <input type="text" className="form-control" name="company" placeholder="" value={userParams.info.company || ""} onChange={_onChange} />
							        </div>
							    </div>
							    <div className="col-sm-6">
							        <div className="form-group">
							            <label htmlFor="position">{frases.USERS_GROUP.INFO.POSITION}</label>
							            <input type="text" className="form-control" name="title" placeholder="" value={userParams.info.title || ""} onChange={_onChange} />
							        </div>
							    </div>
							</div>
							<div className="row">
							    <div className="col-sm-6">
							        <div className="form-group">
							            <label htmlFor="department">{frases.USERS_GROUP.INFO.DEPARTMENT}</label>
							            <input type="text" className="form-control" name="department" placeholder="" value={userParams.info.department || ""} onChange={_onChange} />
							        </div>
							    </div>
							    <div className="col-sm-6">
							        <div className="form-group">
							            <label htmlFor="mobile">{frases.USERS_GROUP.INFO.MOBILE}</label>
							            <input type="text" className="form-control" name="mobile" placeholder="" value={userParams.info.mobile || ""} onChange={_onChange} />
							        </div>
							    </div>
							</div>
							<div className="row">
							    <div className="col-xs-12">
							        <div className="form-group">
							            <label htmlFor="description">{frases.USERS_GROUP.INFO.ABOUT}</label>
							            <textarea type="text" className="form-control" name="description" value={userParams.info.description || ""} placeholder="" onChange={_onChange}></textarea>
							        </div>
							    </div>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div className="col-xs-12">
	    		{
	            	validationError && (
	            		<div className="alert alert-warning" role="alert">{frases.USERS_GROUP.REQUIRED_FIELDS_MSG}</div>
	            	)
	            }
			</div>
		</div>
	)
	
}

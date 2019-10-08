function TrunkConnectionComponent(props) {

    var frases = props.frases;
    var params = props.params;
    var protocols = params.protocols;

	return (
        <div>
    	    <form className="form-horizontal" autoComplete="off" onChange={props.onChange}>
                <div className={"form-group" + (props.validationError && !params.name ? ' has-error' : '')}>
                    <label className="col-sm-4 control-label">{frases.TRUNKSNAME}</label>
                    <div className="col-sm-6">
                        <input type="text" className="form-control" name="name" value={params.name} placeholder="My SIP Provider" required />
                    </div>
                </div>
                <br/>
    	        <div className="form-group">
    	            <label className="col-sm-4 control-label">
    	                {frases.PROTOCOL}
    	            </label>
    	            <div className="col-sm-4">
                        {
                            (protocols && protocols.length) ? (
                                <select className="form-control" name="protocol" value={params.protocol}>
                                    {
                                        protocols.map(function(item) {
                                            return <option key={item} value={item}>{item.toUpperCase()}</option>
                                        })
                                    }
                                </select>
                            ) : (
                                <p>{ params.protocol }</p>
                            )
                        }
    	            </div>
    	        </div>
                {
                    !props.externalOnly && (
                        <div className="form-group">
                            <label className="col-sm-4 control-label">{frases.TRUNK_TYPE}</label>
                            <div className="col-sm-8">
                                <div className="btn-group" data-toggle="buttons">
                                    <label className={"btn btn-default " + (params.type === 'external' ? 'active' : '')} onClick={function() { props.onChange({ target: { name: 'type', type: 'radio', value: 'external',  } }) }.bind(this)}>
                                        <input type="radio" name="type" value="external" checked={params.type === 'external'} /> {frases.EXTERNAL}
                                    </label>
                                    <label className={"btn btn-default " + (params.type === 'internal' ? 'active' : '')} onClick={function() { props.onChange({ target: { name: 'type', type: 'radio', value: 'internal',  } }) }.bind(this)}>
                                        <input type="radio" name="type" value="internal" checked={params.type === 'internal'} /> {frases.INTERNAL}
                                    </label>
                                </div>
                            </div>
                            <hr className="col-sm-12" />
                        </div>
                    )
                }
                        
                {
                    params.type === 'external' ? (
                        <div>
                            <div className={"form-group" + (props.validationError && !params.domain ? ' has-error' : '')}>
                                <label className="col-sm-4 control-label">
                                    {frases.DOMAIN_OR_IP_ADDRESS}
                                </label>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control" name="domain" value={params.domain} placeholder="sip.myprovider.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="col-sm-offset-4 col-sm-6">
                                  <div className="checkbox">
                                    <label>
                                        <input type="checkbox" name="register" checked={params.register} /> {frases.REGISTRATION}
                                    </label>
                                  </div>
                                </div>
                            </div>
                            {
                                params.register ? (
                                    <div>
                                        <div className="form-group">    
                                            <label className="col-sm-4 control-label">
                                                {frases.NAME}
                                            </label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" name="user" value={params.user} placeholder={frases.NAME} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-4 control-label">
                                                {frases.AUTHNAME}
                                            </label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" name="auth" value={params.auth} placeholder={frases.AUTHNAME} />
                                            </div>
                                        </div>
                                        <div className="form-group">    
                                            <label className="col-sm-4 control-label">
                                                {frases.PASSWORD}
                                            </label>
                                            <div className="col-sm-6">
                                                <PasswordComponent frases={frases} name="pass" value={params.pass} />
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            }
                            <div className="form-group">
                                <div className="col-sm-offset-4 col-sm-6">
                                  <div className="checkbox">
                                    <label>
                                      <input type="checkbox" name="proxy" checked={params.proxy} /> {frases.PROXY}
                                    </label>
                                  </div>
                                </div>
                            </div>
                            {
                                params.proxy ? (
                                    <div>
                                        <div className="form-group">    
                                            <label className="col-sm-4 control-label">
                                                {frases.PROXYADDRESS}
                                            </label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" name="paddr" value={params.paddr} placeholder={frases.PROXYADDRESS} />
                                            </div>
                                        </div>
                                        <div className="form-group">    
                                            <label className="col-sm-4 control-label">
                                                {frases.AUTHNAME}
                                            </label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" name="pauth" value={params.pauth} placeholder={frases.AUTHNAME} />
                                            </div>
                                        </div>
                                        <div className="form-group">    
                                            <label className="col-sm-4 control-label">
                                                {frases.PASSWORD}
                                            </label>
                                            <div className="col-sm-6">
                                                <PasswordComponent frases={frases} name="ppass" value={params.ppass} />
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            }
                        </div>
                    ) : (
                        <div>
                            <div className="form-group">
                                <label className="col-sm-4 control-label">
                                    {frases.AUTHNAME}
                                </label>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control" name="gateway.regname" value={params.gateway.regname} placeholder={frases.AUTHNAME} readOnly={true} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-sm-4 control-label">
                                    {frases.PASSWORD}
                                </label>
                                <div className="col-sm-6">
                                    <PasswordComponent frases={frases} name="gateway.regpass" value={params.gateway.regpass} />
                                </div>
                            </div>
                        </div>
                    )
                }
                
    	    </form>
            <p className="text-center" style={{ padding: "20px 0" }}>
                <a data-toggle="collapse" href="#trunkAdvanceSetts" aria-expanded="false" aria-controls="collapseAdvancedSettings">
                  {frases.TRUNK.ADVANCED_SETTINGS_BTN}
                </a>
            </p>
            <div className="collapse" id="trunkAdvanceSetts">
                <TrunkProtocolOptionsComponent frases={frases} params={params} onChange={props.onProtocolParamsChange} onCodecsParamsChange={props.onCodecsParamsChange} />
            </div>
        </div>
	)
}
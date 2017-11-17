var BranchOptionsComponent = React.createClass({

    propTypes: {
        frases: React.PropTypes.object,
        params: React.PropTypes.object,
        onChange: React.PropTypes.func
    },

    _onChange: function(e) {
        var target = e.target;
        var type = target.getAttribute('data-type') || target.type;
        var dataModel = target.getAttribute('data-model');
        var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
        var update = this.props.params;

        update[dataModel] = update[dataModel] || {};
        update[dataModel][target.name] = (value !== null && !isNaN(value)) ? value : "";

        this.props.onChange(update);
    },

    _onCodecsTableChange: function(params) {
        if(!params.model) return;
        var update = this.props.params;

        update[params.model].codecs = params.codecs.filter(this._filterEnabled).map(this._removeEnabledProp);
        this.props.onChange(update);
    },

    _removeEnabledProp: function(item) {
        delete item.enabled;
        return item;
    },

    _filterEnabled: function(item) {
        return item.enabled;
    },

    render: function() {
        var frases = this.props.frases;
        var params = this.props.params;

        return (
            <form className="form-horizontal acc-cont">
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-sip-opts">{frases.SETTINGS.SIP}<span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-sip-opts">
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" data-model="sip" checked={params.sip ? params.sip.enabled : ''} onChange={this._onChange} /> {frases.ENABLE}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sip-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" name="port" className="form-control" data-model="sip" value={params.sip ? params.sip.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sip-log" className="col-sm-4 control-label">{frases.SETTINGS.LOG_LEVEL}</label>
                        <div className="col-sm-4">
                            <select className="form-control" data-type="number" name="log" value={params.sip ? params.sip.log : ''} data-model="sip" onChange={this._onChange}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <AvCodecsTableComponent model="sip" availableCodecs={params.avcodecs} enabledCodecs={params.sip.codecs} frases={frases} onChange={this._onCodecsTableChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-sips-opts">{frases.SETTINGS.SIPS} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-sips-opts">
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" data-model="sips" checked={params.sips ? params.sips.enabled : ''} onChange={this._onChange} /> {frases.ENABLE}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sips-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="port" data-model="sips" value={params.sips ? params.sips.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sips-log" className="col-sm-4 control-label">{frases.SETTINGS.LOG_LEVEL}</label>
                        <div className="col-sm-4">
                            <select name="log" data-type="number" data-model="sips" value={params.sips ? params.sips.log : ''} className="form-control" onChange={this._onChange}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <AvCodecsTableComponent model="sips" availableCodecs={params.avcodecs} enabledCodecs={params.sips.codecs} frases={frases} onChange={this._onCodecsTableChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-wss-opts">{frases.SETTINGS.WSS} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-wss-opts">
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" data-model="wss" value={params.wss ? params.wss.enabled : ''} onChange={this._onChange} /> {frases.ENABLE}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="wss-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="port" data-model="wss" value={params.wss ? params.wss.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="wss-log" className="col-sm-4 control-label">{frases.SETTINGS.LOG_LEVEL}</label>
                        <div className="col-sm-4">
                            <select name="log" data-type="number" data-model="wss" value={params.wss ? params.wss.log : ''} className="form-control" onChange={this._onChange}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <AvCodecsTableComponent model="wss" availableCodecs={params.avcodecs} enabledCodecs={params.wss.codecs} frases={frases} onChange={this._onCodecsTableChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-http-opts">{frases.SETTINGS.HTTP} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-http-opts">
                    <div className="form-group">
                        <label htmlFor="http-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="port" data-model="http" value={params.http ? params.http.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="http-log" className="col-sm-4 control-label">{frases.SETTINGS.LOG_LEVEL}</label>
                        <div className="col-sm-4">
                            <select name="log" data-type="number" data-model="http" value={params.http ? params.http.log : ''} className="form-control" onChange={this._onChange}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="ssl" data-model="http" checked={params.http ? params.http.ssl : ''} onChange={this._onChange} /> SSL
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-nat-opts">{frases.SETTINGS.NAT.NAT} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-nat-opts">
                    <div className="form-group">
                        <label htmlFor="stun" className="col-sm-4 control-label">{frases.SETTINGS.NAT.STUN_SERVER}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="stun" data-model="nat" value={params.nat ? params.nat.stun : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="router" className="col-sm-4 control-label">{frases.SETTINGS.NAT.ROUTER}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="router" data-model="nat" value={params.nat ? params.nat.router : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="rtpfirst" className="col-sm-4 control-label">{frases.SETTINGS.NAT.RTP_RANGE}</label>
                        <div className="col-sm-4">
                            <div className="col-xs-5">
                                <input type="number" className="form-control" name="rtpfirst" data-model="nat" value={params.nat ? params.nat.rtpfirst : ''} onChange={this._onChange} />
                            </div>
                            <div className="col-xs-1"> - </div>
                            <div className="col-xs-5">
                                <input type="number" className="form-control" name="rtplast" data-model="nat" value={params.nat ? params.nat.rtplast : ''} onChange={this._onChange} />
                            </div>
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-registrar-opts">{frases.SETTINGS.REGISTRAR.REGISTRAR} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-registrar-opts">
                    <div className="form-group">
                        <label htmlFor="minexpires" className="col-sm-4 control-label">{frases.SETTINGS.REGISTRAR.MIN_EXPIRES}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="minexpires" data-model="registrar" value={params.registrar ? params.registrar.minexpires : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="maxexpires" className="col-sm-4 control-label">{frases.SETTINGS.REGISTRAR.MAX_EXPIRES}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="maxexpires" data-model="registrar" value={params.registrar ? params.registrar.maxexpires : ''} onChange={this._onChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-net-opts">{frases.SETTINGS.NET.NET}<span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-net-opts">
                    <div className="form-group">
                        <label htmlFor="tcptimeout" className="col-sm-4 control-label">{frases.SETTINGS.NET.TCP_TIMEOUT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="tcptimeout" data-model="net" value={params.net ? params.net.tcptimeout : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="rtptimeout" className="col-sm-4 control-label">{frases.SETTINGS.NET.RTP_TIMEOUT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="rtptimeout" data-model="net" value={params.net ? params.net.rtptimeout : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="iptos" className="col-sm-4 control-label">{frases.SETTINGS.NET.IP_TOS}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="iptos" data-model="net" value={params.net ? params.net.iptos : ''} onChange={this._onChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-system-opts">{frases.SETTINGS.SYSTEM.SYSTEM} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-system-opts">
                    <div className="form-group">
                        <label htmlFor="config-name" className="col-sm-4 control-label">{frases.SETTINGS.SYSTEM.CONFIG_FILE_NAME}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="config" data-model="system" value={params.system ? params.system.config : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="backup-path" className="col-sm-4 control-label">{frases.SETTINGS.SYSTEM.BACKUP_FILE}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="backup" data-model="system" value={params.system ? params.system.backup : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="rec-path" className="col-sm-4 control-label">{frases.SETTINGS.SYSTEM.CALL_RECORDS_PATH}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="store" data-model="system" value={params.system ? params.system.store : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="rec-format" className="col-sm-4 control-label">{frases.SETTINGS.SYSTEM.CALL_RECORDS_FORMAT}</label>
                        <div className="col-sm-4">
                            <select className="form-control" name="recformat" data-model="system" value={params.system ? params.system.recformat : ''} onChange={this._onChange}>
                                <option value="PCM 8 Khz 16 bit">PCM 8 Khz 16 bit</option>
                                <option value="CCITT U-law">CCITT U-law</option>
                                <option value="CCITT A-law">CCITT A-law</option>
                                <option value="GSM 6.10">GSM 6.10</option>
                                <option value="Microsoft GSM">Microsoft GSM</option>
                            </select>
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-smtp-opts">{frases.SETTINGS.SMTP} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-smtp-opts">
                    <div className="form-group">
                        <label htmlFor="smtp-host" className="col-sm-4 control-label">{frases.HOSTNAME}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="host" data-model="smtp" value={params.smtp ? params.smtp.host : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smtp-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="port" data-model="smtp" value={params.smtp ? params.smtp.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smtp-username" className="col-sm-4 control-label">{frases.USERNAME}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="username" data-model="smtp" value={params.smtp ? params.smtp.username : ''} autoComplete="off" onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smtp-password" className="col-sm-4 control-label">{frases.PASSWORD}</label>
                        <div className="col-sm-4">
                            <input type="password" className="form-control" name="password" data-model="smtp" value={params.smtp ? params.smtp.password : ''} autoComplete="off" onChange={this._onChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smtp-from" className="col-sm-4 control-label">{frases.FROM3}</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" name="from" data-model="smtp" value={params.smtp ? params.smtp.from : ''} onChange={this._onChange} />
                        </div>
                    </div>
                </div>
                <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-smdr-opts">{frases.SETTINGS.SMDR} <span className="caret pull-right"></span></h5>
                <div className="acc-pane collapse" id="acc-smdr-opts">
                    <div className="form-group">
                        <div className="col-sm-4 col-sm-offset-4">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" data-model="smdr" checked={params.smdr ? params.smdr.enabled : ''} onChange={this._onChange} /> {frases.ENABLE}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smdr-host" className="col-sm-4 control-label">{frases.HOSTNAME}</label>
                        <div className="col-sm-4">
                            <select className="form-control" name="host" data-model="smdr" value={params.smdr ? params.smdr.host : ''} onChange={this._onChange}>
                                {
                                    (params.system ? params.system.interfaces : []).map(function(item) {
                                        return <option key={item} value={item}>{item}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="smdr-port" className="col-sm-4 control-label">{frases.PORT}</label>
                        <div className="col-sm-4">
                            <input type="number" className="form-control" name="port" data-model="smdr" value={params.smdr ? params.smdr.port : ''} onChange={this._onChange} />
                        </div>
                    </div>
                </div>
            </form>            
        )
    }
});

BranchOptionsComponent = React.createFactory(BranchOptionsComponent);
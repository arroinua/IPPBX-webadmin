function TrunkProtocolOptionsComponent(props) {

	var frases = props.frases;
	var params = props.params.parameters;
	var sipModes = ['sip info', 'rfc2833', 'inband'];
	var h323Modes = ['h245alpha', 'h245signal', 'rfc2833', 'inband'];
	var dtmfmodes = params.protocol === 'h323' ? h323Modes : sipModes;

	return (
		<div>
		    <form className="form-horizontal" onChange={props.onChange}>
		    	<div className="form-group">
		            <label className="col-sm-4 control-label">
		                {frases.REGEXPIRES}
		            </label>
		            <div className="col-sm-4">
		                <input type="number" className="form-control" name="regexpires" value={params.regexpires} placeholder={frases.REGEXPIRES} />
		            </div>
		        </div>
		        <div className="form-group">
		            <label className="col-sm-4 control-label">DTMF {frases.MODE}</label>
		            <div className="col-sm-4">
		                <select name="dtmfmode" value={params.dtmfmode} className="form-control">
		                    {
		                    	dtmfmodes.map(function(mode) {
		                    		return <option key={mode} value={mode}>{mode}</option>
		                    	})
		                    }
		                </select>
		            </div>
		        </div>
		        <div className="form-group">
		            <label className="col-sm-4 control-label">Features</label>
		            <div className="col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="t38fax" checked={params.t38fax} /> T.38 Fax
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="video" checked={params.video} /> Video
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="earlymedia" checked={params.earlymedia} /> Early Media Connection
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="dtmfrelay" checked={params.dtmfrelay} /> DTMF Relay
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="nosymnat" checked={params.nosymnat} /> Disable Symmetric RTP
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="buffering" checked={params.buffering} /> Buffering
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="noprogress" checked={params.noprogress} /> Send Ringing instead of Progress
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="noredirectinfo" checked={params.noredirectinfo} /> Omit Redirection Info
		                    </label>
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                	{
		                		props.params.type === 'internal' ? (
		                			<label>
		                        		<input type="checkbox" name="passanumber" checked={params.passanumber} /> Always send username in the INVITE "To" header
		                        	</label>
		                        ) : (
		                        	<label>
		                        		<input type="checkbox" name="passanumber" checked={params.passanumber} /> Pass Caller ID in the From header
		                        	</label>
		                       	)
		                	}
		                </div>
		            </div>
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="directrtp" checked={params.directrtp} /> Direct RTP
		                    </label>
		                </div>
		            </div>
		            {
		            	props.params.protocol === 'h323' ? (
		            		<div>
		            		    <div className="col-sm-offset-4 col-sm-8">
		            		        <div className="checkbox">
		            		            <label>
		            		                <input type="checkbox" name="faststart" checked={params.faststart} /> Fast Start
		            		            </label>
		            		        </div>
		            		    </div>
		            		    <div className="col-sm-offset-4 col-sm-8">
		            		        <div className="checkbox">
		            		            <label>
		            		                <input type="checkbox" name="h245tunneling" checked={params.h245tunneling} /> H.245 Tunneling
		            		            </label>
		            		        </div>
		            		    </div>
		            		    <div className="col-sm-offset-4 col-sm-8">
		            		        <div className="checkbox">
		            		            <label>
		            		                <input type="checkbox" name="playringback" checked={params.playringback} /> Play Ringback on Alerting
		            		            </label>
		            		        </div>
		            		    </div>
		            		</div>
		            	) : null
		            }
		        </div>
		        <hr/>
		        <div className="form-group">
		        	<label className="col-sm-4 control-label">T1</label>
		        	<div className="col-sm-4">
		        		<input type="number" className="form-control" name="t1" value={params.t1} />
		        	</div>
		        </div>
		        <div className="form-group">
		        	<label className="col-sm-4 control-label">T2</label>
		        	<div className="col-sm-4">
		        		<input type="number" className="form-control" name="t2" value={params.t2} />
		        	</div>
		        </div>
		        <div className="form-group">
		        	<label className="col-sm-4 control-label">T3</label>
		        	<div className="col-sm-4">
		        		<input type="number" className="form-control" name="t3" value={params.t3} />
		        	</div>
		        </div>
		    </form>
		    <hr/>
	        <CodecsSettingsComponent frases={frases} codecs={params.codecs} onChange={props.onCodecsParamsChange} />
		</div>
	)
}
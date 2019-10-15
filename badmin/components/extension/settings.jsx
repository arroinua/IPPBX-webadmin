function ExtensionSettingsComponent(props) {

	var frases = props.frases;
	// var isHuntingEnabled = (!props.features.huntnreg && !props.features.huntbusy && !props.features.huntnans);

	return (
		<div className="col-xs-12">
			<form className={"form-horizontal " + (props.features.fwdall === undefined ? 'hidden' : '')} onChange={props.onChange}>
				<fieldset style={{ marginTop: "15px" }}>
				    <legend>{frases.FORWARDING.FORWARDING}</legend>
				</fieldset>
				<div className="form-group">
				    <label className="col-sm-4 control-label">{frases.FORWARDING.UNCONDITIONAL}</label>
				    <div className="col-sm-8">
				        <div className="input-group">
				            <span className="input-group-addon">
				                <input type="checkbox" name="fwdall" checked={props.features.fwdall} />
				            </span>
				            <input type="text" name="fwdallnumber" className="form-control" value={props.features.fwdallnumber} />
				        </div>
				    </div>
				</div>
				<div className="form-group">
				    <label className="col-sm-4 control-label">{frases.FORWARDING.UNREGISTERED}</label>
				    <div className="col-sm-8">
				        <div className="input-group">
				            <span className="input-group-addon">
				                <input type="checkbox" name="fwdnreg" checked={props.features.fwdnreg} />
				            </span>
				            <input type="text" name="fwdnregnumber" className="form-control" value={props.features.fwdnregnumber} />
				        </div>
				    </div>
				</div>
				<div className="form-group">
				    <label className="col-sm-4 control-label">{frases.FORWARDING.BUSY}</label>
				    <div className="col-sm-8">
				        <div className="input-group">
				            <span className="input-group-addon">
				                <input type="checkbox" name="fwdbusy" checked={props.features.fwdbusy} />
				            </span>
				            <input type="text" name="fwdbusynumber" className="form-control" value={props.features.fwdbusynumber} />
				        </div>
				    </div>
				</div>
				<div className="form-group">
				    <label className="col-sm-4 control-label">{frases.FORWARDING.NOANSWER}</label>
				    <div className="col-sm-8">
				        <div className="input-group">
				            <span className="input-group-addon">
				                <input type="checkbox" name="fwdnans" checked={props.features.fwdnans} />
				            </span>
				            <input type="text" name="fwdnansnumber" className="form-control" value={props.features.fwdnansnumber} />
				        </div>
				    </div>
				</div>
				<div className="form-group">
				    <label className="col-sm-4 control-label">{frases.FORWARDING.NOANSWERTOUT}</label> 
				    <div className="col-sm-4">
				        <div className="input-group">
				            <input type="text" name="fwdtimeout" className="form-control" value={props.features.fwdtimeout} disabled={!props.features.fwdnans} />
				            <span className="input-group-addon">{frases.SECONDS}</span>
				        </div>
				    </div>
				</div>
			</form>
			<form className="form-horizontal" onChange={props.onChange}>
				<fieldset style={{ marginTop: "15px" }}>
				    <legend>{frases.FUNCTIONS.FUNCTIONS}</legend>
				</fieldset>
				<div className="row">
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.callwaiting === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="callwaiting" checked={props.features.callwaiting} /> {frases.FUNCTIONS.CALLWAITING}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.recording === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="recording" checked={props.features.recording} /> {frases.FUNCTIONS.RECORD_CALLS}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.voicemail === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="voicemail" checked={props.features.voicemail} /> {frases.FUNCTIONS.VOICEMAIL}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.monitordeny === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="monitordeny" checked={props.features.monitordeny} /> {frases.FUNCTIONS.MONITORDENY}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.busyoverdeny === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="busyoverdeny" checked={props.features.busyoverdeny} /> {frases.FUNCTIONS.BUSYOVERDENY}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.pickupdeny === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="pickupdeny" checked={props.features.pickupdeny} /> {frases.FUNCTIONS.PICKUPDENY}
				            </label>
				        </div>
				    </div>
				    <div className={"col-sm-offset-4 col-sm-8 " + (props.features.lock === undefined ? 'hidden' : '')}>
				        <div className="checkbox">
				            <label>
				                <input type="checkbox" name="lock" checked={props.features.lock} /> {frases.FUNCTIONS.LOCK}
				            </label>
				        </div>
				    </div>
				</div>
			</form>
		</div>
	)

}
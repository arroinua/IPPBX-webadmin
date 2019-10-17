function FunctionsOptionsComponent(props) {

	var frases = props.frases;
	var params = props.params;

	function _onChange(e) {
		var update = extend({}, params);
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);

		update[target.name] = value !== null ? value : "";

		props.onChange(update);
	}

	function _onFileUpload(params) {
		var update = extend({}, params);
		var files = [];

		files.push(params);
		update.files = files;
		update[params.name] = params.filename;

		props.onChange(update);
	}

	return (
		<form className="form-horizontal acc-cont">
	        <div className="form-group">
	            <label htmlFor="dialtimeout" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__DIAL_TIMEOUT}>{frases.SETTINGS.DIAL_TIMEOUT}</label>
	            <div className="col-sm-4">
		            <div className="input-group">
		                <input type="number" className="form-control" value={params.dialtimeout} name="dialtimeout" onChange={_onChange} />
		            	<span className="input-group-addon">{frases.SECONDS}</span>
		            </div>
		        </div>
	        </div>
	        <fieldset style={{ marginTop: "15px" }}>
	            <legend>{frases.FUNCTIONS.CALLHOLD}</legend>
	        </fieldset>
	        <div className="form-group">
	            <label htmlFor="holdmusicfile" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__WAV_ONHOLD}>{frases.MUSICONHOLD}:</label>
	            <div className="col-sm-4">
	            	<FileUpload frases={frases} name="holdmusicfile" value={params.holdmusicfile} onChange={_onFileUpload} />
	            </div>
	        </div>
	        <div className="form-group">
	            <label htmlFor="holdremindtime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__HOLD_REMIND_INT}>{frases.SETTINGS.REMINTERVAL}</label>
	            <div className="col-sm-4">
		            <div className="input-group">
		                <input type="number" className="form-control" value={params.holdremindtime} name="holdremindtime" onChange={_onChange} />
		            	<span className="input-group-addon">{frases.SECONDS}</span>
		            </div>
		        </div>
	        </div>
	        <div className="form-group">
	            <label htmlFor="holdrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__HOLD_RECALL_INT}>{frases.SETTINGS.RETINTERVAL}</label>
	            <div className="col-sm-4">
	            	<div className="input-group">
	                	<input type="number" className="form-control" value={params.holdrecalltime} name="holdrecalltime" onChange={_onChange} />
	            		<span className="input-group-addon">{frases.SECONDS}</span>
	            	</div>
	            </div>
	        </div>
		    <fieldset style={{ marginTop: "15px" }}>
	            <legend>{frases.FUNCTIONS.CALLTRANSFER}</legend>
	        </fieldset>
	        <div className="form-group">
	            <label htmlFor="transferrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__TRANSF_WAIT_INT}>{frases.SETTINGS.WAITINTERVAL}</label>
	            <div className="col-sm-4">
	            	<div className="input-group">
	                	<input type="number" className="form-control" value={params.transferrecalltime} name="transferrecalltime" onChange={_onChange} />
			            <span className="input-group-addon">{frases.SECONDS}</span>
			        </div>
	            </div>
	        </div>
	        <div className="form-group">
	            <label htmlFor="transferrecallnumber" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__TRANSF_RECALL_NUM}>{frases.SETTINGS.RETNUMBER}</label>
	            <div className="col-sm-4">
	                <input type="text" className="form-control" value={params.transferrecallnumber} name="transferrecallnumber" onChange={_onChange} />
	            </div>
	        </div>
	        <div className="form-group">
	            <div className="col-sm-4 col-sm-offset-4">
	              <div className="checkbox">
	                <label data-toggle="tooltip" title={frases.OPTS__AUTO_RETRIEVE}>
	                  <input type="checkbox" checked={params.autoretrive} name="autoretrive" onChange={_onChange} /> {frases.SETTINGS.AUTORETURN}
	                </label>
	              </div>
	            </div>
	        </div>
	        <fieldset style={{ marginTop: "15px" }}>
	            <legend>{frases.FUNCTIONS.CALLPARK}</legend>
	        </fieldset>
	        <div className="form-group">
	            <label htmlFor="parkrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_RECALL_INT}>{frases.SETTINGS.RETINTERVAL}</label>
	            <div className="col-sm-4">
	            	<div className="input-group">
	                	<input type="number" className="form-control" value={params.parkrecalltime} name="parkrecalltime" onChange={_onChange} />
	            		<span className="input-group-addon">{frases.SECONDS}</span>
	            	</div>
	            </div>
	        </div>
	        <div className="form-group">
	            <label htmlFor="parkrecallnumber" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_RECALL_NUM}>{frases.SETTINGS.RETNUMBER}</label>
	            <div className="col-sm-4">
	                <input type="text" className="form-control" value={params.parkrecallnumber} name="parkrecallnumber" onChange={_onChange} />
	            </div>
	        </div>
	        <div className="form-group">
	            <label htmlFor="parkdroptimeout" className="col-sm-4 col-xs-12 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_DISC_TOUT}>{frases.SETTINGS.ENDTOUT}</label>
	            <div className="col-sm-4">
	            	<div className="input-group">
	                	<input type="number" className="form-control" value={params.parkdroptimeout} name="parkdroptimeout" onChange={_onChange} />
			            <span className="input-group-addon">{frases.SECONDS}</span>
			        </div>
	            </div>
	        </div>
		</form>
	);
}

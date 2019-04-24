function SelectorSettingsComponent(props) {

	var frases = props.frases;
	var params = props.params.options;
	var formats = [ "OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080" ];
	var onChange = props.onChange;
	var members = props.params.members;

	function getOwnerOptions() {
		if(!members.length) {
			return <p className="form-control-static">{ frases.SELECTOR.NO_MEMBERS_FOR_OWNER_MESSAGE }</p>
		} else {
			return (
				<select name="owner" className="form-control" value={props.params.owner} onChange={onChange} required>
				{
					members.map(function(item) {
						return (
							<option key={item.ext} value={item.ext}>{ item.ext } - {item.name}</option>
						)
					})
				}
				</select>
			)

		}
	}

	return (
		<form className="form-horizontal" autoComplete="off">
		    <div className={"form-group "+((props.validationError && !props.params.owner) ? 'has-error' : '')}>
		        <label className="col-sm-4 control-label">{frases.INITIATOR}</label>
		        <div className="col-sm-6">
		            { getOwnerOptions()	}
		        </div>
		    </div>
		    <div className="form-group">
		        <label className="col-sm-4 control-label">
		            {frases.CONFINIT.CONFINIT}
		        </label>
		        <div className="col-sm-6">
		            <select name="initmode" value={params.initmode} className="form-control" onChange={onChange}>
		                <option value="0">{frases.CONFINIT.LISTENONLY}</option>
		                <option value="1">{frases.CONFINIT.TALKANDLISTEN}</option>
		                <option value="2">{frases.CONFINIT.PLAYGREET}</option>
		                <option value="3">{frases.CONFINIT.MULTINODE}</option>
		            </select>
		        </div>
		    </div>
		    {
		    	(params.initmode === "2" || params.initmode === 2) ? (
		    		<div className="form-group">
		    		    <label className="col-sm-4 control-label">
		    		        {frases.CONFINIT.GREETFILE}:
		    		    </label>
		    		    <div className="col-sm-8">
		    		    	<FileUpload frases={frases} name="onholdfile" value={params.onholdfile} onChange={props.onFileUpload} />
		    		    </div>
		    		</div>
		    	) : null
		    }
		    <div className="form-group">
		        <label className="col-sm-4 control-label">
		            {frases.VIDEOFORMAT}
		        </label>
		        <div className="col-sm-4">
		            <select className="form-control" name="videomode" value={params.videomode} onChange={onChange}>
		            {
		            	formats.map(function(item) {
		            		return <option key={item} value={item}>{item}</option>
		            	})
		            }
		            </select>
		        </div>
		    </div>
		    <div className="form-group">
		        <label className="col-sm-4 control-label">
		            {frases.CALLTOUT}
		        </label>
		        <div className="col-sm-6">
		            <div className="input-group">
		                <input type="number" className="form-control" name="dialtimeout" value={params.dialtimeout} onChange={onChange} />
		                <span className="input-group-addon">{frases.SECONDS}</span>
		            </div>
		        </div>
		    </div>
	        <div className="form-group">
	            <div className="col-sm-offset-4 col-sm-8">
	                <div className="checkbox">
	                    <label>
	                        <input type="checkbox" name="initcalls" checked={params.initcalls} onChange={onChange} /> {frases.INITCONFCALL}
	                    </label>
	                </div>
	            </div>
	        </div>
	        <div className="form-group">
	            <div className="col-sm-offset-4 col-sm-8">
	                <div className="checkbox">
	                    <label>
	                        <input type="checkbox" name="autoredial" checked={params.autoredial} onChange={onChange} /> {frases.AUTOREDIAL}
	                    </label>
	                </div>
	            </div>
	        </div>
		    <div className="form-group">
		        <div className="col-sm-offset-4 col-sm-8">
		            <div className="checkbox">
		                <label>
		                    <input type="checkbox" name="recording" checked={params.recording} onChange={onChange} /> {frases.FUNCTIONS.RECORDING}
		                </label>
		            </div>
		        </div>
		    </div>
		    {
		    	params.recording ? (
		    		<div className="form-group">
		    		    <label className="col-sm-4 control-label">
		    		        {frases.REC_TIME}
		    		    </label>
		    		    <div className="col-sm-6">
		    		        <div className="input-group">
		    		            <input type="number" className="form-control" name="rectime" value={params.rectime} onChange={onChange} />
		    		            <span className="input-group-addon">{frases.SECONDS}</span>
		    		        </div>
		    		    </div>
		    		</div>
		    	) : null
		    }
		    <div className="object-type local">
		        <div className="form-group">
		            <div className="col-sm-offset-4 col-sm-8">
		                <div className="checkbox">
		                    <label>
		                        <input type="checkbox" name="greeting" checked={params.greeting} onChange={onChange} /> {frases.PLAYGREET}
		                    </label>
		                </div>
		            </div>
		        </div>
		        {
		        	params.greeting ? (
				        <div className="form-group">
				            <label className="col-sm-4 control-label">
				                {frases.GREETNAME}:
				            </label>
				            <div className="col-sm-8">
				            	<FileUpload frases={frases} name="greetingfile" value={params.greetingfile} onChange={props.onFileUpload} />
				            </div>
				        </div>
				    ) : null
			    }
		    </div>
		</form>
	)
}
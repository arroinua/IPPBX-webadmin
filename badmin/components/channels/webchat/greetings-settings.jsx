function WebchatTrunkOfferSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = !!params;

	function onChange(e) {
		var target = e.target;
		var name = target.name;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);;
		var params = extend({}, props.params);

		params[name] = value;
		props.onChange('offer', params);
	}

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('offer', !checked, (checked ? false : {}));
	}

	console.log('WebchatTrunkOfferSettsComponent:', params);
		
	return (
		<form className="form-horizontal" autoComplete='off'>
			<div className="form-group">
				<label htmlFor="greetings-feature" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.OFFER_CHECKBOX}</label>
				<div className="col-sm-4">
					<div className="switch switch-md">
					    <input 
					    	className="cmn-toggle cmn-toggle-round" 
					    	type="checkbox" 
					    	checked={featureOn} 
					    />
					    <label 
					    	htmlFor="greetings-feature-switch" 
					    	data-toggle="tooltip" 
					    	onClick={toggleFeature}
					    ></label>
					</div>
				</div>
			</div>
			{
				featureOn ? (
					<div>
						<div className="form-group">
						    <label htmlFor="from" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.OFFER_FROM_LABEL}</label>
						    <div className="col-sm-4">
						    	<input type="text" className="form-control" name="from" value={params.from} onChange={onChange} autoComplete='off' required />
						    </div>
						</div>
						<div className="form-group">
						    <label htmlFor="text" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.OFFER_MESSAGE_LABEL}</label>
						    <div className="col-sm-4">
						    	<textarea rows="2" className="form-control" name="text" value={params.text} onChange={onChange} autoComplete='off' required></textarea>
						    </div>
						</div>
						<div className="form-group">
						    <label htmlFor="inSeconds" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBCHAT.OFFER_TIMEOUT_LABEL}</label>
						    <div className="col-sm-3">
						    	<div className="input-group">
						    		<input type="number" className="form-control" name="inSeconds" value={params.inSeconds} onChange={onChange} autoComplete='off' required />
						    		<span className="input-group-addon">{frases.SEC}</span>
						    	</div>
						    </div>
						</div>
					</div>
				) : null
			}
		</form>
	)
}


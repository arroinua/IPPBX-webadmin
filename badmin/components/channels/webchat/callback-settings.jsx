function WebchatTrunkCallbackSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = typeof params === 'object';

	// function onChange(e) {
	// 	var target = e.target;
	// 	var name = target.name;
	// 	var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);;
	// 	var params = extend({}, props.params);

	// 	params[name] = value;
	// 	props.onChange('callback', params);
	// }

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('callback', !checked, (checked ? false : { task: 'callback', message: '', time: false }));
	}

	console.log('WebchatTrunkCallbackSettsComponent:', params, featureOn);
	
	// {
	// 	featureOn ? (
	// 		<div>
	// 			<div className="form-group">
	// 			    <label htmlFor="task" className="col-sm-4 control-label">{"Number"}</label>
	// 			    <div className="col-sm-4">
	// 			    	<input type="text" className="form-control" name="task" value={params.task} onChange={onChange} autoComplete='off' required />
	// 			    </div>
	// 			</div>
	// 		</div>
	// 	) : null
	// }

	return (
		<form className="form-horizontal" autoComplete='off'>
			<div className="form-group">
				<label htmlFor="chat-feature" className="col-sm-4 control-label">{props.frases.CHAT_TRUNK.WEBCHAT.CHANNELS.CALLBACK}</label>
				<div className="col-sm-4">
			        <div className="switch switch-md">
			            <input 
			            	className="cmn-toggle cmn-toggle-round" 
			            	type="checkbox" 
			            	checked={featureOn} 
			            />
			            <label 
			            	htmlFor="callback-channel-switch" 
			            	data-toggle="tooltip" 
			            	onClick={toggleFeature}
			            ></label>
			        </div>
				</div>
			</div>
		</form>
	)
}


function WebchatTrunkChatSettsComponent(props) {

	var frases = props.frases;
	var params = props.params;
	var featureOn = params !== false;

	// function onChange(e) {
	// 	var target = e.target;
	// 	var name = target.name;
	// 	var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);;
	// 	var params = extend({}, props.params);

	// 	params[name] = value;
	// 	props.onChange('chat', params);
	// }

	function toggleFeature(e) {
		var checked = featureOn;
		props.toggleFeature('chat', !checked, (checked ? false : true));
	}

	return (
		<form className="form-horizontal" autoComplete='off'>
			<div className="form-group">
				<label htmlFor="chat-feature" className="col-sm-4 control-label">{props.frases.CHAT_TRUNK.WEBCHAT.CHANNELS.CHAT}</label>
				<div className="col-sm-4">
			        <div className="switch switch-md">
			            <input 
			            	className="cmn-toggle cmn-toggle-round" 
			            	type="checkbox" 
			            	checked={featureOn} 
			            />
			            <label 
			            	htmlFor="chat-channel-switch" 
			            	data-toggle="tooltip" 
			            	onClick={toggleFeature}
			            ></label>
			        </div>
				</div>
			</div>
		</form>
	)
}


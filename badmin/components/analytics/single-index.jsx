 function SingleIndexAnalyticsComponent(props) {
	
	var params = props.params || { index: props.index, desc: props.desc, format: props.format, iconClass: props.iconClass, sec: props.sec };

	// getDefaultProps: function() {
	// 	return {
	// 		params: {}
	// 	};
	// },

	// componentWillMount: function() {
	// 	var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
	// 	this._getData({
	// 		date: picker.date
	// 	});
	// },

	function _formatTimeString(time, format){
	    return window.formatTimeString(time, format);
	}

	function _formatIndex(value, format) {
		// var result = value;
		if(format === 'ms') format = 'hh:mm:ss';

		return (format ? _formatTimeString(value, format) : value);
	}
				// <span style={{ display: "inline-block", width: "50px", height: "1px", background: "#eee" }}></span>

	return (
		<div className={"stat-index-cont " + (props.inverseStyles ? "inverse" : "")}>
			{
				props.iconClass ? (
					<div className="stat-index-head">
						<div className="stat-index-icon">
							<span className={props.iconClass}></span>
						</div>
					</div>	
				) : null
			}
			<div className="stat-index-body">
				<span className="stat-index-index">{ _formatIndex(params.index, params.format) }</span>
				<span className="stat-index-desc">{ params.desc }</span>
			</div>
		</div>			
	)
}


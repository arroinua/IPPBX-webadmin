 var SingleIndexAnalyticsComponent = React.createClass({

	propTypes: {
		params: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			params: {}
		};
	},

	// componentWillMount: function() {
	// 	var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
	// 	this._getData({
	// 		date: picker.date
	// 	});
	// },

	_formatTimeString: function(time, format){
	    var h, m, s, newtime;
	    h = Math.floor(time / 3600);
	    time = time - h * 3600;
	    m = Math.floor(time / 60);
	    s = Math.floor(time - m * 60);

	    newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
	    if(!format || format == 'hh:mm:ss'){
	        newtime += ':' + (s < 10 ? '0'+s : s);
	    }
	    return newtime;
	},

	_formatIndex: function(value, format) {
		var result = value;
		if(format === 'ms') result = this._formatTimeString(result / 1000);

		return result;
	},

	render: function() {
		var params = this.props.params;
		return (
			<div className="panel">
				<div className="panel-body text-center">
					<h3 style={{ margin: "5px 0" }}>{ this._formatIndex(params.index, params.format) }</h3>
					<span style={{ display: "inline-block", width: "50px", height: "1px", background: "#eee" }}></span>
					<h5>{ params.desc }</h5>
				</div>
			</div>			
		);
	}
});

SingleIndexAnalyticsComponent = React.createFactory(SingleIndexAnalyticsComponent);

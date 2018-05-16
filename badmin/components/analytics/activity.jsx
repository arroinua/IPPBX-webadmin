 var ActivityAnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object,
		onLoad: React.PropTypes.func
	},

	componentDidMount: function() {
		this.props.onLoad();
	},

	componentDidUpdate: function(props) {
		this.props.onUpdate();	
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;
		// var chartData = {};
		// var chartAttributes = {};

		// if(data) {
		// 	chartData = {
		// 		columns: [
		// 			['Assigned', (data.ar || 0)],
		// 			['Unassigned', (data.ur || 0)]
		// 		]
		// 	};

		// 	chartAttributes = {
		// 		donut: {
		// 			label: {
		// 	            format: function (value, ratio, id) {
		// 	                return value;
		// 	            }
		// 	        }
		// 		}
		// 	};
		// }

		return (
			data && (
				<div>
					<div className="row">
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.tnc, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.tr, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.ar, desc: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.rr, desc: frases.CHANNEL_STATISTICS.INDEXES.TOTAL_REPLIES }} /></div>
					</div>
					<div className="row">
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atfr, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY, format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.art, desc: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME, format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atrm, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_REPLY, format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atta, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_ASSIGN, format: "ms" }} /></div>
					</div>
				</div>
			)
		);
	}
});

ActivityAnalyticsComponent = React.createFactory(ActivityAnalyticsComponent);

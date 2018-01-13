 var ActivityAnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.object
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
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.tnc, desc: "New customers" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.tr, desc: "New requests" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.ar, desc: "Assigned requests" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.rr, desc: "Total Replies" }} /></div>
					</div>
					<div className="row">
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atfr, desc: "Av. time to first reply", format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.art, desc: "Av. resolution time", format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atrm, desc: "Av. time to reply", format: "ms" }} /></div>
						<div className="col-sm-3 col-xs-6"><SingleIndexAnalyticsComponent params={{ index: data.atta, desc: "Av. time to assign", format: "ms" }} /></div>
					</div>
				</div>
			)
		);
	}
});

ActivityAnalyticsComponent = React.createFactory(ActivityAnalyticsComponent);

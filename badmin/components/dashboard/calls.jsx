function CallsOverviewComponent(props) {

	// var data = props.data.graph;
	var data = props.data.stat;
	var frases = props.frases;

	console.log('CallsOverviewComponent: ', props.data);

	return (
		<div className="row">
			<div className="col-xs-6 col-sm-2"><SingleIndexAnalyticsComponent iconClass="fa fa-arrow-down" params={{ index: data.inbounds.total, desc: frases.STATISTICS.INCOMING_CALLS }} /></div>
			<div className="col-xs-6 col-sm-2"><SingleIndexAnalyticsComponent iconClass="fa fa-clock-o" params={{ index: data.inbounds.duration, desc: frases.STATISTICS.TOTALDURATION, format: 'mm:ss' }} /></div>
			<div className="col-xs-6 col-sm-2"><SingleIndexAnalyticsComponent iconClass="fa fa-times" params={{ index: (data.inbounds.lost + "/" + (data.inbounds.total ? (data.inbounds.lost / data.inbounds.total * 100).toFixed(1) : 0) + "%"), desc: frases.STATISTICS.LOSTCALLS }} /></div>
			<div className="col-xs-6 col-sm-2"><SingleIndexAnalyticsComponent iconClass="fa fa-arrow-up" params={{ index: data.outbounds.total, desc: frases.STATISTICS.OUTGOING_CALLS }} /></div>
			<div className="col-xs-6 col-sm-2"><SingleIndexAnalyticsComponent iconClass="fa fa-clock-o" params={{ index: data.outbounds.duration, desc: frases.STATISTICS.TOTALDURATION, format: 'mm:ss' }} /></div>
		</div>
	)
}

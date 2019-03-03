function ChannelsTotalsComponent(props) {
	var data = props.data.stat;
	var frases = props.frases;

	console.log('ChannelsTotalsComponent: ', data);

	// <div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent params={{ index: data.atrm, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_REPLY, format: "ms" }} /></div>
			// <div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent params={{ index: data.atta, desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_ASSIGN, format: "ms" }} /></div>
	return (
		<div className="row">
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-users" params={{ index: data.tnc, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-arrow-down" params={{ index: data.tr, desc: frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-user-plus" params={{ index: data.ar, desc: frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-reply" params={{ index: data.rr, desc: frases.CHANNEL_STATISTICS.INDEXES.TOTAL_REPLIES }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-calendar-plus-o" params={{ index: (data.atfr/1000), desc: frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY, format: "mm:ss" }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent iconClass="fa fa-calendar-check-o" params={{ index: (data.art/1000), desc: frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME, format: "mm:ss" }} /></div>
		</div>
	)
}
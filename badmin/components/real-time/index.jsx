function RealtimeDashboardComponent(props) {

	var frases = props.frases;
	var state = props.data.state;
	var load = (state.load ? parseFloat(state.load) : 0).toFixed(1);

	return (
		<div>
			<PanelComponent>
				<div className="row">
					<div className="col-xs-6 col-sm-3">
						<SingleIndexAnalyticsComponent iconClass="fa fa-arrow-down"   desc={frases.STATISTICS.INCOMING_CALLS} index={state.in || 0} />
					</div>
					<div className="col-xs-6 col-sm-3">
						<SingleIndexAnalyticsComponent iconClass="fa fa-arrow-up" desc={frases.STATISTICS.OUTGOING_CALLS} index={state.out || 0} />
					</div>
					<div className="col-xs-6 col-sm-3">
						<SingleIndexAnalyticsComponent iconClass="fa fa-link" desc={frases.STATISTICS.CONNECTEDCALLS} index={state.conn || 0} />
					</div>
					<div className="col-xs-6 col-sm-3">
						<SingleIndexAnalyticsComponent iconClass="fa fa-dashboard" desc={frases.STATISTICS.LINES_PAYLOAD} index={load} />
					</div>
				</div>
			</PanelComponent>
			<PanelComponent header={frases.REALTIME.TRUNKS_PANEL.TITLE}>
				<div className="row">
					<div className="col-xs-12">
						<RealtimeTrunksComponent frases={frases} data={props.data.trunks} />
					</div>
				</div>
			</PanelComponent>
			<PanelComponent header={frases.REALTIME.CALLS_PANEL.TITLE}>
				<div className="row">
					<div className="col-xs-12">
						<RealtimeCallsComponent frases={frases} extensions={props.data.extensions} data={props.data.calls} />
					</div>
				</div>
			</PanelComponent>
		</div>
	)
}
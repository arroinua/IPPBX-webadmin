function RealtimeCallsComponent(props) {

	var frases = props.frases;
	var data = props.data;

	return (
		<div className="table-responsive">
			{
				data.length ? (
					<table className="table">
					    <tbody>
					    	{
					    		data.map(function(call) {
					    			return (
					    				<tr key={call.called+'_'+call.caller+'_'+call.time}>
					    					<td>{call.caller}</td>
					    					<td className="text-primary"><i className="fa fa-fw fa-arrow-right"></i></td>
					    					<td>{call.called}</td>
					    					<td>{formatTimeString(call.time, 'hh:mm:ss')}</td>
					    				</tr>
					    			)
					    		})
					    	}
					    </tbody>
					</table>
				) : (
					<span>{frases.REALTIME.NO_DATA}</span>
				)
			}
				    
		</div>
	)
}
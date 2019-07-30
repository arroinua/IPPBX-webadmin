function RealtimeTrunksComponent(props) {

	var frases = props.frases;
	var data = props.data;
	var indexStyle = {
		fontSize: "1.2em"
	};

	return (
		<div className="table-responsive">
			{
				data.length ? (
					<table className="table">
						<thead>
							<tr>
								<th></th>
								<th></th>
								<th><span className="fa fa-arrow-down text-primary"></span></th>
								<th><span className="fa fa-arrow-up text-danger"></span></th>
								<th><span className="fa fa-dashboard text-primary"></span></th>
								<th></th>
							</tr>
						</thead>
					    <tbody>
					    	{
					    		data.map(function(trunk) {
					    			return (
					    				<tr key={trunk.oid}>
					    					<td><span className={"fa fa-circle text-" + ( trunk.enabled ? 'active' : 'muted' )}></span></td>
					    					<td>
					    						{
					    							trunk.type === 'system' ? (
					    								<span>{trunk.name}</span>
					    							) : (
					    								<a href={"#trunk/"+trunk.oid}>{trunk.name}</a>
					    							)
					    						}
					    					</td>
					    					<td style={indexStyle}><span>{trunk.in}</span></td>
					    					<td style={indexStyle}><span>{trunk.out}</span></td>
					    					<td style={indexStyle}><span>{parseFloat(trunk.load).toFixed(1) + '%'}</span></td>
					    					<td>{trunk.address}</td>
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
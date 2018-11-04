function UsersRegHistoryTableComponent(props) {

	var frases = props.frases;

	return (
		<div>
			{
				(props.data && props.data.length) ? (
					<PanelComponent>
						<div className="table-responsive">
							<table className="table">
								<thead>
									<tr>
										<th>{frases.REG_HISTORY.REG_TIME}</th>
										<th>{frases.REG_HISTORY.UNREG_TIME}</th>
										<th>{frases.REG_HISTORY.REG_DURATION}</th>
										<th>{frases.REG_HISTORY.DEV_INFO}</th>
									</tr>
								</thead>
								<tbody>
									{
										props.data.map(function(item){
											return (
												<tr key={item.rid+"_"+item.treg}>
													<td>{item.treg ? moment(item.treg).format('DD/MM/YY HH:mm') : "N/A"}</td>
													<td>{item.tunreg ? moment(item.tunreg).format('DD/MM/YY HH:mm') : "N/A"}</td>
													<td>{item.tunreg ? formatTimeString((item.tunreg - item.treg)/1000) : "N/A"}</td>
													<td>{item.devinfo}</td>
												</tr>
											)
										})
									}
								</tbody>
							</table>
						</div>
					</PanelComponent>
				) : null
			}
		</div>
	)
}
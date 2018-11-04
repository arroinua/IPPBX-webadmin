function UsersRegHistoryTotalsComponent(props) {

	var lastReg = props.data[0];
	var firstReg = props.data[props.data.length-1];
	var totalDuration = props.data.reduce(function(total, next) { total += (next.tunreg ? next.tunreg - next.treg : 0) ; return total; }, 0);

	return (
		<PanelComponent>
			<div className="row">
				<div className="col-sm-4 text-center">
					<h5>{props.frases.REG_HISTORY.FIRST_REG}</h5>
					<h4>{firstReg.treg ? moment(firstReg.treg).format('DD/MM/YY HH:mm') : "N/A"}</h4>
				</div>
				<div className="col-sm-4 text-center">
					<h5>{props.frases.REG_HISTORY.LAST_REG}</h5>
					<h4>{lastReg.tunreg ? moment(lastReg.tunreg).format('DD/MM/YY HH:mm') : "N/A"}</h4>
				</div>
				<div className="col-sm-4 text-center">
					<h5>{props.frases.REG_HISTORY.TOTAL_DURATION}</h5>
					<h4>{totalDuration ? formatTimeString(totalDuration/1000) : "N/A"}</h4>
				</div>
			</div>
		</PanelComponent>
	)

}
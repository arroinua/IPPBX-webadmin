function StepGuideStep(props) {

	return (
		<div className="row">
			<hr className="col-xs-12" />
			<div className="col-sm-2">
				{
					props.params.done ? (
						<h4>
							<span className='fa fa-fw fa-check text-success'></span>
							<small> {props.frases.DONE}</small>
						</h4>
					) : (
						<h4>
							<span style={{ padding: "3px 9px", borderRadius: "50%", border: "1px solid #333" }}>{props.stepIndex}</span>
						</h4>
					)
				}
			</div>
			<div className="col-sm-6">
				<h4>{props.params.name}</h4>
				<p>{props.params.desk}</p>
			</div>
			<div className="col-sm-4" style={{ textAlign: 'right' }}>
				{
					props.params.actions.map(function(item,index) {
						return (
							<h4 key={index}>
								<a key={index} href={item.link} className="btn btn-action">{item.name}</a>
								<br/>
								<br/>
							</h4>
						)
					})
				}
			</div>
		</div>
	)

}
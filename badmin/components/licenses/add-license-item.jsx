function AddLicenseItemComponent(props) {

	function onChange(value) {
		props.onChange(value);
	}

	return (
		<div>
			<div className="row">
				<div className="col-xs-5">
					<h5>{ props.label }</h5>
				</div>
				<div className="col-xs-7">
					<div className="input-group">
						<span className="input-group-btn">
							<button className="btn btn-link" disabled={props.readOnly} type="button" onClick={function() { onChange(props.quantity-(props.step || 1)) }}><i className="fa fa-chevron-left"></i></button>
						</span>
						<input type="number" value={props.quantity} onChange={function(e) {onChange(e.target.value)}} className="form-control text-right" readOnly={props.readOnly} />
						<span className="input-group-btn">
							<button className="btn btn-link" disabled={props.readOnly} type="button" disabled={props.readOnly} onClick={function() {onChange(props.quantity+(props.step || 1)) }}><i className="fa fa-chevron-right"></i></button>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
function AddLicenseItemComponent(props) {

	return (
		<div>
			<div className="input-group">
				<span className="input-group-btn">
					<button className="btn btn-default" type="button" onClick={props.onMinus}><i className="fa fa-minus"></i></button>
				</span>
				<h3 className="data-model">{ props.quantity }</h3>
				<span className="input-group-btn">
					<button className="btn btn-default" type="button" onClick={props.onPlus}><i className="fa fa-plus"></i></button>
				</span>
			</div>
		    <p>{ props.label }</p>
		</div>
	);
}

AddLicenseItemComponent = React.createFactory(AddLicenseItemComponent);

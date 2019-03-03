function ImportUsersButtonsComponent(props) {

	function onClick(service, e) {
		e.preventDefault();
		props.onClick(service);
	}

	return (
	    <div className="btn-group" style={{ marginBottom: "10px" }}>
			<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				<i className="fa fa-cloud-download fa-fw"></i> {props.frases.IMPORT} <span className="caret"></span>
			</button>
			<ul className="dropdown-menu">
				{
					props.services.map(function(item) {
						return (
							<li key={item.id}>
								<a href="#" onClick={onClick.bind(this, item)}>
									<span>{props.frases.IMPORT_USERS_FROM}</span><strong> {item.name}</strong>
								</a>
							</li>
						)
					}.bind(this))
				}
			</ul>
	    </div>
	);
}

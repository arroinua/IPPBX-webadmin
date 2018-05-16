function DeleteObjectModalComponent(props) {

	var frases = props.frases;

	function _getBody() {
		return (
			<div>
				<h4>{frases.DELETE} <strong>{ props.name }</strong>?</h4>
				{
					props.warning && (
						<div className="alert alert-warning" role="alert">
							<p>{props.warning}</p>
						</div>
					)
				}
			</div>
		);
	}

	function _onSubmit() {
		props.onSubmit();
	}

	return (
		<ModalComponent 
			size="sm"
			type="danger"
			closeOnSubmit={true}
			submitText={frases.DELETE}
			cancelText={frases.CANCEL} 
			submit={_onSubmit} 
			body={_getBody()}
		>
		</ModalComponent>
	);
}

DeleteObjectModalComponent = React.createFactory(DeleteObjectModalComponent);
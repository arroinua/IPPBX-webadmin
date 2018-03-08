function DeleteObjectModalComponent(props) {

	var frases = props.frases;

	function _getBody() {
		return (
			<div>
				<h4>{frases.DELETE} <strong>{ props.name }</strong>?</h4>
				{
					props.warning && (
						<p className="text-danger">{props.warning}</p>
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
			submitText={frases.DELETE}
			cancelText={frases.CANCEL} 
			submit={_onSubmit} 
			body={_getBody()}
		>
		</ModalComponent>
	);
}

DeleteObjectModalComponent = React.createFactory(DeleteObjectModalComponent);
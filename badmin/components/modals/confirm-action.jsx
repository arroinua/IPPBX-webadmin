function ConfirmActionModalComponent(props) {

	var frases = props.frases;

	function _getBody() {
		return (
			<div>
				{
					props.warning ? (
						<div className="alert alert-warning" role="alert">
							<p>{props.warning}</p>
						</div>
					) : (
						<div>
							<p>{props.text}</p>
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
			title={props.title}
			type={props.type || 'primary'}
			closeOnSubmit={true}
			submitText={props.submitTet || frases.CONFIRM}
			cancelText={props.cancelText || frases.CANCEL} 
			submit={_onSubmit}
			body={_getBody()}
		>
		</ModalComponent>
	);
}

DeleteObjectModalComponent = React.createFactory(DeleteObjectModalComponent);
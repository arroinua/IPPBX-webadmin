function UserProfileCOmponent(props) {

	function _getFooter() {
		return (
			<div>
				<button className="btn btn-success" role="button" onClick={props.onSubmit}>{props.frases.SUBMIT}</button>
			</div>
		)
	}

	return (
		<PanelComponent>
			<ExtensionComponent 
				frases={props.frases} 
				params={props.params}
				groups={props.groups}
				generatePassword={props.generatePassword}
				convertBytes={props.convertBytes}
				onChange={props.onChange}
				onAvatarChange={props.onAvatarChange}
			/>
			{
				props.onSubmit && _getFooter()
			}
		</PanelComponent>
	)

}
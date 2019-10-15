function ExtensionAuthorizationComponent(props) {

	var frases = props.frases;

	return (
		<div className="col-xs-12">
			<form className="form-horizontal" onChange={props.onChange}>
				<div className="form-group">
					<label className="control-label col-sm-4">{frases.DOMAIN}</label>
					<div className="col-sm-8">
						<p className="form-control-static">{window.location.host}</p>
					</div>
				</div>
				<div className="form-group">
					<label className="control-label col-sm-4">{frases.USERNAME}</label>
					<div className="col-sm-8">
						<p className="form-control-static">{props.params.login}</p>
					</div>
				</div>
				<div className="form-group">
					<label className="control-label col-sm-4">{frases.PASSWORD}</label>
					<div className="col-sm-8">
						<PasswordComponent frases={frases} name="password" value={ props.params.password } onChange={ props.onChange } generatePassword={props.generatePassword} />
					</div>
				</div>
				<div className={"form-group " + (props.params.kind === 'user' ? 'hidden' : '')}>
					<label className="control-label col-sm-4">{frases.PIN}</label>
					<div className="col-sm-4">
						<input type="text" className="form-control" name="pin" value={ props.params.pin } onChange={ props.onChange } />
					</div>
				</div>
				<div className={"form-group " + (props.params.kind !== 'user' ? 'hidden' : '')}>
					<div className="alert alert-info" role="alert">
					    <p className="text-center">{frases.LIGHTBOX.USER_AUTH_DATA.BODY} <a href="https://ringotel.co/download" target="_blank" className="alert-link">{frases.LIGHTBOX.USER_AUTH_DATA.ACTION_BTN_TEXT}</a></p>
					</div>
				</div>
			</form>
		</div>
	)

}
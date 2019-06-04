function DownloadAppsLightbox(props) {

	function _onRef(el) {
		if(el) el.innerHTML = props.frases.LIGHTBOX.DOWNLOAD_APPS.BODY;
	}

	return (
		<PanelComponent>
			<div className="row">
				<div className="col-sm-8">
					<h5 ref={_onRef}></h5>
				</div>
				<div className="col-sm-4">
					<div className="text-center">
						<h5>
							<a href="https://ringotel.co/download" target="_blank" className="btn btn-action btn-lg">{props.frases.LIGHTBOX.DOWNLOAD_APPS.ACTION_BTN_TEXT}</a>
						</h5>
					</div>
				</div>
			</div>
		</PanelComponent>
	)
}
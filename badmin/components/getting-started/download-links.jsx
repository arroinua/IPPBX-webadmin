function GSDownloadLinksComponent(props) {

	return (
		<div className="gs-download-links">
			<div className="row">
				<div className="col-sm-6">
					<a href="https://play.google.com/store/apps/details?id=smile.ringotel" target="_blanc"><img src="/badmin/images/links/google-play.png" alt="Android app" /></a>
				</div>
				<div className="col-sm-6">
					<a href="https://itunes.apple.com/ie/app/ringotel/id1176246999?mt=8" target="_blanc"><img src="/badmin/images/links/app-store.png" alt="iOS app" /></a>
				</div>
			</div>
			<div className="row">
				<div className="col-sm-6">
					<a href="https://ringotel.co/downloads/ringotel.exe" target="_blanc"><img src="/badmin/images/links/windows.png" alt="Windows app" /></a>
				</div>
				<div className="col-sm-6">
					<a href="https://ringotel.co/downloads/ringotel.dmg" target="_blanc"><img src="/badmin/images/links/mac-os.png" alt="macOS app" /></a>
				</div>
			</div>
		</div>
	);
}

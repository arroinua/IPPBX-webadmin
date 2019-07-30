function HelpSidebarComponent(props) {

	var frases = props.frases;

	return (
		<div>
			<div className="row">
				<div className="col-xs-12">
					<h4>{frases.HELP_SIDEBAR.TITLE}</h4>
				</div>
			</div>
			<br/>
			<div className="row">
				<div className="col-xs-12">
					<HelpSidebarButtonComponent
						link="https://ringotel.zendesk.com/hc/en-us" 
						text={frases.HELP_SIDEBAR.HELP_CENTER_BTN.TEXT} 
						desc={frases.HELP_SIDEBAR.HELP_CENTER_BTN.DESC}
						iconColor="#54c3f0"
						iconClass="fa fa-book"
					/>
				</div>
			</div>
			<br/>
			<div className="row">
				<div className="col-xs-12">
					<HelpSidebarButtonComponent
						link="https://calendly.com/ringotel/demo" 
						text={frases.HELP_SIDEBAR.BOOK_TRAINING_BTN.TEXT} 
						desc={frases.HELP_SIDEBAR.BOOK_TRAINING_BTN.DESC}
						iconColor="#5cb85c"
						iconClass="fa fa-calendar"
					/>
				</div>
			</div>
			<br/>
			<div className="row">
				<div className="col-xs-12">
					<HelpSidebarButtonComponent
						link="mailto:support@ringotel.co" 
						text={frases.HELP_SIDEBAR.EMAIL_US_BTN.TEXT} 
						desc={frases.HELP_SIDEBAR.EMAIL_US_BTN.DESC}
						iconClass="fa fa-envelope"
					/>
				</div>
			</div>
		</div>
	)
}
function InitGSButtonComponent(props) {
	
	function onClick(e) {
		e.preventDefault();
		props.onClick();
	}

	return (
		<a href="#" className="init-gs-btn" onClick={onClick}>
		    <i className="fa fa-play-circle fa-fw"></i>
		    <span>{props.frases.GET_STARTED.TITLE}</span>
		</a>
	);
}

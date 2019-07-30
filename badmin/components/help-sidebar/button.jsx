function HelpSidebarButtonComponent(props) {

	var buttonStyle = {
		textAlign: "left",
		fontSize: "16px",
		border: "transparent",
		boxShadow: "0 0 4px 2px rgba(0,0,0,0.05)"
	};

	var iconStyle = {
		color: props.iconColor,
	    display: "inline-block",
	    height: "40px",
	    verticalAlign: "top",
	    padding: "7px",
	    marginRight: "10px",
	    fontSize: "1.5em"
	};

	return (
		<a href={props.link} target="_blank" className="btn btn-default btn-lg btn-block" style={buttonStyle}>
			<span className={props.iconClass} style={iconStyle}></span>
			<span style={{ display: "inline-block" }}>
				<span>{props.text}</span>
				<br/>
				<small>{props.desc}</small>
			</span>
		</a>
	)
}
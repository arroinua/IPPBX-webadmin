function GSCreateChannelItemComponent(props) {
	
	return (
		<div className="gs-link-item">
			<div className="gs-link-header"><a href="" onClick={props.onClick}>{props.title}</a></div>
			<div className="gs-link-desc">{props.desc}</div>
		</div>
	);
}

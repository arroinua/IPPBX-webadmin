function CustomerInfoItemComponent(props) {

	return (
		<dl className="dl-horizontal">
			<dt>{props.label}</dt>
			<dd>{props.value}</dd>
		</dl>
	);
}
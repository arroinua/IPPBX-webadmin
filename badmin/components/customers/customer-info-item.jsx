function CustomerInfoItemComponent(props) {

	return (
		<dl className="dl-horizontal">
			<dt>{props.label}</dt>
			<dd>{(typeof props.value === 'object' ? props.value.join(', ') : props.value)}</dd>
		</dl>
	);
}
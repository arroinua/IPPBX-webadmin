function DividerComponent(props) {
	return (
		<strong className={"text-divider " + (props.size ? props.size : '')}>{props.children}</strong>
	)
}
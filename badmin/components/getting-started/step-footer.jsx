function GSStepFooterComponent(props) {
	
	return (
		<div style={{ padding: "10px 20px" }}>
			<button className="btn btn-primary btn-lg pull-right" onClick={props.onSubmit}>Done</button>
		</div>
	);
}

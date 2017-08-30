function TrunkServiceItemComponent(props) {

	function selectItem() {
		props.onClick(props.params.id);
		return;
	}

	return (
	    <div className={props.className} style={{ cursor: 'pointer' }} onClick={selectItem}>
	    	<p><i className={props.params.icon}></i></p>
	    	<h5>{props.params.name}</h5>
	    </div>
	);
}

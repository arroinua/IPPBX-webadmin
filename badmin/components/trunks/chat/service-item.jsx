function TrunkServiceItemComponent(props) {

	var itemStyles = {
		display: 'block',
		textDecoration: 'none',
		opacity: props.disabled ? 0.5 : 1,
		cursor: props.disabled ? 'default' : 'pointer'
	};

	function selectItem(e) {
		e.preventDefault();
		if(props.disabled) return;
		props.onClick(props.item.id);
	}

	return (
	    <a 
	    	href="#" 
	    	style={itemStyles} 
	    	onClick={selectItem}
	    	className={props.disabled ? "disabled" : ""}
	    >
	    	<img 
	    		src={props.item.icon} 
	    		alt={props.item.name+' icon'} 
	    		style={{ width: "40px", height: "40px" }}
	    	/>
	    	<h5 className={ props.selected ? '' : 'hidden' }>{props.item.name}</h5>
	    </a>
	);
}

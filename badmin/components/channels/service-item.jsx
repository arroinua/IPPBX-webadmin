function TrunkServiceItemComponent(props) {

	var itemStyles = {
		display: 'block',
		textDecoration: 'none',
		display: props.disabled ? "none" : "block",
		cursor: props.disabled ? 'default' : 'pointer'
	};

	function selectItem(e) {
		e.preventDefault();
		if(props.disabled) return;
		props.onClick(props.item.id);
	}

	return (
		<div className="chattrunk-service-cont">
		    <a 
		    	href="#" 
		    	style={itemStyles} 
		    	onClick={selectItem}
		    	className={"chattrunk-service-item " + (props.selected ? "selected" : "")}
		    	title={props.item.name}
		    >
		    	{
		    		props.item.iconClass ? (
		    			<span 
		    				className={props.item.iconClass}
		    				style={{ width: "40px", height: "40px", color: "#333", padding: "5px 0" }}
		    			></span>
		    		) : (
		    			<img 
				    		src={props.item.icon} 
				    		alt={props.item.name+' icon'} 
				    		style={{ width: "40px", height: "40px" }}
				    	/>
		    		)
		    	}
				    	
		    	<h5>{props.item.name}</h5>
		    </a>
		</div>
	);
}

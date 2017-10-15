function Select3Menu(props) {

	// function selectItem(params) {
	function selectItem(item, index, e) {
		e.preventDefault();
		props.onSelect({value: item.value, label: item.label}, index);
		// props.onClick(params);
	}

	return (
	    <ul ref={props.getMenuRef}>
		    { 
		    	props.options.map(function(item, index) {
					return ( 
						<li key={"option-"+index+"-"+item.value} >
						    <a 
						        href="#" 
						        className={props.selectedIndex === index ? 'is-selected' : ''} 
						        onClick={selectItem.bind(this, item, index)}
						    >
						        {item.label}
						    </a>
						</li>

						
					);
				})
		    }
	    </ul>
	);
};
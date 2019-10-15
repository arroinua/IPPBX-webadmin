function SideMenuComponent(props) {

	function getItemClass(item) {
		var className = "nav-link ";
		className += (props.activeKind === item.name ? "active " : " ");
		if(item.enabled !== undefined) className += (item.enabled ? "enabled" : "disabled");
		if(item.up !== undefined) className += (item.up ? "" : "unregistered")
		return className;
	}

	return (
		<ul>
			{
				props.menuItems.map(function(item) {
					if(item.shouldRender === false) return null;
					return (
						<li key={item.name}>
							<a 
								href={item.link ? item.link : "#"} 
								className={ getItemClass(item) } 
								data-toggle="tooltip" data-placement="right"
								title={props.frases.KINDS[item.name]}
								onClick={function(e) { if(e.target.href === '#') e.preventDefault(); props.selectMenu(item.name) }}>
								<i className={item.iconClass}></i>
							</a>
						</li>
					)
				})
			}
		</ul>
	)
}
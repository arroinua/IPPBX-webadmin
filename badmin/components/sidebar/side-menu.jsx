function SideMenuComponent(props) {
	return (
		<ul>
			{
				props.menuItems.map(function(item) {
					if(item.shouldRender === false) return null;
					return (
						<li key={item.name}>
							<a 
								href="#" 
								className={"nav-link " + (props.activeKind === item.name ? "active" : "") } 
								data-toggle="tooltip" data-placement="right"
								title={props.frases.KINDS[item.name]}
								onClick={function(e) { e.preventDefault(); props.selectMenu(item.name) }}>
								<i className={item.iconClass}></i>
							</a>
						</li>
					)
				})
			}
		</ul>
	)
}
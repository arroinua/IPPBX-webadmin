var SideBarComponent = React.createClass({

	propTypes: {
		menuItems: React.PropTypes.array,
		selectedMenu: React.PropTypes.object,
		activeKind: React.PropTypes.string,
		activeItem: React.PropTypes.string,
		selectKind: React.PropTypes.func,
		objects: React.PropTypes.array,
		frases: React.PropTypes.object
	},

	componentDidMount: function() {
    	$('.side-panel [data-toggle="tooltip"]').tooltip({
    		delay: { "show": 200 },
    		trigger: 'hover'
    	});

	},

	_logOut: function() {
		window.logout();
	},

	_selectMenu: function(name) {
		this.props.selectKind(name);
	},

	_sortObjects: function(array) {
		return array.reduce(function(result, item) {
			result[item.kind] = result[item.kind] || [];
			result[item.kind].push(item);
			return result;
		}, {});
	},

	_buildItemsMenu: function(objects, activeItem) {
		function getItemClass(item) {
			var className = "ellipsis nav-link ";
			className += (activeItem === item.oid ? "active " : " ");
			// if(item.enabled !== undefined) className += (item.enabled === false ? "disabled" : "");
			if(item.up !== undefined) className += (item.up ? "" : "unregistered")
			return className;
		}

		return objects.map(function(item) {
			return (
				<li key={item.oid}>
					<a 
						href={"#"+item.kind+(item.oid ? ("/"+item.oid) : "")} 
						className={ getItemClass(item) }
						title={item.name}
					>{item.name}</a>
					<span></span>
				</li>
			)
		});
		
	},

	render: function() {
		var frases = this.props.frases;
		var activeKind = this.props.activeKind;
		var activeItem = this.props.activeItem;
		var selectedMenu = this.props.selectedMenu;
		var objects = this.props.objects;
		var sortedObjects = this._sortObjects(objects);

		console.log('sidebar render params: ', activeKind, activeItem, selectedMenu);

		return (
			<div className="sidebar-wrapper">
				<div className="side-panel">
					<div className="nav-top">
						<a href="#dashboard" className="small-logo"><img src="/badmin/images/small-logo.png" alt="logo" /></a>
					</div>
					<div className="nav-menu">
						<SideMenuComponent frases={frases} menuItems={this.props.menuItems} selectMenu={this._selectMenu} activeKind={activeKind} />
					</div>
					<div className="nav-bottom">
						<a 
							href="#" 
							className={"nav-link " + (activeKind === 'settings' ? 'active' : '')} 
							onClick={function(e) { e.preventDefault(); this._selectMenu('settings')}.bind(this)}
							data-toggle="tooltip" data-placement="right"
							title={frases.KINDS['settings']}
						><i className="fa fa-fw fa-bars"></i></a>
						<a 
							href="#" 
							className="nav-link" 
							onClick={function(e) { e.preventDefault(); this._logOut()}.bind(this)}
							data-toggle="tooltip" data-placement="right"
							title={frases.LOGOUT}
						><i className="fa fa-fw fa-sign-out"></i></a>
					</div>
				</div>
				<div className="nav-list">

					{
						selectedMenu.objects ? (
							<ul>
								{
									selectedMenu.objects.map(function(item) {
										if(item.kind) {
											return (
												<li key={item.kind}>
													<a href={"#"+item.kind} className={"nav-link "+(activeItem === item.kind ? "active" : "")}>
														{
															item.iconClass ? (
																<i className={item.iconClass} style={{ marginRight: '10px' }}></i>
															) : null
														}
														{frases.KINDS[item.kind]}
													</a>
												</li>
											)
										} else {
											return null
										}
									
									})
								}
							</ul>
						) : null
					}

					{
						selectedMenu.fetchKinds ? (
							selectedMenu.fetchKinds.map(function(kind) {
								return (
									<ul key={kind}>
										<li><span className="nav-header">{ frases.KINDS[kind] }</span></li>
										<li><a href={"#"+kind+"/"+kind} className="nav-link"><i className="fa fa-fw fa-plus-circle"></i> {frases.CREATE}</a></li>
										{ sortedObjects[kind] ? (this._buildItemsMenu(sortedObjects[kind], activeItem)) : null }
									</ul>
								)
							}.bind(this))
						) : null
					}
				</div>

			</div>
		);
	}
});

SideBarComponent = React.createFactory(SideBarComponent);

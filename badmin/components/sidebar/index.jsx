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

	componentWillMount: function() {
		this.setState({ availableItems: this.props.menuItems.map(function(item) { return item.name }) });
	},

	componentDidMount: function() {
    	$('.side-panel [data-toggle="tooltip"]').tooltip({
    		delay: { "show": 200 },
    		trigger: 'hover'
    	});

	},

	getInitialState: function() {
		return {
			availableItems: []
		};
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

	_channelTypeToIconName: function(type) {
		var types = {
			'Telephony': 'did.png',
			'FacebookMessenger': 'facebook.png',
			'Email': 'email.png',
			'Viber': 'viber.ico',
			'Telegram': 'telegram.png',
			'WebChat': 'webchat.png',
			'Webcall': 'webchat.png'
		};

		return types[type];
	},

	_buildItemsMenu: function(objects, activeItem) {
		var channelTypeToIconName = this._channelTypeToIconName;

		// {
		// 	item.type ? (
		// 		<img 
		// 			style={{
		// 				width: "1.2em",
		// 				verticalAlign: "top",
		// 				marginRight: "6px"
		// 			}}
		// 			src={"/badmin/images/channels/" + channelTypeToIconName(item.type)} 
		// 		/>
		// 	) : null	
		// }

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
					>
						<span>{item.name}</span>
					</a>
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

		if(!this.state.availableItems.length) return null;
		return (
			<div className="sidebar-wrapper">
				<div className="side-panel">
					<div className="nav-top">
						<a href="#realtime" className="small-logo"><img src="/badmin/images/small-logo.png" alt="logo" /></a>
					</div>
					<div className="nav-menu">
						<SideMenuComponent frases={frases} menuItems={this.props.menuItems} selectMenu={this._selectMenu} activeKind={activeKind} />
					</div>
					<div className="nav-bottom">
						{
							this.state.availableItems.indexOf('settings') !== -1 && (
								<a 
									href="#" 
									className={"nav-link " + (activeKind === 'settings' ? 'active' : '')} 
									onClick={function(e) { e.preventDefault(); this._selectMenu('settings')}.bind(this)}
									data-toggle="tooltip" data-placement="right"
									title={frases.KINDS['settings']}
								><i className="fa fa-fw fa-cog"></i></a>
							)
						}
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
													<a href={"#"+item.kind} className={"nav-link "+(activeItem === item.kind ? "active" : "")+(item.standout ? " standout" : "")}>
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
								if(!kind) return null;

								return (
									<ul key={kind}>
										<li><span className="nav-header">{ frases.KINDS[kind] }</span></li>
										{
											(PbxObject.permissionsObject && PbxObject.permissionsObject[kind] < 7) ? null : (
												<li><a href={"#"+kind+"/"+kind} className="nav-link"><i className="fa fa-fw fa-plus-circle"></i> {selectedMenu.type === 'group' ? frases.CREATE_GROUP : frases.CREATE}</a></li>
											)
										}
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

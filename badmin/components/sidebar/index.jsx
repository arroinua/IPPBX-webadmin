var SideBarComponent = React.createClass({

	propTypes: {
		kinds: React.PropTypes.array,
		activeKind: React.PropTypes.string,
		objects: React.PropTypes.array,
		selectKind: React.PropTypes.func,
		selectItem: React.PropTypes.func,
		frases: React.PropTypes.object
	},

	selectMenu: function(e, name) {
		e.preventDefault();
		this.props.selectKind(name);
	},

	selectItem: function(e, name) {
		e.preventDefault();
		this.props.selectItem(name);
	}

	render: function() {
		var frases = this.props.frases;

		return (
			<div>
				<div className="side-panel">
					<div className="nav-top">
						<a href="#dashboard" className="small-logo"><img src="/badmin/images/small-logo.png" alt="logo" /></a>
					</div>
					<div className="nav-menu">
						<ul>
							{
								this.props.kinds.map(function(kind) {
									return (
										<li>
											<a href="#" title={kind.name}><i className={kind.iconClass}></i></a>
										</li>
									)
								})
							}
						</ul>
					</div>
					<div className="nav-bottom">
						<a href="#"><i className="fa fa-fw fa-menu"></i></a>
					</div>
				</div>
				<div className="nav-list">
					<h3>{ this.props.activeKind }</h3>
					<ul>
						{
							this.props.objects[this.props.activeKind].map(function(item) {
								return (
									<li>
										<a href="#">{item.name}</a>
									</li>
								)
							})
						}
					</ul>
				</div>
			</div>
		);
	}
});

SideBarComponent = React.createFactory(SideBarComponent);

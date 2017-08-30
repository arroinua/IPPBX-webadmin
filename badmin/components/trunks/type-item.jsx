 var TrunkTypeItemComponent = React.createClass({

	propTypes: {
		params: React.PropTypes.object
	},

	render: function() {
		var params = this.props.params,
		contStyle = {
			borderRadius: 0, 
			border: "1px solid #eee", 
			marginBottom: "20px",
			backgroundColor: "#fff",
			boxShadow: "0 1px 1px rgba(0,0,0,0.05)"
		},
		hrefStyle = {
			padding: "20px",
		    display: "block",
		    textDecoration: "none",
		    color: "#555",
		    fontSize: "16px"
		};

		return (
			<div style={contStyle}>
				<a href={params.href} style={hrefStyle}>
					{
						params.icon ?
						<i className={params.icon}></i>
						: ""

					}
					<span> </span>
					<span>{params.name}</span>
				</a>
			</div>
		);
	}
});

TrunkTypeItemComponent = React.createFactory(TrunkTypeItemComponent);

var GSSendDownloadLinksComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		onClick: React.PropTypes.func
	},

	getInitialState: function() {
		email: ""
	},

	_onChange: function(e) {
		this.setState({
			email: e.target.value
		});
	},

	_onClick: function() {
		this.props.onClick(this.state.email);
		this.setState({
			email: ""
		});
	},

	render: function() {
		return (
			<div className="input-group" style={{ maxWidth: "80%", margin: "auto" }}>
				<input type="text" className="form-control input-lg" onChange={this._onChange} placeholder="Enter email" aria-label="Enter email" />
				<div className="input-group-btn">
					<button className="btn btn-lg btn-primary" onClick={this._onClick}>Send links</button>
				</div>
			</div>
		);
	}

});

GSSendDownloadLinksComponent = React.createFactory(GSSendDownloadLinksComponent);
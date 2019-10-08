var PasswordComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		name: React.PropTypes.string,
		value: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			revealed: false
		}
	},

	_reveal: function() {
		this.setState({ revealed: !this.state.revealed });
	},

	render: function() {
		return (
			<div className="input-group">
			    <input type={this.state.revealed ? "text" : "password"} className="form-control" name={this.props.name} value={this.props.value} placeholder="••••••••••••••••" onChange={this.props.onChange} autoComplete="off" />
			    <span className="input-group-btn">
			        <button type="button" className="btn btn-default" onClick={this._reveal}>
			            <i className="fa fa-eye"></i>
			        </button>
			    </span>
			</div>
		)
	}

})

PasswordComponent = React.createFactory(PasswordComponent);
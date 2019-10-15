var PasswordComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		name: React.PropTypes.string,
		value: React.PropTypes.string,
		generatePassword: React.PropTypes.func,
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

	_generatePassword: function() {
		var props = this.props;
		this.props.onChange({
			target: {
				name: props.name,
				value: props.generatePassword()
			}
		})
	},

	render: function() {
		return (
			<div className="input-group">
			    <input type={this.state.revealed ? "text" : "password"} className="form-control" name={this.props.name} value={this.props.value} placeholder="••••••••••••••••" onChange={this.props.onChange} autoComplete="off" />
			    <span className="input-group-btn">
			        <button type="button" className="btn btn-default" title={this.props.frases.REVEAL_PWD} onClick={this._reveal}>
			            <i className="fa fa-eye"></i>
			        </button>
			        {
			        	this.props.generatePassword && (
			        		<button type="button" className="btn btn-default" onClick={this._generatePassword}>
			        		    <i className="fa fa-refresh" title={this.props.frases.GENERATE_PWD}></i>
			        		</button>
			        	)
			        }
			    </span>
			</div>
		)
	}

})

PasswordComponent = React.createFactory(PasswordComponent);
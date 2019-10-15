var ExtensionModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSubmit: React.PropTypes.func,
		generatePassword: React.PropTypes.func,
		convertBytes: React.PropTypes.func,
		getObjects: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {},
			groups: [],
			imageFile: null,
			opened: false
		};
	},

	componentWillMount: function() {
		var kind = this.props.params.kind == 'user' ? 'users' : 'unit';
		this.props.getObjects(kind, function(result) {
			this.setState({ params: this.props.params, groups: result, opened: true });
		}.bind(this))
	},

	_onSubmit: function() {
		this.props.onSubmit({ params: this.state.params, file: this.state.imageFile }, function() {
			this.setState({ opened: false })
		}.bind(this));
	},

	_onChange: function(params) {
		this.setState({ params: params });
	},

	_onAvatarChange: function(params) {
		this.setState({ imageFile: params.file });
	},

	_getBody: function() {
		var frases = this.props.frases;
		return (
			<ExtensionComponent 
				frases={frases} 
				open={this.state.opened}
				params={this.props.params} 
				groups={this.state.groups}
				onChange={this._onChange} 
				generatePassword={this.props.generatePassword}
				convertBytes={this.props.convertBytes}
				onAvatarChange={this._onAvatarChange}
			/>
		);
	},

	_getTitle: function() {
		return (
			<span>
				<span className={this.props.params.kind === 'user' ? 'icon-contact' : 'icon-landline'}></span>
				<span style={{ margin: "0 10px" }}>{this.props.params.name + " - " + this.props.params.ext}</span>
			</span>
		)
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				titleObj={ this._getTitle() }
				open={this.state.opened}
				type='success'
				submitText={frases.SUBMIT}
				cancelText={frases.CANCEL} 
				submit={this.props.onSubmit && this._onSubmit} 
				body={body}
			></ModalComponent>

		);
	}
	
});

ExtensionModalComponent = React.createFactory(ExtensionModalComponent);
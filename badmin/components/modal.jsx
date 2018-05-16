
var ModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		size: React.PropTypes.string,
		type: React.PropTypes.string,
		title: React.PropTypes.string,
		submitText: React.PropTypes.string,
		cancelText: React.PropTypes.string,
		closeOnSubmit: React.PropTypes.bool,
		submit: React.PropTypes.func,
		onClose: React.PropTypes.func,
		body: React.PropTypes.element,
		children: React.PropTypes.array
	},
	
	el: null,

	componentDidMount: function() {
		if(this.props.open === true || this.props.open === undefined) {
			this._openModal();
		}

		if(this.props.onClose) 
			$(this.el).on('hidden.bs.modal', this.props.onClose)
	},

	componentDidUpdate: function() {
		if(this.props.open === true || this.props.open === undefined) {
			this._openModal();
		}
	},

	componentWillReceiveProps: function(props) {
		if(props.open === false) {
			this._closeModal();
		} else if(props.open === true) {
			this._openModal();
		}
	},

	_openModal: function() {
		if(this.el) 
			$(this.el).modal();
	},

	_closeModal: function() {
		console.log('_closeModal: ', this.el);
		$(this.el).modal('hide');
	},

	_submitModal: function(e) {
		this.props.submit();
		if(this.props.closeOnSubmit) this._closeModal();
	},

	_onRef: function(el) {
		console.log('_onRef:', el);
		this.el = el;
	},

	render: function() {
		return (
			<div className="modal fade" ref={this._onRef} tabIndex="-1" role="dialog" aria-labelledby={this.props.title}>
				<div className={"modal-dialog "+(this.props.size ? "modal-"+this.props.size : "")} role="document">
					<div className="modal-content">
						{ this.props.title ?
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title">{this.props.title}</h4>
						</div> : 
						<div className="modal-header standalone">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						</div>
						}
						<div className="modal-body">
							{this.props.body || this.props.children}
						</div>
						{ this.props.submit ? 
						<div className="modal-footer">
							<button className="btn btn-link" data-dismiss="modal">{this.props.cancelText}</button>
							<button className={"btn btn-"+(this.props.type || "primary")} onClick={this._submitModal}>{this.props.submitText}</button>
						</div>
						: null }
					</div>
				</div>
			</div>
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);
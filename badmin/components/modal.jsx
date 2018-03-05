
var ModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		size: React.PropTypes.string,
		title: React.PropTypes.string,
		submitText: React.PropTypes.string,
		cancelText: React.PropTypes.string,
		submit: React.PropTypes.func,
		body: React.PropTypes.element,
		children: React.PropTypes.array
	},
	
	el: null,

	componentDidMount: function() {
		this._openModal();		
	},

	componentDidUpdate: function() {
		this._openModal();
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
		this._closeModal();
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
							<button className="btn btn-default" data-dismiss="modal">{this.props.cancelText}</button>
							<button className="btn btn-primary" onClick={this._submitModal}>{this.props.submitText}</button>
						</div>
						: null }
					</div>
				</div>
			</div>
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);

var ModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		open: React.PropTypes.bool,
		size: React.PropTypes.string,
		type: React.PropTypes.string,
		title: React.PropTypes.string,
		submitText: React.PropTypes.string,
		cancelText: React.PropTypes.string,
		closeOnSubmit: React.PropTypes.bool,
		submit: React.PropTypes.func,
		disabled: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		onOpen: React.PropTypes.func,
		body: React.PropTypes.element,
		footer: React.PropTypes.element,
		children: React.PropTypes.array,
		cont: React.PropTypes.bool,
		fetching: React.PropTypes.bool
	},
	
	el: null,

	componentDidMount: function() {
		if(this.props.open === true || this.props.open === undefined) {
			this._openModal();
			if(this.props.onOpen) this.props.onOpen
		}

		if(this.props.onClose) 
			$(this.el).on('hidden.bs.modal', this.props.onClose)
	},

	// componentDidUpdate: function() {
	// 	if(this.props.open === true || this.props.open === undefined) {
	// 		this._openModal();
	// 	}
	// },

	componentWillReceiveProps: function(props) {
		if(props.open === false) {
			this._closeModal();
		} else if(props.open === true) {
			this._openModal();
		}
	},

	componentWillUnmount: function() {
		var cont = document.getElementById('modal-container');
		if(cont) cont.parentNode.removeChild(cont);
	},

	_openModal: function() {
		if(this.el) 
			$(this.el).modal();
	},

	_closeModal: function() {
		$(this.el).modal('hide');
	},

	_submitModal: function(e) {
		this.props.submit();
		if(this.props.closeOnSubmit) this._closeModal();
	},

	_onRef: function(el) {
		if(!el) return;
		
		this.el = el;

		var cont = document.getElementById('modal-container');
		if(cont) { cont.removeChild(cont.firstChild); }
		else {
			cont = document.createElement('div'); 
			cont.id='modal-container';
			document.body.insertBefore(cont, document.body.firstChild);
		}
		// var clone = el.cloneNode(true);
		cont.appendChild(el);
		// el.parentNode.removeChild(el);
		// this.el = clone;
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
						{ 	this.props.footer ? (
								this.props.footer
							) : (
								this.props.submit  ? (
									<div className="modal-footer">
										<button className={"btn btn-"+(this.props.type || "primary")} onClick={this._submitModal} disabled={(this.props.fetching || this.props.disabled) ? true : false}>{ this.props.fetching ? <span className="fa fa-spinner fa-spin fa-fw"></span> : this.props.submitText}</button>
										<button className="btn btn-link" data-dismiss="modal">{this.props.cancelText}</button>
									</div>
								) : null
							)
						}
					</div>
				</div>
			</div>
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);
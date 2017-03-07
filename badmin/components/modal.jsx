
var ModalComponent = React.createClass({

	submitModal: function() {
		$('#'+this.props.id).modal('close');
		this.props.submit(this.props.id);
	},

	render: function() {

		console.log('ModalComponent: ', this.props.children);

		return (
			<div className="modal fade" id={this.props.id} tabIndex="-1" role="dialog" aria-labelledby={this.props.title}>
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
							{ this.props.body || this.props.children }
						</div>
						{ this.props.submit ? 
						<div className="modal-footer">
							<button className="btn btn-primary" onClick={this.submitModal}>Submit & Close</button>
						</div>
						: null }
					</div>
				</div>
			</div>
		);
	}
});

ModalComponent = React.createFactory(ModalComponent);
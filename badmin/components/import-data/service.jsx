var ImportServiceDataComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		service: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			errors: [],
			// selectedService: null,
			// parseResult: null,
			// issues: [],
			// showIssues: false
		};
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div>
				<div className="row" style={{ textAlign: 'center' }}>
					<div className="col-xs-12">
						<img 
							src={"/badmin/images/services/"+this.props.service.id+'.png'} 
							alt={this.props.service.name} 
							style={{ maxWidth: '100%', maxHeight: '65px', margin: '40px 0' }}
						/>
					</div>
					<div className="col-xs-12">
						<p>{this.props.frases.CUSTOMERS.SERVICE_AUTH.CONFIRM_IMPORT_FROM} <strong>{this.props.service.name}</strong>?</p>
					</div>
				</div>
			</div>
		);
	}
	
});

ImportServiceDataComponent = React.createFactory(ImportServiceDataComponent);


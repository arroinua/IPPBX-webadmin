var ImportDataModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		services: React.PropTypes.string,
		selectedService: React.PropTypes.object,
		onSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			selectedService: null,
			params: {
				columns: [],
				data: []
			},
			errorState: true
		};
	},

	componentWillMount: function() {
		this.setState({ errorState: this.props.selectedService.id === 'csv' ? true : false });
	},

	componentWillReceiveProps: function(props) {
		this.setState({ errorState: props.selectedService.id === 'csv' ? true : false });
	},

	_submitImport: function() {
		if(this.state.errorState) return;

		var params = {};

		if(this.props.selectedService === 'csv') {
			params = {
				columns: this.state.params.columns,
				data: this.state.params.data.filter(function(item) { return item.length === this.state.params.columns.length }.bind(this))
			}
		} else {
			params = {
				service_id: this.props.selectedService.id
			}
		}

		this.props.onSubmit(params);
	},

	_setParams: function(params) {
		var newParams = extend({}, this.state.params, params);
		var errorState = ((!newParams.columns || !newParams.columns.length) || (!newParams.data || !newParams.data.length) || (newParams.columns.length !== newParams.data[0].length));
		this.setState({ params: newParams, errorState: errorState });
		console.log('_setParams:', params, newParams, errorState);
	},

	_getBody: function() {
		var frases = this.props.frases;
		var service = this.state.selectedService || this.props.selectedService;
		if(service.id === 'csv') {
			return <ImportCsvDataComponent frases={frases} onChange={this._setParams} onSubmit={this._submitImport} onErrorState={function(errors) { this.setState({ errorState: (errors && errors.length) ? true : false }) }.bind(this)} />;
		} else {
			return <ImportServiceDataComponent frases={frases} service={this.props.selectedService} onChange={this._setParams} onSubmit={this._submitImport} onErrorState={function(errors) { this.setState({ errorState: (errors && errors.length) ? true : false }) }.bind(this)} />;
		}
	},

	render: function() {
		var frases = this.props.frases;
		var body = this._getBody();

		return (
			<ModalComponent 
				size="md"
				type="success"
				title={ frases.IMPORT_DATA.TITLE }
				submitText={frases.IMPORT} 
				cancelText={frases.CANCEL} 
				submit={this._submitImport}
				disabled={this.state.errorState}
				closeOnSubmit={true}
				body={body}
			>
			</ModalComponent>
		);
	}
	
});

ImportDataModalComponent = React.createFactory(ImportDataModalComponent);


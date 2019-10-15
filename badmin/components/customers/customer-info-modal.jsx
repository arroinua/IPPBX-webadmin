var CustomerInfoModalComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onDelete: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			open: true
		};
	},

	componentWillReceiveProps: function(props) {
		var open = props.open === false ? false : true;

		this.setState({
			open: open
		});

	},

	_onDelete: function() {
		var props = this.props;
		setTimeout(function() {
			props.onDelete(props.params.id);
		}, 500);
		this.setState({ open: false });
	},

	_getBody: function() {
		var frases = this.props.frases;
		var exportLink = window.location.protocol + "//" + window.location.host;
		exportLink += '/exportCustomerData?customerid='+this.props.params.id;

		return (
			<div className="row">
				<div className="col-xs-12">
					<CustomerInfoComponent frases={this.props.frases} params={this.props.params} getPrivacyPrefs={this.props.getPrivacyPrefs} onDelete={this.props.onDelete} />
				</div>
				<div className="col-xs-12">
					<a href={exportLink} className="btn btn-link" target="_blank" onClick={this._onExport}>{frases.CUSTOMERS.EXPORT_BTN}</a>
					{
						this.props.onDelete && (
							<button type="button" className="btn btn-link btn-danger" onClick={this._onDelete}>{frases.CUSTOMERS.DELETE_BTN}</button>
						)
					}
				</div>
			</div>

		)
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var cname = params.name ? params.name : (params.usinfo && (params.usinfo.email || params.usinfo.phone));
	
		return (
			<ModalComponent 
				title={cname}
				open={this.state.open}
				body={this._getBody()} 
			/>
		);
	}
});

CustomerInfoModalComponent = React.createFactory(CustomerInfoModalComponent);

var StorageUsageComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		utils: React.PropTypes.object,
		updateLicenses: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			data: null
		};
	},

	componentWillMount: function() {
		getPbxOptions(function(result) {
			this.setState({ data: result });
		}.bind(this));
	},

	componentWillReceiveProps: function() {
		this.setState({ data: null });

		getPbxOptions(function(result) {
			this.setState({ data: result });
		}.bind(this));
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.state.data;
		var plan = this.props.subscription.plan;
		var canUpdate = plan.planId !== 'free';
		var storesize;
		var storelimit;

		if(data) {
			storesize = this.props.utils.convertBytes(this.state.data.storesize, 'Byte', 'GB');
			storelimit = this.props.utils.convertBytes(this.state.data.storelimit, 'Byte', 'GB');
		}
			

		return (
			<div>
			{
				this.state.data ? (
					<div className="row" style={{ textAlign: "center" }}>
				        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
				        	<h3><small>{frases.USAGE.USERS.CREATED}</small> { data.users } <small>{frases.USAGE.USERS.FROM}</small></h3>
				        	<h3>{ data.maxusers }</h3>
				            <p>{frases.USAGE.USERS.USAGE_ITEM}</p>
				        </div>
				        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
				        	<h3><small>{frases.USAGE.STORAGE.USED}</small> { parseFloat(storesize).toFixed(2) } <small>{frases.USAGE.STORAGE.FROM}</small></h3>
				            <h3>{ parseFloat(storelimit).toFixed(2) }</h3>
				            <p>{frases.USAGE.STORAGE.USAGE_ITEM}</p>
				        </div>
				        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
				        	<h3><small>{frases.USAGE.LINES.AVAILABLE}</small></h3>
				            <h3>{ data.maxlines }</h3>
				            <p>{frases.USAGE.LINES.USAGE_ITEM}</p>
				        </div>
				        
        		        <div className="text-center col-xs-12">
        		        	<hr/>
        		        	<a 
        		        		href="#" 
        		        		className="text-uppercase" 
        		        		style={{ fontSize: "14px" }} 
        		        		role="button" 
        		        		data-toggle="collapse" 
        		        		href="#licensesCollapse" 
        		        		aria-expanded="false" 
        		        		aria-controls="licensesCollapse"
        		        	>{frases.BILLING.MANAGE_LICENSES_BTN}</a>
        		        	<br/>
        		        	<div className="collapse" id="licensesCollapse">
        		        		{
        		        			canUpdate ? (
		        			        	<AddLicensesComponent 
		        			        		frases={frases} 
		        			        		subscription={this.props.subscription} 
		        			        		minUsers={data.users} 
		        			        		minStorage={data.storesize} 
		        			        		addLicenses={this.props.updateLicenses} 
		        			        	/>
		        			        ) : (
		        			        	<div>
						        			<h5 className="text-warning">
						        				{frases.USAGE.CANT_UPDATE_MSG}
						        			</h5>
						        		</div>
		        			        )
		        			    }
        			        </div>
        		        </div>
				    </div>
				) : (
					<div className="row">
						<Spinner />
					</div>
				)
			}
			</div>		
		);
	}
});

StorageUsageComponent = React.createFactory(StorageUsageComponent);
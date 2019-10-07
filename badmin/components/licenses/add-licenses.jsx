var AddLicensesComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		subscription: React.PropTypes.object,
		minUsers: React.PropTypes.number,
		minStorage: React.PropTypes.number,
		addLicenses: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			quantity: 0,
			addOns: {},
			minUsers: 0,
			minStorage: 0,
			quantityDiff: 0
		};
	},

	componentWillMount: function() {
		this._init();
	},

	_init: function() {
		var sub = this.props.subscription;
		var addOns = {};

		sub.addOns.forEach(function(item) {
			addOns[item.name] = this._extend({}, item);
		}.bind(this));

		this.setState({
			quantity: sub.quantity,
			addOns: addOns,
			minUsers: this.props.minUsers,
			minStorage: this.props.minStorage,
			quantityDiff: 0
		});
	},

	_setQuantity: function(params) {
		var state = this.state;
		var addonName = params.name;
		var quantity = params.quantity;
		var totalQuantity = 0;

		if(addonName === 'users') {
			totalQuantity = state.quantity;			
			totalQuantity += quantity;
			if(totalQuantity < state.minUsers || totalQuantity < 0) return;
			state.quantity = totalQuantity;

		} else {
			if(!state.addOns[addonName]) return;
			totalQuantity = state.addOns[addonName].quantity;
			totalQuantity += quantity;
			if(totalQuantity < 0) return;
			if(addonName === 'storage' && totalQuantity < state.minStorage) return; 
			state.addOns[addonName].quantity = totalQuantity;
		}

		this.setState(state);
		this._getQuantityDiff();
		
	},

	_getQuantityDiff: function() {
		var sub = this.props.subscription;
		var initQuantity = sub.quantity;
		var newQuantity = this.state.quantity;
		var state = this.state;
		var diff = 0;

		sub.addOns.forEach(function(item) {
			initQuantity += item.quantity;
		});

		Object.keys(state.addOns).forEach(function(key) {
			initQuantity += state.addOns[key].quantity;
		});

		diff = initQuantity - newQuantity;

		this.setState({ quantityDiff: diff });
	},

	_updateLicenses: function() {
		var state = this.state;
		var addOns = Object.keys(state.addOns).map(function(key) {
			return state.addOns[key];
		});

		if(state.quantityDiff === 0) return;

		this.props.addLicenses({
			quantity: this.state.quantity,
			addOns: addOns
		});
	},

	_cancelEditLicenses: function() {
		this._init();
	},

	_extend( a, b ) {
	    for( var key in b ) {
	        if( b.hasOwnProperty( key ) ) {
	            a[key] = b[key];
	        }
	    }
	    return a;
	},

	render: function() {
		var frases = this.props.frases;
		var state = this.state;

		return (
			<div>
				<div className="row" style={{ textAlign: "center" }}>
			        <div className="col-sm-4">
			        	<AddLicenseItemComponent 
			        		onMinus={this._setQuantity.bind(this, { name: 'users', quantity: -1 })} 
			        		onPlus={this._setQuantity.bind(this, { name: 'users', quantity: 1 })}
			        		quantity={this.state.quantity}
			        		label={frases.BILLING.AVAILABLE_LICENSES.USERS}
			        	/>
			        </div>
			    	{
			        	this.props.subscription.addOns.map(function(item, index) {
			        		if(!item.name) return null;
			        		return (

	        			        <div className="col-sm-4" key={item.name}>
	        			        	<AddLicenseItemComponent 
	        			        		onMinus={this._setQuantity.bind(this, { name: item.name, quantity: ( item.name === 'storage' ? -5 : -2 ) })} 
	        			        		onPlus={this._setQuantity.bind(this, { name: item.name, quantity: ( item.name === 'storage' ? 5 : 2 ) })}
	        			        		quantity={this.state.addOns[item.name].quantity}
	        			        		label={frases.BILLING.AVAILABLE_LICENSES[item.name] ? frases.BILLING.AVAILABLE_LICENSES[item.name.toUpperCase()] : item.description}
	        			        	/>
	        			        </div>

			        		);

			        	}.bind(this))
			        }
			    </div>
			    <div className="row">
				    {
				    	this.state.quantityDiff !== 0 && (
				    		<div className="row">
				    			<div className="col-xs-12 text-center">
			    					<hr/>
			    					<button 
			    						className="btn btn-default" 
			    						style={{ margin: "5px" }} 
			    						onClick={this._cancelEditLicenses}>
			    							{ frases.BILLING.CANCEL_LICENSE_UPDATE }
			    					</button>
			    					<button 
			    						className="btn btn-primary" 
			    						style={{ margin: "5px" }} 
			    						onClick={this._updateLicenses}>
			    							{ frases.BILLING.UPDATE_LICENSES } 
			    						</button>
				    			</div>
				    		</div>
				    	)
				    }
				</div>
			</div>
		);
	}
});

AddLicensesComponent = React.createFactory(AddLicensesComponent);

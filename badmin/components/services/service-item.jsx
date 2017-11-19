var ServiceItemComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onSave: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		var params = this.props.params;
		var state = {};

		Object.keys(params).map(function(key) {
			state[key] = params[key];
			return key;
		});

		this.setState({
			params: state
		});		
	},

	componentWillReceiveProps: function(props) {
		var params = props.params;
		var state = {};

		Object.keys(params).map(function(key) {
			state[key] = params[key];
			return key;
		});

		this.setState({
			params: state
		});
	},
	
	_saveServiceProps: function() {
		console.log('ServiceItemComponent _saveServiceProps', this.state.params);
		this.props.onSave(this.state.params);
	},

	_onChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
		var update = this.state.params;
		
		update[target.name] = value !== null ? value : "";;

		console.log('ServiceItemComponent _onChange', update);

		this.setState({
			params: update
		});

	},

	_onPropsChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
		var update = this.state.params;
		
		update.props[target.name] = value !== null ? value : "";;

		this.setState({
			params: update
		});

	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;
		var props = Object.keys(params.props).map(function(key) {
			return {
				key: key,
				value: params.props[key]
			};
		});

		console.log('ServiceItemComponent render: ', this.state.params);

		return (
			<div className="panel panel-default" style={{ borderRadius: 0 }}>
		    	<div 
		    		className="panel-heading" 
		    		role="tab"
		    		style={{ backgroundColor: 'white' }}
		    		data-parent="#services-acc"
		    		data-toggle="collapse"
		    		data-target={"#acc-"+params.id}
		    		aria-expanded="true" 
		    		aria-controls="collapseOne"
		    	>
		    		<div className="row">
			    		<div className="col-sm-2 text-center">
			    			<img 
			    				src={"/badmin/images/services/"+params.id+'.png'} 
			    				alt={params.name} 
			    				style={{ maxWidth: '100%', maxHeight: '65px' }}
			    			/>
			    		</div>
			    		<div className="col-sm-8">
			    			<h4>{params.name}</h4>
			    			<h5>Description</h5>
			    		</div>
			    		<div className="col-sm-2">
			    			<span 
			    				style={{ fontSize: '12px' }} 
			    				className={"label label-"+(this.props.params.state ? 'success' : 'default')}
			    			>
			    				{this.props.params.state ? 'enabled' : 'disabled'}
			    			</span>
			    		</div>
			    	</div>
		    	</div>
			    <div 
			    	id={"acc-"+params.id}
			    	className="panel-collapse collapse" 
			    	role="tabpanel" 
			    	aria-labelledby="headingOne"
			    >
					<div className="panel-body">
						<form className="form-horizontal">
							<div className="form-group">
							    <div className="col-sm-4 col-sm-offset-4">
							      <div className="checkbox">
							        <label data-toggle="tooltip" title={frases.ENABLE}>
							          <input type="checkbox" checked={params.state} name="state" onChange={this._onChange} /> {frases.ENABLE}
							        </label>
							      </div>
							    </div>
							</div>
							{
								props.map(function(item){
									return <ServicePropComponent key={item.key} params={item} onChange={this._onPropsChange} />
								}.bind(this))
							}
							<div className="form-group">
								<div className="col-sm-4 col-sm-offset-4">
									<button type="button" className="btn btn-success btn-md" onClick={this._saveServiceProps}>
										<i className="fa fa-check fa-fw"></i> {this.props.frases.SAVE}
									</button>
								</div>
							</div>
						</form>
					</div>
			    </div>
			</div>
		);
	}
		
});

ServiceItemComponent = React.createFactory(ServiceItemComponent);
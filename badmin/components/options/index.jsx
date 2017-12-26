
var OptionsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		branchParams: React.PropTypes.object,
		saveOptions: React.PropTypes.func,
		saveBranchOptions: React.PropTypes.func,
		singleBranch: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			params: {},
			options: {},
			branchParams: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			// params: this.props.params,
			branchParams: this.props.branchParams,
			options: this.props.params.options
		});		
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			// params: props.params,
			branchParams: props.branchParams,
			options: props.params.options
		});
	},

	_saveOptions: function() {
		var params = this.state.params || {};
		var branchParams = this.state.branchParams;
		var options = this.state.options;

		console.log('_saveOptions: ', params);

		if(params.adminpass && params.adminpass !== params.confirmpass) {
			return alert(this.props.frases.OPTS__PWD_UNMATCH);
		} else {
			delete params.confirmpass;
		}

		params.extensions = this._poolToArray(this.poolEl.value);

		if(options) params.options = options;

		this.props.saveOptions(params, function() {
			delete this.state.params.adminpass;
			delete this.state.params.confirmpass;
			this.setState({ params: params });

		}.bind(this));

		if(this.props.singleBranch) {
			this.props.saveBranchOptions(branchParams);
		}

	},

	_handleOnChange: function(params) {
		var keys = Object.keys(params);
		
		if(!keys || !keys.length) return;

		// var state = this.state.params;
		// var newState = this.state.newParams || {};

		// keys.forEach(function(key) {
			// state[key] = params[key];
			// newState[key] = params[key];
		// });

		// this.setState(state);
		
		this.setState({
			params: params
		});
	},

	_handleOnFuncOptionsChange: function(params) {
		var keys = Object.keys(params);
		if(!keys || !keys.length) return;

		var state = this.state.options;
		// var newState = this.state.newOptions || {};
		
		keys.forEach(function(key) {
			state[key] = params[key];
			// newState[key] = params[key];
		});
		// newState[keys[0]] = params[keys[0]];

		this.setState(state);
	},

	_handleOnBranchOptionsChange: function(params) {
		this.setState({ branchParams: params });
	},

	_poolToArray: function(string){

	    var extensions = [];
	    var firstnumber;
	    var lastnumber;
	    var poolsize;

	    string
	    .split(',')
	    .map(function(str){
	        return str.split('-');
	    })
	    .forEach(function(array){
	    	firstnumber = parseInt(array[0]);
	    	lastnumber = array[1] ? parseInt(array[1]) : 0;

	    	if(lastnumber > firstnumber) {
	    		poolsize = lastnumber ? (lastnumber - firstnumber) : 0;
	    	} else if(!lastnumber) {
	    		poolsize = 0;
	    	} else {
	    		poolsize = firstnumber - lastnumber;
	    		firstnumber = lastnumber;
	    	}

	        extensions.push({
	            firstnumber: firstnumber,
	            poolsize: poolsize+1
	        });
	    });
	    return extensions;
	},

	_panelHead: function() {
		return (
			<button type="button" className="btn btn-success btn-md" onClick={this._saveOptions}>
				<i className="fa fa-check fa-fw"></i> {this.props.frases.SAVE}
			</button>
		);
	},

	_setPoolEl: function(el) {
		this.poolEl = el;
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;
		var panelHead = this._panelHead();

		return (
			<div className="row">
				<div className="col-xs-12">
					<PanelComponent header={panelHead}>
		    			<ul className="nav nav-tabs" role="tablist">
		    				<li role="presentation" className="active"><a href="#tab-general-options" aria-controls="general" role="tab" data-toggle="tab">{frases.SETTINGS.GENERAL_SETTS}</a></li>
		    				<li role="presentation"><a href="#tab-security-options" aria-controls="queue" role="tab" data-toggle="tab">{frases.SETTINGS.SECURITY.SECURITY_SETTS}</a></li>
		    				<li role="presentation"><a href="#tab-functions-options" aria-controls="queue" role="tab" data-toggle="tab">{frases.SETTINGS.FUNCSETTINGS}</a></li>
		    				{
		    					this.props.singleBranch &&
		    					<li role="presentation"><a href="#tab-branch-options" aria-controls="queue" role="tab" data-toggle="tab">{frases.SETTINGS.BRANCH_SETTS}</a></li>
		    				}
		    			</ul>

						<div className="tab-content" style={{ padding: "20px 0" }}>
							<div role="tabpanel" className="tab-pane fade in active" id="tab-general-options">
								<GeneralOptionsComponent frases={this.props.frases} singleBranch={this.props.singleBranch} params={params} onChange={this._handleOnChange} setPoolEl={this._setPoolEl} />
							</div>
							<div role="tabpanel" className="tab-pane fade in" id="tab-security-options">
								<SecurityOptionsComponent frases={this.props.frases} params={params} onChange={this._handleOnChange} />
							</div>
							<div role="tabpanel" className="tab-pane fade in" id="tab-functions-options">
								<FunctionsOptionsComponent frases={this.props.frases} params={this.state.options} onChange={this._handleOnFuncOptionsChange} />
							</div>
							{
								this.props.singleBranch && (
									<div role="tabpanel" className="tab-pane fade in" id="tab-branch-options">
										<BranchOptionsComponent frases={this.props.frases} params={this.state.branchParams} onChange={this._handleOnBranchOptionsChange} />
									</div>
								)
							}
						</div>
					</PanelComponent>
				</div>			
			</div>
		);
	}
});

OptionsComponent = React.createFactory(OptionsComponent);

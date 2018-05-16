var FunctionsOptionsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	_onChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
		var update = {};

		update[target.name] = value !== null ? value : "";;

		this.props.onChange(update);
	},

	_onFileUpload: function(params) {
		var update = {};
		var files = [];

		files.push(params);
		update.files = files;
		update[params.name] = params.filename;

		console.log('_onFileUpload: ', files, params);

		this.props.onChange(update);
	},

	// _onFileUpload: function(e) {
	// 	var target = e.target;
	// 	var file = target.files[0];
	// 	var value = file.name;
	// 	var update = {
	// 		files: this.props.files || []
	// 	};

	// 	update[target.name] = value !== null ? value : "";;
	// 	update.files.push(file);

	// 	console.log('_onFileUpload: ', target, value, update, file);

	// 	this.props.onChange(update);
	// },

	render: function() {
		var frases = this.props.frases;
		var params = this.props.params;

		return (

			<form className="form-horizontal acc-cont">
			    <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-callhold-opts">{frases.FUNCTIONS.CALLHOLD}<span className="caret pull-right"></span></h5>
			    <div className="acc-pane collapse" id="acc-callhold-opts">
			        <div className="form-group">
			            <label htmlFor="holdmusicfile" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__WAV_ONHOLD}>{frases.MUSICONHOLD}:</label>
			            <div className="col-sm-4">
			            	<FileUpload frases={frases} name="holdmusicfile" value={params.holdmusicfile} onChange={this._onFileUpload} />
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="holdremindtime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__HOLD_REMIND_INT}>{frases.SETTINGS.REMINTERVAL}</label>
			            <div className="col-sm-4">
				            <div className="input-group">
				                <input type="number" className="form-control" value={params.holdremindtime} name="holdremindtime" onChange={this._onChange} />
				            	<span className="input-group-addon">{frases.SECONDS}</span>
				            </div>
				        </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="holdrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__HOLD_RECALL_INT}>{frases.SETTINGS.RETINTERVAL}</label>
			            <div className="col-sm-4">
			            	<div className="input-group">
			                	<input type="number" className="form-control" value={params.holdrecalltime} name="holdrecalltime" onChange={this._onChange} />
			            		<span className="input-group-addon">{frases.SECONDS}</span>
			            	</div>
			            </div>
			        </div>
			    </div>
			    <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-calltransfer-opts">{frases.FUNCTIONS.CALLTRANSFER}<span className="caret pull-right"></span></h5>
			    <div className="acc-pane collapse" id="acc-calltransfer-opts">
			        <div className="form-group">
			            <label htmlFor="transferrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__TRANSF_WAIT_INT}>{frases.SETTINGS.WAITINTERVAL}</label>
			            <div className="col-sm-4">
			            	<div className="input-group">
			                	<input type="number" className="form-control" value={params.transferrecalltime} name="transferrecalltime" onChange={this._onChange} />
					            <span className="input-group-addon">{frases.SECONDS}</span>
					        </div>
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="transferrecallnumber" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__TRANSF_RECALL_NUM}>{frases.SETTINGS.RETNUMBER}</label>
			            <div className="col-sm-4">
			                <input type="text" className="form-control" value={params.transferrecallnumber} name="transferrecallnumber" onChange={this._onChange} />
			            </div>
			        </div>
			        <div className="form-group">
			            <div className="col-sm-4 col-sm-offset-4">
			              <div className="checkbox">
			                <label data-toggle="tooltip" title={frases.OPTS__AUTO_RETRIEVE}>
			                  <input type="checkbox" checked={params.autoretrive} name="autoretrive" onChange={this._onChange} /> {frases.SETTINGS.AUTORETURN}
			                </label>
			              </div>
			            </div>
			        </div>
			    </div>
			    <h5 className="text-mute acc-header" data-toggle="collapse" data-target="#acc-callpark-opts">{frases.FUNCTIONS.CALLPARK}<span className="caret pull-right"></span></h5>
			    <div className="acc-pane collapse" id="acc-callpark-opts">
			        <div className="form-group">
			            <label htmlFor="parkrecalltime" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_RECALL_INT}>{frases.SETTINGS.RETINTERVAL}</label>
			            <div className="col-sm-4">
			            	<div className="input-group">
			                	<input type="number" className="form-control" value={params.parkrecalltime} name="parkrecalltime" onChange={this._onChange} />
			            		<span className="input-group-addon">{frases.SECONDS}</span>
			            	</div>
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="parkrecallnumber" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_RECALL_NUM}>{frases.SETTINGS.RETNUMBER}</label>
			            <div className="col-sm-4">
			                <input type="text" className="form-control" value={params.parkrecallnumber} name="parkrecallnumber" onChange={this._onChange} />
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="parkdroptimeout" className="col-sm-4 col-xs-12 control-label" data-toggle="tooltip" title={frases.OPTS__PARK_DISC_TOUT}>{frases.SETTINGS.ENDTOUT}</label>
			            <div className="col-sm-4">
			            	<div className="input-group">
			                	<input type="number" className="form-control" value={params.parkdroptimeout} name="parkdroptimeout" onChange={this._onChange} />
					            <span className="input-group-addon">{frases.SECONDS}</span>
					        </div>
			            </div>
			        </div>
			    </div>
			</form>
		);
	}
});

FunctionsOptionsComponent = React.createFactory(FunctionsOptionsComponent);
var GeneralOptionsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		singleBranch: React.PropTypes.bool,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			params: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			params: this.props.params
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			params: props.params
		});
	},

	_onChange: function(e) {
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : (type === 'number' ? parseFloat(target.value) : target.value);
		var update = this.state.params;
		
		update[target.name] = value !== null ? value : "";;

		this.setState({
			params: update
		});

		this.props.onChange(update);
	},

	_numPoolEl: function(el) {
		var numpool = this._arrayToNumPool(this.state.params.extensions || []);
		el.value = numpool;
		this.props.setPoolEl(el);
	},

	_onPoolKeyDown: function(e) {
		var target = e.target;
		var value = target.value;

		if(!this._validateNumPool(e)) e.preventDefault();

	},

	_validateNumPool: function(e){
		// Allow: backspace, tab, delete, escape, enter
		if ([46, 9, 8, 27, 13].indexOf(e.keyCode) !== -1 ||
		     // Allow: Ctrl+A
		    (e.keyCode == 65 && e.ctrlKey === true) || 
		     // Allow: home, end, left, right, down, up
		    (e.keyCode >= 35 && e.keyCode <= 40) || 
		     // Allow: comma and dash 
		    (e.keyCode == 188 && e.shiftKey === false) || 
		    (e.keyCode == 189 && e.shiftKey === false)) {
		         // let it happen, don't do anything
		        return true;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
		    return false;
		}

	    return true;
	},

	_arrayToNumPool: function(array) {
		if(!array) return '';
		var str = '';
		array.forEach(function(obj, indx, array){
		    if(indx > 0) str += ',';
		    str += obj.firstnumber;
		    if(obj.poolsize > 1) str += ('-' + (obj.firstnumber+obj.poolsize-1));
		});
		return str;
	},

	render: function() {
		var frases = this.props.frases;
		var params = this.state.params;

		return (
			<form className="form-horizontal" autoComplete="off">
			    <div className="form-group">
			        <label htmlFor="interfacelang" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__LANGUAGE}>{frases.LANGUAGE}</label>
			        <div className="col-sm-4">
			            <select name="lang" className="form-control" value={params.lang} onChange={this._onChange}>
			                <option value="en">English</option>
			                <option value="uk">Українська</option>
			                <option value="ru">Русский</option>
			            </select>
			        </div>
			    </div>
			    <div className="form-group">
			        <label htmlFor="branch_timezone" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__TIMEZONE}>{frases.SETTINGS.TIMEZONE}</label>
			        <div className="col-sm-4">
			            <TimeZonesComponent timezone={this.state.params.timezone} onChange={this._onChange} />
			        </div>
			    </div>
			    <div className="form-group">
			        <label htmlFor="numpool" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__POOL_TOOLTIP}>{frases.NUMBERING_POOL}</label>
			        <div className="col-sm-4">
			            <input type="text" className="form-control" data-validate-pool="true" ref={this._numPoolEl} onKeyDown={this._onPoolKeyDown} name="extensions" autoComplete="off" />
			        </div>
			    </div>
			    <div className="form-group">
			        <label htmlFor="email" className="col-sm-4 control-label">{frases.SETTINGS.ADMIN_EMAIL}</label>
			        <div className="col-sm-4">
			            <input type="email" className="form-control" name="email" value={params.email} onChange={this._onChange} placeholder={frases.SETTINGS.ADMIN_EMAIL} autoComplete="off" />
			        </div>
			    </div>
			    <div className="form-group">
			        <label htmlFor="adminname" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__LOGIN}>{frases.LOGIN}</label>
			        <div className="col-sm-4">
			            <input type="text" className="form-control" name="adminname" value={params.adminname} placeholder={frases.LOGIN} readOnly={!this.props.singleBranch} autoComplete="off" onChange={this._onChange} />
			        </div>
			    </div>
			    <div className="form-group">
				    <div className="col-sm-4 col-sm-offset-4">
				    	<button type="button" className="btn btn-default btn-block" role="button" data-toggle="collapse" data-target="#change-pass-cont" aria-expanded="false" aria-controls="change-pass-cont">{frases.SETTINGS.CHANGE_PASSWORD}</button>
				    </div>
				</div>
			    <div id="change-pass-cont" className="collapse">
			        <div className="form-group">
			            <label htmlFor="adminpass" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__PWD}>{frases.PASSWORD}</label>
			            <div className="col-sm-4">
			                <input type="password" className="form-control" name="adminpass" value={params.adminpass} placeholder={frases.PASSWORD} autoComplete="off" onChange={this._onChange} />
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="confirmpass" className="col-sm-4 control-label" data-toggle="tooltip" title={frases.OPTS__CONFIRM_PWD}>{frases.CONFIRM} {frases.PASSWORD}</label>
			            <div className="col-sm-4">
			                <input type="password" className="form-control" name="confirmpass" value={params.confirmpass} placeholder={frases.SETTINGS.CONFIRM_PASSWORD} autoComplete="off" onChange={this._onChange} />
			            </div>
			        </div>
			    </div>
			</form>
		);
	}
		
});

GeneralOptionsComponent = React.createFactory(GeneralOptionsComponent);
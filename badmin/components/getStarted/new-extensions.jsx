
var NewExtensions = React.createClass({

	propTypes: {},

	getDefaultProps: function() {},

	getInitialState: function() {
		return {
			extensions: {}
		};
	},

	_getAvailableExtensions: function() {
		
	},

	_addExtension: function() {
		return true;
	},

	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<div className="text-center">
							<h1><i className="fa fa-user"></i></h1>
							<h4>Add extensions for company employees. Users could be registered with Ringotel's apps. 
							Create Equipment group, in order to connect third-party SIP softphones, IP phones, etc.</h4>
						</div>
						<hr/>
					</div>
				</div>
				<div className="row">
				    <div className="col-sm-6">
				        <div className="form-group">
				            <label htmlFor="available-users" className="col-lg-4 control-label" data-toggle="tooltip" title="{{EXT_SETTS__EXTENSION}}">NUMBER</label>
				            <div className="col-lg-4">
				                <select id="available-users" className="form-control select2"></select>
				            </div>
				        </div>
				    </div>
				</div>
				<div className="row">
			        <div className="form-group">
			            <label htmlFor="user-name" className="col-lg-4 control-label" data-toggle="tooltip" title="{{EXT_SETTS__NAME}}">NAME</label>
			            <div className="col-lg-8">
			                <input type="text" className="form-control" id="user-name" placeholder="{{NAME}}" />
			            </div>
			        </div>
			        <div className="form-group">
			            <label htmlFor="user-dname" className="col-lg-4 control-label" data-toggle="tooltip" title="{{EXT_SETTS__DISPLAY_NAME}}">DISPLAY</label>
			            <div className="col-lg-8">
			                <div className="input-group">
			                    <input type="text" className="form-control" id="user-alias" placeholder="{{ DISPLAY}}" />
			                    <span className="input-group-btn">
			                        <button type="button" className="btn btn-default">
			                            <i className="fa fa-exchange" data-toggle="tooltip" title="{{COPY}}"></i>
			                        </button>
			                    </span>
			                </div>
			            </div>
			        </div>
				</div>
				<div className="row">
			        <div className="form-group">
			            <label htmlFor="user-pass" className="col-lg-4 control-label" data-toggle="tooltip" title="{{EXT_SETTS__PASSWORD}}">PASSWORD</label>
			            <div className="col-lg-8">
			                <div className="input-group">
			                    <input type="password" name="trunk" className="form-control" id="user-pass" placeholder="{{PASSWORD}}" />
			                    <span className="input-group-btn">
			                        <button type="button" className="btn btn-default">
			                            <i className="fa fa-eye" data-toggle="tooltip" title="{{REVEAL_PWD}}"></i>
			                        </button>
			                        <button type="button" className="btn btn-default">
			                            <i className="fa fa-refresh" data-toggle="tooltip" title="{{GENERATE_PWD}}"></i>
			                        </button>
			                    </span>
			                </div>
			            </div>
			        </div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<button className="btn btn-primary" onClick={ this._addExtension }>Add extensiosn</button>
					</div>
				</div>
			</div>
		);
	}
});

NewExtensions = React.createFactory(NewExtensions);

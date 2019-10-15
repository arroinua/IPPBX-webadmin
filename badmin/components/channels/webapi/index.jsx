var WebApiComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		properties: React.PropTypes.object,
		serviceParams: React.PropTypes.object,
		onChange: React.PropTypes.func,
		isNew: React.PropTypes.bool,
		pageid: React.PropTypes.string,
		validationError: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			inBuffer: null
		};
	},

	_copyToClipboard: function() {
		this.el.focus();
		this.el.select();

		var copied = document.execCommand('copy');
		if(copied && !this.state.inBuffer) {
			setTimeout(function() {
				this.setState({ inBuffer: false });
			}.bind(this), 5000);
			this._copied();
		}
	},

	_copied: function() {
		this.setState({ inBuffer: !this.state.inBuffer });
	},

	_onRef: function(el) {
		this.el = el;
	},

	render: function() {
		// var data = this.state.data;
		var frases = this.props.frases;
		
		return (
			<div>
				<form className="form-horizontal" autoComplete='off'>
					{
						this.props.pageid ? (
							<div className="form-group">
							    <label className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBAPI.PROFILEID_LABEL}</label>
							    <div className="col-sm-8">
							        <div className="input-group">
							            <input type="text" className="form-control" readOnly={true} ref={this._onRef} value={this.props.pageid} />
							            <span className="input-group-btn">
							                <button type="button" className="btn btn-default" onClick={this._copyToClipboard}>
							                    <i className="fa fa-clipboard" data-toggle="tooltip" title={frases.COPY}></i>
							                </button>
							            </span>
							        </div>
							    </div>
							</div>
						) : (
							<div className="form-group">
							    <label htmlFor="title" className="col-sm-4 control-label">{frases.CHAT_TRUNK.WEBAPI.PROFILEID_LABEL}</label>
							    <div className="col-sm-8">
							    	<p>{frases.CHAT_TRUNK.WEBAPI.NO_PROFILEID}</p>
							    </div>
							</div>
						)
					}
				</form>

			</div>
		);
	}
});

WebApiComponent = React.createFactory(WebApiComponent);

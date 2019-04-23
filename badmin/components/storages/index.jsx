
var UsageComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		frases: React.PropTypes.object,
		storageInfo: React.PropTypes.array,
		fileStorage: React.PropTypes.array,
		extensions: React.PropTypes.array,
		getTotalStorage: React.PropTypes.func,
		utils: React.PropTypes.object,
		openStorageSettings: React.PropTypes.func
	},

	_convertBytes: function(value, fromUnits, toUnits){
	    var coefficients = {
	        'Byte': 1,
	        'KB': 1000,
	        'MB': 1000000,
	        'GB': 1000000000
	    }
	    return value * coefficients[fromUnits] / coefficients[toUnits];
	},

	_normalize: function(list, key) {
		return list.reduce(function(result, item) {
			result[item[key]] = item;
			return result;
		}, {})
	},

	render: function() {
		var frases = this.props.frases;
		var options = this.props.options;
		var storesize = this._convertBytes(options.storesize, 'Byte', 'GB');
		var storelimit = this._convertBytes(options.storelimit, 'Byte', 'GB');
		var extensions = this._normalize(this.props.extensions || [], 'ext');

		return (
			<div>
				{
					this.props.fileStorage ? (
						<div className="row">
						    <div className="col-xs-12">
						        <StoragesComponent openSettings={this.props.openStorageSettings} frases={this.props.frases} storages={this.props.fileStorage} utils={this.props.utils} />
						    </div>
						</div>
					) : ''
				}
				
				<PanelComponent>
					<div className="row text-center">
						<div className="col-sm-4" style={{ marginBottom: "10px" }}>
							<h3><small>{frases.STORAGE.USED_SPACE}</small></h3>
						    <h3>{ parseFloat(storesize).toFixed(2) }</h3>
						    <p>GB</p>
						</div>
						<div className="col-sm-4" style={{ marginBottom: "10px" }}>
							<h3><small>{frases.STORAGE.TOTAL_SPACE}</small></h3>
						    <h3>{ parseFloat(storelimit).toFixed(2) }</h3>
						    <p>GB</p>
						</div>
						<div className="col-sm-4" style={{ marginBottom: "10px" }}>
							<h3><small>{frases.STORAGE.FREE_SPACE}</small></h3>
						    <h3>{ parseFloat(storelimit-storesize).toFixed(2) }</h3>
						    <p>GB</p>
						</div>
					</div>
				</PanelComponent>

				<div className="row">
					<div className="col-xs-12">
						<UsersStorageComponent frases={frases} data={ this.props.storageInfo } extensions={extensions} />
					</div>
				</div>

			</div>
		);
	}
});

UsageComponent = React.createFactory(UsageComponent);

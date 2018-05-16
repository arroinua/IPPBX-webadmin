
var UsageComponent = React.createClass({

	propTypes: {
		options: React.PropTypes.object,
		frases: React.PropTypes.object,
		storageInfo: React.PropTypes.array,
		fileStorage: React.PropTypes.array,
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

	render: function() {
		var frases = this.props.frases;
		var options = this.props.options;

    	console.log('storages component: ', this.props.storageInfo, this.props.fileStorage);

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
				
				<div className="row">
					<div className="col-xs-12">
						<UsersStorageComponent frases={frases} data={ this.props.storageInfo } />
					</div>
				</div>

			</div>
		);
	}
});

UsageComponent = React.createFactory(UsageComponent);


var UsersStorageComponent = React.createClass({

	propTypes: {
		data: React.PropTypes.array,
        extensions: React.PropTypes.object,
		frases: React.PropTypes.object
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

    _getExtension: function(oid) {
        return getExtension(oid);
    },

    _onRef: function(el) {
        if(el) new Sortable(el);
    },

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;
        var extensions = this.props.extensions;
        var size;
        var limit;

		return (
	        <div className="panel">
	            <div className="panel-header">
	                {frases.STORAGE.STORAGE_ALLOCATION}
	            </div>
	            <div className="panel-body">
                    <div className="col-xs-12 col-custom">
                        <div className="table-responsive">
                            <table className="table table-condensed sortable" ref={this._onRef}>
                                <thead>
                                    <tr>
                                        <th>{frases.USER}</th>
                                        <th>{frases.STORAGE.USED_SPACE} (GB)</th>
                                        <th>{frases.STORAGE.TOTAL_SPACE} (GB)</th>
                                        <th>{frases.STORAGE.FREE_SPACE} (GB)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                	{
                                		data.map(function(item, index) {

                                            size = item.size ? this._convertBytes(item.size, 'Byte', 'GB') : '0.00';
                                            limit = this._convertBytes(item.limit, 'Byte', 'GB');

                                			return (

                                				<UserStorageComponent 
                                                    key={index.toString()}
                                					user={ extensions[item.user] } 
                                                    size={ item.size ? size.toFixed(2) : "0.00" } 
                                					free={ item.size ? (limit-size).toFixed(2) : limit.toFixed(2) } 
                                					limit={ limit.toFixed(2) }
                                                    getExtension={this._getExtension}
                                				/>

                                			);

                                		}.bind(this))
                                		
                                	}
                                </tbody> 
                            </table>
                        </div>
                    </div>
	            </div>
	        </div>
		);
	}
});

UsersStorageComponent = React.createFactory(UsersStorageComponent);

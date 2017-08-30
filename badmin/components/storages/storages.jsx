
var StoragesComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		storages: React.PropTypes.array,
		utils: React.PropTypes.object,
		openSettings: React.PropTypes.func
	},

	// getDefaultProps: function() {
	// 	return {
	// 		sub: {}
	// 	};
	// },

	// getInitialState: function() {
	// 	return {
	// 		storageData: {},
	// 		storageOpened: false
	// 	};
	// },

	// componentDidMount: function() {
		
	// },

	_openStorageSettings: function(index) {
		var storageOpts = this.props.storages[index] || {};
		this.props.openSettings(storageOpts);
	},

	render: function() {
		var frases = this.props.frases;
		var storages = this.props.storages;
		var utils = this.props.utils;

		return (
			<div className="panel">
			    <div className="panel-header">
			        {frases.STORAGE.AVAILABLE_STORAGES}
			    </div>
			    <div className="panel-body">
			        <div className="row">
			            <div className="col-xs-12 col-custom">
			                <div className="table-responsive">
			                    <table className="table table-condensed">
			                        <thead>
			                            <tr>
			                                <th style={{ width: "2px" }}></th>
			                                <th>{frases.STATE}</th>
			                                <th>{frases.PATH}</th>
			                                <th>{frases.STORAGE.FREE_SPACE} (GB)</th>
			                                <th>{frases.STORAGE.USED_SPACE} (GB)</th>
			                                <th>{frases.STORAGE.TOTAL_SPACE} (GB)</th>
			                                <th>{frases.STORAGE.CREATED}</th>
			                                <th>{frases.STORAGE.UPDATED}</th>
			                                <th className="unsortable">
			                                    <button type="button" onClick={this._openStorageSettings.bind(this, null)} className="btn btn-primary"><i className="fa fa-plus"></i></button>
			                                </th>
			                            </tr>
			                        </thead>
			                        <tbody>
			                        	{
			                        		storages.map(function(item, index){

			                        			return (

			                        				<tr key={index.toString()}>
			                        					<td className={ (item.state === 1 || item.state === 2) ? 'success' : 'danger' }></td>
			                        					<td>{ utils.getFriendlyStorageState(item.state) }</td>
			                        					<td>{ item.path }</td>
			                        					<td>{ utils.convertBytes(item.freespace, 'Byte', 'GB').toFixed(2) }</td>
			                        					<td>{ utils.convertBytes(item.usedsize, 'Byte', 'GB').toFixed(2) }</td>
			                        					<td>{ utils.convertBytes(item.maxsize, 'Byte', 'GB').toFixed(2) }</td>
			                        					<td>{ utils.formatDateString(item.created) }</td>
			                        					<td>{ utils.formatDateString(item.updated) }</td>
			                        					<td>
			                        						<button className="btn btn-default btn-sm" onClick={this._openStorageSettings.bind(this, index)}>
			                        							<i className="fa fa-edit"></i>
			                        						</button>
			                        					</td>
			                        				</tr>

			                        			);

			                        		}.bind(this))
			                        	}
			                        </tbody> 
			                    </table>
			                </div>
			            </div>
			        </div>
			    </div>
			</div>
		);
	}
});

StoragesComponent = React.createFactory(StoragesComponent);

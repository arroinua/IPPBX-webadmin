 var ChatGroupsAnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array
	},

	_getColumns: function(data, colname, match, params) {
		var columns = [];
		var col = [];
		var value = null;
		var convert = params ? params.convert : null;

		data.map(function(item) {
			col = [item[colname]];
			for(var key in item) {
				if(key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
					value = item[key];
					
					if(convert === 'minutes') {
						value = parseFloat(((value / 1000) / 60).toFixed(2));
					}

					col.push(value);
				}
			}

			columns.push(col);
		}.bind(this));

		return columns;
	},

	_getColumnIds: function(columns) {
		return columns.reduce(function(result, next) {
			result.push(next[0]);
			return result;
		}, []);
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;

		console.log('ChatGroupsAnalyticsComponent render:', data);

		return (
			data && (
				<div className="row">
					<div className="col-sm-4">
						<PanelComponent header="New customers">
							<ChartComponent 
								type="donut" 
								data={{
									columns: this._getColumns(data, 'name', ['tnc']),
								}} 
								options={{
									donut: {
										label: {
								            format: function (value, ratio, id) {
								                return value;
								            }
								        }
									}
								}} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-4">
						<PanelComponent header="New requests">
							<ChartComponent 
								type="donut" 
								data={{
									columns: this._getColumns(data, 'name', ['tr'])
								}}
								options={{
									donut: {
										label: {
								            format: function (value, ratio, id) {
								                return value;
								            }
								        }
									}
								}} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-4">
						<PanelComponent header="Assigned requests">
							<ChartComponent 
								type="donut" 
								data={{
									columns: this._getColumns(data, 'name', ['ar'])
								}} 
								options={{
									donut: {
										label: {
								            format: function (value, ratio, id) {
								                return value;
								            }
								        }
									}
								}} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-6">
						<PanelComponent header="Average time to first answer (minutes)">
							<ChartComponent 
								type="bar" 
								data={{
									columns: this._getColumns(data, 'name', ['atfr'], { convert: 'minutes' })
								}} 
								options={{
									bar: {
								        width: {
								            ratio: 0.5
								        }
								    }
								}} 
							/>
						</PanelComponent>
					</div>
					<div className="col-sm-6">
						<PanelComponent header="Average resolution time (minutes)">
							<ChartComponent 
								type="bar" 
								data={{
									columns: this._getColumns(data, 'name', ['art'], { convert: 'minutes' })
								}} 
								options={{
									bar: {
								        width: {
								            ratio: 0.5
								        }
								    }
								}} 
							/>
						</PanelComponent>
					</div>
				</div>
			)
		);
	}
});

ChatGroupsAnalyticsComponent = React.createFactory(ChatGroupsAnalyticsComponent);

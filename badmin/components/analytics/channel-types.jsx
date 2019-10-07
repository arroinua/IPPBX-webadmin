 var ChannelTypeAnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		fetching: React.PropTypes.bool
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

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;

		return (
			(data && !this.props.fetching) ? (
				<div className="row">
					<div className="col-sm-4">
						<PanelComponent header={frases.CHANNEL_STATISTICS.INDEXES.NEW_CUSTOMERS}>
							<ChartComponent 
								type="donut" 
								data={{
									columns: this._getColumns(data, 'name', ['tnc'])
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
						<PanelComponent header={frases.CHANNEL_STATISTICS.INDEXES.NEW_REQUESTS}>
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
						<PanelComponent header={frases.CHANNEL_STATISTICS.INDEXES.ASSIGNED_REQUESTS}>
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
						<PanelComponent header={frases.CHANNEL_STATISTICS.INDEXES.TIME_TO_FIRST_REPLY + " (" + frases.MINUTES + ")"}>
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
						<PanelComponent header={frases.CHANNEL_STATISTICS.INDEXES.RESOLUTION_TIME + " (" + frases.MINUTES + ")"}>
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
			) : (
				<Spinner />
			)
		);
	}
});

ChannelTypeAnalyticsComponent = React.createFactory(ChannelTypeAnalyticsComponent);
 var ChannelTypeAnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array
	},

	_getColumns: function(data, colname, match) {
		var columns = [];
		var col = [];

		data.map(function(item) {
			col = [item[colname]];
			for(var key in item) {
				if(key !== colname && (match ? match.indexOf(key) !== -1 : true)) col.push(item[key]);
			}

			columns.push(col);
		}.bind(this));

		return columns;
	},

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;
		var chartData1, chartData2;
		var chartOptions = {};

		if(data) {
			chartData1 = {
				columns: this._getColumns(data, 'name', ['tnc']),
			};

			chartOptions1 = {
				donut: {
					title: "New customers",
					label: {
			            format: function (value, ratio, id) {
			                return value;
			            }
			        }
				}
			};

			chartData2 = {
				columns: this._getColumns(data, 'name', ['tr'])
			};

			chartOptions2 = {
				donut: {
					title: "New requests",
					label: {
			            format: function (value, ratio, id) {
			                return value;
			            }
			        }
				},
					
			};

			chartData3 = {
				columns: this._getColumns(data, 'name', ['ar']),
			};

			chartOptions3 = {
				donut: {
					title: "Assigned requests",
					label: {
			            format: function (value, ratio, id) {
			                return value;
			            }
			        }
				}
			};
		}

		console.log('ChannelTypeAnalyticsComponent render:', data, chartData1);

		return (
			data && (
				<PanelComponent header="By channel type">
					<div className="row">
						<div className="col-sm-4">
							<ChartComponent type="donut" data={chartData1} options={chartOptions1} />
						</div>
						<div className="col-sm-4">
							<ChartComponent type="donut" data={chartData2} options={chartOptions2} />
						</div>
						<div className="col-sm-4">
							<ChartComponent type="donut" data={chartData3} options={chartOptions3} />
						</div>
					</div>
				</PanelComponent>
			)
		);
	}
});

ChannelTypeAnalyticsComponent = React.createFactory(ChannelTypeAnalyticsComponent);
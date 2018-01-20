var AnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		utils: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			picker: {},
			fetch: {},
			showChartType: 'chatGroup'
		};
	},

	componentDidMount: function() {
		var picker = new Picker('chatstat-date-picker', {submitFunction: this._getData, buttonSize: 'md'});
		this._getData({
			date: picker.date
		});
	},

	_getData: function(params) {
		this.setState({ fetch: params });
	},

	_onChartTypeSelect: function(e) {
		var value = e.target.value;
		this.setState({ showChartType: value });

	},

	render: function() {
		var frases = this.props.frases;
		var showChartType = this.state.showChartType;

		return (
			<div>
				<div className="row" style={{margin: "20px 0"}}>
				    <div id="chatstat-date-picker" className="col-sm-4 cdropdown custom-dropdown"></div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<GetAndRenderAnalyticsDataComponent 
							component={ActivityAnalyticsComponent} 
							frases={this.props.frases} 
							fetch={this.state.fetch} 
							method="getActivityStatistics"
						/>
					</div>
				</div>
					<div className="row" style={{ margin: "20px 0" }}>
						<div className="col-sm-4">
							<select className="form-control" onChange={this._onChartTypeSelect}>
								<option value="chatGroup">By chat group</option>
								<option value="channelName">By channel name</option>
								<option value="channelType">By channel type</option>
							</select>
						</div>
					</div>

					{
						showChartType === 'chatGroup' ? (
							<GetAndRenderAnalyticsDataComponent 
								component={ChatGroupsAnalyticsComponent} 
								frases={this.props.frases} 
								fetch={this.state.fetch}
								method="getChatGroupStatistics"
							/>
						) : showChartType === 'channelName' ? (
							<GetAndRenderAnalyticsDataComponent 
								component={ChannelsAnalyticsComponent} 
								frases={this.props.frases} 
								fetch={this.state.fetch}
								method="getChannelStatistics"
							/>
						) : (
							<GetAndRenderAnalyticsDataComponent 
								component={ChannelTypeAnalyticsComponent} 
								frases={this.props.frases} 
								fetch={this.state.fetch}
								method="getChannelTypeStatistics"
							/>
						)
					}
			</div>
		);
	}
});

AnalyticsComponent = React.createFactory(AnalyticsComponent);

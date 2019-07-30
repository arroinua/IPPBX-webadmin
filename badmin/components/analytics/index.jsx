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
		show_loading_panel();
		this.setState({ fetch: params });
	},

	_onChartTypeSelect: function(e) {
		var value = e.target.value;
		this.setState({ showChartType: value });

	},

	_onComponentLoad: function() {
		console.log('_onComponentLoad');
		show_content();
	},

	_onComponentUpdate: function() {
		console.log('_onComponentUpdate');
		show_content();
	},

	render: function() {
		var frases = this.props.frases;
		var showChartType = this.state.showChartType;

		return (
			<div>
				<div className="row" style={{margin: "20px 0"}}>
				    <div id="chatstat-date-picker" style={{ display: "inline-block" }} className="cdropdown custom-dropdown"></div>
				</div>
				<PanelComponent>
					<div className="row">
						<div className="col-xs-12">

							<GetAndRenderAnalyticsDataComponent 
								component={ActivityAnalyticsComponent} 
								frases={this.props.frases} 
								fetch={this.state.fetch} 
								method="getActivityStatistics"
								onComponentLoad={this._onComponentLoad}
								onComponentUpdate={this._onComponentUpdate}
							/>
						</div>
					</div>
				</PanelComponent>
				<div className="row" style={{ margin: "20px 0" }}>
					<div style={{ display: "inline-block" }}>
						<select className="form-control" onChange={this._onChartTypeSelect}>
							<option value="chatGroup">{frases.CHANNEL_STATISTICS.SHOW_BY.CHAT_GROUP}</option>
							<option value="channelName">{frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_NAME}</option>
							<option value="channelType">{frases.CHANNEL_STATISTICS.SHOW_BY.CHANNEL_TYPE}</option>
						</select>
					</div>
				</div>

					{
						showChartType === 'chatGroup' ? (
							<GetAndRenderAnalyticsDataComponent 
								component={ChannelTypeAnalyticsComponent} 
								frases={this.props.frases} 
								fetch={this.state.fetch}
								method="getChatGroupStatistics"
							/>
						) : showChartType === 'channelName' ? (
							<GetAndRenderAnalyticsDataComponent 
								component={ChannelTypeAnalyticsComponent} 
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

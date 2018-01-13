var AnalyticsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		utils: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			picker: {},
			fetch: {}
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

	render: function() {
		var frases = this.props.frases;

		return (
			<div>
				<div className="row">
				    <div className="col-xs-12">
				        <div id="chatstat-date-picker" className="col-sm-4 col-xs-12 dropdown custom-dropdown pull-right" style={{marginBottom: "20px"}}></div>
				    </div>
				</div>
				<GetAndRenderAnalyticsDataComponent 
					component={ActivityAnalyticsComponent} 
					frases={this.props.frases} 
					fetch={this.state.fetch} 
					method="getActivityStatistics"
				/>
				<GetAndRenderAnalyticsDataComponent 
					component={ChannelsAnalyticsComponent} 
					frases={this.props.frases} 
					fetch={this.state.fetch}
					method="getChannelStatistics"
				/>
				<GetAndRenderAnalyticsDataComponent 
					component={ChannelTypeAnalyticsComponent} 
					frases={this.props.frases} 
					fetch={this.state.fetch}
					method="getChannelTypeStatistics"
				/>
			</div>
		);
	}
});

AnalyticsComponent = React.createFactory(AnalyticsComponent);

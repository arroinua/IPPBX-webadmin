var DashboardComponent = React.createClass({
	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		fetchData: React.PropTypes.func,
		fetchSubscription: React.PropTypes.func,
		fetchCallingCredits: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			sub: null,
			credits: null,
			graphType: 'incoming',
			callsData: null,
			channelsData: null,
			callsFetchParams: {
				begin: moment().startOf('day').valueOf(),
				end: moment().endOf('day').valueOf(),
				interval: 3600*24*1000
			},
			channelsFetchParams: {
				begin: moment().startOf('day').valueOf(),
				end: moment().endOf('day').valueOf()	
			}	
		};
	},

	componentWillMount: function(props) {
		
		this._getCallsData(this.state.callsFetchParams, function(result) {
			this.setState({ callsData: result });
		}.bind(this))

		this._getChannelsData(this.state.channelsFetchParams, function(result) {
			this.setState({ channelsData: result });
		}.bind(this))

		if(this.props.options.mode === 0 && this.props.profile) {
			this.props.fetchSubscription(function(err, response) {
				if(err) return console.error(err);
				this.setState({ sub: extend({}, this.props.options, response.result) });
			}.bind(this));

			this.props.fetchCallingCredits(function(err, response) {
				if(err) return console.error(err);
				this.setState({ credits: response.result });
			}.bind(this));
		}
	},

	_getCallsData: function(params, callback) {
		var data = {};
		var fetchData = this.props.fetchData;

		// fetchData('getCallStatisticsGraph', params, function(result) {
			// data.graph = result;

			fetchData('getCallStatistics', { begin: params.begin, end: params.end }, function(result) {
				data.stat = result;
				
				callback(data);
			})
		// });	
	},

	_getChannelsData: function(params, callback) {
		this.props.fetchData('getActivityStatistics', params, function(result) {
			callback({ stat: result });
		})
	},

	_getPrevRange: function(range) {
        return {
            start: (range.start - (range.end - range.start)),
            end: range.start
        }
    },

	_getColumns: function(colname, data, match, params) {
		var col = [colname];
		var value = null;
		var convert = params ? params.convert : null;

		data.map(function(item) {
		    for(var key in item) {
		        if(key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
		            value = item[key];
		            
		            if(convert === 'minutes') {
		                value = parseFloat(((value / 1000) / 60).toFixed(2));
		            }

		            col.push(value);
		        }
		    }

		    // columns.push(col);
		});

		return col;
	},

	_onGraphTypeSelect: function(type) {
		this.setState({ graphType: type });
	},

	_getSubHeader: function(title, btnText, btnLink, btnAction) {
		return (btnText ? (
			<div><span>{title}</span> <a href={btnLink} className={"btn btn-sm " + (btnAction ? "btn-default btn-action" : "btn-link")}>{btnText}</a></div>
		) : (
			<div>{title}</div>
		))
	},

	render: function() {
		var frases = this.props.frases;
		var planId = (this.state.sub && this.state.sub.plan) ? this.state.sub.plan.planId : null;
		var showUpgradeBtn = (planId && (planId === 'free' || planId === 'trial') ? true : false);
		
		return (
			<div>
				{
					(this.props.profile && !this.props.profile.partnerid && planId) ? (
						<PanelComponent 
							static={true}
							header={this._getSubHeader(frases.DASHBOARD.SUBSCRIPTION_PANEL.TITLE, (showUpgradeBtn ? frases.DASHBOARD.SUBSCRIPTION_PANEL.ACTION_BTN : frases.BILLING.BILLING), '#billing', (showUpgradeBtn ? true : false))}
						>
							{
								this.state.sub ? (
									<SubscriptionOverviewComponent 
										frases={frases} 
										data={this.state.sub} 
										credits={this.state.credits}
									/>
								) : <Spinner />
							}
						</PanelComponent>
					) : null
				}
				<PanelComponent 
					static={true} 
					header={this._getSubHeader(frases.DASHBOARD.CHANNELS_PANEL.TITLE, frases.DASHBOARD.CHANNELS_PANEL.ACTION_BTN, '#channel_statistics')}
				>
					{
						this.state.channelsData ? (
							<ChannelsTotalsComponent 
								frases={frases} 
								data={this.state.channelsData} />
						) : <Spinner />
					}
				</PanelComponent>
				<PanelComponent 
					static={true} 
					header={this._getSubHeader(frases.DASHBOARD.CALLS_PANEL.TITLE, frases.DASHBOARD.CALLS_PANEL.ACTION_BTN, '#statistics')}
				>
					{
						this.state.callsData ? (
							<CallsOverviewComponent 
								frases={frases} 
								onGraphTypeSelect={this._onGraphTypeSelect} 
								getColumns={this._getColumns} 
								graphType={this.state.graphType}
								data={this.state.callsData} 
							/>
						) : <Spinner />
					}
							
				</PanelComponent>
			</div>
		);
	}
});

DashboardComponent = React.createFactory(DashboardComponent);

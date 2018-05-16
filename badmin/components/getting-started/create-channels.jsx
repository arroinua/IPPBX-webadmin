var GSCreateChannelsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		profile: React.PropTypes.object,
		group: React.PropTypes.object,
		nextStep: React.PropTypes.func,
		prevStep: React.PropTypes.func,
		closeGS: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			users: []
		};
	},

	componentWillMount: function() {
		
	},

	_nextStep: function() {
		console.log('_nextStep >>>');
		this.props._nextStep();
	},

	_onServiceSelect: function(channelName, e) {
		e.preventDefault();
		this.props.closeGS(true);
		window.location.hash = '#chattrunk/chattrunk?channel='+channelName;
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div className="gs-step">
				<div className="row">
					<div className="col-xs-12">
						<div className="gs-step-head">
							<img src="/badmin/images/omnichannel.png" />
						</div>
						<div className="gs-step-body">
							<h3>{frases.GET_STARTED.CONNECT_CHANNELS.TITLE}</h3>
							<GSCreateChannelContComponent>
								<GSCreateChannelItemComponent
									title={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.MESSENGER.TITLE}
									desc={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.MESSENGER.DESC}
									onClick={this._onServiceSelect.bind(this, 'FacebookMessenger')}
								/>
								<GSCreateChannelItemComponent
									title={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.DID.TITLE}
									desc={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.DID.DESC}
									onClick={this._onServiceSelect.bind(this, 'Telephony')}
								/>
								<GSCreateChannelItemComponent
									title={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.EMAIL.TITLE}
									desc={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.EMAIL.DESC}
									onClick={this._onServiceSelect.bind(this, 'Email')}
								/>
								<GSCreateChannelItemComponent
									title={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.VIBER.TITLE}
									desc={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.VIBER.DESC}
									onClick={this._onServiceSelect.bind(this, 'Viber')}
								/>
								<GSCreateChannelItemComponent
									title={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.TELEGRAM.TITLE}
									desc={frases.GET_STARTED.CONNECT_CHANNELS.CHANNELS.TELEGRAM.DESC}
									onClick={this._onServiceSelect.bind(this, 'Telegram')}
								/>
							</GSCreateChannelContComponent>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

GSCreateChannelsComponent = React.createFactory(GSCreateChannelsComponent);

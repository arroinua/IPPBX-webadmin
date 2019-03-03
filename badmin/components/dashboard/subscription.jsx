function SubscriptionOverviewComponent(props) {
	var data = props.data;
	var plan = data.plan;
	var frases = props.frases;
	var nextBillingDate = plan.planId === 'trial' ? data.trialExpires : data.nextBillingDate;

	console.log('SubscriptionOverviewComponent: ', props, data);

	return (
		<div className="row">
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: plan.name, desc: frases.BILLING.CURRENT_PLAN }} /></div>
			{
				plan.planId !== 'free' ? (
					<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: moment(nextBillingDate).format('DD/MM/YY'), desc: ((plan.planId === 'trial') ? frases.BILLING.TRIAL_EXPIRES.toUpperCase() : frases.BILLING.NEXT_CHARGE) }} /></div>
				) : null
			}
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: (data.users + "/" + data.maxusers), desc: frases.BILLING.AVAILABLE_LICENSES.USERS }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: (convertBytes(data.storesize, 'Byte', 'GB').toFixed(1) + "/" + convertBytes(data.storelimit, 'Byte', 'GB').toFixed(1)), desc: frases.BILLING.AVAILABLE_LICENSES.STORAGE }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: data.maxlines, desc: frases.BILLING.AVAILABLE_LICENSES.LINES }} /></div>
			<div className="col-xs-6 col-md-2"><SingleIndexAnalyticsComponent  params={{ index: (props.credits ? props.credits.balance : 0).toFixed(1), desc: (frases.BILLING.CALL_CREDITS+', '+plan.currency) }} /></div>
		</div>
	)
}
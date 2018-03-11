function DidRestrictionsComponent(props) {

	return (
		<div className="alert alert-warning" role="alert">
			<p>{props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG1}:</p>
			<ol>
				{
					props.list.map(function(item, index) {
						return <li key={index}>{ props.frases.CHAT_TRUNK.DID.RESTRICTIONS[item] }</li>
					})
				}
			</ol>
			<p>{props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG2}</p>
			<p>{props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG3}</p>
			<p>{props.frases.CHAT_TRUNK.DID.RESTRICTIONS_MSG4}</p>
		</div>
	);
}

DidRestrictionsComponent = React.createFactory(DidRestrictionsComponent);

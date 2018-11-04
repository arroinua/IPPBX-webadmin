function CustomerPrivacyPrefs(props) {

	var frases = props.frases;
	var params = props.params;

	return (
		<div>
			<dl className="dl-horizontal">
				<dt>{frases.CUSTOMERS.PRIVACY_PREFS.LAWFUL_BASIS}</dt>
				<dd>{frases.CUSTOMERS.PRIVACY_PREFS.LAWFUL_BASES[(params.basis ? params.basis.toString() : "")]}</dd>
			</dl>
			<dl className="dl-horizontal">
				<dt>{frases.CUSTOMERS.PRIVACY_PREFS.CREATED_BY}</dt>
				<dd>{params.userid}</dd>
			</dl>
			<dl className="dl-horizontal">
				<dt>{frases.CUSTOMERS.PRIVACY_PREFS.FILE}</dt>
				<dd><a href={"/"+params.fileid} target="_blanc">{params.fileid}</a></dd>
			</dl>
			<dl className="dl-horizontal">
				<dt>{frases.CUSTOMERS.PRIVACY_PREFS.CREATED}</dt>
				<dd>{new Date(params.created).toLocaleString()}</dd>
			</dl>
		</div>
	)
}
function UsersRegHistoryMainComponent(props) {

	return (
		<div>
			{
				props.fetching ? (
					<Spinner />
				) : (props.data.length ? (
					<div>
						<UsersRegHistoryTotalsComponent frases={props.frases} data={props.data} />
						<UsersRegHistoryTableComponent frases={props.frases} data={props.data} />
					</div>
				) : (
					<PanelComponent>
						<h5>{props.frases.REG_HISTORY.NO_DATA}</h5>
					</PanelComponent>
				))
			}
					
		</div>
	);
}
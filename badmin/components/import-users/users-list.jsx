function ImportUsersListComponent(props) {

	var frases = props.frases;

	function onSelect(item, user) {
		props.onSelect(item.value, user);
	}

	return (
    	<div className="table-responsive" style={{ overflow: "visible" }}>
    		<table className="table table-hover sortable">
    			<thead>
    				<tr>
                        <th style={{minWidth: "100px"}}></th>
                        <th>{frases.NAME}</th>
                        <th>{frases.USERNAME}</th>
    					<th style={{minWidth: "100px"}}>{frases.DESCRIPTION}</th>
    				</tr>
    			</thead>
    			<tbody>
    				{
    					props.externalUsers ? (props.externalUsers.map(function(user, index) {
    						return (
    							<tr key={index}>
    								{
    									user.ext ? (
    										<td><span>{user.ext}</span> { user.new ? <a href="#" onClick={function() { return props.onDeselect(index) }}>{frases.CANCEL}</a> : null }</td>
    									) : (
    										(props.usersList && props.currentIndex === index) ? (
    											<td>
	    											<Select3 
												    	options={props.usersList} 
												    	onChange={function(item) { return onSelect(item, index) }}
												    	placeholder={"Select user or extension"}
												    	onMenuClose={props.clearList}
	    											/>
	    										</td>
    										) : (
    											<td style={{ verticalAlign: "top" }}>
    											    <div className="btn-group" style={{ position: "absolute" }}>
    											      <a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-plus-circle fa-fw fa-lg"></i> {frases.ADD}</a>
    											      <ul className="dropdown-menu">
    											        <li><a href="#" onClick={function(){ props.setList(index, 1) }}>{frases.CREATE_NEW_USER}</a></li>
    											        <li><a href="#" onClick={function(){ props.setList(index, 0) }}>{frases.ASSOCIATE_WITH_USER}</a></li>
    											      </ul>
    											    </div>
    											</td>
    										)
    									)
    								}
		                            <td><span className="ellipsis" title={(user.cn || user.name) + (user.uid ? (" ("+user.uid+") ") : "")}>{(user.cn || user.name) + (user.uid ? (" ("+user.uid+") ") : "")}</span></td>
		                            <td>{user.login}</td>
		    						<td>{user.attributes.description}</td>
		    					</tr>
    						)
    					})) : null
    				}
    			</tbody>
            </table>
    	</div>
	)

}
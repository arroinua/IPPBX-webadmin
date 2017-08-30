function StorageUsageComponent(props) {

	var frases = props.frases;
	var data = props.data;
	var storesize = props.utils.convertBytes(props.data.storesize, 'Byte', 'GB');
	var storelimit = props.utils.convertBytes(props.data.storelimit, 'Byte', 'GB');

	return (
		<div className="panel">
			<div className="panel-header">
				<span>{frases.USAGE.PANEL_TITLE}</span>
			</div>
			<div className="panel-body">
				<div className="row" style={{ textAlign: "center" }}>
			        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
			        	<h3><small>{frases.USAGE.USERS.CREATED}</small> { data.users } <small>{frases.USAGE.USERS.FROM}</small></h3>
			        	<h3>{ data.maxusers }</h3>
			            <p>{frases.USAGE.USERS.USAGE_ITEM}</p>
			        </div>
			        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
			        	<h3><small>{frases.USAGE.STORAGE.USED}</small> { parseFloat(storesize).toFixed(2) } <small>{frases.USAGE.STORAGE.FROM}</small></h3>
			            <h3>{ parseFloat(storelimit).toFixed(2) }</h3>
			            <p>{frases.USAGE.STORAGE.USAGE_ITEM}</p>
			        </div>
			        <div className="col-xs-12 col-sm-4" style={{ marginBottom: "20px" }}>
			        	<h3><small>{frases.USAGE.LINES.AVAILABLE}</small></h3>
			            <h3>{ data.maxlines }</h3>
			            <p>{frases.USAGE.LINES.USAGE_ITEM}</p>
			        </div>
			    </div>
			</div>
		</div>	    
	);
}
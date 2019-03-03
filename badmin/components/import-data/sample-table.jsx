function ImportCsvSelectColumnsTable(props) {

	function _getItemRow(items) {
		return items.map(function(item) {
			return (
				<td key={item}>{item}</td>
			)
		})
	}

	function _getColumnsListOptions(list) {
		return list.map(function(item) {
			return <option key={item} value={item}>{item}</option>
		});
	}

	return (
		<div className="table-responsive" style={{ maxHeight: "200px", overflow: "auto" }}>
		    <table className="table table-bordered">
		        <thead>
		        	<tr>
		        		{
		        			props.columnsList ? (
		        				(props.rows[0] || []).map(function(item, index) {
		        					return (
		        						<th key={item}>
		        							<select className="form-control" value={props.selectedColumns[index]} onChange={function(e) { props.onColumnsSelect(e, index) }}>
		        								<option value="">{props.frases.IMPORT_DATA.SELECT_PARAMETER_OPTION}</option>
		        								{_getColumnsListOptions(props.columnsList)}
		        							</select>
		        						</th>
		        					)
		        				})
		        			) : null
			                	
		                }
		        	</tr>
		            <tr>
		                {
		                	props.showHeader !== false ? (
		                		(props.rows[0] || []).map(function(item) {
		                			return (
		                				<th key={item}>{item}</th>
		                			)
		                		})
		                	) : null
			                	
		                }
		            </tr>
		        </thead>
		        <tbody style={{ fontSize: "12px" }}>
		        	{
		        		props.rows.map(function(item, index){
		        			if((props.showHeader !== false && index === 0) || (index > props.maxRows)) return null;
		        			return (
		        				<tr key={index.toString()}>
		        					{_getItemRow(item)}
		        				</tr>

		        			);

		        		}.bind(this))
		        	}
		        </tbody> 
		    </table>
		</div>
	)
}
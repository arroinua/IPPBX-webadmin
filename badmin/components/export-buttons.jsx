function ExportButtons(props) {

	function excelHandler() {
		console.log('excelHandler', document.getElementById(props.id));
		return ExcellentExport.excel(this, props.id, 'report');
	}
	function csvHandler() {
		return ExcellentExport.csv(this, props.id);
	}

	return (
		<div>
		    <span>{props.frases.EXPORT}:</span>
		    <a href="#" style={{ margin: '7px' }} className="btn btn-default btn-sm" download={props.frases.REPORT + '.xls'} onClick={excelHandler}>.xls</a>
		    <a href="#" style={{ margin: '7px' }} className="btn btn-default btn-sm" download={props.frases.REPORT + '.csv'} onClick={csvHandler}>.csv</a>
		</div>
	);
}

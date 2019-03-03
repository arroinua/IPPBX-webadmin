function ImportCsvOptionsComponent(props) {

	var frases = props.frases;
	var options = props.options;

	return (
		<form className="form-horizontal">
			<div className="form-group">
			    <label className="col-sm-4 control-label">{frases.IMPORT_DATA.OPTIONS.ENCODING}</label>
			    <div className="col-sm-4">
			        <select name="encoding" value={ options.encoding } onChange={ props.onOptionsChange } className="form-control">
			        	{
			        		props.encodings.map(function(item, index) {
			        			return (
			        				<option key={index.toString()} value={item}>{item}</option>
			        			)
			        		})
			        	}
			        </select>
			    </div>
			</div>
			<div className="form-group">
				<label className="col-sm-4 control-label">{frases.IMPORT_DATA.OPTIONS.DELIMITER}</label>
				<div className="col-sm-4">
			        <div className="btn-group" data-toggle="buttons">
			        	{
			        		props.delimiters.map(function(item) {
			        			return (
			        				<label key={item.label} className={"btn btn-default " + (options.delimiter === item.value ? 'active' : '')} onClick={ function() {props.onDelimiterClick(item.value)} }>
			        				  <input type="radio" name="delimiter" autoComplete="off" checked={options.delimiter === item.value} /> {item.label}
			        				</label>
			        			)
			        		})
			        	}
			        </div>
			    </div>
			</div>
			<div className="form-group">
				<div className="col-sm-offset-4 col-sm-8">
				    <div className="checkbox">
				        <label>
				            <input type="checkbox" name="hasHeader" checked={ options.hasHeader } onChange={ props.onOptionsChange } /> {frases.IMPORT_DATA.OPTIONS.HAS_HEADER}
				        </label>
				    </div>
				</div>
			</div>
		</form>
	)
}
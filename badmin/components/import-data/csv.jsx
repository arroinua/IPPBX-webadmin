var ImportCsvDataComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		onErrorState: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			errors: [],
			selectedService: null,
			fileDragged: false,
			file: null,
			fileStr: null,
			parseResult: null,
			issues: [],
			showIssues: false,
			columnsList: ['name', 'email', 'phone', 'organization', 'position', 'address'],
			columns: [],
			options: {
				encoding: 'UTF-8',
				delimiter: ',',
				hasHeader: true
			},
			encodings: ['UTF-8', 'Windows-1251'],
			delimiters: [{ value: ',', label: ',' }, { value: ';', label: ';' }, { value: ' ', label: 'space'}, { value: '\t', label: 'tab' }],
			maxRows: 20
		};
	},

	_setParmas: function(params) {
		// var data = [].concat(this.state.parseResult);
		// if(this.state.hasHeader) data.splice(0, 1);
		this.props.onChange(params);
	},

	_setErrorState: function(errors) {
		this.setState({ errors: errors, file: null, fileStr: null, parseResult: null });
		this.props.onErrorState(errors);
	},

	_checkErrorState: function(file) {
		var errors = [];
		if(file && file.type !== 'text/csv') errors.push('wrongFormat');
		if(file && file.size > 2000000) errors.push('wrongSize');
		return errors;
	},

	_onFileDragOver: function(e) {
		this.setState({ fileDragged: true });
		e.preventDefault();
	},

	_onFileDragEnter: function() {
		this.setState({ fileDragged: true });
	},

	_onFileDragLeave: function() {
		this.setState({ fileDragged: false });
	},

	_onFileDrop: function(e) {
		e.preventDefault();
		var file = null;
		var parsedCsv = [];
		var delimiter = this.state.options.delimiter;

		if(e.dataTransfer.items) {
			file = e.dataTransfer.items[0];
			file = file.kind === 'file' ? file.getAsFile() : null;
		} else {
			file = e.dataTransfer.files[0];
		}

		if(file) {
			this.setState({ file: file });
			this._readFile(file, { encoding: this.state.options.encoding });
		}

		console.log('_onFileDrop: ', file);

		this._removeDragData(e);
		this._onFileDragLeave();
	},

	_onFileSelect: function(e) {
        var input = e.target;
        var filelist = input.files;
        var file = filelist[0];
		
		console.log('_onFileSelect: ', file);

        this.setState({ file: file });
        if(!file) return;
        this._readFile(file, { encoding: this.state.options.encoding });
	},

	_readFile: function(file, params) {
		var options = extend({}, this.state.options);
		var rows = [];
		var errors = this._checkErrorState(file);

		if(errors.length) return this._setErrorState(errors);

		readFile(file, params, function(err, result) {
            if(err) console.error('readFiles error', err);
            console.log('readFiles result', result);
            
            rows = result.split(/\r\n|\n/);
            options.delimiter = this._guessDelimiter(rows[0], this.state.delimiters.map(function(item) { return item.value; }));

            this.setState({ fileStr: result, options: options });
			this._parseString(result, options.delimiter);

            // importCustomers(['name', 'email', 'phone'], parseAsCsv(result, ';', 3));
            
        }.bind(this))
	},

	_parseString: function(str, delimiter) {
		var parsed = parseAsCsv(str, delimiter);
		this.setState({ parseResult: parsed, issues: this._getIssues(parsed) });
		this._setParmas({ data: parsed });
	},

	_guessDelimiter: function(str, options) {
        var results = [];
        var max; 
        var maxIndex;

        options.forEach(function(delimiter, index) {
            results[index] = str.split(delimiter).length;
        });

        max = Math.max.apply(null, results);
        maxIndex = results.indexOf(max);

        return options[maxIndex];
    },

	_getIssues(result) {
		var numColumns = (result ? result[0] : []).length;
		return result.filter(function(item) {
			return item.length !== numColumns;
		});
	},

	_removeDragData: function(e) {
		if (e.dataTransfer.items) {
		    e.dataTransfer.items.clear();
		} else {
		    e.dataTransfer.clearData();
		}
	},

	_onOptionsChange: function(e) {
		var options = extend({}, this.state.options);
		var target = e.target;
		var name = target.name;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;
		var data = [];

		options[name] = type === 'number' ? parseFloat(value) : value;

		this.setState({ options: options });

		console.log('_onOptionsChange: ', name, value);

		if(this.state.fileStr) {
			if(name === 'encoding') {
				setTimeout(function() {
					this._readFile(this.state.file, { encoding: value });
				}.bind(this), 100);
			} else if(name === 'hasHeader') {
				data = [].concat(this.state.parseResult);
				if(value) data.splice(0, 1);
				this._setParmas({ data: data });
			}
		}
	},

	_onDelimiterClick: function(value) {
		var options = extend({}, this.state.options);
		this.setState({ options: options });
		this._parseString(this.state.fileStr, value);
	},

	_onColumnsSelect: function(e, index) {
		var value = e.target.value;
		var columns = [].concat(this.state.columns);
		if(index > columns.length) columns.length = index+1;
		columns[index] = value;

		this.setState({ columns: columns });
		this._setParmas({ columns: columns });
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<p style={{ margin: "10px 0" }}><strong>{frases.IMPORT_DATA.STEP_1}</strong></p>
						<div 
							className={"dragndrop-area " + (this.state.fileDragged ? 'dragged' : '')} 
							onDrop={this._onFileDrop} 
							onDragOver={this._onFileDragOver} 
							onDragEnter={this._onFileDragEnter} 
							onDragLeave={this._onFileDragLeave}
						>
							<p>{this.state.file ? this.state.file.name : (this.state.fileDragged ? frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_1 : frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_2)}</p>
							<p><strong>{frases.IMPORT_DATA.DRAG_AND_DROP_SUBTITLE}</strong></p>
							<p><input type="file" accept="text/csv" onChange={this._onFileSelect} /></p>
							<p className="text-muted"><em>{frases.IMPORT_DATA.DRAG_AND_DROP_INFO}</em></p>
						</div>
					</div>
				</div>
				{
					this.state.errors ? (
						<div className="row">
							<div className="col-xs-12" style={{ margin: "10px 0" }}>
							{
								this.state.errors.map(function(item) {
									return (
										<p key={item} className="text-danger">{frases.IMPORT_DATA.ERRORS[item]}</p>
									)
								})
							}
							</div>
						</div>
					) : null
				}
				{
					(this.state.file && this.state.parseResult) ? (
						<div className="row">
							<div className="col-xs-12">
								<p style={{ margin: "10px 0" }}><strong>{frases.IMPORT_DATA.STEP_2}</strong></p>
								<ImportCsvOptionsComponent 
									frases={frases}
									options={this.state.options}
									encodings={this.state.encodings}
									delimiters={this.state.delimiters}
									onOptionsChange={this._onOptionsChange}
									onDelimiterClick={this._onDelimiterClick}
								/>
							</div>
							<div className="col-xs-12">
								<p style={{ margin: "10px 0" }}><strong>{frases.IMPORT_DATA.STEP_3}</strong></p>
								<p>
									<span>{frases.IMPORT_DATA.RECORDS}:</span> <strong>{this.state.parseResult.length}</strong>
									{
										this.state.issues.length && (
											<button type="button" className="btn btn-link" onClick={function() { this.setState({ showIssues: !this.state.showIssues }) }.bind(this)}>{this.state.showIssues ? frases.IMPORT_DATA.SHOW_SAMPLE_BTN : (frases.IMPORT_DATA.SHOW_ISSUES_BTN + " (" + this.state.issues.length + ")")}</button>
										)
									}
								</p>
								{
									this.state.showIssues ? (
										<div>
											<div className="alert alert-warning" role="alert">
												<span>{frases.IMPORT_DATA.ISSUES_WARNING}</span>
											</div>
											<ImportCsvSelectColumnsTable 
												frases={frases}
												rows={this.state.issues} 
												showHeader={false} 
											/>
										</div>
									) : (
										<div>
											<div className="alert alert-info" role="alert">
												<span>{frases.IMPORT_DATA.STEP_3_DESC}</span>
											</div>
											<ImportCsvSelectColumnsTable 
												frases={frases}
												rows={this.state.parseResult} 
												showHeader={this.state.options.hasHeader} 
												columnsList={this.state.columnsList} 
												selectedColumns={this.state.columns}
												onColumnsSelect={this._onColumnsSelect} 
												maxRows={this.state.maxRows} 
											/>
										</div>
									)
								}
							</div>
						</div>
					) : null
				}
			</div>
		);
	}
	
});

ImportCsvDataComponent = React.createFactory(ImportCsvDataComponent);


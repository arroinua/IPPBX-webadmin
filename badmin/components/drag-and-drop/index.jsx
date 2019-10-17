var DragAndDropComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onErrorState: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			errors: [],
			fileDragged: false,
			file: null,
			filename: null,
			fileStr: null,
			allowedTypes: [],
			maxSize: 5000000
		};
	},

	componentWillMount: function() {
		var state = extend({}, this.state);

		if(this.props.params) {
			state = extend(state, this.props.params);
			this.setState(state);
		}
	},

	_setErrorState: function(errors) {
		this.setState({ errors: errors, file: null, fileStr: null });
		if(this.props.onErrorState) this.props.onErrorState(errors);
	},

	_checkErrorState: function(file) {
		var errors = [];
		var fileExt = this._getFileExtension(file.name);

		if(file && this.state.allowedTypes.length && this.state.allowedTypes.indexOf(file.type) === -1 && this.state.allowedTypes.indexOf(fileExt) === -1) errors.push('wrongFormat');
		if(file && file.size > this.state.maxSize) errors.push('wrongSize');
		return errors;
	},

	_onFileDragOver: function(e) {

		this.setState({ fileDragged: true });
		e.preventDefault();
	},

	_onFileDragEnter: function(e) {

		this.setState({ fileDragged: true });
	},

	_onFileDragLeave: function() {
		this.setState({ fileDragged: false });
	},

	_onFileDrop: function(e) {
		e.preventDefault();
		var file = null;
		var errors = [];

		if(e.dataTransfer.items) {
			file = e.dataTransfer.items[0];
			file = file.kind === 'file' ? file.getAsFile() : null;
		} else {
			file = e.dataTransfer.files[0];
		}

		if(file) {
			errors = this._checkErrorState(file);
			if(errors.length) this._setErrorState(errors);
			else {
				this.setState({ file: file, filename: file.name, errors: [] });
				this.props.onChange(file);
			}
		}

		this._removeDragData(e);
		this._onFileDragLeave();
	},

	_onFileSelect: function(params) {
        // var input = e.target;
        // var filelist = input.files;
        // var file = filelist[0];
        var file = params.file;
		
		this.props.onChange(file);
        this.setState({ file: file, filename: file.name });
	},

	_removeDragData: function(e) {
		if (e.dataTransfer.items) {
		    e.dataTransfer.items.clear();
		} else {
		    e.dataTransfer.clearData();
		}
	},

	_getFileExtension: function(fileName) {
		return ('.'+fileName.split('.')[1]);
	},

	render: function() {
		var frases = this.props.frases;
		var touchDevice = isTouchDevice();

		return (
			<div>
				{
					touchDevice ? (
						<FileUpload frases={frases} onChange={this._onFileSelect} accept={this.state.allowedTypes.join(',')} />
					) : (
						<div 
							className={"dragndrop-area " + (this.state.fileDragged ? 'dragged' : '')} 
							onDrop={this._onFileDrop} 
							onDragOver={this._onFileDragOver} 
							onDragEnter={this._onFileDragEnter} 
							onDragLeave={this._onFileDragLeave}
						>
							<p>{this.state.filename ? this.state.filename : (this.state.fileDragged ? frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_1 : frases.IMPORT_DATA.DRAG_AND_DROP_TITLE_2)}</p>
							<p><strong>---</strong></p>
							<FileUpload frases={frases} accept={this.state.allowedTypes.join(',')} onChange={this._onFileSelect} options={{ noInput: true }} />
						</div>		
					)
				}
				
				{
					this.state.errors.length ? (
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
			</div>
				
		);
	}
	
});

DragAndDropComponent = React.createFactory(DragAndDropComponent);


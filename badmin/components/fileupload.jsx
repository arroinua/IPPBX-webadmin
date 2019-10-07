var FileUpload = React.createClass({
  
	propTypes: {
		frases: React.PropTypes.object,
		value: React.PropTypes.string,
		name: React.PropTypes.string,
		accept: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	componentWillMount: function() {
		this.setState({
			value: this.props.value || ''
		});		
	},

	_onClick: function(e) {
		var target = e.target;
		target.nextSibling.click();
	},

	_onClear: function() {
		this.setState({
			value: ""
		});

		this.props.onChange({
			name: this.props.name,
			filename: "",
			file: null
		});
	},

	_onFileSelect: function(e) {
		var filename;
		var files = e.target.files;
		var file = files[0];
		if(file){
		    filename = this._getFileName(file.name);
		} else{
		    filename = '';
		}

		this.setState({
			value: filename
		});

		this.props.onChange({
			name: e.target.name,
			filename: filename,
			file: file
		});
		// this.props.onChange(e);
	},

	_getFileName: function(ArrayOrString){
	    if(ArrayOrString !== null) {
	        var name = '';
	        if(Array.isArray(ArrayOrString)){
	            ArrayOrString.forEach(function(file, index, array){
	                name += ' '+file;
	                if(index !== array.length-1) name += ',';
	            });
	        } else {
	            name = ' '+ArrayOrString;
	        }
	        return name.trim();
	    }
	    return '';
	},
  
	render: function() {
		return (
			<div className="input-group">
				<input type="text" className="form-control" value={ this.state.value } readOnly />
				<span className="input-group-btn">
					<button className="btn btn-default" type="button" onClick={ this._onClear }><i className="fa fa-trash"></i></button>
					<button className="btn btn-default" type="button" onClick={ this._onClick }>{this.props.frases.UPLOAD}</button>
					<input 
						type="file" 
						name={this.props.name}
						accept={this.props.accept || ''}
						onChange={ this._onFileSelect }
						style={{ position: 'absolute', display: 'inline-block', opacity: 0, width: 0 }} 
					/>
				</span>
			</div>
		);
	}

});

FileUpload = React.createFactory(FileUpload);

var FileUpload = React.createClass({
  
	propTypes: {
		value: React.PropTypes.string,
		name: React.PropTypes.string,
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

	_onFileSelect: function(e) {
		var filename;
		var files = e.target.files;
		if(files.length){
		    filename = this._getFileName(files[0].name);
		} else{
		    filename = '';
		}

		this.setState({
			value: filename
		});

		this.props.onChange(e);
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
	        return name;
	    }
	    return '';
	},
  
	render: function() {
		return (
			<div className="input-group">
				<input type="text" className="form-control" value={ this.state.value } readOnly />
				<span className="input-group-btn">
					<button className="btn btn-default" type="button" onClick={ this._onClick }>Upload</button>
					<input 
						type="file" 
						name={this.props.name}
						onChange={ this._onFileSelect }
						style={{ position: 'absolute', display: 'inline-block', opacity: 0, width: 0 }} 
					/>
				</span>
			</div>
		);
	}

});

FileUpload = React.createFactory(FileUpload);

var NumberTransformsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		type: React.PropTypes.string,
		transforms: React.PropTypes.array,
		onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			transforms: []
		};
	},

	componentWillMount: function() {
		this.setState({
			transforms: this.props.transforms || []
		});		
	},

	// componentWillReceiveProps: function(props) {
	// 	this.setState({
	// 		params: props.params
	// 	});
	// },

	_addRule: function(e) {
		var transforms = this.state.transforms;
		transforms.push({
			number: "",
			strip: false,
			prefix: ""
		});
		this.setState({ transforms: transforms });
	},

	_removeRule: function(index) {
		console.log("_removeRule: ,", index);
		var transforms = this.state.transforms;
		transforms.splice(index, 1);
		this.setState({
			transforms: transforms
		});
	},

	_onChange: function(index, e) {
		var transforms = this.state.transforms;
		var transform = transforms[index];
		var target = e.target;
		var type = target.getAttribute('data-type') || target.type;
		var value = type === 'checkbox' ? target.checked : target.value;

		// if(target.name === 'strip') {
		// 	if(value === 'P') {
		// 		if(this.props.type === 'inbounda') transform.prefix = 'P';
		// 		else transform.prefix = '';
		// 	} else {
		// 		transform.prefix = '';
		// 	}
		// }

		transform[target.name] = type === 'number' ? parseFloat(value) : value;

		console.log('_handleOnChange: ', transforms, value);

		this.setState({
			transforms: transforms
		});

		this.props.onChange(this._parseTransforms(transforms));
	},

	_parseTransforms: function(array) {
		return array.reduce(function(result, item) {
			if(item.number) {
				result.push({
					number: item.number,
					strip: item.strip,
					prefix: item.prefix
				});
				
				return result;

			}
		}, []);
	},

	render: function() {
		var frases = this.props.frases;

		return (
			<div className="row">
				<div className="col-sm-12">
					<div className="alert alert-info" role="alert">
						<button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<p><strong>{frases.NUMBER_TRANSFORMS.NUMBER_TRANSFORMS}</strong></p>
						<p>{frases.NUMBER_TRANSFORMS.HELPERS.NUMBER}</p>
						<p>{frases.NUMBER_TRANSFORMS.HELPERS.STRIP}</p>
						<p>{frases.NUMBER_TRANSFORMS.HELPERS.PREFIX}</p>
						<p>{frases.NUMBER_TRANSFORMS.HELPERS.DOLLAR}</p>
						<a href="#" className="alert-link">{frases.NUMBER_TRANSFORMS.HELPERS.LEARN_MORE_LINK}</a>
					</div>
				</div>
				<div className="col-sm-12">
					<div style={{ marginBottom: "10px" }}>
						<strong>{frases.NUMBER_TRANSFORMS[this.props.type.toUpperCase()]}</strong>
						<button type="button" className="btn btn-primary" style={{ marginLeft: "5px" }} onClick={this._addRule}>{frases.NUMBER_TRANSFORMS.ADD_RULE}</button>
					</div>
					<div className="table-responsive n-transforms-cont">
						<table className="table">
							<thead>
								<tr>
									<th>{frases.NUMBER}</th>
									<th><i className="fa fa-cut fa-rotate-90 fa-fw" title="Strip"></i></th>
									<th>{frases.PREFIX}</th>
								</tr>
							</thead>
							<tbody>
								{
									this.state.transforms.map(function(item, index) {
										return (
											<tr key={index}>
												<td>
											    	<input type="text" className="form-control" name="number" value={item.number} placeholder="Original number/prefix" onChange={this._onChange.bind(this, index)} />
										    	</td>
										    	<td className="text-center">
													<input type="checkbox" name="strip" autoComplete="none" checked={item.strip} onChange={this._onChange.bind(this, index)} />
											    </td>
											    <td>
											    	{
											    		item.strip !== 'P' ? (
												    		<input type="text" className="form-control" name="prefix" value={item.prefix} placeholder="Number/prefix to substitute" onChange={this._onChange.bind(this, index)} />
											    		) : ((this.props.type === 'inbounda') ? (
											    			<input type="text" className="form-control" name="prefix" value={item.prefix} placeholder="Exit code in format %NN (e.g. %63)" onChange={this._onChange.bind(this, index)} />
											    		) : null)
											    	}
												</td>
										    	<td>
										    		<button 
										    			type="button" 
										    			className="btn btn-link btn-default" 
										    			onClick={this._removeRule.bind(this, index)}
										    			style={{ padding: "0" }}
										    		><i className="fa fa-remove fa-fw"></i></button>
										    	</td>
										    </tr>
										)
									}.bind(this))
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
});

NumberTransformsComponent = React.createFactory(NumberTransformsComponent);

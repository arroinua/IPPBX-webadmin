var AvCodecRowComponent = React.createClass({

	propTypes: {
	    params: React.PropTypes.object,
	    onChange: React.PropTypes.func
	},

	_onChange: function(e) {
		var target = e.target;
		var params = this.props.params;
		var value = target.type === 'checkbox' ? target.checked : (target.type === 'number' ? parseFloat(target.value) : target.value);
		
		params[target.name] = value;
		this.props.onChange(params);
	},

	render: function() {
		var params = this.props.params;

		return (
			<tr>
				<td className="draggable">
					<i className="fa fa-ellipsis-v"></i>
				</td>
				<td className="codec-name" data-codec={params.codec}>
					{params.codec}
				</td>
				<td>
					<input type="number" name="frame" className="form-control codec-frames" value={params.frame} onChange={this._onChange} />
				</td>
				<td>
					<input type="checkbox" name="enabled" checked={params.enabled} className="codec-enabled" onChange={this._onChange} />
				</td>
			</tr>
		)		
	}
		
});

AvCodecRowComponent = React.createFactory(AvCodecRowComponent);
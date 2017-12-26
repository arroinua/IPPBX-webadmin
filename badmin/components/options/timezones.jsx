var TimeZonesComponent = React.createClass({

	propTypes: {
		timezone: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	shouldComponentUpdate: function(nextProps, nextState){
	    return this.props.timezone !== nextProps.timezone;
	},
	
	render: function() {
		var tzones = moment.tz.names() || [];

		return (
			<select name="timezone" className="form-control" value={this.props.timezone} onChange={this.props.onChange}>
				{
					tzones.map(function(item) {
						return <option key={item} value={item}>{item}</option>
					})
				}
			</select>
		)
	}
});

TimeZonesComponent = React.createFactory(TimeZonesComponent);
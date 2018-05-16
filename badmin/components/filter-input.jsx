 var FilterInputComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object, 
		items: React.PropTypes.array,
		onChange: React.PropTypes.func
	},

	_filter: function(e) {
		var query = e.target.value.toLowerCase(),
			items = this.props.items,
			match = null, 
			value = null,
			filteredItems = [];
			
		filteredItems = items.filter(function(item) {
			match = false;
			Object.keys(item).forEach(function(key) {
				value = item[key] ? item[key].toString() : null;
				if(value && value.toLowerCase().indexOf(query) !== -1 ) match = true; 
			});
			return match;
		});

		this.props.onChange(filteredItems);
	},

	render: function() {
		var frases = this.props.frases;

		return (
		    <div className="form-group has-feedback pull-right">
                <input type="text" className="form-control" placeholder={frases ? frases.SEARCH : "Search"} onChange={this._filter} />
                <i className="fa fa-search fa-fw form-control-feedback"></i>
            </div>
		);
	}
});

FilterInputComponent = React.createFactory(FilterInputComponent);

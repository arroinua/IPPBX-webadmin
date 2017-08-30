var Select3Menu = React.createClass({

	render: function() {
		return (
		    <ul ref={this.props.getMenuRef}>
			    { this.props.options.map(function(item, index) {
					return ( 
						<Select3MenuOption 
							key={"option-"+index+"-"+item.value} 
							onClick={this.props.onClick} 
							value={item.value} 
							label={item.label} 
							index={index} 
							selected={this.props.selectedIndex === index}
						/>
					);

			    }.bind(this)) }
		    </ul>
		)
	}
});

Select3Menu = React.createFactory(Select3Menu);
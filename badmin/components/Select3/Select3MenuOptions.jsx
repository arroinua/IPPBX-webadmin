var Select3MenuOption = React.createClass({
  
  selectValue: function(e) {
    e.preventDefault();
    this.props.onClick({value: this.props.value, label: this.props.label}, this.props.index);
  },
  
  render: function() {
    return (
    	<li>
    		<a 
    			href="#" 
    			className={this.props.selected ? 'is-selected' : ''} 
    			onClick={this.selectValue}>{this.props.label}
    		</a>
    	</li>
    );
  }

});

Select3MenuOption = React.createFactory(Select3MenuOption);

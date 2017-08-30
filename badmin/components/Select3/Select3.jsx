var Select3 = React.createClass({

  propTypes: {
    name: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    value: React.PropTypes.object,
    options: React.PropTypes.array,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      value: {},
      options: []
    };
  },

  getInitialState: function() {
    return {
      menuOpened: false,
      value: {},
      highlightedIndex: 0,
      selectedIndex: 0,
      options: []
    };
  },
  
  componentWillMount: function() {
    this.setState({
      value: this.props.value,
      options: this.props.options
    });

  },

  componentWillReceiveProps: function(newProps) {
    console.log('componentWillReceiveProps: ', newProps);
    this.setState({
      value: newProps.value
    });
  },
    
  openMenu: function() {
    this.setState({
      menuOpened: true,
      options: this.props.options,
      highlightedIndex: this.state.selectedIndex
    });

    window.setTimeout(function(){
      this.focusOnSelected(this.state.selectedIndex);
    }.bind(this), 10);
  },
  
  closeMenu: function() {
    window.setTimeout(function(){
      this.setState({
        menuOpened: false
      });

    }.bind(this), 10);
    
  },

  onKeyDown: function(e) {
    var code = e.key;

    if(code === 'Enter') {
      this.selectValue(this.state.options[this.state.highlightedIndex], this.state.highlightedIndex);
      this.closeMenu();

    } else if(code === 'Escape') {
      this.closeMenu();

    } else if(code === 'Tab') {
      return false;

    } else {
      if(!this.state.menuOpened && this.state.options.length) {
        this.openMenu();
        this.selectIndex(this.state.highlightedIndex);
      } else {
        if(code === 'ArrowDown') this.selectIndex(this.state.highlightedIndex + 1);
        else if(code === 'ArrowUp') this.selectIndex(this.state.highlightedIndex - 1);
      }
    }
  },

  onSelected: function(el) {
    if(el) {
      this.selectedOptionEl = el;
    }
  },

  getMenuRef: function(el) {
    if(el) {
      this.menuEl = el;
    }
  },

  focusOnSelected: function(index) {

    var menuDOM = ReactDOM.findDOMNode(this.menuEl);
    var focusedDOM = menuDOM.firstChild;
    var offset;

    if(!focusedDOM) return;

    offset = focusedDOM.clientHeight*(index+1);

    if (offset > menuDOM.offsetHeight) {
      menuDOM.scrollTop = offset + focusedDOM.clientHeight - menuDOM.offsetHeight;
    } else {
      menuDOM.scrollTop = 0;
    }
  },

  filterList: function(value) {
    if(value === '') return this.setState({ options: this.props.options });
    
    var list = this.props.options;
    var filtered = list.filter(function(item) {
      return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    
    return this.setState({ options: filtered });
  },
  
  selectIndex: function(index) {
    if(index < 0) index = this.state.options.length-1;
    else if(index > this.state.options.length-1) index = 0;

    this.setState({ highlightedIndex: index });
    this.focusOnSelected(index);

  },
  
  setValue: function(value) {
    console.log('the value is: ', value);   
    this.setState({ value: value});
    if(this.props.onChange) 
      this.props.onChange(value);

  },
  
  selectValue: function(item, index) {
    var item = item || { value: this.state.value.value, label: this.state.value.label };
    this.setValue(item);
    this.setState({
      selectedIndex: item ? index : 0,
      menuOpened: false
    });

  },
  
  changeValue: function(e) {
    var tvalue = e.target.value;

    this.filterList(tvalue);
    this.setValue({ value: tvalue, label: tvalue });
  },

  render: function() {
    var className = "Select3 Select3-cont";
    className += (this.state.menuOpened ? " is-opened" : "");
    className += (this.props.className ? " "+this.props.className : "");

    // console.log('Select3 render: ', this.props, this.state);

    return (
      <div className={className}>
        <input 
          type="text" 
          name={ this.props.name ? this.props.name : '' } 
          placeholder={ this.props.placeholder ? this.props.placeholder : '' } 
          className="Select3-input" 
          value={this.state.value.label} 
          onFocus={this.openMenu} 
          onBlur={this.closeMenu} 
          onChange={this.changeValue} 
          onKeyDown={this.onKeyDown} 
        />
        
        { this.state.menuOpened ?
          <div className="Select3-menu-list">
              <Select3Menu 
                getMenuRef={this.getMenuRef}
                onClick={this.selectValue} 
                onSelected={this.onSelected} 
                selectedIndex={this.state.highlightedIndex} 
                options={this.state.options} 
              />
          </div>
        : null}
      </div>    
     )
  }
});

Select3 = React.createFactory(Select3);

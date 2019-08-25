var DatePickerComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		params: React.PropTypes.object,
		onClick: React.PropTypes.func,
		actionButton: React.PropTypes.bool
	},

	dropdown: null,
	cfrom: null,
	cto: null,
	cfromRome: null,
	ctoRome: null,

	getInitialState: function() {
		return {
			open: false,
			currRange: 'today',
			currInterval: 'hour',
			interval: false,
			actionButton: true,
			buttonSize: 'sm',
			buttonColor: 'default',
			date: {},
			ranges: [],
			intervals: []
		};
	},

	componentWillMount: function() {
		var frases = this.props.frases;
		var ranges = [
			{
				label: frases.DATE_PICKER.TODAY,
				value: "today"
			}, {
				label: frases.DATE_PICKER.YESTERDAY,
				value: "yesterday"
			}, {
				label: frases.DATE_PICKER.LAST_7_DAYS,
				value: "week"
			}, {
				label: frases.DATE_PICKER.LAST_30_DAYS,
				value: "30_days"
			}, {
				label: frases.DATE_PICKER.LAST_60_DAYS,
				value: "60_days"
			}, {
				label: frases.DATE_PICKER.CUSTOM_RANGE,
				value: "custom"
			},
		];
		var intervals = [
			{
				label: (15 + frases.MIN),
				value: "1/4_hour"
			}, {
				label: (30 + frases.MIN),
				value: "1/2_hour"
			}, {
				label: frases.HOUR,
				value: "hour"
			}, {
				label: frases.DAY,
				value: "day"
			}
		];

		this.setState({ ranges: ranges, intervals: intervals });
		this._setCurrentRange(this.state.currRange, true);
	},

	componentDidMount: function() {
		// document.body.addEventListener('click', this._onWindowClick);
		var cfrom = this.cfrom;
		var cto = this.cto;

		this.cfromRome = rome(cfrom, {
            time: false,
            inputFormat: 'DD/MM/YY',
            dateValidator: rome.val.beforeEq(cto)
        }).setValue(Date(this.state.date.end));
        
        this.ctoRome = rome(cto, {
            time: false,
            inputFormat: 'DD/MM/YY',
            dateValidator: rome.val.afterEq(cfrom)
        }).setValue(Date(this.state.date.from));

        cfrom.value = moment(this.state.date.from).format('DD/MM/YY');
        cto.value = moment(this.state.date.to).format('DD/MM/YY');
	},

	// componentWillUnmount: function() {
	// 	document.body.removeEventListener('click', this._onWindowClick);
	// },

	// _onWindowClick: function(e) {
	// 	if(e.target === this.dropdown || this.dropdown.contains(e.target)) return;
	// 	this.setState({ open: false });

	// },

	_setCurrentRange: function(option, trigger){
		var date = {};
        if(option === 'today'){
            date.begin = today().toStartOf().valueOf();
            date.end = today().toEndOf().valueOf();
        } else if(option === 'yesterday'){
            date.end = today().toEndOf().minus(1).valueOf();
            date.begin = today().toStartOf().minus(1).valueOf();
        } else if(option === 'week'){
            date.end = today().toEndOf().valueOf();
            date.begin = today().toStartOf().minus(7).valueOf();
        } else if(option === '30_days'){
            date.end = today().toEndOf().valueOf();
            date.begin = today().toStartOf().minus(30).valueOf();
        } else if(option === '60_days'){
            date.end = today().toEndOf().valueOf();
            date.begin = today().toStartOf().minus(60).valueOf();
        } else if(option === 'custom'){
            date.end = today().toStartOf().dateOf();
            date.begin = today().toEndOf().dateOf();
        }

        this.setState({ currRange: option, date: date });

        if((this.props.actionButton === false || trigger) && option !== 'custom') setTimeout(this._onClick, 0);

    },

    _setCurrentInterval: function(interval) {
    	var newInterval;

    	if(interval === 'hour') newInterval = 60*60*1000;
    	else if(interval === '1/2_hour') newInterval = 30*60*1000;
    	else if(interval === '1/4_hour') newInterval = 15*60*1000;
    	else if(interval === 'day') newInterval = 24*60*60*1000;

    	this.setState({ currInterval: newInterval });
    },

    _onDropdownToggle: function(){
    	this.setState({
    		open: !this.state.open
    	});
    },

    _onClick: function() {
    	var date = {};
    	if(this.state.currRange === 'custom') {
    		date.begin = today(this.cfromRome.getDate()).toStartOf().valueOf();
    		date.end = today(this.ctoRome.getDate()).toEndOf().valueOf();
    	} else {
    		date.begin = this.state.date.begin;
    		date.end = this.state.date.end;
    	}

    	console.log('_onClick:', this.state.currRange, date);

    	this.props.onClick({ date: date });
    	this.setState({ date: date, open: false });
    },

    _onRef: function(el) {
    	if(el.name === "custom-range-from") this.cfrom = el;
		else if(el.name === "custom-range-to") this.cto = el;
    	else this.dropdown = el;
    },

	render: function() {

		var frases = this.props.frases;
		var date = this.state.date;

		return (
			<div ref={this._onRef} className={"dropdown custom-dropdown "+(this.state.open ? "open" : "")} style={{ display: "inline-block" }}>
				<button type="button" className="btn btn-default btn-md btn-block dropdown-button" aria-expanded="true" onClick={this._onDropdownToggle}>
				    <span className="btn-text" style={{marginRight:"5px"}}>{moment(date.begin).format('DD/MM/YYYY') + ' - ' + moment(date.end).format('DD/MM/YYYY')}</span>
				    <span className="caret"></span>
				</button>
				<div className="dropdown-menu">
				    <div className="col-xs-12 btn-group btn-group-vertical" data-toggle="buttons">
				    	{
				    		this.state.ranges.map(function(item) {
				    			return (
				    				<label key={item.value} className={"btn btn-default "+(this.state.currRange === item.value ? "active" : "")} onClick={function() { this._setCurrentRange(item.value) }.bind(this)} >
							            <input type="radio" name="options" checked={this.state.currRange === item.value}/>
							            {item.label}
							        </label>
				    			)
				    		}.bind(this))
				    	}
				    </div>
				    <div className={"col-xs-12 custom-range "+(this.state.currRange === 'custom' ? '' : 'hidden')}>
				        <div className="input-group">
			                <input ref={this._onRef} type="text" className="form-control" name="custom-range-from" />
			                <span className="input-group-addon"><i className="fa fa-calendar"></i></span>
			                <input ref={this._onRef} type="text" className="form-control" name="custom-range-to" />
				        </div>
			            <br/>
				        {
				        	this.props.actionButton === false ? (
				        		<button type="button" name="selectButton" className="btn btn-primary btn-md btn-block" onClick={this._onClick}>{frases.SELECT}</button>
				        	) : null
				        }
					</div>

				    {
				    	this.props.interval ? (
						    <div className="col-xs-12 custom-interval">
						        <hr/>
						        <p>{frases.DATE_PICKER.INTERVAL}</p>
						        <div className="btn-group btn-group-justified" data-toggle="buttons">
						        	{
						        		this.state.intervals.map(function(item) {
						        			<label key={item.value} className="btn btn-default" >
								                <input type="radio" name="options" data-interval={item.value} />{item.label}
								            </label>
						        		})
						        	}
						        </div>
						    </div>
					    ) : null
				    }
				    <div className="col-xs-12">
				    <hr/>
				    {
				    	this.props.actionButton !== false ?
				    		<button type="button" name="selectButton" className="btn btn-primary btn-md btn-block" onClick={this._onClick}>{frases.SELECT}</button>
				    		: null
				    }
				    </div>
				</div>
			</div>
		);
	}
});

DatePickerComponent = React.createFactory(DatePickerComponent);

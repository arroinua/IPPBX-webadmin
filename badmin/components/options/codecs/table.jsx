var AvCodecsTableComponent = React.createClass({

	propTypes: {
	    frases: React.PropTypes.object,
	    model: React.PropTypes.string,
	    availableCodecs: React.PropTypes.array,
	    enabledCodecs: React.PropTypes.array,
	    onChange: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			codecs: {}
		};
	},

	componentWillMount: function() {
		this.setState({
			codecs: this._getCodecsArray(this.props)
		});
	},

	componentWillReceiveProps: function(props) {
		this.setState({
			codecs: this._getCodecsArray(props)
		});
	},

	_onChange: function(index, update) {
		var codecs = this.state.codecs;
		codecs[index] = update;

		this.props.onChange({
			model: this.props.model,
			codecs: codecs
		});
	},

	_getCodecsArray: function(props) {
		var codecs = [];
		var availableCodecs = [].concat(props.availableCodecs);
		var enabledCodecs = props.enabledCodecs ? [].concat(props.enabledCodecs) : [];
		var codec = {};

		codecs = enabledCodecs.map(function(item) {
			availableCodecs.splice(availableCodecs.indexOf(item.codec), 1);

			codec = {
				codec: item.codec,
				frame: item.frame,
				enabled: true
			};
			return codec;
		});

		availableCodecs.forEach(function(item) {
			codecs.push({ codec: item, frame: 30 });
		});

		// codecs = codecs.map(function(codec) {
		// 	codec = { codec: codec, frame: 30 };

		// 	enabledCodecs.map(function(item) {
		// 		if(codec.codec === item.codec) {
		// 			codec.frame = item.frame;
		// 			codec.enabled = true;
		// 		}

		// 		return item;
		// 	})

		// 	return codec;
		// });

		return codecs;
	},

	_tableRef: function(el) {
		return new Sortable(el);
	},

	_onSortEnd: function(e) {
		var target = e.currentTarget;
		var codecsLength = this.props.availableCodecs.length;
		var codecsOrder = [].slice.call(target.children).map(function(el, index) {
			el = el.children[1].getAttribute('data-codec');
			return el;
		});

		codecsOrder.length = codecsLength;
		this._reorderCodecs(codecsOrder);
	},

	_reorderCodecs: function(order) {
		var codecs = this.state.codecs;
		var newOrder = [].concat(order);
		var newIndex;

		codecs = codecs.map(function(item, index, array) {
			newIndex = order.indexOf(item.codec);
			newOrder[newIndex] = item;
			return item;
		});

		this.props.onChange({
			model: this.props.model,
			codecs: newOrder
		});
	},

	render: function() {
		var frases = this.props.frases;
		var codecs = this.state.codecs;

		return (
			<table className="table">
			    <thead>
			        <tr>
			            <th></th>
			            <th>{frases.AUDIOCODECS}</th>
			            <th>{frases.FRAMES}(ms)</th>
			            <th><i className="fa fa-check"></i></th>
			        </tr>
			    </thead>
			    <tbody ref={this._tableRef} onTouchEnd={this._onSortEnd} onDragEnd={this._onSortEnd}>
			    	{
			    		codecs.map(function(item, index) {
			    			return <AvCodecRowComponent key={item.codec} params={item} onChange={this._onChange.bind(this, index)} />
			    		}.bind(this))
			    	}
			    </tbody>
			</table>
		)
	}

});

AvCodecsTableComponent = React.createFactory(AvCodecsTableComponent);
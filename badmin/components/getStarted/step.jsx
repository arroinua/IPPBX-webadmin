
var GsStep = React.createClass({

	propTypes: {
		step: React.PropTypes.object,
		frases: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			step: {}
		};
	},

	getInitialState: function() {
		return {
			done: false
		}
	},

	_loadStep: function() {
		var step = this.props.step;
		var frases = this.props.frases;
		var stepCont = document.createElement('div');
		var Step = function() {
			var comp;
			switch(step.component) {
				case 'AddExtensions':
					comp = <AddExtensions step={step} frases={frases} />;
					break;
				case 'AddCallGroup':
					comp = <AddCallGroup step={step} frases={frases} />;
					break;
				// case 'AddTrunk':
				// 	comp = <AddTrunk step={step} />;
				// 	break;
			};

			console.log('loadStep: ', step, comp);

			if(!comp) return null;
			else {
				return (
					<ModalComponent 
						id={ step.name }
						title={ step.title }
						size="lg"
						body={ comp }
						// submit={ this._stepDone }
					/>
				);
			}
		};

		document.body.appendChild(stepCont);

		ReactDOM.render(React.createFactory(Step)({
		    step: step
		}), stepCont);

		$('#'+step.name).modal();
	},

	_stepDone: function() {
		this.setState({
			done: true
		});
	},

	render: function() {
		var stepDone = this.props.step.done;
		return (
			<li className={"gs-item " + (stepDone ? "gs-done" : "")} onClick={ this.props.step.onClick ? this.props.step.onClick : this._loadStep}>
			    <div className="gs-item-header">
			        <i className={this.props.step.icon}></i> {this.props.step.title}
			        <span className={ stepDone ? "fa-stack" : "hidden" } style={{ position: 'absolute', top: '5px', right: '5px' }}>
                            <i className="fa fa-circle fa-stack-2x text-success"></i>
                            <i className="fa fa-check fa-stack-1x text-white"></i>
                    </span>
			    </div>
			    <div className="gs-item-body">
			        <p>{this.props.step.desc}</p>
			    </div>
			</li>
		);
	}
});

GsStep = React.createFactory(GsStep);
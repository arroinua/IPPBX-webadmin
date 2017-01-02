
var GsStep = React.createClass({

	propTypes: {
		step: React.PropTypes.object
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
		console.log('step: ', step);

		var stepCont = document.createElement('div');
		var Step = function() {
			var comp = {};
			switch(step.component) {
				case 'AddExtensions':
					comp = <AddExtensions step={step} />;
					break;
				case 'AddCallGroup':
					comp = <AddCallGroup step={step} />;
					break;
				case 'AddTrunk':
					comp = <AddTrunk step={step} />;
					break;
			};

			console.log('loadStep: ', step, comp);

			return (
				<ModalComponent 
					id={ step.name }
					title={ step.title }
					size="lg"
					body={ comp }
					// submit={ this._stepDone }
				/>
			);
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
			<li className={"gs-item " + (stepDone ? "gs-done" : "")} onClick={this._loadStep}>
			    <div className="gs-item-header">
			        <i className={this.props.step.icon}></i> {this.props.step.title}
			    </div>
			    <div className="gs-item-body">
			        <p>{this.props.step.desc}</p>
			    </div>
			</li>
		);
	}
});

GsStep = React.createFactory(GsStep);
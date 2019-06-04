var GuideComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		options: React.PropTypes.object,
		profile: React.PropTypes.object,
		extensions: React.PropTypes.array,
		channels: React.PropTypes.array
	},

	_getHeader: function() {
		return (
			<div className="row">
				<div className="col-xs-12">
					<h1>{this.props.frases.GUIDE.HEADER.HEADER + ((this.props.profile && this.props.profile.name) ? (", "+this.props.profile.name.split(' ')[0]) : "") + "!"}</h1>
					<h4>{this.props.frases.GUIDE.HEADER.BODY}</h4>
				</div>
			</div>
		)
	},

	_isExtension: function(item) {
		return (item.kind === 'user' || item.kind === 'phone');
	},

	_getSteps: function(frases) {
		var list = [
			{ 
				name: frases.STEPS["2"].NAME,
				desk: frases.STEPS["2"].DESC,
				actions: [{ name: frases.STEPS["2"].ACTIONS[0], link: "#users/users" }, { name: frases.STEPS["2"].ACTIONS[1], link: "#equipment/equipment" }],
				done: (this.props.extensions.filter(this._isExtension).length)
			},
			{ 
				name: frases.STEPS["3"].NAME,
				desk: frases.STEPS["3"].DESC,
				actions: [{ name: frases.STEPS["3"].ACTIONS[0], link: "#chattrunk/chattrunk" }],
				done: this.props.channels.length
			}
		];

		if(this.props.profile) {
			list = [
				{ 
					name: frases.STEPS["1"].NAME,
					desk: frases.STEPS["1"].DESC,
					actions: [{ name: frases.STEPS["1"].ACTIONS[0], link: "#licenses" }],
					done: (this.props.options.maxusers > 0 || this.props.options.maxlines > 0)
				}
			].concat(list);
		}

		return list;
	},

	render: function() {
		var frases = this.props.frases.GUIDE;
		var steps = this._getSteps(frases);
		return (
			<PanelComponent>
				<StepGuide
					frases={frases}
					header={this._getHeader()}
					steps={steps}
				/>
			</PanelComponent>
		)
	}

})

GuideComponent = React.createFactory(GuideComponent);
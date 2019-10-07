var ExtensionsComponent = React.createClass({

	propTypes: {
		frases: React.PropTypes.object,
		data: React.PropTypes.array,
		getExtension: React.PropTypes.func,
		deleteExtension: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			data: []
		}
	},

	// getInitialState: function() {
	// 	return {
	// 		data: []
	// 	};
	// },

	// componentWillMount: function() {
	// 	this.setState({ data: this.props.data });
	// },

	// _getData: function(params, callback) {
	// 	json_rpc_async('getExtensions', null, callback);
	// },

	render: function() {
		var frases = this.props.frases;
		var data = this.props.data;
		return (
			<div className="row">
			    <div className="col-xs-12">
			    	<GroupMembersComponent frases={frases} members={data} withGroups={true} getExtension={this.props.getExtension} deleteMember={this.props.deleteExtension} />			    	
			    </div>
			</div>
		);
	}
});

ExtensionsComponent = React.createFactory(ExtensionsComponent);

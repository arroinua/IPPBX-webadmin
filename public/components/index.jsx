var Components = window.Components || {};
Components.MainConsentComponent = React.createClass({

	getInitialState: function() {
		return {
			selectedPurposes: []
		};
	},

	_getUrlParams: function(url) {
		return url
		.substr(1)
		.split('&')
		.reduce(function(obj, item) {
			obj[item.split('=')[0]] = item.split('=')[1];
			return obj;
		}, {});
	},

	render: function() {
		var frases = this.props.frases;
		var params = this._getUrlParams(window.location.search);
			// <FetchComponent url="/" data={params} successComponent={} errComponent={} />

		return (
			<h1>Hello React Consent!</h1>
		);
	}
});

Components.MainConsentComponent = React.createFactory(Components.MainConsentComponent);

var Components = window.Components || {};
Components.FetchComponent = React.createClass({

	getInitialState: function() {
		return {
			fetched: false
		};
	},

	componentWillMount: function() {
		request(this.props.url, this.props.data, function(err, result) {
			this.setState({
				fetched: true,
				success: err ? false : true
			});		
		});
	},

	request: function(url, data, callback){
		var response;
		var xhr = new XMLHttpRequest();
		var requestTimer = setTimeout(function(){
			xhr.abort();
		}, 60000);

		xhr.open(method, url, true);

		xhr.onreadystatechange = function() {
			if (xhr.readyState==4){
				clearTimeout(requestTimer);
				if(xhr.response) {
					response = JSON.parse(xhr.response);
					if(response.error) {
						return callback(response.error);
					}

					callback(null, response);
				}
			}
		};

		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		if(data) xhr.send(data);
		else xhr.send();
	},

	render: function() {
		return (
			<div>
				{
					this.state.success ? (
						this.props.successComponent
					) : (
						this.props.errComponent
					)
				}
			</div>
		);
	}
});

Components.FetchComponent = React.createFactory(Components.FetchComponent);

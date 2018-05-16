function load_numbers(params) {

	console.log('load_numbers');

	getCoutries();

	function getCoutries() {
		billingRequest('getDidCountries', null, function(err, response) {
			console.log('getSubscription response: ', err, response.result);
			if(err) return notify_about('error' , err.message);
		});
	}

}
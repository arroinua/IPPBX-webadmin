function load_numbers(params) {


	getCoutries();

	function getCoutries() {
		billingRequest('getDidCountries', null, function(err, response) {
			if(err) return notify_about('error' , err.message);
		});
	}

}
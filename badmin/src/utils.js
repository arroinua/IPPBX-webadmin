var Utils = {
	validateElement: function(element, stateElement) {
	    var valid = !!element.value;
	    if(!valid) {
	        stateElement ? stateElement.classList.add('has-error') : element.classList.add('has-error');
	        valid = false;
	    } else {
	        stateElement ? stateElement.classList.remove('has-error') : element.classList.remove('has-error');
	    }

	    return valid;
	},
	validateEmail: function(string) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(string);
	}
};
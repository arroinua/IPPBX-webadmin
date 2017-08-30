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
	}
};
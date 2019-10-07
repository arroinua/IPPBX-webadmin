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
	},
	each: function(items, func, callback) {
		function iterate(item, index, array) {
			func(function(err) {
				if(err) return callback(err);
				if(index === array.length-1) callback();
			}, item)
		}

		items.forEach(iterate);
	},
	interpolate: function(string, params) {
		return string.replace(/{{(\w*)}}/g, function(match, param, offset, result) {
			if(params[param]) return params[param];
		})
	},
	htmlDecode: function(str){
		var regex = /(&lt;)(&gt;)/
		return str.replace(regex, '<', '>');
	},
	debug: function() {
		if(window.localStorage.getItem('swc.debug')) {
		    [].forEach.call(arguments, function(arg){
		        window.console.log(arg);
		    });
		    return;
		}
	}
};
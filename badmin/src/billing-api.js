var BillingApi = {
	// url: 'https://a0addce0.ngrok.io/branch/api/',
	url: 'https://api-web.ringotel.net/branch/api/',
	cache: {},

	fetch: function(method, url, data, options, callback){
	    var xhr, response, requestTimer, dataStr;

	    xhr = new XMLHttpRequest();
	    xhr.open(method, url, true);
	    if(options && options.headers) {
	        options.headers.forEach(function(header) {
	            xhr.setRequestHeader(header.name, header.value);
	        });
	    }

	    requestTimer = setTimeout(function(){
	        xhr.abort();
	    }, 60000);
	    
	    xhr.onload = function(e) {
	        
	        clearTimeout(requestTimer);

	        var redirect = e.target.getAllResponseHeaders();
	        var status = e.target.status;
	        var response = e.target.responseText;
	        if(response) {
	            try {
	                response = JSON.parse(response);
	            } catch(err) {
	                console.log('response in not JSON');
	            }
	        }
	            
	        if(status === 403) {
	            logout();
	        } else if(status === 200) {
	            if(callback) callback(null, response);
	        } else if(status >= 500) {
	            if(callback) return callback('The service is under maintenance. Please, try again later.');
	        } else {
	            if(callback) callback(response.error);
	        }

	    };

	    if(data) {
	        xhr.setRequestHeader('Content-Type', 'application/json');
	        dataStr = JSON.stringify(data);
	        xhr.send(dataStr);
	    } else {
	        xhr.send();
	    }
	    
	},

	request: function(method, params, callback) {
		var access_token = window.localStorage.getItem('ringo_tid');
		if(!access_token) return callback('MISSING_TOKEN');
		this.fetch(
		    'POST',
		    (this.url+method+'?access_token='+encodeURIComponent(access_token)),
		    (params || null),
		    null,
		    function(err, result) {
		        if(err || result.error) return callback(err || result.error);
		        if(callback) callback(null, result);
		    }
		);
	},

	sendAppsLinks: function(email, callback) {
		this.request('sendAppsLinks', { email: email }, callback);
	},

	getProration: function(sub, amount) {
		console.log('getProration: ', sub, amount);
		var now = Date.now();
		var cycle = Math.floor((sub.nextBillingDate - sub.prevBillingDate) / 1000);
		var left = sub.nextBillingDate > now ? Math.floor((sub.nextBillingDate - now) / 1000) : 0;
		var ratio = (left / cycle).toFixed(2);
		var proration = parseFloat(amount) * parseFloat(ratio);
		
		return proration;
	},

	getProfile: function(callback) {
		this.request('getProfile', null, callback);
	},

	updateBalance: function(params, callback) {
		this.request('updateBalance', params, callback);	
	},

	changeAdminEmail: function(params, callback) {
		this.request('changeAdminEmail', params, callback);	
	},

	changePassword: function(params, callback) {
		this.request('changePassword', params, callback);	
	},

	addCard: function(params, callback) {
		this.request('addCard', params, callback);	
	},

	updateCard: function(params, callback) {
		this.request('updateCard', params, callback);	
	},

	getPlans: function(params, callback) {
		this.request('getPlans', params, callback);	
	},

	changePlan: function(params, callback) {
		this.request('changePlan', params, callback);	
	},

	getSubscription: function(callback) {
		this.request('getSubscription', null, callback);
	},

	updateSubscription: function(params, callback) {
		this.request('updateSubscription', params, callback);
	},

	renewSubscription: function(callback) {
		this.request('renewSubscription', null, callback);
	},

	addCoupon: function(params, callback) {
		this.request('addCoupon', params, callback);
	},

	getInvoices: function(callback) {
		this.request('getInvoices', null, callback);
	},

	getDiscounts: function(callback) {
		this.request('getDiscounts', null, callback);
	},
	
	getAssignedDids: function(callback) {
		this.request('getAssignedDids', null, callback);		
	},

	getUnassignedDids: function(callback) {
		this.request('getUnassignedDids', null, callback);		
	},

	orderDid: function(params, callback) {
		this.request('orderDid', params, callback);		
	},

	unassignDid: function(params, callback) {
		this.request('unassignDid', params, callback);
	},

	getDidPrice: function(params, callback) {
		this.request('getDidPrice', params, callback);
	},

	getDid: function(params, callback) {
		this.request('getDid', params, callback);
	},

	getDidCountries: function(callback) {
		this.request('getDidCountries', null, callback);
	},

	getDidLocations: function(params, callback) {
		this.request('getDidLocations', params, callback);
	},

	hasDids: function(callback) {
		this.request('hasDids', null, callback);
	},

	updateDidStatus: function(params, callback) {
		this.request('updateDidStatus', params, callback);
	},

	updateDidRegistration: function(params, callback) {
		this.request('updateDidRegistration', params, callback);
	},

	getCredits: function(callback) {
		this.request('getCredits', null, callback);
	},

	addCredits: function(params, callback) {
		this.request('addCredits', params, callback);
	}

};
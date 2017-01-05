var appStorage = new AppStorage('app-storage', 'localStorage');

function AppStorage(id, type) {

	if(type !== 'localStorage' && type !== 'sessionStorage')
		return console.error('No such storage type. Choose either "localStorage" or "sessionStorage".');

	var glObj = window[type],
		cache = glObj.getItem(id) ? JSON.parse(glObj.getItem(id)) : {};

	this.set = function(key, data, cacheOnly) {
		cache[key] = data;
		if(!cacheOnly) glObj.setItem(id, JSON.stringify(cache));
		return this;
	};

	this.get = function(key) {
		return key ? cache[key] : cache;
	};

	this.remove = function(key) {
		key ? delete cache[key] : cache = {};
		return this;
	};

	this.setType = function(type) {
		if(window[type]) glObj = window[type];
		return this;
	};
		
}
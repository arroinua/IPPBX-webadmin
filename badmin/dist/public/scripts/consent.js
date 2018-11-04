(function(window, document) {

	console.log('Hello consent!');

	var baseUrl = '/public/';
	var params = getUrlParams(window.location.search);
	var ringotelPrivPolicy = 'https://www.iubenda.com/privacy-policy/92894652';
	var selectedReasons = [];
	var submitButton = null;
	var cont = document.getElementById('app');
	var formId = params.branchid+'_'+params.profileid+'_'+(Math.random()*Date.now());
	// var testParams = {
	// 	company: 'Oncoach Ltd.',
	// 	text: 'Alex Brain Ltd. ("us", "we", "our") will use your personal information to get in touch with you. Such personal information is limited to your name, position, email and phone number. If at any time you wish to stop receiving messages from us, you can return to this page and change your preferences. If at any time you wish to change or withdraw your personal information, you can contact us via email that you can find on our website.',
	// 	privacylink: 'https://ringotel.co/privacy-policy/'
	// };

	init();

	// Init script
	function init() {
		getProfile(function(err, response) {
			console.log('getProfile: ', err, response.result);
			if(err) return console.error(err);
			buildConsentPage(response.result);
		});
	}

	// get profile settings
	function getProfile(callback) {
		request(baseUrl+"getGdprProfile?id="+params.profileid, null, callback);
	}

	// // construct html page
	function buildConsentPage(params) {
		submitButton = getPageSubmitButton(params);

		cont.appendChild(getPageHeader(params));
		cont.appendChild(getPageContent(params));
		if(params.policylink) cont.appendChild(getPagePPLink(params));
		if(params.reasons && params.reasons.length) cont.appendChild(getPagePurposesList(params));
		cont.appendChild(getPageNotice(params));
		cont.appendChild(submitButton);
	}

	function getPageHeader(params) {
		var h1 = createEl('h1');
		h1.innerText = params.company;
		return h1;
	}

	function getPageContent(params) {
		var p = createEl('p');
		p.innerText = params.text;
		return p;
	}

	function getPagePPLink(params) {
		var p = createEl('p');
		p.innerHTML = [
			('<a href="'+params.policylink+'" target="_blanc">'),
				"Privacy Policy",
			'</a>'
		].join("");
		return p;
	}

	function getPageNotice(params) {
		var p = createEl('p');
		p.innerHTML = ('We use Ringotel as our platform for processing your personal information. By submiting this form, you acknowledge that the information you provide will be transfered to Ringotel for processing in accordance with their <a href="'+ringotelPrivPolicy+'" target="_blanc">Privacy Policy</a>');
		return p;
	}

	function getPagePurposesList(params) {
		var cont = createEl('div');
		var h5 =createEl('h5');
		var form = createEl('form');
		var els;

		h5.innerText = 'Please let us know what would you like to hear from us:';
		els = params.reasons.map(function(item) {
			return [
				'<label>',
					('<input type="checkbox" name="'+item.id+'" /> '),
					item.text,
				'</label>'
			].join("")
		});

		form.innerHTML = els.join("");
		form.addEventListener('change', onReasonChange, true);

		cont.appendChild(h5);
		cont.appendChild(form);
		return cont;
	}

	function onReasonChange(e) {
		console.log('onReasonChange: ', e);
		var target = e.target;
		if(target.checked) {
			target.setAttribute('checked', 'true');
			selectedReasons.push(target.name);
		} else {
			target.removeAttribute('checked');
			selectedReasons = selectedReasons.filter(function(item) { return item !== target.name });
		}
	}

	function getPageSubmitButton() {
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'button-primary';
		button.innerText = 'Submit';
		button.addEventListener('click', submitProfile, true);
		return button;
	}

	function createEl(el) {
		return document.createElement(el);
	}

	function submitProfile() {
		submitButton.disabled = true;
		// get HTML page as file
		contentToFile(function(data) {
			request(baseUrl+'consent', {
				file: data,
				basis: 2,
				customerid: params.customerid,
				userid: params.userid
			}, function(err, result) {
				submitButton.disabled = false;
				if(err) {
					showNotification('error', err);
					return console.error(err);
				}

				showNotification('success', 'Your preferences has been saved');
				console.log('SUCCESS:', result);
			});
		});
			
	}

	function showNotification(type, message) {
		var cont = document.querySelector('.notif-cont');
		if(!cont) {
			cont = createEl('div');
			document.body.insertBefore(cont, document.body.firstChild);
		}

		cont.className = 'notif-cont '+type;
		cont.className += ' active';
		cont.innerHTML = message;

		setTimeout(function() {
			cont.classList.remove('active');
		}, 10000);
	}

	function contentToFile(callback) {
		var content = '<!DOCTYPE html>' + document.documentElement.outerHTML;
		var file = new Blob([content], { type: "text/html" });
		return callback(file);
		// var url = URL.createObjectURL(file);
		// var reader = new FileReader();

		// reader.onload = function(event) {
		// 	data = event.target.result;
		// 	// data = data.substring(data.indexOf(',')+1);
		// 	callback(data);
		// };
		// reader.onerror = function(event) {
		// 	console.error(event.target.error);
		// };
		// // reader.readAsDataURL(file);
		// reader.readAsBinaryString(file);
	}

	function getUrlParams(url) {
		return url
		.substr(1)
		.split('&')
		.reduce(function(obj, item) {
			obj[item.split('=')[0]] = item.split('=')[1];
			return obj;
		}, {});
	}

	function urlEncodeData(obj) {
		var encoded = Object.keys(obj).reduce(function(string, key, index, array) {
			string += (encodeURIComponent(key)+'='+encodeURIComponent(obj[key]));
			if(index < array.length-1) string += '&';
			return string;
		}, "");
		encoded = encoded.replace(/%20/g, '+');
		return encoded;
	}

	function toFormData(obj) {
		var formData = new FormData();
		Object.keys(obj).map(function(key) {
			if(key === 'file') formData.append(key, obj[key], 'consent.html');
			else formData.append(key, obj[key]);
			return key;
		});

		console.log('toFormData: ', obj);

		return formData;
	}

	function request(url, data, callback){
		var response;
		var xhr = new XMLHttpRequest();
		var requestTimer = setTimeout(function(){
			xhr.abort();
		}, 60000);
		var content = data ? toFormData(data) : null;

		// var content = data ? JSON.stringify(data) : null;
		// if(!data) content = null;
		// else content = urlEncodeData(data);
		// else if(typeof data === 'object') content = JSON.stringify(data);

		xhr.open((content ? 'POST' : 'GET'), url, true);

		xhr.onreadystatechange = function() {
			if (xhr.readyState==4){
				clearTimeout(requestTimer);
				if(xhr.status === 200) {
					if(xhr.response) {
						response = JSON.parse(xhr.response);
						if(response.error) {
							return callback(response.error);
						}

						callback(null, response);
					} else {
						callback(null, 'OK');
					}
				} else {
					callback('Currently, we experiencing technical issues. Please try again later.');
				}
			}
		};

		// xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		// xhr.setRequestHeader('Content-Type', 'multipart/form-data; charset=UTF-8');

		if(content) xhr.send(content);
		else xhr.send();
	}


})(window, document)
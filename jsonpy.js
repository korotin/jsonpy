function jsonpy(o) {
	
	var name 	= '__jsonp'+parseInt(Math.random() * 10000),
	field 		= o.field || 'callback',
	params		= o.params || {},
	url 		= o.url,
	timeout		= o.timeout || false,
	timeoutId	= null,
	done		= false,
	
	script 		= document.createElement('script'),
	
	buildUrl = function(url, params) {
		var key = null, pairs = [];
		params = params || {};
		for (key in params) {
			pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
		}
		
		if (!pairs.length) return url;
		
		return url + (url.indexOf('?') >= 0 ? '&' : '?') + pairs.join('&');
	},
	
	init = function() {
		params[field] 	= name;
		url 			= buildUrl(url, params);
		
		script.type		= 'text/javascript';
		script.src		= url;
		script.addEventListener('error', error, true);
	},
	
	connect = function() {
		window[name] = success;
		document.body.appendChild(script);
		
		if (timeout) {
			timeoutId = setTimeout(error, timeout);
		}
	},
	
	close = function() {
		delete window[name];
		document.body.removeChild(script);
		
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		
		done = true;
	},
	
	success = function() {
		if (done) return;
		close();
		
		o.success.apply(this, arguments);
	},
	
	error = function() {
		if (done) return;
		close();
		
		if (typeof o.error === 'function') {
			o.error();
		}
	};
	
	
	
	init();
	connect();
}
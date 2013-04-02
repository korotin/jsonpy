function jsonpy(o, d, f, a) {
	// random callback name in window scope
	var name 	= '__jsonp' + parseInt(Math.random() * 10000),
	// url for request
	url 		= typeof o === 'string' ? o : o.url,
	// url parameters
	params 		= o.params || {},
	// url parameter name containing callback name ('callback' usually)
	field 		= o.field || 'callback',
	// timeout for request (no timeout by default)
	timeout		= o.timeout || false,
	timeoutId	= null,
	
	script 		= document.createElement('script'),
	
	// execution status: null if not executed, 'done' or 'fail'
	status		= null,
	// arguments for callbacks
	cbArgs		= null,
	// callbacks collection
	callbacks	= {done: [], fail: [], always: []},
	
	resolver = null,
	/**
	 * @type {jQuery.Deferred|Q.defer|object}
	 */
	promise = null,

	createPromise = function() {
		return {
			done: function(callback) {
				callbacks.done.push(callback);
				runCallbacks();

				return promise;
			},
			
			fail: function(callback) {
				callbacks.fail.push(callback);
				runCallbacks();
				
				return promise;
			},
			
			always: function(callback) {
				callbacks.always.push(callback);
				runCallbacks();
				
				return promise;
			}
		};
	},
	
	/**
	 * helper function, run all callbacks in array with given args
	 * @param  {array} cbs  callbacks
	 * @param  {array} args arguments
	 */
	runCallbacksFromArray = function(cbs, args) {
		while (cb = cbs.shift()) {
			cb.apply(this, args);
		}
	},
	
	/**
	 * run all callbacks for current status; called by promise methods and resolve()
	 */
	runCallbacks = function() {
		if (!status) return;
		
		runCallbacksFromArray(callbacks[status], cbArgs);
		runCallbacksFromArray(callbacks.always, cbArgs);
	},

	/**
	 * resolve promise object and set status
	 * @param  {bool} success
	 * @param  {array} args
	 */
	resolve = function(success, args) {
		if (status) return;
		
		status = ['fail', 'done'][+success];

		if (resolver) {
			// use jQuery Deferred
			resolver[['reject', 'resolve'][+success]].apply(this, args);
		}
		else {
			// use native promise
			cbArgs = args;
			runCallbacks();
		}
	},

	/**
	 * build query string
	 * @param  {object} params
	 * @param  {[string]} prefix
	 * @return {string}
	 */
	buildParams = function(params, prefix) {
		var k, p, s = '';

		prefix = prefix || '';
		for (k in params) {
			p = prefix ? prefix + '[' + k + ']' : k;
			if (s) s += '&';
			s += 
				(typeof params[k] === 'object') 
					? buildParams(params[k], p) 
					: encodeURIComponent(p) + '=' + encodeURIComponent(params[k]);
		}

		return s;
	},
	
	/**
	 * build url for request: simply add callback parameter to url
	 * @return {string}
	 */
	buildUrl = function() {
		var ps = params;
		ps[field] = name;
		return url 
				+ ['?', '&'][+(url.indexOf('?') >= 0)]
				+ buildParams(ps);
	},
	
	/**
	 * initialize jsonpy
	 */
	init = function() {
		script.type		= 'text/javascript';
		script.src		= buildUrl();
		script.async	= true;
		
		script.addEventListener('error', error, true);

		if (typeof jQuery !== 'undefined' && typeof jQuery.Deferred !== 'undefined') {
			resolver = jQuery.Deferred();
			promise = resolver;
		}
		else if (typeof Q !== 'undefined' &&) {
			resolver = Q.defer();
			promise = resolver.promise;
		}
		else {
			promise = createPromise();
		}

		if (o.done) promise.done(o.done);
		if (o.fail) promise.fail(o.fail);
		if (o.always) promise.always(o.always);

		if (d) promise.done(d);
		if (f) promise.fail(f);
		if (a) promise.always(a);
	},
	
	/**
	 * perform request
	 */
	connect = function() {
		window[name] = success;
		document.body.appendChild(script);
		if (timeout) {
			timeoutId = setTimeout(error, timeout);
		}
	},
	
	/**
	 * close connection and cleanup
	 */
	close = function() {
		if (status) return;
		
		delete window[name];
		document.body.removeChild(script);
		
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	},
	
	/**
	 * called on request success
	 */
	success = function() {
		if (status) return;
		close();
		resolve(true, arguments);
	},
	
	/**
	 * called on request error or timeout (if exists)
	 */
	error = function() {
		if (status) return;
		close();
		resolve(false, arguments);
	};
	

	
	init();
	connect();
		
		
		
	return promise;
}
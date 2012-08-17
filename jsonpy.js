function jsonpy(o, d, f, a) {
	// random callback name in window scope
	var name 	= '__jsonp' + parseInt(Math.random() * 10000),
	// url for request
	url 		= typeof o === 'string' ? o : o.url,
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
	
	// promise object returned by jsonpy
	promise = {
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
	},
	
	// helper function, run all callbacks in array with given args
	runCallbacksFromArray = function(cbs, args) {
		while (cb = cbs.shift()) {
			cb.apply(this, args);
		}
	},
	
	// run all callbacks for current status; called by promise methods and setStatus()
	runCallbacks = function() {
		if (!status) return;
		
		runCallbacksFromArray(callbacks[status], cbArgs);
		runCallbacksFromArray(callbacks.always, cbArgs);
	},
	
	// set status to done or fail and set callback args
	// function may be called only once
	setStatus = function(success, args) {
		if (status) return;
		
		status = ['fail', 'done'][+success];
		cbArgs = args;
		runCallbacks();
	},
	
	
	
	// build url for request: simply add callback parameter to url
	buildUrl = function() {
		return url 
				+ ['?', '&'][+(url.indexOf('?') >= 0)]
				+ [encodeURIComponent(field), encodeURIComponent(name)].join('=');
	},
	
	// initialize jsonpy
	init = function() {
		script.type		= 'text/javascript';
		script.src		= buildUrl();
		script.async	= true;
		
		script.addEventListener('error', error, true);

		if (o.done) promise.done(o.done);
		if (o.fail) promise.done(o.fail);
		if (o.always) promise.done(o.always);

		if (d) promise.done(d);
		if (f) promise.done(f);
		if (a) promise.done(a);
	},
	
	// perform request
	connect = function() {
		window[name] = success;
		document.body.appendChild(script);
		if (timeout) {
			timeoutId = setTimeout(error, timeout);
		}
	},
	
	// close connection and cleanup
	close = function() {
		if (status) return;
		
		delete window[name];
		document.body.removeChild(script);
		
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	},
	
	// called on request success
	success = function() {
		if (status) return;
		close();
		setStatus(true, arguments);
	},
	
	// called on request error or timeout (if exists)
	error = function() {
		if (status) return;
		close();
		setStatus(false, arguments);
	};
	

	
	init();
	connect();
		
		
		
	return promise;
}
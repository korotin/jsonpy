# jsonpy

**jsonpy** is a tiny library for work with JSONP. Callback mechanism based on the CommonJS Promises/A pattern, so you can provide multiple callbacks for success, fail or both. Also library has support of jQuery Deferred object.

## Usage

The simpliest example of usage is calling **jsonpy** like an ordinary function:
``` javascript
// Single callback
jsonpy('url', function(response) {
	// process data
});

// ...with error handling
jsonpy('url', function(response) {
	// process data
}, function() {
	// handle error
});

// ...add always callback
jsonpy('url', function(response) {
	// process data
}, function() {
	// handle error
}, function() {
	// this code will be executed always
});
```

But hey, what if we want to customize something? We may pass to **jsonpy** an object:
``` javascript
jsonpy({
	// JSONP url.
	// Required.
	url: 'url',

	// URL parameters.
	// Optional.
	params: {
		param1: 'value1',
		param2: 'value2'
	},

	// If the name of parameter containing callback name differs from 'callback',
	// you can customize it by setting 'field' option.
	// Optional.
	field: 'jsonCallback',

	// You can set a timeout for request in milliseconds.
	// If request took more time than set in 'timeout', request will be aborted and
	// fail callbacks will be invoked.
	// By default timeout is disabled.
	// Optional.
	timeout: 5000,

	// Typical set of callbacks.
	// Only success callback is required. 
	done: function(response) {
		// process data
	},
	fail: function(response) {
		// handle error
	},
	always: function() {
		// this code will be executed always
	}
});
```

And now, the sweetest part. You can use promise-like chainable calls to provide multiple callbacks:
``` javascript
jsonpy({
	url: 'url',
	timeout: 5000
}).done(function(response) {
	// process data
}).done(function(response) {
	// process data again
})
.fail(function(response) {
	// handle error
}).always(function() {
	// this code will be executed always
});
```
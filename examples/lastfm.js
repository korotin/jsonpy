window.addEventListener('load', function() {
	var apiKey = '5a5ad162002ebc3357b3517e62774ee1';
	
	console.log(jsonpy({
		url: '//ws.audioscrobbler.com/2.0/',
		params: {
			method: 'chart.gettopartists',
			format: 'json',
			api_key: apiKey
		},
		timeout: 5000
	}, function(response) {
		var s = '', i = null;
		
		for (i = 0; i < response.artists.artist.length; i++) {
			s += '<li><b>' + response.artists.artist[i].name + '</b> (' + response.artists.artist[i].listeners + ' listeners)</li>';
		}
		
		document.getElementById('chart').innerHTML = s;
	}, function() {
		document.getElementById('error').style.display = 'block';
	}, function() {
		document.getElementById('loading').style.display = 'none';
	}));
}, false);
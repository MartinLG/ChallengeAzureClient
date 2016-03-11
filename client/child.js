var request = require('request');
var _redis = require("redis");

var client = _redis.createClient(6379, '167.114.227.190')

var author = process.argv[2];
var baseurl =  process.argv[3];
var debug = process.argv[4] == 'true' ? true : false;

resolveHash();

function resolveHash() {
	var propertiesObject = { author: author };
    request({url: baseurl + '/GetHash', qs:propertiesObject}, function(err, response, body) {
    	if(err) { console.log(err); return resolveHash(); }
        
        var hash;

        if (!debug) {
        	hash = JSON.parse(body).hash;
        } else {
        	hash = JSON.parse(body).clean;
        }

        console.time('score');

        if (!debug) {
	        client.get(hash, function(err, reply) {
	            if (err) {console.log(err)}
	            if (reply) {
	                return sendResult(reply);
	            }
	        });
        } else {
        	return sendResult(hash);
        }
    })
}

function sendResult(result)
{
    var options = { url: baseurl + `/PostResult?author=${author}&result=${result}` };

    request(options, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log('result sent');
            console.time('score');
        } else {
            console.log(err)
            console.log(response.statusCode)
            console.log('result error');
        }
        return resolveHash();
    });
}

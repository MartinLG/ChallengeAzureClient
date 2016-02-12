var _redis = require('redis')
var request = require('request')
var client = _redis.createClient(6379, '167.114.227.190')

request({url: 'http://localhost:8080/GetHash'}, function(err, response, body) {
    if(err) { console.log(err); return; }
    var hash = JSON.parse(body).hash;

    client.get(hash, function(err, reply) {
        if (err) {console.log(err)}
        console.log(reply)
        client.end();
    })
})

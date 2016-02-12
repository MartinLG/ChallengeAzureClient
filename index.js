var _redis = require('redis')
var request = require('request')
var client = _redis.createClient(6379, '167.114.227.190')

main()

function main() {
    request({url: 'http://localhost:8080/GetHash'}, function(err, response, body) {
        if(err) { console.log(err); return false; }
        var hash = JSON.parse(body).hash;
        client.get('43d55e01c43faeaa2a9d90a8a68629a4a6088174', function(err, reply) {
            if (err) {console.log(err); return false; }
            console.log(reply);
            return main();
        })
    })
}

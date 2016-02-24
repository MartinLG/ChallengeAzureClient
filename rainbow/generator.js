var baseN = require('base-n')
var _redis = require("redis");
var sha1 = require('sha1');

var redis = _redis.createClient();

var charset = process.argv[2];
var strlength = process.argv[3];
var salt = process.argv[4];

var b36 = baseN.create({
    characters: charset,
    length: strlength
});

var max = b36.decode(charset[charset.length - 1].repeat(strlength));

function resolveHashes() {
	var x = Math.floor((Math.random() * (max + 1)));
	var pass = b36.encode(start);
	var hash = sha1(string + salt);
	console.time('hash');

	redis.get(hash, function(err, reply) {
        if (err) {console.log(err)}
        if (reply) {
        	if (reply == pass) {
        		console.log("VICTORY");
        	} else {
        		console.log("Merdeeeeee");
        	}
        	console.timeEnd('hash');
            return resolveHashes();
        }
    });
}

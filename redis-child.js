var baseN = require('base-n');
var sha1 = require('sha1');
var _redis = require("redis");

var redis = _redis.createClient();

var string = process.argv[2];
var end = process.argv[3];
var charset = process.argv[4];
var strlength = parseInt(process.argv[5]);
var salt = process.argv[6];

var b36 = baseN.create({
    characters: charset,
    length: strlength
});

setNext();

function setNext() {
	var value = b36.decode(string);
	value++;
	string = b36.encode(value);
	var hash = sha1(string + salt);
	redis.set(hash, string);
	if (string != end) {
		return setNext();
	} else {
		console.log('finished');
	}
}
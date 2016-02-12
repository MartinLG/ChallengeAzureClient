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

var range = b36.decode(end) - b36.decode(string);

console.log('range =>');
console.log(range);

for (var i = 0; i < range; i++) {
	string = b36.encode(b36.decode(string) + i);
	var hash = sha1(string + salt);
	redis.set(hash, string);
}

console.log('i =>');
console.log(i);

process.send({status: 'end'});
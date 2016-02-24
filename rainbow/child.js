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

console.log(string + " => " + end + " started");

var range = b36.decode(end) - b36.decode(string);
var i = 0;

var batch = {};

function pushToBatch() {
	var newstring = b36.encode(b36.decode(string) + i);
	var hash = sha1(newstring + salt);
	batch[hash] = newstring;
	if (Object.keys(batch).length >= 100) {
		return pushToRedis(function() {
			pushToBatch()
		});
	}
	if (i <= range) {
		i++;
		return pushToBatch();
	} else {
		return pushToRedis(function() {
			console.log('ended');
			process.send({status: 'end'});
		});
	}
}

function pushToRedis(callback) {
	var table = [];

	for(var key in batch) {
		table.push(key);
		table.push(batch[key]);
	}

	table.push(callback);

	batch = {};

	redis.mset.apply(redis, table);
}

pushToBatch();

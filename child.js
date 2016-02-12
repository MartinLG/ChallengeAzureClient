var baseN = require('base-n');
var sha1 = require('sha1');

var string = process.argv[2];
var end = process.argv[3];
var hash = process.argv[4];
var charset = process.argv[5];
var strlength = parseInt(process.argv[6]);
var salt = process.argv[7];

var b36 = baseN.create({
    characters: charset,
    length: strlength
});

do {
	var value = b36.decode(string);
	value++;
	string = b36.encode(value);
} while (sha1(string + salt) != hash || string != end);

if (string == end) {
	process.send({status: 'end'});
} else {
	process.send({status: 'found', string: string});
}

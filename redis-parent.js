var childProcess = require('child_process')
var baseN = require('base-n')

var charset = process.argv[2];
var strlength = process.argv[3];
var salt = process.argv[4];

var nbCores = require('os').cpus().length;

var b36 = baseN.create({
    characters: charset
});

var max = b36.decode(charset[charset.length - 1].repeat(strlength));
var each = max / nbCores;
var limits = [];

for (var i = 0; i < nbCores; i++) {
    var start = Math.ceil(i * each);
    if (i != nbCores - 1) {
        var end = start + Math.ceil(each);
    } else {
        var end = max;
    }

    limits.push({start: b36.encode(start), end: b36.encode(end)});
};

main(charset, strlength, salt);

function main(charset, strlength, salt)
{
	for (var i=0 ; i<nbCores; i++) {
        var worker = childProcess.fork('redis-child.js', [limits[i].start, limits[i].end, charset, strlength, salt]);
    }
}
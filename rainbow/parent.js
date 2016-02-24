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

console.log(max);

var each = max / nbCores;
var limits = [];

var endedWorkers = 0;

for (var i = 0; i < nbCores; i++) {
    var start = Math.ceil(i * each);
    if (i != nbCores - 1) {
        var end = start + Math.ceil(each);
    } else {
        var end = max;
    }

    limits.push({start: b36.encode(start), end: b36.encode(end)});
};

console.log(limits.length);

main(charset, strlength, salt);

function main()
{
	for (var i=0 ; i<nbCores; i++) {
		var worker = childProcess.fork('child.js', [limits[i].start, limits[i].end, charset, strlength, salt]);
		worker.on('message', function(m) {
			if (m.status === "end") {
				worker.kill('SIGINT');
				endedWorkers++;
				if (endedWorkers == nbCores) {
					console.log("Rainbow Table GENERATED !!!! POWPOWPOW !!");
				};
			}
        });
	};
}
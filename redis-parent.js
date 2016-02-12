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

var usedCores = 0;
var currentWorker = 0;

for (var i = 0; i < max; i=i+20000) {
	var j = i + 20000;
	if (j > max) {
		j = max;
	};
	limits.push({start: b36.encode(i), end: b36.encode(j)})
};

main(charset, strlength, salt);

function main()
{
	for (usedCores; usedCores < nbCores; usedCores++) {
		// console.log(currentWorker);
		// console.log(limits[currentWorker].end);
		var worker = childProcess.fork('redis-child.js', [limits[currentWorker].start, limits[currentWorker].end, charset, strlength, salt]);
		currentWorker++;
		worker.on('message', function(m) {
			if (m.status === "end") {
				worker.kill('SIGINT');
				if (currentWorker < limits.length) {
					usedCores--;
					main();
				};
			}
        });
	};
}
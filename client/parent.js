var childProcess = require('child_process');

var author = process.argv[2];
var baseurl =  process.argv[3];
var nbCores = require('os').cpus().length;

main();

function main()
{
	for (var i=0 ; i<nbCores; i++) {
		childProcess.fork('child.js', [author, baseurl])
	}
}

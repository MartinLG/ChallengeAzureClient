var childProcess = require('child_process')
var request = require('request')
var baseN = require('base-n');

var charset = process.argv[2];
var strlength = process.argv[3];
var salt = process.argv[4];
var author = process.argv[5];
var baseurl = process.argv[6];
var nbCores = require('os').cpus().length;

console.log("Parameters")
console.log(charset)
console.log(strlength)
console.log(salt)

console.log("Start")

main(charset, strlength, salt);

function main(charset, strlength, salt)
{
    var b36 = baseN.create({
        characters: charset
    });

    var max = b36.decode(charset[charset.length - 1].repeat(strlength));
    var each = max / nbCores;
    var limits = [];
    var workers = [];

    for (var i = 0; i < nbCores; i++) {
        var start = Math.ceil(i * each);
        if (i != nbCores - 1) {
            var end = start + Math.ceil(each);
        } else {
            var end = max;
        }

        limits.push({start: b36.encode(start), end: b36.encode(end)});
    };

    // Request
    var propertiesObject = { author: author };
    request({url: baseurl + '/GetHash', qs:propertiesObject}, function(err, response, body) {
        if(err) { console.log(err); return; }
        var hash = JSON.parse(body).hash;
	
	console.time('score');

        if (!hash) {
            return main(charset, strlength, salt);
        };

        console.log(JSON.parse(body).random);

        var endedWorkers = 0;
        for (var i=0 ; i<nbCores; i++) {
            var worker = childProcess.fork('child.js', [limits[i].start, limits[i].end, hash, charset, strlength, salt])
            workers.push(worker);
            worker.on('message', function (m) {
                if (m.status === 'found') {
                    killAllWorkers(workers);
        		    console.log('found');
        		    console.log(m.string);
        		    console.timeEnd('score');

                    return sendResult(m.string);
                } else if (m.status === 'end') {
                    endedWorkers++;
                    if (endedWorkers == nbCores-1) {
                        killAllWorkers(workers);
                        console.log('Not Found, Mother fucker.');
                        return main(charset, strlength, salt);
                    };
                }
            })
        }
    });
}


function killAllWorkers(workers)
{
    for (var i in workers) {
        workers[i].kill('SIGINT');
    };
}

function sendResult(result)
{
    var options = {
      uri: baseurl + '/PostSuccess',
      method: 'POST',
      json: {
        "author": author,
        "result": result
      }
    };

    request(options, function(err, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('result sent');
            return main(charset, strlength, salt);
        } else {
            console.log('result error');
            setTimeout(function() {
                return sendResult(result);
            }, 100);
        }
    });
}

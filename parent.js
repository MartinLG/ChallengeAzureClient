var childProcess = require('child_process')
var request = require('request')
var baseN = require('base-n');
var Timer = require('timer.js')

var timer = new Timer();

var charset = process.argv[2];
var strlength = process.argv[3];
var salt = process.argv[4];
var author = process.argv[5];
var baseurl = process.argv[6];
var maxTime = parseInt(process.argv[7]);
var nbCores = require('os').cpus().length;

console.log("Parameters")
console.log(charset)
console.log(strlength)
console.log(salt)

console.log("Start")

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
    var workers = [];
    // Request
    var propertiesObject = { author: author };
    request({url: baseurl + '/GetHash', qs:propertiesObject}, function(err, response, body) {
        if(err) { console.log(err); return; }
        var hash = JSON.parse(body).hash;
	
	    console.time('score');
        timer.start(maxTime).on('end', function () {
            console.log('dropped');
            killAllWorkers(workers);
            return main(charset, strlength, salt);
        });

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
      uri: baseurl + '/PostResult',
      method: 'POST',
      json: {
        "author": author,
        "result": result
      }
    };

    request(options, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log('result sent');
            return main(charset, strlength, salt);
        } else {
            console.log(err)
            console.log(response.statusCode)
            console.log('result error');
            setTimeout(function() {
                return sendResult(result);
            }, 100);
        }
    });
}

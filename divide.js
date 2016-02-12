var baseN = require('base-n');

var b36 = baseN.create({
    characters: '0123456789abcdefghijklmnopqrstuvwxyz'
});

var nbCores = 32;

var max = b36.decode('zzzzzz');

var each = max / nbCores;

for (var i = 0; i < nbCores; i++) {
	var start = Math.ceil(i * each);
	if (i != nbCores - 1) {
		var end = start + Math.ceil(each);
	} else {
		var end = max;
	}

	console.log("Core " + i);
	console.log(b36.encode(start));
	console.log(b36.encode(end));
};

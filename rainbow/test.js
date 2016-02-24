var _redis = require("redis");

var redis = _redis.createClient();

var hashes = {
	zqertfyuicoretyuu: 'azerty',
	retfyguhiopyguiop: 'qsdfgh',
	wxcvbndsfgdfvtghu: 'wxcvbn'
};

// redis.mset('zqertfyuiyoretyuu', 'azerty', 'retfyguhiopyguiop', 'qsdfgh', 'wxcvbndsfgdfvtghu', 'wxcvbn', 'esrtdfyguiotryu', 'dtfgyuhiojytugio', function(result) {
// 	console.log(result);
// });

var table = [];

for(var key in hashes) {
	table.push(key);
	table.push(hashes[key]);
}

table.push(function(){
	console.log('Finished');
	return;
});

redis.mset.apply(redis, table);
var request = require('request');
var sha1 = require('sha1');

var charset = '0123456789azertyuiopqsdfghjklmwxcvbn'

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

var propertiesObject = { author:'MartinLeGuillou' };

var url = 'http://localhost:3000/GetHash'

request({url:url, qs:propertiesObject}, function(err, response, body) {
  if(err) { console.log(err); return; }
  var hash = JSON.parse(body).hash;

  console.log(JSON.parse(body).random);

  var string = "000000";
  do {
  	string = next_iteration(string, charset);
  } while (sha1(string + '!$9') != hash);

  console.log("result => " + string);
});

function next_iteration(str, charset) {
    var i = 0;
    var test = false;
    do {
    	if (str[i] == charset[charset.length - 1]) {
    		if (i == str.length - 1) {
    			return false;
    		} else {
    			i++;
    		}
    	} else {
    		if (i > 0) {
	    		for (var j = i-1; j >= 0; j--) {
	    			str = str.replaceAt(j, charset[0]);
	    		};
    		};

    		str = str.replaceAt(i, charset[charset.indexOf(str[i]) + 1]);
    		return str;
    	}
    } while(true);
}

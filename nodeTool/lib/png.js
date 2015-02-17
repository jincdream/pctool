var https = require("https");
var fs = require("fs");

var key = "aj6OJYjJfcWKWYC104B5h59AA3alXkF0";

/* Uncomment below if you have trouble validating our SSL certificate.
   Download cacert.pem from: http://curl.haxx.se/ca/cacert.pem */
// var boundaries = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----\n/g
// var certs = fs.readFileSync(__dirname + "/cacert.pem").toString()
// https.globalAgent.options.ca = certs.match(boundaries);
var op={
  host:'192.168.11.254',
  port:8080,
  method:'POST',
  path: "https://api.tinypng.com/shrink",
  auth: "api:" + key
};

// var options = require("url").parse("https://api.tinypng.com/shrink");
// options.auth = 
// options.method = "POST";
var tiny = exports = module.exports = function(path,outName){
  var input = fs.createReadStream(path);
  var output = fs.createWriteStream(outName);
  var request = https.request(options, function(response) {
    console.log(response.statusCode);
    if (response.statusCode === 201) {
      /* Compression was successful, retrieve output from Location header. */
      https.get(response.headers.location, function(response) {
        response.pipe(output);
      });
    } else {
      /* Something went wrong! You can parse the JSON body for details. */
      console.log("Compression failed");
    }
  });
  input.pipe(request);
};
tiny('./img/b/icon.png','./img/b/icon-a.png');
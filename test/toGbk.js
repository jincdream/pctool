var fs = require('fs');
var toGbk = require('../src/toGbk');
var read = fs.createReadStream('./src/c.html','utf-8')
var write = fs.createWriteStream('./src/writeGbk.html')
toGbk(read,write)

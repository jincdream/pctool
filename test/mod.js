var readModule = require('../src/readModule');
var obj = readModule('./src',['ig'])
console.log(obj.html)

var fs = require('fs');
var html = fs.readFileSync('./my.css','utf-8');
var t = html.replace(/\{\r\n/g,' {').
			replace(/\;\r\n/g,';').
			replace(/\;\t/g,'; ').
			replace(/\{\t/g,'{').
			replace(/\s\}/g,'}');
fs.writeFileSync('./pcMy.css',t,'utf-8');
console.log(t);
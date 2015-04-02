var fs = require('fs');
var path = require('path');

// var reload = module.exports = function(files,option){
//
// }

var reload = module.exports = function(_host,target,httpTarget){
	console.log(target,'reload Dir');

	var reloadFile = path.join(target,'./reload.html')

	var iframeUrl = httpTarget
	var p = path.resolve(__dirname,'./reload.html');
	var html = fs.readFileSync(p,'utf-8');
	html = html.replace(/\{\{src\}\}/g,iframeUrl)
				.replace(/\{\{host\}\}/g, _host);
	fs.writeFileSync(reloadFile,html,'utf-8');
};

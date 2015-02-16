var fs = require('fs');
var path = require('path');
var _host = require('os').networkInterfaces()['\u672C\u5730\u8FDE\u63A5'][1].address;



module.exports = function(src,outName){
	var reloadFile = path.join(outName,'../reload.html')
	var iframeUrl = path.basename(outName)
	var p = path.resolve(__dirname,'./reload.html');
	var html = fs.readFileSync(p,'utf-8');
	html = html.replace(/\{\{src\}\}/g,iframeUrl)
				.replace(/\{\{host\}\}/g, _host);
	fs.writeFileSync(reloadFile,html,'utf-8');
};

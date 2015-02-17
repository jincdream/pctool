var http = require('http');
var _host = require('os').networkInterfaces()['\u672C\u5730\u8FDE\u63A5'][1].address;
var server = http.createServer(function(req,res){
	var data = '';
	req.setMaxListeners(50);
	res.setMaxListeners(50);
	res.writeHead(200,{
		'Access-Control-Allow-Origin':'*',
		'Content-Type':'text/plain',
		"Cache-Control":"no-cache"
	});
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		process.send({img:data});
		console.log('Post end --- color : ' + data);
	});
	res.end();
}).listen(8004);
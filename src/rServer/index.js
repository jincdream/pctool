/*
  @Jin_C : A HTTP server use websocket to refresh .html
*/
	process.setMaxListeners(100);
	var os = require('os');
	var host = os.networkInterfaces().en0
		? os.networkInterfaces().en0[1].address
		: os.networkInterfaces()['\u672C\u5730\u8FDE\u63A5'][1].address

	var http = require('http');
	var server = http.createServer(function(req,res){
		req.setMaxListeners(100);
		res.setMaxListeners(100);
		res.writeHead(200,{
			'Access-Control-Allow-Origin':'*',
			'Content-Type':'text/event-stream',
			"Cache-Control":"no-cache",
			"Connection":"keep-alive"
		});
		process.on('message',function(data){
			console.log(data);
			if(data.data === 'css'){
				res.write("data: " + 'css' + "\n\n");
			}else{
				res.write("data: " + data.data + "\n\n");
			}
		});
	}).listen(8003,host);

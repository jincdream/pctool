var fs = require('fs');
var ph = require('path');
var url = require('url');
var mime = require('mime');
var iconv = require('iconv-lite');
var server = exports = {};
var readGbk = require('../readGbk');
var dirName = ph.resolve()
var gbk = {gbk:!1}

server.http = function(req,res){
		/**
		* url obj
		*
		{ protocol: null,
		slashes: null,
		auth: null,
		host: null,
		port: null,
		hostname: null,
		hash: null,
		search: '?opo=pppp&&v=00',
		query: 'opo=pppp&&v=00',
		pathname: '/try20141124/reload.html',
		path: '/try20141124/reload.html?opo=pppp&&v=00',
		href: '/try20141124/reload.html?opo=pppp&&v=00'
	}
	*/
	var path = url.parse(req.url).pathname;
	if(path === '/favicon.ico'){
		res.end();
		return;
	}else {
		server.render(path,req,res);
	}
};
console.log(dirName);


server.checkGbk = function(string){
	return string.indexOf('�') >= 0
}

server.render = function(path,req,res){
	var type = mime.lookup(path) || 'test/html';
	var oType = {
		'Content-Type' : type,
		'Access-Control-Allow-Origin':'*'
	};
	var fileName = ph.join(dirName,path)
	var read,write
	if(!server.gbk){
		read = fs.createReadStream(fileName)
		write = fs.createWriteStream('a')
		read.on('data',function(data){

		})
		if(server.checkGbk(read)){
			read = readGbk(fileName,req,res)
			oType['Content-Type'] += ';charset=gbk'
			console.log('gbk');
		}
	}
	// if(!!~req.url.indexOf('gbk')){
		// read = readGbk(ph.join(dirName,path),req,res)
		// oType['Content-Type'] += ';charset=gbk'
		// console.log('gbk');
	// }else{
	// 	oType['Content-Type'] += ';charset=utf-8'
	// 	oType.char = 'utf-8'
	// 	read = fs.createReadStream('.' + path,oType.char)
	// }

	res.writeHead(200,oType);
	read.on('error',function(err){
		console.log(err)
		res.writeHead(404,oType)
		res.end(new Buffer('404啦！funk'))
	})
	read.pipe(res);
};

// iconv.extendNodeEncodings();
module.exports = function(host,port){
	require('http').createServer(server.http).listen(port,host || '127.0.0.1');
	console.log(host+ ':' + port);
	return server
}
// iconv.undoExtendNodeEncodings();
// console.log(process.argv[1]);

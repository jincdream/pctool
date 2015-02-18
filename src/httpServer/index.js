var fs = require('fs');
var ph = require('path');
var url = require('url');
var mime = require('mime');
var iconv = require('iconv-lite');
var server = exports = {};
var dirName = ph.resolve()
var gbk = {gbk:!1}
var lst = new require('events').EventEmitter
console.log(lst);
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


server.readGbk = require('../readGbk');

server.checkGbk = function(string){
	return string.indexOf('�') >= 0
}

server.render = function(path,req,res){
	var startT = +new Date
	var type = mime.lookup(path) || 'text/html';
	var oType = {
		'Content-Type' : type,
		'Access-Control-Allow-Origin':'*'
	};
	var fileName = ph.join(dirName,path)
	var read,write
	var _readed = !0
	read = fs.createReadStream(fileName)
	write = fs.createWriteStream('a')

	if(server.gbk === 'all'){
		read.pipe(write)

		read.on('data',function(data){
			if(!_readed)return
			if(server.checkGbk(data.toString())){
				console.log('ggggggggggggg');
				oType['Content-Type'] += ';charset=gbk'
				res.writeHead(200,oType);
				server.readGbk(fileName).pipe(res)
				_readed = !1
				console.log(+new Date - startT);
			}
		})
		read.on('end',function(a){
			if(_readed){
				oType['Content-Type'] += ';charset=utf-8'
				res.writeHead(200,oType);
				fs.createReadStream(fileName).pipe(res)
				console.log('8888888888888888');
				console.log(+new Date - startT);
			}
		})
	}else if(server.gbk === 'utf-8'){
		oType['Content-Type'] += ';charset=utf-8'
		res.writeHead(200,oType);
		console.log(read)
		read.pipe(res)
		console.log('server.gbk --- %s',server.gbk)
		_readed = !1
		console.log(+new Date - startT);
	}else if(server.gbk === 'gbk'){
		oType['Content-Type'] += ';charset=gbk'
		res.writeHead(200,oType);
		server.readGbk(fileName).pipe(res)
		_readed = !1
		console.log(+new Date - startT);
	}


	// if(!server.gbk){
	// 	read = fs.createReadStream(fileName)
	// 	write = fs.createWriteStream('a')
	// 	read.on('data',function(data){
	//
	// 	})
	//
	// }else if(server.checkGbk(read)){
	// 		read = readGbk(fileName,req,res)
	// 		oType['Content-Type'] += ';charset=gbk'
	// 		console.log('gbk');
	//
	// }
	// if(!!~req.url.indexOf('gbk')){
		// read = readGbk(ph.join(dirName,path),req,res)
		// oType['Content-Type'] += ';charset=gbk'
		// console.log('gbk');
	// }else{
	// 	oType['Content-Type'] += ';charset=utf-8'
	// 	oType.char = 'utf-8'
	// 	read = fs.createReadStream('.' + path,oType.char)
	// }


	read.on('error',function(err){
		console.log(err)
		res.writeHead(404,oType)
		res.end(new Buffer('404啦！funk'))
	})
	// read.pipe(res);
};

// iconv.extendNodeEncodings();
module.exports = function(host,port,gbk){
	server.gbk = gbk || 'utf-8'
	require('http').createServer(server.http).listen(port,host || '127.0.0.1');
	console.log(host+ ':' + port);
	return server
}
// iconv.undoExtendNodeEncodings();
// console.log(process.argv[1]);

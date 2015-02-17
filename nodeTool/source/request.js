var _src = require('./config');
var fs = require('fs');
var ph = require('path');
var http = require('http');
var iconv = require('../iconv-lite');

var _path = ph.resolve();
auth=new Buffer('flyingzl:password').toString('base64')


_get = function(url,callback){
	var respont = http.get(url,function(res){
		res.on('data',function(chunk){
			fs.writeFile(_path + 'test.html',chunk,function(err){
				if (err) console.log(err);
			})
		});
	});
};
var src = _src['diannao'][0];
var op={
	host:'192.168.11.254',
	port:8080,
	method:'GET',
	path: src
};
var w = fs.createWriteStream(__dirname+'/web/test.html',{encoding:'utf-8'});
	w.setMaxListeners(50);
var req = http.request(op,function(msg){
	var data;
	req.setMaxListeners(50);
	msg.setMaxListeners(50);
	msg.on('data',function(chunk){
		data += chunk;
	});
	msg.pipe(iconv.decodeStream('gb2312'))
	   .pipe(iconv.encodeStream('utf-8'))
	   .collect(function(err,body){
	   		var html = body.toString();
	   		html = html.replace(/\<title\>(.*?)\：.*?\<\/title\>/,function(m,a){
	   			return '<title>' + a + ':{{title}}</title>';
	   		}).replace(/name=\"[Aa]uthor\"\scontent\=\".*?\"\>/,function(m,a,b){
	   			return 'name="author" content="cenjinchao_gz {{designer}}">';
	   		}).replace(/\<style\>[\S\s\r\n]*?\<\/style\>/,function(m){
	   			console.log(m)
	   			return '<link href="./my.css" rel="stylesheet" type="text/css">';
	   		});
	   	  	fs.writeFile(__dirname+'/web/test.html',html,function(e){console.log(e)})
	   });
	 //
	// msg.on('end',function(){
	// 	var str = iconv.encode(new Buffer(data),'gb2312');
	// 	fs.writeFile(__dirname+'/web/test.html',str,function(e){console.log(e)})
	// 	
	// })
}).on('error',function(e){
	console.log('e: '+e);
});
req.end();
/*
	option = {
		title: '',
		header: '',
		dsigner: ''
	}
	outName = out;
*/
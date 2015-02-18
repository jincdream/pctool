var src = require('./config');
var iconv = require('../iconv-lite');
var fs = require('fs');
var ph = require('path');
var http = require('http');

var _path = ph.resolve(__dirname,'./web/');
//proxy
var op={
	host:'192.168.11.254',
	port:8080,
	method:'GET'
};

var start = module.exports = function(outName,option,callback){
	var self = this;
	self._IN_HTML = '';
	self._IN_CSS = '';
	self._IN_JS = '';
	self.out = outName;
	self.op = option;
	if(option.mod){
		require('../module').mod.call(self);
	};
	self._get(option.web,function(){
		self.init(callback);
	});
	return self.modules;
};

start.prototype._get = function(name,callback){
	var self = this;
	// var w = fs.createWriteStream(__dirname+'/web/index.html',{encoding:'utf-8'});
	op.path = src[name][0];
	var req = http.request(op,function(msg){
		var data;
		req.setMaxListeners(50);
		msg.setMaxListeners(50);
		msg.on('data',function(chunk){
			data += chunk;
		});
		msg.pipe(iconv.decodeStream('gb2312'))
			.pipe(iconv.encodeStream('utf-8'))
			.collect(function(err,bf){
				var html = bf.toString();
				html = html.replace(/\<title\>(.*?)\：.*?\<\/title\>/,function(m,a){
					return '<title>' + a + ':{{title}}</title>';
				}).replace(/name=\"[Aa]uthor\"\scontent\=\".*?\"\>/,function(m,a,b){
					return 'name="author" content="{{myname}} {{designer}}">';
				}).replace(/\<style\>[\S\s\r\n]*?\<\/style\>/,function(m){
					return '<link href="./my.css" rel="stylesheet" type="text/css">';
				}).replace(/charset\=\"gb2312\"/,function(m){
					return 'charset="utf-8"';
				}).replace(/zt\_header\/index.html\"\>\<\/script\>/,function(m){
					return 'zt_header/index.html"></script>\r{{body}}\r{{modules}}\r{{js}}';
				});
				self.body = html;
				callback();
				req.end();
		   });
	}).on('error',function(e){
		console.log('e: '+e);
	});
	req.end();
};
/*
	option = {
		title: '',
		web: '',
		dsigner: ''
	}
	outName = out;
*/
start.prototype.init = function(callback){
	var self = this;
	var option = self.op;
	fs.mkdirSync(self.out);
	fs.mkdirSync(self.out + '/output');
	fs.mkdir(self.out + '/output/img');
	fs.mkdir(self.out + '/img');
	option.title = option.title || '缺少专题题目';
	option.dsigner = option.designer || 'none';
	self.initHtml(function(){
		self.initCss(callback);
	});
};

start.prototype.initHtml = function(next){
	var self = this;
	var option = self.op;
	var encode = 'utf-8';
	var output = '';
	var path = self.out + '/index.html';
	// var data = fs.readFileSync(_path + '/index.html',encode);
	var data = self.body;
	output = data.replace(/\{\{(.*?)\}\}/g,function(m,a){
		if(a === 'modules' && self.op.mod)return self._IN_HTML + self._IN_JS;
		if(!option[a])return '';
		return option[a];
	});
	fs.writeFile(path,output,encode,function(err){
		if(err)throw err;
		next();
	});
};

start.prototype.initCss = function(callback){
	var self = this;
	var path = self.out + '/my.css';
	var output = fs.readFileSync(_path + '/my.css');
	output = output.toString().replace(/\/\*module\*\//,function(m){
		if(self.op.mod)return '/*module*/' + self._IN_CSS;
	});
	fs.writeFile(path,output,function(err){
		if(err)throw err;
		callback();
	});
};

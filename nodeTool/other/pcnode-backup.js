var fs = require('fs');
var iconv = require('../iconv-lite');
var source = require('../source');
var http = require('http');
var nPath = require('path');

var pn = module.exports = {};

pn._path = function(path){
	var type = this._type(path);
	var fileName = this._fileName(path,type);
	var reg = new RegExp(fileName);
	if(type === '.html'){
		outName = path.replace(reg,'output/' + fileName);
	}else{
		outName = path.replace(reg,'output/' + fileName + '-min');
	}
	return outName;
	// var p = path.lastIndexOf('\/')+1;
	// var _p = path.lastIndexOf('.');
	// var fileName = path.substring(p,_p);
	// var reg = new RegExp(fileName);
	// var outName = path.replace(reg,fileName+'-min');
	// return outName;
};
pn._type = function(path){
	return nPath.extname(path);
};
pn._fileName = function(){
	return nPath.basename.apply(nPath,arguments);
};
pn._utfToGbk = function(path,callback){
	var outName = this._path(path);
	var self = this;
	var err = false;
	if(!callback)callback = function(a,b){console.log('No callback');};

	fs.readFile(path,{encoding:'utf-8'},function(err,data){
		if(err)throw err;
		var html;
		var buf;
		data = data.replace(/^\uFEFF/,'');
		html = data.toString();
		html = self.html(html);
		buf = iconv.encode(new Buffer(html),'gb2312');
		fs.writeFile(outName,buf,function(err){
			if(err)throw err;
			// iconv.extendNodeEncodings();
			// var str = fs.readFileSync(outName,'gb2312');
			// if(str[0] === '?'){
			// 	str = str.substring(1);
			// 	fs.writeFileSync(outName,str,'gb2312');
			// }
			// iconv.undoExtendNodeEncodings();
			callback(outName);
		});
	});
};

pn.start = function(dir,option){
/*
	option = {
		title: '',
		header: '',
		dsigner: '',
		host: ''
	}
*/	
	var self = this;
	var shell = require('child_process').exec;
	var host = option.host || "192.168.50.216/www/";
	var index = dir + '/index.html';
	var tool = new source(dir,option,function(){
		shell('start chrome "'+ host + dir.substring(2) + '/output/"');
		console.log(host + dir.substring(2) + '/output/');
		self._utfToGbk(index);
		self.css(dir + '/my.css');
		self._watch(index,function(ph){
			self._utfToGbk(ph);
		});
		self._watch(dir + '/my.css',function(ph){
			self.css(ph);
		});
	});
};

pn._watch = function(path,callback){
	var self = this;
	var watcher = fs.watch(path);
	watcher.on('change',function(e,n){
		callback(path,e,n);
	});
};
pn.watch = function(dir){
	var self = this;
	(function readDir(dir){
		fs.readdir(dir,function(err,files){
			if(err) throw err;
			if(!files)return;
			files.forEach(function(n,i,a){
				if(n === 'output')return;
				var p = nPath.resolve(dir,n);
				fs.stat(p,function(err,stats){
					var handle;
					var type = '';
					if(stats.isDirectory()){
						readDir(p);
					}else{
						type = self._type(p);
						if(type === '.html')handle = fHtml;
						if(type === '.css')handle = fCss;
						self._watch(p,handle);
					}
				});
			});
		});
	})(dir);
	function fHtml(path,e,name){
		self._utfToGbk(path,function(outName){
			console.log(name + ' is change. File export : ' + outName);
		});
	}
	function fCss(path,e,name){
		self.css(path);
	}
};
pn.css = function(path){
	var outName = this._path(path);
	var css = fs.readFileSync(path,'utf-8');
	css = css.replace(/\{\r\n/g,' {')
			 .replace(/\;\r\n/g,';')
			 .replace(/\;\t/g,'; ')
			 .replace(/\{\t/g,'{')
			 .replace(/\s\}/g,'}')
			 .replace(/\:\s/g,':');
	fs.writeFileSync(outName,css,'utf-8');
};

pn.html= function(html,js){
	var h = '';
	h = html.replace(/\"utf-8\"/,'"gb2312"')
		.replace(/\.\/my\.css/,"./my-min.css");
	if(js){
		h = replace(/\<\/body\>/,'<script src=""></script>\r</body>')
	}
	return h;
};

pn.server = function(){
	http.createHttpServer(function(req,res){
		res.end('sssssssssssssss');
	},8000);
};

pn.img = function(path,option){
	iconv.extendNodeEncodings();
	var encode = option.encode || 'gb2312';
	var color = option.color || 'ffffff';
	var outName = option.out || this._path(path);

	var html = fs.readFileSync(path,encode);
	var url = 'http://dummyimage.com/';
	var random = false;
	var p = color.length;

	if(typeof color !== 'string')random=true;
	html = html.replace(/\<img.*?\>/g,function(img){
		var widths = img.match(/width=\"(\d+)\"/);
		if(!widths)return img;
		var clr = random ? color[0|p*Math.random()] : color;
		var width = widths[1];
		var height = img.match(/height=\"(\d+)\"/)[1];
		var src = 'src="'+url+width+'x'+height+'/'+clr+'"';
		var n = img.replace(/src=\".*?\"/,src);
		// n = '<a href="#" title="" target="_blank">'+ n +'</a>';
		return n;
	});
	fs.writeFileSync(outName,html,encode);
	iconv.undoExtendNodeEncodings();
};
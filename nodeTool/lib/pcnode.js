var fs = require('fs');
var os = require('os');
var cp = require('child_process');
var http = require('http');
var nPath = require('path');
var iconv = require('../iconv-lite');
var source = require('../source');

var pn = module.exports = {};

var _host = os.networkInterfaces()['\u672C\u5730\u8FDE\u63A5'][1].address;
var drn = __dirname;

pn.reload = require('../reload');
pn.copy = require('../copy');
pn.watch = require('../watch');

pn.server = cp.fork(nPath.resolve(drn,'../server'));
pn.dummy = cp.fork(nPath.resolve(drn,'../dummy'));

pn._path = function(path){
	var type = this._type(path);
	var fileName = this._fileName(path,type);
	var reg = new RegExp(fileName);
	var op = 'output/';
	switch(type){
		case '.css':
			op += fileName + '-min';
			break;
		case '.jpg':
		case '.png':
		case '.gif':
			op += '/img/' + fileName;
			break;
		default:
			op += fileName;
	}
	outName = path.replace(reg,op);
	return outName;
	// if(type === '.html' || type === '.js'){

	// }else if(type === '.jpg' || type === '.png' || type === '.gif'){

	// }else{

	// }
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
pn._utfToGbk = function(path,callback,js){
	var outName = this._path(path);
	var self = this;
	var err = !1;
	if(!callback)callback = function(a,b){console.log('utfToGbk() No callback');};

	fs.readFile(path,{encoding:'utf-8'},function(err,data){
		if(err)throw err;
		var str = self.utfToGbk(data);
		fs.writeFile(outName,str,function(err){
			if(err)throw err;
			callback(outName);
		});
	});
};

pn.utfToGbk = function(data){
	var self = this;
	var string;
	var buf;
	data = data.replace(/^\uFEFF/,'');
	string = data.toString();
	string = self.html(string);
	buf = iconv.encode(new Buffer(string),'gb2312');
	return buf;
}

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
	var host = option.host || _host + '/';
	var index = nPath.resolve(dir + '/index.html');
	var src = 'http://' + host + dir.substring(2);
	var output = src + '/output/';
	var browser = option.firefox ? 'firefox' : 'chrome';

	self.index = index;
	self.op = option;
	self.modules = {};

	self._IN_HTML = '';
	self._IN_CSS = '';
	self._IN_JS = '';

	fs.exists(dir,function(exs){
		if(!exs){
			new source(dir,option,fHandle);
		}else{
			// if(option.mod)require('../module').mod.call(self);
			self.watch(dir);
			shell('start ' + browser + ' "'+ src + '/reload.html"');
		}
	});

	self.dummy.on('message',function(data){
		var op = {
			encode : 'utf-8',
			out : index
		};
		var color = data.img.toString().split(',');
		if(color.length !== 0)op.color = color;
		self.img(index,op);
	});

	function fHandle(){
		self._utfToGbk(index);
		self.css(dir + '/my.css');
		self.reload(output,dir + '/reload.html');
		self.watch(dir);
		shell('start ' + browser + ' "'+ src + '/reload.html"');
	}
};

pn._watch = function(path,callback){
	var self = this;
	var watcher = fs.watch(path);
	watcher.setMaxListeners(40);

	watcher.on('change',function(e,n){
		callback(path,e,n,0);
		self.server.send({data:'change'});
	});
	watcher.on('error',function(e,n){
		console.log(e,n)
	});
};

pn.css = function(path){
	var outName = this._path(path);
	var css = fs.readFileSync(path,'utf-8');
	css = css.replace(/\{\r\n/g,' {')
			 .replace(/\;\r\n/g,';')
			 .replace(/\;\t/g,'; ')
			 .replace(/\{\t/g,'{')
			 .replace(/\s\}/g,'}')
			 .replace(/\:\s/g,':')
			 .replace(/\s\s/g,' ')
			//2015.2.15
			 .replace(/\}\s\./g,'}\r\n.')
			 .replace(/\s\/\*/g,'\r\n/*')
			 .replace(/\*\/\s/g,'*/\r\n');
	fs.writeFileSync(outName,css,'utf-8');
};

pn.html= function(html,js){
	var h = '';
	var self = this;
	h = html.replace(/\"utf-8\"/,'"gb2312"')
			.replace(/\.\/my\.css/,"./my-min.css");
	// if(/\{\{(.*?)\}\}/.test(h)){
	// 	h = h.replace(/\{\{(.*?)\}\}/g,function(m,name){
	// 			var mod = self.modules[name];
	// 			console.log(mod.html)
	// 			if(mod)return mod.html + mod.js;
	// 			return '';
	// 		});
	// }
	if(js){
		h = replace(/\<\/body\>/,'<script src=""></script>\r</body>')
	}
	return h;
};

pn.staticHtml = function(html){
	var h = '';
}

pn.img = function(path,option){
	iconv.extendNodeEncodings();
	var encode = option.encode || 'gb2312';
	var color = option.color || 'ffffff';
	var outName = option.out || this._path(path);

	var html = fs.readFileSync(path,encode);
	var url = 'http://dummyimage.com/';
	var random = false;
	var p = color.length;
	console.log('c '+color)
	if(typeof color !== 'string'){
		random = !0;
		color = color.map(function(v,i,a){
			while(v.length<=5){
				var ln = v.length;
				switch(ln){
					case 0:
						v = 'ffffff';
					case 1:
					case 2:
					case 3:
						v += v;
						break;
					case 4:
					case 5:
						v += v.substring(0,1);
						break;
					default:
					 	break;
				}
			}
			if(v.length>6){
				v = v.substring(0,6);
			}
			return v;
		});
		console.log(color);
	};
	html = html.replace(/\<img.*?\>/g,function(img){
		var widths = img.match(/src=\".*?(\d*?)x(\d*?)\"/);
		if(!widths) widths = img.match(/src=\".*?(\d*?)x(\d*?)\/+.*?\"/);
		if(!widths) return img;
		var clr = random ? color[0|p*Math.random()] : color;
		var width = widths[1];
		var height = widths[2];
		var wh = 'width="' + width + '" height="' + height +'" '
		var src = 'src="'+url+width+'x'+height+'/'+clr+'"';
		var n = img.replace(/\s*width=\".*?\"/,'')
							 .replace(/\s*height=\".*?\"/,'')
							 .replace(/src=\".*?\"/,wh + src);
		// n = '<a href="#" title="" target="_blank">'+ n +'</a>';
		return n;
	});
	fs.writeFileSync(outName,html,encode);
	iconv.undoExtendNodeEncodings();
};

var fs = require('fs');
var iconv = require('../iconv-lite');
var source = require('../source');
var http = require('http');
var pn = {};

pn._path = function(path){
	var p = path.lastIndexOf('\/')+1;
	var _p = path.lastIndexOf('.');
	var fileName = path.substring(p,_p);
	var reg = new RegExp(fileName);
	var outName = path.replace(reg,fileName+'-min');
	return outName;
};
pn.css = function(path){
	var outName = this._path(path);
	var css = fs.readFileSync(path,'utf-8');
	var t = css.replace(/\{\r\n/g,' {')
				.replace(/\;\r\n/g,';')
				.replace(/\;\t/g,'; ')
				.replace(/\{\t/g,'{')
				.replace(/\s\}/g,'}')
				.replace(/\:\s/g,':');
	fs.writeFile(outName,t,'utf-8');
};
/*
option{
	encode:'gb2312',
	[file:'./xx/xx.xx' || 'xx.'],
	[color:[] || 'ffffff'];
}
*/
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
	// html = html.replace(/\.\/my\.css/,"./my-min.css");
	html = html.replace(/\<img.*?\>/g,function(img){
		var widths = img.match(/width=\"(\d+)\"/);
		if(!widths)return img;
		var clr = random ? color[0|p*Math.random()] : color;
		var width = widths[1];
		var height = img.match(/height=\"(\d+)\"/)[1];
		var src = 'src="'+url+width+'x'+height+'/'+clr+'"';
		var n = img.replace(/src=\".*?\"/,src);
		n = '<a href="#" title="" target="_blank">'+ n +'</a>';
		return n;
	});
	fs.writeFileSync(outName,html,encode);
	iconv.undoExtendNodeEncodings();
};

pn.start = function(outName,option){
/*
	option = {
		title: '',
		header: '',
		dsigner: ''
	}
*/
	
	var tool = new source(outName,option);
	var shell = require('child_process').exec;
	shell('start chrome "192.168.50.216/www/'+outName.substring(2)+'"');
	console.log("192.168.50.216/www/"+outName.substring(2));
};
pn.data = function(path) {
	var outName = this._path(path);
	iconv.extendNodeEncodings();
	var str = fs.readFileSync(path,'gb2312');
	var i = 0;
	var k = 1;
	var pr = '';
	str = str.replace(/\r|\s/g,'').replace(/\{(.*?)\>(.*?)\}/g,function(m,a,city){
		var s = '';
		var wrap = '";\r';
		var left = '';
		if(pr !== a){
			pr = a;
			if(i === 0)wrap = '';
			s = wrap + 'data[' + (i++) + ']=\"';
			k = 1;
		}
		left = (k++)%2 === 0? 'right' : 'left';
		city = city.split('+').map(function(v,i,a){
			var el = '<p>';
			var elEnd = '</p>';
			if(i==0)el = '<h3>',elEnd = '</h3>';
			return el + v + elEnd;
		}).join('||');
		city = city.replace(/\|\|/g,function(){
			return '';
		});
		return s += '<li class=\''+left+'\'>' + city + '</li>'; 
	});
	fs.writeFileSync(outName,'var data = [];\r' + str + '";','gb2312');
	iconv.undoExtendNodeEncodings();
};

pn.watch = function(path,callback){
	var self = this;
	var watcher = fs.watch(path);
	watcher.on('change',function(){
		self._utfToGbk(path,function(outName){
			
		});
	});
};
pn._utfToGbk = function(path,callback){
	var outName = this._path(path);
	var read = fs.createReadStream(path);
	var write = fs.createWriteStream(outName);

	var err = false;
	if(!callback)callback = function(a,b){console.log('No callback');};

	fs.readFile(path,{encoding:'utf-8'},function(err,data){
		if(err)throw err;
		buf = iconv.encode(data,'gb2312');
		fs.writeFile(outName,buf,function(err){
			if(err)throw err;
			iconv.extendNodeEncodings();
			var str = fs.readFileSync(outName,'gb2312');
			if(str[0] === '?')str = str.substring(1);
			fs.writeFileSync(outName,str,'gb2312');
			iconv.undoExtendNodeEncodings();
			callback(outName);
		});
	});
};

	// if(Buffer.isEncoding('utf-8')){
	// 	read.pipe(iconv.decodeStream('utf-8'))
	// 	    .pipe(iconv.encodeStream('gb2312'))
	// 	    .pipe(write);
	// }
	// read.on('end',function(){
	// 	console.log(write.buffer);
	// });
	// read.on('error',function(err){
	// 	throw err;
	// });
module.exports = pn;

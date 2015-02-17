var fs = require('fs');
var nPath = require('path');
module.exports = function (dir){
	var self = this;
	var unlink;
	// self._watch(dir,fWhenCreate);
	(function readDir(dir){
		fs.readdir(dir,function(err,files){
			if(err) throw err;
			if(!files)return;
			files.forEach(function(n,i,a){
				var p = nPath.resolve(dir,n);
				if(n === 'output' || n === 'images' || n === 'reload.html')return;
				if(n === 'img')self._watch(p,fWhenCreate);
				fs.stat(p,function(err,stats){
					if(stats.isDirectory()){
						readDir(p);
					}else{
						handle(p);
					}
				});
			});
		});
	})(dir);
	function handle(p){
		var handle;
		var type = self._type(p);
		switch(type){
			case '.html':
				handle = fHtml;
				break;
			case '.css':
				handle = fCss;
				break;
			case '.jpg':
			case '.png':
			case '.gif':
				handle = fCopyImg;
				break;
			default:
				handle = fCopyFile;
				break;
		}
		self._watch(p,handle);
	}
	function fHtml(path,e,name){
		self._utfToGbk(path,function(outName){
			console.log(name + ' is change. File export : ' + outName);
		});
	}
	function fCss(path,e,name){
		self.css(path);
		console.log('css change.');
	}
	function fCopyImg(path,e,name){
		var outName = nPath.join(path,'../../output/img/') + name;
		self.copy(path,outName);
		console.info(outName + ' is Copy.');
		// self.copy(path);
		//文件被删除，会发生rename事件，且name值为null
	}
	function fCopyFile(path,e,name){
		var outName = nPath.join(path,'../output/') + name;
		self.copy(path,outName);
		console.info(outName + ' is Copy.');
	}
	function fWhenCreate(path,e,name){
		if(name === 'images')return;

		var aPath = path.split(nPath.sep);
		var dir = aPath[aPath.length-1] === 'img' ?
				  '../output/img/':
				  './output/';
		var outName = nPath.join(path,dir) + name;

		if(!name){
			console.log(unlink + ' is deleted');
			fs.unlink(unlink);
			return;
		}
		if(e === 'change' || (e === 'rename' && name)){
			unlink = outName;
			self.copy(path + '/' + name,outName);
		}
		console.info(outName + ' is created.');
	}
};
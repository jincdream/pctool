var fs = require('fs');
var ph = require('path');
function _mod(mName){
	var _html = '';
	var _css = '';
	var _js = '';
	var self = this;
	var dirName = ph.resolve(__dirname,'../../modules',mName);
	function handle(p,cb){
		var data = fs.readFileSync(p);
		var type = ph.extname(p);
		var str = data.toString();
		switch(type){
			case '.html':
				_html += str + '\r';
				self._IN_HTML += str + '\r';
				break;
			case '.css':
				_css += str + '\r';
				self._IN_CSS += str + '\r';
				break;
			case '.js':
				_js += '<script>\r' + str + '\r</script>\r';
				self._IN_JS += '<script>\r' + str + '\r</script>\r';
				break;
			default:
				console.log("It's not a html/js/css file in modules");
				break;
		}
	}
	(function readDir(dir){
		var files = fs.readdirSync(dir);
		if(!files)return;
		for(var i = 0 ; i < files.length ; i++){
			var p = ph.resolve(dir,files[i]);
			var stats = fs.statSync(p);
			if(stats.isDirectory()){
				readDir(p);
			}else{
				handle(p);
			}
		}
	})(dirName);
	return {
		html : _html,
		css : _css,
		js : _js
	}
};
module.exports.mod = function(){
	var self = this;
	self.modules = {};
	self.op.mod.forEach(function(name,i,a){
		self.modules[name] = _mod.call(self,name);
	});
};
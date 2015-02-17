var fs = require('fs');

module.exports = function(path,out){
	fs.readFile(path,'binary',function(err,data){
		if(err)console.log(err);
		fs.writeFile(out,data,'binary',function(err){
			if(err)console.log(err);
		});
	});
}
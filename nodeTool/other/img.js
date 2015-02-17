var iconv = require('./iconv-lite');
iconv.extendNodeEncodings();

var fs = require('fs');

var html = fs.readFileSync('./index.html','gb2312');

var t = html.match(/(\<img.*?\s\/\>)/g);
var url = 'http://dummyimage.com/';
html = html.replace(/\<img.*?\s\/\>/g,function(img){
	var widths = img.match(/width=\"(\d+)\"/);
	if(!widths)return img;
	var width = widths[1];
	var height = img.match(/height=\"(\d+)\"/)[1];
	var n = img.replace(/src=\".*?\"/,'src="'+url+width+'x'+height+'"');
	return n;
});
fs.writeFileSync('./index2.html',html,'gb2312');
fs.createReadStream("./index.html").pipe(iconv.decodeStream('gb2312')).pipe(iconv.encodeStream('gb2312')).pipe(fs.createWriteStream('./index3.html'));
iconv.undoExtendNodeEncodings();
// fs.writeFileSync('./index2.html',html);
// fs.createReadStream('./index.html')
// .pipe(iconv.decodeStream('utf-8'))
// .pipe(iconv.encodeStream('gb2312'))
// .pipe(fs.createWriteStream('./index3.html'));
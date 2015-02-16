var fs = require('fs');
var ph = require('path');
var iconv = require('iconv-lite');
module.exports = function(path,req,write){
  iconv.extendNodeEncodings();
  var read = fs.createReadStream(path,'gbk')
  iconv.undoExtendNodeEncodings();
  return read
}

var fs = require('fs');
var ph = require('path');
var iconv = require('iconv-lite');
module.exports = function(read,write){
  iconv.extendNodeEncodings();
  read.pipe(iconv.decodeStream('utf-8')).pipe(iconv.encodeStream('gbk')).pipe(write)
  read.on('error',function(err){
    console.log(err);
  })
  iconv.undoExtendNodeEncodings();
  return read
}

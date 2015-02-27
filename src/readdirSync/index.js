var fs = require('fs')
var path = require('path')
var _ignore = function(files,p){
  var f = ['node_modules'].concat(files)
  var test = !1
  test = f.some(function(v,i,a){
    return !!~p.indexOf(v)
  })
  console.log(f,test,files);
  return test
}
/*
  handle--> function(path)
*/
var readdirSync = function(dir,ignore,handle){
  var files = fs.readdirSync(dir);
  if (files.length === 0 || !files) return;
  var i = 0,ln = files.length;
  for (; i < ln; i++) {
    var p = path.resolve(dir, files[i]);
    var stats = fs.statSync(p);
    if (stats.isDirectory()) {
      //文件夹过滤条件
      // if(/output/.test(p) || /node_modules/.test(p))continue;
      if(_ignore(ignore,p))continue;
      readdirSync(p,ignore,handle);
    } else {
      handle(p);
    }
  }
}
module.exports = readdirSync

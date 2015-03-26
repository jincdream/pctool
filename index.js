var fs = require('fs');
var ph = require('path');
var mod = require('./module');
var reload = require('reload');
var child = require('child_process');
var server = child.fork('./node_modules/rServer');
var httpServer = require('httpServer');


var mainHtml = [
  './xiangce-one.html',
  './xiangce-photo.html',
  './xiangce-add.html',
  './xiangce.html'
  ]
var change = mainHtml[0].split('/')
change = change[change.length-1]
var output = []

var ip = (function () {
  var interwork = require('os').networkInterfaces();
  var _host = interwork.en0;//mac os
  _host = !!_host ? interwork.en0 : interwork['本地连接'];//windows
  return _host[1].address;
})();

mainHtml.forEach(function(v,i,a){
  output[i] = ph.join('./output',v)
})


var content = mod(ph.resolve('./module'))

console.log(ph.resolve('./module'));
var block = function(){
  var content = mod(ph.resolve('./module'))
  mainHtml.forEach(function(v,i,a){
    var file = ph.resolve(v)
    var data = fs.readFileSync(file).toString()
    var reg = /\{\{(.*?)\}\}/g
    // data = data.replace(/\{\{(.*?)\}\}/g,function(m,mod){
    //   console.log(mod,3);
    //   return content[mod]
    // })
    data = readMod(data,reg,content)
    fs.writeFile(output[i],data,function(x){
      if(x)console.log(x);
    })
  })
}

var readMod = function(str,reg,content){
  str = str.replace(reg,function(m,mod){
    console.log(mod,4);
    return readMod(content[mod],reg,content)
  })
  return str
}

var watch = function(path,css){
  var watcher = fs.watch(path)
  var handle = css=== '.css' ? cssWt : fileWt
  watcher.setMaxListeners(140);
  watcher.on('change',handle)
  watcher.on('error',function(e){
    console.log(e);
  })
}
var fileWt = function(e,n){
  console.log(e,n);
  block()
  if(!!~mainHtml.indexOf('./'+n))change = n
  server.send({data:change})
}
var cssWt = function(e,n){
  console.log(e,n);
  server.send({data:'css'})
}
var _p = ph.resolve()
//add watch
var readDir = function(dir) {
  var files = fs.readdirSync(dir);

  if (!files) return;
  for (var i = 0; i < files.length; i++) {
    var p = ph.resolve(dir, files[i]);
    var stats = fs.statSync(p);
    if (stats.isDirectory()) {
      if(/output/.test(p) || /node_modules/.test(p))continue;
      readDir(p);
    } else {
      watch(p,ph.extname(p))
    }
  }
};
block()
readDir(_p)
reload(ip,ip + ':10086',output[0])
httpServer()

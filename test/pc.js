"use strict"
var fs = require('fs');
var ph = require('path');
var reload = require('../src/reload');
var child = require('child_process');
var server = child.fork('../src/rServer');
var httpServer = require('../src/httpServer');
var readDirSync = require('../src/readdirSync');
var changeBug = 0
console.log(ph.resolve(),' -pc');
/*
  @Jin_C :
  @Param : option @Object
    -->{
      target: 'target dir src' ,
      [output: 'output dir name' || 'output' ,]

    }
*/
var pcTool = function(option){
  var _self = this
  fs.exists(option.target,function(exs){
    if(!exs){

    }else{

    }
  })
  for(var n in option){
    _self[n] = option[n]
  }
  _self.watchDir()
}
pcTool.prototype.readDirSync = function(handle){
  var _self = this
  readDirSync(_self.target,_self.ignore || [''],handle)
}
pcTool.prototype.watchDir = function(){
  var _self = this
  _self.readDirSync(function(path){
    var watcher = fs.watch(path)
    var handle = ph.extname(path) === '.css' ? _self.cssFileHandle : _self.otherFileHandle
    var changeBug = 0
    watcher.setMaxListeners(150)

    watcher.on('change',function(eventN,name){
      (++changeBug) >= 2 && (changeBug = 0,(handle.call(_self,path,eventN,name)))
    });

    watcher.on('error',function(e,n){
      console.log(e,n)
    });
  })
}
pcTool.prototype.otherFileHandle = function(path,eventN,file){
  var _self = this
  console.log( file +' is change:: event' + eventN)
  _self.watchHandle(path,eventN,file)
}

pcTool.prototype.cssFileHandle = function(path,eventN,file){
  var _self = this
  console.log( file +' is change:: event' + eventN)
  _self.watchHandle(path,eventN,file)
}

pcTool.prototype.watchHandle = function(path,eventN,file){
  console.log(path,eventN,file);
}
module.exports = function(option){
  new pcTool(option)
}
new pcTool({
  target: './src/',
  ignore: ['ig']
})

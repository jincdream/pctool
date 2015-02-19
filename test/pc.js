"use strict"
var fs = require('fs');
var ph = require('path');
var reload = require('../src/reload');
var child = require('child_process');
var server = child.fork('../src/rServer');
var httpServer = require('../src/httpServer');
var readDirSync = require('../src/readdirSync');
var changeBug = 0
var log = console.log

Object.prototype.log = function(name){
  log.call(console,this[name],' -' + name)
}

console.log = function(object,tag){
  var str = ''
  var _tag = ''
  arguments
  if(Array.isArray(object)){
    _tag = 'isArray'
  }else{
    _tag = object.name
  }
  log.apply(console,[object,'  -' + (tag || _tag)])
}
console.log(ph.resolve(),'pc');
/*
  @Jin_C :

  @Param : option @Object
    -->{
      target: 'target dir src' ,
      [output: 'output dir name' || './output' ,]
        --> !! --> option.target = ph.join(ph.resolve(),option.target)
    }
*/
var pcTool = function(option){
  var _self = this
  option.target = ph.join(ph.resolve(),option.target)
  option.log('target')
  for(var n in option){
    _self[n] = option[n]
  }
  _self.output = _self.path(option.output || './output')
  // console.log(option.target + ' -target');

  fs.exists(option.target,function(exs){
    if(!exs){
      _self.initDir(_self.watchDir)
    }else{
      _self.watchDir()
    }
  })
}
pcTool.prototype.path = function(src,target){
  return ph.join(target || this.target,src)
}
pcTool.prototype.initDir = function(next){
  var _self = this
  _self.outputSrc = _self.path('./output')
  _self.moduleSrc = _self.path('./module')
  fs.mkdirSync(_self.target)
  fs.mkdir(_self.outputSrc,function(err){
    if(err) throw new Error(err)
    fs.createWriteStream(_self.path('./a.html'))

    next && next.call(_self)
    // fs.mkdir()
  })
  fs.mkdir(_self.moduleSrc,function(err){
    if(err) throw new Error(err)
  })
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
/*
  @Jin_C :
  @Param : option @Object
    -->{
      target: 'target dir src' ,
      [output: 'output dir name' || 'output' ,]

    }
*/
;new pcTool({
  target: './ttt/',
  ignore: ['ig']
})

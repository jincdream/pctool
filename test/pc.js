"use strict"
var port = 10086

var fs = require('fs');
var os = require('os');
var ph = require('path');
var child = require('child_process');
var shell = child.exec;

var thisPath = '/Users/cenjinchao/pctool/'
var _path = function(path){
  return ph.join(thisPath,path)
}
global._host = os.networkInterfaces().en0
    ? os.networkInterfaces().en0[1].address
    : os.networkInterfaces()['\u672C\u5730\u8FDE\u63A5'][1].address

var reload = require(_path('./src/reload'));
var rServer = child.fork(_path('./src/rServer'));
var httpServer = require(_path('./src/httpServer'));
var readModule = require(_path('./src/readModule'));
var readDirSync = require(_path('./src/readdirSync'));

var log = console.log

Object.prototype.log = function(name){
  log.call(console,this[name],' -' + name)
}

console.log = function(object,tag){
  var str = ''
  var _tag = ''

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
      mainHtml: ['./a.thml','./b.html'],
      [reg: /\{\{(.*?)\}\}/g ,] -> ps: module reg like {{module}}
    }
*/

var pcTool = function(option){
  var _self = this


  _self.host = _host + ':' + port + '/'
  _self.httpTarget = ph.join(_self.host,option.target)

  option.target = ph.join(ph.resolve(),option.target)
  option.log('target')
  for(var n in option){
    _self[n] = option[n]
  }
  _self.output = _self.path(option.output || './output')
  _self.outputSrc = _self.path('./output')
  _self.moduleSrc = _self.path('./module')

  _self.change = _self.mainHtml[0].split('/')
  _self.change = _self.change[_self.change.length-1]
  _self.outHtml = []
  _self.mainHtml.forEach(function(v,i,a){
    _self.outHtml[i] = ph.join(_self.target,'./output/' + v)
    _self.mainHtml[i] = _self.path(v)
  })

  _self.ignore.push('output')
  // console.log(option.target + ' -target');

  fs.exists(option.target,function(exs){
    if(!exs){
      _self.initDir(_self.watchDir)
      _self.reload()
    }else{
      _self.watchDir()
    }
  })
  shell('open -a Google\\ Chrome "'+_self.httpPath('./reload.html')+'"')
  httpServer(_host,port,'all')
}
pcTool.prototype.path = function(src,target){
  return ph.join(target || this.target,src)
}
pcTool.prototype.httpPath = function(src,target){
  return 'http://' + ph.join(target || this.httpTarget,src)
}
pcTool.prototype.initDir = function(next){
  var _self = this
  fs.mkdirSync(_self.target)
  fs.mkdir(_self.outputSrc,function(err){
    if(err) throw new Error(err)
    fs.createWriteStream(_self.path('./index.html'))

    next && next.call(_self)
    // fs.mkdir()
  })
  fs.mkdir(_self.moduleSrc,function(err){
    if(err) throw new Error(err)
  })
}
pcTool.prototype.readDirSync = function(handle){
  var _self = this
  readDirSync(_self.target,_self.ignore || ['output'],handle)
}
pcTool.prototype.watchDir = function(){
  var _self = this
  _self.readDirSync(function(path){
    var watcher = fs.watch(path)
    var handle = ph.extname(path) === '.css' ? _self.cssFileHandle : _self.htmlFileHandle
    var changeBug = 0
    watcher.setMaxListeners(150)

    watcher.on('change',function(eventN,name){
      console.log(changeBug,'bugggg');
      (++changeBug) > 0 && (changeBug = 0,(handle.call(_self,path,eventN,name)))
    });

    watcher.on('error',function(e,n){
      console.log(e,n)
    });
  })
}
pcTool.prototype.htmlFileHandle = function(path,eventN,file){
  var _self = this
  console.log( file +' is change:: event ' + eventN)
  _self.watchHandle(path,eventN,file)
  console.log(file,'cgfffffff');
  _self.send()
}

pcTool.prototype.cssFileHandle = function(path,eventN,file){
  var _self = this
  console.log( file +' is change:: event ' + eventN)
  _self.watchHandle(path,eventN,file)
}

pcTool.prototype.watchHandle = function(path,eventN,file){
  var _self = this
  var reg = _self.reg || /\{\{(.*?)\}\}/g
  var mod = _self.readModule(_self.moduleSrc,_self.ignore)
  _self.mainHtml.forEach(function(_file,i,a){
    var data = fs.readFileSync(_file).toString()
    var readMod = function(str,reg,content){
      str = str.replace(reg,function(m,mod){
        return readMod(content[mod] || '',reg,content)
      })
      return str
    }
    // data = data.replace(/\{\{(.*?)\}\}/g,function(m,mod){
    //   console.log(mod,3);
    //   return content[mod]
    // })
    data = readMod(data,reg,mod.html)
    fs.writeFile(_self.outHtml[i],data,function(x){
      if(x)console.log(x);
    })
  })
  console.log(path,eventN,file);
}
pcTool.prototype.readModule = readModule
pcTool.prototype.out = function(){
  var _self = this
}
pcTool.prototype.reload = function(path,eventN,file){
  var _self = this
  reload(_self.target,_self.httpPath('./output/'+ _self.change))
}
pcTool.prototype.send = function(){
  rServer.send({data:this.change});
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
  target: './ttt2/',
  mainHtml: ['index.html'],
  ignore: ['ig']
})

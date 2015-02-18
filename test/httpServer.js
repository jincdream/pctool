var http = require('../src/httpServer');
var ip = (function () {
  var interwork = require('os').networkInterfaces();
  var _host = interwork.en0;//mac os
  _host = !!_host ? interwork.en0 : interwork['本地连接'];//windows
  return _host[1].address;
})();
/*
  @Jin_C : http server,support gbk and utf-8.
  @param
   --> ip @number
   --> port @number
   --> [true,false,'all'] @bullen or string
  @return undefined
*/
http(ip,10086,'all')

var http = require('../src/httpServer');
var ip = (function () {
  var interwork = require('os').networkInterfaces();
  var _host = interwork.en0;//mac os
  _host = !!_host ? interwork.en0 : interwork['本地连接'];//windows
  return _host[1].address;
})();

http(ip,10086)

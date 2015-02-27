var block = {}
var fs = require('fs');
var ph = require('path');
var readdirSync = require('../readdirSync')

var htmlBlock = function(dataObj,reg){
  dataObj.forEach(function(v,i,a){
    var fileNmae = v.name
    var str = v.data
    block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' + fileNmae + ' end -->'
  })
  return block
  // block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' +
  // fileNmae + ' end -->'
}
var html = [],
  css = [],
  js = []

var handle = function(path) {
  var data = fs.readFileSync(path)
  var type = ph.extname(path)
  var str = !data ? '' : data.toString()
  var fileNmae = ph.basename(path).split('.')[0]
  var dataObj = {
    path: path,
    name: fileNmae,
    data: str
  }
  switch (type) {
    case '.html':
      html.push(dataObj)
        // block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' +
        //   fileNmae + ' end -->'
      break;
    case '.css':
      css.push(dataObj)
        // css += str + '\r';
      break;
    case '.js':
      js.push(dataObj)
        // js += '<script>\r' + str + '\r</script>\r';
      break;
    default:
      console.log("It's not a html/js/css file in modules");
      break;
  }
}
var readModule = module.exports = function(dirname, ignore) {
  console.log('"' + dirname, '" -> module file name');
  readdirSync(dirname, ignore, handle)
  return {
    html: htmlBlock(html) /*,*/
      // css: cssBlock(css),
      // js: jsBlock(js)
  }
}

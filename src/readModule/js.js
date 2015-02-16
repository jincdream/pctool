var block = {}
module.exports = function(dataObj){
  dataObj.forEach(function(v,i,a){
    var fileNmae = block[v.name]
    var str = v.data
    block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' +
    fileNmae + ' end -->'
  })
  return block
  // block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' +
  // fileNmae + ' end -->'
}

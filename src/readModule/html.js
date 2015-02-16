var block = {}
module.exports = function(dataObj,reg){
  dataObj.forEach(function(v,i,a){
    var fileNmae = v.name
    var str = v.data
    block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' + fileNmae + ' end -->'
  })
  return block
  // block[fileNmae] = '<!-- ' + fileNmae + ' -->\r' + str + '\r<!-- ' +
  // fileNmae + ' end -->'
}

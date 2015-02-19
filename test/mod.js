var readModule = require('../src/readModule');
/*
  @Jin_C : load module
  @Function name : readModule
  @Param:
    --> module file src @String
    --> ignore file src @Array[string]
  @Return: module @Object
    -->{
       js: {
          fileName: 'fileString'
        },
       css: {
          fileName: 'fileString'
        },
       html: {
          fileName: 'fileString'
        }
    }
*/
var obj = readModule('./src',['ig'])
console.log(obj)

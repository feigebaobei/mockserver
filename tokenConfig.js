/**
 * 这是master环境的配置
 */



// const tokenSDKServer = require('token-sdk-server')
// const path = './importConfig.js'
// tokenSDKServer.config(path)
// console.log('234')

const fs = require('fs')

const rootPath = 'tokenSDKData'
// 递归删除path下的所有文件
let emptyDir = (path) => {
  // let a = fs.accessSync(path)
  // if (!a) {return true}
  try {
    fs.accessSync(path)
    var files = fs.readdirSync(path)
    files.forEach((file) => {
      var state = fs.statSync(`${path}/${file}`)
      if (state.isDirectory()) {
        emptyDir(`${path}/${file}`)
      } else {
        fs.unlinkSync(`${path}/${file}`)
      }
    })
  } catch (e) {
    return false
  }
}
// 递归删除path下的所有空目录
let rmEmptyDir = (path) => {
  try {
    fs.accessSync(path)
    let files = fs.readdirSync(path)
    if (files.length > 0) {
      var tempFile = 0
      files.forEach((file) => {
        tempFile++
        rmEmptyDir(`${path}/${file}`)
      })
      if (tempFile == files.length) {
        fs.rmdirSync(path)
      }
    } else {
      fs.rmdirSync(path)
    }
  } catch (e) {
    return false
  }
}
/**
 * 配置sdk需要的环境。
 * 先删除tokenSDKData下的所有目录，再创建新的目录结构。没有文件。
 * path是配置文件的路径
 * @param  {[type]} configPath [description]
 */
// let config = function (configPath) {
let didttm = {"nickname":"plainadid","did":"did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11","data":"0x1f521bd208c2f69ef5fc90c9b706eb972efca67a20b37932c18a3796a60bfb760f818cfcf506c6da7bb413255addfd44d63ebde1ed3fe258fd42f83b8399aeaf8c2ad263439122dba6410ec40fd0e826523fa152e1773c96ca0d79e8309e950a11126fe0b68c32ae93a64d7f5e8ecc88703bbfbd627d887acfbfa4621afe9da9840055abf7d73a0b297c0c62ac67fec3ea9b17c4468f68dda7a631fe8633984692e18c234d6f32d842d25c54c80dd418420b6d1b0376a950b6734e4b4682c9970dbbbf90f859a77a06f155a71af3b1203e32038d7d18bb1c529d730432bc3951efa17f26cb86040cb0723ebf171bd5fe"}
let idpwd = '1234qwerA'
let config = function (didttm, idpwd) {
  // console.log('from config')
  // return
  // if (!configPath) {
  //   throw new Error('config file path is error')
  // }
  // configPath = path.relative(__dirname, configPath)
  // console.log(configPath)
  // let {didttm, idpwd} = require(configPath)
  // console.log(didttm, idpwd)
  // 删除旧数据。
  emptyDir(`${rootPath}`)
  rmEmptyDir(`${rootPath}`)
  // 创建新数据。
  fs.mkdirSync(`${rootPath}`)
  // fs.mkdirSync(`${rootPath}/businessLicense`) // 不需要保存营业执照的图片了。
  let pcStr = ''
  // if (didttm && idpwd) {
  //   // let dtStr = '{'
  //   // for (let key of Object.keys(didttm)) {
  //   //   dtStr += `"${key}":"${didttm[key]}",`
  //   // }
  //   // dtStr = dtStr.slice(0, -1)
  //   // dtStr += '}'
  //   // pcStr = `let didttm = ${dtStr}\nlet idpwd = '${idpwd}'\nmodule.exports = {didttm, idpwd}`

  //   // let dtStr = '{'
  //   // pcStr = `let didttm = ${JSON.stringify(didttm)}\nlet idpwd = '${idpwd}'\nmodule.exports = {didttm, idpwd}`
  // }
  pcStr = `let didttm = ${JSON.stringify(didttm)}\nlet idpwd = '${idpwd}'\nmodule.exports = {didttm, idpwd}`
  console.log('pcStr', pcStr)
  fs.writeFileSync(`${rootPath}/privateConfig.js`, pcStr)
  fs.writeFileSync(`${rootPath}/pvdataCt.txt`, '')
}

config(didttm, idpwd)
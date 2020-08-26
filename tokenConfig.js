/**
 * 这是dev环境的配置
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
let didttm= {"data":"0x8e1b74747510fcc658d0577a102f5c9f5258d693c815a1340a0619b9fd57859cd6133d92e8b489ee238e52b6b88696c0acf6d0c69aee8c1ace8e7639639ea4d52c19092219b2bb800bd6e7ce6f634a2ba953b0d2db12c5ed2b61ed50c796d8f67ff0a1c0edba5ca114aef885b8b32d0779b6ae93b20416280b1603812aa19b2ff9ebf8e966864f952e543431864fd3a2b825af410253f99141f5c4609ee09ddb041ef35df45cf64dd3f43dd0e013444416e9bc67002d1085d3ed30e9cdf21bd12cffa7dda21e9f372201ff520db8a3d7f881b9a41a9851bf65a845f7d008f94c22f447e678323db38b89189b5ea6624f","did":"did:ttm:a0d931d76818589a79f63bd2576d867bf45bd6464be9800998ecf8427e8344","nickname":"adid"}
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
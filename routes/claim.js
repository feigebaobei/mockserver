var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var config = require('../lib/config')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

router.route('/applyCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // 在服务端处理申请证书需要的4个参数
    let templateId = req.body.templateId
    templateId = 't001'
    let certifyData = req.body.certifyData // eg: {name: '', gender: ''}
    let expire = req.body.expire // 过期时间
    let hashCont = ''
    // 这个did应该从session中提取。
    let did = 'u043829681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    // let sign = req.body.sign
    let sign = ''
    tokenSDKServer.getTemplate(templateId).then(response => {
      // console.log('response', response)
      let {desc} = response.data.data
      for (let [key, value] of Object.entries(certifyData)) {
        let reg = new RegExp(`\\$${key}\\$`, 'gm')
        value = new tokenSDKServer.sm3().sum(value)
        desc = desc.replace(reg, value)
      }
      hashCont = new tokenSDKServer.sm3().sum(desc)
      return tokenSDKServer.bytesToStrHex(hashCont)
    }).then(hashCont => {
      // let priStr = '' // 从文件中取出并密钥后的私钥字符串
      let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
      didttm = didttm.toString()
      didttm = tokenSDKServer.decryptDidttm(didttm)
      let priStr = didttm.mt.prikey
      sign = tokenSDKServer.sm2.genKeyPair(priStr).signSha512(hashCont)
      tokenSDKServer.applyCertify(templateId, hashCont, expire, sign).then(response => {
        res.status(200).json({
          result: true,
          message: '',
          data: response.data.data
        })
      }).catch(err => {
        console.log('err', err)
        res.status(500).json({
          result: false,
          message: '',
          error: ''
        })
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let didttm = {
      name: '微信',
      phone: '18512345678',
      pdid: 'did:ttm:a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608',
      node: 'https://www.xxxxx.com',
      prikey: '01837f014db7fc5acd914f53839bdb5dbf4cd80ecbbb7bf966ba9619f34b627a'
    }
    // key = 'JeF8U9wHFOMfs2Y8'
    // let sm4fn = new tokenSDKServer.sm4({
    //   key: key,
    //   mode: 'cbc',
    //   iv: 'UISwD9fW6cFh9SNS',
    //   cipherType: 'base64'
    // })
    // let ct = sm4fn.encrypt(JSON.stringify(didttm))
    // console.log('ct', ct)
    // let encode = Base64.encode(ct)
    // console.log('encode', encode)

    let ct = tokenSDKServer.encryptDidttm(JSON.stringify(didttm), '123456')
    console.log('ct', ct)
    let mt = tokenSDKServer.decryptDidttm(ct, '1234')
    console.log('mt', mt)
    res.status(200).json({data: {ct: ct, mt: mt}})



  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })



module.exports = router;

var express = require('express');
var router = express.Router();
// var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
// const Base64 = require('js-base64').Base64
var bodyParse = require('body-parser')

router.use(bodyParse.json())

// let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
// let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
const {didttm, idpwd} = tokenSDKServer.getPrivateConfig()
const priStr = tokenSDKServer.getPriStr()

/* GET users listing. */
router.route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {claim_sn} = req.query
    // qrStr里的数据结构需要改变
    let qrStr = tokenSDKServer.genAuthQrStr([], 'N', '', '人工审核证书', new Date().getTime() + 5 * 60 * 1000)
    res.status(200).json({
      url: '',
      message: '',
      data: qrStr
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

module.exports = router;

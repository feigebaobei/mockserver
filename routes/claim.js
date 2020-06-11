var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var config = require('../lib/config')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParser = require('body-parser')

router.use(bodyParser.json())

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
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    // let sign = req.body.sign
    let sign = ''
    // 执行2次hash
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
      // 申请证书
      let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
      didttm = didttm.toString()
      didttm = tokenSDKServer.decryptDidttm(didttm, '123456') // 从session中取出身份密码
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

router.route('/certifyData')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // 在生产环境下应该根据claim_sn从pvdata里取出证书数据
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608' // 从session中取出did
    let idpwd = '123456' // 从session中取出did
    // let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
    // didttm = didttm.toString()
    // didttm = tokenSDKServer.decryptDidttm(didttm, idpwd)
    // // console.log('didttm', didttm)
    // let {mt} = didttm
    // let {prikey: priStr} = JSON.parse(mt)
    // // console.log('priStr', priStr)
    // let pvdata = fs.readFileSync(`uploads/private/${did}pvdata.txt`)
    // pvdata = pvdata.toString()
    // pvdata = pvdata.substr(1, pvdata.length - 2).split(', ')
    // pvdata = tokenSDKServer.decryptPvData(pvdata, priStr)
    let pvdata = utils.obtainPvData(did, idpwd)
    let [certifyData] = pvdata.manageCertifies.filter((item) => item.claim_sn === req.query.claim_sn)
    res.status(200).json({
      result: true,
      message: '',
      // data: {
      //   "claim_sn": "02b22a5e81e840176d9f381ec",
      //   "templateId": "002",
      //   "templateTitle": "毕业证书",
      //   "data": {
      //     "name": "tank",
      //     "identity": "513436200009094961",
      //     "gender": "女",
      //     "startYear": "2007",
      //     "startMonth": "09",
      //     "startDay": "01",
      //     "endYear": "2013",
      //     "endMonth": "06",
      //     "endDay": "22",
      //     "school": "天津大学",
      //     "honours": "5",
      //     "major": "建筑系",
      //     "serialNumber": "abc-1234-123456"
      //   }
      // }
      data: certifyData
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

router.route('/certifySignURL')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    // let claim_sn = res.body.claim_sn
    // let templateId = res.body.templateId
    // let certifyData = res.body.certifyData
    let {claim_sn} = req.body
    // console.log('claim_sn', req)
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    let pvdata = utils.obtainPvData(did, idpwd)
    let [certify] = pvdata.manageCertifies.filter(item => item.claim_sn === claim_sn)
    // console.log('certify', certify)
    tokenSDKServer.certifySignUrl(claim_sn, certify.templateId, certify.data).then(response => {
      console.log('response', response.data.data)
      res.status(200).json({
        result: true,
        message: '',
        data: response.data.data
      })
    }).catch(err => {
      res.status(500).json({
        result: false,
        message: '',
        error: ''
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/cancel')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    // let claim_sn = res.body.claim_sn
    // let templateId = res.body.templateId
    // let certifyData = res.body.certifyData
    let {claim_sn} = req.body
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    let pvdata = utils.obtainPvData(did, idpwd)
    let [certify] = pvdata.manageCertifies.filter(item => item.claim_sn === claim_sn)
    tokenSDKServer.getCertifyFingerPrint(claim_sn).then(response => {
      return response.data.data.hashCont
    }).then(hashCont => {
      let {mt} = utils.obtainDidttm(did, idpwd)
      let {prikey: priStr} = JSON.parse(mt)
      tokenSDKServer.cancelCertify(claim_sn, did, hashCont, new Date().getTime(), priStr).then(response => {
        console.log('response', response.data.data)
        res.status(200).json({
          result: true,
          message: '',
          data: response.data.data
        })
      })
    }).catch(err => {
      res.status(500).json({
        result: false,
        message: '',
        error: ''
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/genPoster')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    // let claim_sn = res.body.claim_sn
    // let expire = res.body.expire
    // let purpose = res.body.purpose
    // let hashDataItem = res.body.hashDataItem
    let {claim_sn, expire, purpose, hashDataItem} = req.body
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    let pvdata = utils.obtainPvData(did, idpwd)
    let [certify] = pvdata.manageCertifies.filter(item => item.claim_sn === claim_sn)
    let certifyData = {}
    for (let [key, value] of Object.entries(certify.data)) {
      // if (hashDataItem.hasOwnProperty(key)) {
       if (hashDataItem.includes(key)) {
        certifyData[key] = {
          value: new tokenSDKServer.sm3().sum(value),
          hasHash: true
        }
      } else {
        certifyData[key] = {
          value: value,
          hasHash: false
        }
      }
    }
    // console.log('certifyData', certifyData)
    tokenSDKServer.setTemporaryCertifyData(claim_sn, certify.templateId, certifyData, expire, purpose).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response.data.data
      })
    }).catch(erro => {
      res.status(200).json({
        result: false,
        message: '',
        error: ''
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/signCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    // let claim_sn = res.body.claim_sn
    let {claim_sn, expire, explain} = req.body
    let did = 'a012349681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608'
    let idpwd = '123456'
    let pvdata = utils.obtainPvData(did, idpwd)
    let name = pvdata.property.name
    let [certify] = pvdata.manageCertifies.filter(item => item.claim_sn === claim_sn)
    tokenSDKServer.getTemplate(certify.templateId).then(response => {
      let {desc} = response.data.data
      for (let [key, value] of Object.entries(certify.data)) {
        let reg = new RegExp(`\\$${key}\\$`, 'gm')
        value = new tokenSDKServer.sm3().sum(value)
        desc = desc.replace(reg, value)
      }
      let hashCont = new tokenSDKServer.sm3().sum(desc)
      return tokenSDKServer.bytesToStrHex(hashCont)
    }).then(hashCont => {
      let {mt} = utils.obtainDidttm(did, idpwd)
      let {prikey: priStr} = JSON.parse(mt)
      let sign = tokenSDKServer.sm2.genKeyPair(priStr).signSha512(`the claimSN${claim_sn}and${certify.templateId}=${hashCont}validated by${did}=${name}timeout at${expire}${explain}`)
      console.log('sign', sign)
      // tokenSDKServer.signCertify(did, claim_sn, certify.templateId, hashCont, new Date().getTime(), sign).then(response => {
      tokenSDKServer.signCertify(did, claim_sn, certify.templateId, hashCont, expire, sign).then(response => {
        console.log('response', response.data)
        res.status(200).json({
          result: true,
          message: '',
          data: response.data.data
        })
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: ''
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/needSignCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    res.status(200).json({
      result: true,
      message: '',
      data: [
        '765b7d7a-1b6d-fae1-e928-c3c24a5ad848',
        '65b7d7a-1b6d-fae1-e928-c3c24a5ad8487',
        '5b7d7a-1b6d-fae1-e928-c3c24a5ad84876',
        'b7d7a-1b6d-fae1-e928-c3c24a5ad848765'
      ]
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {temporaryID} = req.body
    // 保存到数据库里
    res.status(200).json({
      result: true,
      message: '',
      data: temporaryID
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })



module.exports = router;

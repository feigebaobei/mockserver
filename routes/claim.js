var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var config = require('../lib/config')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParser = require('body-parser')

router.use(bodyParser.json({limit: '11mb'}))
// router.use(bodyParser.json())

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

// 使用certifyData请求签发证书。
router.route('/signCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // 使用clain_sn请求证书散列值
    // 使用templateId请求template
    let {templateId, claim_sn, certifyData, pic} = req.body
    let hashValue = ''
    if (!templateId || !claim_sn || !certifyData || !pic || !certifyData.identityNumber || !certifyData.name || !certifyData.endTime) {
      res.status(200).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    } else {
      // 比对hashValue
      tokenSDKServer.checkHashValue(claim_sn, templateId, certifyData).then(response => {
        // if (!response) {
        if (!response.result) {
          return Promise.reject(new Error('该证书与链上指纹不匹配'))
        } else {
          // 取得百度的access token
          hashValue = response.hashValueChain // 得到链上证书散列值
          return utils.getBaiduAccessToken('S3H8l6XLGM1UGp4dI9otPPMV', 'VEhY79uE6c7rpysNMmmFvGd3tUBDRbSu').then(response => {
            return response.data.access_token // 返回access token
          })
        }
      }).then(response => {
        let accessToken = response
        return {result: {score: 90}}
        // 调用百度的 公安验证 接口判断活体照片与公安小图是否一致
        return utils.publicVerify(accessToken, pic, certifyData.identityNumber, certifyData.name).then(response => {
          return response.data
        })
      }).then(response => {
        // console.log('response', response)
        if (response.result && response.result.score > 80) {
          // 签发
          // 从didttm中取出did/name/ct
          let didttm = fs.readFileSync('uploads/private/a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
          didttm = didttm.toString()
          didttm = JSON.parse(didttm)
          let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
              // hashValue = '',
              // endTime = Number(certifyData.endTime),
              name = didttm.nickname,
              explain = '签发身份证的固定字段',
              expire = Number(certifyData.endTime) || new Date().getTime(),
              ct = didttm.data.slice(2)
          // let ct = '1f521bd208c2f69ef5fc90c9b706eb972efca67a20b37932c18a3796a60bfb760f818cfcf506c6da7bb413255addfd44d63ebde1ed3fe258fd42f83b8399aeaf8c2ad263439122dba6410ec40fd0e826523fa152e1773c96ca0d79e8309e950a11126fe0b68c32ae93a64d7f5e8ecc88703bbfbd627d887acfbfa4621afe9da9840055abf7d73a0b297c0c62ac67fec3ea9b17c4468f68dda7a631fe8633984692e18c234d6f32d842d25c54c80dd418420b6d1b0376a950b6734e4b4682c9970dbbbf90f859a77a06f155a71af3b1203e32038d7d18bb1c529d730432bc3951efa17f26cb86040cb0723ebf171bd5fe'
          // expire = Number(expire)
          ct = tokenSDKServer.utils.str16ToArr16(ct)
          let privStr = tokenSDKServer.sm4.decrypt(ct, '1234qwerA')
          privStr = JSON.parse(privStr).prikey || ''
          let keys = tokenSDKServer.sm2.genKeyPair(privStr)
          let signObj = `claim_sn=${claim_sn},templateId=${templateId},hashCont=${hashValue},did=${did},name=${name},explain=${explain},expire=${expire}`
          let sign = tokenSDKServer.signEcdsa(signObj, privStr)
          return tokenSDKServer.signCertify(did, claim_sn, name, templateId, hashValue, explain, expire, sign).then(response => {
            // return response.data.result
            if (response.data.error) {
              return Promise.reject(new Error(response.data.error.message || '签发失败'))
            } else {
              return response.data.result
            }
          })
        } else {
          return Promise.reject(new Error('非本人'))
        }
      }).then(response => {
        // console.log('response', response)
        if (response) {
          res.status(200).json({
            result: true,
            message: '签发成功',
            data: ''
          })
        } else {
          // console.log('dfgfd', response)
          return Promise.reject(new Error('签发失败'))
        }
      }).catch(error => {
        // console.log('error', error)
        res.status(200).json({
          result: false,
          message: error.message || '',
          error: error
        })
      })
    }
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

var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var config = require('../lib/config')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParser = require('body-parser')

router.use(bodyParser.json({limit: '10240kb'}))
// router.use(bodyParser.json({limit: '40kb'}))
router.use(bodyParser.urlencoded({limit: '10240kb', extended: true}))
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
// 专用于签发身份证
router.route('/signCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  // .post(cors.corsWithOptions, (req, res, next) => {
  .post((req, res, next) => { // 为方便原生同事开发，所以去掉了“来源白名单”限制。
    // 使用clain_sn请求证书散列值
    // 使用templateId请求template
    let {templateId, claim_sn, certifyData, pic} = req.body
    // console.log('certifyData', certifyData)
    let hashValue = '', privStr = '', claim_snData = {}, templateData = {}, did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11' // 下面代码中用到的全局变量
    if (!templateId || !claim_sn || !certifyData || !pic || !certifyData.identityNumber || !certifyData.name || !certifyData.endTime) {
      res.status(200).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    } else {
      // 比对hashValue
      tokenSDKServer.checkHashValue(claim_sn, templateId, certifyData, {templateData: true, claimData: true}).then(response => {
        // console.log('比对返回的内容', response)
        if (!response.result) {
          return Promise.reject(new Error('该证书与链上指纹不匹配'))
        } else {
      // 取得百度的access token
          hashValue = response.hashValueChain // 得到链上证书散列值
          claimData = response.claimData
          templateData = response.templateData
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
        if (response.result && response.result.score > 80) {
      // 签发
          // 从didttm中取出did/name/ct
          let didttmStr = fs.readFileSync('uploads/private/did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
          didttmStr = didttmStr.toString()
          let didttm = JSON.parse(didttmStr)
          // console.log('didttmStr', didttmStr)
          // console.log('didttm', didttm)
          // did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
              name = didttm.nickname,
              explain = '签发身份证的固定字段',
              expire = Number(certifyData.endTime) || new Date().getTime(),
              ct = didttm.data.slice(2)
          // console.log('ct', ct)
          // ct = tokenSDKServer.utils.str16ToArr16(ct)
          ct = tokenSDKServer.utils.strHexToArr(ct)
          // console.log('ct', ct)
          let mtObj = tokenSDKServer.decryptDidttm(didttmStr, '1234qwerA')
          // console.log('mtObj', mtObj)
          // let privStr = JSON.parse(mtObj.data).prikey || ''
          privStr = JSON.parse(mtObj.data).prikey || ''
          // console.log('privStr', privStr)
          // let privStr = tokenSDKServer.sm4.decrypt(ct, '1234qwerA')
          // privStr = JSON.parse(privStr).prikey || ''
          // let keys = tokenSDKServer.sm2.genKeyPair(privStr)
          let signObj = `claim_sn=${claim_sn},templateId=${templateId},hashCont=${hashValue},did=${did},name=${name},explain=${explain},expire=${expire}`
          let sign = tokenSDKServer.signEcdsa(signObj, privStr)
          // console.log('sign', sign)
          // return '2345t'
          return tokenSDKServer.signCertify(did, claim_sn, name, templateId, hashValue, explain, expire, sign).then(response => {
            // console.log(response)
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
      // 修改pvdata
        // console.log('getPvData', response)
        let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11'
        // 在pvdata里保存签发过的证书
        return tokenSDKServer.getPvData(did).then(response => {
          console.log('pvdata的密文:', response.data)
          if (response.data.error) {
            return Promise.reject(new Error(response.data.error.message || '备份pvdata失败'))
          } else {
            let ct = response.data.result.data
            console.log('ct', ct)
            console.log('privStr', privStr)
            let mt = tokenSDKServer.decryptPvData(ct, privStr)
            let pvdata = JSON.parse(mt)
            console.log('pvdata', pvdata)
            // 在封装的方法里修改pvdata
            // pvdata.vertifies里添加记录
            let td = JSON.parse(templateData.meta_cont)
            pvdata = tokenSDKServer.certifiesAddSignItem(pvdata, Object.assign({}, certifyData, {id: claim_sn, templateId: templateId, type: td.type}), td)


            // tokenSDKServer.

            return pvdata
            // return '2345'
          }
        })
      }).then(pvdata => {
      // 备份pvdata
        // let hash = new tokenSDKServer.Keccak(256)
        // hash.update(privStr)
        // let key = '0x' + hash.digest('hex')
        // hash.reset()
        let keccak256 = new tokenSDKServer.Keccak(256)
        // console.log('privStr', privStr)
        let key = ''
        // var sm3 = tokenSDKServer.sm3
        // var hash = new sm3()
        keccak256.update(did)
        key = '0x' + keccak256.digest('hex')
        keccak256.reset()
        // key = '0x' + tokenSDKServer.utils.arrToHexStr(key)
        // console.log('key', key)
        let type = 'pvdata'
        // console.log('pvdata', pvdata)
        let pvdataStr = JSON.stringify(pvdata)
        // console.log('pvdataStr', pvdataStr)
        // console.log('加密时使用的privStr', privStr)
        let pvdataStrCt = tokenSDKServer.encryptPvData(pvdataStr, privStr)
        // console.log('pvdataStrCt', pvdataStrCt)
        let signObj = `update backup file${pvdataStrCt}for${did}with${key}type${type}`
        // console.log('signObj', signObj)
        // signObj = hash.sum(signObj)
        // signObj = '0x' + tokenSDKServer.utils.arrToHexStr(signObj)
        // keccak256.update(signObj)
        // signObj = '0x' + keccak256.digest('hex')
        // keccak256.reset()
        // console.log('signObj keccak256 后', signObj)
        let sign = tokenSDKServer.sign({keys: privStr, msg: signObj})
        // let isok = tokenSDKServer.verify({sign})
        // console.log('isok', isok)
        let signStr = `0x${sign.r.toString('hex')}${sign.s.toString('hex')}00`
        // console.log('signStr', signStr)
        // 需要解密备份后无法解密的问题。
        // 问题可能是加密后无法解密的问题。
        // console.log('解密时使用的privStr', privStr)
        let mt = tokenSDKServer.decryptPvData(pvdataStrCt, privStr)
        console.log('解密去备份的pvdata', mt)
        // return 'end'



        return tokenSDKServer.backupData(did, key, 'pvdata', pvdataStrCt, signStr).then(response => {
        // let originCt = '0x6d05a3927d6838342f65e69a0f34ab0d6825bcb069d33f70eb24a688a080a10f1ee3a2e15cb533a2e82fa3d0b5d8af06899ff58482a2172ce5f88d1fc81bb346a68002f7bffb7f6f4793a6136cb6737a7a0c85ec188a2463771856276c5155177430b203e9cf6b3f3f2684f70f5363f5e9a23030aa6bd4d0349820d12b1f768e4a385c37d6352f953e70474614c087d4e65a7ea99ca1487d55ed62fb75ec38d75530a0055f88937388c033bea2c4b98809c88cf88c9043ac46d853a384a894b740c914e8633d44fa946a03d514b0e1f26777a51c5524e338d563d0ffe6645f56cf8888858e5f2dab25aef7264a1f181e'
        // return tokenSDKServer.backupData(did, key, 'pvdata', originCt, signStr).then(response => {
          console.log('备份接口的response', response.config, response.data)
          // return response.data
          if (response.data.error) {
            // return Promise.reject(new Error('非本人'))
            return Promise.reject(response.data)
          } else {
            return response.data
          }
        })



      }).then(response => {
      // 反馈给请求方
        // console.log('string', response)
        if (response.result) {
          res.status(200).json({
            result: true,
            message: '签发成功',
            data: ''
          })
        } else {
          // console.log('dfgfd', response)
          return Promise.reject(new Error('备份pvdata失败'))
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

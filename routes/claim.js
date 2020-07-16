var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var config = require('../lib/config')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParser = require('body-parser')
var multer = require('multer')

router.use(bodyParser.json({limit: '10240kb'}))
// router.use(bodyParser.json({limit: '40kb'}))
router.use(bodyParser.urlencoded({limit: '10240kb', extended: true}))
// router.use(bodyParser.json())

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'tokenSDKData/businessLicense')
    },
    filename: (req, file, cb) => {
      // console.log('file', file)
      let arr = file.originalname.split('.')
      let name = ''
      for (let i = 0, iLen = arr.length - 1; i < iLen; i++) {
        name += arr[i]
      }
      name += String(Math.floor(Math.random() * 100000))
      cb(null, `${name}.${arr[arr.length - 1]}`)
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.[png|jpg|jpeg]$/)) {
      return cb(new Error('图片格式不正确。请上传png|jpg|jpeg图片。'), false)
    }
    cb (null, true)
  }
})

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

// 生成海报。
// 不用了。
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
        // return {result: {score: 90}}
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

// odid身份认证
router.route('/legelPersonQualification')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions,
   // upload.single('businessLicense'),
   (req, res, next) => {
    // let {sign, ocrData, claim_sn, businessLicense, orgName} = req.body
    // let {sign, businessLicenseData: {applicantSuperDid, applicantDid, ocrData, businessLicense, orgName, addressInfo, applicantBankAccountName, applicantBankName, applicantBankAccountNumber, receiveBankName, receiveBankAccountName, receiveBankAccountNumber, verificationMoney, claim_sn}} = req.body
    let {sign, businessLicenseData} = req.body
    let pvdata = '',
        pdidPendingTaskKey = ''
    // // 检查参数是否正确
    // if (!sign || !businessLicenseData.applicantSuperDid || !businessLicenseData.applicantDid || !businessLicenseData.ocrData || !businessLicenseData.businessLicense || !businessLicenseData.orgName || !businessLicenseData.addressInfo || !businessLicenseData.applicantBankAccountName || !businessLicenseData.applicantBankName || !businessLicenseData.applicantBankAccountNumber || !businessLicenseData.receiveBankName || !businessLicenseData.receiveBankAccountName || !businessLicenseData.receiveBankAccountNumber || !businessLicenseData.verificationMoney || !businessLicenseData.claim_sn) {
    if (!sign && !businessLicenseData) {
      res.status(500).json({
        result: false,
        message: '参数不正确',
        error: {}
      })
      return
    }
    // 验签
    let isok = tokenSDKServer.verify({sign: sign})
    // console.log('isok', isok)
    if (!isok) {
      res.status(200).json({
        result: true,
        message: '验签不通过',
        error: {}
      })
      return
    }
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    let priStr = tokenSDKServer.decryptDidttm(didttm, idpwd)
    priStr = JSON.parse(priStr.data).prikey
    // 检查是否签过
    tokenSDKServer.getCertifyFingerPrint(businessLicenseData.claim_sn, true).then(response => {
      // return true // 测试用
      if (response.data.result) {
        let sign_list = response.data.result.sign_list
        // console.log('sign_list', sign_list)
        // 应该使用did判断是否签名
        let has = sign_list.some((item) => {
          return item.name === didttm.nickname && new Date().getTime() < item.expire
        })
        if (has) {
          // return Promise.reject(new Error('不能在签名有效期内重复签名'))
          res.status(200).json({
            result: true,
            message: '不能在签名有效期内重复签名',
            data: ''
          })
          return Promise.reject({hasRes: true, error: new Error('请求证书的签名列表失败')})
        } else {
          return false
        }
      } else {
        return false
      }
    }).then(bool => { // 没用到bool
    // 检查是否正在签发。
      return tokenSDKServer.getPvData(didttm.did).then(response => {
        if (response.data.result) {
          // let pvdata = JSON.parse(tokenSDKServer.decryptPvData(response.data.result.data, priStr))
          pvdata = JSON.parse(tokenSDKServer.decryptPvData(response.data.result.data, priStr))
      // return false // 测试用
          // console.log('pvdata', pvdata)
          if (!pvdata.hasOwnProperty('pendingTask')) {
            return false
          } else {
            if (pvdata.pendingTask[businessLicenseData.claim_sn]) {
              res.status(200).json({
                result: true,
                message: '正在等待人工审核或父did签名，请耐心等待。',
                data: ''
              })
              // return true
              return Promise.reject({hasRes: true})
            } else {
              // return pvdata
              return false
            }
          }
        }
      })
    })
    .then(bool => {
      // console.log('bool', bool)
    // 通知父did
    // 备份父did的待办事项
      // if (!bool) {
        let d = new Date()
        let expire = d.setFullYear(2120)
        let certifyData = JSON.stringify(req.body)
        let signData = tokenSDKServer.sign({keys: priStr, msg: `did=${didttm.did},claim_sn=${businessLicenseData.claim_sn},certifyData=${certifyData},expire=${expire}`})
        let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
        return tokenSDKServer.setTemporaryCertifyData(didttm.did, businessLicenseData.claim_sn, certifyData, expire, signStr).then(response => {
          // console.log('备份父did的待办事项 response.data', response.data)
          if (response.data.result) {
            return response.data.result
            // return true
          } else {
            return Promise.reject(new Error('通知父did失败'))
          }
        })
      // } else {
      //   return
      // }
    })
    .then(temporaryId => {
      // console.log('temporaryId', temporaryId)
    // 拉取以前的待办列表
      pdidPendingTaskKey = '0x' + tokenSDKServer.hashKeccak256(`${businessLicenseData.applicantSuperDid}go to check businessLicense`)
      let list = []
      return tokenSDKServer.pullData(pdidPendingTaskKey, false).then(response => {
        if (response.data.result) { // 以前有待办列表
          list = JSON.parse(response.data.result.data)
        }
    // 在待办列表添加待办项
        let pendingItem = {
          type: 'sign',
          content: temporaryId,
          createTime: String(new Date().getTime())
        }
        list.push(pendingItem)
        list = JSON.stringify(list)
        let type = 'bigdata'
        let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${list}for${didttm.did}with${pdidPendingTaskKey}type${type}`})
        let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
        return tokenSDKServer.backupData(didttm.did, pdidPendingTaskKey, type, list, signStr).then(response => {
          // console.log('备份父did的待办事项 list', response.data)
          if (response.data.result) {
            return pendingItem
          } else {
            return Promise.reject(new Error('创建父did待办任务列表时出错'))
          }
        })
      })
    })
    .then(pendingItem => {
      // console.log('pendingItem', pendingItem)
    // 备份父did的待办事项列表
      if (!pvdata.pendingTask) {
        pvdata.pendingTask = {}
      }
      pvdata.pendingTask[businessLicenseData.claim_sn] = {
        isPersonCheck: false,
        isPdidCheck: false,
        businessLicenseData: businessLicenseData,
        sign: sign,
        temporaryId: pendingItem.content,
        createTime: pendingItem.createTime
      }
      let pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
      // console.log('pvdataCt', pvdataCt)
      let key = '0x' + tokenSDKServer.hashKeccak256(didttm.did)
      let type = 'pvdata'
      let signObj = `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`
      let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
      let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
      return tokenSDKServer.backupData(didttm.did, key, type, pvdataCt, signStr).then(response => {
        if (response.data.result) {
          res.status(200).json({
            result: true,
            message: '成功接收请求，请耐心等待。',
            data: ''
          })
          return Promise.reject({hasRes: true})
        } else {
          return Promise.reject(new Error('服务端备份pvdata失败'))
        }
      })
    })
    .catch(errorObj => {
      // console.log(errorObj)
      if (!errorObj.hasRes) {
        res.status(500).json({
          result: false,
          message: errorObj.error.message,
          error: errorObj.error
        })
      }
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 未完成签发的企业认证列表
router.route('/pendingTask')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let claim_sn = req.query.claim_sn
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')
    let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    tokenSDKServer.getPvData(didttm.did).then(response => {
      if (response.data.result) {
        let pvdata = tokenSDKServer.decryptPvData(response.data.result.data, priStr)
        pvdata = JSON.parse(pvdata)
        // console.log('pvdata', pvdata)
        let list = pvdata.pendingTask || {}
        if (!claim_sn) {
          res.status(200).json({
            result: true,
            message: '',
            data: list
          })
          return
        } else {
          let obj = list[claim_sn]
          if (!obj) {
            return Promise.reject(new Error('待办事项中无此证书'))
          } else {
            let picKey = list[claim_sn].businessLicenseData.businessLicense
            return tokenSDKServer.pullData(picKey, false).then(response => {
              if (response.data.result) {
                obj.businessLicenseData.picBase64 = 'data:image/png;base64,' + response.data.result.data
                res.status(200).json({
                  result: true,
                  message: '',
                  data: obj
                })
                return
              }
            })
          }
        }
      } else {
        return Promise.reject(new Error('请求pvdata出错'))
      }
    }).catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: error.message,
        error: {}
      })
      return
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

// 人工审核
router.route('/personCheck')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {operator, claim_sn} = req.body
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')
    let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    tokenSDKServer.getPvData(didttm.did).then(response => {
      if (response.data.result) {
        let pvdata = tokenSDKServer.decryptPvData(response.data.result.data, priStr)
        pvdata = JSON.parse(pvdata)
        let pendingTask = pvdata.pendingTask || {}
        let claim = pendingTask[claim_sn]
        if (claim) {
          claim.isPersonCheck = operator
          let pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
          let key = '0x' + tokenSDKServer.hashKeccak256(didttm.did)
          let type = 'pvdata'
          let signObj = `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`
          let signMy = tokenSDKServer.sign({keys: priStr, msg: signObj})
          // let signStr = `0x${signMy.r.toString('hex')}${signMy.s.toString('hex')}00`
          let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
          return tokenSDKServer.backupData(didttm.did, key, type, pvdataCt, signStr).then(response => {
            if (response.data.result) {
              return res.status(200).json({
                result: true,
                message: '成功操作',
                data: operator
              })
            } else {
              return Promise.reject(new Error('服务端备份pvdata失败'))
            }
          })
        } else {
          return Promise.reject(new Error(`不存在${claim_sn}待完成事项`))
        }
      }
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: error.message,
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })


module.exports = router;

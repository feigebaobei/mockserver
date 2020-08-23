var express = require('express');
var router = express.Router();
const passport = require('passport')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParser = require('body-parser')
var multer = require('multer')
const md5 = require('md5')
var tokenSDKServer = require('token-sdk-server')
var utils = require('../lib/utils.js')
var redisUtils = require('../lib/redisUtils.js')
var cors = require('./cors')
var config = require('../lib/config')
const authenticate = require('../lib/authenticate')

router.use(bodyParser.json({limit: '10240kb'}))
// router.use(bodyParser.json({limit: '40kb'}))
router.use(bodyParser.urlencoded({limit: '10240kb', extended: true}))
// router.use(bodyParser.json())

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)
const {didttm, idpwd} = tokenSDKServer.getPrivateConfig()

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

// 使用certifyData请求签发证书。
// 专用于签发身份证
// 已经被relay代替了。一段时间后（2020.08.30）删除该接口。
router.route('/signCertify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  // .post(cors.corsWithOptions, (req, res, next) => {
  .post(cors.corsWithOptions, (req, res, next) => { // 为方便原生同事开发，所以去掉了“来源白名单”限制。
    // 使用clain_sn请求证书散列值
    // 使用templateId请求template
    let {templateId, claim_sn, certifyData, pic} = req.body
    // console.log('certifyData', certifyData)
    let hashValue = '', privStr = '', claim_snData = {}, templateData = {} // , did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11' // 下面代码中用到的全局变量
    if (!templateId || !claim_sn || !certifyData || !pic || !certifyData.identityNumber || !certifyData.name || !certifyData.endTime) {
      res.status(200).json({
        result: false,
        message: '参数错误',
        error: ''
      })
      return
    }
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')
    let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    let pvdata = ''
    // } else {
      tokenSDKServer.getPvData(didttm.did).then(response => {
        if (response.data.error) {
          return Promise.reject({status: true, payload: new Error(response.data.error.message || '请求pvdata出错')})
        }
        pvdata = JSON.parse(tokenSDKServer.decryptPvData(response.data.result.data, priStr))
        return pvdata
      })
      .then(pvdata => {
        // 检查是否签名过
        let item = pvdata.certifies.find(item => item.id === claim_sn)
        if (!item) {
          return
        }
        // 获取证书签名列表
        return tokenSDKServer.getCertifyFingerPrint(item.id, true).then(response => {
          if (!response.data.result) {
            return Promise.reject({status: true, payload: new Error(response.data.error.message || '获取签名列表时出错')})
          } else {
            let signList = response.data.result.sign_list
            let now = new Date().getTime()
            let valid = signList.filter(item => item.did === didttm.did).some(item => now < Number(item.expire))
            if (valid) {
              return Promise.reject({status: true, payload: new Error('在签名有效期内，不能重复签名。')})
            } else {
              return
            }
          }
        })
      })
      .then(() => {
        // 比对hashValue
        return tokenSDKServer.checkHashValue(claim_sn, templateId, certifyData, {templateData: true, claimData: true}).then(response => {
          // console.log('比对返回的内容', response)
          if (!response.result) {
            return Promise.reject({status: true, payload: new Error('该证书与链上指纹不匹配')})
          } else {
            // 取得百度的access token
            hashValue = response.hashValueChain // 得到链上证书散列值
            claimData = response.claimData
            templateData = response.templateData
            // return utils.getBaiduAccessToken('S3H8l6XLGM1UGp4dI9otPPMV', 'VEhY79uE6c7rpysNMmmFvGd3tUBDRbSu').then(response => {
            return utils.getBaiduAccessToken().then(response => { // 使用默认值
              return response.data.access_token // 返回access token
            })
          }
        })
      })
      .then(accessToken => {
        // return {result: {score: 90}}
        // 调用百度的 公安验证 接口判断活体照片与公安小图是否一致
        return utils.publicVerify(accessToken, pic, certifyData.identityNumber, certifyData.name).then(response => {
          return response.data
        })
      }).then(response => {
        // 若为同一人则签名
        if (response.result && response.result.score > 80) {
          // 签发
          // let didttmStr = fs.readFileSync('uploads/private/did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
          // didttmStr = didttmStr.toString()
          // let didttm = JSON.parse(didttmStr),
              // name = didttm.nickname,
          let name = didttm.nickname,
              explain = '签发身份证的固定字段',
              expire = Number(certifyData.endTime) || new Date().getTime()
              // ct = didttm.data.slice(2)
          // ct = tokenSDKServer.utils.strHexToArr(ct)
          // let mtObj = tokenSDKServer.decryptDidttm(didttmStr, '1234qwerA')
          // privStr = JSON.parse(mtObj.data).prikey || ''
          let signObj = `claim_sn=${claim_sn},templateId=${templateId},hashCont=${hashValue},did=${didttm.did},name=${name},explain=${explain},expire=${expire}`
          let sign = tokenSDKServer.signEcdsa(signObj, privStr)
          // return '2345t'
          return tokenSDKServer.signCertify(did, claim_sn, name, templateId, hashValue, explain, expire, sign).then(response => {
            // console.log(response)
            if (response.data.error) {
              return Promise.reject({status: true, payload: new Error(response.data.error.message || '签发失败')})
            } else {
              // return response.data.result
              return
            }
          })
        } else {
          return Promise.reject({status: true, payload: new Error('非本人')})
        }
      })
      // .then(response => {
      //   // 更新pvdata
      //   // let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11'
      //   // let did = didttm.did
      //   // 在pvdata里保存签发过的证书
      //   // return tokenSDKServer.getPvData(did).then(response => {
      //   //   if (response.data.error) {
      //   //     return Promise.reject({status: true, payload: new Error(response.data.error.message || '备份pvdata失败')})
      //   //   } else {
      //   //     let ct = response.data.result.data
      //   //     let mt = tokenSDKServer.decryptPvData(ct, privStr)
      //   //     let pvdata = JSON.parse(mt)
      //   //     let td = JSON.parse(templateData.meta_cont)
      //   //     pvdata = tokenSDKServer.certifiesAddSignItem(pvdata, Object.assign({}, certifyData, {id: claim_sn, templateId: templateId, type: td.type}), td)
      //   //     return pvdata
      //   //     // return '2345'
      //   //   }
      //   // })
      // })
      // .then(pvdata => {
      .then(() => {
        // 备份pvdata
        let td = JSON.parse(templateData.meta_cont)
        pvdata = tokenSDKServer.certifiesAddSignItem(pvdata, Object.assign({}, certifyData, {id: claim_sn, templateId: templateId, type: td.type}), td)
        // let keccak256 = new tokenSDKServer.Keccak(256)
        // let key = ''
        // keccak256.update(did)
        // key = '0x' + keccak256.digest('hex')
        // keccak256.reset()
        let key = '0x' + tokenSDKServer.hashKeccak256(didttm.did)
        let type = 'pvdata'
        let pvdataStr = JSON.stringify(pvdata)
        let pvdataStrCt = tokenSDKServer.encryptPvData(pvdataStr, privStr)
        let signObj = `update backup file${pvdataStrCt}for${didttm.did}with${key}type${type}`
        let signData = tokenSDKServer.sign({keys: privStr, msg: signObj})
        // let signStr = `0x${sign.r.toString('hex')}${sign.s.toString('hex')}00`
        let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
        let mt = tokenSDKServer.decryptPvData(pvdataStrCt, privStr)
        // return 'end'
        return tokenSDKServer.backupData(did, key, 'pvdata', pvdataStrCt, signStr).then(response => {
          if (response.data.error) {
            // return Promise.reject(new Error('非本人'))
            return Promise.reject({status: true, payload: response.data})
          } else {
            return response.data
          }
        })
      }).then(response => {
      // 反馈给请求方
        if (response.result) {
          res.status(200).json({
            result: true,
            message: '签发成功',
            data: ''
          })
        } else {
          return Promise.reject({status: true, payload: new Error('备份pvdata失败')})
        }
      }).catch(resObj => {
        // // console.log('error', error)
        // res.status(200).json({
        //   result: false,
        //   message: error.message || '',
        //   error: error
        // })
        // status表示是否需要catch处理
        if (resObj.status) {
          res.status(200).json({
            result: false,
            message: resObj.payload.message,
            error: resObj.payload
          })
        } else {
          res.status(200).json({
            result: true,
            message: '',
            data: resObj.payload
          })
        }
      })
    // }
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

// 法人认证。（即：原来的odid身份认证）
// （即：营业执照认证）
// 已经被relay代替了。一段时间后（2020.08.30）删除该接口。
router.route('/legalPersonQualification')
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
          // return item.name === didttm.nickname && new Date().getTime() < item.expire
          return item.did === didttm.did && new Date().getTime() < item.expire
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
            return Promise.reject({hasRes: false, error: new Error('通知父did失败')})
          }
        })
      // } else {
      //   return
      // }
    })
    .then(temporaryId => {
      // console.log('temporaryId', temporaryId)
    // 拉取父did以前的待办列表
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
            return Promise.reject({hasRes: false, error: new Error('创建父did待办任务列表时出错')})
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
        // isPersonCheck: true,
        // isPdidCheck: false,
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
          return Promise.reject({hasRes: false, error: new Error('服务端备份pvdata失败')})
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

// 待签发的证书
router.route('/pendingTask')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, authenticate.isAuthenticated, (req, res, next) =>{
    let claim_sn = req.query.claim_sn
    let pvdata = tokenSDKServer.getPvData()
    pvdata = JSON.parse(pvdata)
    let pendingTask = pvdata.pendingTask ? pvdata.pendingTask : {}
    if (claim_sn) { // 指定了claim_sn
      res.status(200).json({
        result: true,
        message: '',
        data: pendingTask[claim_sn]
      })
    } else { // 没有指定claim_sn
      res.status(200).json({
        result: true,
        message: '',
        data: pendingTask
      })
    }
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
  .post(cors.corsWithOptions, authenticate.isAuthenticated, (req, res, next) => {
    // 检查参数
    let {opResult, claim_sn} = req.body
    let auditor = req.user.token
    // console.log(req.user)
    opResult = !!opResult
    if (!claim_sn || !auditor) {
      return res.status(500).json({
        result: false,
        message: '参数错误',
        error: new Error('参数错误')
      })
    }
    let pvdataStr = tokenSDKServer.getPvData()
    let pvdata = JSON.parse(pvdataStr)
    let claim = pvdata.pendingTask[claim_sn] || {}

    // 给审核员发消息
    // tokenSDKServer.send({
    //   type: 'confirmRequest',
    //   // opResult: opResult,
    //   // claim_sn: claim_sn
    //   title: '需要您确认',
    //   describe: '您已经对营业执照（$orgName$）审核为：$operateResult$。请您确认。',
    //   pendingTaskId: claim_sn, // 后期需要修改
    //   descData: [
    //     {businessLicenseId: claim_sn},
    //     {operateResult: opResult},
    //     {orgName: claim.msgObj.content.businessLicenseData.ocrData.name}
    //   ],
    //   claim_sn: '',
    //   claimData: {}
    // }, [auditor], 'auth')
    let obj = {
      type: 'confirmRequest',
      title: '需要您确认',
      describe: '您已经对营业执照（$orgName$）审核为：$operateResult$。请您确认。',
      pendingTaskId: claim_sn, // 后期需要修改
      descData: [
        {businessLicenseId: claim_sn},
        {operateResult: opResult},
        {orgName: claim.msgObj.content.businessLicenseData.ocrData.name}
      ],
      claim_sn: '',
      claimData: {}
    }
    // console.log(obj, auditor)
    tokenSDKServer.send(obj, [auditor], 'auth')
    // 返回结果
    res.status(200).json({
      result: true,
      message: '已给审核员发消息',
      data: true
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// adid的身份证明类证书
router.route('/adidIdentity')
  .options(cors.corsWithOptions, (req, res, next) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {adid, claim_sn, templateId, claimData} = req.body
    let url = `${claimData.hostname}:${claimData.port}`
    // 检查参数
    let regUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
    if (!regUrl.test(url)) {
      return res.status(200).json({
        result: false,
        message: 'url格式不正确',
        data: ''
      })
    }
    if (!adid || adid.indexOf('did:ttm:a0') != 0 || adid.length != 70) {
      return res.status(200).json({
        result: false,
        message: 'adid格式不正确',
        data: ''
      })
    }
    // 检查时间是否小于1min
    let hashStr = md5(adid+url)
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')
    let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    let pvdata = {}
    // 检查是否签过名
    tokenSDKServer.getPvData(didttm.did).then(response => {
      if (response.data.result) {
        pvdata = tokenSDKServer.decryptPvData(response.data.result.data, priStr)
        pvdata = JSON.parse(pvdata)
        let claimItem = pvdata.certifies.find(item => item.id === claim_sn)
        return claimItem
        // tokenSDKServer.get
        // return Promise.reject({isError: false, payload: new Error('在签名有效期内，不能重复签名。')})
      } else {
        return Promise.reject({isError: true, payload: new Error('请求pvdata出错')})
      }
    })
    .then(claimItem => {
      return tokenSDKServer.getCertifyFingerPrint(claimItem.id, true).then(response => {
        if (!response.data.result) {
          return Promise.reject({isError: true, payload: new Error(response.data.error.message || '获取签名列表时出错')})
        } else {
          let signList = response.data.result.sign_list
          let now = new Date().getTime()
          let valid = signList.filter(item => item.did === didttm.did).some(item => now < Number(item.expire))
          if (valid) {
            return Promise.reject({isError: true, payload: new Error('在签名有效期内，不能重复签名。')})
          } else {
            return true
          }
        }
      })
    })
    .then(bool => {
      return redisUtils.str.get(hashStr).then(response => {
        if (response !== null) {
          let obj = JSON.parse(response)
          let now = new Date().getTime()
          if (now - obj.createTime < 60000) {
            return Promise.reject({isError: true, payload: new Error('请求randomCode时间间隔不能小于1min')})
          }
          return {isError: false, payload: {}}
        } else {
          // res.isError(500).json({})
          return {isError: false}
        }
      })
    })
    .then(({isError, payload}) => {
      if (!isError) {
        // 比对hashValue
        return tokenSDKServer.checkHashValue(claim_sn, templateId, {name: claimData.name, hostname: claimData.hostname, port: claimData.port}).then(response => {
          if (!response.result) {
            return Promise.reject({isError: true, payload: new Error('hashValue不一致')})
          } else {
            return {hashValue: response.hashValueChain}
          }
        })
      } else {
        return Promise.reject({isError: true, payload: payload})
      }
    })
    .then(({hashValue}) => {
      // bool表示比对hashValue是否正确
      // 生成randomCode
      // 绑定对应关系
      let randomCode = utils.getUuid()
      let now = new Date().getTime()
      let obj = {
        adid: adid,
        url: url,
        randomCode: randomCode,
        templateId: templateId,
        hashValue: hashValue,
        createTime: now // 根据createTime判断是否在有效时间内
      }
      obj = {
        type: 'confirmAdidIdentity',
        content: obj
      }
      // 在pvdata.pendingTask里保存，就不需要在redis里保存了。
      // return redisUtils.str.set(hashStr, JSON.stringify(obj)).then(response => {
      //   return obj
      // }).catch(error => {
      //   return Promise.reject({isError: true, payload: error})
      // })
      // return obj
      return Promise.reject({isError: false, payload: obj})
    })
    .then(obj => {
      // 添加待办事项
      // let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')
      // let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
      // let pvdata = {}
      // return tokenSDKServer.getPvData(didttm.did).then(response => {
      //   if (response.data.result) {
      //     pvdata = tokenSDKServer.decryptPvData(response.data.result.data, priStr)
      //     pvdata = JSON.parse(pvdata)
      //     let pendingTask = pvdata.pendingTask || {}
      //     pendingTask[claim_sn] = obj
      //     pvdata.pendingTask = pendingTask
      //     // 备份pvdata
      //     let pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
      //     let key = '0x' + tokenSDKServer.hashKeccak256(didttm.did)
      //     let type = 'pvdata'
      //     let signObj = `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`
      //     let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
      //     let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
      //     return tokenSDKServer.backupData(didttm.did, key, type, pvdataCt, signStr).then(response => {
      //       if (response.data.result) {
      //         return true
      //       } else {
      //         return Promise.reject(new Error('服务端备份pvdata失败'))
      //       }
      //     })
      //   } else {
      //     return Promise.reject({isError: true, payload: new Error('获取pvdata出错')})
      //   }
      // })

    })
    .catch(({isError, payload}) => {
      if (isError) {
        res.status(500).json({
          result: false,
          message: payload.message || '',
          error: payload
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: payload
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
module.exports = router;

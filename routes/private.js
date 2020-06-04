var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var multer = require('multer')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
// var Base64 = require('js-base64').Base64

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/private')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.ttm$/)) {
      return cb(new Error('do not ttm files!'), false)
    }
    cb(null, true)
  }
})

/* GET users listing. */
router.route('/didttm')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions,
    upload.single('didttm'),
    (req, res, next) => {
    res.status(200).json({
      result: true,
      message: '',
      data: {}
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/decrypt')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // 取出didttm。
    let idpwd = req.body.idwpd
    let did = req.body.did
    let mt = utils.didttmToMt(did, idpwd)
    // 解密
    res.status(200).json({
      result: true,
      message: '',
      data: mt
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 更新pvdata
function updatePvData (did) {
  return tokenSDKServer.getPvData(did).then(response => {
    // console.log('did234t ', did)
    // console.log('getPvData response', response.data.data)
    fs.writeFileSync(`uploads/private/${did}pvdata.txt`, `[${response.data.data.join(', ')}]`)
    return getPvData(did)
  }).catch(err => {
    console.log(err, err)
    return err
  })
}
// 取出pvdata
function getPvData (did) {
  let pvdata = fs.readFileSync(`uploads/private/${did}pvdata.txt`)
  pvdata = pvdata.toString()
  pvdata = pvdata.substr(1, pvdata.length - 2).split(', ')
  let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
  didttm = didttm.toString()
  let obj = tokenSDKServer.decryptDidttm(didttm, '1234567')
  let priStr = JSON.parse(obj.mt).prikey
  let mt = tokenSDKServer.decryptPvData(pvdata, priStr)
  return mt
}

router.route('/pvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    let {did, method} = req.query
    // res.send('get')
    // 判断请求方式 'get' / 'update'
    // get 从数据库中取出pvdata。
    // update 从链上得到pvdata并保存在数据库中

    switch (method) {
      case 'get':
        res.status(200).json({
          result: true,
          message: '',
          data: getPvData(did)
        })
        break
      case 'update':
        updatePvData(did).then(response => {
          res.status(200).json({
            result: true,
            message: '',
            data: response
          })
        }).catch(err => {
          res.status(500).json({
            result: false,
            message: '',
            error: ''
          })
        })
        break
      default:
        break
    }
  })
  .post(cors.corsWithOptions, (req, res, next) =>{
    // 返回明文
    // res.send('post')
    // req.body.did
    // req.body.method // get / update
    let {did, method} = req.body
    // console.log(did)
    switch (method) {
      case 'update':
        // 请求pvdata并保存起来
        tokenSDKServer.getPvData(did).then(response => {
          // console.log('response', response.data.data)
          fs.writeFile(`uploads/private/${did}pvdata.txt`, `[${response.data.data.join(', ')}]`, (err) => {
            if (err) {
              res.status(500).json({
                result: false,
                message: '',
                error: ''
              })
            }
          })
          res.status(200).json({
            result: true,
            message: '',
            data: response.data.data
          })
        })
      break
      default:
        res.status(500).json({
          result: false,
          message: '',
          error: ''
        })
      break
    }
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

module.exports = router;

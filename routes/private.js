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
    console.log(mt, 'mt')
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

router.route('/pvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) =>{
    // res.send('post')
    // req.body.did
    // req.body.method // get / update
    let did = req.body.did
    // console.log(did)
    switch (req.body.method) {
      case 'update':
        // 请求pvdata并保存起来
        tokenSDKServer.getPvData(did, 'update').then(response => {
          console.log('response', response.data.data)
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
    // 这2个promise对象用于模拟服务端请求链节点云服务
    // let p0 = new Promise((resolve, reject) => {
    //   setTimeout(function () {
    //     resolve([246, 106, 106, 40, 249, 239, 104, 205, 94, 25, 74, 123, 117, 222, 186, 157, 161, 54, 72, 5, 161, 55, 231, 22, 35, 1, 41, 120, 226, 18, 197, 95, 143, 44, 190, 238, 171, 248, 247, 163, 91, 234, 30, 56, 158, 201, 3, 172, 214, 151, 42, 167, 104, 91, 90, 12, 34, 99, 41, 73, 16, 156, 197, 27, 52, 245, 90, 179, 236, 45, 165, 192, 233, 248, 7, 135, 194, 251, 227, 159, 93, 128, 185, 131, 132, 92, 117, 245, 27, 39, 95, 184, 227, 244, 202, 147, 31, 97, 195, 26, 93, 142, 14, 163, 66, 48, 153, 98, 60, 65, 107, 237, 188, 110, 152, 175, 47, 128, 221, 46, 4, 40, 178, 209, 15, 142, 18, 104, 62, 160, 147, 193, 147, 23, 95, 27, 247, 205, 205, 100, 149, 37, 35, 181, 40, 107, 160, 37, 100, 97, 237, 97, 89, 7, 145, 223, 229, 105, 149, 165, 115, 8, 165, 57, 198, 132, 215, 62, 123, 99, 154, 38, 54, 35, 48, 89, 132, 154, 72, 35, 109, 78, 204, 152, 179, 131, 29, 136, 231, 165, 65, 0, 127, 79, 169, 1, 229, 84, 47, 157, 136, 155, 250, 177, 47, 226, 123, 49, 75, 1, 26, 125, 238, 56, 189, 68, 57, 46, 114, 110, 168, 37, 200, 123, 130, 142, 74, 66, 134, 187, 154, 17, 168, 20, 63, 192, 175, 249, 164, 119, 223, 216, 170, 247, 124, 227, 126, 67, 152, 59, 203, 222, 32, 129, 67, 147, 221, 173, 117, 99, 145, 25, 139, 250, 85, 162, 91, 171, 251, 227, 87, 178, 206, 49, 82, 138, 95, 10, 200, 10, 157, 6, 250, 130, 183, 81, 234, 153, 93, 151, 20, 72, 86, 117, 111, 221, 85, 199, 208, 144, 51, 93, 31, 153, 13, 231, 59, 208, 16, 59, 138, 244, 96, 68, 38, 241, 148, 33, 19, 189, 39, 234, 208, 56, 156, 45, 101, 193, 240, 5, 186, 69, 231, 156, 141, 211, 118, 124, 170, 51, 226, 8, 126, 138, 36, 213, 234, 20, 160, 205, 10, 89, 246, 159, 77, 116, 241, 123, 6, 12, 141, 11, 189, 198, 143, 96, 114, 227, 245, 240, 137, 12, 56, 104, 131, 47, 91, 128, 55, 165, 34, 199, 253, 102, 116, 175, 77, 158, 250, 214, 40, 122, 243, 158, 25, 151, 166, 11, 51, 252, 85, 120, 223, 20, 165, 209, 13, 36, 40, 16, 124, 47, 17, 141, 118, 2, 220, 192, 61, 126, 236, 176, 211, 70, 151, 119, 249, 18, 137, 254, 131, 67, 30, 240, 185, 247, 63, 164, 195, 77, 235, 119, 104, 54, 5, 115, 116, 226, 58, 85, 155, 123, 117, 231, 100, 40, 178, 93, 123, 56, 117, 32, 239, 101, 86, 93, 15, 20, 26, 211, 239, 221, 6, 119, 108, 22, 209, 200, 27, 171, 54, 106, 197, 105, 199, 204, 74, 190, 159, 34, 247, 34, 153, 242, 253, 57, 177, 190, 139, 145, 104, 56, 232, 3, 164, 101, 27, 157, 115, 198, 203, 76, 161, 134, 219, 177, 213, 243, 83, 232, 204, 73, 20, 108, 17, 48, 194, 239, 47, 15, 206, 53, 197, 113, 12, 254, 154, 201, 184, 41, 99, 85, 60, 231, 186, 123, 213, 176, 142, 39, 6, 49, 172, 249, 192, 90, 3, 242, 104, 203, 224, 64, 26, 44, 198, 99, 242, 226, 152, 189, 211, 76, 221, 22, 193, 35, 49, 4, 48, 40, 234, 186, 254, 130, 192, 62, 104, 107, 202, 80, 49, 177, 248, 234, 176, 224, 119, 216, 169, 158, 238, 135, 151, 90, 0, 240, 148, 164, 181, 18, 185, 236, 67, 187, 228, 247, 112, 145, 223, 200, 95, 209, 87, 119, 17, 89, 78, 33732, 35527, 35743, 20029, 201, 83, 252, 93, 164, 127, 159, 226, 124, 219, 22, 126, 177, 162, 220, 213, 249, 169, 213, 25, 223, 154, 218, 97, 136, 24, 17, 208, 222, 199, 155, 153, 207, 44, 214, 121, 106, 12, 73, 154, 185, 119, 22, 118, 101, 115, 108, 113, 112, 51, 79, 211, 171, 120, 231, 5, 188, 112, 117, 172, 127, 91, 89, 98, 172, 116, 69, 146, 160, 51, 25, 233, 100, 163, 219, 167, 138, 64, 182, 147, 146, 189, 124, 182, 117, 45, 160, 44, 9, 204, 197, 234, 154, 68, 202, 130, 107, 189, 81, 180, 51, 74, 51, 22, 45, 233, 200, 83, 209, 167, 100, 130, 133, 52, 166, 86, 137, 152, 68, 188, 44, 125, 46, 115, 60, 211, 117, 92, 241, 119, 130, 253, 24, 120, 137, 186, 253, 244, 217, 177, 83, 179, 156, 102, 56, 216, 82, 13, 160, 14, 195, 28, 64, 214, 85, 125, 115, 221, 242, 75, 245, 32, 102, 40, 90, 101, 20, 49, 238, 196, 200, 244, 212, 33, 166, 192, 68, 241, 177, 166, 40, 65, 132, 122, 73, 167, 142, 48, 45, 165, 120, 250, 217, 103, 162, 243, 138, 152, 136, 162, 229, 248, 99, 212, 175, 237, 135, 123, 219, 251, 216, 52, 109, 35, 234, 126, 1, 131, 116, 49, 30, 221, 124, 202, 73, 253, 91, 101, 131, 102, 217, 85, 156, 206, 155, 208, 180, 40, 131, 64, 37, 1, 120, 132, 12, 50, 89, 134, 170, 201, 108, 65, 95, 123, 79, 65, 21, 17, 88, 1, 180, 184, 5, 121, 20, 5, 185, 109, 222, 4, 246, 186, 20, 86, 230, 238, 163, 207, 205, 216, 234, 95, 242, 244, 199, 14, 92, 115, 133, 103, 208, 45, 174, 201, 12, 141, 52, 15, 8, 162, 179, 200, 154, 92, 123, 110, 116, 163, 92, 223, 223, 40, 250, 15, 154, 21, 126, 182, 235, 86, 3, 44, 138, 24, 239, 112, 181, 76, 233, 33754, 35549, 35823, 20050, 15, 217, 100, 114, 20, 155, 174, 207, 197, 119, 5, 152, 64, 98, 134, 114, 69, 4, 157, 243, 168, 47, 185, 175, 209, 19, 148, 16, 74, 21, 245, 210, 29, 153, 65, 49, 247, 9, 43, 142, 119, 49, 184, 242, 47, 221, 143, 17, 234, 108, 229, 222, 197, 96, 228, 22, 105, 109, 95, 132, 7, 46, 254, 217, 124, 137, 97, 70, 82, 216, 106, 119, 5, 44, 247, 86, 208, 206, 195, 105, 19, 7, 88, 50, 63, 23])
    //   }, 1500)
    // })
    // let p1 = new Promise((resolve, reject) => {
    //   setTimeout(function () {
    //     resolve('p1')
    //   }, 2000)
    // })
    // Promise.race([p0, p1]).then(response => {
    //   // 把pvdata的密文保存在服务器的硬盘
    //   fs.writeFile(`uploads/private/${did}pvdata.txt`, `[${response.join(', ')}]`, (err) => {
    //     if (err) {
    //       // console.log(err)
    //       res.status(500).json({
    //         result: false,
    //         message: '',
    //         error: ''
    //       })
    //     } else {
    //       res.status(200).json({
    //         result: true,
    //         message: '',
    //         data: ''
    //       })
    //     }
    //   })
    // })
    // tokenSDKServer.getPvData(did).then(response => {
    //   console.log(response)
    //   res.status(200).json({
    //     result: true,
    //     message: '',
    //     data: response
    //   })
    // }).catch(error => {
    //   res.status(500).json({
    //     result: false,
    //     message: '',
    //     error: error
    //   })
    // })
    // res.status(200).json({
    //   result: true,
    //   message: '',
    //   data: {}
    // })

  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

module.exports = router;

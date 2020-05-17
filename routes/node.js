var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

/* GET users listing. */
router.route('/vcode')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  // .get(cors.corsWithOptions, (req, res, next) =>{
  .get((req, res, next) =>{
    // res.send('respond with a resource');
    // 生产环境使用短信的方式发送。
    // 判断参数是否有效
    // 开发环境使用接口的方式发送。
    // req.params.phone
    res.status(200).json({
      result: true,
      data: {
        checkCode: '123456'
      },
      message: ""
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

router.route('/udidList')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // console.log('req')
    // req.params.phone
    // 判断参数是否有效
    res.status(200).json({
      result: true,
      data: {
        udidList: [
          {
            title: 'airplane',
            udid: 'did:ttm:u012345678a5201b690bf0b79eb715dad9ae7815efe9800998ecf8427e8d74'
          },
          {

            title: 'tank',
            udid: 'did:ttm:u012340987a5201b690bf0b79eb715dad9ae7815efe9800998ecf8427e8d74'
          }
        ]
      },
      message: ""
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

var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

/* GET users listing. */
router.route('/vcode/:phone')
  .options((req, res) => {
    res.sendStatus(200)
  })
  .get((req, res, next) =>{
    // res.send('respond with a resource');
    // 生产环境使用短信的方式发送。
    // 判断参数是否有效
    // 开发环境使用接口的方式发送。
    res.status(200).json({
      result: true,
      data: {
        checkCode: '123456'
      },
      message: ""
    })
  })
  .post((req, res, next) => {
    res.send('post')
  })
  .put((req, res, next) => {
    res.send('put')
  })
  .delete((req, res, next) => {
    res.send('delete')
  })

router.route('/udidList')
  .options((req, res) => {
    res.sendStatus(200)
  })
  .get((req, res, next) =>{
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
  .post((req, res, next) => {
    res.send('post')
  })
  .put((req, res, next) => {
    res.send('put')
  })
  .delete((req, res, next) => {
    res.send('delete')
  })

module.exports = router;

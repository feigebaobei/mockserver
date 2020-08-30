var express = require('express');
var router = express.Router();
const md5 = require('md5')
const passport = require('passport')
const tokenSDKServer = require('token-sdk-server')
var utils = require('../lib/utils.js')
var bodyParser = require('body-parser')
var cors = require('./cors')
// const redisUtils = require('../lib/redisUtils.js')
const User = require('../models/user')
const config = require('../lib/config')
const mongodbUtils = require('../lib/mongodbUtils')
const {mongoStore, getAllSession, getSessionBySid, setSession} = require('../lib/mongoStore.js')
// const authenticate = require('../lib/authenticate')
const authRedis = require('../lib/authRedis')
// router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

/* GET users listing. */
router.get('/', cors.corsWithOptions, function(req, res, next) {
  res.send('respond with a resource');
});

// 登录
// router.post('/login', (req, res, next) => {
//   res.send({name: 'tank', avatar: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1718143317,3612074652&fm=26&gp=0.jpg'})
// })
router.route('/login')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
      res.status(200).json({
        result: true,
        message: 'login success',
        data: req.user
      })
    }
  )
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 注册
router.route('/signup')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {email, password} = req.body
    // email = String(Math.floor(Math.random() * 100000))
    User.findOne({email: email}).exec().then(response => {
      if (response) {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.existUser.message)})
      } else {
        let user = new User({
          email: email,
          password: md5(password)
        })
        return mongodbUtils.save(user).then(response => {
          if (response.error) {
            return Promise.reject({isError: true, payload: response.result})
          } else {
            return Promise.reject({isError: false, payload: response.result})
          }
        })
      }
    })
    .catch(({isError, payload}) => {
      // console.log(isError, payload)
      if (isError) {
        res.status(500).json({
          result: false,
          message: payload.message,
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

// 用户的登录状态
router.route('/loginStatus')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    console.log(req.sessionID, req.session)
    console.log(req.user)
    if (req.user) {
      res.status(200).json({
        result: true,
        message: '已登录',
        data: true
      })
    } else {
      res.status(200).json({
        result: false,
        message: '未登录',
        data: false
      })
    }
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send(post)
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 用户信息
router.route('/userInfo')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, authRedis.isAuthenticated, (req, res, next) => {
    console.log(req.user)
    res.status(200).json({
      result: true,
      message: '',
      data: req.user
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

router.route('/phone/checkCode')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    // 生产环境使用短信的方式发送。
    // 开发环境使用接口的方式发送。
    res.status(200).json({
      result: true,
      data: {
        checkCode: '123456'
      },
      message: ""
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    console.log('2134567')
    console.log(JSON.stringify(req.body))
    // res.send('post')
    res.status(200).json({
      result: true,
      data: {
        key: 'value'
      },
      message: '2345resx'
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/receive')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    console.log('2134567')
    console.log(JSON.stringify(req.body))
    if (req.body.name && req.body.avatar && req.body.udid) {
      res.status(200).json({
        result: true,
        data: JSON.stringify(req.body),
        message: ''
      })
    } else {
      res.status(400).json({
        result: false,
        error: '没有name/avatar/udid.',
        message: '没有name/avatar/udid.'
      })
    }
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/logout')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, authRedis.isAuthenticated, (req, res, next) => {
    req.logout()
    // console.log(req.session)
    // console.log(req.user)
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

// router.route('/test')
//   .options(cors.corsWithOptions, (req, res) => {
//     res.sendStatus(200)
//   })
//   .get(cors.corsWithOptions, (req, res, next) => {
//     res.send('get')
//   })
//   .post(cors.corsWithOptions, (req, res, next) => {
//     console.log(req.cookies)
//     console.log(req.session)
//     console.log(req.user)
//     res.send('post')
//   })
//   .put(cors.corsWithOptions, (req, res, next) => {
//     res.send('put')
//   })
//   .delete(cors.corsWithOptions, (req, res, next) => {
//     res.send('delete')
//   })

// 测试用
router.route('/cookie')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // console.log(req.body)
    // console.log(req.session)
    // console.log(req.user)
    res.cookie('name', 'stone', {maxAge: 60000, httpOnly: true})
    res.cookie('name1', 'stone', {maxAge: 60000, httpOnly: true})
    // res.cookie('name20', 'stone', {maxAge: 60000, httpOnly: true, signed: true})
    // res.cookie('name21', 'stone', {maxAge: 60000, httpOnly: true, signed: true})
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// qrStr
router.route('/qrStr')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    let expire = Date.now() + 60 * 1000 // * 24 * 60
    // console.log(req.session)
    req.session.expireQrStr = expire
    res.status(200).json({
      result: true,
      message: '',
      data: tokenSDKServer.genBindQrStr(['name', 'gender'], 'N', req.sessionID, '登录认证应用', expire)
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

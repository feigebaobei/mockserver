var express = require('express');
var router = express.Router();
const md5 = require('md5')
const passport = require('passport')
const tokenSDKServer = require('token-sdk-server')
var utils = require('../lib/utils.js')
var bodyParser = require('body-parser')
var cors = require('./cors')
// const redisUtils = require('../lib/redisUtils.js')
// const User = require('../models/user')
const config = require('../lib/config')
// const mongodbUtils = require('../lib/mongodbUtils')
// const {mongoStore, getAllSession, getSessionBySid, setSession} = require('../lib/mongoStore.js')
// const authenticate = require('../lib/authenticate')
const authRedis = require('../lib/authRedis')
const {ac} = require('../lib/accessControl')
const redisUtils = require('../lib/redisUtils')
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
  .post(cors.corsWithOptions,
    passport.authenticate('local'),
    (req, res, next) => {
    // 需要完善
    // res.status(200).json({
    //   result: true,
    //   message: 'login success',
    //   data: req.user
    // })
    // console.log(req.body)
    let {email, password} = req.body
    // console.log(req.login)
    // console.log(req.session)
    utils.getUserRds(email, 'email').then(({error, result}) => {
      if (result) {
        let user = JSON.parse(result)
        delete user.password
        // console.log('user', user)
        req.lgoin(user, (error) => {
          // console.log(error)
          if (error) {
            return Promise.reject({isError: true, payload: new Error(config.errorMap.loginFail.message)})
          } else {
            return Promise.reject({isError: false, payload: user})
          }
        })
        // return Promise.reject({isError: false, payload: user})
      } else {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.unExistUser.message)})
      }
    })
    .catch(({isError, payload}) => {
      if (isError) {
        utils.resFormatter(res, 500, {message: payload.message})
      } else {
        // console.log(req.sessionID, req.session)
        // console.log(req.user)
        // req.login(function (a, b, c) {
        //   console.log(a, b ,c)
        // })
        utils.resFormatter(res, 200, {data: payload})
      }
    })
    .catch(error => {
      console.log(error)
    })
  })
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
  .post(cors.corsWithOptions,
    (req, res, next) => {
    let {email, password} = req.body
    // 使用mongodb保存用户
    // 请不要删除这里。
    // email = String(Math.floor(Math.random() * 100000))
    // User.findOne({email: email}).exec().then(response => {
    //   if (response) {
    //     return Promise.reject({isError: true, payload: new Error(config.errorMap.existUser.message)})
    //   } else {
    //     let user = new User({
    //       email: email,
    //       password: md5(password)
    //     })
    //     return mongodbUtils.save(user).then(response => {
    //       if (response.error) {
    //         return Promise.reject({isError: true, payload: response.result})
    //       } else {
    //         return Promise.reject({isError: false, payload: response.result})
    //       }
    //     })
    //   }
    // })
    // .catch(({isError, payload}) => {
    //   // console.log(isError, payload)
    //   if (isError) {
    //     res.status(500).json({
    //       result: false,
    //       message: payload.message,
    //       error: payload
    //     })
    //   } else {
    //     res.status(200).json({
    //       result: true,
    //       message: '',
    //       data: payload
    //     })
    //   }
    // })
    // 使用redis保存用户
    utils.getUserRds(email, 'email').then(({error, result}) => {
      if (!result) {
        // 不存在则创建
        let origin = tokenSDKServer.utils.schemeToObj(config.redis.userScheme, {
          email,
          password: md5(password),
          // role: ['user']
          role: 'user'
        })
        // console.log('signup', origin)
        return utils.createUserRds(origin).then(({error, result}) => {
          if (error) {
            return Promise.reject({isError: true, payload: error})
          } else {
            return Promise.reject({isError: false, payload: result})
          }
        })
      } else {
        // 存在则报错
        return Promise.reject(({isError: true, payload: new Error(config.errorMap.existUser.message)}))
      }
    })
    .catch(({isError, payload}) => {
      if (isError) {
        utils.resFormatter(res, 500, {message: payload.message})
      } else {
        utils.resFormatter(res, 200, {data: payload})
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
    // console.log(req.user)
    res.status(200).json({
      result: true,
      message: '',
      data: JSON.parse(req.user)
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

// 登出
router.route('/logout')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, authRedis.isAuthenticated, (req, res, next) => {
    req.logout()
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

// 请求qrStr
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

// 查询用户
router.route('/select')
  .options(cors.corsWithOptions, authRedis.isAuthenticated, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    let {type, value} = req.query
    // console.log(req)
    let uId = req.session.passport.user
    // let user = req.user
    let role = req.user.role
    // let req.userId
    // userId
    // 判断是否有权限
    role = 'auditor' // 测试用
    ac.can(role).execute('read').on('user').then(permission => {
      // console.log('then', permission)
      if (permission.granted) {
        return true
      } else {
        utils.resFormatter(res, 401, {message: config.errorMap.denyAccess.message, data: {}})
      }
    })
    .catch(error => {
      // console.log('catch', error)
      utils.resFormatter(res, 500, {message: config.errorMap.denyAccess.message})
      // return Promise.reject({isError: true, payload: new Error(config.errorMap.denyAccess.message)})
    })
    // 取消用户数据
    .then(bool => {
      uId = 'user:7a4c6aeb-dcc0-4815-9f91-cf49a20aad42' // 测试用
      return redisUtils.str.get(uId).then(({error, result}) => {
        if (error) {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.queryFail.message)})
        } else {
          return Promise.reject({isError: false, payload: result})
        }
        // console.log(user)
      })
      .catch(({isError, payload}) => {
        // console.log(error)
        if (isError) {
          utils.resFormatter(res, 500, {message: payload.message || ''})
        } else {
          utils.resFormatter(res, 200, {data: [JSON.parse(payload)]})
        }
      })
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

// 查询角色
router.route('/roles')
  .options(cors.corsWithOptions, authRedis.isAuthenticated, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    utils.resFormatter(res, 200, {data: config.redis.roles})
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

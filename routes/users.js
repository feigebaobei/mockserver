var express = require('express');
var router = express.Router();
const md5 = require('md5')
const passport = require('passport')
var utils = require('../lib/utils.js')
var bodyParser = require('body-parser')
var cors = require('./cors')
const redisUtils = require('../lib/redisUtils.js')
const User = require('../models/user')
const config = require('../lib/config')
const mongodbUtils = require('../lib/mongodbUtils')

// router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

/* GET users listing. */
router.get('/', cors.corsWithOptions, function(req, res, next) {
  res.send('respond with a resource');
});

// 指明需要用户提供那些数据
router.get('/login/userInfo', cors.corsWithOptions, (req, res, next) => {
  // console.log(req.session.id)
  // req.session.save((err) => {
  //   // 应该在数据库记录错误
  //   console.log('指明需要用户提供那些数据', err)
  // })
  res.status(200).json({
    result: true,
    data: {
      adid: 'did:ttm:a0f49a0b95a5201b690bf0b79eb715dad9ae7815efe9800998ecf8427e8d74',
      userInfoList: ['name', 'avatar', 'udid'],
      goal_uri: 'http://127.0.0.1:9876/user/login',
      // sessionId: utils.getUuid()
      uuid: utils.getUuid()
      // sessionId: req.session.id
    },
    message: ''
  })
})

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
    // passport.authenticate('local', (err, user, msgObj, d) => {
    //   console.log(err, user, msgObj, d)
    // }),
    passport.authenticate('local'),
    (req, res, next) => {
      // console.log('body', req.body)
      // console.log('body', req.session)
      res.status(200).json({
        result: 200,
        message: 'login success',
        data: {}
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
          // message: '',
          message: payload.message,
          // error: payload
          // error: new Error("dfsdfsd")
          // error: new Error(payload.message)
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

// 前端请求用户信息
router.route('/userInfo/:uuid')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    // 从mongodb里，根key取出用户属性。
    // res.send('get')
    // setTimeout(() => {
    //   res.send({
    //     name: 'tank',
    //     avatar: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1718143317,3612074652&fm=26&gp=0.jpg'
    //   })
    // }, 3000)

    // let randNum = Math.floor(Math.random() * 3)
    let randNum = false
    // console.log(randNum)
    if (!randNum) {
      res.status(200).json({
        result: true,
        data: {
          // name: 'tank',
          nickName: 'tank',
          avatar: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1718143317,3612074652&fm=26&gp=0.jpg',
          udid: 'did:ttm:u0f49a0b95a5201b690bf0b79eb715dad9ae7815efe9800998ecf8427e8d74'
        },
        message: ''
      })
    } else {
      // res.send(false)
      res.status(500).json({result: false, message: 'do not have userInfo', error: ''})
    }
  })
  // 接收用户属性
  .post(cors.corsWithOptions, (req, res, next) => {
    // 检查mongodb里是否有uuid。
    // 使用`·utils.getUuid()`生成一个key，其对应值为用户属性。保存在mongodb里。
    res.send(true)
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
  .post(cors.corsWithOptions, (req, res, next) => {
    // console.log('2134567')
    console.log(req.session)
    console.log(req.user)
    // if (req.session) {
    //   req.logout()
    // }
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

router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    console.log(req.body)
    console.log(req.session)
    console.log(req.user)
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })
module.exports = router;

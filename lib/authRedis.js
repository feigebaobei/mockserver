/**
 * 与redis配合使用的模块
 * @type {[type]}
 */
const passport = require('passport')
const LocalStorage = require('passport-local').Strategy
const md5 = require('md5')
const utils = require('./utils.js')

passport.use(new LocalStorage({usernameField: 'email'}, (email, password, done) => {
  utils.getUserRds(email, 'email').then(({error, result}) => {
    // console.log('local', error)
    // console.log(error, result)
    if (error) {
      return done(error)
    }
    if (!result) {
      return done(null, false, {message: 'email is invalid'})
    }
    result = JSON.parse(result)
    // console.log('local', result)
    if (!password) {
      return done(null, false, {message: 'password is invalid'})
    }
    if (md5(password) === result.password) {
      return done(null, result)
    } else {
      return done(null, false, {message: 'password is invalid'})
    }
  })
}))

// 序列化
passport.serializeUser((user, done) => {
  // console.log(user, done)
  // console.log('serializeUser', user)
  done(null, user.uid)
})
// 反序列化
passport.deserializeUser((uid, done) => {
  // console.log(uid, done)
  utils.getUserRds(uid, 'uid').then(({error, result}) => {
    // console.log(error, result)
    done(error, result)
  })
  .catch(error => {
    console.log('error', error)
  })
})

let isAuthenticated = (req, res, next) => {
  // console.log(req.session)
  // console.log(req.user)
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.status(401).json({
      result: false,
      message: '未登录',
      data: {}
    })
  }
}

let isAdmin = (req, res, next) => {
  return req.user.admin
}

module.exports = {
  isAuthenticated,
  isAdmin
}

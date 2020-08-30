const passport = require('passport')
const LocalStorage = require('passport-local').Strategy
const md5 = require('md5')
const utils = require('./utils.js')

passport.use(new LocalStorage({usernameField: 'email'}, (email, passport, done) => {
  utils.getUserRds(email, 'email').then(({error, result}) => {
    console.log(error, result)
    if (error) {
      return done(error)
    }
    if (!result) {
      return done(null, false, {message: 'email is invalid'})
    }
    if (!password) {
      return done(null, false, {message: 'password is invalid'})
    }
    if (md5(password) === result.password) {
      return done(null, user)
    } else {
      return done(null, false, {message: 'password is invalid'})
    }
  })
}))

// 序列化
passport.serializeUser((user, done) => {
  console.log(user, done)
  done(null, user.uid)
})
// 反序列化
passport.deserializeUser((uid, done) => {
  utils.getUserRds(uid, 'uid').then(({error, result}) => {
    done(error, result)
  })
})

let isAuthenticated = (req, res, next) => {
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

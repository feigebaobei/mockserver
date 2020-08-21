const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  md5 = require('md5'),
  User = require('../models/user')

// passport.use(new LocalStrategy(User.authenticate()))
// 学习passport-local-mongoose

// 挂载localStrategy
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
  User.findOne({email: email}, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      // console.log(err, user)
      return done(null, false, {message: 'email is invalid'})
    }
    if (!user.password) {
      return done(null, false, {message: 'password is invalid'})
    }
    let reqPw = md5(password)
    if (reqPw === user.password) {
      return done(null, user)
    } else {
      return done(null, false, {message: 'password and password mismatching'})
    }
  })
}))

// 序列化
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// 反序列化
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
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

module.exports = {
  isAuthenticated
}
// var mongoose = require('mongoose')
var {Schema, model} = require('mongoose')
// var passportLocalMongoose = require('passport-local-mongoose')
var User = new Schema({
  // passport-local-mongoose 会添加username / password字段
  // firstname: {
  //   type: String,
  //   default: ''
  // },
  // lastname: {
  //   type: String,
  //   default: ''
  // },
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  token: {
    type: String,
    dafault: '',
  },
  github: {
    type: String,
    dafault: '',
  },
  tokens: {
    type: Array,
    default: []
  },
  admin: {
    type: Boolean,
    default: false
  },
  loginTime: {
    type: Number,
    default: 0
  },
  profile: {
    name: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      default: ''
    },
    picture: {
      type: String, // base64
      default: ''
    },
  }
})
// User.plugin(passportLocalMongoose)

module.exports = model('User', User)
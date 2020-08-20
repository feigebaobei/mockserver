var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var logger = require('morgan');
const session = require('express-session');
// var FileStore = require('session-file-store')(session)
// var redis = require('redis')
const mongoose = require('mongoose')
const passport = require('passport')
const config = require('./lib/config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var newsRouter = require('./routes/news');
var nodeRouter = require('./routes/node');
var didRouter = require('./routes/did');
var claimRouter = require('./routes/claim');
var privateRouter = require('./routes/private');
var testRouter = require('./routes/test');
var auditRouter = require('./routes/audit.js')
var schedule = require('./schedule.js')
// var webSocket = require('./webSocket.js')
// var webSocket = require('./ws2.js') // 测试用
const authenticate = require('./authenticate.js')
const {mongoStore} = require('./mongoStore.js')
var webSocket = require('./communicate.js')

// 连接数据库 redis
// let red_config = config.redis,
//     RED_HOST = red_config.host,
//     RED_PWD = red_config.pass,
//     RED_PORT = red_config.port,
//     RED_OPTS = {auth_pass: RED_PWD},
//     client = redis.createClient(RED_PORT, RED_HOST, RED_OPTS)
// client.on('ready', (res) => {
//   console.log('ready')
// })
// client.on('end', (res) => {
//   console.log('end')
// })
// client.on('error', (error) => {
//   console.log('error', error)
// })
// client.on('connect', (res) => {
//   console.log('connect')
// })

// // 连接数据库 mongodb
// let url = config.mongodbUrl
// // 连接数据库
// const url = config.mongoUrl
const url = config.mongodb.prod
// console.log('url', url)
const connect = mongoose.connect(url, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true})
connect.then(db => {
  console.log('Connected mongodb')
}).catch(err => {console.log(err)})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // 托管静态文件

app.use(session({
  // name: 'session-id',
  // secret: '12345-67890',
  // saveUninitialized: false,
  // resave: true,
  // store: new FileStore()

  // resave: true,
  name: 'tokenDid',
  secret: config.session.secret,
  // saveUninitialized: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    // domain: 'localhost:8080',
    // domain: 'http://localhost',

    // domain: 'localhost',
    // domain: '127.0.0.1',

    // domain: 'baidu.com', // no
    // domain: 'baidu', // no
    // path: 'localhost',
    // httpOnly: false,
    // secure: true,
    // secure: false,
    // sameSite: 'strict',
    // sameSite: 'lax',
    // sameSite: 'none',
    // rolling: true
  },
  store: mongoStore
}))
app.use(passport.initialize())
app.use(passport.session())

// 允许跨域
// app.all('*', (req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true')
//   res.header('Access-Control-Allow-Origin', 'https://mockvue.now.sh')
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
//   res.header('Access-Control-Allow-Headers', 'Content-Type')
//   res.header('Access-Control-Max-Age', 3600)
//   next()
// })

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/news', newsRouter);
app.use('/node', nodeRouter);
app.use('/did', didRouter);
app.use('/claim', claimRouter);
app.use('/private', privateRouter);
app.use('/audit', auditRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var logger = require('morgan');
// var session = require('express-session');
// var FileStore = require('session-file-store')(session)
var redis = require('redis')
var config = require('./lib/config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var newsRouter = require('./routes/news');
var nodeRouter = require('./routes/node');
var didRouter = require('./routes/did');
var claimRouter = require('./routes/claim');
var privateRouter = require('./routes/private');
var testRouter = require('./routes/test');
var schedule = require('./schedule.js')
var webSocket = require('./webSocket.js')
// var webSocket = require('./ws2.js') // 测试用

// 连接数据库
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

// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890',
//   saveUninitialized: false,
//   resave: true,
//   store: new FileStore()
// }))

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

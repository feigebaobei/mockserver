var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var config = require('../lib/config')
var bodyParse = require('body-parser')
const redisClient = require('../redisClient.js')

const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    // host: '127.0.0.1', // ok
    // host: 'lixiaodan.org',
    // host: 'lixiaodan',
    // host: '47.94.105.206',
    // host: '172.25.0.51',
    // server: 'lixiaodan.org',
    port: config.webSocket.port || 9875
  })
// console.log('wss', wss)
wss.on('connection', (ws) => {
  // 参数ws是一个websocket的实例
  // console.log('服务端：客户端已经连接', ws)
  console.log('服务端：', ws, ws.upgradeReq)
  ws.on('message', (message) => {
    console.log(message)
    let key = 'qwer1234'
    redisClient.set(key, message, (err, resObj) => {
      if (err) {
        ws.send(`${JSON.stringify(err)}`)
      } else {
        redisClient.get(key, (err, resObj) => {
          if (err) {
            ws.send('取出数据时出错了')
          } else {
            ws.send(`从redis里取出的数据：${resObj}`)
          }
        })
        // ws.send('')
      }
    })
    // ws.send(`receive: ${message}`)
  })

})

// const WebSocket = require('ws')
// // const ws = new WebSocket('ws://www.host.com/path')
// const ws = new WebSocket('wss://echo.websocket.org/', {
//   origin: 'https://websocket.org'
// })
// ws.on('open', function open() {
//   console.log('connected');
//   ws.send(Date.now());
// });
// ws.on('close', function close() {
//   console.log('disconnected');
// });
// ws.on('message', function incoming(data) {
//   console.log(`Roundtrip time: ${Date.now() - data} ms`);
//   setTimeout(function timeout() {
//     ws.send(Date.now());
//   }, 500);
// });

// ws.on('open', function () {
//   ws.send('something open')
// })
// ws.on('message', function (data) {
//   console.log(data)
//   ws.send(`receive: ${data}`)
// })



// var speed = {
//   'A1111': 95.0,
//   'A2222': 50.0
// }
// var randomSpeedUpdater = function () {
//     for (var item in speed) {
//         var randomizedChange = Math.random(60, 120);
//         speed[item] += randomizedChange;
//     }
// }

// /* GET users listing. */
// router.route('/test')
//   .options(cors.corsWithOptions, (req, res) => {
//     res.sendStatus(200)
//   })
//   .get(cors.corsWithOptions, (req, res, next) =>{
//     res.send('get')
//   })
//   .post(cors.corsWithOptions, (req, res, next) => {
//     res.send('post')
//   })
//   .put(cors.corsWithOptions, (req, res, next) => {
//     res.send('put')
//   })
//   .delete(cors.corsWithOptions, (req, res, next) => {
//     res.send('delete')
//   })

// module.exports = router;

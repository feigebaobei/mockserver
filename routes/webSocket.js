var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var redis = require('redis')
var config = require('../lib/config')
var bodyParse = require('body-parser')
const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    port: config.webSocket.port || 9870
  })

// router.use(bodyParse.json())
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

var speed = {
  'A1111': 95.0,
  'A2222': 50.0
}
// var randomSpeedUpdater = function () {
//     for (var item in speed) {
//         var randomizedChange = Math.random(60, 120);
//         speed[item] += randomizedChange;
//     }
// }

wss.on('connection', (ws) => {
  // console.log('服务端：客户端已经连接', ws)
  console.log('服务端：客户端已经连接')
  ws.on('message', (message) => {
    console.log(message)
  })
})

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

module.exports = router;

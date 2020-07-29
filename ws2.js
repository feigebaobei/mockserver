// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
var config = require('./lib/config')
const redisClient = require('./redisClient.js')
const http = require('http')
const WebSocket = require('ws')
const fs = require('fs')

let {didttm} = require('./tokenSDKData/privateConfig.js')

let url = 'ws://localhost:9875'
let did = didttm.did // eg 'did:ttm:o04d88758f182adbf2e936a4be7b8129ef13fc0f1de9800998ecf8427e54ee'
url += `?did=${did}`

// 创建消息
let createMessage = (content = '', receiver = [], method = '', messageId = '', createTime = new Date().getTime()) => {
  return JSON.stringify({
    method: method,
    content: content,
    messageId: messageId,
    createTime: createTime,
    receiver: receiver
  })
}


let reConnect = () => {
  setTimeout(() => {
    initWS(url)
  }, config.webSocket.reConnectGap)
}

let initWS = (url) =>{
  // ws.on('open', (e) => {
  //   console.
  // })
  ws = new WebSocket(url)
  ws.on('open', (e) => {
    console.log('open', e)
    // ws.send(createMessage('hello', [], 'test'))
  })
  ws.on('message', (e) => {
    console.log(e)
  })
  ws.on('error', (e) => {
    console.log(e)
    reConnect()
  })
  ws.on('close', () => {
    reConnect()
  })
  return ws
}

initWS(url)

module.exports = {
  websocketClient: ws,
  createMessage
}

// // 断开ws 测试用
// setInterval(() => {
//   ws.close()
// }, 1000)
// // 查看ws状态 测试用
// setInterval(() => {
//   console.log('ws.readyState', ws.readyState)
//   ws.send(createMessage('hello', [], 'test'))
// }, 1000)
// 检测心跳。用不上了。
// var heartCheck = {
//     timeout: heartBeatTime*1000,  //  心跳检测时长
//     timeoutObj: null, // 定时变量
//     reset: function () { // 重置定时
//         clearTimeout(this.timeoutObj);
//         return this;
//     },
//     start: function () { // 开启定时
//         var self = this;
//         this.timeoutObj = setTimeout(function () {
//           // 心跳时间内收不到消息，主动触发连接关闭，开始重连
//             ws.close();
//         },this.timeout)
//     }
// }
// 使用heartCheck.reset().start()
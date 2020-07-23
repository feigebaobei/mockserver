// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
var config = require('./lib/config')
const redisClient = require('./redisClient.js')

const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    port: config.webSocket.port
  })

// 广播
wss.broadcast = (data) => {
  wss.clients.forEach(client => {
    client.send(data)
  })
}
// 创建消息
let messageIndex = 0
let createMessage = (type, user, data) => JSON.stringify({id: messageIndex++, type: type, user: user, data: data})
// 保持同一did只有一个client
let onlyOneOnline = (did, wss, ws) => {
  ws.did = did
  let clients = [...wss.clients]
  let sameDid = clients.filter(item => {
    return item.did === did
  })
  // console.log('sameDid', sameDid)
  if (sameDid.length > 1) {
    sameDid[0].send('相同did不能多点登录')
    sameDid[0].close()
  } else {
    // 无操作
  }
  // console.log('ws.clients', wss.clients.size)
}
// 压入消息
let pressInMsg = (dids, msg) => {
  dids = [...new Set(dids)]
  let clients = [...wss.clients]
  let pArr = dids.reduce((resObj, item) => {
    let p = new Promise((resolve, reject) => redisClient.set(item, msg, (err, resObj) => err ? reject(err) : resolve(resObj)))
    resObj.push(p)
    return resObj
  }, [])
  return Promise.all(pArr)
}
// 设置消息列表
let setMsgList = (key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.set(key, value, (err, resObj) => {
      err ? reject(err) : resolve(resObj)
    })
  })
}
// 从redis里取出消息列表
let getMsgList = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, resObj) => {
      err ? reject(err) : resolve(resObj)
    })
  })
}
let delMsg = (key) => {}
/**
 * 弹出消息
 * @param  {array} dids [接收者did组成的数组]
 * @return {[type]}      [description]
 */
let popUpMsg = (dids) => {
  // dids去重
  dids = [...new Set(dids)]
  // console.log()
  let clients = [...wss.clients]
  let onlineClient = clients.filter(item => dids.some(subItem => subItem === item.did))
  // 为每一个在线在did发送消息
  onlineClient.map(item => {
    getMsgList(item.did).then(response => {
      // console.log(response)
      item.send(response)
    }).catch(error => {
      item.send(error)
    })
  })
}

wss.on('connection', (ws, req) => {
  // 参数ws是一个websocket的实例
  // 得到did
  let index = req.url.indexOf('did:ttm:')
  let did = req.url.slice(index, index + 70)
  // console.log('did', did)
  // 检查did是否正确
  if (did.length != 70) {
    // ws.send('did不正确')
    // ws.close()
    ws.close('4001', 'did不正确')
  }
  // 保持同一did只有一个client
  onlyOneOnline(did, wss, ws)
  // 发送消息队列
  popUpMsg([ws.did])
  ws.on('message', (message) => {
    let infoObj = JSON.parse(message)
    // console.log(infoObj)
    if (!infoObj.receiver.length) {
      ws.send('receiver is empty')
    } else {
      pressInMsg(infoObj.receiver, JSON.stringify(infoObj.data))
      // .then(response => {
      //   console.log(response)
      //   ws.send(JSON.stringify(response))
      // }).catch(error => {
      //   console.log(error)
      //   ws.send(error)
      // })
      .then(() => {
        popUpMsg(infoObj.receiver)
      })
    }

  //   console.log(message)
  //   let key = 'qwer1234'
  //   redisClient.set(key, message, (err, resObj) => {
  //     if (err) {
  //       ws.send(`${JSON.stringify(err)}`)
  //     } else {
  //       redisClient.get(key, (err, resObj) => {
  //         if (err) {
  //           ws.send('取出数据时出错了')
  //         } else {
  //           // ws.send(`从redis里取出的数据：${resObj}`)
  //           wss.broadcast(`广播，从redis里取出的数据：${resObj}`)
  //         }
  //       })
  //       // ws.send('')
  //     }
  //   })
  //   // ws.send(`receive: ${message}`)
  })
})

// setInterval(function () {
//   wss.broadcast('hello')
// }, 500)


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

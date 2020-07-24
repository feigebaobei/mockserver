// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
var config = require('./lib/config')
const redisClient = require('./redisClient.js')
// const http = require('http')
// const WebSocket = require('ws')
// const server = http.createServer()
// const wss2 = new WebSocket.Server({noServer: true})

const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    port: config.webSocket.port
  })
  // ,
  // wss2 = new WebSocketServer({
  //   noServer: true
  // })

// 广播
wss.broadcast = (data) => {
  wss.clients.forEach(client => {
    client.send(data)
  })
}
// 创建消息
let createMessage = (content = '', type = 'message', messageId = [], createTime = new Date().getTime(), receiver = []) => {
  return JSON.stringify({
    type: type,
    content: content,
    messageId: messageId,
    createTime: createTime,
    receiver: receiver
  })
}
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
// 设置消息列表
let setMsgList = (key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.rpush(key, value, (err, resObj) => {
      err ? reject(err) : resolve(resObj)
    })
  })
}
// 压入消息
let pressInMsg = (dids, msg) => {
  dids = [...new Set(dids)]
  let clients = [...wss.clients]
  let pArr = dids.reduce((resObj, item) => {
    let p = setMsgList(item, msg)
    resObj.push(p)
    return resObj
  }, [])
  return Promise.all(pArr)
}
// 从redis里取出消息列表
let getMsgList = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.lrange(key, 0, -1, (err, resObj) => {
      err ? reject(err) : resolve(resObj)
    })
  })
}
/**
 * 弹出消息
 * @param  {array} dids [接收者did组成的数组]
 * @return {[type]}      [description]
 */
let popUpMsg = (dids) => {
  // dids去重
  dids = [...new Set(dids)]
  let clients = [...wss.clients]
  let onlineClient = clients.filter(item => dids.some(subItem => subItem === item.did))
  // 为每一个在线在did发送消息
  // console.log('在线的did', onlineClient.reduce((resObj, cur) => {
  //   resObj.push(cur.did)
  //   return resObj
  // }, []))
  onlineClient.map(item => {
    getMsgList(item.did).then(response => {
      // 若key存在则返回key对应的value。value是数组。
      // 若key不存在则返回[]。
      // 即response总是数组。
      // console.log('发出的消息 response', response)
      let arr = response.reduce((resObj, cur, index) => {
        cur = JSON.parse(cur)
        cur.messageId = index
        resObj.push(cur)
        return resObj
      }, [])
      // console.log('发出的消息', item.did, arr)
      item.send(JSON.stringify(arr))
    }).catch(error => {
      // console.log('发出的消息', error)
      item.send(JSON.stringify(error))
    })
  })
}
// 删除消息list中的指定下标的元素
let delMsgIndex = (key, index) => {
  return new Promise((resolve, reject) => {
    redisClient.lindex(key, index, (err, resObj) => {
      if (err) {
        reject(err)
      } else {
        console.log('resObj', resObj)
        redisClient.lrem(key, index, resObj, (err, resObj) => {
          err ? reject(err) : resolve(resObj)
        })
      }
    })
  })
}
// 删除key
// let delKey = (key) => {
//   return new Promise((resolve, reject) => {
//     redisClient.del(key, (err, resObj) => {
//       err ? reject(err) : resolve(resObj)
//     })
//   })
// }
// 删除消息
let delMsg = (key, msgIds) => {
  msgIds = [...new Set(msgIds)]
  // console.log('删除消息', key, msgIds)
  if (msgIds.length) {
    let clients = [...wss.clients]
    let pArr = msgIds.reduce((resObj, item) => {
      resObj.push(delMsgIndex(key, item))
      return resObj
    }, [])
    return Promise.all(pArr)
    // .then((response) => {
    //   console.log('response1',  response)
    //   return getMsgList(key)
    //   .then(response => {
    //     console.log('response2', response)
    //     if (!response.length) {
    //       return delKey(key)
    //     }
    //   })
    // })
    // .catch(error => {
    //   return error
    // })
  } else {
    // 无操作
  }
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
    // let infoObj = message
    // console.log('infoObj', infoObj)
    switch (infoObj.type) {
      case 'message':
        if (!infoObj.receiver.length) {
          ws.send('receiver is empty')
        } else {
          pressInMsg(infoObj.receiver, JSON.stringify(infoObj))
          // .then(response => {
          //   console.log('response', response)
          //   // ws.send(JSON.stringify(response))
          // }).catch(error => {
          //   console.log('error', error)
          //   // ws.send(error)
          // })
          .then(() => {
            popUpMsg(infoObj.receiver)
          })
        }
        break
      case 'ping':
        ws.send(createMessage('', 'pong'))
        break
      case 'read':
        let msgIds = infoObj.messageId
        if (!(msgIds instanceof Array)) {
          ws.send(createMessage('messageId should is array.'))
        } else {
          delMsg(ws.did, msgIds)
        }
        break
      case 'unread':
        // 暂时无操作
        break
      case 'leave':
        break
      case 'close':
        ws.close('4001', 'client request close.')
        break
      case 'pong':
      default:
        ws.send('type is error.')
        break
    }
  })
})

// wss2.on('connection', (ws, req, client) => {
//   console.log('connection')
//   ws.on('message', (msg) => {
//     ws.send(`receiver ${msg}`)
//   })
// })

// server.on('upgrade', (request, socket, head) => {
//   wss2.handleUpgrade(request, socket, head, (ws) => {
//     wss2.emit('connection', ws, request, client)
//   })
// })
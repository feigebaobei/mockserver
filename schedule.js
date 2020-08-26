const schedule = require('node-schedule')
const fs = require('fs')
const utils = require('./lib/utils')
const tokenSDKServer = require('token-sdk-server')

let {didttm, idpwd} = require('./tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

// let {websocketClient: localWS, createMessage} = require('./ws2.js')

// demo // 可以正确运行
// var j = schedule.scheduleJob('* * * * * *', () => {
//   console.log('string')
// })
// setTimeout(function () {
//   console.log('cancel')
//   j.cancel()
// }, 5000)

// 轮询处理pendingTask
var j = schedule.scheduleJob('0 */1 * * * *', () => {
  console.log('schedule')
  let pvdata = tokenSDKServer.getPvData()
  pvdata = JSON.parse(pvdata)
  let pendingTask = pvdata.pendingTask ? pvdata.pendingTask : {}
  for (let key of Object.keys(pendingTask)) {
    utils.opPendingTaskItem(key, pendingTask[key])
    // utils.opPendingTaskItem(key)
  }
})

// 轮询备份pvdata
var j2 = schedule.scheduleJob('0 0 3 * * *', () => {
  let pvdataStr = tokenSDKServer.getPvdata()
  let pvdata = JSON.parse(pvdataStr)
  let key = `0x${tokenSDKServer.hashKeccak256(didttm.did)}`
  let type = 'pvdata'
  let pvdataCt = fs.readFileSync('./tokenSDKData/pvdataCt.txt')
  let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`})
  let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
  tokenSDKServer.pushBackupData(didttm.did, key, type, pvdataCt, signStr).then(response => {
    // response { jsonrpc: '2.0', id: 1, result: true }
    if (response.result) {
      return Promise.reject({isError: false, payload: true})
    } else {
      return Promise.reject({isError: true, payload: new Error(config.errorMap.pushPvDataError.message)})
    }
  })
  .catch(({isError, payload}) => {
    console.log(isError, payload)
  })
})


// module.exports = {}
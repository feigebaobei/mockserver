const schedule = require('node-schedule')
const utils = require('./lib/utils')
const tokenSDKServer = require('token-sdk-server')

let {didttm, idpwd} = require('./tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

let {websocketClient: localWS, createMessage} = require('./ws2.js')

// demo // 可以正确运行
// var j = schedule.scheduleJob('* * * * * *', () => {
//   console.log('string')
// })
// setTimeout(function () {
//   console.log('cancel')
//   j.cancel()
// }, 5000)


var j = schedule.scheduleJob('0 */1 * * * *', () => {
  // console.log('schedule')
  tokenSDKServer.getPvData(didttm.did).then(response => {
    if (response.data.result) {
      return JSON.parse(tokenSDKServer.decryptPvData(response.data.result.data, priStr))
    } else {
      return Promise.reject({do: true, error: new Error('请求pvdata失败')})
    }
  })
  .then(pvdata => {
    if (!pvdata.pendingTask || !pvdata.pendingTask.length) {
      return Promise.reject({do: false})
    }
    let pendingTask = pvdata.pendingTask
    for (let key of Object.keys(pendingTask)) {
      // utils.opPendingTask(pendingTask[key])
      utils.opPendingTaskItem(key, pendingTask[key])
    }
  })
  .catch(errorObj => {
    if (errorObj.do) {
      res.status(500).json({
        result: false,
        message: errorObj.error.message,
        error: errorObj.error
      })
    }
  })
})

// var j2 = schedule.scheduleJob('*/2 * * * * *', () => {
//   // console.log('mess')
//   // localWS.send(createMessage('hello', [], 'test'))
// })


// module.exports = {}
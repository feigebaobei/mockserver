const schedule = require('node-schedule')
const utils = require('./lib/utils')
const tokenSDKServer = require('token-sdk-server')

let {didttm, idpwd} = require('./tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey


// console.log('schedule')

// demo // 可以正确运行
// var j = schedule.scheduleJob('* * * * * *', () => {
//   console.log('string')
// })
// setTimeout(function () {
//   console.log('cancel')
//   j.cancel()
// }, 5000)


var j = schedule.scheduleJob('*/30 * * * * *', () => {
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
    // 当前要处理的任务列表 pendingTask
    for (let key of Object.keys(pendingTask)) {
      utils.opPendingTask(pendingTask[key])
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



// module.exports = {}
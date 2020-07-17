const schedule = require('node-schedule')

// demo // 可以正确运行
// var j = schedule.scheduleJob('* * * * * *', () => {
//   console.log('string')
// })
// setTimeout(function () {
//   console.log('cancel')
//   j.cancel()
// }, 5000)

var j = schedule.scheduleJob('*/30 * * * * *', () => {
  // console.log('string')
  console.log(`new Date()`)
})
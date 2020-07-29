const redisClient = require('../redisClient.js')
// 按数据类型分类
let str = {
  set: (k, v) => {
    return new Promise((resolve, reject) => {
      redisClient.set(k, v, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  },
  get: (k) => {
    return new Promise((rs, rj) => {
      redisClient.get(k, (err, resObj) => {
        err ? rj(err) : rs(resObj)
      })
    })
  },
  del: (k) => {
    return new Promise((resolve, reject) => {
      redisClient.del(k, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  }
}
let list = {}
module.exports = {
  str,
  list
}
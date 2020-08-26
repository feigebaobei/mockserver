const redisClient = require('./redisClient.js')
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
let list = {
  lpush: (k, ...vs) => {
    return new Promise((resolve, reject) => {
      redisClient.lpush(k, vs, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  },
  lpushx: (k, v) => {
    return new Promise((resolve, reject) => {
      redisClient.lpushx(k, v, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  },
  rpush: (k, ...vs) => {
    return new Promise((resolve, reject) => {
      redisClient.rpush(k, vs, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  },
  rpushx: (k, v) => {
    return new Promise((resolve, reject) => {
      redisClient.rpushx(k, v, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  },
  lrange: (k, start, stop) => {
    return new Promise((resolve, reject) => {
      redisClient.lrange(k, start, stop, (err, resObj) => {
        err ? reject(err) : resolve(resObj)
      })
    })
  }
}
let set = {
  sadd: (k, ...vs) => {
    return new Promise((resolve, reject) => {
      redisClient.sadd(k, vs, (err, resObj) => {
        err ? reject(resObj) : resolve(resObj)
      })
    })
  },
  srem: (k, ...vs) => {
    return new Promise((resolve, reject) => {
      redisClient.srem(k, vs, (err, resObj) => {
        err ? reject(resObj) : resolve(resObj)
      })
    })
  },
  sismember: (k, v) => {
    return new Promise((resolve, reject) => {
      redisClient.sismember(k, v, (err, resObj) => {
        err ? reject(resObj) : resolve(resObj)
      })
    })
  },
  // 可取出全部成员，不能取出指定成员。
  smembers: (k, v) => {
    return new Promise((resolve, reject) => {
      redisClient.sismember(k, v, (err, resObj) => {
        err ? reject(resObj) : resolve(resObj)
      })
    })
  }
}
let user = {
  createUser: (account, password, did, nickname, phone) => {
    return JSON.stringify({
      account: account,
      password: password,
      did: did,
      nickname: nickname,
      phone: phone
    })
  }
}
module.exports = {
  str,
  list,
  set,
  user
}
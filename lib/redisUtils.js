const redisClient = require('./redisClient.js')
// 按数据类型分类
let str = {
  set: (k, v) => {
    return new Promise((r, j) => {
      redisClient.set(k, v, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  get: (k) => {
    return new Promise((r, j) => {
      redisClient.get(k, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  del: (k) => {
    return new Promise((r, j) => {
      redisClient.del(k, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  }
}
let list = {
  lpush: (k, ...vs) => {
    return new Promise((r, j) => {
      redisClient.lpush(k, vs, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  lpushx: (k, v) => {
    return new Promise((r, j) => {
      redisClient.lpushx(k, v, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  rpush: (k, ...vs) => {
    return new Promise((r, j) => {
      redisClient.rpush(k, vs, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  rpushx: (k, v) => {
    return new Promise((r, j) => {
      redisClient.rpushx(k, v, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  lrange: (k, start, stop) => {
    return new Promise((r, j) => {
      redisClient.lrange(k, start, stop, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  }
}
let set = {
  sadd: (k, ...vs) => {
    return new Promise((r, j) => {
      redisClient.sadd(k, vs, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  srem: (k, ...vs) => {
    return new Promise((r, j) => {
      redisClient.srem(k, vs, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  sismember: (k, v) => {
    return new Promise((r, j) => {
      redisClient.sismember(k, v, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // 可取出全部成员，不能取出指定成员。
  smembers: (k, v) => {
    return new Promise((r, j) => {
      redisClient.sismember(k, v, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
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
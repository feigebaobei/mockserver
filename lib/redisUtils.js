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

// hash
let hash = {}

// 有序集合
let zset = {
  // 添加成员
  zadd: (args) => {
    // args如：['testzset', 0, 'v0', 1, 'v1', 2, 'v2']
    return new Promise((r, j) => {
      redisClient.zadd(args, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // 成员数量
  zcard: (k) => {
    return new Promise((r, j) => {
      redisClient.zcard(k, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // 在尾部添加一个成员
  zaddOneR: (k, v) => {
    return zset.zcard(k).then(({error, result}) => {
      if (error) {
        return Promise.resolve({error: error, result: null})
      } else {
        return zset.zadd([k, result, v])
      }
    })
  },
  // 在头部添加一个成员
  zaddOneL: (k, v) => {
    return zset.zcard(k).then(({error, result}) => {
      if (error) {
        return Promise.resolve({error: error, result: null})
      } else {
        return zset.zadd([k, 0, v])
      }
    })
  },
  // 按范围取出成员
  zrange: (k, s, t) => {
    return new Promise((r, j) => {
      redisClient.zrange(k, s, t, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // 按分值取出成员
  zrangebyscore: (k, s, t) => {
    return new Promise((r, j) => {
      redisClient.zrangebyscore(k, s, t, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // 若成员在有序集合中，则删除该成员。
  zrem: (k, vs) => {
    return new Promise((r, j) => {
      redisClient.zrem(k, vs, (err, resObj) => {
        err ? r({error: err, result: null}) : r({error: null, result: resObj})
      })
    })
  },
  // zrange: () => {},
}
// let user = {
//   // 创建用户
//   // createUser: (account, password, did, nickname, phone) => {
//   //   return JSON.stringify({
//   //     account: account,
//   //     password: password,
//   //     did: did,
//   //     nickname: nickname,
//   //     phone: phone
//   //   })
//   // },
//   // let createUserRds = (origin, options) => {
//   /**
//    * 创建用户
//    * @param  {[object]} origin [用户数据]
//    * @param  {[object]} options  [可选项]
//    *             {userUid, userEmail, userToken}
//    * @return {[promiss]}         [description]
//    */
//   createUser: (origin, options) => {

//   }
//   // 查询用户
// }
module.exports = {
  str,
  list,
  set,
  hash,
  zset,
  // user,
}
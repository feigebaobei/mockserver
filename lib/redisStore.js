const session = require('express-session')
// const MongoStore = require('connect-mongo')(session)
const RedisStore = require('connect-redis')(session)
const config = require('./config')
const redisClient = require('./redisClient.js')

let redisStore = new RedisStore({
  client: redisClient,
  prefix: config.redis.sessionPrefix
})


module.exports = {
  redisStore
}
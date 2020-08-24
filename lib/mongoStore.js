const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const config = require('./config')

let mongoStore = new MongoStore({
  url: config.mongodb.prod,
  autoReconnect: true
})

let getAllSession = () => {
  return new Promise((r, j) => {
    mongoStore.all((err, resObj) => err ? r({error: err, result: null}) : r({error: null, result: resObj}))
  })
}
let getSessionBySid = (sid) => {
  return new Promise((r, j) => {
    mongoStore.get(sid, (err, resObj) => err ? r({error: err, result: null}) : r({error: null, result: resObj}))
  })
}

// store.set(sid, session, cb)    // 更新session
let setSession = (sid, session) => {
  return new Promise((r, j) => {
    mongoStore.set(sid, session, (err, resObj) => err ? r({error: err, result: null}) : r({error: null, result: resObj}))
  })
}

module.exports = {
  mongoStore: mongoStore,
  getAllSession,
  getSessionBySid,
  setSession
}
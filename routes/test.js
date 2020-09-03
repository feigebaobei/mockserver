var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParse = require('body-parser')
const redisClient = require('../lib/redisClient.js')
const redisUtils = require('../lib/redisUtils.js')
/**
 * 因casbin不好使用。所以不用了。
// const { newEnforcer } = require('casbin')
// const enforcer = await newEnforcer('path/to/model.conf', 'path/to/policy.csv');
// const enforcer = newEnforcer('lib/casbin/model.conf', 'lib/casbin/policy.csv');
// const {enforcer} = require('../lib/casbin/index')
// const asdf = require('../lib/casbin/index')
// console.log('enforcer', enforcer)
// enforcer.then(response => {console.log('response', response)})
// .catch(error => {console.log('error', error)})
 */
const {ac} = require('../lib/accessControl')

const ws = require('ws')

router.use(bodyParse.json())

let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

/* GET users listing. */
router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let pvdata = tokenSDKServer.getPvData()
    pvdata = JSON.parse(pvdata)
    let pendingTask = pvdata.pendingTask ? pvdata.pendingTask : {}
    for (let key of Object.keys(pendingTask)) {
      // utils.opPendingTaskItem(key, pendingTask[key])
      utils.opPendingTaskItem(key)
    }
    res.status(200).json({
      result: true,
      message: '',
      data: 'pvdata'
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/pvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // let {did} = req.query
    // did = did ? did : didttm.did
    let pvdata = tokenSDKServer.getPvData()
    pvdata = JSON.parse(pvdata)
    // console.log('2345')
    res.status(200).json({
      result: false,
      message: '',
      data: pvdata
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {backup, local} = req.body
    // let pvdata = {
    //     "did": didttm.did,
    //     "property": {
    //         "nickname": didttm.nickname
    //     },
    //     "superDid": "did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2",
    //     "certifies": {},
    //     "pendingTask": {},
    //     contacts: {
    //       administrator: ['did:ttm:u055806a0396f78a19cc350f7e6869b939677751ab2b84938f26f024cf8854'],
    //       auditor: ['did:ttm:u055806a0396f78a19cc350f7e6869b939677751ab2b84938f26f024cf8854']
    //     }
    // }
    let pvdata = {
      "certifies":{},
      "custom":{},
      "did":"did:ttm:a0d931d76818589a79f63bd2576d867bf45bd6464be9800998ecf8427e8344",
      "didMap":[],
      "manageDids":[],
      "origin":"did:ttm:u042ec31e277bd08ce9d9044519e3a745b7ba3da030f618b7c57401748b976",
      "property":{
        "nickname":"adid"
      }
    }
    // console.log('pvdata', pvdata)
    let pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
    // console.log('pvdataCt', pvdataCt)
    // console.log(JSON.parse(tokenSDKServer.decryptPvData(pvdataCt, priStr)))
    fs.writeFileSync('./tokenSDKData/pvdataCt.txt', pvdataCt)

    if (backup) {
      let key = '0x' + tokenSDKServer.hashKeccak256(`${didttm.did}`)
      let type = 'pvdata'
      let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`})
      let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
      tokenSDKServer.pushBackupData(didttm.did, key, type, pvdataCt, signStr, {needHashKey: false}).then(response => {
        // response { jsonrpc: '2.0', id: 1, result: true }
        res.status(200).json({
          result: true,
          message: '',
          data: response.data
        })
      })
      tokenSDKServer.setPvData(pvdataCt)
    } else {
      res.status(200).json({
        result: true,
        message: '',
        data: ''
      })
    }
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 
// router.route('/pvdata/backup')

// 父did的任务列表
router.route('/didPendingTask')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {did} = req.query
    // res.send('get')
    // 测试备份父did的待办事项 list
    // let did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
    // did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    let key = '0x' + tokenSDKServer.hashKeccak256(`${did}go to check businessLicense`)
    tokenSDKServer.pullData(key, false).then(response => {
      console.log(response.data)
      res.status(200).json({
        result: true,
        message: '',
        data: JSON.parse(response.data.result.data)
      })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: error.message || '',
        error: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // let did = req.body.did
    // let did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    // did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
    // did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    let {did} = req.body
    // res.send('post')
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    let priStr = tokenSDKServer.decryptDidttm(didttm, idpwd)
    priStr = JSON.parse(priStr.data).prikey
    let pdidPendingTaskKey = '0x' + tokenSDKServer.hashKeccak256(`${did}go to check businessLicense`)
    let type = 'bigdata'
    let list = []
    list = JSON.stringify(list)
    let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${list}for${didttm.did}with${pdidPendingTaskKey}type${type}`})
    let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
    tokenSDKServer.backupData(didttm.did, pdidPendingTaskKey, type, list, signStr).then(response => {
      console.log(response.data)
      res.status(200).json({
        result: true,
        message: '',
        data: ''
      })
    }).catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: error.message || '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/redis')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {key} = req.query
    // redisClient.get(key, (err, resObj) => {
    //   let len = redisClient.llen(key)
    // console.log('LLEN key', len)
    redisClient.lrange(key, 0, -1, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {key, value} = req.body
    // console
    // redisClient.set(key, value, (err, resObj) => {
    redisClient.lpush(key, value, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // 删除消息list中的指定下标的元素
    // let delMsgIndex = (key, index) => {
    //   // LINDEX key index
    //   return new Promise((resolve, reject) => {
    //     redisClient.lindex(key, index, (err, resObj) => {
    //       if (err) {
    //         reject(err)
    //       } else {
    //         console.log('resObj', resObj)
    //         redisClient.lrem(key, 0, resObj, (err, resObj) => {
    //           err ? reject(err) : resolve(resObj)
    //         })
    //       }
    //     })
    //   })
    // }
    // res.send('delete')
    let {key} = req.body
    console.log(key)
    redisClient.del(key, (err, resObj) => {
      res.status(200).json({
        result: true,
        message: '',
        data: resObj
      })
    })
  })

router.route('/redis/str')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {key} = req.query
    console.log('key', key)
    redisUtils.str.get(key).then(response => {
      console.log('response', response)
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {key, value} = req.body
    redisUtils.str.set(key, value).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // res.send('delete')
    let {key} = req.body
    redisUtils.str.del(key).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })

// 操作redis里的list元素
router.route('/redis/list')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    let {key} = req.query
    redisClient.lrange(key, 0, -1, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {key, value} = req.body
    redisUtils.list.rpush(key, value).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // res.send('delete')
  })

// 操作redis里的zset元素
router.route('/redis/zset')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    let key = req.query.key
    key = 'testzset'
    redisUtils.zset.zrange(key, 0, 10).then(response => {
      console.log(response)
      utils.resFormatter(res, 200)
    }).catch(error => {
      console.log(error)
      utils.resFormatter(res, 500)
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // let {key, value} = req.body
    // console.log(key, value)
    // let args = ['testzset', 0, 'v0', 1, 'v1', 2, 'v2']
    let key = 'testzset'
    // redisUtils.zset.zadd(args).then(response => {
    //   console.log(response)
    //   utils.resFormatter(res, 200)
    // }).catch(error => {
    //   console.log(error)
    //   utils.resFormatter(res, 500)
    // })

    // redisUtils.zset.zcard('testzset').then(response => {
    //   console.log(response)
    //   utils.resFormatter(res, 200)
    // }).catch(error => {
    //   console.log(error)
    //   utils.resFormatter(res, 500)
    // })

    // redisUtils.zset.zaddOneL(key, 'first').then(response => {
    // redisUtils.zset.zaddOneR(key, 'first').then(response => {
    // redisUtils.zset.zrangebyscore(key, 0, 10).then(response => {
    // redisUtils.zset.zrem(key, ['first', 'v0']).then(response => {
    //   console.log(response)
    //   utils.resFormatter(res, 200)
    // }).catch(error => {
    //   console.log(error)
    //   utils.resFormatter(res, 500)
    // })

    utils.resFormatter(res, 200)
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // res.send('delete')
  })


// 刘欢提供的模板（元数据）服务
router.route('/meta')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {type, templateId} = req.query
    if (!type && !templateId) {
      return res.status(500).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    }
    if (type) {
      tokenSDKServer.getTemplateList('identity').then(response => {
        res.status(200).json({
          result: true,
          message: '',
          data: response.data
        })
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({
          result: false,
          message: '',
          error: error
        })
      })
    } else {
      tokenSDKServer.getTemplate(templateId).then(response => {
        res.status(200).json({
          result: true,
          message: '',
          data: response.data
        })
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({
          result: false,
          message: '',
          error: error
        })
      })
    }
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {title, type, metaCont} = req.body
    // console.log(metaCont)
    if (!title || !type || !metaCont) {
      return res.status(500).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    }
    let signObj = `did=${didttm.did},title=${title},type=${type},metaCont=${metaCont}`
    let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
    let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
    tokenSDKServer.setTemplate(didttm.did, title, type, metaCont, signStr)
    .then(response => {
      // console.log(response)
      res.status(200).json({
        result: true,
        message: '',
        data: response.data
      })
    })
    .catch(error => {
      // console.log(error)
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99

// 对应刘欢提供的存证服务
router.route('/certify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // console.log(req.query)
    let claim_sn = req.query.claim_sn
    let signList = req.query.signList || false
    // console.log(claim_sn)
    // let claim_sn = '0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99'
    // return tokenSDKServer.getCertifyFingerPrint(claimItem.id, true).then(response => {
    tokenSDKServer.getCertifyFingerPrint(claim_sn).then(response => {
      res.status(200).json({
        result: false,
        message: '',
        data: response.data
      })
    }).catch(error => {
      console.log('error', error)
      res.status(200).json({
        result: false,
        message: '',
        data: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 测试casbin
router.route('/casbin')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    let sub = 'alice',
      obj = 'datal',
      act = 'read'
    // let b = enforcer.enforce(sub, obj, act)
    console.log('b', b)
    // if (b) {
    //   utils.resFormatter(res, 200, {data: true})
    // } else {
    //   utils.resFormatter(res, 200, {data: false})
    // }
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 测试role-acl
router.route('/roleAcl')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // let role = req.user.role
    let role = 'user' //测试用
    // role = 'tank'
    // let permission = ac.can(role).execute('read').on('video')
    // permission.then(r => {
    //   console.log('r', r)
    // }).catch(e => {
    //   console.log('e', e)
    // })
    let permission = ac.can(role).execute('read').sync().on('video')
    console.log(permission)
    console.log(permission.granted)
    if (permission.granted) {
      console.log('allow')
    } else {
      console.log('deny')
    }
    utils.resFormatter(res, 200, {data: permission.granted})
  })
  .post(cors.corsWithOptions,
    // permission,
    (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })


module.exports = router;

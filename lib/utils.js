const fs = require('fs')
const Base64 = require('js-base64').Base64
const tokenSDKServer = require('token-sdk-server')
// const tokenSDKClient = require('token-sdk-client')
// var router = express.Router()
const config = require('./config.js')
const axios = require('axios')
// const websocketLocal = require('../ws2.js')

const BAIDUTOKENSDKAPIKEY = 'S3H8l6XLGM1UGp4dI9otPPMV'
const BAIDUTOKENSDKSECRETKEY = 'VEhY79uE6c7rpysNMmmFvGd3tUBDRbSu'
const BAIDUTEXTAPIKEY = 'tNjV6ls0DNRaVY2VTY4GIPAm'
const BAIDUTEXTSECRETKEY = '8Fq8GQGQtRmURdV03rbz8HD8WegBMAU6'

let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

let opArrByFn = (arr, fn) => {
  if (Array.isArray(arr)) {
    return arr.reduce((r, c) => {
      r.push(fn(c))
      return r
    }, [])
  } else {
    throw new Error('pramas arr is not Array')
  }
}

let range = (number, min, max) => {
  if (typeof(number) === 'number') {
    if (number < min) {
      number = min
    } else {
      if (number > max) {
        number = max
      }
      return number
    }
  } else {
    throw new Error('pramas arr is not Array')
  }
}

let propComposeArray = (arr, prop) => {
   if (Array.isArray(arr)) {
    return arr.reduce((r, c) => {
      if (c.toString() === '[object Object]') {
        r.push(c[prop])
      } else {
        throw new Error('element of arr is not Object')
      }
      return r
    }, [])
  } else {
    throw new Error('pramas arr is not Array')
  }
}

// 生成uuid
let getUuid = () => {
  let s = []
  let hexDigits = '1234567890abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  return s.join('')
}

let didttmToMt = (did, idpwd) => {
  let data = fs.readFileSync(`uploads/private/${did}.ttm`)
  data = data.toString()
  // let [name, , ct] = data.split(':')
  // ct = Base64.decode(ct)
  // console.log('name, ct ', name, ct)
  let mt = tokenSDKServer.decryptDidttm(data, idpwd)
  // let mt = tokenSDKClient.decryptDidttm(ct, idpwd)
  return mt
}

let replaceCont = (desc, data) => {
  for (let [key, value] of Object.entries(data)) {
    let reg = `\\$${key}\\$`
    desc.replace(reg, value)
  }
  return desc
}

let obtainDidttm = (did, idpwd) => {
  let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
  didttm = didttm.toString()
  didttm = tokenSDKServer.decryptDidttm(didttm, idpwd)
  // let {mt} = didttm
  // let {prikey: priStr} = JSON.parse(mt)
  return didttm
}

let obtainPvData = (did, idpwd) => {
  // let didttm = fs.readFileSync(`uploads/private/${did}.ttm`)
  // didttm = didttm.toString()
  // didttm = tokenSDKServer.decryptDidttm(didttm, idpwd)
  // let {mt} = didttm
  let {mt} = obtainDidttm(did, idpwd)
  let {prikey: priStr} = JSON.parse(mt)
  let pvdata = fs.readFileSync(`uploads/private/${did}pvdata.txt`)
  pvdata = pvdata.toString()
  pvdata = pvdata.substr(1, pvdata.length - 2).split(', ')
  pvdata = tokenSDKServer.decryptPvData(pvdata, priStr)
  return pvdata
}

let getBaiduKeys = () => {
  return {
    tokenSdkApiKey: BAIDUTOKENSDKAPIKEY,
    tokenSdkSecretKey: BAIDUTOKENSDKSECRETKEY,
    textApiKey: BAIDUTEXTAPIKEY,
    textSecretKey: BAIDUTEXTSECRETKEY
  }
}

// 得到百度的accesstoken
let getBaiduAccessToken = (client_id = getBaiduKeys().tokenSdkApiKey, client_secret = getBaiduKeys().tokenSdkSecretKey) => {
  return axios({
    // url: 'https://aip.baidubce.com/oauth/2.0/token',
    url : 'https://aip.baidubce.com/oauth/2.0/token', //?grant_type=client_credentials&client_id=${}&client_secret=${}'
    method: 'get',
    params: {
      grant_type: 'client_credentials',
      client_id: client_id,
      client_secret: client_secret
    }
  })
}

let genRandomCodeRange = (min, max, account) => {

}

let genRandomCodeArr = (account, arr = '1234567890qwertyuiopasdfghjklzxcvbnm') => {
  if (typeof(arr) === 'string') {
    arr = arr.split('')
  }
  let res = ''
  let len = arr.length
  for (let i = 0; i < account; i++) {
    res += Math.floor(Math.random() * len)
  }
  return res
}

// pic => base64
let picToBase64 = (image, fidelity = 0.92) => {
  let base64 = ''
  let img = new Image()
  img.src = image
  return new Promise((resolve) => {
    img.onload = () => {
      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)
      base64 = canvas.toDataURL('image/png', fidelity)
      base64 = base64.slice(base64.indexOf(';base64,') + 8)
      // console.log(base64)
      resolve(base64)
    }
  })
  // .then(response => {
  //   console.log(response)
  // }).catch(error => {
  //   console.log(error)
  // })
}

// 调用百度的公安验证接口
let publicVerify = (accessToken, base64, id, name) => {
  // console.log('publicVerify')
  return axios({
    url: `https://aip.baidubce.com/rest/2.0/face/v3/person/verify?access_token=${accessToken}`,
    method: 'post',
    data: {
      image: base64,
      image_type: 'BASE64',
      id_card_number: id,
      name: name
    }
  })
}

// 在指定的文件，清空并写入新内容
let writeFileByUser = (path, data = '') => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  fs.writeFileSync(path, data)
}

// 签名列表中是否有指定did的签名项
let signListHasDid = (list, did) => {
  // [
  //     {
  //         "name": "李庆雪",
  //         "did": "did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd",
  //         "explain": "允许注册",
  //         "expire": 1596199118381
  //     }
  // ]
  return list.some(item => item.did === did)
}



let updataPvdata = (pvdataCt, did, priStr, needEncrypt = false) => {
  // console.log('updataPvdata, pvdata', pvdataCt)
  if (typeof(pvdataCt) !== 'string') {
    pvdataCt = JSON.stringify(pvdataCt)
  }
  if (needEncrypt) {
    pvdataCt = tokenSDKServer.encryptPvData(pvdataCt, priStr)
  }
  let key = '0x' + tokenSDKServer.hashKeccak256(did)
  let type = 'pvdata'
  let signObj = `update backup file${pvdataCt}for${did}with${key}type${type}`
  let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
  let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
  return tokenSDKServer.backupData(did, key, type, pvdataCt, signStr).then(response => {
    if (response.data.result) {
      return true
    } else {
      return Promise.reject({isError: true, payload: new Error('备份pvdata出错')})
    }
  })
}


// 处理adid的身份证明类证书任务
// let opConfirmAdidIdentity = (key, value) => {
let opConfirmAdidIdentity = (msgObj) => {
  console.log(msgObj)
  // 检查参数
  let applicationCertificateDataBean = msgObj.content.applicationCertificateDataBean
  // let claimData = msgObj.content.applicationCertificateDataBean.ocrData
  // let claim_sn = msgObj.content.applicationCertificateDataBean.claim_sn
  if (!applicationCertificateDataBean.claim_sn || !applicationCertificateDataBean.templateId || !applicationCertificateDataBean.ocrData.name || !applicationCertificateDataBean.ocrData.hostname || !applicationCertificateDataBean.ocrData.port || !applicationCertificateDataBean.ocrData.path) {
    websocketLocal.websocketClient.send(websocketLocal.createMessage(config.errorMap.arguments.message, [msgObj.sender], 'error', getUuid()))
    return
  }
  // 检查是否签过名
  let pvdata = null
  return tokenSDKServer.getPvData(didttm.did).then(response => {
    // console.log('response', response.data)
    if (response.data.result) {
      pvdata = tokenSDKServer.decryptPvData(response.data.result.data, priStr)
      pvdata = JSON.parse(pvdata)
      // console.log('pvdata', pvdata)
      // console.log('applicationCertificateDataBean.claim_sn', applicationCertificateDataBean.claim_sn)
      let claimItem = pvdata.certifies.filter(item => {
        // console.log('item.id', item.id)
        item.id === applicationCertificateDataBean.claim_sn
      })
      // console.log('claimItem', claimItem)
      return claimItem
    } else {
      return Promise.reject({isError: true, payload: new Error(config.errorMap.pullPvDataError.message)})
    }
  })
  .then(claimItem => {
    // console.log('claimItem', claimItem)
    // 若签过名则检查签名有效期。
    // 若没签过名则检查pendingTask
    if (claimItem.length) {
      return tokenSDKServer.getCertifyFingerPrint(claimItem.id, true).then(response => {
        if (!response.data.result) {
          return Promise.reject({isError: true, payload: new Error(response.data.error.message || config.errorMap.getCertifyFingerPrint.message)})
        } else {
          let signList = response.data.result.sign_list
          let now = new Date().getTime()
          let valid = signList.filter(item => item.did === didttm.did).some(item => now < Number(item.expire))
          if (valid) {
            return Promise.reject({isError: true, payload: new Error(config.errorMap.donotRepeatSign.message)})
          } else {
            return true
          }
        }
      })
    } else {
      return true
    }
  })
  // 检查时间间隔不能小于1min
  .then(bool => {
    // console.log('bool', bool)
    let pendingTask = pvdata.pendingTask || {}
    let pendingTaskItem = pendingTask[applicationCertificateDataBean.claim_sn]
    if (pendingTaskItem) {
      let now = new Date().getTime()
      if (now - pendingTaskItem.createTime < config.timeInterval.adidReqRandomCode) {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.timeInterval1min.message)})
      } else {
        return true
      }
    } else {
      return true
    }
  })
  // 签名时再比对hashValue,现在不用比对。
  // // 比对hashValue
  // .then(bool => {
  //   return tokenSDKServer.checkHashValue(applicationCertificateDataBean.claim_sn, applicationCertificateDataBean.templateId, applicationCertificateDataBean.ocrData).then(response => {
  //     // console.log('hash', response)
  //     // if (response.result) {

  //     // }
  //     return response.result
  //   })
  // })
  // 生成randomCode
  // 保存pvdata.pendingTask.
  // 备份pvdata
  .then(bool => {
    // console.log('bool', bool)
    let randomCode = genRandomCodeArr(128)
    let pendingTask = pvdata.pendingTask || {}
    pendingTask[applicationCertificateDataBean.claim_sn] = {
      type: 'adidIdentityConfirm',
      createTime: new Date().getTime(),
      randomCode: randomCode,
      msgObj: msgObj
    }
    pvdata.pendingTask = pendingTask
    let pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
    return updataPvdata(pvdataCt, didttm.did, priStr).then(response => {
      // response 是 bool
      return Promise.reject({isError: false, payload: response})
    })
  })
  .catch(({isError, payload}) => {
    // console.log(payload)
    // console.log('payload', payload)
    if (isError) {
      return {isError: isError, payload: payload}
    } else {
      // 发消息
      // websocketLocal.websocketClient.send(websocketLocal.createMessage(`{messageId: ${msgObj.messageId}}`, [msgObj.sender], 'receipt', getUuid()))
      // let msgstr = websocketLocal.createMessage({messageId: msgObj.messageId}, [msgObj.sender], 'receipt', getUuid())
      // console.log('msgStr', msgstr)
      // websocketLocal.websocketClient.send(msgstr)
      websocketLocal.websocketClient.send(websocketLocal.createMessage({messageId: msgObj.messageId}, [msgObj.sender], 'receipt', getUuid()))
      // websocketLocal.websocketClient.send()
      return {isError: isError}
    }
    // 有无问题都要返回receipt消息
    // return Promise.resolve({isError: isError, payload: payload})
    // 此时pvdata.pendingTask里已经有了待办事项。
    // 此时不需要发送消息。
  })
  // 生成randomCode，绑定对应关系。
  // 添加待办事项

  // let url = value.content.url
  // url += '/tokenCheckCode'
  // return axios({
  //   url: url,
  //   method: 'get'
  // }).then(response => {
  //   // return response === value.randomCode
  //   if (response === value.randomCode) {
  //     return true
  //   } else {
  //     return Promise.reject({isError: true, payload: new Error('randomCode不一致')})
  //   }
  // })
  // .then(bool => {
  //   // 签名
  //   let explain = '签发adid的身份证明类证书的固定字段'
  //   let expire = new Date().setFullYear(2120)
  //   let signObj = `claim_sn=${key},templateId=${value.templateId},hashCont=${value.hashValue},did=${didttm.did},name=${didttm.nickname},explain=${explain},expire=${expire}`
  //   let sign = tokenSDKServer.signEcdsa(signObj, privStr)
  //   return tokenSDKServer.signCertify(didttm.did, key, didttm.nickname, value.templateId, value.hashValue, explain, expire, sign).then(response => {
  //     if (response.data.error) {
  //       return Promise.reject({isError: true, payload: new Error(response.data.error.message || '签发失败')})
  //     } else {
  //       return true
  //     }
  //   })
  // })
  // .then(bool => {
  //   // 发消息
  //   websocketLocal.websocketClient.send(websocketLocal.createMessage('test content', ['did:ttm:u055806a0396f78a19cc350f7e6869b939677751ab2b84938f26f024cf8854'], 'method', 'messageId'))
  //   // 删除待办事项
  //   return tokenSDKServer.getPvData(didttm.did).then(response => {
  //     if (response.data.result) {
  //       let pvdataCt = response.data.result.data
  //       let pvdata = tokenSDKServer.decryptPvData(pvdataCt, priStr)
  //       pvdata = JSON.parse(pvdata)
  //       let pendingTask = pvdata.pendingTask || {}
  //       delete pendingTask[key]
  //       pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
  //       // 保存pvdata
  //       return updataPvdata(pvdataCt, didttm.did, priStr)
  //     }
  //   })
  // })
  // .catch((isError, payload) => {
  //   return {isError: isError, payload: payload}
  // })
}
// let opPendingTaskItem = (key, value) => {
//   switch (value.type) {
//     case 'confirmAdidIdentity':
//       opConfirmAdidIdentity(key, value)
//       break
//     default:
//       throw new Error('type is error')
//       break
//   }
// }

// // 处理消息
let opMsg = (msgObj) => {
  if (typeof(msgObj) === 'string') {
    msgObj = JSON.parse(msgObj)
  }
  switch (msgObj.method) {
    case 'confirm':
      opConfirmAdidIdentity(msgObj)
      // .then(response => {
      //   console.log(response)
      // })
      break
    default:

      break
  }
}



module.exports = {
  opArrByFn: opArrByFn,
  range: range,
  propComposeArray: propComposeArray,
  getUuid,
  didttmToMt,
  replaceCont,
  obtainDidttm,
  obtainPvData,
  getBaiduKeys,
  getBaiduAccessToken,
  picToBase64,
  publicVerify,
  writeFileByUser,
  signListHasDid,
  updataPvdata,
  // opPendingTask,
  // opPendingTaskItem,
  opMsg
}
// 因为循环引用的原因，所以在exports后使用require
var websocketLocal = require('../ws2.js')
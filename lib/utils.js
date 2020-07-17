const fs = require('fs')
const Base64 = require('js-base64').Base64
const tokenSDKServer = require('token-sdk-server')
// const tokenSDKClient = require('token-sdk-client')
// var router = express.Router()
const axios = require('axios')

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

// 得到百度的accesstoken
let getBaiduAccessToken = (client_id, client_secret) => {
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
// 处理pvdata.pendingTask里的证书项是否被父did签名
let opPvdataPTPdidSign = (pendingTask) => {
  let {value: list} = Object.entries(pendingTask)
  return Promise.all(list.map(item => {
    // if (pendingTask[item.businessLicenseData.claim_sn])
    if (!item.isPdidCheck && item.isPersonCheck) {
      tokenSDKServer.getCertifyFingerPrint(item.businessLicenseData.claim_sn, true).then(response => {
        
      })
    }





    return tokenSDKServer.getCertifyFingerPrint(item.businessLicenseData.claim_sn, true).then(response => {
      return response.data.result
    })
  })).then(certifis => {
    pendingTask[certifis.claim_sn].isPdidCheck = signListHasDid(certifis.sign_list, pendingTask[certifis.claim_sn].businessLicenseData.applicantSuperDid)
    return pendingTask
  })
}


// let opPendingTask = (pendingTask) => {}
//   return opPvdataPTPdidSign(pendingTask).then(pendingTask => {

//   })

// }



// 返回的结果是：是否需要更新pvdata、pdid的任务列表
let first = (item) => {
  if (item.isPersonCheck && item.isPdidCheck) {
    return Promise.resolve({do: true, item: item})
  } else {
    if (item.isPersonCheck && !item.isPdidCheck) {
      return tokenSDKServer.getCertifyFingerPrint(item.businessLicenseData.claim_sn, true)
        .then(response => {
          if (response.data.result) {
            let list = response.data.result.sign_list
            let templateId = response.data.result.template_id
            let hash_cont = response.data.result.hash_cont
            let exist = signListHasDid(list, item.businessLicenseData.applicantSuperDid)
            item.isPdidCheck = exist
            return {item: item, templateId: templateId, hash_cont: hash_cont} // 让下一个then处理签发
          } else {
            // return {do: false}
            return Promise.reject({do: false})
          }
        })
        .then(({item, templateId, hash_cont}) => {
          // console.log(item, templateId, hash_cont)
          if (item.isPersonCheck && item.isPdidCheck) {
            // explain, expire, signStr
            let explain = '给odid的身份证明类证书签名的固定字段'
            let expire = new Date().setFullYear(2120)
            let signObj = `claim_sn=${item.businessLicenseData.claim_sn},templateId=${templateId},hashCont=${hash_cont},did=${didttm.did},name=${didttm.nickname},explain=${explain},expire=${expire}`
            let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
            let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
            return tokenSDKServer.signCertify(didttm.did, item.businessLicenseData.claim_sn, didttm.nickname, templateId, hash_cont, explain, expire, signStr).then(response => {
              console.log('签名结果', response.data) // { jsonrpc: '2.0', id: 1, result: true }
              if (response.data.result) {
                return Promise.reject({do: true, item: item})
              } else {
                return Promise.reject({do: false})
              }
            })
          } else {
            // return {do: false}
            return Promise.reject({do: false})
          }
        })
        .catch(errorObj => {
          if (errorObj.do) {
            return errorObj
          } else {
            // console.log(errorObj)
            return errorObj
          }
        })
    } else { // 人工审核没通过
      return Promise.resolve({do: false})
    }
  }
}

let all = (item) => {

  first(item).then((opRes) => {
    // console.log('opRes', opRes)
  // first(item).then(({do, item}) => {
    // console.log('first then', opRes)
    if (opRes.do) {
      // console.log('更新pvdata')
      // console.log('更新pdid pendingTaska')
      // 更新pvdata
      return tokenSDKServer.getPvData(didttm.did).then(response => {
        // console.log(response.data)
        if (response.data.result) {
          let pvdataCt = response.data.result.data
          let pvdata = tokenSDKServer.decryptPvData(pvdataCt, priStr)
          pvdata = JSON.parse(pvdata)
          let pendingTask = pvdata.pendingTask
          delete pendingTask[opRes.item.businessLicenseData.claim_sn]
          pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
          let key = '0x' + tokenSDKServer.hashKeccak256(didttm.did)
          let type = 'pvdata'
          let signObj = `update backup file${pvdataCt}for${didttm.did}with${key}type${type}`
          let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
          let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
          return tokenSDKServer.backupData(didttm.did, key, type, pvdataCt, signStr).then(response => {
            // console.log(response.data) // { jsonrpc: '2.0', id: 1, result: true }
            if (response.data.result) {
              return response.data.result
            } else {
              return Promise.reject({do: false})
            }
          })
        }
      })
      .then(bool => {
      // 更新pdid pendingTask
        let key = '0x' + tokenSDKServer.hashKeccak256(`${opRes.item.businessLicenseData.claim_sn}go to check businessLicense`)
        return tokenSDKServer.pullData(key, false).then(response => {
          // console.log(response.data)
          if (response.data.result) {
            let list = response.data.result.data
            let index = list.findIndex((ele) => {
              return ele.content === opRes.item.temporaryId
            })
            if (index > 0) {
              list.splice(index, 1)
            }
            let type = 'bigdata'
            list = JSON.stringify(list)
            let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${list}for${didttm.did}with${key}type${type}`})
            let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
            tokenSDKServer.backupData(didttm.did, key, type, list, signStr).then(response => {
              if (response.data.result) {
                return response.data.result
              } else {
                return Promise.reject({do: false})
              }
            })
          } else {
            return Promise.reject({do: false})
          }
        })
      })
      .catch(errorObj => {
        if (errorObj.do) {
          //
          return errorObj
        } else {
          //
          return errorObj
        }
      })
    } else {
      console.log('不更新')
    }
  }).catch(errorObj => {
    return errorObj
    // if (errorObj.do) {

    // }
  })
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
  getBaiduAccessToken,
  picToBase64,
  publicVerify,
  writeFileByUser,
  signListHasDid,
  all
}

const fs = require('fs')
const Base64 = require('js-base64').Base64
const tokenSDKServer = require('token-sdk-server')
// const tokenSDKClient = require('token-sdk-client')
// var router = express.Router()
const axios = require('axios')

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
  console.log('publicVerify')
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
  publicVerify
}

const fs = require('fs')
const Base64 = require('js-base64').Base64
const tokenSDKServer = require('token-sdk-server')

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
  let [name, , ct] = data.split(':')
  ct = Base64.decode(ct)
  let mt = tokenSDKServer.decryptDidttm(ct, idpwd)
  return mt
}

module.exports = {
  opArrByFn: opArrByFn,
  range: range,
  propComposeArray: propComposeArray,
  getUuid,
  didttmToMt
}

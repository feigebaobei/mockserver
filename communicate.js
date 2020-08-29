const fs = require('fs')
const tokenSDKServer = require('token-sdk-server')
const User = require('./models/user')
const mongodbUtils = require('./lib/mongodbUtils')
// const wsc = require('ws')
const config = require('./lib/config.js')
const utils = require('./lib/utils.js')
// const {getSessionBySid, setSession} = require('./lib/mongoStore.js') // 不使用mongodb保存session了
const redisUtils = require('./lib/redisUtils.js')


const {didttm, idpwd} = tokenSDKServer.getPrivateConfig()
const priStr = tokenSDKServer.getPriStr()
// console.log(didttm, idpwd, priStr)

// 认证身份证
let idConfirmfn = (msgObj) => {
  console.log('idConfirmfn', JSON.stringify(msgObj))
  // 验签
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    // console.log(isok)
    // 检查参数有效性
    if (!msgObj.content.idCardDataBean.applicantDid || !msgObj.content.idCardDataBean.claim_sn || !msgObj.content.idCardDataBean.members || !msgObj.content.idCardDataBean.ocrData || !msgObj.content.idCardDataBean.templateId) {
      tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'confirm')
      return
    }
    // js是单线程的，使用同步方法处理文件就不会出现同时操作文件引发的冲突了。
    // 处理pvdata
    // function getPvData({origin = 'local', decrypt = true, did = ''}) {
    let pvdataStr = tokenSDKServer.getPvData()
    // console.log('pvdataStr', JSON.parse(pvdataStr))
    let pvdata = JSON.parse(pvdataStr)
    // console.log('pvdata', pvdata)
    let hashValue = null
    let template = {}
    // 获取证书的签名列表
    tokenSDKServer.getCertifyFingerPrint(msgObj.content.idCardDataBean.claim_sn, true).then(response => {
      if (!response.data.result) {
        return Promise.reject({isError: true, payload: new Error(response.data.error.message ? response.data.error.message : config.errorMap.getCertifyFingerPrint.message)})
      } else {
        let signList = response.data.result.sign_list
        let now = Date.now()
        let valid = signList.filter(item => item.did === didttm.did).some(item => now < Number(item.expire))
        if (valid) {
          // return true
          return Promise.reject({isError: true, payload: new Error(config.errorMap.donotRepeatSign.message)})
        } else {
          return true
        }
      }
    })
    // 比对hashValue
    .then(bool => {
      return tokenSDKServer.checkHashValue(msgObj.content.idCardDataBean.claim_sn, msgObj.content.idCardDataBean.templateId, msgObj.content.idCardDataBean.ocrData, {templateData: true, claimData: true})
      .then((error, result) => {
        if (error) {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.claimFingerPrint.message)})
        } else {
          hashValue = result.hashValueChain
          template = result.templateData
          return true
        }
      })
    })
    // 取得图片的base64数据
    .then(bool => {
      let key = msgObj.content.idCardDataBean.ocrData.faceFeature
      return tokenSDKServer.pullBackupData(key, false).then(response => {
        return response.data.result.data
        // return {picBase64Ct: response.data.result.data, access_token: ''}
      }).catch(error => {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.pullBackupData.message)})
      })
    })
    // 调用百度的公安接口
    .then(picBase64Ct => {
      return utils.getBaiduAccessToken().then(response => {
        return {picBase64Ct: picBase64Ct, access_token: response.data.access_token}
      }).catch(error => {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.getBaiduAccessToken.message)})
      })
    })
    .then(({picBase64Ct, access_token}) => {
      // console.log('picBase64Ct', picBase64Ct)
      let oriStr = `${msgObj.content.idCardDataBean.applicantDid}${msgObj.content.idCardDataBean.templateId}${msgObj.content.idCardDataBean.createTime}`
      // console.log('oriStr', oriStr)
      let key = tokenSDKServer.hashKeccak256(oriStr)
      // console.log('key', key)
      let picBase64Mt = tokenSDKServer.decryptPic(picBase64Ct, key)
      // console.log('picBase64Mt', picBase64Mt)
      return utils.publicVerify(access_token, picBase64Mt, msgObj.content.idCardDataBean.ocrData.identityNumber, msgObj.content.idCardDataBean.ocrData.name).then(response => {
        // console.log('response', response.data)
        return response.data
      })
    })
    // 签名
    .then(response => {
      if (!response.result || response.result.score < 80) {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.faceSimilar.message)})
      } else {
        let name = didttm.nickname,
            explain = '认证应用签发身份证',
            expire = Number(msgObj.content.idCardDataBean.ocrData.endTime) || Date.now(),
            signObj = `claim_sn=${msgObj.content.idCardDataBean.claim_sn},templateId=${msgObj.content.idCardDataBean.templateId},hashCont=${hashValue},did=${didttm.did},name=${name},explain=${explain},expire=${expire}`,
            // sign = tokenSDKServer.signEcdsa(signObj, priStr)
            signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
        // console.log('priStr', priStr)
        // console.log('signObj', signObj)
        // console.log('signData', signData)
        let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
        // console.log('signStr', signStr)
        return tokenSDKServer.signCertify(
          msgObj.content.idCardDataBean.claim_sn,
          '认证应用签名',
          new Date().setFullYear(2120)
        ).then(response => {
          if (response.result) {
            return true
          } else {
            return Promise.reject({isError: true, payload: new Error(config.errorMap.sign.message)})
          }
        })
      }
    })
    // 保存pvdata
    .then(bool => {
      let pvdataCt = tokenSDKServer.getPvData()
      let pvdata = JSON.parse(pvdataCt)
      let certifies = pvdata.certifies ? pvdata.certifies : {} // {owner: [], confirmed: [], ectype: []}
      tokenSDKServer.utils.setEmptyProperty(certifies, 'owner', [])
      tokenSDKServer.utils.setEmptyProperty(certifies, 'confirmed', [])
      tokenSDKServer.utils.setEmptyProperty(certifies, 'ectype', [])
      certifies.confirmed.push({
        id: msgObj.content.idCardDataBean.claim_sn,
        templateId: msgObj.content.idCardDataBean.templateId,
        templateTitle: template.title,
        createTime: msgObj.content.idCardDataBean.createTime,
        type: template.type,
        desc: JSON.parse(template.meta_cont).desc,
        members: msgObj.content.idCardDataBean.members,
        keys:  msgObj.content.idCardDataBean.ocrData
      })
      pvdata.certifies = certifies
      pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
      fs.writeFileSync('./tokenSDKData/pvdataCt.txt', pvdataCt)
      // 反馈给请求方
      tokenSDKServer.send({type: 'finish'}, [msgObj.sender], 'confirm')
    })
    // .catch((eo) => {
    //   console.log('eo', eo)
    //   return Promise.reject(eo)
    // })
    // 反馈给请求方
    .catch(({isError, payload}) => {
      // console.log(isError, payload)
      if (isError) {
        tokenSDKServer.send({type: 'error', message: payload.message, error: payload}, [msgObj.sender], 'confirm')
      }
    })
  } else {
    tokenSDKServer.send({type: 'error', message: config.errorMap.verify.message, error: new Error(config.errorMap.verify.message)}, [msgObj.sender], 'confirm')
  }
}

// 认证营业执照
let businessLicensefn = (msgObj) => {
  // 检查参数是否正确
  if (!msgObj.content.businessLicenseData.applicantDid || !msgObj.content.businessLicenseData.claim_sn || !msgObj.content.businessLicenseData.createTime || !msgObj.content.businessLicenseData.members || !msgObj.content.businessLicenseData.ocrData || !msgObj.content.sign || !msgObj.content.type) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'confirm')
    return
  }
  // 是否正在签发
  let pvdataStr = tokenSDKServer.getPvData()
  let pvdata = JSON.parse(pvdataStr)
  let pendingTask = pvdata.pendingTask ? pvdata.pendingTask : {}
  if (pendingTask[msgObj.content.businessLicenseData.claim_sn]) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.existPendingTask.message, error: new Error(config.errorMap.existPendingTask.message)}, [msgObj.sender], 'confirm')
    return
  }
  // 验签
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    // console.log('isok', isok)
    // 是否已经签发，并在有效期内。
    tokenSDKServer.getCertifyFingerPrint(msgObj.content.businessLicenseData.claim_sn, true).then(response => {
      // console.log(response.data)
      if (!response.data.result) {
        return Promise.reject({isError: true, payload: new Error(response.data.error.message ? response.data.error.message : config.errorMap.getCertifyFingerPrint.message)})
      } else {
        let signList = response.data.result.sign_list
        let valid = signList.filter(item => item.did === didttm.did && Date.now() < item.expire)
        return valid ? valid : Promise.reject({isError: true, payload: new Error(config.errorMap.donotRepeatSign.message)})
      }
    })
    // 放在pendingTask里
    .then(bool => {
      tokenSDKServer.addPendingTask(msgObj, msgObj.content.type)
      // let pvdataStr = tokenSDKServer.getPvData()
      // let pvdata = JSON.parse(pvdataStr)
      return Promise.reject({isError: false, payload: null})
    })
    // 通知父did处理待办事项
    .catch(({isError, payload}) => {
      // console.log(isError, payload)
      if (isError) {
        tokenSDKServer.send({type: 'error', message: payload.message, error: payload}, [msgObj.sender], 'confirm')
      } else {
        tokenSDKServer.send({type: 'pending', message: config.errorMap.addPending.message}, [msgObj.sender], 'confirm')
      }
    })
  } else {
    tokenSDKServer.send({type: 'error', message: config.errorMap.verify.message, error: new Error(config.errorMap.verify.message)}, [msgObj.sender], 'confirm')
  }
}

let addPTRandomCode = (msgObj, claim_sn) => {
  // 在pendingTask里添加待办项
  let rc = utils.genRandomCodeArr(128)
  // console.log('rc', rc)
  // msgObj.content.type = applicationCertificateConfirm
  // sdk里的类使用的是 adidIdentityConfirm
  // 所以不使用msgObj.content.type
  tokenSDKServer.addPendingTask(msgObj, 'adidIdentityConfirm', {randomCode: rc, key: claim_sn})
  // 发消息
  tokenSDKServer.send({type: 'adidRandomCode', randomCode: rc, claim_sn: msgObj.content.applicationCertificateDataBean.claim_sn}, [msgObj.sender], 'confirm')
}

// adid请求签名身份证明类证书。
// 需要先给adid randomCode
// 再验证randomCode
let adidRandomCodeRequestfn = (msgObj) => {
  // 参数是否有效
  if (!msgObj.content.applicationCertificateDataBean.applicantDid || !msgObj.content.applicationCertificateDataBean.applicantSuperDid || !msgObj.content.applicationCertificateDataBean.claim_sn || !msgObj.content.applicationCertificateDataBean.ocrData || !msgObj.content.sign) {
    tokenSDKServer.send({type: 'error', message: payload.errorMap.arguments.message}, [msgObj.sender], 'confirm')
  }
  // 验签
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    // console.log('isok', isok)
    // 检查请求的时间间隔
    let pvdataStr = tokenSDKServer.getPvData()
    let pvdata = JSON.parse(pvdataStr)
    tokenSDKServer.utils.setEmptyProperty(pvdata, 'pendingTask', {})
    // 这里是以adid的身份证书为key的
    let claim_sn = msgObj.content.applicationCertificateDataBean.claim_sn
    let value = pvdata.pendingTask[claim_sn]
    // console.log('value', value)
    if (!value) {
      addPTRandomCode(msgObj, claim_sn)
    } else {
      if (Date.now() - value.createTime > config.timeInterval.adidReqRandomCode) {
        addPTRandomCode(msgObj, claim_sn)
      } else {
        tokenSDKServer.send({type: 'pending', message: config.errorMap.existPendingTask.message}, [msgObj.sender], 'confirm')
      }
    }
  } else {
    tokenSDKServer.send({type: 'error', message: config.errorMap.verify.message, error: new Error(config.errorMap.verify.message)}, [msgObj.sender], 'confirm')
  }
}

// 绑定认证类的回调方法
let confirmfn = (msgObj) => {
  console.log('confirmfn', msgObj)
  if (!msgObj.content) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
    return
  } else if (!msgObj.content.type) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
    return
  } else {
    new Promise((r, j) => {
      setTimeout(function () {
        r()
      }, 10 * 1000)
    }).then(() => {
      switch (msgObj.content.type) {
        // udid的身份证明类证书
        case 'IDCardConfirm':
          idConfirmfn(msgObj)
          break
        // 营业执照证书
        case 'businessLicenseConfirm':
          businessLicensefn(msgObj)
          break
        // adid的身份证明类证书
        case 'applicationCertificateConfirm':
          adidRandomCodeRequestfn(msgObj)
          break
        default:
          tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
          break
      }
    })
  }
}

// 使用token的did登录
let bindfn = (msgObj) => {
  console.log('bindfn', msgObj)
  // 检查参数有效性
  if (!msgObj.content.bindInfo.client || !msgObj.content.bindInfo.applicationSystem || !msgObj.content.bindInfo.time || !msgObj.content.sessionId || !msgObj.content.sign || !msgObj.content.userInfo) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'bind')
    return
  }
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    let claim_sn = msgObj.content.certificateId,
        template = null
    // sessionID有效性
    let recombinationSessionId = `${config.redis.sessionPrefix}${msgObj.content.sessionId}`
    let session = null // 准备保存session
    redisUtils.str.get(recombinationSessionId).then(response => {
      if (response.error) {
        return Promise.reject({isError: true, payload: response.error})
      } else {
        session = JSON.parse(response.result)
        return JSON.parse(response.result)
      }
    })
    // getSessionBySid(msgObj.content.sessionId).then(({error, result}) => {
    //   console.log(error, result)
    //   if (error) {
    //     return Promise.reject({isError: true, payload: new Error(config.errorMap.selectSession.message)})
    //   } else {
    //     if (result) {
    //       return result
    //     } else {
    //       return Promise.reject({isError: true, payload: new Error(config.errorMap.existSession.message)})
    //     }
    //   }
    // })
    // 检查qrStr的时间有效性
    .then(session => {
      return true // 测试用
      let now = Date.now()
      if (now > session.expireQrStr) {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.qrStrTimeout.message)})
      } else {
        return true
      }
    })
    // 得到模板数据
    .then(bool => {
      return tokenSDKServer.getCertifyFingerPrint(claim_sn).then(response => {
        if (response.data.result) {
          return response.data.result.template_id
        } else {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.getCertifyFingerPrint.message)})
        }
      })
    })
    .then(templateId => {
      return tokenSDKServer.getTemplate(templateId).then(response => {
        // console.log('template', response.data)
        if (response.data.result) {
          template = response.data.result
          return true
        } else {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.getTemplate.message)})
        }
      })
    })
    // 检查证书的有效签名
    .then(bool => {
      // return true // 测试用
      return tokenSDKServer.hasValidSign(claim_sn, didttm.did).then(({error, result}) => {
        if (error) {
          // return Promise.reject({isError: true, payload: error})
          return false
        } else {
          return true
        }
      })
    })
    // 比对hashValue
    // 签名
    .then(bool => {
      // return false // 测试用
      if (bool) {
        return true
      } else {
        // 比对hashValue
        return tokenSDKServer.checkHashValue(claim_sn, template.template_id, msgObj.content.bindInfo).then(({error, result}) => {
          // console.log('1234567u', response)
          if (!error) {
            return true
          } else {
            return Promise.reject({isError: true, payload: new Error(config.errorMap.claimFingerPrint.message)})
          }
        })
        // 签名
        .then(bool => {
          return tokenSDKServer.signCertify(claim_sn, '认证应用签名', new Date().setFullYear(2120)).then(response => {
            // console.log(response)
            if (response.result) {
              return true
            } else {
              return Promise.reject({isError: true, payload: new Error(config.errorMap.sign.message)})
            }
          })
        })
      }
    })
    // 此时证书上的签名已经有效了。
    // 设置用户信息
    .then(bool => {
      // let uid = utils.getUuid()
      let userUid = `${config.redis.userPrefix.index}${utils.getUuid()}`
      let userToken = `${config.redis.userPrefix.index}${config.redis.userPrefix.token}${uid}`
      // 检查用户是否存在
      // 根据userToken在redis里找到的是uid
      redisUtils.str.get(userToken).then(uid => {
        // console.log('uid', uid)
        return uid // 返回userToken
      })
      .then(uid => {
        if (uid) { // 若存在则更新
          return redisUtils.str.get(uid).then(user => {
            user = JSON.parse(user)
            user = tokenSDKServer.utils.mergeTrueField(user, {profile: msgObj.content.userInfo})
            return user
          }).then(user => {
            return redisUtils.str.set(uid, JSON.stringify(user)).then(({error, result}) => {
              if (error) {
                return Promise.reject({isError: true, payload: error})
              } else {
                return true
              }
            })
          })
        } else { // 若不存在则创建
          let origin = {token: msgObj.content.bindInfo.client, profile: msgObj.userInfo}
          let user = tokenSDKServer.utils.schemeToObj(config.redis.userScheme, origin)
          // 创建userToken: userUid
          return redisUtils.str.set(userToken, userUid).then(({error, result}) => {
            if (error) {
              return Promise.reject({isError: true, payload: error})
            } else {
              return true
            }
          })
          // 创建userUid: user
          .then(bool => {
            return redisUtils.str.set(userUid, JSON.stringify(user)).then(({error, result}) => {
              if (error) {
                return Promise.reject({isError: true, payload: error})
              } else {
                return true
              }
            })
          })
        }
      })
    })
    // 修改session
    .then (bool => {
      // return redisUtils.str.get(recombinationSessionId).then(({error, result}) => {
      //   if (error) {
      //     return Promise.reject({isError: true, payload: error})
      //   } else {
      //     return session
      //   }
      // })
      session.passport = {user: userUid}
      return redisUtils.str.set(recombinationSessionId, JSON.stringify(session)).then(({error, result}) => {
        if (error) {
          return Promise.reject({isError: true, payload: error})
        } else {
          return Promise.reject({isError: false, payload: config.errorMap.loginSuccess.message})
        }
      })
    })
    // .then(bool => {
    //   console.log('bool', bool)
    //   // 登录
    //   // 修改或创建用户
    //   // 使用redis保存用户信息
    //   // let u
    //   redisUtils.str.get(`${config.redis.userPrefix.index}${config.redis.userPrefix.token}${uid}`)
    //   let uid = utils.getUuid()

    //   // 使用mongodb保存用户信息
    //   // return User.findOneAndUpdate({token: msgObj.content.bindInfo.client}, {$inc: {loginTime: 1}, profile: {name: msgObj.content.userInfo.name, gender: msgObj.content.userInfo.gender, picture: msgObj.content.userInfo.picture || ''}}, {new: true, upsert: true}).exec().then(user => {
    //   //   console.log('user', user)
    //   //   return user
    //   // })
    // })
    // // 修改session
    // .then(user => {
    //   return getSessionBySid(msgObj.content.sessionId).then(({error, result}) => {
    //     let obj = {
    //       user: String(user._id)
    //     }
    //     result.passport = obj
    //     return setSession(msgObj.content.sessionId, result).then(({error, result}) => {
    //       if (error) {
    //         return Promise.reject({isError: true, payload: error})
    //       }
    //     })
    //   })
    // })
    .catch(error => {
      console.log(error)
    })
    // 返回消息
    .catch(({isError, payload}) => {
      console.log(isError, payload)
      // return 'sdfg' // 测试用
      if (isError) {
        tokenSDKServer.send({type: 'error', message: payload.message, error: payload}, [msgObj.sender], 'bind')
      } else {
        tokenSDKServer.send({type: 'success', message: payload}, [msgObj.sender], 'bind')
      }
    })
  } else {
    tokenSDKServer.send({type: 'error', message: config.errorMap.verify.message, error: new Error(config.errorMap,verify.message)}, [msgObj.sender], 'bind')
  }
}

let confirmResponsefn = (msgObj) => {
  // 检查是否为审核员
  let pvdataStr = tokenSDKServer.getPvData()
  let pvdata = JSON.parse(pvdataStr)
  let auditor = pvdata.contacts.auditor || []
  let exist = auditor.some(item => item === msgObj.sender)
  exist = true // 开发阶段使用
  if (!exist) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.existAuditor.message, error: new Error(config.errorMap.existAuditor.message)}, [msgObj.sender], 'auth')
    return
  }
  // 检查参数是否正确
  if (!msgObj.content.pendingTaskId || !msgObj.content.operateResult) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'auth')
    return
  }
  // 审核员是否同意该操作
  if (msgObj.content.status !== 200) { // 200 表示同意， 400 表示不同意
    tokenSDKServer.send({type: 'finish', message: config.errorMap.auditorDisagree.message}, [msgObj.sender], 'auth')
    return
  } else {
    // 验签
    let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
    if (isok) {
      // 设置人工审核的结果
      // let setResult = tokenSDKServer.setPendingItemIsPersonCheck(msgObj.content.claim_sn, msgObj.content.opResult, msgObj.sender)
      let setResult = tokenSDKServer.setPendingItemIsPersonCheck(msgObj.content.pendingTaskId, msgObj.content.operateResult, msgObj.sender)
      // setResult: {error, result}
      if (setResult.error) {
        tokenSDKServer.send({type: 'error', message: config.errorMap.setField.message, error: new Error(config.errorMap.setField.message)}, [msgObj.sender], 'auth')
      }
      // 发消息给证书拥有者，人工审核的结果。
      tokenSDKServer.send({
        type: 'finish',
        message: config.errorMap.personAuditFinish.message},
        // [pvdata.pendingTask[].msgObj.content.businessLicenseData.applicantDid],
        [msgObj.sender],
        'auth')
    } else {
      tokenSDKServer.send({type: 'error', message: config.errorMap.verify.message}, [msgObj.sender], 'auth')
    }
  }
}

// 授权
let authfn = (msgObj) => {
  console.log('authfn', msgObj)
  if (!msgObj.content) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
    return
  } else if (!msgObj.content.type) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
    return
  }
  switch (msgObj.content.type) {
    case 'confirmResponse':
      confirmResponsefn(msgObj)
      break
    case 'confirmRequest':
    default:
      tokenSDKServer.send({type: 'error', message: config.errorMap.contentType.message}, [msgObj.sender], 'auth')
      break
  }
  // 因当下没有多种授权的内容、形式。所以没使用switch处理。
}

 // 生产
tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: false, autoReceipt: true})
// tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: true, autoReceipt: true})
// tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: false, autoReceipt: false})

 // 开发
// tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: true, autoReceipt: false})

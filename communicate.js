const fs = require('fs')
const tokenSDKServer = require('token-sdk-server')
const User = require('./models/user')
const mongodbUtils = require('./lib/mongodbUtils')
// const wsc = require('ws')
const config = require('./lib/config.js')
const utils = require('./lib/utils.js')
const {mongoStore, getAllSession, getSessionBySid, setSession} = require('./mongoStore.js')

const {didttm, idpwd} = tokenSDKServer.getPrivateConfig()
const priStr = tokenSDKServer.getPriStr()
// console.log(didttm, idpwd, priStr)

// 认证身份证
let idConfirmfn = (msgObj) => {
  // console.log('idConfirmfn', JSON.stringify(msgObj))
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
      return tokenSDKServer.checkHashValue(msgObj.content.idCardDataBean.claim_sn, msgObj.content.idCardDataBean.templateId, msgObj.content.idCardDataBean.ocrData, {templateData: true, claimData: true}).then(response => {
        console.log('response', response)
        if (!response.result) {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.claimFingerPrint.message)})
        } else {
          hashValue = response.hashValueChain
          template = response.templateData
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
        // return tokenSDKServer.signCertify(didttm.did, msgObj.content.idCardDataBean.claim_sn, name, msgObj.content.idCardDataBean.templateId, hashValue, explain, expire, signData).then(response => {
        return tokenSDKServer.signCertify(
          didttm.did,
          msgObj.content.idCardDataBean.claim_sn,
          name,
          msgObj.content.idCardDataBean.templateId,
          hashValue,
          explain,
          expire,
          signStr).then(response => {
          // console.log('response.data', response.data)
          if (response.data.result) {
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
      let certifies = pvdata.certifies ? pvdata.certifies : {own: [], confirmed: [], ectype: []}
      certifies.owner.push({
        id: msgObj.content.idCardDataBean.claim_sn,
        templateId: msgObj.content.idCardDataBean.templateId,
        templateTitle: template.title,
        createTime: msgObj.content.idCardDataBean.createTime,
        type: template.type,
        desc: JSON.parse(template.meta_cont).desc,
        members: msgObj.content.idCardDataBean.members,
        keys:  msgObj.content.idCardDataBean.ocrData
      })
      pvdataCt = tokenSDKServer.encryptPvData(pvdata, priStr)
      fs.writeFileSync('./tokenSDKData/pvdataCt.txt', pvdataCt)
      // 反馈给请求方
      tokenSDKServer.send({type: 'finish'}, [msgObj.sender], 'confirm')
    })
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
      tokenSDKServer.addPendingTask(msgObj, msgObj.content.businessLicenseData.claim_sn, msgObj.content.type)
      let pvdataStr = tokenSDKServer.getPvData()
      let pvdata = JSON.parse(pvdataStr)
      return Promise.reject({isError: false, payload: null})
    })
    // 通知父did处理待办事项
    .catch(({isError, payload}) => {
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

// 绑定认证类的回调方法
let confirmfn = (msgObj) => {
  console.log('msgObj', msgObj)
  switch (msgObj.content.type) {
    case 'IDCardConfirm':
      idConfirmfn(msgObj)
      break
    case 'businessLicenseConfirm':
      businessLicensefn(msgObj)
      break
    default:
      break
  }
}

// 使用token的did登录
let bindfn = (msgObj) => {
  console.log('bindfn', msgObj)
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    // 检查参数有效性
    if (!msgObj.content.bindInfo.client || !msgObj.content.bindInfo.applicationSystem || !msgObj.content.bindInfo.time || !msgObj.content.sessionId || !msgObj.content.sign) {
      tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'bind')
      return
    }
    let claim_sn = msgObj.content.certificateId,
        template = null
    // sessionID有效性
    getSessionBySid(msgObj.content.sessionId).then(({error, result}) => {
      // console.log(error, result)
      if (error) {
        return Promise.reject({isError: true, payload: new Error(config.errorMap.selectSession.message)})
      } else {
        if (result) {
          return result
        } else {
          return Promise.reject({isError: true, payload: new Error(config.errorMap.existSession.message)})
        }
      }
    })
    // 检查qrStr的时间有效性
    .then(session => {
      // return true // 测试用
      // console.log('session',session)
      // if (session)
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
        return tokenSDKServer.checkHashValue(claim_sn, template.template_id, msgObj.content.bindInfo).then(response => {
          // console.log('1234567u', response)
          if (response.result) {
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
    .then(bool => {
      // 登录
      return User.findOne({token: msgObj.content.bindInfo.client}).exec().then(user => {
        // console.log('login', user)
        // return true
        if (!user) {
          // return Promise.reject({isError: false, payload: null}) // 用户表里没用该用户，需要注册。
          let obj = {
            token: msgObj.content.bindInfo.client,
            profile: {}
          }
          for (let [key, value] of Object.entries(msgObj.content.userInfo)) {
            obj.profile[key] = value
          }
          let user = new User(obj)
          return mongodbUtils.save(user).then(({error, result}) => {
            // console.log('亲爱', error, result)
            if (error) {
              return Promise.reject({isError: true, payload: new Error(config.errorMap.saveFail.message)})
            } else {
              return result
            }
          })
        } else {
          return user
        }
      })
    })
    // 修改session
    .then(user => {
      return getSessionBySid(msgObj.content.sessionId).then(({error, result}) => {
        let obj = {
          user: String(user._id)
        }
        result.passport = obj
        return setSession(msgObj.content.sessionId, result).then(({error, result}) => {
          if (error) {
            return Promise.reject({isError: true, payload: error})
          }
        })
      })
    })
    // .then(() => {
    //   getSessionBySid(msgObj.content.sessionId).then(({error, result}) => {
    //     console.log('更新session', error, result)
    //   })
    // })
    // .catch(error => {
    //   console.log(error)
    // })
    // 返回消息
    .catch(({isError, payload}) => {
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

// 授权
let authfn = (msgObj) => {
  // 因当下没有多种授权的内容、形式。所以没使用switch处理。
  // 检查参数是否正确
  if (!msgObj.reqUserInfoKeys.opResult || !msgObj.reqUserInfoKeys.claim_sn) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.arguments.message, error: new Error(config.errorMap.arguments.message)}, [msgObj.sender], 'auth')
  }
  // 检查是否为审核员
  let pvdataStr = tokenSDKServer.getPvData()
  let pvdata = JSON.parse(pvdataStr)
  let auditor = pvdata.contents.auditor || []
  let exist = auditor.some(item => item === msgObj.sender)
  if (!exist) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.existAuditor.message, error: new Error(config.errorMap.existAuditor.message)}, [msgObj.sender], 'auth')
  }
  // 设置人工审核的结果
  let setResult =  tokenSDKServer.setPendingItemIsPersonCheck(msgObj.reqUserInfoKeys.claim_sn, msgObj.reqUserInfoKeys.opResult, msgObj.sender)
  // setResult: {error, result}
  if (!setResult.error) {
    tokenSDKServer.send({type: 'error', message: config.errorMap.setField.message, error: new Error(config.errorMap.setField.message)}, [msgObj.sender], 'auth')
  }
  // 发消息通过证书拥有者，人工审核的结果。
  tokenSDKServer.send({type: 'finish', message: config.errorMap.personAuditFinish.message}, [pvdata.pendingTask.msgObj.content.businessLicenseData.applicantDid], 'auth')
}

tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: false, autoReceipt: true}) // 生产
// tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, authfn: authfn, isDev: true, autoReceipt: false}) // 开发

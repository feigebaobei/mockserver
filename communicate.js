// const {mongoStore, getAllSession, getSessionBySid, setSession} = require('./mongoStore.js')
const fs = require('fs')
const tokenSDKServer = require('token-sdk-server')
// const User = require('./models/User')
// const wsc = require('ws')
const config = require('./lib/config.js')
const utils = require('./lib/utils.js')
// const {didttm, idpwd} = require('./tokenSDKData/privateConfig.js')
// const priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
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
      tokenSDKServer.send({type: 'error', message: config.errorMap.argument.message, error: new Error(config.errorMap.argument.message)}, [msgObj.sender], 'confirm')
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
    // console.log('exist')
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
        // let now = Date.now()
        let valid = signList.filter(item => item.did === didttm.did && Date.now() < item.expire)
        return valid ? valid : Promise.reject({isError: true, payload: new Error(config.errorMap.donotRepeatSign.message)})
      }
    })
    // 检查是否正在签发。
    // .then(bool => {
    //   let pvdataStr = tokenSDKServer.getPvData()
    //   let pvdata = JSON.parse(pvdataStr)
    //   return pvdata.pendingTask[msgObj.content.businessLicenseData.claim_sn] ? true : false
    //   if (pvdata.pendingTask[msgObj.content.businessLicenseData.claim_sn]) {
    //     return false
    //   } else {
    //     return Promise.reject({isError: true, payload: new Error(config.errorMap.pended.message)})
    //   }
    // })
    // 放在pendingTask里
    .then(bool => {
      // return tokenSDKServer.addPendingTask(
      // // {
      // //   id: msgObj.content.businessLicenseData.claim_sn,
      // //   createTime: msgObj.content.businessLicenseData.createTime,
      // //   members: msgObj.content.businessLicenseData.members,
      // //   keys: msgObj.content.businessLicenseData.ocrData
      // // }
      //   msgObj
      // ).then(({error, result}) => {
      //   if (error) {
      //     return Promise.reject({isError: true, payload: error})
      //   } else {
      //     return Promise.reject({isError: false, payload: null})
      //   }
      // })
      // console.log('pending w3ertyuytres')
      // console.log(msgObj, msgObj.content.businessLicenseData.claim_sn, msgObj.content.type)
      tokenSDKServer.addPendingTask(msgObj, msgObj.content.businessLicenseData.claim_sn, msgObj.content.type)
      let pvdataStr = tokenSDKServer.getPvData()
      let pvdata = JSON.parse(pvdataStr)
      // console.log('vpda', pvdata)
      return Promise.reject({isError: false, payload: null})
    })
    // .catch(error => {
    //   console.log(error)
    // })
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
  // console.log('msgObj', msgObj)
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
let bindfn = (msgObj) => {
  console.log('bindfn', JSON.stringify(msgObj))
}

tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, isDev: true, autoReceipt: false})
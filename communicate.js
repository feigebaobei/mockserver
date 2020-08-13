// const {mongoStore, getAllSession, getSessionBySid, setSession} = require('./mongoStore.js')
const fs = require('fs')
const tokenSDKServer = require('token-sdk-server')
// const User = require('./models/User')
// const wsc = require('ws')
const config = require('./lib/config.js')
const utils = require('./lib/utils.js')
const {didttm, idpwd} = require('./tokenSDKData/privateConfig.js')
const priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

let confirmfn = (msgObj) => {
  console.log('confirmfn', JSON.stringify(msgObj))
  // 验签
  let isok = tokenSDKServer.verify({sign: msgObj.content.sign})
  if (isok) {
    // console.log(isok)
    // 检查参数有效性

    // js是单线程的，使用同步方法处理文件就不会出现同时操作文件引发的冲突了。
    // 处理pvdata
    // function getPvData({origin = 'local', decrypt = true, did = ''}) {
    let pvdataStr = tokenSDKServer.getPvData()
    // console.log('pvdataStr', JSON.parse(pvdataStr))
    let pvdata = JSON.parse(pvdataStr)
    console.log('pvdata', pvdata)
    let hashValue = null
    let template = {}

    // 是否签过名
    // 获取证书的签名列表
    tokenSDKServer.getCertifyFingerPrint(msgObj.content.idCardDataBean.claim_sn, true).then(response => {
      if (!response.data.result) {
        return Promise.reject({isError: true, payload: new Error(response.data.error.message || config.errorMap.getCertifyFingerPrint.message)})
      } else {
        let signList = response.data.result.sign_list
        let now = Date.now()
        let valid = signList.filter(item => item.did === didttm.did).some(item => now < Number(item.expire))
        if (valid) {
          return true
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
      tokenSDKServer.send({msgContent: 'finish'}, [msgObj.sender], 'confirm')
    })
    .catch(({isError, payload}) => {
      // console.log(isError, payload)
      if (isError) {
        tokenSDKServer.send({msgContent: 'error', message: payload.message}, [msgObj.sender], 'confirm')
      }
    })
    // 解锁pvdata
    // 反馈给请求方

  } else {
    tokenSDKServer.send(config.errorMap.verify.message, [msgObj.sender], 'confirm')
  }
}
let bindfn = (msgObj) => {
  console.log('bindfn', JSON.stringify(msgObj))
}

tokenSDKServer.init(false, {confirmfn: confirmfn, bindfn: bindfn, isDev: true, autoReceipt: false})
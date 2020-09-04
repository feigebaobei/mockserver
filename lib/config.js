module.exports = {
  redis: {
    host: 'r-2ze9b3ba66282224pd.redis.rds.aliyuncs.com',
    port: '6379',
    pass: 'Token2Info4Redis2',
    sessionPrefix: 'sess:',
    // userPrefix: 'user:',
    userPrefix: {
      index: 'user:',
      token: 'token:',
      github: 'github:',
      email: 'email:'
    },
    userScheme: {
      email: {
        type: String,
        default: ''
      },
      password: {
        type: String,
        default: ''
      },
      uid: {
        type: String,
        default: '',
      },
      token: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
      // tokens: {
      //   type: Array,
      //   default: []
      // },
      role: { // 不支持多角色
        type: String,
        default: ''
      },
      // admin: {
      //   type: Boolean,
      //   default: false
      // },
      loginTime: {
        type: Number,
        default: 0
      },
      // profile: {
        name: {
          type: String,
          default: ''
        },
        gender: {
          type: String,
          default: ''
        },
        picture: {
          type: String, // base64
          default: ''
        },
      // }
    },
    // roles: ['superAdmin', 'admin', 'operator', 'user', 'guest']
    roles: [
      {
        id: 0,
        pId: '',
        value: 'superAdmin',
        sId: 1
      },
      {
        id: 1,
        pId: 0,
        value: 'admin',
        sId: 2
      },
      {
        id: 2,
        pId: 1,
        value: 'operator',
        sId: 3
      },
      {
        id: 3,
        pId: 2,
        value: 'user',
        sId: 4
      },
      {
        id: 4,
        pId: 3,
        value: 'guest',
        sId: ''
      }
    ],
  },
  mongodb: {
    // url: 'mongodb://localhost:27017/userdb',
    // originUrl: 'mongodb://47.94.105.206/mockserver'
    // url: 'mongodb://47.94.105.206:27017/userdb'
    dev: 'mongodb://localhost:27017/dev',
    prod: 'mongodb://47.94.105.206:27017/mockserver'
  },
  webSocket: {
    port: 9875,
    reConnectGap: 10 * 1000
  },
  session: {
    secret: 'tokenttm'
  },
  baidu: {
    // TOKENSDKAPIKEY: 'S3H8l6XLGM1UGp4dI9otPPMV',
    // TOKENSDKSECRETKEY: 'VEhY79uE6c7rpysNMmmFvGd3tUBDRbSu',
    // TEXTAPIKEY: 'tNjV6ls0DNRaVY2VTY4GIPAm',
    // TEXTSECRETKEY: '8Fq8GQGQtRmURdV03rbz8HD8WegBMAU6'
    tokensdkapikey: 'S3H8l6XLGM1UGp4dI9otPPMV',
    tokensdksecretkey: 'VEhY79uE6c7rpysNMmmFvGd3tUBDRbSu',
    textapikey: 'tNjV6ls0DNRaVY2VTY4GIPAm',
    textsecretkey: '8Fq8GQGQtRmURdV03rbz8HD8WegBMAU6'
  },
  timeInterval: {
    adidReqRandomCode: 1000 * 60, // 60s
    delPendingTaskAdidCert: 1000 * 60 * 60 * 24, // 24h
    applyRoleRequest: 7 * 24 * 60 * 60 * 1000 // 7天
    // adidReqRandomCode: 6
  },
  errorMap: {
    donotRepeatSign: {
      code: '',
      message: '在签名有效期内，不能重复签名。'
    },
    pullPvDataError: {
      code: '',
      message: '从远端拉取pvdata出错。'
    },
    pushPvDataError: {
      code: '',
      message: '在区块链上备份pvdata时出错。'
    },
    // pending: {
    addPending: {
      code: '',
      message: '已经接收待办事项，请耐心等待。'
    },
    // pended: {
    existPendingTask: {
      code: '',
      message: '正在办理，请耐心等待。'
    },
    arguments: {
      code: '',
      message: '参数错误。'
    },
    createUserRdsArg: {
      code: '',
      message: 'email/token至少有一个'
    },
    getCertifyFingerPrint: {
      code: '',
      message: '请求证书指纹时出错。'
    },
    timeInterval1min: {
      code: '',
      message: '请求时间间隔不能小于1分钟。'
    },
    randomCode: {
      code: '',
      message: 'randomCode不一致。'
    },
    hashValue: {
      code: '',
      message: 'hashValue不一致。'
    },
    sign: {
      code: '',
      message: '签名失败'
    },
    verify: {
      code: '',
      message: '验签没通过'
    },
    claimFingerPrint: {
      code: '',
      message: '计算后的证书指纹与链上的证书指纹不匹配'
    },
    getBaiduAccessToken: {
      code: '',
      message: '获取百度人脸识别的token时出错'
    },
    pullBackupData: {
      code: '',
      message: '获取备份数据时出错'
    },
    faceSimilar: {
      code: '',
      message: '人脸相似值太低'
    },
    argument: {
      code: '',
      message: '人脸相似值太低'
    },
    getTemplate: {
      code: '',
      message: '获取证书模板时出错'
    },
    setPendingItemIsPersonCheck: {
      code: '',
      message: '变更人工审核状态时出错'
    },
    existAuditor: {
      code: '',
      message: '不存在该审核员'
    },
    setField: {
      code: '',
      message: '设置字段时出错'
    },
    personAuditFinish: {
      code: '',
      message: '完成人工审核'
    },
    existUser: {
      code: '',
      message: '用户已存在'
    },
    unExistUser: {
      code: '',
      message: '用户不存在'
    },
    saveFail: {
      code: '',
      message: '保存失败'
    },
    loginFail: {
      code: '',
      message: '登录失败'
    },
    queryFail: {
      code: '',
      message: '查询失败'
    },
    qrStrTimeout: {
      code: '',
      message: '二维码超时'
    },
    pendingTaskTimeout: {
      code: '',
      message: '待办事项超时'
    },
    delPendingTask: {
      code: '',
      message: '删除待办事项失败'
    },
    finishedPendingTask: {
      code: '',
      message: '该待办事项已经被处理或超时'
    },
    loginSuccess: {
      code: '',
      message: '登录成功'
    },
    selectSession: {
      code: '',
      message: '查询session时出错'
    },
    existSession: {
      code: '',
      message: '不存在该session'
    },
    auditorDisagree: {
      code: '',
      message: '审核员不同意该操作'
    },
    contentType: {
      code: '',
      message: 'content.type is invalid'
    },
    finishBusinessLicenseConfrim: {
      code: '',
      message: '已经完成营业执照审核'
    },
    randomCodeInconformity: {
      code: '',
      message: 'randomCode不一致'
    },
    authAppSign: {
      code: '',
      message: '认证应用完成签名'
    },
    denyAccess: {
      code: '',
      message: '无权限访问'
    }
  }
}
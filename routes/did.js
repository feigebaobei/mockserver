var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')

// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

router.route('/keystore/:did')
  .options((req, res) => {
    res.sendStatus(200)
  })
  .get((req, res, next) => {
    res.status(200).json({result: true, message: '',
      data: {"privatekey":"01837f014db7fc5acd914f53839bdb5dbf4cd80ecbbb7bf966ba9619f34b627a"}
    })
  })
  // 接收用户属性
  .post((req, res, next) => {
    // 检查mongodb里是否有uuid。
    // 使用`·utils.getUuid()`生成一个key，其对应值为用户属性。保存在mongodb里。
    res.send(true)
  })
  .put((req, res, next) => {
    res.send('put')
  })
  .delete((req, res, next) => {
    res.send('delete')
  })

router.route('/pvdata/:did')
  .options((req, res) => {
    res.sendStatus(200)
  })
  .get((req, res, next) => {
    // console.log(req.body)
    // console.log(req.params)
    res.status(200).json({result: true, message: '',
      data: {
        "did": "did:ttm:u043829681e922731094502ebffdf1f10389c3ad11c8a67847c68f0482e608",
        "phone": "15652684614",
        "subDids": [{
          "did": "did:ttm:f08ae17a9f890e251f51d161c3d7e064a742714522c8a67847c68f0482a796",
          "idpwd": "111111",
          "relationDid": "did:ttm:a0_app_001_did",
          "type": "f"
        }],
        "version": "1588985429",
        "property": {
          "nickName": "tank",
          "avatar": "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1718143317,3612074652&fm=26&gp=0.jpg"
        },
        "submitCertifies": [{
          "id": "a68c5fd6d964575b3d42bf959",
          "type": "validated",
          "templateId": "t001",
          "templateTitle": "荣誉证书",
          "hashCont": "dad9ae7815efe9800998ecf8427e8d74",
          "content": {
            "name": "abc",
            "age": "18"
          }
        }],
        "contacts": [
          {
            name: 'first',
            phone: '18512345678'
          },
          {
            name: 'second',
            phone: '18523456789'
          },
          {
            name: 'third',
            phone: '18534567890'
          }
        ],
        "validatedCertifies": [{
          "id": "a68c5fd6d964575b3d42bf959",
          "type": "validated",
          "templateId": "t001",
          "templateTitle": "荣誉证书",
          "hashCont": "dad9ae7815efe9800998ecf8427e8d74",
          "content": {
            "name": "abc",
            "age": "18"
          }
        }]
      }
    })
  })
  .post((req, res, next) => {
    res.send('post')
  })
  .put((req, res, next) => {
    res.send('put')
  })
  .delete((req, res, next) => {
    res.send('delete')
  })



module.exports = router;

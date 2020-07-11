var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64


// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

/* GET users listing. */
router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // 测试
    let ct = '0x3e8ba279f685abb95e376deb9264b45988ba17d3d166c4089f1d4bc718533ff54f06d7e3353c00594464584bd584fcfcc4bfb735a9341e5700350fa96836cba4d1b73278f642bbb6f94972d03a1590b1eea6d69b0c352562484fec51e82dc5bee00698dda114935e7e1ed585be0a37821f9164c056c9c4a34c0cdcbbff12228fc42289cd7bf584454fc4b242b02e691eba04e2c23607d9e7057d0b18f47d93cb906ce8059f2efcefaf15493464b9af221ed757303f6ef3b5026d4ad4f4488a71e81c5ba7f10e83c72c369b736dfc9596a871da06ec8198d100a1c35ca928b7a5e8f51975f502b4a8fd10d02c5f63355db69a1ab7deff3fc30788e5d29baa59a870859fe63d7987860f11ce1268eeda9ae632b1fb1e3021de10af5810b07f7ed2b8e4d4490e511318dbbf80a1a5bae1ab6537144136dfa8fe158c6c6f3e5d612aa7dc006a45b955edfa5644ea68032dfdd0ecc5e746367be948504ace9cec8c3fca8e8d9cccdbdd37ad06d11812124e2104aed1d3cc653cbfce6665da7e8f28d71f5743c25ba72b58a8578aee447a5d7017b7262491236e43a5502c48406e00a1020ae47463a32f40dbb7a0b99dde75ce378b5dc22369a98d52c0d42abe80bffda66c75d53bdfc174e7e86fb0291d47a4ac4cd5eef14f7f856225f344fb4afdce9f0a985c2e63fe84e7297c307fca0401c87385cea6e68674e109af902c7f4218ba8906608b60c8a72bf22d6692914d9d67c2805f9c38484a7ce56717dac9f0fc1bd57209b3fe029335c9a1a1524ce6de77f2d87c54b5f36223f064405aede97efc1a6b08c6c3004d9dc68cf3fd924a943a330b42d23fd1f805de0bb406a7bba1476f7f4a35a689c19fefd3d1b3ed9f628832217dc67a3da883187276fabf5928a97bc837cd53fb31c3a40fab7132f99a627219e7e03cbd993e48b5a15d119464063f0235ce5c0d973fdc492396524077c3fc24994adfad677688046b23126fba96f64a126e2caabbe77863f00708df40ff16cd2810b1d409a5ac409be7928a3946f16b081951f733600a158fb53a303fc46acc358af6b4acc8f1862a2985dbb8823847571f9e74fbaf7634ff41263564e38549713ed7b6d10b0013cc228bf2f1164bd6ff45ddef4549a64f83e8ca74178ec19a998da6b4f5cbab3a94a0ac3f28b7ae9bc97a1f2bd2a076f1e3d9069b0cb05556dfaa7a41ef57a35370bb5198208f5bf38b32966740e2b0fccf84cd80e60c98a1315324dce9e245ed0fb96553172278f9f685ade68ad3edc5bd43591d95a8d7a907101a267b66814abfe9101d53e408fb2da871c4bf10aca4f79308e49dc3c17eab0d95ab1df334b24b8cb1bfca125a6d6629b3af5c0c5bc585fa0e4e4508b6c7d32c160e6f05c9033c3ac53cad42d1d2d06196e122677c3718ffb744002f7f3dd8c23b6b69f49175055d8da78091c40f64115a61dedfecaf1cf0581218448680213803d53334b81c86f8523615e22cb1dd10e2763f63adb438b00cc83dfe04bd424da6e8809893fb6cd52888984dd106f2a91ce877bd5fe26ded41d4954644d9cef735d19d0ea4682efacb21632d5cd3d29be5831c538c948069d13915abc52c278210f514a9d38a7466243cf5285031c72a0bee0e82e1a1ecd6e341a30f1fecc7fcf9b195b7116dcb330a186229173c19681e0937fef1af4f9d8bd04901031dd2b0345f51dbfd8d940079ec99db327f7bd5f871e540746ef3ff78758343e5a713874fed0bd2ba3164ca1f002f505aca6066287a2109e5a4a9f078e9a45cbec35dacc62e81fb81a3fd1dab441547022c63f9ba3382d5a253a1ead1f0d9a68d91e90e06d959d55b86398eed6adadd56cd1aef722814b64eba4efafd44199d36e42d0570071dcb616a3fc49b01fc503098460a2cd1d84c7d955dc7bee5cffef6b4c3b0cf71ddbd32112c5cfdcae9a05bf30f1543bdbed1da6c5c21707da8b4322d5d5282e8143d7642477746cf836d3f33af038e857f3986329e56abf155ca38bfe8f5fb69c76aba7a791bd7294650b9b25cceeea0bdeec13795e2b2a4bb33316b9b22aa9318d85dd09cc86bbab9fa905ca7a38f34c3c73dc43ea4e94e31f62786ff768942010dfb489902403027cc66d357106147b5b8d42c4213e346d9cf972c7d7e4e2e34fb6fa2d128f55ac6580f5e9189873250f785ab7eda13777be146a06bed79d2a00c36c22c6c5158661cec4af2048b4048faacf9bcfdb57eeef78b82c2538577a04343a99054108d656345240cf7ca3e7f5df5c0d1911f5666f056cb7ff8d322664d72f9a7c1706fbcc9ef616c1445fb4154f30b941063079c721ae51a6802f1f6c0729201e8d0fd795f997c58f3824303dc8917255407c78fc272bd2c41ed4a6d2d10cc82535c161dff257560c6a4a483bfed4c1851fada9989a68a621c8223b572258369ce9b356a5553ff38a92f922487ca4ec375ef4d94fb308e12ed2649d5f63f74d483d1adf9f9d5c940e03bbd18c8a1e587d47265786e5d7bac9b357e9411bd0f81f28dcc1b6c9622e109f18ab5b7ca9d91876badfc6be01dd25b04af771eeab4c8b9f2bd4e10d9ea8b6af797f803b7e86752714e1ceb40919fb2d6406a518f1453ee07c5b99b2a45d63350880250db49861898362a8b5e895f5ec63dcc21ca12316603ad616b895b9ea39904a47b63154b7b2e512f5642df39234960549335ec305c68d9d9e0a0ce92c784e7b736d27fd470c41b25c6d65e1ce1280ef7bccf5d126e71c79b'
    let priStr = '0xcf0fbbdac3353253cec457a81a560d916bfb229a710774747e29f0ff1c1daa59'
    let mt = tokenSDKServer.decryptPvData(ct, priStr)
    console.log('mt', mt)
    ct = tokenSDKServer.encryptPvData(mt, priStr)
    console.log('ct', ct)
    mt = tokenSDKServer.decryptPvData(ct, priStr)
    console.log('mt', mt)
    ct = tokenSDKServer.encryptPvData(mt, priStr)
    console.log('ct', ct)
    mt = tokenSDKServer.decryptPvData(ct, priStr)
    console.log('mt', mt)

    // // 测试解密didttm
    // let didttm = fs.readFileSync('uploads/private/did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
    // didttm = didttm.toString()
    // didttm = JSON.parse(didttm)
    // let idpwd = '1234qwerA'
    // // 解密didttm
    // // console.log('didttm', didttm)
    // mt = tokenSDKServer.decryptDidttm(didttm, idpwd)
    // console.log('mt', mt)
    // let ct = tokenSDKServer.encryptDidttm(mt.nickname, mt.did, mt.data, idpwd)
    // console.log('ct', ct)
    // mt = tokenSDKServer.decryptDidttm(ct, idpwd)
    // console.log('mt', mt)
    // ct = tokenSDKServer.encryptDidttm(mt.nickname, mt.did, mt.data, idpwd)
    // console.log('ct', ct)
    // mt = tokenSDKServer.decryptDidttm(ct, idpwd)
    // console.log('mt', mt)
    // // ct = tokenSDKServer.encryptDidttm(mt.nickname, mt.did, mt.data, idpwd)
    // // console.log('ct', ct)


    // // 测试sm4
    // // let mt = '{"did":"did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11","property":{"nickname":"plainadid"},"superDid":"did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2","certifies":[{"id":"0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024","templateId":"0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315","templateTitle":"身份证","createTime":"","type":"identity","desc":"姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$","keys":{"name":"李庆雪","gender":"男","nation":"汉","birthday":"687715200000","address":"河北省石家庄市桥东区北二环东路17号","identityNumber":"131128199110182718","issueAuthority":"石家庄市公安局桥东分局","startTime":"1303315200000","endTime":"1618934400000","faceFeature":"","front":"","back":""}}]}'
    // let mt = '{name: "abCD中国+-*/"}'
    // // let mt = '{name: "abCD"}'
    // let idpwd = '1234qwerA'
    // let ct = ''
    // // tokenSDKServer.test0(mt, idpwd, {hashKey: true})
    // // // console.log('ct', ct)
    // // mt = tokenSDKServer.test1(ct, idpwd, {hashKey: true})
    // // // console.log('mt', mt)
    // // ct = tokenSDKServer.test0(mt, idpwd, {hashKey: true})
    // // // console.log('ct', ct)
    // // mt = tokenSDKServer.test1(ct, idpwd, {hashKey: true})
    // // // console.log('mt', mt)
    // ct = tokenSDKServer.exportDidttm(mt, idpwd, {})
    // console.log('导出ct', ct)
    // mt = tokenSDKServer.test2(ct, idpwd, {hashKey: true})
    // console.log('mt', mt)
    // ct = tokenSDKServer.test3(mt, idpwd, {hashKey: true})
    // console.log('ct', ct)
    // mt = tokenSDKServer.test2(ct, idpwd, {hashKey: true})
    // console.log('mt', mt)
    // ct = tokenSDKServer.test3(mt, idpwd, {hashKey: true})
    // console.log('ct', ct)





    res.status(200).json({
      result: true,
      message: '',
      data: ''
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/setPvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{

    let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
        privStr = '0xcf0fbbdac3353253cec457a81a560d916bfb229a710774747e29f0ff1c1daa59',
        key = '0xf1aa1f4416c5189d150eebf3a0bf1d514f2c35412a3523eb9e3af41375b96b74',
        // originCt = '0x6d05a3927d6838342f65e69a0f34ab0d6825bcb069d33f70eb24a688a080a10f1ee3a2e15cb533a2e82fa3d0b5d8af06899ff58482a2172ce5f88d1fc81bb346a68002f7bffb7f6f4793a6136cb6737a7a0c85ec188a2463771856276c5155177430b203e9cf6b3f3f2684f70f5363f5e9a23030aa6bd4d0349820d12b1f768e4a385c37d6352f953e70474614c087d4e65a7ea99ca1487d55ed62fb75ec38d75530a0055f88937388c033bea2c4b98809c88cf88c9043ac46d853a384a894b740c914e8633d44fa946a03d514b0e1f26777a51c5524e338d563d0ffe6645f56cf8888858e5f2dab25aef7264a1f181e',
        originCt = '0x3e8ba279f685abb95e376deb9264b45988ba17d3d166c4089f1d4bc718533ff54f06d7e3353c00594464584bd584fcfcc4bfb735a9341e5700350fa96836cba4d1b73278f642bbb6f94972d03a1590b1eea6d69b0c352562484fec51e82dc5bee00698dda114935e7e1ed585be0a37821f9164c056c9c4a34c0cdcbbff12228fc42289cd7bf584454fc4b242b02e691eba04e2c23607d9e7057d0b18f47d93cb906ce8059f2efcefaf15493464b9af221ed757303f6ef3b5026d4ad4f4488a71e81c5ba7f10e83c72c369b736dfc9596a871da06ec8198d100a1c35ca928b7a5e8f51975f502b4a8fd10d02c5f63355db69a1ab7deff3fc30788e5d29baa59a870859fe63d7987860f11ce1268eeda9ae632b1fb1e3021de10af5810b07f7ed2b8e4d4490e511318dbbf80a1a5bae1ab6537144136dfa8fe158c6c6f3e5d612aa7dc006a45b955edfa5644ea68032dfdd0ecc5e746367be948504ace9cec8c3fca8e8d9cccdbdd37ad06d11812124e2104aed1d3cc653cbfce6665da7e8f28d71f5743c25ba72b58a8578aee447a5d7017b7262491236e43a5502c48406e00a1020ae47463a32f40dbb7a0b99dde75ce378b5dc22369a98d52c0d42abe80bffda66c75d53bdfc174e7e86fb0291d47a4ac4cd5eef14f7f856225f344fb4afdce9f0a985c2e63fe84e7297c307fca0401c87385cea6e68674e109af902c7f4218ba8906608b60c8a72bf22d6692914d9d67c2805f9c38484a7ce56717dac9f0fc1bd57209b3fe029335c9a1a1524ce6de77f2d87c54b5f36223f064405aede97efc1a6b08c6c3004d9dc68cf3fd924a943a330b42d23fd1f805de0bb406a7bba1476f7f4a35a689c19fefd3d1b3ed9f628832217dc67a3da883187276fabf5928a97bc837cd53fb31c3a40fab7132f99a627219e7e03cbd993e48b5a15d119464063f0235ce5c0d973fdc492396524077c3fc24994adfad677688046b23126fba96f64a126e2caabbe77863f00708df40ff16cd2810b1d409a5ac409be7928a3946f16b081951f733600a158fb53a303fc46acc358af6b4acc8f1862a2985dbb8823847571f9e74fbaf7634ff41263564e38549713ed7b6d10b0013cc228bf2f1164bd6ff45ddef4549a64f83e8ca74178ec19a998da6b4f5cbab3a94a0ac3f28b7ae9bc97a1f2bd2a076f1e3d9069b0cb05556dfaa7a41ef57a35370bb5198208f5bf38b32966740e2b0fccf84cd80e60c98a1315324dce9e245ed0fb96553172278f9f685ade68ad3edc5bd43591d95a8d7a907101a267b66814abfe9101d53e408fb2da871c4bf10aca4f79308e49dc3c17eab0d95ab1df334b24b8cb1bfca125a6d6629b3af5c0c5bc585fa0e4e4508b6c7d32c160e6f05c9033c3ac53cad42d1d2d06196e122677c3718ffb744002f7f3dd8c23b6b69f49175055d8da78091c40f64115a61dedfecaf1cf0581218448680213803d53334b81c86f8523615e22cb1dd10e2763f63adb438b00cc83dfe04bd424da6e8809893fb6cd52888984dd106f2a91ce877bd5fe26ded41d4954644d9cef735d19d0ea4682efacb21632d5cd3d29be5831c538c948069d13915abc52c278210f514a9d38a7466243cf5285031c72a0bee0e82e1a1ecd6e341a30f1fecc7fcf9b195b7116dcb330a186229173c19681e0937fef1af4f9d8bd04901031dd2b0345f51dbfd8d940079ec99db327f7bd5f871e540746ef3ff78758343e5a713874fed0bd2ba3164ca1f002f505aca6066287a2109e5a4a9f078e9a45cbec35dacc62e81fb81a3fd1dab441547022c63f9ba3382d5a253a1ead1f0d9a68d91e90e06d959d55b86398eed6adadd56cd1aef722814b64eba4efafd44199d36e42d0570071dcb616a3fc49b01fc503098460a2cd1d84c7d955dc7bee5cffef6b4c3b0cf71ddbd32112c5cfdcae9a05bf30f1543bdbed1da6c5c21707da8b4322d5d5282e8143d7642477746cf836d3f33af038e857f3986329e56abf155ca38bfe8f5fb69c76aba7a791bd7294650b9b25cceeea0bdeec13795e2b2a4bb33316b9b22aa9318d85dd09cc86bbab9fa905ca7a38f34c3c73dc43ea4e94e31f62786ff768942010dfb489902403027cc66d357106147b5b8d42c4213e346d9cf972c7d7e4e2e34fb6fa2d128f55ac6580f5e9189873250f785ab7eda13777be146a06bed79d2a00c36c22c6c5158661cec4af2048b4048faacf9bcfdb57eeef78b82c2538577a04343a99054108d656345240cf7ca3e7f5df5c0d1911f5666f056cb7ff8d322664d72f9a7c1706fbcc9ef616c1445fb4154f30b941063079c721ae51a6802f1f6c0729201e8d0fd795f997c58f3824303dc8917255407c78fc272bd2c41ed4a6d2d10cc82535c161dff257560c6a4a483bfed4c1851fada9989a68a621c8223b572258369ce9b356a5553ff38a92f922487ca4ec375ef4d94fb308e12ed2649d5f63f74d483d1adf9f9d5c940e03bbd18c8a1e587d47265786e5d7bac9b357e9411bd0f81f28dcc1b6c9622e109f18ab5b7ca9d91876badfc6be01dd25b04af771eeab4c8b9f2bd4e10d9ea8b6af797f803b7e86752714e1ceb40919fb2d6406a518f1453ee07c5b99b2a45d63350880250db49861898362a8b5e895f5ec63dcc21ca12316603ad616b895b9ea39904a47b63154b7b2e512f5642df39234960549335ec305c68d9d9e0a0ce92c784e7b736d27fd470c41b25c6d65e1ce1280ef7bccf5d126e71c79b',
        type = 'pvdata',
        signObj = `update backup file${originCt}for${did}with${key}type${type}`,
        sign = tokenSDKServer.sign({keys: privStr, msg: signObj}),
        signStr = `0x${sign.r.toString('hex')}${sign.s.toString('hex')}00`
        isok = tokenSDKServer.verify({sign})
    // console.log('sign', sign)
    // console.log('signStr', signStr)
    // console.log('isok', isok) // true


    tokenSDKServer.backupData(did, key, 'pvdata', originCt, signStr).then(response => {
      console.log('response', response.data)
    }).catch(error => {
      console.log('error', error)
    })

    res.status(200).json({
      result: true,
      message: '',
      data: ''
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 得到pvdata
router.route('/getPvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // let didttm = fs.readFileSync('uploads/private/did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
    // didttm = didttm.toString()
    // let {data: mt} = tokenSDKServer.decryptDidttm(didttm, '1234qwerA')
    // let prikey = JSON.parse(mt).prikey
    // res.status(200).json({
    //   result: true,
    //   message: '',
    //   data: JSON.parse(mt)
    // })
    let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11'
    tokenSDKServer.getPvData(did).then(response => {
      // console.log('response', response.data)
      let ctPvData = response.data.result.data
      if (ctPvData) {
        // 解密
        let didttm = fs.readFileSync('uploads/private/did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11.json')
        didttm = didttm.toString()
        didttm = JSON.parse(didttm)
        // 解密didttm
        // console.log('didttm', didttm)
        // didttm = tokenSDKServer.decryptDidttm(didttm, '1234qwerA')
        // console.log('didttm', didttm)
        let idpwd = '1234qwerA'
        let priStr = tokenSDKServer.didttmToPriStr(didttm, idpwd)
        console.log('priStr', priStr)

        let mt = tokenSDKServer.decryptPvData(ctPvData, priStr)
        console.log('mt', mt)
        // 加密pvdata
        let ct = tokenSDKServer.encryptPvData(mt, priStr)
        console.log('ct', ct)
        mt = tokenSDKServer.decryptPvData(ct, priStr)
        console.log('mt', mt)
        ct = tokenSDKServer.encryptPvData(mt, priStr)
        console.log('ct', ct)
        mt = tokenSDKServer.decryptPvData(ct, priStr)
        console.log('mt', mt)



        // // let mt = tokenSDKServer.decryptDidttm(didttm, '1234qwerA')
        // // console.log('mt', mt)
        // // let priStr = JSON.parse(mt.data).prikey
        // // let priStr = didttm.data.
        // let priStr = tokenSDKServer.didttmToPriStr(didttm, '1234qwerA')
        // // tokenSDKServer.getPvData(did)
        // // let mtPvData = decryptPvData(ctPvData, priStr)
        // console.log('priStr', priStr)
        // // let mtPvData = tokenSDKServer.decryptPvData(ctPvData, priStr)
        // // console.log('mtPvData', mtPvData)
        res.status(200).json({
          result: true,
          message: '',
          data: ctPvData
        })
      }
    }).catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: '',
        data: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

function decryptPvData (ctPvData, priStr) {
  tokenSDKServer.test0()
  // console.log(priStr)
  priStr = priStr.indexOf('0x') === 0 ? priStr.slice(2) : priStr
  ctPvData = ctPvData.indexOf('0x') === 0 ? ctPvData.slice(2) : ctPvData
  console.log('priStr', priStr)
  console.log('ctPvData', ctPvData)
  var keys = tokenSDKServer.sm2.genKeyPair(priStr)
  // console.log('keys', keys)
  var mt = keys.decrypt(ctPvData)
  return mt
}

module.exports = router;

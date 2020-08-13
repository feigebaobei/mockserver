var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64
var bodyParse = require('body-parser')
const redisClient = require('../redisClient.js')
const redisUtils = require('../lib/redisUtils.js')

const ws = require('ws')

router.use(bodyParse.json())

let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey

/* GET users listing. */
router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    // let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    let pendingTask = {
        "0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99": {
            "type": "adidIdentityConfirm",
            "createTime": 1596165336654,
            "randomCode": "g00t8xz4h7boyixcxgh5g7mht1bdt4990bofrdxz9ecjmsryfdo4fqgs4e4ilto7knwquuexiy1hs1fvyavug9275n2yu49n7jihhilnfjvkee4wxggf136rhoqm0ruv",
            "msgObj": {
                "content": {
                    "applicationCertificateDataBean": {
                        "applicantDid": "did:ttm:u03e1f7d80a0af1d55488f5502ebbae61f832388952b84938f26f024cfbf02",
                        "claim_sn": "0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99",
                        "createTime": "1596076209000",
                        "ocrData": {
                            "name": "连心草",
                            "hostname": "baidu.com",
                            "port": "80",
                            "path": "/haha",
                            "longitude": "116.653664",
                            "latitude": "40.122129"
                        },
                        "templateId": "0x267be2f87e09df338f3e48dcac796adc4eaa5ec4b6d9829694e2803f219f686d"
                    },
                    "msgContentType": "applicationCertificateConfirm",
                    "sign": "0xa8dc6d1fb40cad480af8dd9be2af993bba9812cea587245ac47015bdeefb8be536fa83d055b7caf306b21068ce0e8286771ede5d4b62cc58475bf4a28065028200"
                },
                "createTime": "1596076209000",
                "messageId": "ccaaba91-2102-4b71-9257-0aeabc4b92b4",
                "method": "confirm",
                "sender": "did:ttm:u055806a0396f78a19cc350f7e6869b939677751ab2b84938f26f024cf8854"
            }
        },
        "0xa9271bca05042a8b2b70df62e9457a82cccd1060860f6d02a5d1a71d6ac6ad3b": {
            "type": "adidIdentityConfirm",
            "createTime": 1596173359728,
            "randomCode": "7vnrvit56x50xjcyy6a7nna6pwknb7yo36qhe6n05g7bxwpexbz5193rzt5b1ykjfdjuh5sek5ip7hax5f9ivvk92ym2rz3urzcfo2v57ihr2mj9ioguq9lgpzcuzgw8",
            "msgObj": {
                "content": {
                    "applicationCertificateDataBean": {
                        "applicantDid": "did:ttm:a044cf2ad410dd19e3bda2c8187b982e720e9df23be9800998ecf8427eb01d",
                        "applicantSuperDid": "did:ttm:u03e1f7d80a0af1d55488f5502ebbae61f832388952b84938f26f024cfbf02",
                        "claim_sn": "0xa9271bca05042a8b2b70df62e9457a82cccd1060860f6d02a5d1a71d6ac6ad3b",
                        "createTime": "1596168291000",
                        "ocrData": {
                            "name": "快速探索",
                            "hostname": "kuaisu.com",
                            "port": "80",
                            "path": "/token",
                            "longitude": "116.54345",
                            "latitude": "46.4654567"
                        },
                        "templateId": "0x267be2f87e09df338f3e48dcac796adc4eaa5ec4b6d9829694e2803f219f686d"
                    },
                    "msgContentType": "applicationCertificateConfirm",
                    "sign": "0x1e7656a7593de6c3deca06a89612b5fcd4582d50682c5c47a1e25cc525b58eda66bf064a2b8b9e72a084b00cc2113467e19906dc704cbc509f14db25373b3ec700"
                },
                "createTime": "1596168291000",
                "messageId": "c761232a-1f72-4052-97b6-a56f56c058bd",
                "method": "confirm",
                "sender": "did:ttm:a044cf2ad410dd19e3bda2c8187b982e720e9df23be9800998ecf8427eb01d"
            }
        }
    }

    utils.opPendingTaskItem('0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99', pendingTask['0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99'])
    // .then(response => {
    //     // res.status(200).json({})
    //     res.send('get')
    // })


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

router.route('/pvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    let {did} = req.query
    did = did ? did : didttm.did
    tokenSDKServer.getPvData(didttm.did).then(response => {
      // console.log(response.data)
      if (response.data.result) {
        let pvdataCt = response.data.result.data
        let pvdata = tokenSDKServer.decryptPvData(pvdataCt, priStr)
        pvdata = JSON.parse(pvdata)
        // console.log('pvdata', pvdata)
        // pvdata.pendingTask = {}
        // let ct = tokenSDKServer.encryptPvData(pvdata, priStr)
        // console.log('ct', ct)
        res.status(200).json({
          result: true,
          message: '',
          data: pvdata
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
    // let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
    //     privStr = '0xcf0fbbdac3353253cec457a81a560d916bfb229a710774747e29f0ff1c1daa59',
    //     key = '0xf1aa1f4416c5189d150eebf3a0bf1d514f2c35412a3523eb9e3af41375b96b74',
        // 清空pendingTask
    let pvdata = {
        "did": "did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11",
        "property": {
            "nickname": "plainadid"
        },
        "superDid": "did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2",
        "certifies": [
            {
                "id": "0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "李庆雪",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "687715200000",
                    "address": "河北省石家庄市桥东区北二环东路17号",
                    "identityNumber": "131128199110182718",
                    "issueAuthority": "石家庄市公安局桥东分局",
                    "startTime": "1303315200000",
                    "endTime": "1618934400000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            },
            {
                "id": "0xebd59ac43396b4dc16bbf8df13bac9fa7fbdca39411e71828a274752cc9c39a9",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "蔡明军",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "122572800000",
                    "address": "北京市丰台区程庄路16号23栋16号",
                    "identityNumber": "110108197311204515",
                    "issueAuthority": "北京市公安局丰台分局",
                    "startTime": "1139673600000",
                    "endTime": "1770825600000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            },
            {
                "id": "0xf6b089b8b408c7e157571d1ab75bf78b3813fcad5a06b4f2f162490f397199e6",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "李庆雪",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "687715200000",
                    "address": "河北省石家庄市桥东区北二环东路17号",
                    "identityNumber": "131128199110182718",
                    "issueAuthority": "石家庄市公安局桥东分局",
                    "startTime": "1303315200000",
                    "endTime": "1618934400000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            },
            {
                "id": "0xc1ca34cdf676b940b025179cc7375e760042f7bee0f03a0d75f29ce8a5cef0c3",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "李庆雪",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "687715200000",
                    "address": "河北省石家庄市桥东区北二环东路17号",
                    "identityNumber": "131128199110182718",
                    "issueAuthority": "石家庄市公安局桥东分局",
                    "startTime": "1303315200000",
                    "endTime": "1618934400000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            },
            {
                "id": "0x2f73875fae4740a9e7436e7b853bd90e80ee6ebd21628d0c37fe04ed273c2b7c",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "李晓聃",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "655056000000",
                    "address": "河北省石家庄市井陉县上安镇西方岭村桥东区150号",
                    "identityNumber": "130121199010050253",
                    "issueAuthority": "阿县公安局",
                    "startTime": "1444579200000",
                    "endTime": "1760198400000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            },
            {
                "id": "0x2f73875fae4740a9e7436e7b853bd90e80ee6ebd21628d0c37fe04ed273c2b7c",
                "templateId": "0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315",
                "templateTitle": "身份证",
                "createTime": "",
                "type": "identity",
                "desc": "姓名$name$性别$gender$民族$nation$出生$birthday$住址$address$公民身份号码$identityNumber$签发机关$issueAuthority$开始时间$startTime$结束时间$endTime$",
                "keys": {
                    "name": "李晓聃",
                    "gender": "男",
                    "nation": "汉",
                    "birthday": "655056000000",
                    "address": "河北省石家庄市井陉县上安镇西方岭村桥东区150号",
                    "identityNumber": "130121199010050253",
                    "issueAuthority": "阿县公安局",
                    "startTime": "1444579200000",
                    "endTime": "1760198400000",
                    "faceFeature": "",
                    "front": "",
                    "back": ""
                }
            }
        ],
        "pendingTask": {}
    }
    utils.updataPvdata(pvdata, didttm.did, priStr, true).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(200).json({
        result: true,
        message: '',
        data: error
      })
    })
    //     // originCt = '0x6a0b77f53a77e680e1c8cb3b7d5f085b2e8448a854f8de84fb2983a871c69d25237b6fd848795e699d4658170df63fa1887952182f4785ef9cf87bddbadc47ba9389f07388f26f06d7960265c6cfafcd50e7a92f039f6bd02bbec437e64caeb3499ca91e5836840b06bf80edff485db9c0d8248825f390add092e55435415635b93aa9781b104da10bf78e4a073ee07da3f9ab1c586d11065bdc9d7b4e72827357c9b47cdad6978deca6ba0350050f6106a1eacceef0782879b5fe9ad4afd30d013b60977caf4dd8c67524b7268a7393adbb9455376e79e2c8deb13fbfab6db49eefa8c81d9739c061312b0e143a97726a1437ac72598f789e6d895e5ae5651bd382782502268fd101c2e68a918a6b29ddacda76bc891a7e0d215889bd5d67388cbc06948b9b239f6382380abd10ecb11c342ef6b919e773905db95bcfb9588d5ec2d073033b592067bed69fd72a5c182845b4bbe281483978b5bb1a26b6df833a439c834397c1d13549df845d1e84785b2e05ddd4d8a2250b50671ad877a025e4e568a69a99486efbddd6be609210031f5209f2679c344cbd9886089656f587c74881ec558c85927416b29bca3193efa98684b3d216ebc75de6af65d38fd8cc48139729d75eee0144e6b831cf589c2f923cdaa376fdbf40f764a88a7d0fb61947e01a63bce4987c384beb48ea99624b1085907c2d6b258c540ba6216359119c8024b5a2161ea9ae0223ea5274193f1eeeb380ae1d271479826bc348208dd9e084934e083e8cb24f5cad2c3ef8139cd351457ebea7df8737d8b864617736ffb57e0344fb5095097247e60e85bd0057d4e0c6e3b495227c860ced00a1e30005fb967c9f1b0181bfb2f83b1f891c6ff0ed3430b6dcd15a7c4d6c0e6dcef0797e99d2e10bba61259da4f310b5c6078f57536a8d26b8f27cfb8ed64554f17634e25d89569efc2277185c08a1e7599fdb11a348cbbdc09a129c6ce8c9aea022e964f8f495a54c3a6064d30db403588f13fca9e6fc78d531fea45514fd9702a9ca6cc2ff814f9573ae05d30eee97ff88f8b189e3db0117b6556033022fe2b35573b0201e9a42b592906dd3d3e9e588a7ea0190d4f956077cfdde9564011a6c14aaa30c32c016ad18873061afc466e024a11a897bbb8f745ef13797f029ddcd1a423ba93356a1710267535346cb4fcf7f475b3c3d929a5f8dda959fd9a496c61503f69382321f2d25cf8d920a008c2a5e437aa039547a40a3d9cca163ec2f671d4bf5d470537ce21a1ab51860159e1cd2ff53dbdfc36883d4cb2cd3e7466f0ed33c952e25552923f4185339987da93fedaed4b7fcb2837d5dee1a0a7d9d3d1d39ea8c6817fd552958131f9270a26d60b1d9decc60462c02e1a3cc735463e72fc594d757d7cbbfb9790bdd55d07bb759f34b2d890e910e0fdbc7d4568547ebbc03be103a85280696ab5a8a9fbdd0704c30eaca26dbb8cc93d9979b24c788cb82df36df4af7843d2f90d1df75257ee035d12cd7663c5dd94004f1fc84f3ef178af0ecbece551e0ad616059bf85d7f3c54f21de45e91f6555eaef668aace98906a524ec315cfb61459b8fbfc66c9825f5f58cc8869e1d0c164decf0d8337dc474ea315e5eaa5f97a8eda67cbfb2f35f7c4e291fd7b2356e5730eafdd5c7bf730abe02c9775668d726eb8fbfa4712bddca93eca47fb550cc4a09f293039dde90239b55887d0f8ab16a031277db42b5418317e4e5942ef422717f852a86819b3ae765294bb13c8e3d990aecfc9cf58c7b901b007003be1d4d0158a2912f5ca58aa396297ca6d1bc27244b3cd43708e4378dda5311de384d223cae350f1b55da2f6710e61bde15fdca3a6ed5fade906171db21d9c63fd2a3414db14ed4c85d62f78c7d6ead0ae50b042b78ee6e62d0eec6c82c108df529ba5fb2b7812a3f02203bc1490f8de075909efeb6f56db78f5297f2f75cc0c0ffc552df1a710e8f3607b8c1343bf46fad3e7662b40fcf7ad04b985cc9fbf142b78c1da9edd01ecb928d40ba99ed2a46647812d99ee7c8675974ab6b39b1cccf76da844736f42576f6108e7c61ee53cee6a6da2cbe23eaa21454116bc74c6e0f36a73f2d8e0167bd31f71a91fcd671b6eeec5bbdb3c70622ea32ca8e921a6ccf916dfc1b4c00cbc9209f8af5bd1c8bd703b1f8f747da12d270af6759fe1aad3f8f0be5ac9cda63ac17f76c9296bcb5d336e722b88e7ac91599a551e151b5d92ab513547f9bb2283655457efb1149744b8ddd97a039c38d8d8628ad1492ef657cb00d9e956b7fd56a1739bb2f923b0acb068e1f03910e77f0a7427e659b6335c24413d2ad7f64e526557663bbdf8919474d221c242d2d5481878b15b72113087331f2a3b203874a2e0460933edea17a51dbcfe2360f6a9a090dac5a536650fee062a6b2ac5fc72da4750fe335c1108fe1fe40ffe35602a2a0bb0352958cdbd71ac7db84565993ad78dccbeb01d4dca5abe0ed2c083cdcb027fb3bf5023546eb7f1a8efd150f08e694d2180b7940a2d7927943fbb94c19da2593d15176756a765f3a3a83b00d2be660496ba44793531c9142d75d6a97700e1167691eb466d9ad3a80e9b54b2dabf23f0827110747d93fecbb2d8a14bb2c1bb941b60a61ac767a9d8900b42394f1b154f2d4faafcd3ed6a8036670c8b4ff61eb1042cee56084b46deeb1264dd7f7c4b7f2d377e3868ccd98ab9552a980b9ff5428195c6fc73df373a912dd7bc1bfbb48519521c022aec94f4c21dcb82dcfe33f126410c1cfbd854ec7c91124a12a3c13f1c155a83cfe52c8c39c7bcdb019ef210e73b50f5aed80bfa7224539e992b00cab6b0b94b90c84797fe75df1dd1ad292967f212eb4621ac468edfb06cf4ace0d2ebb027bc7c81e11309c1df51677e9e8df00858338d63922bd6d7797bfcfabb6a52118187b45f6c1c2a9113147ef2692390ac5b4aecb88883ff010a08d8ad950981ce1766525f2b029a5cafebe241947f11abb49e2a2e7035377f6e02f5705978bca6625f6ce0cf4cd10705ded0b7511d77e97e2f612791f648faff9f1d6d6f2c4a303992da87738928c0b0a6f0bee5d1095306c2fdb6b4790e0fddcfe6eb25ded421f935272aaecdf403887d22c51155d8976046165999b7021c912571b80e1d754efce3f0cc43f06f04c7fb08bdafeab8f2aa0b4ae1f17a738f9cf4e8f584d955b89641d5fa1ed7b4c86618e5c11c1811df04fca8bd9f2f3f63fd4f75333710fdcf90ccb1afdb993004be9217fbf56b4b0b542a2dc8143795d9f23bbb34f2950586c8ac22e4d92ca930c971928cf97ad7386916cac87eaa1d39adbbcd94e1ad7fe46dc923058ee9fe182ec33d30ef1e5d6e5768937e5debbfd092a33634ec855d134aaccb515f2382ea484093f2cd13b115e8cbc7ec6b7a3cb386fe3a578db5b676d4b2427bbebbe258b2c064100b7a91ea0a2c45ad4015dcafa1e429ce185d91dfed5e0100f8620a1f89a6b229197d9fa38c72070376bbe38dd584eba31c90669cadcb11d6adbf431408b922310a9097586a7f7b51b9954613d86dfd67f98284515106dc31d2528eb255ef6b25edde1130ba5e15af2bb55a45be8d46c9b7c7842080f90ff189cbf209d5f6b25ffa75dc86fcbbf7331447724092bbbd429c6a304904a515f1c27bb68758fc94c450ecccdcc39b971480ade1f32464b43e3ddc996f292903d590da35c9f7119920ffc2ce617e1f52f569322e306e91183ca1f9b84178a33b01477014f8d1877065bf3fd928c52a045896fbb1dfeb813a5b0f5b878ed674632ad8bc7263e986214e075e7cbd4abd0fea3f6ddd0f12f2c5d4131a744c7e8108f19bf2b0b00f3af46e3e8956cda4074f2f3ba76a253ce5f75f638589f1396d4742cc9ea1f3fdf4575f767d5e14b4720980a9c5f71d798a1fb6c5dc46a098089c0fa157cca575689f1a65acaee422edbd37b96a30d20224c0f274fbf5ec155b984d3c88818d1a829ce8119e6d132a0468c2fb5950f9b27b16b67e4552e151c3e7e4275fba3abccf110380914e9d89a36b0a82335f6ed6845f97b5b37175858e8a0f240a32eb0dc9aadef1ca13175ae3ff42e823439fa4e31ea7bc086bb5bdf22339106f49d996903023864176087cf7744f070f2f681cc1e89cc7b249b4951b8059aab53c3101831cf36a2284e0f8a31de24f626d99cf8e657c51cad0d35fe040cfa29a50044eb0b65ccc31aeb8b1896289b5667115bd709a31de3beeacd8eb97ca5ceb69965a2d025d1340ebe1de3b182a86bd6c6e8304d5d9f74356e52d3a9932f4f197e24620802c357053f95dc1566c33aef8bd70a42b0584f90d8c5ef88846c906ed6a4178d8b312237fcccc12720a03d6a39ac54d46d7385cd4e8ce736774c9e611ee4a06e93fae17a3d53fe15b74a9c019953d269081cb6a546e6799dcfd1416e6c2c637636d295a17cbaff18a3add0077e05005dd684dbc33ec1b4cded101adc277371091d14d5024f89d0e8a430d601fa6286d083f083753f0e31a1693f4fa8d0e918f00f770d783a98c04353484cc518d36be99d837abf6babc8b2ce6556257b3fe3f66d7fea035d3f690a9f367a493e656123aa4a6ecf19fdd22cacb639c0d5cf3c56aea556a25e532bf2d29a2d9ae2d3871baaf228fef36ec06d70dc66e648bccd7efe0f5d51e8ef59d21a6761e98a535229876541030ccf6b05bc1085ff120b85092a45930faf5fcb274bc0a5bf45dac125882a2534e7833ac4596872ab94e7fb4192ae30e67d8cda205802b9fbd5190797c340d56ec230111056a836c77bad3e59189c5f3e8d486229cfd8642715b934ea0ade60dc5fc9266309358a26d1f1f8851d0af24f4f670fb1a0c28d1b9b2b61b9c2c8cf53d39cdee39350f4fc2ee17a923b1cb1098354840058f055f3c041fb52120a4e171db26714a52f551e242a748f02baec3196524b4dec655586a1fd1e2c0c3054c7ab50ec0a5732845754f3e4abfcc41708e91695b78eefe73b1a41f71c19987f17cca67cf54a6f5c22948a3e8dce5e2bf4ab30c4aaefdb18d2fad84af42b87b5583c6fb1efde98b7d5891fd7639982813a811a57943c30dd01c638139dbe534f84857c7d0d13800ca017bd6f313fead69201a0b91c058c5a12a2e66ed9ca07d6b772a4e33320bd910b5506469e7b1737f38ad910fbecb996b86ac17297ee3acb9ccb72cef05a979f987e356b3714f8516677a6beca7cac5e6bfd6f048b7915d87767f5b9778d0f58bf20ff26b8d817e57abcbac232c54cd9fc06041ccb7ed4fee556729494fa58b8e09851bf4135111fe4a7032d41dc0b71c5fc2524ddd39fc40cbb5aee9c0b96e9c70b946f722342da7950c7c62cab29c7d804c48ce23902805fa19ae3ed538b5da32df9cf3ecc551ad949afb3599bc0b459bc18937c5b7beab08e9462d41e2cd790765198abfb9056db7148eceb4bf744d354663f1df3318ee5e1ab8c7331ba6c826044fcf027cd04bb732ec5dd2fd7d74398e4011f30541d8b3f3054fa65e4947e7b4aa777f1f644881be418c6f78a404012391d558e0ae2e14719263f2e50348f3021ae30e97e47944e84f711f04200efff21d7e9aa5a284b8fce574576cbcab33cd0f7b49c7dadc664f0d3607a603ea80367073fdd1a266f7321748c16e89d41e84e7fa07fedf948d45c4b141881a340829d9c2b8e5b2c71fe9e3e11f878b4c4b89bcb78c51a9dab7eb0e975967d14a6f7a744ea8f05f76074755c7204ae637e4148ee92713518326161d6d56a59fc710707ec7a9e6167ef235b1bf651a53e2ee7e34fe2ef30f25a290011cf3d138e63c15605ebeddf34b7dd30e978ea5fcdac6d3ab647f6e9e9608b5f049486571a903d83385a0206d4717ee16c98f137dc79df31fade0e003aa9bd66ea3b5489ba04b30ab525e49116fb36ff1300ffa1b0768c78cf84c5c2c0393b38ea22789accbfbbc8528182c6a81b9a96efe0b8dc72302ee807d21fe1318be2eb6d5e60915bb8f5a991de12a2971d0368a8216169a8895031c65d693500fec66086f28669afa62c6411696aed8e9dba9149b992f3e6897668ef0966244a9a5bdca5bacd70dabdb2232a7fe43d3de9f4449aeec2622de26b748f720e240b40f0219ff1a4691ff2e1dc57a76cf78997aa9e6fcbcaea5bce0d1102c1eab985e0cdfd3b1dc9d88d471198fb27c5dc3a608981bc8ddd15accc339d97fa4d4f4d71ab3f79c529ae30f49b67b39b4f144a2b3aa3a506866a215f368a94781cabe1b7b55758f0c249d120886fab7bf468d36e84c12f5df8eedc5b2a3039a0212c21b15003045cd55c2a48050f3ccf34d81144e1e3cfc773afedd08800361508ea9508c658df6499aefcd20865c76d49a77169f9b43bb8b5ef43007855915f953aae117c2e85e204507da9c3315e3017a8d3b13fa85fa675c62d76e885cf5b33c31dc735a66bf1656b541e5966a3f324e4547a6dc8ba680ac9588a2cbb29846c4a27393febdef97cbcfa4cc5ae37f1d49f7deb3075d18997d9ae38c6895b99cfa8bf5bca09947d6e9d5fc957b38b46b4ece79b69c0003d718bbdca6328c200364f04d2ad132c17524cc0e6cf7c69839a295389cc0d72ce27be3bcf11e83e6d175f17ad13a948f6d0177b7fc21f24c61ab721c320f71e468b5a019e49796ee5baf8b574307234ef6430e3b3e78efc5e1fcb0955c706330a32ab22865bd155aea676398d2ebc3544151497887ec08eb8036c0c3254593139e4008773de4434bf46e7797ad6fde0e5eb8d598584ef019a2349d2ae19e1e836bf652b40107de952807134b9da59344ce082641fac284184909c136d6e105a5714381a2f6205e40a41c3ef4927a6561a7dcde7d71459efbde331bb691435fd0dc79f93fb827b0bec920c4e42494aea16cefd6c28a9d34d2755cdcbaa70d40706c1389da7f5b7982fce0153a077b10a3cc876afb4ca94a5980475da45e9e66a339fe8f5ba52c71eee301474ac9ad21ed327afe959ce416783a6ec307e3f9217d1f5625b62ee6067682ea0e0bdb1e8c4448e6b533794b50c0c2fbc77f99578d8f0174600f3fe932c825839361d9a9839e85ce85a515ccb88e621fec281c2fb3f46889de86151a4b1ab02832191d2b0ec792652c7c92cb580cf1c2ba75f9cffba43d66c52f63862ae057efeece0a66e57e6fd952d5b1b9425439e5429f668ff5762b745563b8e86c3acbfc1974fbfa49d434d80c9c864ac42c39d64749358a3815dc08eb815139ffd18f7bd94e00faff878844605c0eede17b1eb7a04eeedf855a919eb0bee9656df3149c067147afb42fe714452facb4ea4dd8dadadc5528d20eae59aabf78f3c1fd52cc2b1adb40adb8481bc32ebce0869175d558b132931b7a529e20cec7325f2532608922c4b1d88290f484fe4e9d60effeb1d0e3a36c27e7216be364beddef26e481a520f82b9059b59681dfa2395e6247c5598d4099a63cbb3adfd079307ebd6b67cf508a7ec4ba1fc8c7dc61f81871a386cb04ae9319c201ff4640c2036a4d9db11984b237c17e49f0c9a0582b7e0148dd1a9b1ea2f7eaf0cf3b2b4923d0193953cffa21becbdda7b75a796a0c4b34b4d96929568bb3c10a68cb69ec2135972d1ddc606cd61558df2f671fd60a576d8a7d9e4d62b38365beb986a9a8c81da427c82bfa86bef24edd31af4d586750452fe8ad5c401e3f5565f6f7295844e39179a0f6e558c2411c637da4862ca503d73c020a6cabcf6c993884640453d697804b80a3566ec5e5877d6de92bf6fd3c6dd9e192698d163542b1c6aa6528548b7deaaae5ef9017bd2dd9e28b4689905a835f3a5abb0b85967a0e45985ce287b6a0c7b5a27e11329580bd6ac45eaec0705226320d1495e5054283ab6b4e0ee76018243c4af07f12fe23c061361765f21fd7245988cdffe25ea4e97be8ab8070cd6327a31883c7b83e25dcce20fefc36f629acc396e2ca44d89ec32d481c2f60377fe5811c309424a62cb5f65895f8ba10ba8ee2d47a82ce2c67862a02a1575b753a466d49790e3e51679c439217f05ec6e6c3bb104828aa7af354feb1990fb5795bb4e7970bbe9f27c6ceb39eea88259ee5fcdbdf063d48f940782d27543efb399d2df80b29ed2773b3b79252175eb8460c8c458ce709c2db81adbc8c61e079208341bbc2faf1c82f8680d522f41a2ee470884f924952ebe7862e470676b784d099d6ed70a6de4d9e7046ff4d2847bd2179fc4cbbd30d38102d7fc6c620371bcd300a4a45ef75e952ef03d7c0a0ac2ca54ce2e927d8f0572cd491c807033be7ffdcda4179411e7df1c6416e7c67d792fb307f1df2d83cec9d9279869dc4ed083999112ae495628964e22051dfc07b48967e20801799334587cd7d5278ecfef9bbf4d5dbc0455b6b6f77938745ccac2ad51a5e75174102497c2fffd2e125dc3387c21fcad3eded6a22290e189c70b049170177d4c61ae026112455d79e7a41d710dcaba63986a414768c390bd6f2a7f1c17d9f2f1111aeaa84793c16e2a0ad7b48a2ee6d66e4cbb20bbd46ec5bba3165ae7f66b56c81df86da15f861dee9e7e243e49b51aeb7b17d3a4c45681077cd79ca9e2fe4b4070fcd51917e1b80857022ac6548231524d8a72dce63fc9a4860f7fdc8dec6c980407aaec3597b3786b080102997ad62869add720cc7af3e8184ad3d92b68bb0e1cb9608112df51974b98d8aa6e440e0915da3aad9346bac05e74d87d5bceeee919a26c45583ac11ffa955b875d0ab5d317efcab8b445c01d1d23bfa3b78755a7f10b5585f1b214afe0d67224e8c3e2131adec317b298bea86459f6ad344cf3513385a80c75178b4080bbbee987b27d135b36ffb8b1ff47b60ef32b587044fd032f82cf45639d3734797f497eb9d36572af99da1f55f0770ff1bb97469a5ef54c825337d5e3bd85bde02d476dc476c5e1c3fe0c834207e1435e5697eeca196d9a542a81954c19804472de02de49eac24faac06e6f4d79c644c23122fea260ce33295865d1d0a6c840368a59921af6d3b05cd03b551ad8215defaf16fef49fab40a800c36358417f75b971485504f339d7d0f644eb79391f182283b6a6319b6ae4ba797c13b0322642fe512677abd91cb68a5888f79f3f1bdf48e1d53e0c57da0522df19dadb35eca1c90669caa76391fee1cb39726428f18c9ce8e76a78114bda31a5711e390467a7ac490f38a17c3a6553773ad1f2b80d6969ed766b8e5ecf2afb9c8b9dc47e64f44831d4db33fec83da878b6090445d9e2b170c2ced7f3eb6ba63594e8da42fdffbd999449033453ddac5ba440edb87b0bf2d20bf487d2644edb1ad8925ddf8dee2f4e9c9daf706395d191897f79a0fac0a1313e5f1b3930e7e0d398b59aec4852f9cf308a1efbf7db4c08a6aae1ae3174702446a5927a3dc4805468384989a23e555611a146aaf873950c8b6a31d60732d0b64a3e69d10cd1a66ae938635a74e244d1a3dc5c3a16a28ccbdd0efac069776adfa0cccd4e169b7fd023e81be2ae06a4fd90b02cfd5a9704baffe5142e8a447359d9451049c94e36ec59a32cd0e1ce3e8fdf78fc0839e77701fc312a45ca6ee226737cd5475733ff9252d29345996785d8a619fa06f171e86fd9310da9d0f2df95d86dd4de5e4c1201d535532c029c56a4f15e09a43018f2c23fdba8c5000edc9c25817c3f9675e5ae7a52e6eb722f1284595c5432362bad42f8adc79b6d180ba9f2bd983d38988932ff00dcb8e1edc66d486ec973f7d380b551c38fbf4cddb3e2d4cdffeac9f0b66611894389bbfb58ee04e39c4ab8a206e187c46c5e906064a2354edb3f16ba2ce749c95f4ff573607f5d9698f02df4223021188245ae6c1b15648ee4bc5838575b5c651f2eab9bce0a6cedd6bf84424daad628363ffa782236299c4fb9375d01186880d80e2078ffdc5e60192b08b9758f5b264e8b9d14783e5194924e8d0188c3f29bae6a977b6b37b105fd2fd1a794f4a14bd1c6fb9175fa78cd45f5e4e7b0c4ef4386c1ff43d87251d37b4ffb2fcec9eafd0cfc1ad8733cfbff3c71f786907731d5f0652b0dfab11343cb4d670177c49c48c19e5ab9cf40d349fe08aec3788158f64449beb61ea07766bf3f1611afd2311f8a672cb0db54bb9b702e0d297a03d1f06c2469491baa30e29bf53124619b4e9f6115efb9efee6dd642319e4946f85199188984197e4e8095afa3598502f83303d5f973d995c269c3cc9ed2640fbb4f617c8d2b3a9c0ee014f337ffb61327b70bf0be1ebaa9ef3400e13ef843e3cf4bc6c2a0f425de5cf62ae557d06bb8a9f44f3a3f3e85460f9239f8342e3cf47000d193d43885ebe2dad627f76cac55d23473d5a67ba518d94539c991e0c5167919869d53fd434ecb4597465c6dd77423a39744be78dc9eb12778d59d10fd185811f599023b38e7973711dfdd9412820870eb46585fd7c0773413675b566f07026aaa99c94894ad6d030d78eac9214dde1ea2831d7747e2b3f3538144c738989b2e2078f1b77a897cf6c65221c978bc065c65e03ef4d25b7e631dbb7cb7ea96bfc61a31107814a01c978615a2ddde5be30c920d110f436224df75a670f2a131351318de6ac2fcbc769e47c893668733411596fdaabb4b588b09ff65cecd9ba968563c4060268e3e470805d565204a8c35525d7b8f4bcaccad6268ed8ad54e4ab755bea1d839acc6a6c70cf71b8b8196705ae6b9016737ee8ea42f12a919d478d57e0944995b9954d463792d9c70b502eb62dec4d9b17e5a6d8f991286d8c54212f413c93da325fe9edc8c9d4a85dcb4d760f27dc93f36c63b0a526cdadbbb868f0b96802708e4ddda780b994aee796ef2a06e392c576c48044a34e08cca47755c384bcc2c892e06df90cdf48b558cebda020380668037b5b9b8b987ed8f6924f295928f2bdb8d15fdd14588d30e3ae942782a3af708f944a9e91761a413cd65a1241dd280705e0217938df78c7adea5811978d2ba4634d6414d6ec4ce05be279fa122c2972a603fbe90b979256bfa67047cce1c3f2927f1e341db1a8517d2be566d59830798044cd1faab1dcc594cf8f6d1a2728936ee7f580af93afd34dcd8af53967a3a8d453ac55bf22fa471346d6cc9b7b40787655b3db7a5701d54f6d7e473bc3525b8a3ed4cbebba0ad698f9b97d54dbec116102c914764d676927ed9b6c90730d43ada3afc3211c84f3722ba78e3b311e2d18d1c8f1d1062bbf6d0ecd8ce2e3ee915b507ad9f1e21912aa63c328b9b5f788103b6a321f672144c97ee7af4c85d3b21a2497c278983c0078c1f373a4755864210e5744e7f8c5af9ae7f1e2e57ca3b3126e4940b732497e6fc946195ea8dc974b59cc2d084beddb96def6b0b5e86a07fd72b13944249835ad09dd81eefd55d85c62eb688da57a8f748ad5185f96869843b9a582db7b7c63953ca4e94ba7981adb6fea87b04b7582a0ea74c3e81a4aaf45fe38b241a40f5f6a53d2508847607397fb938056064f4e577c77ef983d9f3fbc45edc5b01df6102e3cec8ff5a34b48281e91e162a0e3a36013d7ff81d91b955fc36907611679096bf51ea093acf5ac861b5d0798b57cf4ab442438484c72a1e684513c6c5ca6dc4442063cbfd1872d854eadc6b938c634e07448aa8406188e6b713081be35e158e8a70eab205f1d207c0d90d43087b2f6355136a6e9a935ec9fe1e3cf7a01645514602d0a6f22934ab5cf828d024832b6395a3606d0bc4c294895a2b3f2dd5dea342504750121b8ffc30b60eaf618de49395c69fcd9e32071c7281d36d2e3b31af64f434c0d898566a63dbd8d3d77ad93016d786962423ad672cc6f6876db192053720013f6d036eda1d7ee4dc0b46fc60c4dcb2dfa77b451a30494dfd8c60379e1d03133f948329b880020605d25c42ee67d52573a39011acbd10bc195d875dfbbbc0b145c7bc825dff91e73707880844ed6dfc66495335a0ae2a0cb6e6ff9c0a461162a7a7c27ff185180345f23419dacaafea1b830d2629f242ae06c59502f0860e32097d76f34b997f65a8b2a25876e9d3fbbe6d4bb6b3a93b08f71fc718ca0273516be1aa857f9c3345521eaf7aa68caf14583a590b65ae830853eeca0ab16833fffe42aee8bd6e5eb446e2a0399f7e6ce92df7d6a776154ead2d6afcbff95d618ff25701685b120daf6cbcba3f6894c7fa31c4c11af9cf7686a5cf6fed9194dd9954d7c8bc33a2234492505ef0ceff9eae9bad8078eb8a361a371deef29836ca06669c55acb6b638266d30164569a83344a9f0b7fa3a866b18c0201683a65bc3f8e8d3e1e39012fc8c473a5b6c338b6ed061d73789be9efb5d1fa753fcfce742bf6e68ac7d532bbc94f117509542cefa5f929f669b907d8ecf1a8a48f949bcefdf52e43ffcf059c7d13441cca6b7307db084e508039df117917ef22600aac910099d9c40ef04924b6a04cccc70a32cc998778a723bbdd3311869ac898696a863931ae55e06671dd77c99250d1e19a22ee3c085230f588be082658a0adad3f6df9ba265aed579bf39d65b4d93be73c5ae8a3c6e3e3d7dfc4f8d547f932010a09a2047185ff880c4d22a2a2345d12ba3a56441dcb7234068b6435a2784266df3af23ee30aac6a600682a512c65842ac496fea5f3f5b1ef1abd489ad38fd7b8360a38e1bf26ba7e058afdfdd1707346acceefacfcf063386d30e48c48d63f719e88fbd09e5b9df5439f95caa034ab14abd56be0418d48963d930bf078356f5be184c5582d746246de70f532e91e99f92f42d36c8a7fb23ee4eb23c7e2a40c0c5f050af5b14c186820533ddbcd8a51e2b7d19a5c537fe6f4f4745cacd2c5b8473c333c2154477bfe6aed7b20ac202c5d1f2a4bde6bddee5cfc660716e8a665980de7eb84602b46e138ebbcb4fd42ef488d0a40135408282c5e2da1eaca2b875b97eba749b787770d2e38e551967bb1ec54e708b0f17e75b3a028ce1cdbb17f9fe371d7bb535a2d0925883a9e31529f81e3c299a83468be9457bab1caf189ab577b54b67e89dca2594bf2d9f265111b877463554aafb0dccecfd30bce893396a0e6c1d637548b2201a8c32553d456ad7e9f1246410be5b3aec436721872c136f7a5b18bfe3d6dd6bba2ac5b85f2bf1e4d6a179e454c9655550d683c51580eb824da380aa6f9a109fcd127772484f7643d97d91a4e91b42f86714',
    //     // type = 'pvdata',
    //     // signObj = `update backup file${originCt}for${did}with${key}type${type}`,
    //     // sign = tokenSDKServer.sign({keys: privStr, msg: signObj}),
    //     // signStr = `0x${sign.r.toString('hex')}${sign.s.toString('hex')}00`
    //     // isok = tokenSDKServer.verify({sign})
    // // console.log('sign', sign)
    // // console.log('signStr', signStr)
    // // console.log('isok', isok) // true


    // tokenSDKServer.backupData(did, key, 'pvdata', originCt, signStr).then(response => {
    //   console.log('response', response.data)
    // }).catch(error => {
    //   console.log('error', error)
    // })

    // res.status(200).json({
    //   result: true,
    //   message: '',
    //   data: ''
    // })
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
    // 解密
    // let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    // let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    
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

// 父did的任务列表
router.route('/didPendingTask')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {did} = req.query
    // res.send('get')
    // 测试备份父did的待办事项 list
    // let did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
    // did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    let key = '0x' + tokenSDKServer.hashKeccak256(`${did}go to check businessLicense`)
    tokenSDKServer.pullData(key, false).then(response => {
      console.log(response.data)
      res.status(200).json({
        result: true,
        message: '',
        data: JSON.parse(response.data.result.data)
      })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: error.message || '',
        error: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // let did = req.body.did
    // let did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    // did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
    // did = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    let {did} = req.body
    // res.send('post')
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    let priStr = tokenSDKServer.decryptDidttm(didttm, idpwd)
    priStr = JSON.parse(priStr.data).prikey
    let pdidPendingTaskKey = '0x' + tokenSDKServer.hashKeccak256(`${did}go to check businessLicense`)
    let type = 'bigdata'
    let list = []
    list = JSON.stringify(list)
    let signData = tokenSDKServer.sign({keys: priStr, msg: `update backup file${list}for${didttm.did}with${pdidPendingTaskKey}type${type}`})
    let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
    tokenSDKServer.backupData(didttm.did, pdidPendingTaskKey, type, list, signStr).then(response => {
      console.log(response.data)
      res.status(200).json({
        result: true,
        message: '',
        data: ''
      })
    }).catch(error => {
      console.log(error)
      res.status(500).json({
        result: false,
        message: error.message || '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

router.route('/redis')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {key} = req.query
    // redisClient.get(key, (err, resObj) => {
    //   let len = redisClient.llen(key)
    // console.log('LLEN key', len)
    redisClient.lrange(key, 0, -1, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let {key, value} = req.body
    // console
    // redisClient.set(key, value, (err, resObj) => {
    redisClient.lpush(key, value, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // 删除消息list中的指定下标的元素
    // let delMsgIndex = (key, index) => {
    //   // LINDEX key index
    //   return new Promise((resolve, reject) => {
    //     redisClient.lindex(key, index, (err, resObj) => {
    //       if (err) {
    //         reject(err)
    //       } else {
    //         console.log('resObj', resObj)
    //         redisClient.lrem(key, 0, resObj, (err, resObj) => {
    //           err ? reject(err) : resolve(resObj)
    //         })
    //       }
    //     })
    //   })
    // }
    // res.send('delete')
    let {key} = req.body
    console.log(key)
    redisClient.del(key, (err, resObj) => {
      res.status(200).json({
        result: true,
        message: '',
        data: resObj
      })
    })
  })

router.route('/redis/str')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {key} = req.query
    console.log('key', key)
    redisUtils.str.get(key).then(response => {
      console.log('response', response)
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {key, value} = req.body
    redisUtils.str.set(key, value).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // res.send('delete')
    let {key} = req.body
    redisUtils.str.del(key).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })

// 操作redis里的list元素
router.route('/redis/list')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    let {key} = req.query
    redisClient.lrange(key, 0, -1, (err, resObj) => {
      if (err) {
        res.status(500).json({
          result: false,
          message: '',
          error: err
        })
      } else {
        res.status(200).json({
          result: true,
          message: '',
          data: resObj
        })
      }
    })
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {key, value} = req.body
    // console.log(key, value)
    redisUtils.list.rpush(key, value).then(response => {
      res.status(200).json({
        result: true,
        message: '',
        data: response
      })
    }).catch(error => {
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    // res.send('delete')
  })

// 刘欢提供的模板（元数据）服务
router.route('/meta')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    let {type, templateId} = req.query
    if (!type && !templateId) {
      return res.status(500).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    }
    if (type) {
      tokenSDKServer.getTemplateList('identity').then(response => {
        res.status(200).json({
          result: true,
          message: '',
          data: response.data
        })
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({
          result: false,
          message: '',
          error: error
        })
      })
    } else {
      tokenSDKServer.getTemplate(templateId).then(response => {
        res.status(200).json({
          result: true,
          message: '',
          data: response.data
        })
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({
          result: false,
          message: '',
          error: error
        })
      })
    }
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    // res.send('post')
    let {title, type, metaCont} = req.body
    // console.log(metaCont)
    if (!title || !type || !metaCont) {
      return res.status(500).json({
        result: false,
        message: '参数错误',
        error: ''
      })
    }
    let signObj = `did=${didttm.did},title=${title},type=${type},metaCont=${metaCont}`
    let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
    let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
    tokenSDKServer.setTemplate(didttm.did, title, type, metaCont, signStr)
    .then(response => {
      // console.log(response)
      res.status(200).json({
        result: true,
        message: '',
        data: response.data
      })
    })
    .catch(error => {
      // console.log(error)
      res.status(500).json({
        result: false,
        message: '',
        error: error
      })
    })
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99

// 对应刘欢提供的存证服务
router.route('/certify')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // console.log(req.query)
    let claim_sn = req.query.claim_sn
    let signList = req.query.signList || false
    // console.log(claim_sn)
    // let claim_sn = '0xe8dda0c500efee2bd9f31113f373a5d09432a25c180f0d2f31be8952b9e6cc99'
    // return tokenSDKServer.getCertifyFingerPrint(claimItem.id, true).then(response => {
    tokenSDKServer.getCertifyFingerPrint(claim_sn).then(response => {
      res.status(200).json({
        result: false,
        message: '',
        data: response.data
      })
    }).catch(error => {
      console.log('error', error)
      res.status(200).json({
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

module.exports = router;

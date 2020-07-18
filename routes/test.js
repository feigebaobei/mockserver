var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js')
var cors = require('./cors')
var tokenSDKServer = require('token-sdk-server')
var fs = require('fs')
const Base64 = require('js-base64').Base64


// var session = require('express-session');
// var FileStore = require('session-file-store')(session)

// function fn (first, second = {k0: '0', k1: 1}) {
//   console.log('first', first)
//   console.log('second', second)
//   console.log('k0', second.k0)
//   console.log('k1', second.k1)
// }

/* GET users listing. */
router.route('/test')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // 开发pdid的任务列表
    let did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
    // let key = '0x' + tokenSDKServer.hashKeccak256(`${opRes.item.businessLicenseData.claim_sn}go to check businessLicense`)
    let key = '0x' + tokenSDKServer.hashKeccak256(`${did}go to check businessLicense`)
    console.log('key', key)
    tokenSDKServer.pullData(key, false).then(response => {
      console.log(response.data)
    })

    // // 测试签名接口 // 测试all
    // let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    // let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    // tokenSDKServer.getPvData(didttm.did).then(response => {
    //   // console.log(response.data)
    //   if (response.data.result) {
    //     let pvdataCt = response.data.result.data
    //     let pvdata = tokenSDKServer.decryptPvData(pvdataCt, priStr)
    //     pvdata = JSON.parse(pvdata)
    //     // console.log('pvdata', pvdata)
    //     let pendingTask = pvdata.pendingTask
    //     for (let key of Object.keys(pendingTask)) {
    //       utils.opPendingTask(pendingTask[key])
    //     }
    //     res.status(200).json({
    //       result: true,
    //       message: '',
    //       data: pvdata
    //     })
    //   }
    // })


    // // 测试并发数组请求
    // let arr = [
    // '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024',
    // '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024',
    // '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024',
    // '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024']
    // // tokenSDKServer.getCertifyFingerPrint(arr)
    // let fn = (arr) => {
    //   return Promise.all(arr.map(item => {
    //     return tokenSDKServer.getCertifyFingerPrint(item).then(response => {
    //       return response.data
    //     })
    //   }))
    // }
    // fn(arr).then(arr => {
    //   console.log(arr)
    // }).catch(error => {
    //   console.error
    // })



    // // 测试请求证书详情
    // let claim_sn = '0x49ac373cca54410f4570540bb5925947bfd931bf5def21ee143774a924d55508'
    // claim_sn = '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024'
    // tokenSDKServer.getCertifyFingerPrint(claim_sn, true).then(response => {
    //   console.log(response.data)
    //   res.status(200).json({
    //     result: true,
    //     message: '',
    //     data: response.data.result
    //   })
    // })
    // .catch(error => {
    //   console.log(error)
    // })


    // 测试签发证书 // 可以正确运行
    // let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    // let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
    // let claim_sn = '0xf8e82013a882a00b75511f3988c1b58c5ac718be32dd27e8ea0ed1f78e93e024'
    // let name = didttm.nickname
    // let templateId = '0xd74c92c0fe1f03b7b34a1ee2256bb48df13c44accaf0a02330f4b08e46ddb315'
    // let explain = '签名发时的说明'
    // let hashValue = '0xee13bcefe5e19a501ecfa41f30ad5f279349ba2493d0440333bddb3cdc2dfec7'
    // let expire = (new Date().setFullYear(2120))
    // let signObj = `claim_sn=${claim_sn},templateId=${templateId},hashCont=${hashValue},did=${didttm.did},name=${name},explain=${explain},expire=${expire}`
    // let signData = tokenSDKServer.sign({keys: priStr, msg: signObj})
    // let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
    // tokenSDKServer.signCertify(didttm.did, claim_sn, name, templateId, hashValue, explain, expire, signStr).then(response => {
    //   console.log(response.data)
    // }).catch(error => {
    //   console.log(error)
    // })
    // // let certifyData = {
    // //     "name": "李庆雪",
    // //     "gender": "男",
    // //     "nation": "汉",
    // //     "birthday": "687715200000",
    // //     "address": "河北省石家庄市桥东区北二环东路17号",
    // //     "identityNumber": "131128199110182718",
    // //     "issueAuthority": "石家庄市公安局桥东分局",
    // //     "startTime": "1303315200000",
    // //     "endTime": "1618934400000",
    // //     "faceFeature": "",
    // //     "front": "",
    // //     "back": ""
    // // }
    // // tokenSDKServer.checkHashValue(claim_sn, templateId, certifyData).then(response => {
    // //   console.log(response)
    // // }).catch(error => {
    // //   console.log(error)
    // // })


    // // 删除pvdata.pendingTask
    // tokenSDKServer.getPvData(didttm.did).then(response => {
    //   // console.log(response.data)
    //   if (response.data.result) {
    //     let pvdataCt = response.data.result.data
    //     let pvdata = tokenSDKServer.decryptPvData(pvdataCt, priStr)
    //     pvdata = JSON.parse(pvdata)
    //     console.log('pvdata', pvdata)
    //     pvdata.pendingTask = {}
    //     let ct = tokenSDKServer.encryptPvData(pvdata, priStr)
    //     console.log('ct', ct)
    //     res.status(200).json({
    //       result: true,
    //       message: '',
    //       data: pvdata
    //     })
    //   }
    // }).catch(error => {
    //   console.log(error)
    //   res.status(500).json({
    //     result: false,
    //     message: '',
    //     data: error
    //   })
    // })





    // res.status(200).json({
    //   result: true,
    //   message: '',
    //   data: ''
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

router.route('/setPvdata')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    res.send('get')
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    let did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
        privStr = '0xcf0fbbdac3353253cec457a81a560d916bfb229a710774747e29f0ff1c1daa59',
        key = '0xf1aa1f4416c5189d150eebf3a0bf1d514f2c35412a3523eb9e3af41375b96b74',
        // 清空pendingTask
        originCt = '0x77cc832abdfbf54d4bd55d1a7e31c2da23e47d1205e0e839b37e4516c5994adeb0ea0331250e809e0f6878ee846ed93911314dd81c1e0357fc18d19f28191c5dc02c0bca07731c7e58a12a4595a2c5f6ed6995dc645f8b31c9448c97c668b50e96b3389a5de6bea6f98306cda8f4a877543a33860195917731f0ddecf48ca81fe708265077ea19558c5ebbcb8f35a15b0743907441d03d0d646e7728bdc4ad34fc69b66b6eae7bda09da15699d80bacd1265ec8906370d7b7145006631f79e754e9fa072c0e33af6ffcf3963a705dab2a136c621fbdff42edeb8aedfa36df039a757bf1df03bc04ea56b6c0c105ee0dcadee5dd4e2f33a6099d86085fee9ef27d54add9b6427d08e26395be506e0b7529189f367701083b569cd4cb632f8c71028b1579d446bc7787a2635e4fdf94adc712affb97691bf3c8e04ec53cd630547fe5dd6562a3c7d358fbaff3a16acc4336469d95ed36deffa9cf14038aa420b914a540d244891bf706a641267245b4c477d9f3b303900b9110001550b39433303d7558c729f37ba7401f38a274fae8188d1a4c73e921ec388aa5ee3e917dd6aa5a56d7737a9968b876d9e2bcd11a72e364ddddf68bb65e39bb0fb53e8388602a2442772afb8aac9abdd3788aac504548be52b669e5549bec1f44011db397225e5f1dd7ae958f36d912fa0cea9fa77dd61a10f3e61a7746887a36ff839061ed416f165aa597f44e5898ef04717e20de9c3e5e351a9a201b049b1a666f95a2fcaf5cbfc69fa0f7f2ca79b81cfdd760f2a4452f21d155e0be1a62ebbe0e1436e3a923f95a6a91263d05be30bc6456e3592a20b1ef7001dbf9fd7e8d1972cc5baa8588fbb97b5c934e8e552e0c8b190649de641e6bb4e0c25c8cdc5385750e9acfdfd899c3de514bb7d26b4409a9d948b172e6a9c7e9b181f6ad03d736a9acd8fcedeef88509fc83ad227b01c7b6e820673b03b78907c0487615bd73344f8b7b30f061e854ed90ddbe4b29d840d5543ad4987bd71a1043dfa468a57d6e2c3042fd22eb181d2b77361c65e61aaa00facc8a7f1316ec15bf530a5fd5cfc249c5b8ea80e9e36cd7400ce0395973cff386a0b0a9a94430f24fa691dc21f4d955f62ad1349e9c844f85fc4fe0f1cb2755ff9245ddee39405d591d662254d4803d7a1f58b952c186a76b433bdc2307308353ba39036d5586584593ed0a48bcbee7b5e71f8bea9bbbd916e28acf714c2624d2c4b0746c028bafaff4d6b993e0694f5c40c5a2473935cb7b032cb516a8d42bd7e9abcc5be79cf5737dd36784823a72fa6a914e07665236aaa357c30097d273cd309ddedc0c9c75219c110564a59cf7289d7bdd01e2c1143598867f07afe242ba70817dcbd977f875279670c5662a451bb2a926fd6f8e282b02f3b96abcc9b2e41069cc71161cf4b614b67505b1786da95c2e62bce8d54b81ad7f18c706f8064a620b467bc8dd29da8d1f4ada13da172f1644ce027b2f1f910b33230353b9786eeb7f046632127da4c5244414e3f887a50f89191990a7dfb43e1b0f9171376c1e7b579c92ad065fb6e0b865527f3072dd3b16d3cd9dcbc01796de9868c306ca4ea6ecb53ac4e1235cb99435ee593c1d74c43f9ffcb70e14bc367d490d835d6ddbad536c3ae5b480fb3d88ea2f443a7db96fc1ccc7cd7f7b5ba661fdf8fd0f77fe233cd17e7e90086ed94e8e6a448d0e0eb985d60b6756f650c4be3886de4ed29bc129460606153cdc98441f76612e0f8a9bcffc1c58a4582f50d5df44b620c3bcba0f84c0d50747b07e83bc35ed7b91c9b3bb070345f95b45eead4db712ec66b838cce7a8ce3801873a7d962a96d9151af4880c194c7e9a315a4a7c99b247531e2b4124bef02a2b2994b2413c4fe01c5383f95b836f35071424d1e0427975df0b9f0def2dcf230240c8d6c5a496ee0cf17ee7d7ac231ac2b730cadf9052fbd268c14aaa0ac828c217334fdb558b8dfef48feb83612bb7d12fc2200463ac92b9332e74aaf7b25318f3532ff1080f549c5c1fbcd176b4e9a74d3d23a804f114e58a2efb80aba40b42d30870952f56025cc3bf12b8daf7648ca941f15a81672eec867bdbd603c8300a502a757b07fe0f387dec7adc29395b04609fd8396c89bd5de0d9f151a446b90a77e08e200d6b12534a0b6d4843895614ec1739766bbc372052b7fdb3d845a68c4588cd42cd5c9a60a5a1d8607969465dde331be50dc7b4319204ed65c4671f67e4be488dec11c2abddb48742afb09a9acae912ee6ab2a829018e557f34fa6d8bd8c6539b52335d259fd3cb6ab3be4951deb55cdcdabb7c23040152e6d6087036f62fe9d20152123fa12933678a3aedb00bf553fb4e530e9fc6c9bdff7d2c28d0c9658b879ec5ff6fc6f965767ca6717728009589545797a7329cdc9df6b17c86118d762ec93cec4cf904f9f9008c673d68cc48a172b5d0c7f7ac6191ec3a08952a92b92e0adf26b47aad7fa251d5701a026695286a691bb1bdaa0366da8dcdffc2cde5477ba88b517efbf76e85db199d8aac29caeafa1831378ee412a86fc047341c7221e253cb66d0a67c60ec9cbfae83a3601e6f9f1c51ae7865213644021ce8ff2a8c700dbf508de2ed2f910ff46571d46caf5098453f715553025184cd0c834bfd0b68af023b67560f9fb11a282f7323abf6a26c3b1251f361b4521730994c0ef8043f9527c55c8dd915304f1d1365d7a5d7f2960fd00ca863c785332ab298e73e52945aabf040f31a7209e302150b526d4c21c5621d11657e1258075348fb3d2ac010e7f6e86f7f7b2c76ea0137ee7873b806ea38ddb2a2d39de14732d9bd9880caef253361358493a8e43cc7e54ac1af9fb67199bced725367cd6c167190a530ce107a4b8f876a8502707fb3f409cfd1a0d982721721023b2383d5f7449a5b928efe61099b5e87810b40ef24819010df3a5c26036c8356d90c632ab64401cbe2537ea9a28589be5d30f0be847ca9a0e01b947896f59a37e02aa1855224580c0f1d5fad755557d63dbab04e6bb4fb9e1e1447f1dfb35d5e7f3b819085c180f9a40ca17b5a48f6a000cdf2387f3841b6550c04c5e81567ab883029b4af71234d050ea5d466060b2cd3e590b1941a5a87bdd82cd7b0229f53462645b3e8b2e96f8aceea51a38365eb57a58eb55d7652bae5a9aebba02af549a1cac91fbed4df39e6719b072ad94105a4be5682a894ee7a0c3ba6d73c44671871ae604ca67d2e9c680d12ce5d0d593450290b2e6c8bf678e5e7d9e092ee9729ade0484c050dc14c853457769ce13c79205a26c4225bcb9096ca24ad618382a87369eca7b614cfef0b6c846071f9f0a5ab05a183fbf8222be29fa84fabca0cfd70397563ab4e03608f70c413570047554a8a529321f5fa91dd915c20c5c82e112af2b19d142c0f6201500b7a12c5f2a9b1fb8f9a8ae002b8eef66b55a606fa53deb72be0ac34ff2cd2fa1e132e33d7b536b5c0600b01237d7eb90bba4383ef56550979c7d6ecb651de0e6d234341e6271b8bca81d7d4bb1f9d4623d9170a96f8aee9f9917a781cc5a5ec123389ed6634992fdc66c64069135f84c5dfe604567db4396eb450c0c5ae24ad5a3c94bc213d59ce38562cf56415b9d5614622d6c8f22d1c5dd0c1234a406dd25c35f7418f38dbc9bb0a1e136858849bc697a1f089537b4c5cacae67984a514dee166d345afc8c54929ce580262b7aed515dce379351d4b5e524c520927b8c79f565e8b5e8b9966893fc9ce57d2f2c7ac9c51058bc56b30b0f3cd209579cf4d147dc47ad20e3951a3a688fb61833822acd420c01bf19b0f8c1a55646fd99d1f8d933e73809521181bcc146720168fd5db853b734fcdc59c09581f0663a230af926c38f2ceff684767e7e6ed0ad9a06d8464cc45308b2b7a3fce3d3c380b4f4633f9d4639939b58d5974ad7706d1cad3f846e7d718e29a3e5c5f356ac1d1e29276855be57815ec69f4ef0ebb92f05725ee2c08331838171b2d71b8c9a9a2ad8800fa45c61b8f080f3345a322f4f1505d46f0c7c21b0b8e632e955ce49e49085387ee90de8f4efc0707e2df75765716aa3adcf30471861cf9291a97bece58dcce12a411003660f20f69484546c35a80dd7016b42167d3fb15bfb21e63ae044d8be93bb452ea68fd1ea12692d13f9a79579c84298a2854b2cbe3aca84281b94a8ccfd8a9f7765ba1a9f6c1d365678ebed5336665e4aaa96138ffb69d04696fbd5e26ee9baaa2e983929537ee1266b8786ebd41fec78447f5f8de9ed0ab868bd0d797635a3b690f095b4cdf5d88862727cfcecee9fca024dbde968137735cfd9dc5fc67743cea2044f68eb96fec68695a853fbbc1a18e1540799f44ab97128d49f7d55473036adbebe474feb633b79e912c7d47cbeec3dc47d6fef7787922141eb4aad1eea4bba72003062121a721bfba13efa0b5d4b864e5b04800da76cf622b56c81cfd7b7f33f5723ad1cca4d3cdbb0e8ae0831eb3e1100ed875a86a9c134e039736ac539760bbfb3e85c8b842fcb2a4a03d0f63874e9446096b63f441d1be0cda1360dec4beeb3162e819e34cdd6b1a69f38e225ea39c2ab57729be5e6a1c93e73c16fe80dbf8239cf4c65dad04a0028e794babfe9aba88bd81b010979138d699d1b58b16ddd4148b5cf72afa2729ffbe822ce06337ce20a4047d0d8dc33882152f86343af3d9ec2ddafd250b83048ee81c8f7858823cd3b4eee93f97d076a81e8087699f80bee12b7b392e0ee2f6b72f13d1fb4f3eb8bec5c1cc6b527e4651d73bedf4047272ba7dc40bce66122975dc87c5fc136aa48d6b82cc876cf2da00ed29c33686fee9303284069ed64d9a79aa23c494973f925c01be109329d3a1e3bab47c6011062ee60f34b22edea274ca00e464c5c55bb3ae5862c7a1e785832bf3569c24ad5fee12b384fbc19da12afc4ea1ca12d919cab95f26fcf16167cfb3dea5255a60dffd92f3b37e1841614cc23a33381196f01a1d0e2419c060fd6624af7f62f05e02a176b55fee4468e9578499e07f26ff446a425465570dcf7a96e98878f8a5469efaf789be8255eb6a0c8a032b4304c2997f7d009fa2e9ba41b4a4c0772c17abd5c01d8dfdb3df3beefaf773cd7fc051711cd0307f815eff99beadaf427ff757fe8182a645f71c3493382044b0f592e61a69c8f27eb72b0f76e464df18e1c38bbfe691e3b094bd9599e243e0b5c6be5c88d33b86744b37261ec44177f5c3eaf70c413a3bc982999de81834b1c529f0fe44db0f55daf9084d05701dc68fc51cc684926be7bcfbcde94947250b52179a7f1387e0a9e4c6a86e48bb155598b4156c5e8fc9589835cbb9532f3a0a0ebae5256ecb4ad5a3ef252041218f3d534a60bfad070697a33992faa58aac4bd1e9f811d5ab26b97b7b25d934505c27d3f51dc87f00e67cef65804c5f6712ceda55a81300b737c30216f31d59a7c3e0d9601bd6914c24271a311b04f565c696310c660de60cdcf8be6664e876c3b393889516945dfcf93ac4b945078395588fe6be4ff854565b220ae9e58fe41e23bbd2ea3f427f71de91430fdf1f0f9ccc3be3a68e0612cef82c0edf32d1f85192c69e6ef8479b9cd602c3e839c3a809534a96dae68cff0dd810cdd0b76243f1e55702d1ed06c2793ec4f0a73869a007286973bf5cb6c046cd79f1579d1f866a78df8a592db5964fc83492a54d553fae229a0560ad93096de921d1470f5ef264ca09040bad95fbead01e394dc776a430df8d399b70e7cf3769b8b92a6627c1c97865643ef1c9c1b3cb17bd96daea434ab90eea51cacea13f312b0fdda88d489a53f8ae815e39582484c54256f19fff40afeecc827cbfab3e6dde58b015bd10ce516d9bb2f947bb9d28e11d18dac896cac7119b60ddeeadb1dcb3ca75c914a991664c08fecf8d2fcc588a8edfe5337ac259e9f869f284947e8487f4a5ee3894abc59221412611bf983c7de3a801486079cc9619558f6414e7eb26842622cd413975bfd8277592d4e69db28459e876889675471cadae38864c665ff2c142cbe55125885fcc74fc120f9ddc47841492ee4e2a2e3f738e7114c922b83950d2775b3ade20f1127fe8eb71ea4b0651786efc07bf0069e1050a65ecad086d438830d4d080a8ae00b776a62065a267418f0d7f6ad5bfd62da0f4840a652adc7893c12b79d474901559e8963a0fbd85f819f300410faa8488187f838abc8e7ae81bd16fed657df6cf09df891f8de254a368a69c8df7c1c1f2ef6382dbcd2c9569e357e1d7284b270126a4bb43ecf9469e366c09041e4e76024f2fb42d683e3c740f50711926a2a0fdd428fb7f87d5c76d45c3a65040bdb76e9f4f381542e76ad2d08f4b5bde8fcea1d7115f1f9a9847f1122d65f3057938371b2ce2a76016c57c372d4f9849fa0df3dd629ac4b554de13f74874049d03d4159327b5b1c3f0636841c424d2c6efe7a1bed29916718cc5f6795a380e4d278e013e09e74963cd085003ca934d7921052a8613c0ce5c895608a08857588fd152bd307c8aabe2b309bf34fb45ccfac8aeb501d7d462a66316b5ab7140232b38b6fef26185c334bc8b479929e150575d49709ced5d7f8ddbd1fe9689a8b0af4527c07fa3f20e2044c67bdb8d5c23103133fd8a04a247946e126adeadd5fd545a8de067429fce29e22e8be933728aa59b3673996840802da1533e8d7935c78582979f8646f4e33a53191f3baddd02642d39bdc8a29ba6914d9802c68f937936ec094ba9c85f71545ccdd64608898eea8c18440f7a889c36841a75d1f1aa29b80b0e140a36f1d1a75a665913878b2e9cae24fb9f378a9d914c3c7a0dd647f000ab561dfae465649467dafa28fe1cb657b6b46001482e38400cc844cf4da1055f79e64344d4622ad07f5839b1ff4ac40df9437f3d1fe35827778d95868f0efcc803cbffde51d0565fbad1c8f3d5273282765d242d18776373f635d0f71382f9c79ccb6c5ddbd831d6198d6ba8d1fb808a663706883c83fa1249ac5604e13da4f13a8c42305d89f544cdcdee7212c32822061b7e55a198628264d38de6e355e41f956f1023b4a647e32a67a0dc23a0cc43d52dcfc9e341a313522e71e7f6b17ba00b9d0cb2aba1d620b454ebafe0b79b89cdbb58e0b1d81b3e707c1c4d64826859b9e874864b301130210836366bec5e6818eb46e859139f28524c09af0bcecdc7d8b05f022e79bda79b93c1d0d0d1b62990969658765de064bfaf1fff6782bbce1ae3942af4ac6fabd3179263df685cbd980fd2033fa846ae371854324cbb41ed53f937fa3d6bdaa8a49ecb1ecdd974b1e32a135cd93ba6a4f4b1aa5aa939be7c5d00ece9ddaf56981a24359e27a687db686bb87bdccdfd79f53b2403b48b07afb9a9428132d5ff8328a64013e6ab33e5266a32a486b78835eb79e013f31d30c5550db03f2e3de67f786d128c18eaa6bb7dc1f2af857ad985955680e247bc9f3b56c47acc8e343c14493b3d8050cf8f33a048d9cfb2a2c0d6be662bdb1034c6f552beaa100276c6b4c7161a45c3815059ff37e1a6474f73d78ea2091b9e2cdf803767615cb9ea60b40c2dcf07576dd7f3a8c53886f1b3ae1afb01908ad2738e5c7bc2dff9d264078a91743acdda8406b3011e9a1f057deea868b201d60c88b90e79cbaaaa71d7c8a05555f19d82d7d91802206c471ae333071370bb8e0ab58956940690eed381f9dbacccf60bd34deea122e8b652b64a47be74d62f46e016a080c8629a9bdcb7ab4183abd910f733efb21894fec4fbfd066f9ce59f6a99133cd52853d255643c6daa864ab05b826ad6bca4bf56cd1a07d3cd7e42df6c1817c52b10278af10ff670b5afb685612a1f81a9ee4ce4ad41f64c59475504a75a97a5700020bc6a6dcea93eab8622ab44d6d540380f2474beb3532392458a4900dd8c984418106f5dbbf7cee3fdafa35a651888a218ffca22434630ecb97ed1df43497147c98a49b4d49a0cb63c8edc636dd44b155150f1d9be29e5002f247ad421f550e0746f956f86b63667c650eba44474562f8e6ea335836cdf75cc0702bfa4f6410f341f723a42b29a7c3bd446b79ee292776edb72d3248840bea6a7bdf287ef4afbda02a89baff9b92c2debe315e4b8d31c74952e40d824246be10c5de5d44bf4d8261300b8dc223dec541b24731874bc60678f52bec453394fb4a876791d1b31436ccf3a991eb4217d2e9c3577220f0b6aff0ad84bd317c74c500b268bf1bc47f9cbea447eb6c9eca0e9448f032bec5739f8e1c3e283d1c649d7573364197813d0904e0816768f331733491bff2f69d8674fa0e745a3056c98e4be6c7eb7fc4ae8c297cb7998f82b3bbf326226aee981716023c076718498072653d1f3d2a58ce228b871b8be2da4067f17cea2e27ba83753506fc32ab56c634b5d1b016df4cb281edf2313b32cc1c6e3ae39a0f2539e7a9e99b1537d3bcea66f84e67647de1fdb6556ff8c629d9997eab01d3ee58ed95cdf1bef86f7c575227e90b4921c32372f30324d3ba89c64d70ce5c8c869b62d8487e848872638fe556e7a1ef5ef14db1960cbfd89ac82b749ebbf56a1d825a6c1b215325770d58338b49f1c63bfb267229dbc58f644b565b5adb1748fed0e50209979cf4a71418ada53df306bbe17c7b645a5e7556c80d6030e6eeea35aa718bb41ea1e61193c7cc79e7d20ef42471c7dc3106e8e511c7b5e10d257c9c51d77fa342747c492c79582f66b5f85632997ba18c933ec595bffa8afc0504004d887a4f364acb8c41d388c6cb53d04966a5104ef08dbf63866d80f72f08fe33321c9b5b618342222efefea5a191075192fedc7cd4f16cc0e83a4eb73379c43c4a81f891c33f27c89483d3d48229beeffe2367f914c7dd567e1db2a74206f00f9e093777f60fd01a8b72a231817cd90bada8042cc514f29610022448f1def00ded35b0bc06d928482bb5349fdcab085f26a374f5bcef6b919a0765297de61b706447a3079ef94f447587dbfb34e0ec2f5a5ddd453baf23420e154b2',
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
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey
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
    res.send('post')
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.send('put')
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.send('delete')
  })

// 父did的任务列表
router.route('/pdidPendingTask')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions, (req, res, next) =>{
    // res.send('get')
    // 测试备份父did的待办事项 list
    let did = 'did:ttm:u05d41330c253b46bd79983c019f9f93477eda305b0f618b7c57401748bde2'
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
    // let pdid = req.body.pdid
    let pdid = 'did:ttm:u011b80743b5fa85ade3a5696eef660b2bae1ba4ba2b84938f26f024cf3fcd'
    // res.send('post')
    let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
    let priStr = tokenSDKServer.decryptDidttm(didttm, idpwd)
    priStr = JSON.parse(priStr.data).prikey
    let pdidPendingTaskKey = '0x' + tokenSDKServer.hashKeccak256(`${pdid}go to check businessLicense`)
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
        data: JSON.parse(response.data)
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


module.exports = router;

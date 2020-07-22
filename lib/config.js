module.exports = {
  certify: {
    t001: {
      title: '毕业证书',
      id: 't001',
      type: 'common',
      label: '毕业证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名', // 用于label标签
          name: 'name', // 用于name属性
          default: '',
          // options: [] // 类型为input时没有options
          index: 0
        },
        identity: {
          type: 'text',
          label: '身份证号',
          name: 'identity',
          default: '',
          index: 1
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 2
        },
        startYear: {
          type: 'text',
          label: '开始年份',
          name: 'startYear',
          default: '',
          index: 3
        },
        startMonth: {
          type: 'text',
          label: '开始月份',
          name: 'startMonth',
          default: '',
          index: 4
        },
        endYear: {
          type: 'text',
          label: '结束年份',
          name: 'endYear',
          default: '',
          index: 5
        },
        endMonth: {
          type: 'text',
          label: '结束月份',
          name: 'endMonth',
          default: '',
          index: 6
        },
        school: {
          type: 'text',
          label: '学校',
          name: 'school',
          default: '',
          index: 7
        },
        honours: {
          type: 'text',
          label: '年制',
          name: 'honours',
          default: '',
          index: 8
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 9
        },
        serialNumber: {
          type: 'text',
          label: '证书编号',
          name: 'serialNumber',
          default: '',
          index: 10
        }
      },
      desc: '学生$name$身份证号$identity$性别$gender$于$startYear$年$startMonth$月到$endYear$年$endMonth$月在$school$学校$honours$年制$major$专业学习。现已修完教学计划规定的全部课程，成绩合格，获得毕业证书。证书编号：$serialNumber$'
    },
    t002: {
      title: '博士学位证书',
      id: 't002',
      type: 'common',
      label: '博士学位证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        birthday: {
          type: 'text',
          label: '生日',
          name: 'birthday',
          default: '',
          index: 2
        },
        school: {
          type: 'text',
          label: '学校',
          name: 'school',
          default: '',
          index: 3
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 4
        },
        grade: {
          type: 'text',
          label: '学位',
          name: 'grade',
          default: '',
          index: 5
        },
        serialNumber: {
          type: 'text',
          label: '证书编号',
          name: 'serialNumber',
          default: '',
          index: 6
        }
      },
      desc: '学生$name$性别$gender$生日$birthday$，在$school$学校$major$学科（专业）已通过博士学位的课程考试和论文答辩，成绩合格。根据《中华人民共和国学位条例》的规定，授予$grade$博士学位。证书编号：$serialNumber$'
    },
    t003: {
      title: '硕士学位证书',
      id: 't003',
      type: 'common',
      label: '硕士学位证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        birthday: {
          type: 'text',
          label: '生日',
          name: 'birthday',
          default: '',
          index: 2
        },
        school: {
          type: 'text',
          label: '学校',
          name: 'school',
          default: '',
          index: 3
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 4
        },
        grade: {
          type: 'text',
          label: '学位',
          name: 'grade',
          default: '',
          index: 5
        },
        serialNumber: {
          type: 'text',
          label: '证书编号',
          name: 'serialNumber',
          default: '',
          index: 6
        }
      },
      desc: '学生$name$性别$gender$生日$birthday$，在$school$学校$major$学科（专业）已通过硕士学位的课程考试和论文答辩，成绩合格。根据《中华人民共和国学位条例》的规定，授予$grade$硕士学位。证书编号：$serialNumber$'
    },
    t004: {
      title: '学士学位证书',
      id: 't004',
      type: 'common',
      label: '学士学位证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        birthday: {
          type: 'text',
          label: '生日',
          name: 'birthday',
          default: '',
          index: 2
        },
        school: {
          type: 'text',
          label: '学校',
          name: 'school',
          default: '',
          index: 3
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 4
        },
        grade: {
          type: 'text',
          label: '学位',
          name: 'grade',
          default: '',
          index: 5
        },
        serialNumber: {
          type: 'text',
          label: '证书编号',
          name: 'serialNumber',
          default: '',
          index: 6
        }
      },
      desc: '学生$name$性别$gender$生日$birthday$，在$school$学校$major$学科（专业）已通过学士学位的课程考试和论文答辩，成绩合格。根据《中华人民共和国学位条例》的规定，授予$grade$学士学位。证书编号：$serialNumber$'
    },
    t005: {
      title: '驾驶执照',
      id: 't005',
      type: 'common',
      label: '驾驶执照', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        serialNumber: {
          type: 'text',
          label: '证书编号',
          name: 'serialNumber',
          default: '',
          index: 0
        },
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 1
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 2
        },
        nationality: {
          type: 'text',
          label: '国籍',
          name: 'nationality',
          default: '',
          index: 3
        },
        address: {
          type: 'text',
          label: '地址',
          name: 'address',
          default: '',
          index: 4
        },
        birthday: {
          type: 'text',
          label: '生日',
          name: 'birthday',
          default: '',
          index: 5
        },
        orderFirst: {
          type: 'text',
          label: '初次领证日期',
          name: 'orderFirst',
          default: '',
          index: 6
        },
        allowMotrocycleType: {
          type: 'text',
          label: '准驾车型',
          name: 'allowMotrocycleType',
          default: '',
          index: 7
        },
        validityStart: {
          type: 'text',
          label: '有效期限（开始）',
          name: 'validityStart',
          default: '',
          index: 8
        },
        validityEnd: {
          type: 'text',
          label: '有效期限（结束）',
          name: 'validityEnd',
          default: '',
          index: 9
        },
      },
      desc: '中华人民共和国机动车驾驶证\n证号$serialNumber$\n姓名$name$性别$gender$国籍$nationality$住址$address$出生日期$birthday$初次领证日期$orderFirst$准驾车型$allowMotrocycleType$有效期限$validityStart$至$validityEnd$'
    },
    t006: {
      title: '结婚证书',
      id: 't006',
      type: 'identity',
      label: '结婚证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        owner: {
          type: 'text',
          label: '持证人',
          name: 'owner',
          default: '',
          index: 0
        },
        orderTime: {
          type: 'date',
          label: '登记日期',
          name: 'orderTime',
          default: '',
          index: 1
        },
        serialNumber: {
          type: 'text',
          label: '结婚证字号',
          name: 'serialNumber',
          default: '',
          index: 3
        },
        remark: {
          type: 'text',
          label: '备注',
          name: 'remark',
          default: '',
          index: 4
        },
        wifeName: {
          type: 'text',
          label: '姓名',
          name: 'wifeName',
          default: '',
          index: 5
        },
        wifeGender: {
          type: 'radio',
          label: '性别',
          name: 'wifeGender',
          default: '',
          options: ['男', '女'],
          index: 6
        },
        wifeNationality: {
          type: 'text',
          label: '国籍',
          name: 'wifeNationality',
          default: '',
          index: 7
        },
        wifeBirthday: {
          type: 'date',
          label: '出生日期',
          name: 'wifeBirthday',
          default: '',
          index: 8
        },
        wifeId: {
          type: 'text',
          label: '身份证号',
          name: 'wifeId',
          default: '',
          index: 9
        },
        husbandName: {
          type: 'text',
          label: '姓名',
          name: 'husbandName',
          default: '',
          index: 10
        },
        husbandGender: {
          type: 'radio',
          label: '性别',
          name: 'husbandGender',
          default: '',
          options: ['男', '女'],
          index: 11
        },
        husbandNationality: {
          type: 'text',
          label: '国籍',
          name: 'husbandNationality',
          default: '',
          index: 12
        },
        husbandBirthday: {
          type: 'date',
          label: '出生日期',
          name: 'husbandBirthday',
          default: '',
          index: 13
        },
        husbandId: {
          type: 'text',
          label: '身份证号',
          name: 'husbandId',
          default: '',
          index: 14
        }
      },
      desc: '持证人$owner$，登记日期$orderTime$，结婚证字号$serialNumber$，备注$remark$\n姓名$wifeName$性别$wifeGender$国籍$wifeNationality$出生日期$wifeBirthday$身份证件号$wifeId$\n姓名$husbandName$性别$husbandGender$国籍$husbandNationality$出生日期$husbandBirthday$身份证件号$husbandId$'
    },
    t007: {
      title: '居住证书',
      id: 't007',
      type: 'common',
      label: '居住证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        nation: {
          type: 'text',
          label: '民族',
          name: 'nation',
          default: '',
          index: 2
        },
        identity: {
          type: 'text',
          label: '身份证号码',
          name: 'identity',
          default: '',
          index: 3
        },
        nativePlace: {
          type: 'text',
          label: '户籍所在地',
          name: 'nativePlace',
          default: '',
          index: 4
        },
        currentPlace: {
          type: 'text',
          label: '现居住地址',
          name: 'currentPlace',
          default: '',
          index: 5
        },
        startTime: {
          type: 'date',
          label: '有效期限（开始）',
          name: 'startTime',
          default: '',
          index: 6
        },
        endTime: {
          type: 'date',
          label: '有效期限（开始）',
          name: 'endTime',
          default: '',
          index: 7
        }
      },
      desc: '姓名$name$性别$gender$民族$nation$身份证号码$identity$户籍所在地$nativePlace$现居住地址$currentPlace$有效期限$startTime$至$endTime$'
    },
    t008: {
      title: '身份证书',
      id: 't008',
      type: 'identify',
      label: '身份证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        gender: {
          type: 'radio',
          label: '性别',
          name: 'gender',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        nation: {
          type: 'text',
          label: '民族',
          name: 'nation',
          default: '',
          index: 2
        },
        birthday: {
          type: 'date',
          label: '出生日期',
          name: 'birthday',
          default: '',
          index: 3
        },
        nativePlace: {
          type: 'text',
          label: '住址',
          name: 'nativePlace',
          default: '',
          index: 4
        },
        identidy: {
          type: 'text',
          label: '公民身份号码',
          name: 'identidy',
          default: '',
          index: 5
        }
      },
      desc: '姓名$name$性别$gender$民族$nation$出生日期$birthday$住址$nativePlace$公民身份号码$identidy$'
    },
    t009: {
      title: '授权证书',
      id: 't009',
      type: 'common',
      label: '授权证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        fromCompany: {
          type: 'text',
          label: '授权方',
          name: 'fromCompany',
          default: '',
          index: 0
        },
        toCompany: {
          type: 'text',
          label: '被授权方',
          name: 'toCompany',
          default: '',
          index: 1
        },
        range: {
          type: 'text',
          label: '授权区域',
          name: 'range',
          default: '',
          index: 2
        },
        authorization: {
          type: 'text',
          label: '授权内容',
          name: 'authorization',
          default: '',
          index: 3
        },
        brand: {
          type: 'text',
          label: '品牌',
          name: 'brand',
          default: '',
          index: 4
        },
        right: {
          type: 'text',
          label: '权利',
          name: 'right',
          default: '',
          index: 5
        },
        salePlace: {
          type: 'text',
          label: '授权经销点',
          name: 'salePlace',
          default: '',
          index: 6
        },
        authStart: {
          type: 'date',
          label: '授权期限（开始）',
          name: 'authStart',
          default: '',
          index: 7
        },
        authEnd: {
          type: 'date',
          label: '授权期限（结束）',
          name: 'authEnd',
          default: '',
          index: 8
        },
        contractNumber: {
          type: 'text',
          label: '授权合同号',
          name: 'contractNumber',
          default: '',
          index: 9
        }
      },
      desc: '$fromCompany$公司兹授权$toCompany$公司获得在$range$授权区域$authorization$$brand$品牌$right$权利。\n授权经销点$salePlace$\n授权期限$authStart$到$authEnd$\n授权经销合同号$contractNumber$'
    },
    t0010: {
      title: '工作证书',
      id: 't0010',
      type: 'common',
      label: '工作证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        company: {
          type: 'text',
          label: '公司',
          name: 'company',
          default: '',
          index: 0
        },
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 1
        },
        jobTitle: {
          type: 'text',
          label: '职务',
          name: 'jobTitle',
          default: '',
          index: 2
        },
        department: {
          type: 'text',
          label: '部门',
          name: 'department',
          default: '',
          index: 3
        },
        number: {
          type: 'text',
          label: '编号',
          name: 'number',
          default: '',
          index: 4
        }
      },
      desc: '$company$公司\n工作证\n姓名：$name$\n职务：$jobTitle$\n部门：$department$\n编号：$number$'
    },
    t0011: {
      title: '会员证书',
      id: 't0011',
      type: 'common',
      label: '会员证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        association: {
          type: 'text',
          label: '协会名',
          name: 'association',
          default: '',
          index: 0
        },
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 1
        },
        gender: {
          type: 'text',
          label: '性别',
          name: 'gender',
          default: '',
          index: 2
        },
        birthday: {
          type: 'date',
          label: '出生日期',
          name: 'birthday',
          default: '',
          index: 3
        },
        jobTitle: {
          type: 'text',
          label: '职称',
          name: 'jobTitle',
          default: '',
          index: 4
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 5
        },
        employer: {
          type: 'text',
          label: '工作单位',
          name: 'employer：工作单位',
          default: '',
          index: 6
        },
        registrationCode: {
          type: 'text',
          label: '登记证号',
          name: 'registrationCode：登记证号',
          default: '',
          index: 7
        }
      },
      desc: '$association$（协会名）会员证\n姓名：$name$\n性别：$gender$\n出生日期：$birthday$\n职称：$jobTitle$\n专业方向：$major$\n工作单位：$employer$\n登记证号：$registrationCode$'
    },
    t0012: {
      title: '营业执照',
      id: 't0012',
      type: 'common',
      label: '营业执照', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        registrationNumber: {
          type: 'text',
          label: '注册号',
          name: 'registrationNumber',
          default: '',
          index: 0
        },
        name: {
          type: 'text',
          label: '名称',
          name: 'name',
          default: '',
          index: 1
        },
        type: {
          type: 'text',
          label: '类型',
          name: 'type',
          default: '',
          index: 2
        },
        residence: {
          type: 'text',
          label: '住所',
          name: 'residence',
          default: '',
          index: 3
        },
        legalRepresentative: {
          type: 'text',
          label: '法定代表人',
          name: 'legalRepresentative',
          default: '',
          index: 4
        },
        registeredCapital: {
          type: 'text',
          label: '注册资本',
          name: 'registeredCapital',
          default: '',
          index: 0
        },
        dateOfEstablishment: {
          type: 'date',
          label: '成立日期',
          name: 'dateOfEstablishment',
          default: '',
          index: 10
        },
        operatingPeriod: {
          type: 'text',
          label: '营业期限',
          name: 'operatingPeriod',
          default: '',
          index: 0
        },
        businessScope: {
          type: 'text',
          label: '经营范围',
          name: 'businessScope',
          default: '',
          index: 10
        }
      },
      desc: '注册号：$registrationNumber$\n名称：$name$\n类型：$type$\n住所：$residence$\n法定代表人：$legalRepresentative$\n注册资本：$registeredCapital：注册资本$\n成立日期：$dateOfEstablishment：成立日期$\n营业期限：$operatingPeriod：营业期限$\n营业范围：$businessScope：经营范围$'
    },
    t0013: {
      title: '商标证书',
      id: 't0013',
      type: 'common',
      label: '商标证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        certificateNumber: {
          type: 'text',
          label: '证书号',
          name: 'certificateNumber',
          default: '',
          index: 0
        },
        certificateName: {
          type: 'text',
          label: '证书名称',
          name: 'certificateName',
          default: '',
          index: 1
        },
        companyName: {
          type: 'text',
          label: '公司名称',
          name: 'companyName',
          default: '',
          index: 2
        },
        registrationNumber: {
          type: 'text',
          label: '注册号',
          name: 'registrationNumber',
          default: '',
          index: 3
        },
        commodity: {
          type: 'text',
          label: '认定商品',
          name: 'commodity',
          default: '',
          index: 4
        },
        startTime: {
          type: 'date',
          label: '起始时间',
          name: 'startTime',
          default: '',
          index: 5
        },
        endTime: {
          type: 'date',
          label: '结束日期',
          name: 'endTime',
          default: '',
          index: 6
        }
      },
      desc: '证书号：$certificateNumber$\n证书名称：$certificateName$\n公司名称：$companyName$\n商标注册第$registrationNumber$号\n认定商品：$commodity$\n有效期限$startTime$至$endTime$'
    },
    t0014: {
      title: '专利证书',
      id: 't0014',
      type: 'common',
      label: '专利证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        patentNumber: {
          type: 'text',
          label: '专利号',
          name: 'patentNumber',
          default: '',
          index: 0
        },
        authTo: {
          type: 'radio',
          label: '授权方',
          name: 'authTo',
          default: '',
          index: 1
        },
        authFrom: {
          type: 'text',
          label: '被授权方',
          name: 'authFrom',
          default: '',
          index: 2
        },
        authStart: {
          type: 'text',
          label: '授权时间（开始）',
          name: 'authStart',
          default: '',
          index: 3
        },
        authEnd: {
          type: 'text',
          label: '授权时间（结束）',
          name: 'authEnd',
          default: '',
          index: 4
        },
        patentOwner: {
          type: 'text',
          label: '专利授权人',
          name: 'patentOwner',
          default: '',
          index: 5
        }
      },
      desc: '$patentNumber$现将本人$authTo$授权给$authFrom$使用，在指定的授权期限内，允许其销售、使用此专利产品，并负责此专利产品的推广和维护。授权日期：$authStart$截止日期$authEnd$专利授权人$patentOwner$'
    },
    t0015: {
      title: '学士学位证书',
      id: 't0015',
      type: 'common',
      label: '学士学位证书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        seriasNumber: {
          type: 'text',
          label: '证书号',
          name: 'seriasNumber',
          default: '',
          index: 0
        },
        softwareName: {
          type: 'radio',
          label: '软件名称',
          name: 'softwareName',
          default: '',
          options: ['男', '女'],
          index: 1
        },
        author: {
          type: 'text',
          label: '著作权人',
          name: 'author',
          default: '',
          index: 2
        },
        finishDate: {
          type: 'text',
          label: '开发完成日期',
          name: 'finishDate',
          default: '',
          index: 3
        },
        publishDate: {
          type: 'text',
          label: '首次发表日期',
          name: 'publishDate',
          default: '',
          index: 4
        },
        getMethod: {
          type: 'text',
          label: '权利取得方式',
          name: 'getMethod',
          default: '',
          index: 0
        },
        rightRange: {
          type: 'text',
          label: '权利范围',
          name: 'rightRange',
          default: '',
          index: 10
        },
        registerNumber: {
          type: 'text',
          label: '登记号',
          name: 'registerNumber',
          default: '',
          index: 10
        }
      },
      desc: '证书号：$seriasNumber$\n软件名称：$softwareName$\n著作权人：$author$\n开发完成日期：$finishDate$\n首次发表日期$publishDate$权利取得方式$getMethod$\n权利范围$rightRange$\n登记号$registerNumber$\n根据《计算机软件保护条例》和《计算机软件著作权登记办法》的规定，经中国版权保护中心审核，对以上事项予以登记。'
    },
    t0016: {
      title: '聘书',
      id: 't0016',
      type: 'common',
      label: '聘书', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        company: {
          type: 'text',
          label: '公司',
          name: 'company',
          default: '',
          index: 1
        },
        position: {
          type: 'text',
          label: '职位',
          name: 'position',
          default: '',
          index: 2
        },
        start: {
          type: 'text',
          label: '聘期（开始）',
          name: 'start',
          default: '',
          index: 3
        },
        end: {
          type: 'text',
          label: '聘期（结束）',
          name: 'end',
          default: '',
          index: 4
        },
        treatLevel: {
          type: 'text',
          label: '待遇',
          name: 'treatLevel',
          default: '',
          index: 5
        }
      },
      desc: '兹聘请$name$同志为$company$公司$position$职位，聘期自$start$至$end$，聘任期间享受$treatLevel$待遇。'
    },
    t0017: {
      title: '等级认证',
      id: 't0017',
      type: 'common',
      label: '等级认证', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        seriasNumber: {
          type: 'text',
          label: '证书编号',
          name: 'seriasNumber',
          default: '',
          index: 0
        },
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 1
        },
        time: {
          type: 'date',
          label: '发证时间',
          name: 'time',
          default: '',
          index: 2
        },
        grade: {
          type: 'text',
          label: '等级',
          name: 'grade',
          default: '',
          index: 3
        }
      },
      desc: '证书编号：$seriasNumber$持证人：$name$发证时间：$time$参加相应等级考试取得$grade$级别，特发此证。'
    },
    t0018: {
      title: '结业证',
      id: 't0018',
      type: 'common',
      label: '结业证', // 标签，可以用于搜索。
      background: 'http://localhost:9876/images/bYOICidm04GJMZeb.png',
      example: 'http://localhost:9876/images/certifySale.jpeg',
      keys: {
        name: {
          type: 'text',
          label: '姓名',
          name: 'name',
          default: '',
          index: 0
        },
        start: {
          type: 'text',
          label: '开始日期',
          name: 'start',
          default: '',
          index: 1
        },
        end: {
          type: 'text',
          label: '结束日期',
          name: 'end',
          default: '',
          index: 2
        },
        major: {
          type: 'text',
          label: '专业',
          name: 'major',
          default: '',
          index: 3
        },
        school: {
          type: 'text',
          label: '学校',
          name: 'school',
          default: '',
          index: 4
        },
        publish: {
          type: 'text',
          label: '发证日期',
          name: 'publish',
          default: '',
          index: 5
        }
      },
      desc: '$name$于$start$至$end$在我院参加$major$培训，成绩合格，特发此证。$school$$publish$'
    }
  },
  // idpwd: '1234qwerA',
  redis: {
    host: 'r-2ze9b3ba66282224pd.redis.rds.aliyuncs.com',
    port: '6379',
    pass: 'Token2Info4Redis2'
  },
  webSocket: {
    port: 9875
  }
}
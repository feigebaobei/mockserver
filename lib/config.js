module.exports = {
  certify: {
    t001: {
      title: '毕业证书',
      id: 't001',
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
    }
  }
}
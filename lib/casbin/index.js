/**
 * 因casbin不好使用。所以不用了。
 */
// // const wer = require('casbin')
// // console.log(wer)
const {newEnforcer} = require('casbin')

let enforcer = await newEnforcer('lib/casbin/model.conf', 'lib/casbin/policy.csv')
// let enforcer = newEnforcer('lib/casbin/model.conf', 'lib/casbin/policy.csv')

module.exports = {
  enforcer
}






// import { newEnforcer } from 'casbin';
// const enforcer = await newEnforcer('./basic_model.conf', './basic_policy.csv');

// module.exports = {
//   enforcer
// }


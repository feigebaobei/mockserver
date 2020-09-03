const AccessControl = require('role-acl')
const ac = new AccessControl()
const utils = require('./utils')

ac//.grant('guest')
    // .execute('read').on('')
    // .execute('read').on('doc')
  .grant('user')
    .execute('read').on('doc')
    // .extend('guest')
  .grant('tank')
    .execute('read').on('news')
  .grant('auditor')
    .extend('user')
    .execute('read').on('user')
    .execute('audit').on('claim')
  .grant('operator')
    .extend('auditor')
    // .execute('create').on('video')
    // .execute('delete').on('video')
    // .execute('read').on('video')
  .grant('admin')
    .extend('operator')
    .execute('update').on('video', ['title'])
    .execute('delete').on('video')
  // .grant('guest')
  //   .condition({
  //     Fn: 'EQUALS',
  //     args: {
  //       'requester': '$.owner'
  //     }
  //   }).execute('edit').on('article')
  .grant('superAdmin')
    .extend(['admin'])

// let permission = (req, res, next) => {
//   // return sync ?
//   // ac.can(role).execute(behavior).sync().on(resource) :
//   let role = undefined // req.user.role
//   console.log('role', role)
//   ac.can(role).execute(behavior).on(resource).then(response => {
//     console.log('permission', response)
//     if (response.granted) {
//       next()
//     } else {
//       utils.resFormatter(res, 401, {message: config.errorMap.denyAccess.message})
//     }
//   })
// }
let  permission = (role, behavior, resource, sync = false) => {
  // return ac.can(role).execute(behavior).
  // if (sync) {
  //   rt
  // }
  return sync ?
  ac.can(role).execute(behavior).sync().on(resource) :
  ac.can(role).execute(behavior).on(resource)
}

module.exports = {
  ac,
  permission
}
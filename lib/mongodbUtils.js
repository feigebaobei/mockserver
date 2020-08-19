let save = (instance) => {
  return new Promise((r, j) => {
    instance.save((e, d) => {
      // console.log(e, d)
      // e ? j(e) : r(d)
      e ? r({error: e, result: null}) : r({error: null, result: d})
    })
  })
}

module.exports = {
  save
}
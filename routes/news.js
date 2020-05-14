var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.send({'key0':'value0','key1':'value1','key2':'value2',})
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session)
  console.log(req.sessionID)
  res.render('index', { title: 'mockserver' });
});

module.exports = router;

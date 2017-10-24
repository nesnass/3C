var Common = require('../control/common');
var express = require('express');
var router = express.Router();

/**
 * Very basic Authorisation route
 */
router.get('/', function (req, res) {
  if (req.query['pw'] === Common.Constants.ROUTE_PASSWORD) {
    res.status(200).json({data: "ok"});
  } else {
    res.status(200).json({data: "failed"});
  }
});

module.exports = router;

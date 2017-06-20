
var express = require('express');
var router = express.Router();

 var api_disalert_set = require('./disalert_set.logic');
 router.use(api_disalert_set.router);

 var api_disalert_details = require('./disalert_details.logic');
 router.use(api_disalert_details.router);

 var api_disalert_clear = require('./disalert_clear.logic');
 router.use(api_disalert_clear.router);



module.exports.router = router;

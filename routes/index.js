var express = require('express');
var logService = require('../services/log-service');
var router = express.Router();

router.post('/log', function(req, res, next) {
    logService.insertRecord([req.body.partId], req.body.oldHeader, req.body.newHeader);
    res.end("");
});
router.post('/log-group', function(req, res, next) {
    logService.insertRecord(req.body.partIds, req.body.oldHeader, req.body.newHeader);
    res.end("");
});

module.exports = router;

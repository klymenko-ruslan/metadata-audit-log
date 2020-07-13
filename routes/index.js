var express = require('express');
var logService = require('../services/log-service');
var router = express.Router();

router.post('/log', function(req, res, next) {
    partIds = (typeof req.body.partId === 'undefined') ? [] : [req.body.partId];
    res.setHeader('Content-Type', 'application/json');
    res.end(logService.insertRecord(partIds, req.body.oldHeader, req.body.newHeader, req.body.action));

});
router.post('/log-group', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(logService.insertRecord(req.body.partIds, req.body.oldHeader, req.body.newHeader, req.body.action));
});

module.exports = router;

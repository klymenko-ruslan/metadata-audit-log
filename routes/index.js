var express = require('express');
var logService = require('../services/log-service');
var router = express.Router();

router.post('/log/interchange/create', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(logService.create(req.body));

});
router.post('/log/interchange/add', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.add(req.body).then(response => {
        res.end(response);
    });

});
router.post('/log/interchange/leave', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.leave(req.body).then(response => {
        res.end(response);
    });


});
router.post('/log/interchange/merge', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.merge(req.body).then(response => {
        res.end(response);
    });
});

module.exports = router;

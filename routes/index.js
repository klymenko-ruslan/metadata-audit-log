var express = require('express');
var logService = require('../services/log-service');
var router = express.Router();

router.post('/log/create', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(logService.create(req.body));

});
router.post('/log/add', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.add(req.body).then(response => {
        res.end(response);
    });

});
router.post('/log/leave', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.leave(req.body).then(response => {
        res.end(response);
    });


});
router.post('/log/merge', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    logService.merge(req.body).then(response => {
        res.end(response);
    });
});

module.exports = router;

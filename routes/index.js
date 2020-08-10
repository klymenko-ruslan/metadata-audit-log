var express = require('express');
var logService = require('../services/log-service');
var router = express.Router();

router.post('/log/interchange/create', function(req, res, ) {
    try {
        res.setHeader('Content-Type', 'application/json');
        logService.create(req.body).then(response => {
            res.end(response);
        }).catch(err => sendErrorResponse(res, err));
    } catch(e) {
        console.log(e);
    }

});
router.post('/log/interchange/add', function(req, res,) {
    try {
        res.setHeader('Content-Type', 'application/json');
        logService.add(req.body).then(response => {
            res.end(response);
        }).catch(err => sendErrorResponse(res, err));
    } catch(e) {
        console.log(e);
    }
});
router.post('/log/interchange/leave', function(req, res, ) {
    try {
        res.setHeader('Content-Type', 'application/json');
        logService.leave(req.body).then(response => {
            res.end(response);
        }).catch(err => sendErrorResponse(res, err));
    } catch(e) {
        console.log(e);
    }


});
router.post('/log/interchange/merge', function(req, res, ) {
    try {
        res.setHeader('Content-Type', 'application/json');
        logService.merge(req.body).then(response => {
            res.end(response);
        }).catch(err => sendErrorResponse(res, err));
    } catch(e) {
        console.log(e);
    }
});

function sendErrorResponse(res, err) {
    console.error(`Error: ${err}`);
    return res.status(400).send({
        msg: err
    })
}

module.exports = router;

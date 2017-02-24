
process.env.DEBUG = 'express-deprecate';

const express = require('express');

const app = express();

const config = {
    statusCode: 301,
    statusMessage: 'Deprecated',
    availableVersions: {
        "v1": {
            "deprecated": true
        },
        "v2": {
            "deprecated": true,
        },
        "v3": {
            "deprecated": false
        }
    }    
};

const apiVersioningV1 = require('./index')('v1', config);

// enable API versioning
app.use(apiVersioningV1);

app.get('/v1/test', function(req, res) {

    res.send();
});

app.get('/v1/test2', function(req, res) {

    res.send();
});

app.get('/v2/test', function(req, res) {

    res.send();
});

app.listen(3000, function() {

    console.info('Server started');
});
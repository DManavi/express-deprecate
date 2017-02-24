'use strict';

// load debug module
const debug = require('debug')('express-deprecate');

debug('Initializing express-deprecate...');

debug('Loading extend module...');

// load extend module
const extend = require('extend');

// create default configuration
const defaultConfig = {

    statusCode: 410, // HTTP gone,
    statusMessage: 'Deprecated API', // HTTP response reason phrase
    body: null, // HTTP response body
    
    sendDirectResponse: true, // Send direct HTTP response

    deprecatedResponseHeader: 'X-API-Deprecated',
    deprecatedVersionsHeader: 'X-API-Deprecated-Versions',
    availableVersionsHeader: 'X-API-Available-Versions',

    separator: ',',

    // body: {

    // },

    // availableVersions = {
    //     "v1": {
    //         "deprecated": true
    //     },
    //     "v2": {
    //         "deprecated": false,
    //     },
    //     "v3": {
    //         "deprecated": false
    //     }
    // }
};

// show default configuration
debug(`Default configuration\r\n${JSON.stringify(defaultConfig)}`);

function isDeprecated(version, userConfig) {

    // get API version by id
    var apiVersion = userConfig.availableVersions[version];

    debug(`Is deprecated: ${version}`);

    debug(`Deprecated: ${!!apiVersion.deprecated}`);

    // return deprecated flag
    return !!apiVersion.deprecated;
}

function getDeprecatedApis(config) {

    return filterApis(config, true);
}

function getAvailableApis(config) {

    return filterApis(config, false);
}

function filterApis(config, deprecated) {

    debug('Filtering APIs...');

    // create list of API versions
    var apiVersions = [];

    for(var v in config.availableVersions) {

        // assign short name to version
        var version = config.availableVersions[v];

        debug(`Version ${v}\r\n${JSON.stringify(version)}`);

        // if API version deprecated
        if(!!version.deprecated == deprecated) {

            // push version in output list
            apiVersions.push(v);
        }

        debug(`Deprecated: ${!!version.deprecated}`);
    }

    debug(`API versions\r\n${JSON.stringify(apiVersions)}`);

    // return list of API versions
    return apiVersions;
}

module.exports = function(version, userConfig) {

    return function(req, res, next) {

        debug('Processing HTTP request...');

        // if provided version is not an string
        if(typeof version !== typeof '') {

            debug('No valid API version defined.');

            // throw exception
            throw 'No valid API version defined.';
        }

        // get default configuration
        var config = defaultConfig;

        // merge default and user configuration together
        extend(config, userConfig);

        debug(`Configuration\r\n${JSON.stringify(config)}`);

        // if no API version defined
        if(Object.keys(config.availableVersions).length < 1) {

            debug('No API version defined');

            // throw exception
            throw 'No API version defined';
        }

        // deprecated flag
        var deprecated = isDeprecated(version, config);

        // get deprecated API versions
        var deprecatedApis = getDeprecatedApis(config);

        // if no deprecated API exist
        if(deprecatedApis.length > 0) {

            // set deprecated header
            res.set(config.deprecatedVersionsHeader, deprecatedApis.join(config.separator));
        }

        // get available API versions
        var availableApis = getAvailableApis(config);

        // if any API version exist
        if(availableApis.length > 0) {

            // set available APIs in header
            res.set(config.availableVersionsHeader, availableApis.join(config.separator));
        }

        // if direct response requested
        if(config.sendDirectResponse && deprecated) {

            // set status code
            res.statusCode = config.statusCode;

            // set reason phrase
            res.statusMessage = config.statusMessage;

            // if response body defined
            if(config.body) {

                // send body
                res.send(config.nody);
            }
            else { // no body defined

                // send HTTP empty
                res.send();
            }
        }
        else {

            // call next middleware
            next();
        }
    };
};
/**
 * @class Middleware
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */

'use strict';
const Middleware = function(options = {}) {
    const middleware = this;
    const log = options.log;

    const apikey = options.apikey;

    // verify the correct api access key
    this.checkAPIKey = function(req, resp, next) {
        const key = req.headers[ 'x-api-key' ];
        const isvalid = (key === apikey);

        if (isvalid) {
            next();
        } else {
            log.warn('invalid api key:', key);
            next();
        }
    };

    this.shutdown = function(req, resp, next) {
        if (req.method === 'POST' && req.path === '/shutdown' && req.ip.indexOf('127.0.0.1')) {
            resp.set('Content-Type', 'text/plain');
            resp.send(new Buffer('shutting service down...'));

            log.warn('shutdown request, scheduling kill process for pid: ', process.pid);

            process.setTimeout(() => {
                console.log('>>> kill process:', process.pid);
                process.kill( process.pid );
            }, 250);
        } else {
            next();
        }
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('middleware must be constructed with a log object');
        }
        if (!apikey) {
            throw new Error('middleware must be constructed with an API access key');
        }
    }());
};

module.exports = Middleware;

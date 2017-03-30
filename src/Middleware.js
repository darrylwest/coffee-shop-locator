/**
 * @class Middleware
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */

const Middleware = function(options) {
    'use strict';

    const routers = this,
        log = options.log;

    // no middleware was implemented...

    // construction validation
    (function() {
        if (!log) {
            throw new Error('router must be constructed with a log object');
        }
    }());
};

module.exports = Middleware;

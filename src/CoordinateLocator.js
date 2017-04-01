/**
 * CoordinateLocator - a service to fetch coordinates from a given street address, city, state, zip
 *
 * @author darryl.west <darryl.west@raincitysoftware.com>
 * @created 2017-04-01 14:36:58
 */
'use strict';

const CoordinateLocator = function(options = {}) {
    const locator = this;
    const log = options.log;
    const https = options.https || require('https');
    const cache = options.cache || new Map();

    // find and return the coordinates given the address; if found, cleanup and return the address
    this.findCoordinates = function(street, city = 'SF', state = 'CA', zip = '') {
        const address = `${street}, ${city}, ${state}, ${zip}`;
        log.info(`find coordinates for ${address}`);

        const opts = {
            method: 'GET',
            port: 443,
            hostname: 'maps.googleapis.com',
            path: `/maps/api/geocode/json?address=${escape(address)}`
        };

        log.info('query coords with opts: ', JSON.stringify(opts));

        return new Promise((resolve, reject) => {
            const chunks = [];
            const errors = [];
            const req = https.request(opts, resp => {
                log.info(`status code: ${resp.statusCode}`);

                resp.on('data', (data) => {
                    chunks.push(data);
                });
            });

            req.on('err', (err) => {
                log.error(err);
                errors.push(err);
            });

            req.on('close', () => {
                log.info('conn closed...');
                const message = chunks.join('');

                const obj = JSON.parse(message);
                if (errors.length === 0 && obj.status === 'OK' && obj.results.length > 0) {
                    // assume the first one in list...
                    const result = {};
                    const first = obj.results.pop();

                    /* jshint -W106 */
                    result.address = first.formatted_address;
                    /* jshint +W106 */

                    result.location = first.geometry.location;
                    result.lat = result.location.lat;
                    result.lng = result.location.lng;

                    // any others left?
                    if (obj.results.length > 0) {
                        result.list = obj.results;
                        log.info('returning multiple hits: ', result.list.length);
                    }

                    return resolve(result);
                } else {
                    const err = new Error(`unable to locate coordinates for address ${address} ${errors.join(';')}`);
                    log.warn(err.message);
                    return reject(err);
                }
            });

            req.end();
        });
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('shop dao must be constructed with a log object');
        }
    }());
};

module.exports = CoordinateLocator;

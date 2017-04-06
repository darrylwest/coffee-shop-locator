//
// @class InsertShop - client side insert
//
// @author darryl.west <darryl.west@raincitysoftware.com>
// @created 2017-04-05 21:28:51
//
'use strict';

const http = require('http');

const ShopClient = function(options = {}) {
    const client = this;
    const log = options.logger;
    const hostname = options.hostname;
    const port = options.port;

    // return through a callback
    this.findById = function(id, callback) {
        const opts = {
            method: 'GET',
            hostname: hostname,
            port: port,
            path: `/coffeeshop/${id}`
        };

        const chunks = [];
        const req = http.request(opts, resp => {
            resp.on('data', data => {
                chunks.push(data);
            });
        });

        req.once('error', err => {
            log.error(err);
            return callback(err);
        });

        req.on('close', () => {
            const message = chunks.join('');
            const obj = JSON.parse(message);
            return callback(null, obj);
        });

        req.end();
    };

    // return a promise
    this.insert = function(shop) {
    };

    // return a promise
    this.update = function(shop) {
    };

    // return a promise
    this.delete = function(shop) {
    };
};

module.exports = ShopClient;


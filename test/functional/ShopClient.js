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

    const createOptions = function(method, body) {
        const opts = {
            method: method.toUpperCase(),
            hostname: hostname,
            port: port,
            path: '/coffeeshop',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            opts.headers[ 'Content-Length' ] = Buffer.byteLength(body);
        }

        return opts
    };

    // return through a callback
    this.findById = function(id, callback) {
        const opts = createOptions('get');
        opts.path = `/coffeeshop/${id}`;

        let message;
        let statusCode;
        let statusMessage;
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

        req.on('response', resp => {
            // console.log(resp.headers);
            // console.log(resp.statusCode, resp.statusMessage);
            statusCode = resp.statusCode;
            statusMessage = resp.statusMessage;
        });

        req.on('close', () => {
            const message = chunks.join('');
            if (statusCode === 200) {
                return callback(null, JSON.parse(message));
            } else {
                return callback(new Error(statusMessage));
            }
        });

        req.end();
    };

    this.insert = function(model, callback) {
        const opts = createOptions('post');
        const chunks = [];
        const req = new http.ClientRequest(opts);

        req.once('error', err => {
            log.error(err);
            callback(err);
        });

        req.on('response', resp => {
            resp.on('data', chunk => {
                chunks.push(chunk);
            });
        });

        req.on('close', () => {
            const message = chunks.join();
            callback(null, JSON.parse(message));
        });

        req.end(JSON.stringify(model));
    };

    this.update = function(shop) {
    };

    this.delete = function(shop) {
    };
};

module.exports = ShopClient;


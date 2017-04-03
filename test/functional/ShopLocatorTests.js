/**
 * @class Shop Locator functional tests
 *
 * @author darryl.west <darryl.west@raincitysoftware.com>
 * @created 2017-04-02 16:53:30
 */

const should = require('chai').should();
const http = require('http');
const MockLogger = require('simple-node-logger').mocks.MockLogger;

describe('ShopLocatorService', function() {
    'use strict';

    const port = 3002;

    describe('coffeeshop', function() {
        const route = '/coffeeshop';

        describe('findById', function() {
            const createOptions = function(id) {
                const opts = {
                    method: 'GET',
                    hostname: 'localhost',
                    port: port,
                    path: `${route}/${id}`
                };

                return opts;
            };

            it('should find a known shop by id', function(done) {
                const chunks = [];
                const id = 20;
                const opts = createOptions(id);
                const req = http.request(opts, (res) => {
                    res.on('data', data => {
                        chunks.push(data);
                    });
                });

                req.on('error', err => {
                    console.log(err);
                    should.not.exist(err);
                });

                req.on('close', () => {
                    const message = chunks.join('');
                    const obj = JSON.parse(message);

                    obj.status.should.equal('ok');
                    const shop = obj.data;
                    shop.id.should.equal(id);
                    shop.name.should.equal('Mazarine Coffee');

                    done();
                });

                req.end();
            });

            it('should return an error for a non-know shop id');
        });
    }); 

    describe('locator', function() {
        const route = '/locator';

        it('should find a known coffee shop from the known address');
    });
});


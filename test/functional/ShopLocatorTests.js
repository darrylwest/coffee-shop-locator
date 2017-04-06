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

        describe.only('insert/update', function() {
            const createOptions = function(method) {
                const opts = {
                    hostname: 'localhost',
                    port: port,
                    path: '/coffeeshop',
                    method: method.toUpperCase(), // post = insert, put = update
                    headers: {
                        'Content-Type':'application/json'
                    }
                };

                return opts;
            };

            it('should insert the new model and return id then return the full model on subsequent find', function(done) {
                // insert a new shop
                const model = {
                    name:'New Age Coffee',
                    address: '4545 State Street, Anywhere, CA',
                    lat: 10.2,
                    lng: 43.3
                };
                const opts = createOptions('post');

                const chunks = [];

                const req = new http.ClientRequest(opts);
                req.end(JSON.stringify(model));

                req.on('error', err => {
                    console.log(err);
                    should.not.exist(err);
                });

                req.on('response', resp => {
                    resp.on('data', chunk => {
                        chunks.push(chunk);
                    });
                });

                req.on('close', () => {
                    const message = chunks.join();
                    console.log(message);
                    done();
                });

                // try to read back to verify model
            });

            it('should reject an insert request when shop is not valid');

            it('should update an existing shop');
            it('should reject an update request when shop is not valid');

            it('should delete an existing shop');
            it('should reject a delete request for a non-known shop');
        });
    }); 

    describe('locate/nearest', function() {
        const route = '/locate/nearest';
        const createOptions = function(address) {
            const opts = {
                method: 'GET',
                hostname: 'localhost',
                port: port,
                path: `${route}?address=${escape(address)}`
            };

            return opts;
        };

        it('should find a known coffee shop from the known address 535 Mission', function(done) {
            const chunks = [];
            const address = '535 Mission St., San Francisco, CA';
            const opts = createOptions(address);

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
                // console.log(shop);
                shop.id.should.equal(16);

                done();
            });

            req.end();

        });
    });
});


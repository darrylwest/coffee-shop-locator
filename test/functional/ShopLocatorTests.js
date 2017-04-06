/**
 * @class Shop Locator functional tests
 *
 * @author darryl.west <darryl.west@raincitysoftware.com>
 * @created 2017-04-02 16:53:30
 */

const should = require('chai').should();
const http = require('http');
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const ShopClient = require('./ShopClient');

describe('ShopLocatorService', function() {
    'use strict';

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('ShopClient');
        opts.hostname = 'localhost';
        opts.port = 3002;

        return opts;
    };

    describe('coffeeshop', function() {
        const client = new ShopClient(createOptions());

        describe.only('findById', function() {
            it('should find a known shop by id', function(done) {
                const id = 20;
                const now = Date.now() - 1;
                client.findById(id, (err, resp) => {
                    should.not.exist(err);
                    should.exist(resp);

                    resp.status.should.equal('ok');
                    resp.ts.should.be.above(now);
                    resp.version.should.equal('1.0');
                    resp.data.should.be.a('object');

                    const shop = resp.data;
                    shop.id.should.equal(id);

                    done();
                });
            });

            it('should return an error for a non-know shop id', function(done) {
                const id = 200000;
                const now = Date.now() - 1;
                client.findById(id, (err, resp) => {
                    should.exist(err);
                    should.not.exist(resp);

                    err.message.should.equal('Not Found');

                    done();
                });
            });
        });

        describe('insert/update', function() {
            it.skip('should insert the new model and return id then return the full model on subsequent find', function(done) {
                // insert a new shop
                const model = {
                    name:'New Age Coffee',
                    address: '4545 State Street, Anywhere, CA',
                    lat: 10.2,
                    lng: 43.3
                };

                const findCallback = function(err, resp) {
                    console.log(err);
                    console.log(resp);

                    should.not.exist(err);
                    should.exist(resp);

                    done();
                };

                const now = Date.now() - 1;
                const insertCallback = function(err, resp) {
                    should.not.exist(err);
                    should.exist(resp);

                    resp.status.should.equal('ok');
                    resp.ts.should.be.above(now);
                    resp.version.should.equal('1.0');
                    resp.data.should.be.a('object');

                    const shop = resp.data;
                    shop.id.should.above(50);
                    shop.name.should.equal(model.name);
                    shop.address.should.equal(model.address);
                    shop.lat.should.equal(model.lat);
                    shop.lng.should.equal(model.lng);
                    shop.status.should.equal('active');

                    client.findById(shop.id, findCallback);
                };

                client.insert(model, insertCallback);

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
                port: 3002,
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


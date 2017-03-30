/**
 * @class HandlersTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const MockExpress = require('./MockExpress');
const TestGeoData = require('./TestGeoData');
const Handlers = require('../src/Handlers');
const ShopDao = require('../src/ShopDao');

describe('Handlers', function() {
    'use strict';

    const TOTAL_ITEMS = 48;
    const testGeoData = new TestGeoData();

    const dao = new ShopDao({log:MockLogger.createLogger('ShopDao')});
    dao.initData();

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('Handlers');
        opts.dao = dao;

        return opts;
    };

    describe('#instance', function() {
        const handlers = new Handlers( createOptions() );
        const methods = [
            'findShopById',
            'findNearestShop',
            'createPayload'
        ];

        it('should create an instance of Handlers', function() {
            should.exist( handlers );
            handlers.should.be.instanceof( Handlers );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( handlers ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                handlers[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('findNearestShop', function() {
        const handlers = new Handlers( createOptions() );
        const mockExpress = new MockExpress();
        const requestObject = {
            method:'GET',
            url:'/shop/v0/items/geo/',
            params:{
                lat:36.4433,
                long:-111.4432
            }
        };

        it('should return items within a specified geo location');
        it('should return zero rows if geo location is out of range');
    });

    describe('findShopById', function() {
        const handlers = new Handlers( createOptions() );
        const knownId = '53fbe21c456e74467b000006';

        it.skip('should find a known shop item by id', function(done) {
            const obj = {
                mehtod:'GET',
                url:`/shop/v0/item/${knownId}`,
                params:{
                    id: knownId
                }
            };

            const mockExpress = new MockExpress();
            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                // console.log(payload);
                should.exist( payload );
                // for v0, payload is the item
                const item = payload;

                item.id.should.equal( knownId );
                item.createdAt.toJSON().should.equal('2014-08-26T01:25:48.754Z');
                item.price.should.equal(20);
                item.userId.should.equal('53f6c9c96d1944af0b00000b');
                item.status.should.equal('removed');
                item.description.should.equal('');
                item.loc.length.should.equal(2);
                
                let [lat, long] = item.loc;
                lat.should.equal(36.15517247887697);
                long.should.equal(-115.14484161837342);
                
                done();
            };

            // handlers.findItemById(request, response);
            done();
        });

        it('should return an error if item not found');
    });

    describe('createPayload', function() {
        const handlers = new Handlers( createOptions() );

        it('should create a formal payload object given one or more data models', function() {
            const model = {id:123,name:'flarb'};
            const payload = handlers.createPayload('ok', model);

            should.exist(payload);
            payload.status.should.equal('ok');
            payload.ts.should.be.above(Date.now() - 10);
            payload.version.should.equal('1.0');
            payload.results.should.equal(model);
        });
    });
});

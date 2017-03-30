/**
 * @class HandlersTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MockExpress = require('./MockExpress'),
    TestGeoData = require('./TestGeoData'),
    Handlers = require('../lib/Handlers'),
    ShopDao = require('../lib/ShopDao');

describe('Handlers', function() {
    'use strict';

    const TOTAL_ITEMS = 100;
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
            'queryByUserId',
            'queryAll',
            'queryByGeo',
            'findItemById',
            'createPayload'
        ];

        it('should create an instance of Handlers', function() {
            should.exist( handlers );
            handlers.should.be.instanceof( Handlers );
        });

        it('should have all known methods by size and type', function() {
            dash.functions( handlers ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                handlers[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('queryByUserId', function() {
        const handlers = new Handlers( createOptions() );
        const knownUserId = '53fe114b56ef467e68000007';

        it('should return a known set of items for the known user', function(done) {
            const obj = {
                mehtod:'GET',
                url:`/shop/v0/items/${knownUserId}`,
                params:{
                    id: knownUserId
                }
            };

            const mockExpress = new MockExpress();
            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                // console.log(payload);
                should.exist( payload );
                // for v0, payload is the item
                const list = payload;

                list.length.should.equal(16);
                
                done();
            };

            handlers.queryByUserId(request, response);
        });
    });

    describe('queryAll', function() {
        const handlers = new Handlers( createOptions() );
        const mockExpress = new MockExpress();
        const requestObject = {
            method:'GET',
            url:'/shop/v0/items/all/sort/',
            params:{
                sort:'',
                order:'asc'
            }
        };

        it('should return all rows sorted by created at ascending', function(done) {
            const obj = dash.clone(requestObject);
            obj.url += 'created/asc';
            obj.params.sort = 'created';
            obj.params.order = 'asc';

            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist(payload);

                const list = payload;
                list.length.should.equal(TOTAL_ITEMS);

                // TODO verify the sort order...

                done();
            };

            handlers.queryAll(request, response);
        });

        it('should return all rows sorted by created at descending', function(done) {
            const obj = dash.clone(requestObject);
            obj.url += 'created/desc';
            obj.params.sort = 'created';
            obj.params.order = 'desc';

            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist(payload);

                const list = payload;
                list.length.should.equal(TOTAL_ITEMS);

                // TODO verify the sort order...

                done();
            };

            handlers.queryAll(request, response);
        });

        it('should return all rows sorted by price ascending', function(done) {
            const obj = dash.clone(requestObject);
            obj.url += 'created/asc';
            obj.params.sort = 'price';
            obj.params.order = 'asc';

            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist(payload);

                const list = payload;
                list.length.should.equal(TOTAL_ITEMS);

                // TODO verify the sort order...

                done();
            };

            handlers.queryAll(request, response);
        });

        it('should return all rows sorted by price descending', function(done) {
            const obj = dash.clone(requestObject);
            obj.url += 'price/desc';
            obj.params.sort = 'price';
            obj.params.order = 'desc';

            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist(payload);

                const list = payload;
                list.length.should.equal(TOTAL_ITEMS);

                // TODO verify the sort order...

                done();
            };

            handlers.queryAll(request, response);
        });
    });

    describe('queryByGeo', function() {
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

        it('should return items within a specified geo location', function(done) {
            const target = testGeoData.berkeley();
            const obj = dash.clone(requestObject);
            obj.url += `${target.loc[0]}/${target.loc[1]}`;
            obj.params.lat = target.loc[0];
            obj.params.long = target.loc[1];

            const request = mockExpress.createRequest(obj);
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist(payload);

                const list = payload;
                list.length.should.equal(target.hits);

                done();
            };

            handlers.queryByGeo(request, response);
        });

        it('should return zero rows if geo location is out of range');
    });

    describe('findItemById', function() {
        const handlers = new Handlers( createOptions() );
        const knownId = '53fbe21c456e74467b000006';

        it('should find a known shop item by id', function(done) {
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

            handlers.findItemById(request, response);
        });

        it('should return an error if item not found');
    });

    describe('createPayload', function() {
        it('should create a formal payload object given one or more data models');
    });
});

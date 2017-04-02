/**
 * @class HandlersTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const MockExpress = require('./MockExpress');
const Handlers = require('../src/Handlers');
const ShopModel = require('../src/ShopModel');
const BootStrap = require('../src/BootStrap');

describe('Handlers', function() {
    'use strict';

    const bootStrap = new BootStrap({
        app:new MockExpress(),
        log:MockLogger.createLogger('BootStrap'),
        createLogger:MockLogger.createLogger
    });

    // load the reference data
    const dao = bootStrap.createShopDao();
    const [ db, map ] = dao.initData();
    const TOTAL_ITEMS = db.length;

    const createOptions = function() {
        const opts = {};

        opts.log = MockLogger.createLogger('Handlers');
        opts.dao = dao;
        opts.coordinateLocator = bootStrap.createCoordinateLocator();

        return opts;
    };

    describe('#instance', function() {
        const handlers = new Handlers( createOptions() );
        const methods = [
            'findShopById',
            'insertShop',
            'updateShop',
            'deleteShop',
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
        const mockExpress = new MockExpress();
        const handlers = new Handlers( createOptions() );
        const knownShop = db[4];

        it('should find a known shop item by id', function(done) {
            const response = mockExpress.createResponse();
            response.send = function(payload) {
                should.exist( payload );
                payload.status.should.equal('ok');
                const shop = payload.data;

                shop.id.should.equal( knownShop.id );
                shop.name.should.equal(knownShop.name);
                shop.address.should.equal(knownShop.address);
                shop.version.should.equal(0);
                shop.status.should.equal(ShopModel.ACTIVE);
                
                done();
            };

            handlers.findShopById(mockExpress.createGetRequest(knownShop.id), response);
        });

        it('should return an error if item not found', function(done) {
            const response = mockExpress.createResponse();
            response.sendStatus = function(status) {
                status.should.equal(404);
                done();
            };
            handlers.findShopById(mockExpress.createGetRequest(4323443), response);
        });
    });

    describe('insert/update/delete', function() {
        const handlers = new Handlers( createOptions() );

        it('should insert a new coffee shop and return the new id');

        it('should reject a bad insert request');

        it('should update an existing coffee shop and return the id');

        it('should reject a bad update request');

        it('should delete an existing coffee shop and return the id', function(done) {
            const shop = db[23];
            // console.log(shop);

            done();
        });

        it('should reject a bad delete request');
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
            payload.data.should.equal(model);
        });
    });
});

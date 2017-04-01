/**
 * @class ShopDaoTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const geolib = require('geolib');
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const TestGeoData = require('./TestGeoData');
const ShopDao = require('../src/ShopDao');
const ShopModel = require('../src/ShopModel');

describe('ShopDao', function() {
    'use strict';

    const coffeeShops = require('./fixtures/shops.json');
    const testGeoData = new TestGeoData();

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('ShopDao');
        
        return opts;
    };
    
    // instance tests verify that all public signatures are correct
    describe('#instance', function() {
        const dao = new ShopDao(createOptions());
        const methods = [
            'findById',
            'update',
            'prepareForUpdate',
            'validate',
            'createNextId',
            'queryByGeo',
            'locToGeo',
            'initData',
            'parseCSVFile',
            'getCount'
        ];

        it('should create an instance of ShopDao', function() {
            should.exist( dao );
            dao.should.be.instanceof( ShopDao );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( dao ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                dao[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('initData', function() {
        const dao = new ShopDao(createOptions());
        let maxid = 0;

        it('should initialize the coffee shop data from csv file and return list of shops', function() {
            const [ db, idmap ] = dao.initData();
            should.exist( db );
            should.exist( idmap );
            db.length.should.equal( 48 );
            idmap.size.should.equal( db.length );

            db.forEach(item => {
                should.exist( item.id );

                item.id.should.be.a('number');

                item.dateCreated.should.be.a('Date');
                item.lastUpdated.should.be.a('Date');
                item.version.should.be.a('number');

                item.name.should.be.a('string');
                item.address.should.be.a('string');
                item.lat.should.be.a('number');
                item.lng.should.be.a('number');

                item.status.should.equal('active');

                if (item.id > maxid) {
                    maxid = item.id;
                }

                const mappedItem = idmap.get( item.id );
                mappedItem.should.equal( item );
            });
        });

        it('should have a valid next id number after initialization', function() {
            // verify that the id sequence is correct
            const nextid = dao.createNextId();
            nextid.should.be.above(maxid);
            nextid.should.equal(maxid + 1);
        });
    });

    describe('createNextId', function() {
        const dao = new ShopDao(createOptions());

        it('should return the next id starting with 1 if external data is not loaded', function() {
            let id = dao.createNextId();
            id.should.equal(1);
            id = dao.createNextId();
            id.should.equal(2);
        });
    });

    describe('findById', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should return a single coffee shop for a given id', function(done) {
            const knownId = 1;
                
            dao.findById(knownId).then(shop => {
                shop.id.should.equal(knownId);
                shop.dateCreated.should.be.a('Date');
                shop.lastUpdated.should.be.a('Date');
                shop.dateCreated.toJSON().should.equal(shop.lastUpdated.toJSON());
                shop.version.should.equal(0);

                shop.name.should.equal('Equator Coffees & Teas');
                shop.address.should.equal('986 Market St');
                shop.lat.should.equal(37.782394430549445);
                shop.lng.should.equal(-122.40997343121123);
                shop.status.should.equal('active');

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
            });
        });

        it('should return an error if coffee shop is not found for given id', function(done) {
            const badid = 50000;
            dao.findById(badid).then(shop => {
                console.log(shop);
                should.not.exist(shop);
            }).catch(err => {
                should.exist(err);
                err.message.indexOf('not found').should.be.above(0);
                done();
            });
        });
    });

    describe('update', function() {
        const dao = new ShopDao(createOptions());

        it('should prepare a new model for insert', function() {
            const shop = new ShopModel(coffeeShops[1]);

            should.not.exist(shop.id);
            should.not.exist(shop.dateCreated);
            should.not.exist(shop.lastUpdated);

            dao.prepareForUpdate(shop);
            should.exist(shop.id);
            shop.id.should.equal(1);
            shop.dateCreated.should.be.a('Date');
            shop.lastUpdated.should.be.a('Date');
            shop.dateCreated.toJSON().should.equal(shop.lastUpdated.toJSON());
            shop.version.should.equal(0);

            shop.status.should.equal('active');
        });

        it('should prepare an existing model for update', function() {
            const shop = new ShopModel(coffeeShops[0]);
            shop.name = 'This is a new name';
            shop.dateCreated = shop.lastUpdated = new Date(Date.now() - 1000);

            dao.prepareForUpdate(shop);

            should.exist(shop.id);
            shop.id.should.equal(39);
            shop.dateCreated.should.be.a('Date');
            shop.lastUpdated.should.be.a('Date');
            shop.dateCreated.getTime().should.be.below(shop.lastUpdated.getTime());
            shop.version.should.equal(11);
        });

        it('should insert a new model', function(done) {
            const shop = new ShopModel(coffeeShops[1]);
            const count = dao.getCount();

            dao.update(shop).then(model => {
                should.exist(model.id);
                model.id.should.be.above(0);
                model.dateCreated.should.be.a('Date');
                model.lastUpdated.should.be.a('Date');
                model.dateCreated.toJSON().should.equal(model.lastUpdated.toJSON());
                model.version.should.equal(0);

                model.name.should.equal(shop.name);
                model.address.should.equal(shop.address);
                model.lat.should.equal(shop.lat);
                model.lng.should.equal(shop.lng);
                model.status.should.equal(shop.status);

                // yes, it was inserted
                dao.getCount().should.equal(count + 1);

                done();
            }).catch(err => {
                should.not.exist(err);
            });
        });

        it('should update an existing model');
    });

    describe('validate', function() {
        const dao = new ShopDao(createOptions());

        it('should validate a valid model', function() {
            // known valid shop...
            const shop = new ShopModel(coffeeShops[0]);
            const errors = dao.validate(shop);
            errors.length.should.equal(0);
        });

        it('should return errors for missing name, address, lat/lng', function() {
            // known valid shop...
            const shop = new ShopModel(coffeeShops[0]);
            shop.name = null;
            shop.address = null;
            shop.lat = 0;
            shop.lng = 0;

            const errors = dao.validate(shop);
            errors.length.should.equal(4);
        });
    });

});

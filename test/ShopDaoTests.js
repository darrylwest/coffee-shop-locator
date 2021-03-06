/**
 * @class ShopDaoTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const ShopDao = require('../src/ShopDao');
const ShopModel = require('../src/ShopModel');

describe('ShopDao', function() {
    'use strict';

    const coffeeShops = require('./fixtures/shops.json');

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
            'delete',
            'prepareForUpdate',
            'validate',
            'createNextId',
            'findNearest',
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

                item.status.should.equal(ShopModel.ACTIVE);

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
                shop.status.should.equal(ShopModel.ACTIVE);

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

    describe('update/delete', function() {
        const dao = new ShopDao(createOptions());
        let shopList, shopMap;

        // load the data...
        before(done => {
            [ shopList, shopMap ] = dao.initData();
            done();
        });

        it('should prepare a new model for insert', function() {
            const model = new ShopModel(coffeeShops[1]);

            should.not.exist(model.id);
            should.not.exist(model.dateCreated);
            should.not.exist(model.lastUpdated);

            const shop = dao.prepareForUpdate(model);
            should.exist(shop.id);
            shop.id.should.equal(57);
            shop.dateCreated.should.be.a('Date');
            shop.lastUpdated.should.be.a('Date');
            shop.dateCreated.toJSON().should.equal(shop.lastUpdated.toJSON());
            shop.version.should.equal(0);

            shop.status.should.equal(ShopModel.ACTIVE);
        });

        it('should prepare an existing model for update', function() {
            const model = new ShopModel(coffeeShops[0]);
            model.name = 'This is a new name';
            model.dateCreated = model.lastUpdated = new Date(Date.now() - 1000);

            const shop = dao.prepareForUpdate(model);

            should.exist(shop.id);
            shop.id.should.equal(39);
            shop.dateCreated.should.be.a('Date');
            shop.lastUpdated.should.be.a('Date');
            shop.dateCreated.getTime().should.be.below(shop.lastUpdated.getTime());
            shop.version.should.equal(11);
        });

        it('should insert a new model and read it back', function(done) {
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

                // now read it back
                dao.findById(model.id).then(m => {
                    m.id.should.equal(model.id);
                    done();
                });
            }).catch(err => {
                should.not.exist(err);
            });
        });

        it('should insert multiple models and verify an increase in count', function(done) {
            const s1 = new ShopModel(coffeeShops[1]);
            const count = dao.getCount();

            dao.update(s1).then(m1 => {
                dao.getCount().should.equal(count + 1);
                m1.id.should.be.above(0);

                const s2 = new ShopModel(coffeeShops[1]);
                dao.update(s2).then(m2 => {
                    dao.getCount().should.equal(count + 2);
                    m2.id.should.be.above(m1.id);

                    done();
                });
            }).catch(err => {
                should.not.exist(err);
            });

        });

        it('should update an existing model', function(done) {
            const count = dao.getCount();
            const shop = new ShopModel(shopList[5]);

            dao.update(shop).then(model => {
                // update not insert
                dao.getCount().should.equal(count);
                model.name.should.equal(shop.name);
                model.version.should.equal(shop.version + 1);

                done();
            }).catch(err => {
                should.not.exist(err);
            });
        });

        it('should delete a valid model', function(done) {
            const count = dao.getCount();
            const shop = new ShopModel(shopList[18]);
            shop.lastUpdated = new Date(Date.now() - 12);

            dao.delete(shop).then(model => {
                dao.getCount().should.equal(count - 1);

                model.status.should.equal(ShopModel.DELETED);
                model.version.should.equal(shop.version + 1);
                model.lastUpdated.getTime().should.be.above(shop.lastUpdated.getTime());

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
            });
        });
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

    describe('findNearest', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should find the nearest to 535 Mission St', function(done) {

            // todo pull these from known address; this one is 535 Mission St
            const lat = 37.788866;
            const lng = -122.39821;

            dao.findNearest(lat, lng).then(shop => {
                should.exist(shop);

                shop.id.should.equal(16);

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
            });
        });

        it('should find the nearest to 252 Guerrero St, San Francisco, CA 94103, USA', function(done) {
            const lat = 37.7671252;
            const lng = -122.4245135;

            dao.findNearest(lat, lng).then(shop => {
                should.exist(shop);

                shop.id.should.equal(28);
                shop.name.should.equal('Four Barrel Coffee');

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
            });
        });

        it('should find the nearest to 2101 Sutter St', function(done) {
            const lat = 37.785727;
            const lng = -122.4350462;

            dao.findNearest(lat, lng).then(shop => {
                should.exist(shop);

                shop.id.should.equal(22);

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
            });
        });
    });

});

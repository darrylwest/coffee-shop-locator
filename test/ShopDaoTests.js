/**
 * @class ShopDaoTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should(),
    dash = require('lodash'),
    geolib = require('geolib'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    TestGeoData = require('./TestGeoData'),
    ShopDao = require('../lib/ShopDao');

describe('ShopDao', function() {
    'use strict';

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
            'assignSortOrder',
            'queryAll',
            'findById',
            'queryByUserId',
            'queryByGeo',
            'isDistanceWithin',
            'locToGeo',
            'initData'
        ];

        it('should create an instance of ShopDao', function() {
            should.exist( dao );
            dao.should.be.instanceof( ShopDao );
        });

        it('should have all known methods by size and type', function() {
            dash.functions( dao ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                dao[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('initData', function() {
        const dao = new ShopDao(createOptions());

        it('should initialize the data from json file and return list of items', function() {
            const [ db, idmap ] = dao.initData();
            should.exist( db );
            should.exist( idmap );
            db.length.should.equal( 100 );
            idmap.size.should.equal( 100 );
            db.forEach(item => {
                should.exist( item.id );
                item.id.length.should.equal(24);
                item.createdAt.should.be.instanceof( Date );
                item.price.should.be.above( -2 );
                item.price.should.be.below( 100001 );
                should.exist( item.status );
                item.loc.length.should.equal( 2 );

                const mappedItem = idmap.get( item.id );
                mappedItem.should.equal( item );
            });
            
        });
    });

    describe('assignSortOrder', function() {
        const dao = new ShopDao(createOptions());

        it('should assign a known sort function for created asc', function() {
            const fn = dao.assignSortOrder('created', 'asc');
            fn.should.be.a('function');
            fn.name.should.equal('sortByCreatedAtAsc');
        });

        it('should assign a known sort function for created desc', function() {
            const fn = dao.assignSortOrder('created', 'desc');
            fn.should.be.a('function');
            fn.name.should.equal('sortByCreatedAtDesc');
        });

        it('should assign a known sort function for price asc', function() {
            const fn = dao.assignSortOrder('price', 'asc');
            fn.should.be.a('function');
            fn.name.should.equal('sortByPriceAsc');
        });

        it('should assign a known sort function for price desc', function() {
            const fn = dao.assignSortOrder('price', 'desc');
            fn.should.be.a('function');
            fn.name.should.equal('sortByPriceDesc');
        });
    });

    describe('queryAll', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should return a query for all items sorted by create date ascending', function(done) {
            dao.queryAll(dao.assignSortOrder('created', 'asc')).then(list => {
                should.exist(list);
                list.length.should.equal( 100 );

                let dt;
                list.forEach(item => {
                    if (!dt) {
                        dt = item.createdAt.getTime();
                    } else {
                        dt.should.be.below(item.createdAt.getTime());
                    }
                });

                done();
            });
        });

        it('should return a query for all items sorted by create date descending', function(done) {
            dao.queryAll(dao.assignSortOrder('created', 'desc')).then(list => {
                should.exist(list);
                list.length.should.equal( 100 );

                let dt;
                list.forEach(item => {
                    if (!dt) {
                        dt = item.createdAt.getTime();
                    } else {
                        dt.should.be.above(item.createdAt.getTime());
                    }
                });

                done();
            });
        });

        it('should return a query for all items sorted by price ascending', function(done) {
            dao.queryAll(dao.assignSortOrder('price', 'asc')).then(list => {
                should.exist(list);
                list.length.should.equal( 100 );

                let price = Number.MIN_SAFE_INTEGER;
                list.forEach(item => {
                    if (price !== item.price) {
                        price.should.be.below(item.price);
                    }
                    
                    price = item.price;
                });

                done();
            });
        });

        it('should return a query for all items sorted by price descending', function(done) {
            dao.queryAll(dao.assignSortOrder('price', 'desc')).then(list => {
                should.exist(list);
                list.length.should.equal( 100 );

                let price = Number.MAX_SAFE_INTEGER;
                list.forEach(item => {
                    if (price !== item.price) {
                        price.should.be.above(item.price);
                    }
                    
                    price = item.price;
                });

                done();
            });
        });
    });

    describe('findById', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should return a single item by id', function(done) {
            const knownId = '53fbe21c456e74467b000006';

            dao.findById(knownId).then(item => {
                item.id.should.equal(knownId);
                item.userId.should.equal('53f6c9c96d1944af0b00000b');
                item.createdAt.toJSON().should.equal('2014-08-26T01:25:48.754Z');
                item.price.should.equal(20);
                item.status.should.equal('removed');
                item.description.should.equal('');
                item.loc.length.should.equal(2);
                
                let [lat, long] = item.loc;
                lat.should.equal(36.15517247887697);
                long.should.equal(-115.14484161837342);

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist( err );
                done();
            });
        });
    });

    describe('queryByUserId', function() {
        const knownUserId = '53fe114b56ef467e68000007';
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should return all items for a specific user', function(done) {
            // should return 16 items for this user...
            dao.queryByUserId(knownUserId).then(list => {
                list.length.should.equal(16);

                list.forEach(item => {
                    should.exist( item.id );
                    item.userId.should.equal(knownUserId);
                    item.loc.length.should.equal(2);
                });

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
                done();
            });
        });

        it('should return zero items for an unknown user', function(done) {
            // should return 16 items for this user...
            dao.queryByUserId('my-bad-user-id').then(list => {
                dash.isArray( list ).should.equal( true );
                list.length.should.equal(0);

                done();
            }).catch(err => {
                console.log(err);
                should.not.exist(err);
                done();
            });
        });
    });

    describe('queryByGeo', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();
        const maxkm = 50 * 1.609344;

        function calcDistance(targetloc, itemloc) {
            const tgeo = dao.locToGeo(targetloc);
            const igeo = dao.locToGeo(itemloc);
            const dist = geolib.getDistance(tgeo, igeo);
            return dist / 1000;
        }

        it('should return items located within 50 miles of las vegas', function(done) {
            let target = testGeoData.lasvegas();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );

                    if (dist > 10) {
                        // console.dir(item.loc);
                    }
                });

                done();
            });
        });

        it('should return items located within 50 miles of berkeley', function(done) {
            let target = testGeoData.berkeley();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );
                });

                done();
            });
        });

        it('should return items located within 50 miles of oakland', function(done) {
            let target = testGeoData.oakland();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );
                });

                done();
            });
        });

        it('should return items located within 50 miles of san francisco', function(done) {
            let target = testGeoData.sanfrancisco();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );
                });

                done();
            });
        });

        it('should return items located within 50 miles of cancun mx', function(done) {
            let target = testGeoData.cancun();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );
                });

                done();
            });
        });

        it('should return zero items located within 50 miles of new york', function(done) {
            let target = testGeoData.newyork();
            
            dao.queryByGeo(target.loc).then(list => {
                should.exist(list);
                list.length.should.equal( target.hits );

                list.forEach(item => {
                    const dist = calcDistance(target.loc, item.loc);
                    dist.should.be.below( maxkm );
                });

                done();
            });
        });
    });
});

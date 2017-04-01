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
            'findById',
            'update',
            'prepareForUpdate',
            'createNextId',
            'queryByGeo',
            'locToGeo',
            'initData',
            'parseCSVFile'
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

        it('should return the next id', function() {
            let id = dao.createNextId();
            id.should.equal(1);
            id = dao.createNextId();
            id.should.equal(2);
        });
    });

    describe('findById', function() {
        const dao = new ShopDao(createOptions());
        dao.initData();

        it('should return a single coffee shop for a given id');
        it('should return an error if coffee shop is not found for given id');
    });

});

/**
 * CoordinateLocator service tests
 *
 * @author darryl.west <darryl.west@raincitysoftware.com>
 * @created 2017-04-01 14:27:17
 */

const should = require('chai').should();
const https = require('https');
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const CoordinateLocator = require('../src/CoordinateLocator');

describe('CoordinateLocator', function() {
    'use strict';

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('CoordinateLocator');
        
        return opts;
    };
    
    // instance tests verify that all public signatures are correct
    describe('#instance', function() {
        const locator = new CoordinateLocator(createOptions());
        const methods = [
            'findCoordinates'
        ];

        it('should create an instance of CoordinateLocator', function() {
            should.exist( locator );
            locator.should.be.instanceof( CoordinateLocator );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( locator ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                locator[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('findCoordinates', function() {
        // TODO mock out the https component
        const locator = new CoordinateLocator(createOptions());

        it('should find coordinates for 535 Mission', function(done) {
            const street = '535 Mission St';
            locator.findCoordinates(street).then(loc => {
                loc.address.should.equal('535 Mission Street, San Francisco, CA 94105, USA');
                should.exist(loc.location);
                loc.lat.should.equal(37.788866);
                loc.lng.should.equal(-122.39821);
                should.not.exist(loc.list);

                done();
            }).catch(err => {
                should.not.exist(err);
            });
        });

        it('should find coordinates from a cached address');
    });

});

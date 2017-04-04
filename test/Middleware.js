/**
 * @class MiddlewareTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const Middleware = require('../src/Middleware');
// const ShopDao = require('../src/ShopDao');

describe('Middleware', function() {
    'use strict';

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('Middleware');
        opts.apikey = require('../package.json').apikey;

        return opts;
    };

    describe('#instance', function() {
        const middleware = new Middleware( createOptions() );
        const methods = [
            'checkAPIKey',
            'shutdown'
        ];

        it('should create an instance of Middleware', function() {
            should.exist( middleware );
            middleware.should.be.instanceof( Middleware );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( middleware ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                middleware[ method ].should.be.a( 'function' );
            });
        });
    });
});

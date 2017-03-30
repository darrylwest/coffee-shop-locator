/**
 * @class MiddlewareTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    Middleware = require('../lib/Middleware'),
    ShopDao = require('../lib/ShopDao');

describe('Middleware', function() {
    'use strict';

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('Middleware');

        return opts;
    };

    describe('#instance', function() {
        const middleware = new Middleware( createOptions() );
        const methods = [];

        it('should create an instance of Middleware', function() {
            should.exist( middleware );
            middleware.should.be.instanceof( Middleware );
        });

        it('should have all known methods by size and type', function() {
            dash.functions( middleware ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                middleware[ method ].should.be.a( 'function' );
            });
        });
    });
});

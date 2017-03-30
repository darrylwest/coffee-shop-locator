/**
 * @class RoutersTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const MockExpress = require('./MockExpress');
const Routers = require('../src/Routers');
const Handlers = require('../src/Handlers');
const ShopDao = require('../src/ShopDao');

describe('Routers', function() {
    'use strict';

    const dao = new ShopDao({log:MockLogger.createLogger('ShopDao')});
    const handlers = new Handlers({log:MockLogger.createLogger('Handlers'), dao:dao});

    const createOptions = function() {
        const opts = {};
        opts.log = MockLogger.createLogger('Routers');
        opts.handlers = handlers;

        return opts;
    };

    describe('#instance', function() {
        const routers = new Routers( createOptions() );
        const methods = [ 'assignRoutes' ];

        it('should create an instance of Routers', function() {
            should.exist( routers );
            routers.should.be.instanceof( Routers );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( routers ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                routers[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('assignRoutes', function() {
        const routers = new Routers( createOptions() );
        const app = new MockExpress();

        it('should assign a known set of routes', function() {
            app.routes.length.should.equal( 0 );

            routers.assignRoutes(app);

            app.routes.length.should.be.equal( 2 );
            app.routes.forEach(route => {
                // console.log(route);
                route.fn.should.be.a('function');
            });
        });
    });
});

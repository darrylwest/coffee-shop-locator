/**
 * @class BootStrapTests
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const should = require('chai').should();
const MockLogger = require('simple-node-logger').mocks.MockLogger;
const MockExpress = require('./MockExpress');
const SimpleLogger = require('simple-node-logger');
const BootStrap = require('../src/BootStrap');
const ShopDao = require('../src/ShopDao');
const CoordinateLocator = require('../src/CoordinateLocator');
const Handlers = require('../src/Handlers');
const Routers = require('../src/Routers');

describe('BootStrap', function() {
    'use strict';

    const createOptions = function() {
        const opts = {};
        opts.createLogger = MockLogger.createLogger;
        opts.log = MockLogger.createLogger('BootStrap');
        opts.app = new MockExpress();

        return opts;
    };

    describe('#instance', function() {
        const bootStrap = new BootStrap( createOptions() );
        const methods = [ 
            'configure',
            'createShopDao',
            'createCoordinateLocator',
            'createHandlers',
            'createRouters',
            'createLogManager'
        ];

        it('should create an instance of BootStrap', function() {
            should.exist( bootStrap );
            bootStrap.should.be.instanceof( BootStrap );
        });

        it('should have all known methods by size and type', function() {
            Object.keys( bootStrap ).length.should.equal( methods.length );
            methods.forEach(method => {
                // console.log(method);
                bootStrap[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('configure', function() {
        it('should create and configure all components', function() {
            const bootStrap = new BootStrap( createOptions() ).configure();

            should.exist( bootStrap );
            bootStrap.should.be.instanceof( BootStrap );
            bootStrap.createShopDao().should.be.instanceof( ShopDao );
            bootStrap.createCoordinateLocator().should.be.instanceof( CoordinateLocator );
            bootStrap.createHandlers().should.be.instanceof( Handlers );
            bootStrap.createRouters().should.be.instanceof( Routers );
        });
    });

    describe('createLogManager', function() {
        const bootStrap = new BootStrap( createOptions() );

        it('should create a standard application logger', function() {
            const manager = bootStrap.createLogManager();

            should.exist( manager );
            manager.should.be.instanceof( SimpleLogger );
        });
    });
});

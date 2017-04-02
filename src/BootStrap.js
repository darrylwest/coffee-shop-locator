/**
 * @class BootStrap - factory to configure and create dependend modules.  
 *                    this object is easily configured for test/mocks.
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

const ShopDao = require('./ShopDao');
const CoordinateLocator = require('./CoordinateLocator');
const Handlers = require('./Handlers');
const Routers = require('./Routers');
const SimpleLogger = require('simple-node-logger');

const BootStrap = function(options = {}) {
    const bootStrap = this;
    const app = options.app;

    // these could be defined in some other location, e.g., test factory
    let logManager = options.logManager;
    let log = options.log;
    let createLogger = options.createLogger;

    let routers = options.routers;
    let handlers = options.handlers;
    let coordinateLocator = options.coordinateLocator;
    let dao = options.dao;

    // configure the application
    this.configure = function() {
        if (!createLogger) {
            // create a category logger to enable tracing statements by module name
            logManager = bootStrap.createLogManager();
            createLogger = logManager.createLogger;
        }

        if (!log) {
            log = createLogger('BootStrap');
            log.info('configure application, version: ', options.version);
        }

        dao = bootStrap.createShopDao();
        coordinateLocator = bootStrap.createCoordinateLocator();
        handlers = bootStrap.createHandlers();
        routers = bootStrap.createRouters();

        // return reference to enable chaining
        return bootStrap;
    };

    this.createShopDao = function() {
        if (!dao) {
            log.info('create the shop dao');
            const opts = {
                log:createLogger("ShopDao")
            };

            dao = new ShopDao(opts);

            dao.initData();
        }
        return dao;
    };

    this.createCoordinateLocator = function() {
        if (!coordinateLocator) {
            log.info('create the coordinate locator');

            const opts = {
                log:createLogger('CoordinateLocator')
            };

            coordinateLocator = new CoordinateLocator(opts);
        }

        return coordinateLocator;
    };

    this.createHandlers = function() {
        if (!handlers) {
            log.info('create the Handlers');
            const opts = {
                log:createLogger("Handlers"),
                dao:bootStrap.createShopDao(),
                coordinateLocator:bootStrap.createCoordinateLocator()
            };

            handlers = new Handlers(opts);
        }

        return handlers;
    };

    this.createRouters = function() {
        if (!routers) {
            log.info('create the Routers');

            const opts = {
                log:createLogger('Routers'),
                handlers:bootStrap.createHandlers()
            };

            routers = new Routers(opts);
            routers.assignRoutes(app);
        }

        return routers;
    };

    this.createLogManager = function() {
        if (!logManager) {
            logManager = new SimpleLogger();

            const opts = {};
            if (options.logPath) {
                opts.logFilePath = `${options.logPath}/coffee-shop-api-${process.pid}.log`;
                logManager.createFileAppender(opts);
                console.log(`logging in ${opts.logFilePath}`);
            } else {
                logManager.createConsoleAppender();
            } 
        }

        return logManager;
    };

    // construction validation
    (function() {
        if (!app) {
            throw new Error('boot strap must be constructed with an express app object');
        }
    }());
};

module.exports = BootStrap;

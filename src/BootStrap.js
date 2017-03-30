/**
 * @class BootStrap
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const ShopDao = require('./ShopDao');
const Handlers = require('./Handlers');
const Routers = require('./Routers');
const SimpleLogger = require('simple-node-logger');

const BootStrap = function(options) {
    'use strict';

    const bootStrap = this,
        app = options.app;

    // these could be defined in some other location, e.g., test factory
    let logManager = options.logManager;
    let log = options.log;
    let createLogger = options.createLogger;

    let routers = options.routers;
    let handlers = options.handlers;
    let dao = options.dao;

    // configure the application
    this.configure = function() {
        if (!createLogger) {
            logManager = bootStrap.createLogManager();
            createLogger = logManager.createLogger;
        }

        if (!log) {
            log = createLogger('BootStrap');
            log.info('configure application, version: ', options.version);
        }

        if (!dao) {
            log.info('create the shop dao');
            let opts = {
                log:createLogger("ShopDao")
            };

            dao = new ShopDao(opts);

            // TODO : is this the right place for this? maybe create a start method...
            dao.initData();
        }

        if (!handlers) {
            log.info('create the Handlers');
            let opts = {
                log:createLogger("Handlers"),
                dao:dao
            };

            handlers = new Handlers(opts);
        }

        if (!routers) {
            log.info('create the Routers');
            let opts = {
                log:createLogger('Routers'),
                handlers:handlers
            };

            routers = new Routers(opts);
            routers.assignRoutes(app);
        }

        // return reference to enable chaining
        return bootStrap;
    };

    this.getShopDao = function() {
        return dao;
    };

    this.getHandlers = function() {
        return handlers;
    };

    this.getRouters = function() {
        return routers;
    };

    this.createLogManager = function() {
        if (!logManager) {
            logManager = new SimpleLogger();

            const opts = {};
            if (options.logPath) {
                opts.logFilePath = `${options.logPath}/shop-api-${process.pid}.log`;
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

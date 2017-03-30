/**
 * @class Routers
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */

const Routers = function(options) {
    'use strict';

    const routers = this,
        log = options.log,
        handlers = options.handlers;

    this.assignRoutes = function(app) {
        log.info('assign the routes to app...');

        // TODO : replace with a default page 
        log.info('define the top level route /');
        app.get('/', (req, res) => {
            res.send(`${options.name} | Version ${options.version} | ${options.description}`);
        });

        app.get('/shop/v0/item/:id', handlers.findItemById);
        app.get('/shop/v0/items/user/:id', handlers.queryByUserId);
        app.get('/shop/v0/items/all/:sort/:order', handlers.queryAll);
        app.get('/shop/v0/items/geo/:lat/:long', handlers.queryByGeo);
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('router must be constructed with a log object');
        }
        if (!handlers) {
            throw new Error('router must be constructed with a handlers object');
        }
    }());
};

module.exports = Routers;

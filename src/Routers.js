/**
 * @class Routers
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

const bodyParser = require('body-parser');

const Routers = function(options = {}) {

    const routers = this;
    const log = options.log;
    const handlers = options.handlers;
    const config = options.config || require('../package.json');
    const route = options.route || '/coffeeshop';

    this.assignRoutes = function(app) {
        log.info('assign the routes to app...');

        app.use(bodyParser.json());

        log.info('define the top level route /');
        app.get('/', (req, res) => {
            // TODO : replace with a default page 
            res.send(`<html><head><title>shop locator</title></head><body><h3>${config.name} | Version ${config.version}</h3><hr/><h4>${config.description}</h4></body></html>\n`);
        });

        app.get(`${route}/status`, handlers.getStatus);

        app.get(`${route}/:id`, handlers.findShopById);
        app.post(`${route}`, handlers.insertShop);
        app.put(`${route}/:id`, handlers.updateShop);
        app.del(`${route}/:id`, handlers.deleteShop);

        app.get(`/locate/nearest`, handlers.findNearestShop);
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

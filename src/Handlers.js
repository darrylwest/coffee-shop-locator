/**
 * @class Handlers - connect API requests to data access; query data and return the payload or error
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

// payload wrapper constants
const OK = 'ok';
const FAILED = 'failed';

const ShopModel = require('./ShopModel');

const Handlers = function(options = {}) {
    const handlers = this;
    const log = options.log;
    const dao = options.dao;
    const coordinateLocator = options.coordinateLocator;

    /**
     * locate the coffee shop with it's id
     */
    this.findShopById = function(request, response) {
        const id = request.params.id || request.query.id;
        log.info('find shop by id: ', id);

        dao.findById(id).then(shop => {
            const payload = handlers.createPayload(OK, shop);
            log.info('returning payload: ', payload);
            return response.send(payload);
        }).catch(err => {
            log.warn( err.message );
            return response.sendStatus(404);
        });
    };

    /**
     * insert a new coffee shop and return the shop's id; return error (40x) if shop could not be inserted
     */
    this.insertShop = function(request, response) {
        log.info('insert a new coffee shop: ', request.body);

        let model = request.body;
        if (typeof model === 'string') {
            model = JSON.parse(model);
            log.info('parsed string model to: ', model);
        }
        if (model.id) {
            log.error('cannot insert an existing model, id: ', model.id);
            return response.sendStatus(403);
        }

        const newShop = new ShopModel(model);

        dao.update(newShop).then(shop => {
            const payload = handlers.createPayload(OK, shop);
            log.info('inserted new shop: ', shop);
            return response.send(payload);
        }).catch(err => {
            log.info('insert error: ', err.message);
            return response.sendStatus(403);
        });
    };

    /**
     * update an existing coffee shop and return the shop's id; return error (40x) if shop could not be updated
     */
    this.updateShop = function(request, response) {
        const id = request.params.id;
        log.info('find and update an existing shop: ', id);

        const errorHandler = function(err) {
            log.error('update error: ', err.message);
            return response.sendStatus(404);
        };

        dao.findById(id).then(shop => {
            // now get the update model
            let model = request.body;
            if (typeof model === 'string') {
                model = JSON.parse(model);
            }

            model.id = shop.id;
            model.dateCreated = shop.dateCreated;

            // check to see that the version is the same or older...
            model.version = shop.verion;

            dao.update(model).then(um => {
                const payload = handlers.createPayload(OK, um);
                log.info('updated model: ', um);
                return response.send(payload);
            }).catch(errorHandler);
        }).catch(errorHandler);
    };

    /**
     * find and delete the coffee shop for the given id; return error (40x) if the shop could not be deleted
     */
    this.deleteShop = function(request, response) {
        const id = request.params.id || request.query.id;
        log.info('delete shop with id: ', id);

        const errorHandler = function(err) {
            log.error('delete error: ', err.message);
            return response.sendStatus(404);
        };

        dao.findById(id).then(shop => {
            dao.delete(shop).then(model => {
                // per spec, just return the id, not the entire model...
                const payload = handlers.createPayload(OK, {id:id});
                log.info('return delete payload: ', payload);
                return response.send(payload);
            }).catch(errorHandler);
        }).catch(errorHandler);
    };

    /**
     * find a list of shops ordered by the closest
     */
    this.findNearestShop = function(request, response) {
        const address = request.params.address || request.query.address;
        log.info(`find nearest coffee shop to address: ${address}`);

        const errorHandler = function(err) {
            log.error('find nearest shop error: ', err.message);
            return response.sendStatus(404);
        };

        coordinateLocator.findCoordinates(address).then(coords => {
            const lat = coords.location.lat;
            const lng = coords.location.lng;

            log.info(`found coords for ${address} ${lat}, ${lng}`);
            log.info('clean address: ', coords.address);

            dao.findNearest(lat, lng).then(result => {
                const payload = handlers.createPayload(OK, result);

                response.send(payload);
            }).catch(errorHandler);
        }).catch(errorHandler);
    };

    this.getStatus = function(request, response) {
        const status = {
            dbsize: dao.getCount()
        };

        const payload = handlers.createPayload(OK, status);
        return response.send(payload);
    };

    /**
     * create a wrapper with status, timestamp, response version and the results
     */
    this.createPayload = function(status, obj) {
        const wrapper = {
            status:status,
            ts:Date.now(),
            version:'1.0',
            data:obj
        };

        return wrapper;
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('handlers must be constructed with a log object');
        }
        if (!dao) {
            throw new Error('handlers must be constructed with a shop dao object');
        }
        if (!coordinateLocator) {
            throw new Error('handlers must be constructed with a coordinate locator');
        }
    }());
};

module.exports = Handlers;

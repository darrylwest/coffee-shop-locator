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

const Handlers = function(options = {}) {
    const handlers = this;
    const log = options.log;
    const dao = options.dao;

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
        log.info('insert a new coffee shop: ', request.query);
    };

    /**
     * update an existing coffee shop and return the shop's id; return error (40x) if shop could not be updated
     */
    this.updateShop = function(request, response) {
        const id = request.params.id || request.query.id;
        log.info('update an existing shop: ', id);
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
                const payload = handlers.createPayload(OK, {id:id});
                log.info('return delete payload: ', payload);
                return response.send(payload);
            }).catch(err => errorHandler);
        }).catch(err => errorHandler);
    };

    /**
     * find a list of shops ordered by the closest
     */
    this.findNearestShop = function(request, response) {
        const lat = request.params.lat || request.query.lat;
        const long = request.params.long || request.query.long;
        const loc = [ lat, long ];
        log.info(`query by gio ${lat}/${long}`);
        
        dao.queryByGeo(loc).then(list => {
            const payload = handlers.createPayload(list);
            log.info(`return rows, count: ${list.length} for geo ${lat}/${long}`);
            response.send(payload);
        }).catch(err => {
            log.error(err);
            response.sendStatus(500);
        });
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
    }());
};

module.exports = Handlers;

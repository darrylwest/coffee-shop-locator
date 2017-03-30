/**
 * @class Handlers - connect API requests to data access
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const dash = require('lodash');

const Handlers = function(options) {
    'use strict';

    const handlers = this,
        log = options.log,
        dao = options.dao;

    this.queryByUserId = function(request, response) {
        const id = request.params.id || request.query.id;
        log.info(`query by user id=${id}`);
        dao.queryByUserId(id).then(list => {
            const payload = handlers.createPayload(list);
            log.info(`return items for user ${id}, item count: ${list.length}`);
            response.send(payload);
        }).catch(err => {
            log.error( err );
            // must be a machine error at this point...
            response.sendStatus(500);
        });
    };

    this.queryAll = function(request, response) {
        const sort = request.params.sort || request.query.sort;
        const order = request.params.order || request.query.order;
        log.info(`query all sorted by ${sort}`);
        let sortFn = dao.assignSortOrder(sort, order);

        dao.queryAll(sortFn).then(list => {
            const payload = handlers.createPayload(list);
            log.info(`return all rows, count: ${list.length}`);
            response.send(payload);
        }).catch(err => {
            log.error(err);
            response.sendStatus(500);
        });
    };

    this.queryByGeo = function(request, response) {
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

    this.findItemById = function(request, response) {
        const id = request.params.id || request.query.id;
        log.info('find shop item by id: ', id);
        dao.findById(id).then(item => {
            const payload = handlers.createPayload(item);
            log.info('returning payload: ', payload);
            response.send(payload);
        }).catch(err => {
            log.warn( err.message );
            response.sendStatus(404);
        });
    };

    this.createPayload = function(obj) {
        // TODO create a wrapper?  maybe for v1...
        return obj;
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

/**
 * @class ShopDao - 
 *    - Queries return a list of shop items; find returns a single model.
 *    - All methods return a promise (thenable)
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const dash = require('lodash');
const geolib = require('geolib');
const ItemModel = require('./ItemModel');

const ShopDao = function(options) {
    'use strict';

    const dao = this,
        log = options.log;

    let db = null;
    let idmap = new Map();
    let methodHash = new Map();

    // define the private sorters...
    function sortByCreatedAtAsc(a, b) {
        return a.createdAt.getTime() - b.createdAt.getTime();
    }

    function sortByCreatedAtDesc(a, b) {
        return b.createdAt.getTime() - a.createdAt.getTime();
    }

    function sortByPriceAsc(a, b) {
        return a.price - b.price;
    }

    function sortByPriceDesc(a, b) {
        return b.price - a.price;
    }

    this.assignSortOrder = function(sort, order) {
        log.info(`assign the appropriate sort and order for ${sort}/${order}`);

        let key = `${sort}/${order}`;
        let sortFn = methodHash.get(key);

        if (!sortFn) {
            log.warn('query all has no sort by or order, will use default...');
            if (sort === 'price') {
                sortFn = sortByPriceAsc;
            } else {
                sortFn = sortByCreatedAtAsc;
            }
        }

        log.info(`sort function assiged from ${key} => ${sortFn.name}`);

        return sortFn;
    };

    this.queryAll = function(sortFn) {
        if (typeof sortFn !== 'function') {
            log.warn('assigning default sort...');
            sortFn = dao.sortByCreatedAtAsc;
        }
        return new Promise((resolve, reject) => {
            // TODO replace with sorter...
            let list = db.sort(sortFn);

            if (list) {
                log.info(`query all, found ${list.length} items`);
                return resolve(list);
            } else {
                return reject(new Error(`bad query`));
            }
        });
    };

    this.findById = function(id) {
        return new Promise((resolve, reject) => {
            const item = idmap.get(id);
            if (item) {
                log.info('item found by id: ', item);
                return resolve(item);
            } else {
                const err = new Error(`model not found for id: ${id}`);
                log.warn(err.message);
                return reject(err);
            }
        });
    };

    // return a promise
    this.queryByUserId = function(id, sortFn) {
        return new Promise((resolve, reject) => {
            const list = db.filter(item => {
                return item.userId === id;
            });

            if (list) {
                log.info(`query by user id ${id}, found ${list.length} items`);
                return resolve(list);
            } else {
                return reject(new Error(`bad query for user id=${id}`));
            }
        });
    };

    this.queryByGeo = function(loc) {
        // hardcode 50 mile radius converted to km
        const maxkm = 50 * 1.609344;

        return new Promise((resolve, reject) => {
            const list = db.filter(item => {
                // determine distance from loc
                // return true if target is within 50 mi (80 kilos)...
                return dao.isDistanceWithin(maxkm, item.loc, loc);
            });

             if (list) {
                log.info(`query by geo ${loc}, found ${list.length} items`);
                return resolve(list);
            } else {
                return reject(new Error(`bad query for loc=${loc}`));
            }
        });
    };

    // return true if the item is within the specified kilos of the target
    this.isDistanceWithin = function(kilos, target, itemloc) {
        const targetGeo = dao.locToGeo(target);
        const itemGeo = dao.locToGeo( itemloc );
        const distance = geolib.getDistance(targetGeo, itemGeo) / 1000;

        log.info(`target: ${JSON.stringify(targetGeo)} item: ${JSON.stringify(itemGeo)} distance: ${distance} max: ${kilos}`);

        return distance < kilos;
    };

    // takes a standard location [ lat, long ] and returns an object { latitude:n, longitude:m }
    this.locToGeo = function(loc) {
        const [ lat, long ] = loc;
        const geo = { latitude: lat, longitude: long };
        return geo;
    };

    this.initData = function() {
        if (!db) {
            let items = options.data || require('../database/data.json');
            db = items.map(item => {
                const model = new ItemModel( item );
                idmap.set(model.id, model);
                return model;
            });
        }

        return [ db, idmap ];
    };

    

    // construction validation
    (function() {
        if (!log) {
            throw new Error('shop dao must be constructed with a log object');
        }

        // load the method hash (this eliminates a big switch statement)
        methodHash.set('created/asc', sortByCreatedAtAsc);
        methodHash.set('created/desc', sortByCreatedAtDesc);
        methodHash.set('price/asc', sortByPriceAsc);
        methodHash.set('price/desc', sortByPriceDesc);
    }());
};

module.exports = ShopDao;


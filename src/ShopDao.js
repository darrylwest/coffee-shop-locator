/**
 * @class ShopDao - 
 *    - Queries return a list of shop items; find returns a single model.
 *    - All methods return a promise (thenable)
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const geolib = require('geolib');
const ShopModel = require('./ShopModel');

const ShopDao = function(options) {
    'use strict';

    const dao = this,
        log = options.log;

    let db = null;
    let idmap = new Map();
    let methodHash = new Map();

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
            // read in and parse csv file 
            // datafn = '../database/locations.csv';
            let items = [];
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
    }());
};

module.exports = ShopDao;


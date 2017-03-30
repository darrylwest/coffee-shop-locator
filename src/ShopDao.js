/**
 * @class ShopDao - 
 *    - Find coffee shop; find returns a single model.
 *    - All methods return a promise (thenable)
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

const geolib = require('geolib');
const ShopModel = require('./ShopModel');
const fs = require('fs');

const ShopDao = function(options = {}) {

    const dao = this;
    const log = options.log;
    const datafile = options.datafile || './database/locations.csv';

    let db = null;
    let idmap = new Map(); // shop index by id

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

    // takes a standard location [ lat, long ] and returns an object { latitude:n, longitude:m }
    this.locToGeo = function(loc) {
        const [ lat, long ] = loc;
        const geo = { latitude: lat, longitude: long };
        return geo;
    };

    this.initData = function() {
        if (!db) {
            const shops = dao.parseCSVFile(datafile);

            db = shops.map(shop => {
                const model = new ShopModel( shop );
                idmap.set(model.id, model);
                return model;
            });
        }

        return [ db, idmap ];
    };

    // read and parse the data file ; return a list of shop models
    this.parseCSVFile = function(file) {
        log.info('read the database file: ', file);

        let shops = [];
        const buf = fs.readFileSync(file);
        if (!buf) {
            throw new Error(`cannot locate database file ${file}`);
        }

        const lines = buf.toString().split('\n');
        shops = lines.map(line => {
            const columns = line.split(',');
            if (columns.length !== 5) {
                throw new Error(`malformed location data: ${line}`);
            }

            const params = {};
            [ 'id', 'name', 'address', 'lat', 'lng' ].forEach((key, i) => {
                params[key] = columns[i].trim();
            });
            const model = new ShopModel(params);
            // console.log(model);
            return model;
        });

        return shops;
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('shop dao must be constructed with a log object');
        }
    }());
};

module.exports = ShopDao;


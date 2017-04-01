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
    let nextId = 0;

    // find the coffee shop by id
    this.findById = function(id) {
        return new Promise((resolve, reject) => {
            const item = idmap.get(id);
            if (item && item.status !== 'deleted') {
                log.info('item found by id: ', item);
                return resolve(item);
            } else {
                const err = new Error(`model not found for id: ${id}`);
                log.warn(err.message);
                return reject(err);
            }
        });
    };

    // validate the model and return any detected errors
    this.validate = function(shop) {
        let errors = [];

        if (!shop.name || typeof(shop.name) !== 'string') {
            errors.push('Coffee Shop name is not valid');
        }

        if (!shop.address || typeof(shop.address) !== 'string') {
            errors.push('address is not valid');
        }

        if (!shop.lat || shop.lat === 0) {
            errors.push('latitude is invalid');
        }

        if (!shop.lng || shop.lng === 0) {
            errors.push('longitude is invalid');
        }

        return errors;
    };

    // update/insert the shop
    this.update = function(model) {
        // prepare the shop model for insert or update

        return new Promise((resolve, reject) => {
            const errors = dao.validate(model);
            if (errors.length > 0) {
                const err = new Error(errors.join(';'));
                log.warn('shop model is not valid: ', err.message);

                return reject(err);
            }

            const shop = dao.prepareForUpdate(model);
            log.info('update the shop: ', shop);

            idmap.set(model.id, shop);
            return resolve(shop);
        });
    };

    // prepare the coffee shop model for insert/update by assigning id, date created/updated and version
    this.prepareForUpdate = function(model) {
        log.info('prepare shop for update: ', model);

        // clone a copy
        const shop = new ShopModel(model);

        if (!shop.id) {
            shop.id = dao.createNextId();
            log.info('new shop id:', shop.id);
        } else {
            shop.version += 1;
            log.info('update to new version: ', shop.version);
        }

        if (!shop.dateCreated) {
            shop.dateCreated = new Date();
        }

        shop.lastUpdated = new Date();

        return shop;
    };

    // return the number of active shops in the database
    this.getCount = function() {
        let count = 0;
        idmap.forEach((value, key) => {
            if (value.status === 'active') {
                count++;
            }
        });

        return count;
    };

    this.queryByGeo = function(loc) {
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

    // initialize coffee shops from database
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

        let maxid = 0;
        const lines = buf.toString().split('\n');
        shops = lines.map(line => {
            const columns = line.split(',');
            if (columns.length !== 5) {
                throw new Error(`malformed location data: ${line}`);
            }

            const params = {};
            [ 'id', 'name', 'address', 'lat', 'lng' ].forEach((key, i) => {
                if (key === 'id') {
                    const id = parseInt(columns[i]);
                    if (id > nextId) {
                        nextId = id + 1;
                    }

                    params.id = id;
                    params.dateCreated = params.lastUpdated = new Date();
                    params.version = 0;
                    log.info('create the new model with id: ', params.id);
                } else {
                    params[key] = columns[i].trim();
                }
            });

            const model = new ShopModel(params);
            log.info(model);

            return model;
        });

        return shops;
    };

    // return the next id
    this.createNextId = function() {
        nextId++;
        return nextId;
    };

    // construction validation
    (function() {
        if (!log) {
            throw new Error('shop dao must be constructed with a log object');
        }
    }());
};

module.exports = ShopDao;


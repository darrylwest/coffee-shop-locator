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

    let idmap = new Map(); // shop index by id
    let nextId = 0;

    // find the coffee shop by id
    this.findById = function(id) {
        return new Promise((resolve, reject) => {
            const item = idmap.get(id);
            if (item && item.status !== ShopModel.DELETED) {
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

    // delete the model by changing status to 'deleted'...
    this.delete = function(model) {
        log.info('find and delete this model: ', model.id, ', status: ', model.status);

        return new Promise((resolve, reject) => {
            let shop = idmap.get(model.id);
            if (!shop || shop.status === ShopModel.DELETED) {
                const err = new Error(`cannot delete this model: ${model.id}`);
                log.error(err.message);
                return reject(err);
            }

            // create a copy
            shop = new ShopModel(shop);
            shop.status = ShopModel.DELETED;
            shop.version++;
            shop.lastUpdated = new Date();

            idmap.set(shop.id, shop);
            log.info('shop deleted: ', JSON.stringify(shop));

            return resolve(shop);
        });
    };

    // return the number of active shops in the database
    this.getCount = function() {
        let count = 0;
        idmap.forEach((value, key) => {
            if (value.status === ShopModel.ACTIVE) {
                count++;
            }
        });

        log.info('current count of active shops: ', count);

        return count;
    };

    // find the nearest shop to the specified locaion lat/lng
    this.findNearest = function(lat, lng) {
        log.info(`find nearest shop to lat/lng ${lat}/${lng}`);
        const target = { 
            latitude: lat,
            longitude: lng
        };

        let nearest = null;

        return new Promise((resolve, reject) => {
            idmap.forEach((shop, key) => {
                if (shop.status !== ShopModel.ACTIVE) {
                    log.debug('skip ', shop.id);
                    return;
                }

                const geo = {
                    latitude: shop.lat,
                    longitude: shop.lng
                };

                const distance = geolib.getDistance(target, geo) / 1000;
                log.info(`from ${JSON.stringify(target)} to ${JSON.stringify(geo)} = ${distance} ${shop.id} ${shop.name}`);

                if (nearest && distance < nearest.distance) {
                    nearest.distance = distance;
                    nearest.shop = shop;
                    log.info(`new nearest distance: ${distance} id: ${shop.id} ${shop.name} ${shop.address}`);
                } else if (!nearest) {
                    nearest = {
                        distance:distance,
                        shop:shop
                    };
                }

            });
            
            if (nearest) {
                log.info(`return the nearest, id: ${nearest.shop.id}, distance: ${nearest.distance}`);
                return resolve(nearest.shop);
            } else {
                return reject(new Error(`bad query for lat/lng=${lat}/${lng}`));
            }
        });
    };

    // initialize coffee shops from database
    this.initData = function() {
        const shops = dao.parseCSVFile(datafile);

        const db = shops.map(shop => {
            const model = new ShopModel( shop );
            idmap.set(model.id, model);
            return model;
        });

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


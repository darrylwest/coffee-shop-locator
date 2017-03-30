/**
 * @class ItemModel - item wrapper for JSON items
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';
const dash = require('lodash');

const convertMongoId = function(id) {
    if (id && id.$oid) {
        return id.$oid;
    }
};

const convertMongoDate = function(dt) {
    if (dt && dt.$date) {
        return new Date(dt.$date);
    }
};

const ItemModel = function(params) {
    // accommodate mongo id signatures
    this.id = params.id || convertMongoId(params._id);
    this.createdAt = convertMongoDate(params.createdAt);
    this.userId = convertMongoId(params.userId);
    this.loc = params.loc || []; // lat/long
    this.description = params.description || '';
    this.price = dash.isNumber(params.price) ? params.price : 0.0;
    this.status = params.status || 'unknown';
    
};



module.exports = ItemModel;

/**
 * @class ShopModel - coffee shop wrapper for JSON payloads
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

const ShopModel = function(params = {}) {
    // coerce to int if id exists
    this.id = params.id ? parseInt(params.id) : params.id;

    this.dateCreated = params.dateCreated;
    this.lastUpdated = params.lastUpdated;
    this.version = params.version || 0;

    this.name = params.name;
    this.address = params.address;
    this.lat = Number.parseFloat(params.lat);
    this.lng = Number.parseFloat(params.lng);

    this.status = params.status || ShopModel.ACTIVE;

    if (Number.isNaN(this.lat) || Number.isNaN(this.lng)) {
        this.status = ShopModel.INVALID;
    }
};

ShopModel.ACTIVE = 'active';
ShopModel.DELETED = 'deleted';
ShopModel.INVALID = 'invalid';

module.exports = ShopModel;


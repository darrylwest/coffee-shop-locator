/**
 * @class ShopModel - coffee shop wrapper for JSON payloads
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
'use strict';

const ShopModel = function(params = {}) {
    this.id = params.id;
    this.dateCreated = params.dateCreated;
    this.lastUpdated = params.lastUpdated;
    this.version = params.version;

    this.status = params.status || 'new';
};

module.exports = ShopModel;


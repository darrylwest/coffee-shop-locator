/**
 * @class TestGeoData - geo references for predictable search results
 *
 * @author darryl.west@raincitysoftware.com
 * @created 2017-04-01
 */
const geolib = require('geolib');

const TestGeoData = function() {
    'use strict';
    const data = this;

    this.berkeley = function() {
        return { loc:[ 37.8716, -122.2727 ], hits: 44 };
    };

    this.sanfrancisco = function() {
        return { loc:[ 37.7749, -122.4194 ], hits: 48 };
    };

    this.oakland = function() {
        return { loc:[ 37.8044, -122.2711 ], hits: 53 };
    };

    this.sanjose = function() {
        return { loc: [ 37.3382, -121.8863 ], hits: 53 };
    };

    this.lasvegas = function() {
        return { loc:[ 36.1699, -115.1398 ], hits: 19 };
    };

    this.cancun = function() {
        return { loc: [ 21.1213285, -86.9194803 ], hits: 7 };
    };

    this.newyork = function() {
        return { loc: [ 40.7128, -74.0059 ], hits: 0 };
    };
};

module.exports = TestGeoData;

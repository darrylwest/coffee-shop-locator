/**
 * @MockExpress
 *
 * @author: darryl.west@roundpeg.com
 * @created 2017-04-01
 */
'use strict';
const httpMocks = require('express-mocks-http' );

/* jshint -W071 */
const MockExpress = function(options = {}) {

    const mock = this;
    const route = options.route || '/coffeeshop';

    this.port = -1;
    this.routes = [];
    this.uses = [];
    this.enables = [];
    this.disables = [];


    this.get = function(path, fn) {
        mock.routes.push( { method:'get', path:path, fn:fn });
    };

    this.post = function(path, fn) {
        mock.routes.push( { method:'post', path:path, fn:fn });
    };

    this.put = function(path, fn) {
        mock.routes.push( { method:'put', path:path, fn:fn });
    };

    this.del = function(path, fn) {
        mock.routes.push({ method:'del', path:path, fn:fn });
    };

    this.enable = function(value) {
        mock.enables.push( value );
    };

    this.disable = function(value) {
        mock.disables.push( value );
    };

    this.use = function(obj) {
        mock.uses.push( obj );
    };

    this.listen = function(port) {
        mock.port = port;
    };

    this.createGetRequest = function(id) {
        const obj = {
            method:'GET',
            params:{ id: id },
            url: `${route}/${id}`
        };
        
        return mock.createRequest(obj);
    };

    this.createPostRequest = function(model) {
        const obj = {
            method:'POST',
            url: `${route}`,
            body: JSON.stringify(model)
        };

        return mock.createRequest(obj);
    };

    this.createPutRequest = function(model) {
        const obj = {
            method:'PUT',
            params:{ id: model.id },
            url: `${route}/${model.id}`,
            body: JSON.stringify(model)
        };

        return mock.createRequest(obj);
    };

    this.createDeleteRequest = function(id) {
        const obj = {
            method:'DELETE',
            params: { id: id },
            url: `${route}/${id}`
        };
        
        return mock.createRequest(obj);
    };

    this.createRequest = function(obj) {
        if (!obj.method) {
            obj.method = 'GET';
        }

        var request = httpMocks.createExpressRequest( obj );
        request.ip = '127.0.0.1';

        return request;
    };

    /**
     * create a response that will trigger a callback after 'end' to enable asynchronous tests
     *
     * @param callback - the testing callback, invoked after 'end'
     * @returns the mock response object
     */
    this.createResponse = function(callback) {
        const response = httpMocks.createExpressResponse();

        // TODO override send and json to set the statusCode
        response.sendStatus = function(status) {
            console.log('error status: ', status);
        };

        if (typeof callback === 'function') {
            response.callEnd = response.end;
            response.end = function(data, encoding) {
                response.callEnd(data, encoding);

                callback.call();
            };
        }

        return response;
    };

};
/* jshint +W071 */

module.exports = MockExpress;

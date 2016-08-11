/*
 * Copyright (C) 2016 Conjur Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


"use strict";

var g = require('../global'),
    authn = require('./authn');

module.exports = {
    connect: function (url, token) {
        return {
            secret: function (resourceId) {
                resourceId = g.parseId(resourceId);
                return {
                    /**
                     * Fetch the value of a secret.
                     *
                     * Options, which are all optional:
                     *
                     * * version: secret version number to fetch; default is the latest version.
                     */
                    fetch: function (version, callback) {
                        if ( callback === undefined ) {
                            callback = version;
                            version = null;
                        }

                        var path = g.format(url + '/secrets/%s/%s/%s', resourceId.account, g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
                        if ( version ) {
                            path = g.format("%s?version=%s", path, version)
                        }
                        g.getURL(path, g.authorizationHeader(token), function (err, value) {
                            if (err){
                                return callback(err);
                            }
                            return callback(null, value);
                        });
                    },

                    /**
                     * Add a new secret value.
                     */
                    update: function (value, callback) {
                        var path = g.format(url + '/secrets/%s/%s/%s', resourceId.account, g.escape(resourceId.kind), g.pathEscape(resourceId.identifier));
                        g.rest.post(path, g.u.extend(g.authorizationHeader(token), {data: value})).once('complete', function(body, response){
                            if(body instanceof Error){
                                callback(body);
                            } else if (response.statusCode >= 400 ) {
                                callback(new Error('Request error: ' + response.statusCode));
                            } else{
                                callback(null);
                            }
                        });
                    }
                }
            }
        
        }
    }
};


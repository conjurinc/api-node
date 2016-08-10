/*
 * Copyright (C) 2013 Conjur Inc
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

var authn = require('./conjur/authn'),
    authz = require('./conjur/authz'),
    pubkeys = require('./conjur/pubkeys')
    ;

module.exports = {
    authn: authn,
    authz: authz,
    pubkeys: pubkeys,
    global: require('./global'),
    connect: function(url, account, login, apiKey, cb) {
        authn.connect(url).authenticate(account, login, apiKey, function(err, initialToken) {
            if ( err ) return cb(err);

            var token = initialToken;

            function refreshToken() {
                authn.connect(url).authenticate(account, login, apiKey, function(err, newToken) {
                    if ( err ) {
                        // If authentication fails, try every 30 seconds to refresh the token
                        return scheduleRefreshToken(30);
                    }

                    token = newToken;
                    // Start trying to refresh the token again in 5 minutes
                    scheduleRefreshToken(5 * 60);
                });
            }

            function scheduleRefreshToken(seconds) {
                setTimeout(refreshToken, seconds * 1000).unref();
            }

            // Start trying to refresh the token in 5 minutes
            scheduleRefreshToken(5 * 60);

            cb(null, {
                resources: function(account, options, cb) {
                    return authz.connect(url, token).resources(account, options, cb);
                },
                resource: function(resourceId) {
                    return authz.connect(url, token).resource(resourceId);
                },
                role: function(roleId) {
                    return authz.connect(url, token).role(roleId);
                }
            })
        });
    }
};

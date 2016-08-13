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

module.exports = {
    u: require('underscore'),
    assert: require('assert'),
    util: require('util'),
    async: require('async'),
    rest: require('restler'),
    https: require('https'),
    format: require('util').format,
    inspect: require('util').inspect,
    escape: encodeURIComponent,
    info: require('winston').info,
    debug: require('winston').debug,
    parseId: function (id) {
        var tokens;

        if (id instanceof Array) {
            tokens = id;
        } else {
            tokens = id.split(':');
        }

        return {
            account: tokens[0],
            kind: tokens[1],
            identifier: tokens.slice(2, tokens.length).join(':')
        };
    },
    flattenId: function (id) {
        if (id instanceof Array) {
            return id.join(":");
        }
        return id;
    },
    pathEscape: function (str) {
        return encodeURIComponent(str);
    },
    username: function (token) {
        if (typeof(token.data) !== "string") {
            require('winston').warn("Expecting string in token[data]");
        }
        return token.data;
    },
    currentRole: function (account, token) {
        var username = module.exports.username(token),
            match = username.match(/([^\/]*)\/(.*)/);
        if (match) {
            return [account, match[1], match[2]].join(':');
        }
        return [account, 'user', username].join(':');
    },
    authorizationHeader: function (token) {
        return {headers: {'Authorization': require('./conjur/authn').tokenHeader(token)}};
    },
    getURL: function (url, options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        }
        var log = require('winston');
        log.debug("GET: "  + url);
        require('restler').get(url, options).once('complete', function (result, response) {
            if (result instanceof Error) {
                return callback(result);
            }

            if (response.statusCode !== 200){
              return callback({
                    code: response.statusCode,
                    message: require('util').format("HTTP status code %s fetching %s", response.statusCode, require('util').inspect(url))
              });
            }

            callback(null, result);
        });
    },
    arrayParam: function (name, array) {
        var parts = [];
        array.forEach(function (value) {
            parts.push(encodeURIComponent(name) + "[]=" + encodeURIComponent(value));
        });
        return parts.join('&');
    }
};

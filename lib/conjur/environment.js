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

var g = require('../global'),
    directory = require('./directory')
    ;

module.exports = {
    connect: function (endpoints) {
        var Environment = function (account, name, token) {
            this.account = account;
            this.name = name;
            this.token = token;
        };

        /**
         * Fetch an environment value.
         */
        Environment.prototype.value = function (key, version, callback) {
            if (!callback) {
                callback = version;
                version = null;
            }

            g.async.waterfall([
                function (cb) {
                    var path = g.format('%s/environments/%s', endpoints.directory(this.account), g.pathEscape(this.name));
                    g.getURL(path, g.authorizationHeader(this.token), function (err, result) {
                        if (err) {
                            return cb(err);
                        }

                        var variableid = result.variables[key];
                        if (!variableid) {
                            return cb({
                                code: 404,
                                message: g.format("Variable %s not found on environment %s", key, this.name)
                            });
                        }

                        cb(null, variableid);
                    }.bind(this));
                }.bind(this),
                function (variableid, cb) {
                    var path = g.format('%s/variables/%s/value', endpoints.directory(this.account), g.pathEscape(variableid));
                    if (version) {
                        path += g.format("?version=%s", encodeURIComponent(version));
                    }
                    g.getURL(path, g.authorizationHeader(this.token), cb);
                }.bind(this)
            ], callback);
        };

        return {
            environment: function (account, name, token) {
                return new Environment(account, name, token);
            }
        };
    }
};

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
    authn = require('./authn'),
    authz = require('./authz')
;

module.exports = {
    connect: function (endpoints) {
        var Host = function (account, hostname, token) {
            this.account = account;
            this.hostname = hostname;
            this.token = token;
            // don't complain about underscores here.
            /*jslint nomen:true*/
            this.__defineGetter__("currentRole", function () {
                return g.currentRole(this.account, this.token);
            });
        };

        /**
         * Check if the host is visible to the current user.
         */
        Host.prototype.visibleTo = function (callback) {
            // Shortcut if the bound user is this host
            if (this.currentRole === g.format('%s:%s:%s', this.account, 'host', this.hostname)) {
                callback(null, true);
            }
            else {
                this.rolesWithAccessTo(function (err, result) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, g.u.keys(result).indexOf(this.currentRole) !== -1);
                }.bind(this));
            }
        };
            /*
             * Ensure that the authenticated user is either the host itself, or has
             * some permission to the host.
             */
            Host.prototype.verifyVisibleTo = function (callback) {
                this.visibleTo(function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else if (!result) {
                        callback(g.format("Host %s is not visible to %s", this.hostname, this.token.data));
                    }
                    else {
                        callback(null);
                    }
                }.bind(this));
            };

        /**
         * Gets a mapping from roles to permission lists. Each permission list is 'execute', 'update', or both.
         */
        Host.prototype.rolesWithAccessTo = function (callback) {
            var result = {};

            g.async.map(['execute', 'update'],
                function (permission, cb) {
                    authz.connect(endpoints.authz(this.account), this.token).resource([this.account, 'host', this.hostname]).allowedTo(permission, function (err, roles) {
                        if (err) {
                            return cb(err);
                        }

                        roles.forEach(function (role) {
                            if (!result[role]) {
                                result[role] = [];
                            }
                            result[role].push(permission);
                        });

                        cb(null);
                    });
                }.bind(this),
                function (err) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, result);
                });
        };

        return {
            host: function (account, hostname, token) {
                return new Host(account, hostname, token);
            }
        };
    }
};

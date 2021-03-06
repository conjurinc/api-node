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

var g = require('../global');

var nextUid = (function(){
    var next = 0;
    return function(){
        var id = next;
        next ++;
        return id.toString();
    }
})();

module.exports = {
    connect: function (url) {
        return {
            casLogin: function (ticket, callback) {
                var path = g.format(url + '/users/login?ticket=%s', ticket);
                g.getURL(path, callback);
            },

            authenticate: function (username, apiKey, callback) {
                var path = g.format(url + '/users/%s/authenticate', g.escape(username));
                g.info(g.format("POST %s", path));

                g.rest.post(path, {data: apiKey}).once('complete', function(body, response){
                    // Keep the events from firing multiple times
                    this.removeAllListeners('complete');
                    if(body instanceof Error){
                        callback(body);
                    }else if(response.statusCode != 200){
                        callback(new Error('Authentication failed: ' + response.statusCode));
                    }else{
                        callback(null, body);
                    }
                });


            }
        };
    },
    username: function (token) {
        return g.username(token);
    },
    tokenHeader: function (token) {
        return g.format('Token token="%s"', new Buffer(JSON.stringify(token)).toString('base64'));
    }
};

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

var g = require('../global'),
  authn = require('./authn')
  ;

module.exports = {
  connect: function(url, token) {
    return {
      uidnumbers: function(logins, callback) {
        if ( logins instanceof Array && logins.length === 0 )
          return callback(null, []);
        
        var ids = g.u.map(logins, function(login) {
          return g.format('id[]=%s', encodeURIComponent(login));
        }).join('&');
        var path = g.format(url + '/users/uidnumbers?%s', ids);
        g.getURL(path, g.authorizationHeader(token), callback);
      }
    }
  }
}

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

var g = require('../global')
  , authn = require('./authn')
  , dir = require('./directory')
  ;

function tokenizeRole(role) {
  return role instanceof Array ? role : role.split(':');
}

function selectRoleKind(roles, kind) {
  return g.u.filter(roles, function(role) {
    var tokens = tokenizeRole(role);
    return tokens[1] && tokens[1] === kind;
  })
}

function selectRoleId(roles) {
  return g.u.map(roles, function(role) {
    var tokens = tokenizeRole(role);
    return tokens.slice(2, tokens.length).join(':');
  })
}

module.exports = {
  selectRoleKind: selectRoleKind,
  selectRoleId: selectRoleId,
  connect: function(endpoints, token) {
    var User = function(account, username) {
      this.account = account;
      this.username = username;
    }

    /**
     * Authenticate the credentials using the authn service.
     */
    User.prototype.authenticate = function(password, callback) {
      authn.connect(endpoints.authn(this.account)).authenticate(this.username, password, callback);
    }

    return {
      users: function(account, token) {
        return {
          uidnumbers: function(logins, callback) {
            dir.connect(endpoints.directory(account), token).uidnumbers(logins, callback);
          }
        }
      },
      user: function(account, username) {
        return new User(account, username);
      }
    }
  }
}

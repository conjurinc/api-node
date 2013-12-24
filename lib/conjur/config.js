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
  url = require('url')
  ;

function addSlash(baseUrl) {
  if ( baseUrl && baseUrl[baseUrl.length-1] != '/' )
    baseUrl += '/';
  return baseUrl;
}

function applianceUrl() {
  var applianceUrl;
  if ( applianceUrl = module.exports.applianceUrl ) {
    return addSlash(applianceUrl);
  }
  else {
    return null;
  }
}

module.exports = {
  applianceUrl: null,
  authnUrl: function(env, stack, account) {
    if ( process.env.CONJUR_AUTHN_URL ) {
      return addSlash(process.env.CONJUR_AUTHN_URL);
    }
    else if ( applianceUrl() ) {
      return url.resolve(applianceUrl(), 'authn/')
    }
    else if ( env === 'test' || env === 'development' ) {
      return "http://localhost:5000"
    }
    else {
      return g.format("https://authn-%s-conjur.herokuapp.com", account);
    }
  },
  authzUrl: function(env, stack, account) {
    if ( process.env.CONJUR_AUTHZ_URL ) {
      return addSlash(process.env.CONJUR_AUTHZ_URL);
    }
    else if ( applianceUrl() ) {
      return url.resolve(applianceUrl(), 'authz/')
    }
    else if ( env === 'test' || env === 'development' ) {
      return "http://localhost:5100"
    }
    else {
      return g.format("https://authz-%s-conjur.herokuapp.com", stack);
    }
  },
  directoryUrl: function(env, stack, account) {
    if ( process.env.CONJUR_CORE_URL ) {
      return addSlash(process.env.CONJUR_CORE_URL);
    }
    else if ( applianceUrl() ) {
      return applianceUrl()
    }
    else if ( env === 'test' || env === 'development' ) {
      return "http://localhost:5200"
    }
    else {
      return g.format("https://core-%s-conjur.herokuapp.com", account);
    }
  },
  endpoints: function(env, stack) {
    return {
      authn: function(account) {
        return module.exports.authnUrl(env, stack, account);
      },
      authz: function(account) {
        return module.exports.authzUrl(env, stack, account);
      },
      directory: function(account) {
        return module.exports.directoryUrl(env, stack, account);
      }
    }
  }
}

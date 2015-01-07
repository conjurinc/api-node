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
  ;

function useLocalhost(env) {
  return env === 'test' || env === 'development' || env === 'appliance';
}

module.exports = {
  authnUrl: function(env, stack, account) {
    if ( useLocalhost(env) ) {
      return "http://localhost:5000"
    }
    else {
      return g.format("https://authn-%s-conjur.herokuapp.com", account);
    }
  },
  authzUrl: function(env, stack, account) {
    if ( useLocalhost(env) ) {
      return "http://localhost:5100"
    }
    else {
      return g.format("https://authz-%s-conjur.herokuapp.com", stack);
    }
  },
  directoryUrl: function(env, stack, account) {
    if ( useLocalhost(env) ) {
      return "http://localhost:5200"
    }
    else {
      return g.format("https://core-%s-conjur.herokuapp.com", account);
    }
  },
  auditUrl: function(env, stack, account) {
    if ( useLocalhost(env) ) {
      return "http://localhost:5300"
    }
    else {
      return g.format("https://audit-%s-conjur.herokuapp.com", stack);
    }
  },
  pubkeysUrl: function(env, stack, account) {
    if ( useLocalhost(env) ) {
      return "http://localhost:5400"
    }
    else {
      return g.format("https://pubkeys-%s-conjur.herokuapp.com", account);
    }
  },
  applianceEndpoints: function(applianceURL, account) {
  	function invalidURL(a) {
  		return g.format("Invalid account %s for appliance URL %s", a, applianceURL);
  	}
  	
    return {
      authn: function(a) {
      	if ( account === a )
      		return applianceURL + '/authn';
      	else
      		return invalidURL(a);
      },
      authz: function(a) {
      	if ( account === a )
        	return applianceURL + '/authz';
      	else
      		return invalidURL(a);
      },
      directory: function(a) {
      	if ( account === a )
        	return applianceURL;
      	else
      		return invalidURL(a);
      },
      pubkeys: function(a) {
      	if ( account === a )
        	return applianceURL + '/pubkeys';
      	else
      		return invalidURL(a);
      },
      audit: function(a) {
      	if ( account === a )
        	return applianceURL + '/audit';
      	else
      		return invalidURL(a);
      }
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
      },
      pubkeys: function(account) {
        return module.exports.pubkeysUrl(env, stack, account);
      },
      audit: function(account) {
        return module.exports.auditUrl(env, stack, account);
      }
    }
  }
}

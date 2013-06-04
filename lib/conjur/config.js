var g = require('../global')
  ;

module.exports = {
  authnUrl: function(env, stack, account) {
    if ( env === 'test' || env === 'development' ) {
      return "http://localhost:5000"
    }
    else {
      return g.format("https://authn-%s-conjur.herokuapp.com", account);
    }
  },
  authzUrl: function(env, stack, account) {
    if ( env === 'test' || env === 'development' ) {
      return "http://localhost:5100"
    }
    else {
      return g.format("https://authz-%s-conjur.herokuapp.com", stack);
    }
  },
  directoryUrl: function(env, stack, account) {
    if ( env === 'test' || env === 'development' ) {
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

module.exports = {
  u: require('underscore'),
  util: require('util'),
  async: require('async'),
  rest: require('restler'),
  https: require('https'),
  format: require('util').format,
  inspect: require('util').inspect,
  escape: encodeURIComponent,
  log: require('winston').info,
  pathEscape: function(str) {
    return encodeURIComponent(str);
  },
  username: function(token) {
    if ( typeof(token['data']) !== "string" ) {
      require('winston').warn("Expecting string in token[data]");
    }
    return token['data'];
  },
  currentRole: function(account, token) {
    var match;
    var username = module.exports.username(token);
    if ( match = username.match(/([^/]*)\/(.*)/) )
      return [ account, match[1], match[2] ].join(':');
    else
      return [ account, 'user', username ].join(':');
  },
  authorizationHeader: function(token) {
    return { headers: { 'Authorization': require('./conjur/authn').tokenHeader(token) } };
  },
  getURL: function(url, options, callback) {
    if ( !callback ) {
      callback = options;
      options = {};
    }
    require('winston').info(url);
    require('restler').get(url, options).on('complete', function(result, response) {
      if ( result instanceof Error ) return callback(result);
      if ( response.statusCode !== 200 ) return callback({code: response.statusCode, message: require('util').format("HTTP status code %s fetching %s", response.statusCode, require('util').inspect(url))});

      callback(null, result);
    });
  }
}

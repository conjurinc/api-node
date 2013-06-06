module.exports = {
  u: require('underscore'),
  util: require('util'),
  async: require('async'),
  rest: require('restler'),
  https: require('https'),
  format: require('util').format,
  escape: encodeURIComponent,
  log: require('winston').log,
  pathEscape: function(str) {
    return encodeURIComponent(str);
  },
  username: function(token) {
    if ( typeof(token['data']) !== "string" ) {
      console.log("Expecting string in token[data]");
    }
    return token['data'];
  },
  currentRole: function(account, token) {
    var match;
    var username = module.exports.username(token);
    if ( match = username.match(/(.*)\/(.*)/) )
      return [ account, match[1], match[2] ].join(':');
    else
      return [ account, 'user', username ].join(':');
  }
}

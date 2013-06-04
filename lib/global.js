module.exports = {
  u: require('underscore'),
  util: require('util'),
  async: require('async'),
  rest: require('restler'),
  format: require('util').format,
  escape: encodeURIComponent,
  log: require('winston').log,
  pathEscape: function(str) {
    return encodeURIComponent(str);
  },
  currentRole: function(account, token) {
    if ( typeof(token['data']) !== "string" ) {
      console.log("Expecting string in token[data]");
    }
    var match, username;
    var username = token['data'];
    if ( match = username.match(/(.*)\/(.*)/) )
      return [ account, match[1], match[2] ].join(':');
    else
      return [ account, 'user', username ].join(':');
  }
}

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

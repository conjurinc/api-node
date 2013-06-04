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
        console.log(g.format("GET %s", path));
        g.rest.get(path, { headers: { 'Authorization': authn.tokenHeader(token) } } )
          .on('complete', function(result, response) {
            if ( result instanceof Error)
              return callback(result);
            else if ( response.statusCode !== 200 )
              return callback(g.format("GET %s failed : %s", path, response.statusCode));
              
            callback(null, result);
          });
      }
    }
  }
}

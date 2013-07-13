var g = require('../global')

module.exports = {
  connect: function(url) {
    return {
      casLogin: function(ticket, callback) {
        var path = g.format(url + '/users/login?ticket=%s', ticket);
        g.getURL(path, callback);
      },
      authenticate: function(username, apiKey, callback) {
        var path = g.format(url + '/users/%s/authenticate', g.escape(username));
        g.info(g.format("POST %s", path));
        g.rest.post(path, { data: apiKey }).on('complete', function(token, response) {
          if ( token instanceof Error)
            return callback(token);
          else if ( response.statusCode !== 200 )
            return callback(g.format("POST %s failed : %s", path, response.statusCode));
          
          callback(null, token);
        })
      }    
    }
  },
  username: function(token) {
    return g.username(token);
  },
  tokenHeader: function(token) {
    return g.format('Token token="%s"', new Buffer(JSON.stringify(token)).toString('base64'))
  }
}

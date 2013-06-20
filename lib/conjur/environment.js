var g = require('../global'),
  directory = require('./directory')
  ;
  
module.exports = {
  connect: function(endpoints) {
    var Environment = function(account, name, token) {
      this.account = account;
      this.name = name;
      this.token = token;
    }
    
    /**
     * Fetch an environment value.
     */
    Environment.prototype.value = function(key, version, callback) {
      if ( !callback ) {
        callback = version;
        version = null;
      }

      g.async.waterfall([
        function (cb) {
          var path = g.format('%s/environments/%s', endpoints.directory(this.account), g.pathEscape(this.name));
          g.getURL(path, g.authorizationHeader(this.token), function(err, result) {
            if ( err ) return cb(err);

            var variableid = result['variables'][key];
            if ( !variableid)
              return cb({code: 404, message: g.format("Variable %s not found on environment %s", key, this.name) });
              
            cb(null, variableid);
          }.bind(this));
        }.bind(this),
        function(variableid, cb) {
          var path = g.format('%s/variables/%s/value', endpoints.directory(this.account), g.pathEscape(variableid));
          if ( version )
            path += g.format("?version=%s", encodeURIComponent(version));
          g.getURL(path, g.authorizationHeader(this.token), cb);
        }.bind(this)
      ], callback);
    }

    return {
      environment: function(account, name, token) {
        return new Environment(account, name, token);
      }
    }
  }
}
